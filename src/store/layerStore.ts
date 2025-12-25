import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Layer } from 'ol/layer'
import { layerRegistry } from '../layers/layerRegistry'
import { useMapStore } from './mapStore'

export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error'

interface LayerState {
  // Visibility state
  visible: Record<string, boolean>

  // Opacity state for WMS layers
  opacity: Record<string, number>

  // Loading state for lazy-loaded layers
  loadingState: Record<string, LoadingState>

  // Layer instances (OpenLayers VectorLayer)
  layers: Record<string, Layer>

  // Actions
  toggleLayer: (name: string) => void
  setLayerVisibility: (name: string, visible: boolean) => void
  setLayerOpacity: (name: string, opacity: number) => void
  registerLayer: (name: string, layer: Layer) => void
  unregisterLayer: (name: string) => void
  loadLayer: (name: string) => Promise<void>
}

export const useLayerStore = create<LayerState>()(
  immer((set, get) => ({
    // Initial visibility state - NL only
    visible: {
      // Base layers
      'CartoDB (licht)': true,
      'OpenStreetMap': false,
      'Luchtfoto (PDOK)': false,
      'TMK 1850': false,
      'Bonnebladen 1900': false,
      // Steentijd
      'Hunebedden': false,
      'FAMKE Steentijd': false,
      'Grafheuvels': false,
      'Terpen': false,
      // Archeologische lagen
      'AMK Monumenten': false,
      'Romeinse wegen': false,
      'Kastelen': false,
      'IKAW': false,
      'Archeo Landschappen': false,
      // Erfgoed & Monumenten
      'Rijksmonumenten': false,
      'Werelderfgoed': false,
      'WWII Bunkers': false,
      // Verdedigingswerken
      'Verdedigingslinies': false,
      'Inundatiegebieden': false,
      'Militaire Objecten': false,
      // Paleogeografische kaarten
      'Paleokaart 800 n.Chr.': false,
      'Paleokaart 100 n.Chr.': false,
      'Paleokaart 500 v.Chr.': false,
      'Paleokaart 1500 v.Chr.': false,
      'Paleokaart 2750 v.Chr.': false,
      'Paleokaart 5500 v.Chr.': false,
      'Paleokaart 9000 v.Chr.': false,
      // Religieus erfgoed
      'Religieus Erfgoed': false,
      // Uiterwaarden (UIKAV)
      'UIKAV Punten': false,
      'UIKAV Vlakken': false,
      'UIKAV Buffer': false,
      'UIKAV Expert': false,
      'UIKAV Indeling': false,
      // Hillshade NL
      'AHN4 Hillshade NL': false,
      'AHN4 Multi-Hillshade NL': false,
      'AHN4 Helling NL': false,
      'AHN 0.5m': false,
      'World Hillshade': false,
      // Terrein
      'Veengebieden': false,
      'Geomorfologie': false,
      'Bodemkaart': false,
      // Fossielen
      'Fossielen Nederland': false,
      'Fossielen België': false,
      'Fossielen Duitsland': false,
      'Fossielen Frankrijk': false,
      // Recreatie
      'Parken': false,
      'Speeltuinen': false,
      'Musea': false,
      'Strandjes': false
    },

    // Initial opacity state
    opacity: {
      'AHN 0.5m': 0.7,
      'Geomorfologie': 0.5,
      'Bodemkaart': 0.6,
      'IKAW': 0.5,
      'Archeo Landschappen': 0.5,
      'AHN4 Hillshade NL': 0.7,
      'AHN4 Multi-Hillshade NL': 0.7,
      'AHN4 Helling NL': 0.6,
      'World Hillshade': 0.7,
      'Terpen': 0.7,
      'Verdedigingslinies': 0.7,
      'Inundatiegebieden': 0.5,
      'Militaire Objecten': 0.8,
      'Paleokaart 800 n.Chr.': 0.7,
      'Paleokaart 100 n.Chr.': 0.7,
      'Paleokaart 500 v.Chr.': 0.7,
      'Paleokaart 1500 v.Chr.': 0.7,
      'Paleokaart 2750 v.Chr.': 0.7,
      'Paleokaart 5500 v.Chr.': 0.7,
      'Paleokaart 9000 v.Chr.': 0.7,
      'Religieus Erfgoed': 0.8
    },

    // Loading state for lazy-loaded layers
    loadingState: {},

    layers: {},

    toggleLayer: (name: string) => {
      const state = get()
      const newVisible = !state.visible[name]

      // Set visibility immediately for responsive UI
      set(state => {
        state.visible[name] = newVisible
      })

      // If turning on and layer doesn't exist, load it
      if (newVisible && !state.layers[name]) {
        get().loadLayer(name)
      } else if (state.layers[name]) {
        // Layer exists, just toggle visibility
        state.layers[name].setVisible(newVisible)
      }
    },

    setLayerVisibility: (name: string, visible: boolean) => {
      const state = get()

      // Set visibility in store
      set(s => {
        s.visible[name] = visible
        const layer = s.layers[name]
        if (layer) {
          layer.setVisible(visible)
        }
      })

      // If turning on and layer doesn't exist yet, load it
      if (visible && !state.layers[name]) {
        get().loadLayer(name)
      }
    },

    setLayerOpacity: (name: string, opacity: number) => {
      set(state => {
        state.opacity[name] = opacity
        const layer = state.layers[name]
        if (layer) {
          layer.setOpacity(opacity)
        }
      })
    },

    registerLayer: (name: string, layer: Layer) => {
      set(state => {
        state.layers[name] = layer
        state.loadingState[name] = 'loaded'
        // Set initial visibility
        if (state.visible[name] !== undefined) {
          layer.setVisible(state.visible[name])
        }
        // Set initial opacity
        if (state.opacity[name] !== undefined) {
          layer.setOpacity(state.opacity[name])
        }
      })
    },

    unregisterLayer: (name: string) => {
      set(state => {
        delete state.layers[name]
        delete state.loadingState[name]
      })
    },

    loadLayer: async (name: string) => {
      const state = get()

      // Skip if already loading or loaded
      if (state.loadingState[name] === 'loading' || state.layers[name]) {
        return
      }

      // Check if layer exists in registry
      const layerDef = layerRegistry[name]
      if (!layerDef) {
        console.warn(`⚠️ Layer "${name}" not found in registry`)
        return
      }

      // Get the map from mapStore
      const map = useMapStore.getState().map
      if (!map) {
        console.warn(`⚠️ Cannot load layer "${name}": map not initialized`)
        return
      }

      // Set loading state
      set(state => {
        state.loadingState[name] = 'loading'
      })

      console.log(`⏳ Loading layer: ${name}...`)

      try {
        // Create the layer using the factory
        const layer = await layerDef.factory()

        if (!layer) {
          throw new Error('Factory returned null')
        }

        // Set visibility and opacity before adding to map
        const currentState = get()
        layer.setVisible(currentState.visible[name] ?? false)
        if (currentState.opacity[name] !== undefined) {
          layer.setOpacity(currentState.opacity[name])
        }

        // Add to map
        map.addLayer(layer)

        // Register in store
        set(state => {
          state.layers[name] = layer
          state.loadingState[name] = 'loaded'
        })

        console.log(`✅ Layer loaded: ${name}`)
      } catch (error) {
        console.error(`❌ Failed to load layer "${name}":`, error)
        set(state => {
          state.loadingState[name] = 'error'
        })
      }
    }
  }))
)

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
    // Initial visibility state
    visible: {
      'AMK Monumenten': false,
      'Archis-punten': false,
      'Romeinse wegen': false,
      'Toestemmingen': false,
      'Monumenten (custom)': false,
      'Castella (punten)': false,
      'Castella (lijnen)': false,
      'Oppida': false,
      'Kastelen': false,
      'Veengebieden': false,
      'AHN 0.5m': false,
      'Geomorfologie': false,
      'Bodemkaart': false,
      'IKAW': false,
      'FAMKE Steentijd': false,
      'Archeo Landschappen': false,
      'Archeo Zones Vlaanderen': false,
      'Beschermde Sites Vlaanderen': false,
      'Archeo Punten': false,
      'Vlakken': false,
      'Bufferlaag': false,
      'Expert': false,
      'Indeling': false,
      'Speeltuinen': false,
      'Musea': false,
      'Strandjes': false,
      'Parken': false,
      'Kringloopwinkels': false,
      'CartoDB Positron': true,
      'OpenStreetMap': false,
      'Satellite': false,
      'TMK 1850': false,
      'Bonnebladen 1900': false,
      'Carte Cassini': false,
      // Hillshade layers
      'AHN4 Hillshade NL': false,
      'AHN4 Multi-Hillshade NL': false,
      'AHN4 Helling NL': false,
      'World Hillshade': false,
      'Hillshade Vlaanderen 25cm': false,
      'Skyview Vlaanderen 25cm': false,
      'DTM Vlaanderen 1m': false,
      'Hillshade NRW 25cm': false,
      'Hillshade NRW Kleur': false,
      'Hillshade Frankrijk': false,
      'LiDAR HD Frankrijk': false,
      'RGE Alti Frankrijk 1m': false,
      'Hoogtelijn Frankrijk': false,
      'Hillshade Wallonië': false,
      // Fossil layers
      'Fossielen Nederland': false,
      'Fossielen België': false,
      'Fossielen Duitsland': false,
      'Fossielen Frankrijk': false,
      // CAI
      'CAI Vlaanderen': false,
      'CAI Elementen': false,
      // Belgian Heritage (Onroerend Erfgoed)
      'Monumenten BE': false,
      'Archeo Zones BE': false,
      'Arch Sites BE': false,
      'Erfgoed Landschap BE': false,
      // France
      'Hist. Gebouwen FR': false,
      'INRAP Sites FR': false,
      'Archeo Sites Bretagne': false,
      'Operaties Bretagne': false,
      'Archeo Parijs': false,
      'Sites Patrimoine Occitanie': false,
      'Sites Patrimoine PACA': false,
      'Maginotlinie': false,
      'Sites Patrimoine Normandie': false,
      // Kromme Rijn
      'Kromme Rijn Aardewerk': false,
      // Steentijd layers
      'Hunebedden': false,
      'EUROEVOL Sites': false,
      // Vici.org Roman sites
      'Vici.org Romeins': false
    },

    // Initial opacity state
    opacity: {
      'AHN 0.5m': 0.7,
      'Geomorfologie': 0.5,
      'Bodemkaart': 0.6,
      'IKAW': 0.5,
      'Archeo Landschappen': 0.5,
      // Hillshade layers
      'AHN4 Hillshade NL': 0.7,
      'AHN4 Multi-Hillshade NL': 0.7,
      'AHN4 Helling NL': 0.6,
      'World Hillshade': 0.7,
      'Hillshade Vlaanderen 25cm': 0.7,
      'Skyview Vlaanderen 25cm': 0.7,
      'DTM Vlaanderen 1m': 0.6,
      'Hillshade NRW 25cm': 0.7,
      'Hillshade NRW Kleur': 0.7,
      'Hillshade Frankrijk': 0.7,
      'LiDAR HD Frankrijk': 0.7,
      'RGE Alti Frankrijk 1m': 0.6,
      'Hoogtelijn Frankrijk': 0.8,
      'Hillshade Wallonië': 0.7,
      // Belgian heritage
      'Monumenten BE': 0.8,
      'Archeo Zones BE': 0.6,
      'Arch Sites BE': 0.7,
      'Erfgoed Landschap BE': 0.5
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

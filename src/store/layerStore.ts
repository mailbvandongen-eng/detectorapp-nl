import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Layer } from 'ol/layer'
import type ImageryLayer from '@arcgis/core/layers/ImageryLayer'
import { layerRegistry } from '../layers/layerRegistry'
import { useMapStore } from './mapStore'
import { useSettingsStore, type DefaultBackground } from './settingsStore'
import { isArcGISEngine, useArcGISFeature } from '../config/mapEngineConfig'

// Basemap layer names that are handled by ArcGIS when ArcGIS is primary
const BASEMAP_LAYERS: DefaultBackground[] = ['Esri Licht', 'Esri Straten', 'Esri Satelliet', 'Luchtfoto', 'TMK 1850', 'Bonnebladen 1900']

export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error'

interface LayerState {
  // Visibility state
  visible: Record<string, boolean>

  // Opacity state for WMS layers
  opacity: Record<string, number>

  // Loading state for lazy-loaded layers
  loadingState: Record<string, LoadingState>

  // Layer instances - OpenLayers layers
  layers: Record<string, Layer>

  // ArcGIS layer instances (separate because different API)
  arcgisLayers: Record<string, ImageryLayer>

  // Actions
  toggleLayer: (name: string) => void
  setLayerVisibility: (name: string, visible: boolean) => void
  setLayerOpacity: (name: string, opacity: number) => void
  registerLayer: (name: string, layer: Layer) => void
  registerArcGISLayer: (name: string, layer: ImageryLayer) => void
  unregisterLayer: (name: string) => void
  loadLayer: (name: string) => Promise<void>
}

export const useLayerStore = create<LayerState>()(
  immer((set, get) => ({
    // Initial visibility state - NL only
    visible: {
      // Base layers (Esri basemaps)
      'Esri Licht': true,
      'Esri Straten': false,
      'Esri Satelliet': false,
      'Luchtfoto': false,
      'Labels Overlay': false,
      'TMK 1850': false,
      'Bonnebladen 1900': false,
      // Steentijd
      'Hunebedden': false,
      'FAMKE Steentijd': false,
      'FAMKE IJzertijd': false,
      'Grafheuvels': false,
      'Terpen': false,
      // Archeologische lagen
      'AMK Monumenten': false,
      'AMK Romeins': false,
      'AMK Steentijd': false,
      'AMK Vroege ME': false,
      'AMK Late ME': false,
      'AMK Overig': false,
      'Archeo Onderzoeken': false,
      'Romeinse wegen (regio)': false,
      'Romeinse wegen (Wereld)': false,
      'Kastelen': false,
      'IKAW': false,
      'Essen': false,
      // Erfgoed & Monumenten
      'Rijksmonumenten': false,
      'Werelderfgoed': false,
      'WWII Bunkers': false,
      'Slagvelden': false,
      'Militaire Vliegvelden': false,
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
      // Hillshade NL (via ArcGIS SDK)
      'AHN4 Hoogtekaart Kleur': false,
      'AHN4 Hillshade NL': false,
      'AHN4 Multi-Hillshade NL': false,
      'AHN4 Hillshade Kleur': false,
      'AHN 0.5m': false,
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
      'Strandjes': false,
      'Ruiterpaden': false,
      'Laarzenpaden': false,
      // Percelen (Kadaster & Landbouw)
      'Gewaspercelen': false,
      'Kadastrale Grenzen': false,
      // Provinciale Waardenkaarten - Zuid-Holland
      'Scheepswrakken': false,
      'Woonheuvels ZH': false,
      'Romeinse Forten': false,
      'Windmolens': false,
      'Erfgoedlijnen': false,
      'Oude Kernen': false,
      // Provinciale Waardenkaarten - Gelderland
      'Relictenkaart Punten': false,
      'Relictenkaart Lijnen': false,
      'Relictenkaart Vlakken': false,
      // Provinciale Waardenkaarten - Zeeland
      'Verdronken Dorpen': false,
      // Persoonlijk
      'Mijn Vondsten': true
    },

    // Initial opacity state - all overlay/vlak layers
    opacity: {
      // Hoogtekaarten (via ArcGIS SDK)
      'AHN4 Hoogtekaart Kleur': 0.85,
      'AHN4 Hillshade NL': 0.7,
      'AHN4 Multi-Hillshade NL': 0.7,
      'AHN4 Hillshade Kleur': 0.8,
      'AHN 0.5m': 0.7,
      // Historische kaarten
      'TMK 1850': 0.8,
      'Bonnebladen 1900': 0.8,
      // Terrein/bodem
      'Geomorfologie': 0.5,
      'Bodemkaart': 0.6,
      'Veengebieden': 0.6,
      // Archeologie
      'IKAW': 0.5,
      'FAMKE Steentijd': 0.6,
      'FAMKE IJzertijd': 0.6,
      'Essen': 0.6,
      'Terpen': 0.7,
      // AMK Monumenten - alle perioden
      'AMK Monumenten': 0.45,
      'AMK Romeins': 0.6,
      'AMK Steentijd': 0.6,
      'AMK Vroege ME': 0.6,
      'AMK Late ME': 0.6,
      'AMK Overig': 0.6,
      // Paleokaarten
      'Paleokaart 9000 v.Chr.': 0.7,
      'Paleokaart 5500 v.Chr.': 0.7,
      'Paleokaart 2750 v.Chr.': 0.7,
      'Paleokaart 1500 v.Chr.': 0.7,
      'Paleokaart 500 v.Chr.': 0.7,
      'Paleokaart 100 n.Chr.': 0.7,
      'Paleokaart 800 n.Chr.': 0.7,
      // Militair
      'Verdedigingslinies': 0.7,
      'Inundatiegebieden': 0.5,
      'Militaire Objecten': 0.8,
      'Religieus Erfgoed': 0.8,
      // Percelen
      'Gewaspercelen': 0.6,
      'Kadastrale Grenzen': 0.7,
      // Provinciale Waardenkaarten
      'Erfgoedlijnen': 0.7,
      'Oude Kernen': 0.6,
      'Relictenkaart Vlakken': 0.5
    },

    // Loading state for lazy-loaded layers
    loadingState: {},

    layers: {},
    arcgisLayers: {},

    toggleLayer: (name: string) => {
      const state = get()
      const newVisible = !state.visible[name]

      // Handle Labels Overlay specially - it's managed by mapStore
      if (name === 'Labels Overlay') {
        set(s => {
          s.visible[name] = newVisible
        })
        useMapStore.getState().setLabelsOverlay(newVisible)
        return
      }

      // Set visibility immediately for responsive UI
      set(state => {
        state.visible[name] = newVisible
      })

      // Check if this is an ArcGIS layer
      const layerDef = layerRegistry[name]
      const isArcGIS = layerDef?.platform === 'arcgis'

      if (isArcGIS) {
        // Handle ArcGIS layer
        if (newVisible && !state.arcgisLayers[name]) {
          get().loadLayer(name)
        } else if (state.arcgisLayers[name]) {
          state.arcgisLayers[name].visible = newVisible
        }
      } else {
        // Handle OpenLayers layer
        if (newVisible && !state.layers[name]) {
          get().loadLayer(name)
        } else if (state.layers[name]) {
          state.layers[name].setVisible(newVisible)
        }
      }
    },

    setLayerVisibility: (name: string, visible: boolean) => {
      const state = get()

      // Handle Labels Overlay specially - it's managed by mapStore
      if (name === 'Labels Overlay') {
        set(s => {
          s.visible[name] = visible
        })
        // Trigger mapStore to handle the labels layer
        useMapStore.getState().setLabelsOverlay(visible)
        return
      }

      // Check if this is a basemap layer that ArcGIS handles
      const isBasemapLayer = BASEMAP_LAYERS.includes(name as DefaultBackground)
      const arcgisHandlesBasemaps = isArcGISEngine() && useArcGISFeature('arcgisBaseLayers')

      if (isBasemapLayer && arcgisHandlesBasemaps && visible) {
        // When ArcGIS handles basemaps, use settingsStore to change basemap
        // Update visibility state for all basemaps (radio button behavior)
        set(s => {
          BASEMAP_LAYERS.forEach(basemap => {
            s.visible[basemap] = basemap === name
          })
        })
        // Trigger basemap change via settings store
        useSettingsStore.getState().setDefaultBackground(name as DefaultBackground)
        return
      }

      const layerDef = layerRegistry[name]
      const isArcGIS = layerDef?.platform === 'arcgis'

      // Set visibility in store
      set(s => {
        s.visible[name] = visible
        if (isArcGIS) {
          const arcgisLayer = s.arcgisLayers[name]
          if (arcgisLayer) {
            arcgisLayer.visible = visible
          }
        } else {
          const layer = s.layers[name]
          if (layer) {
            layer.setVisible(visible)
          }
        }
      })

      // If turning on and layer doesn't exist yet, load it
      const layerExists = isArcGIS ? state.arcgisLayers[name] : state.layers[name]
      if (visible && !layerExists) {
        get().loadLayer(name)
      }
    },

    setLayerOpacity: (name: string, opacity: number) => {
      const layerDef = layerRegistry[name]
      const isArcGIS = layerDef?.platform === 'arcgis'

      set(state => {
        state.opacity[name] = opacity
        if (isArcGIS) {
          const arcgisLayer = state.arcgisLayers[name]
          if (arcgisLayer) {
            arcgisLayer.opacity = opacity
          }
        } else {
          const layer = state.layers[name]
          if (layer) {
            layer.setOpacity(opacity)
          }
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

    registerArcGISLayer: (name: string, layer: ImageryLayer) => {
      set(state => {
        state.arcgisLayers[name] = layer
        state.loadingState[name] = 'loaded'
        // Set initial visibility
        if (state.visible[name] !== undefined) {
          layer.visible = state.visible[name]
        }
        // Set initial opacity
        if (state.opacity[name] !== undefined) {
          layer.opacity = state.opacity[name]
        }
      })
    },

    unregisterLayer: (name: string) => {
      set(state => {
        delete state.layers[name]
        delete state.arcgisLayers[name]
        delete state.loadingState[name]
      })
    },

    loadLayer: async (name: string) => {
      const state = get()

      // Check if layer exists in registry
      const layerDef = layerRegistry[name]
      if (!layerDef) {
        console.warn(`⚠️ Layer "${name}" not found in registry`)
        return
      }

      const isArcGIS = layerDef.platform === 'arcgis'

      // Skip if already loading or loaded
      if (state.loadingState[name] === 'loading') return
      if (isArcGIS && state.arcgisLayers[name]) return
      if (!isArcGIS && state.layers[name]) return

      // Get the appropriate map
      const mapState = useMapStore.getState()

      if (isArcGIS) {
        // Need ArcGIS map
        if (!mapState.arcgisMap || !mapState.arcgisInitialized) {
          console.warn(`⚠️ Cannot load ArcGIS layer "${name}": ArcGIS map not initialized`)
          return
        }
      } else {
        // Need OpenLayers map
        if (!mapState.map) {
          console.warn(`⚠️ Cannot load layer "${name}": map not initialized`)
          return
        }
      }

      // Set loading state
      set(state => {
        state.loadingState[name] = 'loading'
      })

      console.log(`⏳ Loading ${isArcGIS ? 'ArcGIS' : 'OL'} layer: ${name}...`)

      try {
        // Create the layer using the factory
        const layer = await layerDef.factory()

        if (!layer) {
          throw new Error('Factory returned null')
        }

        const currentState = get()

        if (isArcGIS) {
          // ArcGIS ImageryLayer
          const arcgisLayer = layer as import('@arcgis/core/layers/ImageryLayer').default
          arcgisLayer.visible = currentState.visible[name] ?? false
          if (currentState.opacity[name] !== undefined) {
            arcgisLayer.opacity = currentState.opacity[name]
          }

          // Add to ArcGIS map
          mapState.arcgisMap!.add(arcgisLayer)

          // Register in store
          set(state => {
            state.arcgisLayers[name] = arcgisLayer
            state.loadingState[name] = 'loaded'
          })
        } else {
          // OpenLayers layer
          const olLayer = layer as Layer
          olLayer.setVisible(currentState.visible[name] ?? false)
          if (currentState.opacity[name] !== undefined) {
            olLayer.setOpacity(currentState.opacity[name])
          }

          // Add to OL map
          mapState.map!.addLayer(olLayer)

          // Register in store
          set(state => {
            state.layers[name] = olLayer
            state.loadingState[name] = 'loaded'
          })
        }

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

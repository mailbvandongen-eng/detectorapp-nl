import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type Map from 'ol/Map'
import { fromLonLat } from 'ol/proj'
import type MapView from '@arcgis/core/views/MapView'
import type EsriMap from '@arcgis/core/Map'
import Basemap from '@arcgis/core/Basemap'
import WebTileLayer from '@arcgis/core/layers/WebTileLayer'
import EsriTileLayer from '@arcgis/core/layers/TileLayer'
import { mapEngineConfig, engineLog, type MapEngine } from '../config/mapEngineConfig'

// Basemap configuration types
type EsriTileConfig = { type: 'esritile'; url: string; copyright: string; referenceUrl?: string }
type WebTileConfig = { type: 'webtile'; url: string; subDomains?: string[]; copyright: string; maxScale?: number; referenceUrl?: string }
type BasemapConfig = EsriTileConfig | WebTileConfig

// Reference layer URL for labels on aerial/satellite imagery
const ESRI_REFERENCE_LABELS = 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Reference_Overlay/MapServer'

// ArcGIS base layer configurations - using public Esri tile services (no special API key needed)
const ARCGIS_BASE_LAYERS: Record<string, BasemapConfig> = {
  // Esri tile services (public, no extra API privileges required)
  'Esri Licht': {
    type: 'esritile',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer',
    copyright: '© Esri'
  },
  'Esri Straten': {
    type: 'esritile',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
    copyright: '© Esri'
  },
  'Esri Satelliet': {
    type: 'esritile',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
    copyright: '© Esri',
    referenceUrl: ESRI_REFERENCE_LABELS
  },
  // PDOK aerial imagery (high resolution Netherlands)
  'Luchtfoto': {
    type: 'webtile',
    url: 'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/EPSG:3857/{level}/{col}/{row}.jpeg',
    copyright: '© Kadaster / PDOK Luchtfoto',
    referenceUrl: ESRI_REFERENCE_LABELS
  },
  // Historical maps from Map5.nl (publicly accessible XYZ tiles)
  'TMK 1850': {
    type: 'webtile',
    url: 'https://s.map5.nl/map/gast/tiles/tmk_1850/EPSG3857/{level}/{col}/{row}.png',
    copyright: '© Kadaster / Map5.nl'
  },
  'Bonnebladen 1900': {
    type: 'webtile',
    url: 'https://s.map5.nl/map/gast/tiles/bonne_1900/EPSG3857/{level}/{col}/{row}.png',
    copyright: '© Kadaster / Map5.nl'
  }
}

interface MapState {
  // Current active engine
  activeEngine: MapEngine

  // OpenLayers map instance (legacy, wordt uitgefaseerd)
  map: Map | null

  // ArcGIS map and view instances (primaire engine)
  arcgisMap: EsriMap | null
  arcgisView: MapView | null
  arcgisInitialized: boolean

  // View state (unified voor beide engines)
  center: [number, number] // [lon, lat] in WGS84
  zoom: number
  rotation: number
  rotationEnabled: boolean

  // Actions
  setMap: (map: Map | null) => void
  setArcGISMap: (map: EsriMap, view: MapView) => void
  setCenter: (center: [number, number]) => void
  setZoom: (zoom: number) => void
  setRotation: (rotation: number) => void
  enableRotation: () => void
  disableRotation: () => void

  // Unified view actions (werkt met beide engines)
  goTo: (options: { center?: [number, number]; zoom?: number; rotation?: number; animate?: boolean }) => void

  // Basemap actions
  setBasemap: (basemapName: string) => void
}

export const useMapStore = create<MapState>()(
  immer((set, get) => ({
    activeEngine: mapEngineConfig.engine,
    map: null,
    arcgisMap: null,
    arcgisView: null,
    arcgisInitialized: false,
    center: [5.1214, 52.0907], // Netherlands center
    zoom: 8,
    rotation: 0,
    rotationEnabled: true,

    setMap: (map: Map | null) => {
      set(state => {
        state.map = map
      })
      if (map) {
        engineLog('OpenLayers map instance set')
      }
    },

    setArcGISMap: (arcgisMap: EsriMap, arcgisView: MapView) => {
      set(state => {
        state.arcgisMap = arcgisMap
        state.arcgisView = arcgisView
        state.arcgisInitialized = true
      })
      engineLog('ArcGIS MapView initialized', {
        center: arcgisView.center?.toJSON(),
        zoom: arcgisView.zoom
      })
    },

    setCenter: (center: [number, number]) => {
      set(state => {
        state.center = center
      })
    },

    setZoom: (zoom: number) => {
      set(state => {
        state.zoom = zoom
      })
    },

    setRotation: (rotation: number) => {
      const state = get()
      set(s => {
        s.rotation = rotation
      })

      if (!state.rotationEnabled) return

      // Sync rotation to active engine
      if (state.activeEngine === 'arcgis' && state.arcgisView) {
        state.arcgisView.goTo({ rotation: rotation }, { animate: false })
      } else if (state.map) {
        const rotationRadians = (rotation * Math.PI) / 180
        state.map.getView().setRotation(rotationRadians)
      }
    },

    enableRotation: () => {
      set(state => {
        state.rotationEnabled = true
      })
    },

    disableRotation: () => {
      const state = get()
      set(s => {
        s.rotationEnabled = false
        s.rotation = 0
      })

      // Reset rotation on both engines
      if (state.arcgisView) {
        state.arcgisView.goTo({ rotation: 0 }, { animate: true, duration: 500 })
      }
      if (state.map) {
        state.map.getView().animate({ rotation: 0, duration: 500 })
      }
    },

    goTo: (options) => {
      const state = get()
      const { center, zoom, rotation, animate = true } = options

      // Update internal state
      set(s => {
        if (center) s.center = center
        if (zoom !== undefined) s.zoom = zoom
        if (rotation !== undefined) s.rotation = rotation
      })

      // Apply to ArcGIS view (primary)
      // When ArcGIS is primary, OL is synced via watch handlers in MapContainer
      // This ensures OL uses the ACTUAL ArcGIS position, preventing misalignment
      if (state.activeEngine === 'arcgis' && state.arcgisView) {
        const arcgisOptions: any = {}
        if (center) arcgisOptions.center = center
        if (zoom !== undefined) arcgisOptions.zoom = zoom
        if (rotation !== undefined) arcgisOptions.rotation = rotation

        // Use goTo and let watch handlers sync OL when ArcGIS updates
        state.arcgisView.goTo(arcgisOptions, { animate, duration: animate ? 500 : 0 })
          .then(() => {
            // After ArcGIS completes, force OL to update size for proper tile loading
            if (state.map && !animate) {
              state.map.updateSize()
            }
          })
          .catch(() => {
            // goTo can be cancelled, ignore errors
          })
        engineLog('goTo ArcGIS', arcgisOptions)
        return // Don't update OL directly - let watch handlers do it
      }

      // Only directly update OL when it's the primary engine
      if (state.map) {
        const view = state.map.getView()
        if (animate) {
          view.animate({
            center: center ? fromLonLat(center) : undefined,
            zoom,
            rotation: rotation !== undefined ? (rotation * Math.PI) / 180 : undefined,
            duration: 500
          })
        } else {
          if (center) {
            view.setCenter(fromLonLat(center))
          }
          if (zoom !== undefined) view.setZoom(zoom)
          if (rotation !== undefined) view.setRotation((rotation * Math.PI) / 180)
        }
      }
    },

    setBasemap: (basemapName: string) => {
      const state = get()

      // Only change ArcGIS basemap if ArcGIS is primary engine
      if (state.activeEngine === 'arcgis' && state.arcgisView) {
        // Handle legacy basemap names (migration from CartoDB to Esri)
        let resolvedName = basemapName
        if (!ARCGIS_BASE_LAYERS[basemapName]) {
          engineLog('Unknown basemap, falling back to Esri Licht:', basemapName)
          resolvedName = 'Esri Licht'
        }
        const config = ARCGIS_BASE_LAYERS[resolvedName]

        // Create reference layer for labels (if configured)
        const referenceLayers = config.referenceUrl ? [
          new EsriTileLayer({
            url: config.referenceUrl,
            title: 'Labels'
          })
        ] : []

        let basemap: Basemap

        if (config.type === 'esritile') {
          // Use Esri TileLayer for ArcGIS Server tile services
          const esriTileLayer = new EsriTileLayer({
            url: config.url,
            copyright: config.copyright,
            title: resolvedName
          })

          basemap = new Basemap({
            baseLayers: [esriTileLayer],
            referenceLayers,
            title: resolvedName
          })
          engineLog('Using Esri TileLayer:', config.url, config.referenceUrl ? '+ labels' : '')
        } else {
          // Use custom WebTileLayer for standard XYZ/TMS tiles
          const baseLayer = new WebTileLayer({
            urlTemplate: config.url,
            subDomains: config.subDomains,
            copyright: config.copyright,
            title: resolvedName,
            maxScale: config.maxScale
          })

          basemap = new Basemap({
            baseLayers: [baseLayer],
            referenceLayers,
            title: resolvedName
          })
          engineLog('Using WebTileLayer:', config.url, config.referenceUrl ? '+ labels' : '')
        }

        state.arcgisView.map.basemap = basemap
        engineLog('Basemap changed to:', resolvedName)
      }
    }
  }))
)

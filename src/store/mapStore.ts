import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type Map from 'ol/Map'
import type MapView from '@arcgis/core/views/MapView'
import type EsriMap from '@arcgis/core/Map'
import { mapEngineConfig, engineLog, type MapEngine } from '../config/mapEngineConfig'

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
      if (state.arcgisView) {
        const arcgisOptions: any = {}
        if (center) arcgisOptions.center = center
        if (zoom !== undefined) arcgisOptions.zoom = zoom
        if (rotation !== undefined) arcgisOptions.rotation = rotation

        state.arcgisView.goTo(arcgisOptions, { animate, duration: animate ? 500 : 0 })
        engineLog('goTo ArcGIS', arcgisOptions)
      }

      // Sync to OpenLayers (if still active for layers)
      if (state.map) {
        const view = state.map.getView()
        if (animate) {
          view.animate({
            center: center ? [center[0], center[1]] : undefined,
            zoom,
            rotation: rotation !== undefined ? (rotation * Math.PI) / 180 : undefined,
            duration: 500
          })
        } else {
          if (center) {
            const { fromLonLat } = require('ol/proj')
            view.setCenter(fromLonLat(center))
          }
          if (zoom !== undefined) view.setZoom(zoom)
          if (rotation !== undefined) view.setRotation((rotation * Math.PI) / 180)
        }
      }
    }
  }))
)

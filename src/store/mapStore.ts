import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type Map from 'ol/Map'

interface MapState {
  // OpenLayers map instance
  map: Map | null

  // View state
  rotation: number
  rotationEnabled: boolean

  // Actions
  setMap: (map: Map) => void
  setRotation: (rotation: number) => void
  enableRotation: () => void
  disableRotation: () => void
}

export const useMapStore = create<MapState>()(
  immer((set, get) => ({
    map: null,
    rotation: 0,
    rotationEnabled: true,

    setMap: (map: Map) => {
      set(state => {
        state.map = map
      })
    },

    setRotation: (rotation: number) => {
      set(state => {
        state.rotation = rotation
        if (state.map && state.rotationEnabled) {
          const rotationRadians = (rotation * Math.PI) / 180
          state.map.getView().setRotation(rotationRadians)
        }
      })
    },

    enableRotation: () => {
      set(state => {
        state.rotationEnabled = true
      })
    },

    disableRotation: () => {
      set(state => {
        state.rotationEnabled = false
        state.rotation = 0
        if (state.map) {
          state.map.getView().animate({ rotation: 0, duration: 500 })
        }
      })
    }
  }))
)

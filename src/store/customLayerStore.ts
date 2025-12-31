import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// GeoJSON types for storage
export interface CustomFeature {
  type: 'Feature'
  geometry: {
    type: 'Point' | 'LineString' | 'Polygon' | 'MultiPoint' | 'MultiLineString' | 'MultiPolygon'
    coordinates: number[] | number[][] | number[][][] | number[][][][]
  }
  properties: Record<string, unknown>
}

export interface CustomFeatureCollection {
  type: 'FeatureCollection'
  features: CustomFeature[]
}

export interface CustomLayer {
  id: string
  name: string
  type: 'geojson' | 'kml' | 'gpx'
  features: CustomFeatureCollection
  visible: boolean
  opacity: number
  color: string // Hex color for markers
  createdAt: string
  sourceFileName: string
}

interface CustomLayerState {
  layers: CustomLayer[]

  // Actions
  addLayer: (layer: Omit<CustomLayer, 'id' | 'createdAt'>) => string
  removeLayer: (id: string) => void
  updateLayer: (id: string, updates: Partial<CustomLayer>) => void
  toggleVisibility: (id: string) => void
  setOpacity: (id: string, opacity: number) => void
  setColor: (id: string, color: string) => void
  clearAll: () => void
}

// Default colors for new layers (cycling through)
const LAYER_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
]

export const useCustomLayerStore = create<CustomLayerState>()(
  persist(
    (set, get) => ({
      layers: [],

      addLayer: (layer) => {
        const id = crypto.randomUUID()
        const existingCount = get().layers.length
        const defaultColor = LAYER_COLORS[existingCount % LAYER_COLORS.length]

        set((state) => ({
          layers: [
            ...state.layers,
            {
              ...layer,
              id,
              createdAt: new Date().toISOString(),
              color: layer.color || defaultColor,
              visible: layer.visible ?? true,
              opacity: layer.opacity ?? 1,
            }
          ]
        }))
        return id
      },

      removeLayer: (id) => set((state) => ({
        layers: state.layers.filter(l => l.id !== id)
      })),

      updateLayer: (id, updates) => set((state) => ({
        layers: state.layers.map(l =>
          l.id === id ? { ...l, ...updates } : l
        )
      })),

      toggleVisibility: (id) => set((state) => ({
        layers: state.layers.map(l =>
          l.id === id ? { ...l, visible: !l.visible } : l
        )
      })),

      setOpacity: (id, opacity) => set((state) => ({
        layers: state.layers.map(l =>
          l.id === id ? { ...l, opacity } : l
        )
      })),

      setColor: (id, color) => set((state) => ({
        layers: state.layers.map(l =>
          l.id === id ? { ...l, color } : l
        )
      })),

      clearAll: () => set({ layers: [] }),
    }),
    {
      name: 'detectorapp-custom-layers',
      version: 1,
    }
  )
)

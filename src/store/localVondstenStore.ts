import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Simplified local vondst type (no Firebase fields)
export interface LocalVondst {
  id: string
  location: {
    lat: number
    lng: number
  }
  timestamp: string // ISO date string
  notes: string
  objectType: string
  material: string
  period: string
  depth?: number // cm
}

interface LocalVondstenState {
  vondsten: LocalVondst[]
  addVondst: (vondst: Omit<LocalVondst, 'id' | 'timestamp'>) => void
  removeVondst: (id: string) => void
  updateVondst: (id: string, updates: Partial<LocalVondst>) => void
  clearAll: () => void
  exportAsGeoJSON: () => void
}

export const useLocalVondstenStore = create<LocalVondstenState>()(
  persist(
    (set, get) => ({
      vondsten: [],

      addVondst: (vondst) => set((state) => ({
        vondsten: [
          ...state.vondsten,
          {
            ...vondst,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
          }
        ]
      })),

      removeVondst: (id) => set((state) => ({
        vondsten: state.vondsten.filter(v => v.id !== id)
      })),

      updateVondst: (id, updates) => set((state) => ({
        vondsten: state.vondsten.map(v =>
          v.id === id ? { ...v, ...updates } : v
        )
      })),

      clearAll: () => set({ vondsten: [] }),

      exportAsGeoJSON: () => {
        const vondsten = get().vondsten
        if (vondsten.length === 0) {
          alert('Geen vondsten om te exporteren')
          return
        }

        const geojson = {
          type: 'FeatureCollection',
          features: vondsten.map(v => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [v.location.lng, v.location.lat]
            },
            properties: {
              id: v.id,
              objectType: v.objectType,
              material: v.material,
              period: v.period,
              depth: v.depth,
              notes: v.notes,
              timestamp: v.timestamp
            }
          }))
        }

        // Download as file
        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mijn-vondsten-${new Date().toISOString().split('T')[0]}.geojson`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }),
    {
      name: 'detectorapp-local-vondsten'
    }
  )
)

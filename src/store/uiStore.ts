import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface UIState {
  // Panel states
  layerControlOpen: boolean
  legendOpen: boolean

  // Collapsed categories
  collapsedCategories: Set<string>

  // Actions
  toggleLayerControl: () => void
  toggleLegend: () => void
  toggleCategory: (category: string) => void
  setLayerControlOpen: (open: boolean) => void
  setLegendOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  immer((set, get) => ({
    layerControlOpen: false,
    legendOpen: false,
    collapsedCategories: new Set<string>(),

    toggleLayerControl: () => {
      set(state => {
        state.layerControlOpen = !state.layerControlOpen
      })
    },

    toggleLegend: () => {
      set(state => {
        state.legendOpen = !state.legendOpen
      })
    },

    toggleCategory: (category: string) => {
      set(state => {
        if (state.collapsedCategories.has(category)) {
          state.collapsedCategories.delete(category)
        } else {
          state.collapsedCategories.add(category)
        }
      })
    },

    setLayerControlOpen: (open: boolean) => {
      set(state => {
        state.layerControlOpen = open
      })
    },

    setLegendOpen: (open: boolean) => {
      set(state => {
        state.legendOpen = open
      })
    }
  }))
)

import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface UIState {
  // Panel states
  layerControlOpen: boolean
  legendOpen: boolean
  backgroundsPanelOpen: boolean
  themesPanelOpen: boolean
  settingsPanelOpen: boolean
  infoPanelOpen: boolean
  presetsPanelOpen: boolean

  // Vondst form state
  vondstFormOpen: boolean
  vondstFormLocation: { lat: number; lng: number } | null
  vondstFormPhoto: File | null
  vondstDashboardOpen: boolean

  // Custom point layer state
  createLayerModalOpen: boolean
  addPointModalOpen: boolean
  addPointModalLayerId: string | null
  addPointModalLocation: { lat: number; lng: number } | null
  layerManagerModalOpen: boolean
  layerDashboardOpen: boolean
  layerDashboardLayerId: string | null

  // Collapsed categories
  collapsedCategories: Set<string>

  // Actions
  closeAllPanels: () => void
  toggleLayerControl: () => void
  toggleLegend: () => void
  toggleBackgroundsPanel: () => void
  toggleThemesPanel: () => void
  toggleSettingsPanel: () => void
  toggleInfoPanel: () => void
  togglePresetsPanel: () => void
  toggleCategory: (category: string) => void
  setLayerControlOpen: (open: boolean) => void
  setLegendOpen: (open: boolean) => void
  openVondstForm: (location?: { lat: number; lng: number }, photo?: File) => void
  closeVondstForm: () => void
  toggleVondstDashboard: () => void

  // Custom point layer actions
  openCreateLayerModal: () => void
  closeCreateLayerModal: () => void
  openAddPointModal: (layerId: string, location: { lat: number; lng: number }) => void
  closeAddPointModal: () => void
  openLayerManagerModal: () => void
  closeLayerManagerModal: () => void
  openLayerDashboard: (layerId: string) => void
  closeLayerDashboard: () => void
}

export const useUIStore = create<UIState>()(
  immer((set, get) => ({
    layerControlOpen: false,
    legendOpen: false,
    backgroundsPanelOpen: false,
    themesPanelOpen: false,
    settingsPanelOpen: false,
    infoPanelOpen: false,
    presetsPanelOpen: false,
    vondstFormOpen: false,
    vondstFormLocation: null,
    vondstFormPhoto: null,
    vondstDashboardOpen: false,
    createLayerModalOpen: false,
    addPointModalOpen: false,
    addPointModalLayerId: null,
    addPointModalLocation: null,
    layerManagerModalOpen: false,
    layerDashboardOpen: false,
    layerDashboardLayerId: null,
    collapsedCategories: new Set<string>(),

    closeAllPanels: () => {
      set(state => {
        state.backgroundsPanelOpen = false
        state.themesPanelOpen = false
        state.settingsPanelOpen = false
        state.infoPanelOpen = false
        state.presetsPanelOpen = false
      })
    },

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

    toggleBackgroundsPanel: () => {
      set(state => {
        const wasOpen = state.backgroundsPanelOpen
        // Close ALL panels first
        state.backgroundsPanelOpen = false
        state.themesPanelOpen = false
        state.settingsPanelOpen = false
        state.infoPanelOpen = false
        state.presetsPanelOpen = false
        // Toggle this one
        if (!wasOpen) state.backgroundsPanelOpen = true
      })
    },

    toggleThemesPanel: () => {
      set(state => {
        const wasOpen = state.themesPanelOpen
        // Close ALL panels first
        state.backgroundsPanelOpen = false
        state.themesPanelOpen = false
        state.settingsPanelOpen = false
        state.infoPanelOpen = false
        state.presetsPanelOpen = false
        // Toggle this one
        if (!wasOpen) state.themesPanelOpen = true
      })
    },

    toggleSettingsPanel: () => {
      set(state => {
        const wasOpen = state.settingsPanelOpen
        // Close ALL panels first
        state.backgroundsPanelOpen = false
        state.themesPanelOpen = false
        state.settingsPanelOpen = false
        state.infoPanelOpen = false
        state.presetsPanelOpen = false
        // Toggle this one
        if (!wasOpen) state.settingsPanelOpen = true
      })
    },

    toggleInfoPanel: () => {
      set(state => {
        const wasOpen = state.infoPanelOpen
        // Close ALL panels first
        state.backgroundsPanelOpen = false
        state.themesPanelOpen = false
        state.settingsPanelOpen = false
        state.infoPanelOpen = false
        state.presetsPanelOpen = false
        // Toggle this one
        if (!wasOpen) state.infoPanelOpen = true
      })
    },

    togglePresetsPanel: () => {
      set(state => {
        const wasOpen = state.presetsPanelOpen
        // Close ALL panels first
        state.backgroundsPanelOpen = false
        state.themesPanelOpen = false
        state.settingsPanelOpen = false
        state.infoPanelOpen = false
        state.presetsPanelOpen = false
        // Toggle this one
        if (!wasOpen) state.presetsPanelOpen = true
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
    },

    openVondstForm: (location, photo) => {
      set(state => {
        // Close all panels first
        state.backgroundsPanelOpen = false
        state.themesPanelOpen = false
        state.settingsPanelOpen = false
        state.infoPanelOpen = false
        state.presetsPanelOpen = false
        // Open vondst form
        state.vondstFormOpen = true
        state.vondstFormLocation = location || null
        state.vondstFormPhoto = photo || null
      })
    },

    closeVondstForm: () => {
      set(state => {
        state.vondstFormOpen = false
        state.vondstFormLocation = null
        state.vondstFormPhoto = null
      })
    },

    toggleVondstDashboard: () => {
      set(state => {
        const wasOpen = state.vondstDashboardOpen
        // Close all panels first
        state.backgroundsPanelOpen = false
        state.themesPanelOpen = false
        state.settingsPanelOpen = false
        state.infoPanelOpen = false
        state.presetsPanelOpen = false
        // Toggle dashboard
        state.vondstDashboardOpen = !wasOpen
      })
    },

    // Custom point layer actions
    openCreateLayerModal: () => {
      set(state => {
        state.createLayerModalOpen = true
      })
    },

    closeCreateLayerModal: () => {
      set(state => {
        state.createLayerModalOpen = false
      })
    },

    openAddPointModal: (layerId, location) => {
      set(state => {
        state.addPointModalOpen = true
        state.addPointModalLayerId = layerId
        state.addPointModalLocation = location
      })
    },

    closeAddPointModal: () => {
      set(state => {
        state.addPointModalOpen = false
        state.addPointModalLayerId = null
        state.addPointModalLocation = null
      })
    },

    openLayerManagerModal: () => {
      set(state => {
        state.layerManagerModalOpen = true
      })
    },

    closeLayerManagerModal: () => {
      set(state => {
        state.layerManagerModalOpen = false
      })
    },

    openLayerDashboard: (layerId) => {
      set(state => {
        state.layerDashboardOpen = true
        state.layerDashboardLayerId = layerId
        state.layerManagerModalOpen = false // Close manager when opening dashboard
      })
    },

    closeLayerDashboard: () => {
      set(state => {
        state.layerDashboardOpen = false
        state.layerDashboardLayerId = null
      })
    }
  }))
)

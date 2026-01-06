import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DefaultBackground = 'CartoDB (licht)' | 'Luchtfoto' | 'OpenStreetMap'

interface SettingsState {
  // Kaart
  defaultBackground: DefaultBackground
  showScaleBar: boolean

  // GPS
  gpsAutoStart: boolean
  showAccuracyCircle: boolean

  // Feedback
  hapticFeedback: boolean

  // Vondsten
  vondstenLocalOnly: boolean  // true = localStorage, false = Firebase
  showVondstButton: boolean   // Show/hide the add vondst button

  // Route opnemen
  showRouteRecordButton: boolean  // Show/hide the route record button

  // Zichtbaarheid op kaart
  showLocalVondsten: boolean  // Show/hide local vondsten markers on map
  showCustomPointLayers: boolean  // Show/hide custom point layers on map

  // Weergave
  fontScale: number  // 80-150, percentage scale for app text
  layerPanelFontScale: number  // 80-150, for Kaartlagen panel
  presetPanelFontScale: number  // 80-150, for Presets panel
  menuFontScale: number  // 80-130, for Hamburger menu

  // Actions
  setDefaultBackground: (bg: DefaultBackground) => void
  setShowScaleBar: (value: boolean) => void
  setGpsAutoStart: (value: boolean) => void
  setShowAccuracyCircle: (value: boolean) => void
  setHapticFeedback: (value: boolean) => void
  setVondstenLocalOnly: (value: boolean) => void
  setShowVondstButton: (value: boolean) => void
  setShowRouteRecordButton: (value: boolean) => void
  setShowLocalVondsten: (value: boolean) => void
  setShowCustomPointLayers: (value: boolean) => void
  setFontScale: (value: number) => void
  setLayerPanelFontScale: (value: number) => void
  setPresetPanelFontScale: (value: number) => void
  setMenuFontScale: (value: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Defaults
      defaultBackground: 'CartoDB (licht)',
      showScaleBar: true,
      gpsAutoStart: false,
      showAccuracyCircle: true,
      hapticFeedback: true,
      vondstenLocalOnly: true,  // Default to local storage (no login needed)
      showVondstButton: false,  // Hidden by default, can enable in settings
      showRouteRecordButton: false,  // Hidden by default, can enable in settings
      showLocalVondsten: true,  // Show vondsten markers by default
      showCustomPointLayers: true,  // Show custom point layers by default
      fontScale: 100,           // Default 100% = 14px base
      layerPanelFontScale: 100, // Default 100%
      presetPanelFontScale: 100, // Default 100%
      menuFontScale: 100,       // Default 100%

      // Actions
      setDefaultBackground: (defaultBackground) => set({ defaultBackground }),
      setShowScaleBar: (showScaleBar) => set({ showScaleBar }),
      setGpsAutoStart: (gpsAutoStart) => set({ gpsAutoStart }),
      setShowAccuracyCircle: (showAccuracyCircle) => set({ showAccuracyCircle }),
      setHapticFeedback: (hapticFeedback) => set({ hapticFeedback }),
      setVondstenLocalOnly: (vondstenLocalOnly) => set({ vondstenLocalOnly }),
      setShowVondstButton: (showVondstButton) => set({ showVondstButton }),
      setShowRouteRecordButton: (showRouteRecordButton) => set({ showRouteRecordButton }),
      setShowLocalVondsten: (showLocalVondsten) => set({ showLocalVondsten }),
      setShowCustomPointLayers: (showCustomPointLayers) => set({ showCustomPointLayers }),
      setFontScale: (fontScale) => set({ fontScale }),
      setLayerPanelFontScale: (layerPanelFontScale) => set({ layerPanelFontScale }),
      setPresetPanelFontScale: (presetPanelFontScale) => set({ presetPanelFontScale }),
      setMenuFontScale: (menuFontScale) => set({ menuFontScale })
    }),
    {
      name: 'detectorapp-settings',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // Migrate from older versions without showScaleBar
        if (version < 2) {
          return {
            ...persistedState,
            showScaleBar: true  // Ensure scale bar is visible by default
          }
        }
        return persistedState
      }
    }
  )
)

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type DefaultBackground = 'Esri Licht' | 'Esri Straten' | 'Esri Satelliet' | 'Luchtfoto' | 'TMK 1850' | 'Bonnebladen 1900'

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
  weatherFontScale: number  // 80-150, for Weather widget

  // Voice feedback
  voiceFeedbackEnabled: boolean  // Speak aloud when adding vondsten

  // Stappenteller
  showStepCounter: boolean  // Show/hide the step counter

  // Weergave opties
  showFontSliders: boolean  // Show/hide font size sliders (boomer mode)

  // Weer
  showWeatherButton: boolean  // Show/hide the weather button

  // Welkom modal
  hideWelcomeModal: boolean  // Don't show welcome modal on startup

  // Gereedschappen (linkerkant)
  showMeasureTool: boolean  // Show/hide measure tool button
  showDrawTool: boolean     // Show/hide draw tool button
  showPrintTool: boolean    // Show/hide print tool button

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
  setWeatherFontScale: (value: number) => void
  setVoiceFeedbackEnabled: (value: boolean) => void
  setShowStepCounter: (value: boolean) => void
  setShowFontSliders: (value: boolean) => void
  setShowWeatherButton: (value: boolean) => void
  setHideWelcomeModal: (value: boolean) => void
  setShowMeasureTool: (value: boolean) => void
  setShowDrawTool: (value: boolean) => void
  setShowPrintTool: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Defaults
      defaultBackground: 'Esri Licht',
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
      weatherFontScale: 100,    // Default 100%
      voiceFeedbackEnabled: false, // Off by default
      showStepCounter: false, // Hidden by default, can enable in settings
      showFontSliders: false, // Hidden by default (boomer mode off)
      showWeatherButton: false, // Hidden by default, can enable in settings
      hideWelcomeModal: false, // Show welcome modal by default
      showMeasureTool: true,   // Visible by default
      showDrawTool: true,      // Visible by default
      showPrintTool: true,     // Visible by default

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
      setMenuFontScale: (menuFontScale) => set({ menuFontScale }),
      setWeatherFontScale: (weatherFontScale) => set({ weatherFontScale }),
      setVoiceFeedbackEnabled: (voiceFeedbackEnabled) => set({ voiceFeedbackEnabled }),
      setShowStepCounter: (showStepCounter) => set({ showStepCounter }),
      setShowFontSliders: (showFontSliders) => set({ showFontSliders }),
      setShowWeatherButton: (showWeatherButton) => set({ showWeatherButton }),
      setHideWelcomeModal: (hideWelcomeModal) => set({ hideWelcomeModal }),
      setShowMeasureTool: (showMeasureTool) => set({ showMeasureTool }),
      setShowDrawTool: (showDrawTool) => set({ showDrawTool }),
      setShowPrintTool: (showPrintTool) => set({ showPrintTool })
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

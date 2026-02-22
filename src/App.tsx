import './style.css'
import { MapContainer } from './components/Map/MapContainer'
import { GpsButton } from './components/GPS/GpsButton'
import { GpsMarker } from './components/GPS/GpsMarker'
import { LayerControlButton } from './components/LayerControl/LayerControlButton'
import { ThemesPanel } from './components/LayerControl/ThemesPanel'
import { Popup } from './components/Map/Popup'
import { LongPressMenu } from './components/Map/LongPressMenu'
import { PresetButtons } from './components/UI/PresetButtons'
import { CompassButton } from './components/UI/CompassButton'
import { OpacitySliders } from './components/UI/OpacitySliders'
import { SearchBox } from './components/UI/SearchBox'
import { ZoomButtons } from './components/UI/ZoomButtons'
import { SettingsPanel } from './components/UI/SettingsPanel'
import { HamburgerMenu } from './components/UI/HamburgerMenu'
import { InfoButton } from './components/UI/InfoButton'
// HillshadeControls uitgeschakeld - WebGL werkt niet in OL 10.7
import { AddVondstForm } from './components/Vondst/AddVondstForm'
import { AddVondstButton } from './components/Vondst/AddVondstButton'
import { RouteRecordButton, RouteRecordingLayer, SavedRoutesLayer, CoverageHeatmapLayer, GridOverlayLayer, RouteDashboard } from './components/Route'
import { WeatherWidget, RainRadarLayer } from './components/Weather'
import { LocalVondstMarkers } from './components/Vondst/LocalVondstMarkers'
import { CustomLayerMarkers } from './components/CustomLayers'
import { CustomPointMarkers, CreateLayerModal, AddPointModal, LayerManagerModal, LayerDashboard } from './components/CustomPoints'
import { PasswordGate } from './components/Auth/PasswordGate'
import { OfflineIndicator } from './components/UI/OfflineIndicator'
import { MonumentSearch } from './components/UI/MonumentSearch'
import { MonumentFilter } from './components/UI/MonumentFilter'
import { WelcomeModal } from './components/UI/WelcomeModal'
import { ChangelogModal } from './components/UI/ChangelogModal'
import { MeasureTool } from './components/UI/MeasureTool'
import { DrawTool } from './components/UI/DrawTool'
import { PrintTool } from './components/UI/PrintTool'
import { useHeading } from './hooks/useHeading'
import { useDynamicAHN } from './hooks/useDynamicAHN'
import { useCloudSync } from './hooks/useCloudSync'
import { useSettingsStore, useUIStore, useWeatherStore, useGPSStore } from './store'
import { isCommercialMode } from './config/buildMode'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

function App() {
  // Initialize hooks
  useHeading()
  useDynamicAHN()
  useCloudSync() // Sync data to Firebase when logged in

  // Fetch passive position once on app start (shows blue dot)
  const fetchPassivePosition = useGPSStore(state => state.fetchPassivePosition)
  useEffect(() => {
    fetchPassivePosition()
  }, [fetchPassivePosition])

  // Get font scale setting (80-150%)
  const fontScale = useSettingsStore(state => state.fontScale)
  // Base size is 14px, scale it based on setting
  const baseFontSize = 14 * fontScale / 100

  // Vondst form state
  const vondstFormOpen = useUIStore(state => state.vondstFormOpen)
  const vondstFormLocation = useUIStore(state => state.vondstFormLocation)
  const closeVondstForm = useUIStore(state => state.closeVondstForm)

  // Route dashboard state
  const routeDashboardOpen = useUIStore(state => state.routeDashboardOpen)
  const toggleRouteDashboard = useUIStore(state => state.toggleRouteDashboard)

  // Monument search state
  const monumentSearchOpen = useUIStore(state => state.monumentSearchOpen)
  const closeMonumentSearch = useUIStore(state => state.closeMonumentSearch)

  // Rain radar state
  const showBuienradar = useWeatherStore(state => state.showBuienradar)
  const setShowBuienradar = useWeatherStore(state => state.setShowBuienradar)

  // Welcome modal state
  const hideWelcomeModal = useSettingsStore(state => state.hideWelcomeModal)
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(!hideWelcomeModal)

  // Drawing mode - toggle body class for pointer-events on OL overlay
  const isDrawingMode = useUIStore(state => state.isDrawingMode)
  useEffect(() => {
    if (isDrawingMode) {
      document.body.classList.add('drawing-mode')
    } else {
      document.body.classList.remove('drawing-mode')
    }
    return () => {
      document.body.classList.remove('drawing-mode')
    }
  }, [isDrawingMode])

  // Check if we're in commercial mode (hides route, weather, measure, draw)
  const isCommercial = isCommercialMode()

  return (
    <PasswordGate>
      <div style={{ fontSize: `${baseFontSize}px` }}>
        <OfflineIndicator />
        <MapContainer />
        <GpsMarker />
        <LocalVondstMarkers />
        <CustomLayerMarkers />
        <CustomPointMarkers />
        {!isCommercial && (
          <>
            <RouteRecordingLayer />
            <SavedRoutesLayer />
            <CoverageHeatmapLayer />
            <GridOverlayLayer />
          </>
        )}
        <Popup />
        <LongPressMenu />
        <SearchBox />
        <GpsButton />
        <AddVondstButton />
        {!isCommercial && <RouteRecordButton />}
        <ZoomButtons />
        <LayerControlButton />
        <ThemesPanel />
        <OpacitySliders />
        <HamburgerMenu />
        <PresetButtons />
        {!isCommercial && <MeasureTool />}
        {!isCommercial && <DrawTool />}
        <PrintTool />
        <InfoButton />
        <CompassButton />
        {!isCommercial && (
          <>
            <WeatherWidget />
            <RainRadarLayer
              isVisible={showBuienradar}
              onClose={() => setShowBuienradar(false)}
            />
          </>
        )}
        <SettingsPanel />
        <CreateLayerModal />
        <AddPointModal />
        <LayerManagerModal />
        <LayerDashboard />
        {!isCommercial && (
          <RouteDashboard
            isOpen={routeDashboardOpen}
            onClose={toggleRouteDashboard}
          />
        )}
        <AnimatePresence>
          {vondstFormOpen && (
            <AddVondstForm
              onClose={closeVondstForm}
              initialLocation={vondstFormLocation || undefined}
            />
          )}
        </AnimatePresence>
        <MonumentSearch
          isOpen={monumentSearchOpen}
          onClose={closeMonumentSearch}
        />
        <MonumentFilter />
        <WelcomeModal
          isOpen={welcomeModalOpen}
          onClose={() => setWelcomeModalOpen(false)}
        />
        <ChangelogModal />
      </div>
    </PasswordGate>
  )
}

export default App

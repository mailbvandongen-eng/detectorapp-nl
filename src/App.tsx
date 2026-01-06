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
import { AddVondstForm } from './components/Vondst/AddVondstForm'
import { AddVondstButton } from './components/Vondst/AddVondstButton'
import { RouteRecordButton, RouteRecordingLayer, SavedRoutesLayer, CoverageHeatmapLayer, GridOverlayLayer, RouteDashboard } from './components/Route'
import { LocalVondstMarkers } from './components/Vondst/LocalVondstMarkers'
import { CustomLayerMarkers } from './components/CustomLayers'
import { CustomPointMarkers, CreateLayerModal, AddPointModal, LayerManagerModal, LayerDashboard } from './components/CustomPoints'
import { PasswordGate } from './components/Auth/PasswordGate'
import { useHeading } from './hooks/useHeading'
import { useDynamicAHN } from './hooks/useDynamicAHN'
import { useCloudSync } from './hooks/useCloudSync'
import { useSettingsStore, useUIStore } from './store'
import { AnimatePresence } from 'framer-motion'

function App() {
  // Initialize hooks
  useHeading()
  useDynamicAHN()
  useCloudSync() // Sync data to Firebase when logged in

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

  return (
    <PasswordGate>
      <div style={{ fontSize: `${baseFontSize}px` }}>
        <MapContainer />
        <GpsMarker />
        <LocalVondstMarkers />
        <CustomLayerMarkers />
        <CustomPointMarkers />
        <RouteRecordingLayer />
        <SavedRoutesLayer />
        <CoverageHeatmapLayer />
        <GridOverlayLayer />
        <Popup />
        <LongPressMenu />
        <SearchBox />
        <GpsButton />
        <AddVondstButton />
        <RouteRecordButton />
        <ZoomButtons />
        <LayerControlButton />
        <ThemesPanel />
        <OpacitySliders />
        <HamburgerMenu />
        <PresetButtons />
        <InfoButton />
        <CompassButton />
        <SettingsPanel />
        <CreateLayerModal />
        <AddPointModal />
        <LayerManagerModal />
        <LayerDashboard />
        <RouteDashboard
          isOpen={routeDashboardOpen}
          onClose={toggleRouteDashboard}
        />
        <AnimatePresence>
          {vondstFormOpen && (
            <AddVondstForm
              onClose={closeVondstForm}
              initialLocation={vondstFormLocation || undefined}
            />
          )}
        </AnimatePresence>
      </div>
    </PasswordGate>
  )
}

export default App

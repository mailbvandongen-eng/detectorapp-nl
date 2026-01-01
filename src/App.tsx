import './style.css'
import { MapContainer } from './components/Map/MapContainer'
import { GpsButton } from './components/GPS/GpsButton'
import { GpsMarker } from './components/GPS/GpsMarker'
import { LayerControlButton } from './components/LayerControl/LayerControlButton'
import { ThemesPanel } from './components/LayerControl/ThemesPanel'
import { Popup } from './components/Map/Popup'
import { LongPressMenu } from './components/Map/LongPressMenu'
import { BuildLabel } from './components/UI/BuildLabel'
import { PresetButtons } from './components/UI/PresetButtons'
import { InfoButton } from './components/UI/InfoButton'
import { CompassButton } from './components/UI/CompassButton'
import { OpacitySliders } from './components/UI/OpacitySliders'
import { SearchBox } from './components/UI/SearchBox'
import { ZoomButtons } from './components/UI/ZoomButtons'
import { SettingsPanel } from './components/UI/SettingsPanel'
import { RouteLayer } from './components/Navigation/RouteLayer'
import { NavigationBar } from './components/Navigation/NavigationBar'
import { AddVondstButton } from './components/Vondst/AddVondstButton'
import { LocalVondstMarkers } from './components/Vondst/LocalVondstMarkers'
import { CustomLayerMarkers } from './components/CustomLayers'
import { PasswordGate } from './components/Auth/PasswordGate'
import { useHeading } from './hooks/useHeading'
import { useMapRotation } from './hooks/useMapRotation'
import { useNavigation } from './hooks/useNavigation'
import { useDynamicAHN } from './hooks/useDynamicAHN'
import { useSettingsStore } from './store'

function App() {
  // Initialize hooks
  useHeading()
  useMapRotation()
  useNavigation()
  useDynamicAHN()

  // Get font scale setting (80-150%)
  const fontScale = useSettingsStore(state => state.fontScale)
  // Base size is 14px, scale it based on setting
  const baseFontSize = 14 * fontScale / 100

  return (
    <PasswordGate>
      <div style={{ fontSize: `${baseFontSize}px` }}>
        <MapContainer />
        <GpsMarker />
        <RouteLayer />
        <LocalVondstMarkers />
        <CustomLayerMarkers />
        <Popup />
        <LongPressMenu />
        <SearchBox />
        <NavigationBar />
        <GpsButton />
        <ZoomButtons />
        <LayerControlButton />
        <ThemesPanel />
        <OpacitySliders />
        <BuildLabel />
        <PresetButtons />
        <AddVondstButton />
        <InfoButton />
        <CompassButton />
        <SettingsPanel />
      </div>
    </PasswordGate>
  )
}

export default App

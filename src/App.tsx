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
import { OpacitySliders } from './components/UI/OpacitySliders'
import { SearchBox } from './components/UI/SearchBox'
import { ZoomButtons } from './components/UI/ZoomButtons'
import { SettingsPanel } from './components/UI/SettingsPanel'
import { RouteLayer } from './components/Navigation/RouteLayer'
import { NavigationBar } from './components/Navigation/NavigationBar'
import { useDeviceOrientation } from './hooks/useDeviceOrientation'
import { useMapRotation } from './hooks/useMapRotation'
import { useNavigation } from './hooks/useNavigation'
import { useDynamicAHN } from './hooks/useDynamicAHN'

function App() {
  // Initialize hooks
  useDeviceOrientation()
  useMapRotation()
  useNavigation()
  useDynamicAHN()

  return (
    <>
      <MapContainer />
      <GpsMarker />
      <RouteLayer />
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
      <InfoButton />
      <SettingsPanel />
    </>
  )
}

export default App

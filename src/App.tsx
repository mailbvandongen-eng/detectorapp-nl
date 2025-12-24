import './style.css'
import { MapContainer } from './components/Map/MapContainer'
import { GpsButton } from './components/GPS/GpsButton'
import { GpsMarker } from './components/GPS/GpsMarker'
import { LayerControlButton } from './components/LayerControl/LayerControlButton'
import { LayerControlPanel } from './components/LayerControl/LayerControlPanel'
import { Popup } from './components/Map/Popup'
import { LongPressMenu } from './components/Map/LongPressMenu'
import { BuildLabel } from './components/UI/BuildLabel'
import { PresetButtons } from './components/UI/PresetButtons'
import { OpacitySliders } from './components/UI/OpacitySliders'
import { SearchBox } from './components/UI/SearchBox'
import { RouteLayer } from './components/Navigation/RouteLayer'
import { NavigationBar } from './components/Navigation/NavigationBar'
// import { AuthButton } from './components/UI/AuthButton'
// import { AddVondstButton } from './components/Vondst/AddVondstButton'
import { useDeviceOrientation } from './hooks/useDeviceOrientation'
import { useMapRotation } from './hooks/useMapRotation'
import { useNavigation } from './hooks/useNavigation'
// import { useAuth } from './hooks/useAuth'

function App() {
  // Initialize hooks
  useDeviceOrientation()
  useMapRotation()
  useNavigation() // Auto drive mode + step tracking during navigation
  // useAuth() // Initialize Firebase auth listener

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
      <LayerControlButton />
      <LayerControlPanel />
      <OpacitySliders />
      {/* <AddVondstButton /> */}
      {/* <AuthButton /> */}
      <BuildLabel />
      <PresetButtons />
    </>
  )
}

export default App

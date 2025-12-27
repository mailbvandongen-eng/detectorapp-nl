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
import { AddVondstButton } from './components/Vondst/AddVondstButton'
import { LocalVondstMarkers } from './components/Vondst/LocalVondstMarkers'
import { useDeviceOrientation } from './hooks/useDeviceOrientation'
import { useMapRotation } from './hooks/useMapRotation'
import { useNavigation } from './hooks/useNavigation'
import { useDynamicAHN } from './hooks/useDynamicAHN'
import { useSettingsStore } from './store'

// Font size classes
const FONT_SIZE_CLASSES = {
  small: 'text-sm',   // 14px
  medium: 'text-base', // 16px
  large: 'text-lg'    // 18px
} as const

function App() {
  // Initialize hooks
  useDeviceOrientation()
  useMapRotation()
  useNavigation()
  useDynamicAHN()

  // Get font size setting
  const fontSize = useSettingsStore(state => state.fontSize)
  const fontSizeClass = FONT_SIZE_CLASSES[fontSize] || FONT_SIZE_CLASSES.small

  return (
    <div className={fontSizeClass}>
      <MapContainer />
      <GpsMarker />
      <RouteLayer />
      <LocalVondstMarkers />
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
      <SettingsPanel />
    </div>
  )
}

export default App

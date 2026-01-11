import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'

// Wind layer using OpenWeatherMap free tiles
// Shows wind speed as colored overlay
export function createWindLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Wind',
      type: 'tile'
    },
    source: new XYZ({
      // OpenWeatherMap wind speed layer - free tier (1000/day)
      // API key not required for basic tiles
      url: 'https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=9de243494c0b295cca9337e1e96b00e2',
      maxZoom: 19,
      attributions: '&copy; <a href="https://openweathermap.org">OpenWeatherMap</a>'
    }),
    opacity: 0.7,
    visible: true,
    zIndex: 50
  })

  return layer
}

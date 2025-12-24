import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { LAYER_STYLES } from './iconStyles'

// Vici.org - Archaeological Atlas of Antiquity (Roman sites)
// API returns GeoJSON with all markers in the given bounds
// Bounds: NL/BE/DE area (lat1,lon1,lat2,lon2)
const VICI_API_URL = 'https://vici.org/points.php?bounds=49.5,2.5,54.0,8.0&zoom=8'

export async function createViciLayerOL() {
  try {
    const response = await fetch(VICI_API_URL)

    if (!response.ok) {
      throw new Error(`Vici.org API error: ${response.status}`)
    }

    const geojson = await response.json()
    console.log(`📍 Vici.org: loaded ${geojson.features?.length || 0} Roman sites`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    const layer = new VectorLayer({
      source: source,
      properties: { title: 'Vici.org Romeins' },
      visible: false,
      zIndex: 22,
      style: LAYER_STYLES.landmark('#991b1b')  // Dark red for Roman
    })

    return layer
  } catch (error) {
    console.error('❌ Failed to load Vici.org data:', error)
    // Return empty layer on error
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Vici.org Romeins' },
      visible: false
    })
  }
}

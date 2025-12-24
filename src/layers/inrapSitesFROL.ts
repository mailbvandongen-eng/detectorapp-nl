import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { LAYER_STYLES } from './iconStyles'

// INRAP Archaeological Sites France
// Data from data.gouv.fr - 624 excavation sites
// https://www.data.gouv.fr/datasets/localisation-des-sites-de-fouille-archeologiques-de-l-inrap-576210/

export async function createInrapSitesFRLayerOL() {
  try {
    const response = await fetch('/detectorapp-nl/data/inrap_sites_fr.geojson')

    if (!response.ok) {
      throw new Error(`INRAP data fetch error: ${response.status}`)
    }

    const geojson = await response.json()
    console.log(`⛏️ INRAP Sites FR: loaded ${geojson.features?.length || 0} archaeological excavations`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    const layer = new VectorLayer({
      source: source,
      properties: { title: 'INRAP Sites FR' },
      visible: false,
      zIndex: 27,
      style: LAYER_STYLES.landmark('#9333ea')  // Purple for archaeology
    })

    return layer
  } catch (error) {
    console.error('❌ Failed to load INRAP Sites FR:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'INRAP Sites FR' },
      visible: false
    })
  }
}

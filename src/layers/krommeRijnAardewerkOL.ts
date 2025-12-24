/**
 * Kromme Rijn Aardewerk Layer for OpenLayers
 * Pottery finds from the Kromme Rijn area (split from Archis-punten)
 * NO clustering (v3.6.3)
 */

import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { loadGeoJSON, parseGeoJSON } from '../utils/layerLoaderOL.js'
import { LAYER_STYLES } from './iconStyles'

export async function createKrommeRijnAardewerkLayerOL() {
  try {
    const geojson = await loadGeoJSON('/webapp/data/punten_custom.geojson')
    const allFeatures = parseGeoJSON(geojson)

    // Filter ONLY Kromme Rijn aardewerk
    const features = allFeatures.filter(feature => {
      const category = feature.get('category')
      const toelichting = feature.get('toelichting') || ''

      // Include if it's pottery (aardewerk) from Kromme Rijn area
      return (
        category === 'aardewerk' &&
        toelichting.toLowerCase().includes('kromme rijn')
      )
    })

    // Create vector source (NO clustering)
    const vectorSource = new VectorSource({ features })

    const layer = new VectorLayer({
      properties: { title: 'Kromme Rijn Aardewerk', type: 'overlay' },
      source: vectorSource,
      visible: false,
      style: LAYER_STYLES.mapPin('#dc2626'),
      zIndex: 31
    })

    console.log(`✓ Kromme Rijn Aardewerk loaded (${features.length} pottery finds, no clustering)`)
    return layer

  } catch (error) {
    console.error('Failed to load Kromme Rijn Aardewerk layer:', error)
    return null
  }
}

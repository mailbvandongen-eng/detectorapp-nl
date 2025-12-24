/**
 * Toestemmingen Layer for OpenLayers
 * Permission markers with green stars
 */

import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { loadGeoJSON, parseGeoJSON } from '../utils/layerLoaderOL.js'
import { LAYER_STYLES } from './iconStyles'

export async function createToestemmingenLayerOL() {
  try {
    const geojson = await loadGeoJSON('/detectorapp-nl/data/toestemmingen_custom.geojson')
    const features = parseGeoJSON(geojson)

    const layer = new VectorLayer({
      properties: { title: 'Toestemmingen' },
      source: new VectorSource({ features }),
      style: LAYER_STYLES.permission(),
      zIndex: 40
    })

    console.log(`✓ Toestemmingen loaded (${features.length} points)`)
    return layer

  } catch (error) {
    console.error('Failed to load Toestemmingen layer:', error)
    return null
  }
}

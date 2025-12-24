/**
 * AMK Monumenten Layer for OpenLayers
 * RCE Archeologische Monumentenkaart with 4 value levels
 */

import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Fill, Stroke } from 'ol/style'
import { loadTopoJSON, parseGeoJSON } from '../utils/layerLoaderOL.js'

// AMK color scheme (RCE official colors)
const AMK_COLORS = {
  'Terrein van archeologische waarde': '#c4b5fd',
  'Terrein van hoge archeologische waarde': '#8b5cf6',
  'Terrein van zeer hoge archeologische waarde': '#6d28d9',
  'Terrein van zeer hoge archeologische waarde, beschermd': '#4c1d95'
}

export async function createAMKLayerOL() {
  try {
    const geojson = await loadTopoJSON('/detectorapp-nl/data/amk_monumenten.topojson')
    const features = parseGeoJSON(geojson)

    const layer = new VectorLayer({
      title: 'AMK Monumenten',
      source: new VectorSource({ features }),
      style: (feature) => {
        const waarde = (feature.get('WAARDE') || '').trim()
        const color = AMK_COLORS[waarde] || '#ddd'

        return new Style({
          fill: new Fill({ color: color }),
          stroke: new Stroke({ color: color, width: 1.1 })
        })
      },
      opacity: 0.45,
      zIndex: 10
    })

    console.log(`✓ AMK Monumenten loaded (${features.length} features)`)
    return layer

  } catch (error) {
    console.error('Failed to load AMK layer:', error)
    return null
  }
}

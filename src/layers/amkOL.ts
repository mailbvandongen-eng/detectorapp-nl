/**
 * AMK Monumenten Layer for OpenLayers
 * RCE Archeologische Monumentenkaart with full local data (13,010 monumenten)
 * Data includes: toponiem, kwaliteitswaarde, txt_label, omschrijving
 */

import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Fill, Stroke } from 'ol/style'
import { loadTopoJSON, parseGeoJSON } from '../utils/layerLoaderOL.js'

// AMK color scheme (RCE official colors)
// New data uses shortened values without "Terrein van" prefix
const AMK_COLORS: Record<string, string> = {
  'archeologische waarde': '#c4b5fd',
  'hoge archeologische waarde': '#8b5cf6',
  'zeer hoge archeologische waarde': '#6d28d9'
}

export async function createAMKLayerOL() {
  try {
    // Full dataset with all properties (toponiem, omschrijving, etc.)
    const geojson = await loadTopoJSON('/detectorapp-nl/data/amk_monumenten_full.topojson')
    const features = parseGeoJSON(geojson)

    const layer = new VectorLayer({
      title: 'AMK Monumenten',
      source: new VectorSource({ features }),
      style: (feature) => {
        const waarde = (feature.get('kwaliteitswaarde') || '').trim()
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

/**
 * Romeinse wegen Layer for OpenLayers
 * Itiner-E Roman road network dataset
 * Zoom-responsive line width
 */

import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Stroke } from 'ol/style'
import { loadGeoJSON, parseGeoJSON } from '../utils/layerLoaderOL.js'

// Cache styles per resolution to avoid recreating
const styleCache = new Map<string, Style>()

function getLineWidth(resolution: number): number {
  // Thinner when zoomed out, thicker when zoomed in
  if (resolution > 300) return 0.5    // Very zoomed out
  if (resolution > 150) return 0.75   // Zoomed out
  if (resolution > 75) return 1       // Medium-far
  if (resolution > 40) return 1.5     // Medium
  if (resolution > 20) return 2       // Medium-close
  if (resolution > 10) return 2.5     // Close
  return 3                            // Very close
}

export async function createRomeinseWegenLayerOL() {
  try {
    const geojson = await loadGeoJSON('/detectorapp-nl/data/romeinse_wegen_itiner_e.geojson')
    const features = parseGeoJSON(geojson)

    const layer = new VectorLayer({
      properties: { title: 'Romeinse wegen (Itiner-E)' },
      source: new VectorSource({ features }),
      style: (feature, resolution) => {
        const width = getLineWidth(resolution)
        const cacheKey = `roman-${width}`

        let style = styleCache.get(cacheKey)
        if (!style) {
          style = new Style({
            stroke: new Stroke({
              color: '#dc2626',
              width: width
            })
          })
          styleCache.set(cacheKey, style)
        }
        return style
      },
      opacity: 0.8,
      zIndex: 20
    })

    console.log(`✓ Romeinse wegen loaded (${features.length} features)`)
    return layer

  } catch (error) {
    console.error('Failed to load Romeinse wegen layer:', error)
    return null
  }
}

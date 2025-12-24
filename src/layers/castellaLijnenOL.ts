/**
 * Castella lijnen Layer for OpenLayers
 * Roman defensive lines - Zoom-responsive width
 */

import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Stroke } from 'ol/style'

// Cache styles per resolution
const styleCache = new Map<string, Style>()

function getLineWidth(resolution: number): number {
  if (resolution > 300) return 0.5
  if (resolution > 150) return 0.75
  if (resolution > 75) return 1
  if (resolution > 40) return 1.5
  if (resolution > 20) return 2
  if (resolution > 10) return 2.5
  return 3
}

export async function createCastellaLijnenLayerOL() {
  const response = await fetch('/detectorapp-nl/data/rom_def_lines.geojson')
  const geojson = await response.json()

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      featureProjection: 'EPSG:3857'
    })
  })

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Castella (lijnen)' },
    visible: false,
    style: (feature, resolution) => {
      const width = getLineWidth(resolution)
      const cacheKey = `castella-${width}`

      let style = styleCache.get(cacheKey)
      if (!style) {
        style = new Style({
          stroke: new Stroke({
            color: '#2b6cb0',
            width: width,
            lineDash: [8, 4]
          })
        })
        styleCache.set(cacheKey, style)
      }
      return style
    }
  })

  return layer
}

import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Fill, Stroke, Text } from 'ol/style'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import { loadGeoJSON } from '../utils/layerLoaderOL.js'

// Register Dutch RD projection (EPSG:28992)
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')
register(proj4)

// Kleuren per rivier
const RIVIER_COLORS: Record<string, string> = {
  'Maas': '#3b82f6',      // Blue
  'Waal': '#10b981',      // Green
  'Rijn': '#8b5cf6',      // Purple
  'IJssel': '#f59e0b',    // Amber
  'Lek': '#ef4444',       // Red
  'Nederrijn': '#ec4899', // Pink
}

function getZoomFromResolution(resolution: number) {
  return Math.round(Math.log2(156543.03392804097 / resolution))
}

/**
 * UIKAV Uiterwaarden Indeling
 * Indeling van uiterwaarden per rivier
 */
export async function createUIKAVUiterwaardenLayerOL() {
  const geojson = await loadGeoJSON('/detectorapp-nl/data/uikav/uikav_uiterwaarden_indeling.geojson')

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      dataProjection: 'EPSG:28992',
      featureProjection: 'EPSG:3857'
    })
  })

  console.log(`✓ UIKAV Uiterwaarden Indeling loaded (${source.getFeatures().length} areas)`)

  const layer = new VectorLayer({
    source: source,
    title: 'UIKAV Uiterwaarden',
    visible: false,
    style: (feature, resolution) => {
      const rivier = feature.get('rivier') || ''
      const naam = feature.get('Uiterwaard') || ''
      const zoom = getZoomFromResolution(resolution)

      const baseColor = RIVIER_COLORS[rivier] || '#6b7280'

      return new Style({
        fill: new Fill({ color: baseColor + '20' }), // 12% opacity
        stroke: new Stroke({ color: baseColor, width: 1.5 }),
        text: zoom >= 12 ? new Text({
          text: naam,
          font: '11px sans-serif',
          fill: new Fill({ color: baseColor }),
          stroke: new Stroke({ color: 'white', width: 2 })
        }) : undefined
      })
    },
    zIndex: 8
  })

  return layer
}

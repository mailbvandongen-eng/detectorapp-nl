import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import { loadGeoJSON } from '../utils/layerLoaderOL.js'
import { LAYER_STYLES } from './iconStyles'

// Register Dutch RD projection (EPSG:28992)
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')
register(proj4)

/**
 * Speeltuinen en Parken
 * Bron: OpenStreetMap via Esri Nederland
 * 7.305 locaties in Nederland
 */
export async function createSpeeltuinenLayerOL() {
  const geojson = await loadGeoJSON('/detectorapp-nl/data/speeltuinen.geojson')

  const allFeatures = new GeoJSON().readFeatures(geojson, {
    dataProjection: 'EPSG:28992',
    featureProjection: 'EPSG:3857'
  })

  // Filter to only include playgrounds, not parks
  const playgroundFeatures = allFeatures.filter(f => f.get('leisure') === 'playground')

  const source = new VectorSource({
    features: playgroundFeatures
  })

  console.log(`✓ Speeltuinen loaded (${source.getFeatures().length} playgrounds)`)

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Speeltuinen', type: 'overlay' },
    visible: false,
    style: LAYER_STYLES.playground(),
    zIndex: 25
  })

  return layer
}

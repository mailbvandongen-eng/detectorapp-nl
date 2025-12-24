import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { loadGeoJSON } from '../utils/layerLoaderOL.js'
import { LAYER_STYLES } from './iconStyles'

/**
 * Kringloopwinkels in Nederland
 * Bron: OpenStreetMap
 * 1.048 locaties
 */
export async function createKringloopwinkelsLayerOL() {
  const geojson = await loadGeoJSON('/webapp/data/kringloopwinkels.geojson')

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  })

  console.log(`✓ Kringloopwinkels loaded (${source.getFeatures().length} locations)`)

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Kringloopwinkels', type: 'overlay' },
    visible: false,
    style: LAYER_STYLES.recycle(),
    zIndex: 28
  })

  return layer
}

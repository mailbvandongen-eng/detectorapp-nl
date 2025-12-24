import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { LAYER_STYLES } from './iconStyles'

export async function createEuroevolLayerOL() {
  const response = await fetch('/webapp/data/steentijd/euroevol_nl_be.geojson')
  const geojson = await response.json()

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  })

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'EUROEVOL Sites' },
    visible: false,
    zIndex: 24,
    style: LAYER_STYLES.neolithic()
  })

  return layer
}

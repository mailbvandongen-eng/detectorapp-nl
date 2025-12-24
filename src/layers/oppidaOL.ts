import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { LAYER_STYLES } from './iconStyles'

export async function createOppidaLayerOL() {
  const response = await fetch('/detectorapp-nl/data/oppida.geojson')
  const geojson = await response.json()

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      featureProjection: 'EPSG:3857'
    })
  })

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Oppida (IJzertijd)' },
    visible: false,
    style: LAYER_STYLES.landmark('#f97316')
  })

  return layer
}

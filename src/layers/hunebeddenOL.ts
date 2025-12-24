import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { LAYER_STYLES } from './iconStyles'

export async function createHunebeddenLayerOL() {
  const response = await fetch('/webapp/data/steentijd/hunebedden.geojson')
  const geojson = await response.json()

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  })

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Hunebedden' },
    visible: false,
    zIndex: 25,
    style: LAYER_STYLES.hunebed()
  })

  return layer
}

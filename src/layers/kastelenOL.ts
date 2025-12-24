import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { LAYER_STYLES } from './iconStyles'

export async function createKastelenLayerOL() {
  const response = await fetch('/detectorapp-nl/data/kastelen_osm.geojson')
  const geojson = await response.json()

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  })

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Kastelen' },
    visible: false,
    zIndex: 20,
    style: LAYER_STYLES.castle()
  })

  return layer
}

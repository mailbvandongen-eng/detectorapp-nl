import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { LAYER_STYLES } from './iconStyles'

export async function createRuinesLayerOL() {
  const response = await fetch('/detectorapp-nl/data/ruines_osm.geojson')
  const geojson = await response.json()

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  })

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Ruïnes' },
    visible: false,
    zIndex: 20,
    style: LAYER_STYLES.ruins()
  })

  return layer
}

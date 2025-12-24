import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { LAYER_STYLES } from './iconStyles'

export async function createFrankrijkMonumentenLayerOL() {
  const response = await fetch('/webapp/data/monuments_fr.geojson')
  const geojson = await response.json()

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  })

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Hist. Gebouwen FR' },
    visible: false,
    zIndex: 18,
    style: LAYER_STYLES.landmark('#dc2626')  // Red for France
  })

  return layer
}

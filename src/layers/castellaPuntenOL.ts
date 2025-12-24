import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { LAYER_STYLES } from './iconStyles'

export async function createCastellaPuntenLayerOL() {
  const response = await fetch('/detectorapp-nl/data/rom_def_points.geojson')
  const geojson = await response.json()

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      featureProjection: 'EPSG:3857'
    })
  })

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Castella (punten)' },
    visible: false,
    style: LAYER_STYLES.landmark('#2b6cb0')
  })

  return layer
}

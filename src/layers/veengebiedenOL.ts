import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Fill, Stroke } from 'ol/style'

export async function createVeengebiedenLayerOL() {
  const response = await fetch('/webapp/data/veengebieden_toemaakdekken.geojson')
  const geojson = await response.json()

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      featureProjection: 'EPSG:3857'
    })
  })

  const layer = new VectorLayer({
    source: source,
    title: 'Veengebieden/Toemaakdekken',
    visible: false,
    style: new Style({
      fill: new Fill({ color: 'rgba(139, 69, 19, 0.15)' }),
      stroke: new Stroke({ color: '#8B4513', width: 1 })
    })
  })

  return layer
}

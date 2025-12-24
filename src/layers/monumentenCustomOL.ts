import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Fill, Stroke, Text } from 'ol/style'

function getZoomFromResolution(resolution) {
  return Math.round(Math.log2(156543.03392804097 / resolution))
}

export async function createMonumentenCustomLayerOL() {
  const response = await fetch('/webapp/data/monumenten_custom.geojson')
  const geojson = await response.json()

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      featureProjection: 'EPSG:3857'
    })
  })

  const layer = new VectorLayer({
    source: source,
    title: 'Monumenten (eigen)',
    visible: false,
    style: (feature, resolution) => {
      const zoom = getZoomFromResolution(resolution)

      return new Style({
        fill: new Fill({ color: 'rgba(196, 181, 253, 0.3)' }),
        stroke: new Stroke({ color: '#9333ea', width: 2 }),
        text: zoom >= 14 ? new Text({
          text: feature.get('name') || '',
          font: '12px sans-serif',
          fill: new Fill({ color: '#4c1d95' }),
          stroke: new Stroke({ color: 'white', width: 2 }),
          offsetY: -15
        }) : undefined
      })
    }
  })

  return layer
}

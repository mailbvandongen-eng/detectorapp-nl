import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'

export function createCAIVlaanderenLayerOL() {
  // CAI Vlaanderen - Archaeological elements from Belgian inventory
  // Using static GeoJSON because the WFS server lacks CORS headers
  const source = new VectorSource({
    format: new GeoJSON(),
    url: '/webapp/data/cai_vlaanderen.geojson'
  })

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'CAI Vlaanderen', type: 'overlay' },
    visible: false,
    style: new Style({
      // Polygon/MultiPolygon styling
      fill: new Fill({ color: 'rgba(255, 107, 53, 0.3)' }), // Orange semi-transparent
      stroke: new Stroke({ color: '#ff6b35', width: 2 }),
      // Point styling (fallback)
      image: new CircleStyle({
        radius: 5,
        fill: new Fill({ color: '#ff6b35' }),
        stroke: new Stroke({ color: 'white', width: 1 })
      })
    })
  })

  return layer
}

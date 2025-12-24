import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Fill, Stroke } from 'ol/style'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import { loadGeoJSON } from '../utils/layerLoaderOL.js'

// Register Dutch RD projection (EPSG:28992)
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')
register(proj4)

/**
 * Parken in Nederland (polygonen)
 * Bron: OpenStreetMap via Esri Nederland
 * 4.665 locaties
 */
export async function createParkenLayerOL() {
  const geojson = await loadGeoJSON('/webapp/data/parken.geojson')

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      dataProjection: 'EPSG:28992',
      featureProjection: 'EPSG:3857'
    })
  })

  console.log(`✓ Parken loaded (${source.getFeatures().length} polygons)`)

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Parken', type: 'overlay' },
    visible: false,
    style: new Style({
      fill: new Fill({ color: 'rgba(34, 197, 94, 0.3)' }), // Green with transparency
      stroke: new Stroke({ color: '#16a34a', width: 1.5 })
    }),
    zIndex: 10 // Below point layers
  })

  return layer
}

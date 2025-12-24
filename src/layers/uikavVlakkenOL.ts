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
 * UIKAV Archeologische Vlakken
 * Polygonen met archeologische gebieden uit de Uiterwaarden Inventarisatie
 */
export async function createUIKAVVlakkenLayerOL() {
  const geojson = await loadGeoJSON('/webapp/data/uikav/uikav_archeo_vlakken.geojson')

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      dataProjection: 'EPSG:28992',
      featureProjection: 'EPSG:3857'
    })
  })

  console.log(`✓ UIKAV Archeo Vlakken loaded (${source.getFeatures().length} polygons)`)

  const layer = new VectorLayer({
    source: source,
    title: 'UIKAV Archeo Vlakken',
    visible: false,
    style: (feature) => {
      const aardVindp = feature.get('Aard_vindp') || ''

      // Kleuren op basis van aard vindplaats
      let fillColor = 'rgba(147, 51, 234, 0.25)' // Default purple
      let strokeColor = '#9333ea'

      if (aardVindp === 'VSTER') {
        fillColor = 'rgba(220, 38, 38, 0.3)' // Rood voor versterking
        strokeColor = '#dc2626'
      } else if (aardVindp.includes('KAST')) {
        fillColor = 'rgba(234, 88, 12, 0.3)' // Oranje voor kasteel
        strokeColor = '#ea580c'
      }

      return new Style({
        fill: new Fill({ color: fillColor }),
        stroke: new Stroke({ color: strokeColor, width: 2 })
      })
    },
    zIndex: 15
  })

  return layer
}

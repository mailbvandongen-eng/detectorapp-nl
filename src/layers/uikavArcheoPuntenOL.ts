import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import { loadGeoJSON } from '../utils/layerLoaderOL.js'
import { createDynamicIconStyle } from './iconStyles'

// Register Dutch RD projection (EPSG:28992)
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')
register(proj4)

/**
 * UIKAV Archeologische Waarnemingen
 * 1575 archeologische punten uit Uiterwaarden Inventarisatie
 * Met periode info (IJzertijd-Romeins, Middeleeuwen, etc.)
 */
export async function createUIKAVArcheoPuntenLayerOL() {
  const geojson = await loadGeoJSON('/detectorapp-nl/data/uikav/uikav_archeo_punten.geojson')

  const source = new VectorSource({
    features: new GeoJSON().readFeatures(geojson, {
      dataProjection: 'EPSG:28992',
      featureProjection: 'EPSG:3857'
    })
  })

  console.log(`✓ UIKAV Archeo Punten loaded (${source.getFeatures().length} points)`)

  // Styling per periode-type
  const layer = new VectorLayer({
    source: source,
    properties: { title: 'UIKAV Archeologische Waarnemingen' },
    visible: false,
    style: createDynamicIconStyle('pickaxe', (feature) => {
      const beginPer = feature.get('BEGIN_PER') || ''

      // Kleur bepalen op basis van periode
      if (beginPer.includes('ROM')) {
        return '#dc2626' // Romeins = red
      } else if (beginPer.includes('MED') || beginPer.includes('ME')) {
        return '#ea580c' // Middeleeuwen = orange
      } else if (beginPer.includes('BRONS')) {
        return '#ca8a04' // Bronstijd = yellow-brown
      } else if (beginPer.includes('IJZ')) {
        return '#7c3aed' // IJzertijd = purple
      } else if (beginPer.includes('NEO')) {
        return '#16a34a' // Neolithicum = green
      }
      return '#9333ea' // Default purple
    })
  })

  return layer
}

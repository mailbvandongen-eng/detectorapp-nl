import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Fill, Stroke } from 'ol/style'

// Normandie Heritage Sites (Sites Classés & Sites Inscrits)
// Data from DREAL Normandie via data.gouv.fr
// 623 protected heritage sites (376 Classés + 247 Inscrits)

export async function createNormandiePatrimoineLayerOL() {
  try {
    const response = await fetch('/webapp/data/sites_patrimoine_normandie.geojson')

    if (!response.ok) {
      throw new Error(`Normandie patrimoine fetch error: ${response.status}`)
    }

    const geojson = await response.json()
    console.log(`🏛️ Normandie Patrimoine: loaded ${geojson.features?.length || 0} heritage sites`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    const layer = new VectorLayer({
      source: source,
      properties: { title: 'Sites Patrimoine Normandie' },
      visible: false,
      zIndex: 29,
      style: (feature) => {
        const type = feature.get('type_protection')
        // Classé = red (highest protection), Inscrit = orange
        const color = type === 'Classé' ? 'rgba(220, 38, 38, 0.4)' : 'rgba(245, 158, 11, 0.4)'
        const strokeColor = type === 'Classé' ? '#dc2626' : '#f59e0b'

        return new Style({
          fill: new Fill({ color }),
          stroke: new Stroke({ color: strokeColor, width: 2 })
        })
      }
    })

    return layer
  } catch (error) {
    console.error('❌ Failed to load Normandie Patrimoine:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Sites Patrimoine Normandie' },
      visible: false
    })
  }
}

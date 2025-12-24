import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Fill, Stroke } from 'ol/style'

// Occitanie Heritage Sites (Sites Classés & Sites Inscrits)
// Data from PICTO Occitanie WFS - DREAL Occitanie
// 1,348 protected heritage sites (295 Classés + 1,053 Inscrits)

export async function createOccitaniePatrimoineLayerOL() {
  try {
    const response = await fetch('/detectorapp-nl/data/sites_patrimoine_occitanie.geojson')

    if (!response.ok) {
      throw new Error(`Occitanie patrimoine fetch error: ${response.status}`)
    }

    const geojson = await response.json()
    console.log(`🏛️ Occitanie Patrimoine: loaded ${geojson.features?.length || 0} heritage sites`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    const layer = new VectorLayer({
      source: source,
      properties: { title: 'Sites Patrimoine Occitanie' },
      visible: false,
      zIndex: 26,
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
    console.error('❌ Failed to load Occitanie Patrimoine:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Sites Patrimoine Occitanie' },
      visible: false
    })
  }
}

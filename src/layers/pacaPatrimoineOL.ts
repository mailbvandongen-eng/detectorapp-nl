import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Fill, Stroke } from 'ol/style'

// PACA Heritage Sites (Sites Classés & Sites Inscrits)
// Data from DREAL PACA via geo-ide.developpement-durable.gouv.fr
// 549 protected heritage sites (219 Classés + 330 Inscrits)

export async function createPacaPatrimoineLayerOL() {
  try {
    const response = await fetch('/detectorapp-nl/data/sites_patrimoine_paca.geojson')

    if (!response.ok) {
      throw new Error(`PACA patrimoine fetch error: ${response.status}`)
    }

    const geojson = await response.json()
    console.log(`🏛️ PACA Patrimoine: loaded ${geojson.features?.length || 0} heritage sites`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    const layer = new VectorLayer({
      source: source,
      properties: { title: 'Sites Patrimoine PACA' },
      visible: false,
      zIndex: 27,
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
    console.error('❌ Failed to load PACA Patrimoine:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Sites Patrimoine PACA' },
      visible: false
    })
  }
}

import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'

// Paris Archaeological Reference (Référentiel Archéologique de Paris)
// Data from Paris Open Data - INRAP/DRAC/CNRS R&CAP project
// 1,811 archaeological operations in Paris

export async function createParisArcheoLayerOL() {
  try {
    const response = await fetch('/webapp/data/paris_archeo_fr.geojson')

    if (!response.ok) {
      throw new Error(`Paris archeo fetch error: ${response.status}`)
    }

    const geojson = await response.json()
    console.log(`🗼 Paris Archeo: loaded ${geojson.features?.length || 0} archaeological operations`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    const layer = new VectorLayer({
      source: source,
      properties: { title: 'Archeo Parijs' },
      visible: false,
      zIndex: 29,
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: '#dc2626' }),  // Red for Paris
          stroke: new Stroke({ color: 'white', width: 1 })
        })
      })
    })

    return layer
  } catch (error) {
    console.error('❌ Failed to load Paris Archeo:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Archeo Parijs' },
      visible: false
    })
  }
}

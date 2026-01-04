import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { LAYER_STYLES } from './iconStyles'

// Slagvelden (Battlefields) from OpenStreetMap
// Includes historic battles and WWII locations like Arnhem, Overloon, Sloedam

export async function createSlagveldenLayerOL(): Promise<VectorLayer<VectorSource>> {
  try {
    const response = await fetch('/detectorapp-nl/data/military/slagvelden.geojson')
    if (!response.ok) throw new Error('Failed to load slagvelden data')

    const geojson = await response.json()

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    const layer = new VectorLayer({
      source,
      properties: { title: 'Slagvelden' },
      visible: false,
      zIndex: 35,
      style: LAYER_STYLES.slagveld()
    })

    console.log(`⚔️ Slagvelden loaded (${geojson.features.length} locations)`)
    return layer
  } catch (error) {
    console.error('Failed to load slagvelden:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Slagvelden' },
      visible: false,
      zIndex: 35
    })
  }
}

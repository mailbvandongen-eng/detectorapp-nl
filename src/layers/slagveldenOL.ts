import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Icon } from 'ol/style'

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
      style: new Style({
        image: new Icon({
          src: 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="11" fill="#dc2626" stroke="white" stroke-width="2"/>
              <path d="M12 6l2 4h4l-3 3 1 5-4-2-4 2 1-5-3-3h4z" fill="white"/>
            </svg>
          `),
          scale: 1,
          anchor: [0.5, 0.5]
        })
      })
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

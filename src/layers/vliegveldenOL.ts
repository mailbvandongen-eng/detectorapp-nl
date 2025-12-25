import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Icon } from 'ol/style'

// Militaire Vliegvelden (Military Airfields) from OpenStreetMap
// Includes active and historic military air bases

export async function createVliegveldenLayerOL(): Promise<VectorLayer<VectorSource>> {
  try {
    const response = await fetch('/detectorapp-nl/data/military/vliegvelden.geojson')
    if (!response.ok) throw new Error('Failed to load vliegvelden data')

    const geojson = await response.json()

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    const layer = new VectorLayer({
      source,
      properties: { title: 'Militaire Vliegvelden' },
      visible: false,
      zIndex: 34,
      style: new Style({
        image: new Icon({
          src: 'data:image/svg+xml,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="11" fill="#0369a1" stroke="white" stroke-width="2"/>
              <path d="M12 4l-1 5H5l2 3-2 3h6l1 5 1-5h6l-2-3 2-3h-6z" fill="white"/>
            </svg>
          `),
          scale: 1,
          anchor: [0.5, 0.5]
        })
      })
    })

    console.log(`✈️ Militaire Vliegvelden loaded (${geojson.features.length} locations)`)
    return layer
  } catch (error) {
    console.error('Failed to load vliegvelden:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Militaire Vliegvelden' },
      visible: false,
      zIndex: 34
    })
  }
}

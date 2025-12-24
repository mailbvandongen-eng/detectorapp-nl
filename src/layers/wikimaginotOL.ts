import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Circle, Fill, Stroke } from 'ol/style'

// Wikimaginot - Maginot Line Fortifications
// Data from DataGrandEst WFS - wikimaginot.eu
// 16,371 military constructions (1925-1940)

export async function createWikimaginotLayerOL() {
  try {
    const response = await fetch('/detectorapp-nl/data/wikimaginot_fr.geojson')

    if (!response.ok) {
      throw new Error(`Wikimaginot fetch error: ${response.status}`)
    }

    const geojson = await response.json()
    console.log(`🏰 Wikimaginot: loaded ${geojson.features?.length || 0} Maginot Line constructions`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    const layer = new VectorLayer({
      source: source,
      properties: { title: 'Maginotlinie' },
      visible: false,
      zIndex: 28,
      style: (feature) => {
        const style = feature.get('style') || ''

        // Color by construction type
        let color = '#6b7280' // gray default
        if (style.includes('gros_ouvrage')) color = '#dc2626' // red - major fortification
        else if (style.includes('petit_ouvrage')) color = '#ea580c' // orange - small fortification
        else if (style.includes('casemate')) color = '#ca8a04' // yellow - bunker
        else if (style.includes('blockhaus')) color = '#65a30d' // green - blockhouse
        else if (style.includes('abri')) color = '#0891b2' // cyan - shelter
        else if (style.includes('observatoire')) color = '#7c3aed' // purple - observation post

        return new Style({
          image: new Circle({
            radius: 5,
            fill: new Fill({ color }),
            stroke: new Stroke({ color: '#1f2937', width: 1 })
          })
        })
      }
    })

    return layer
  } catch (error) {
    console.error('❌ Failed to load Wikimaginot:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Maginotlinie' },
      visible: false
    })
  }
}

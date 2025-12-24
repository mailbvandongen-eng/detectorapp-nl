import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'

// Bretagne Archaeological Sites (Carte Archéologique Nationale)
// Data from GéoBretagne WFS - DRAC Bretagne
// 23,683 archaeological sites from prehistory to medieval period

export async function createArcheoBretagneLayerOL() {
  try {
    const response = await fetch('/webapp/data/archeo_bretagne_fr.geojson')

    if (!response.ok) {
      throw new Error(`Bretagne archeo fetch error: ${response.status}`)
    }

    const geojson = await response.json()
    console.log(`🏛️ Archeo Bretagne: loaded ${geojson.features?.length || 0} archaeological sites`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    const layer = new VectorLayer({
      source: source,
      properties: { title: 'Archeo Sites Bretagne' },
      visible: false,
      zIndex: 28,
      style: new Style({
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: '#7c3aed' }),  // Purple for archaeology
          stroke: new Stroke({ color: 'white', width: 1 })
        })
      })
    })

    return layer
  } catch (error) {
    console.error('❌ Failed to load Archeo Bretagne:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Archeo Sites Bretagne' },
      visible: false
    })
  }
}

// Popup content generator for Bretagne archaeological sites
export function getArcheoBretagnePopupContent(properties: Record<string, unknown>): string {
  const nom = properties.nom || 'Onbekend'
  const nature = properties.nature || ''
  const debut = properties.debut || ''
  const fin = properties.fin || ''
  const commune = properties.commune || ''
  const decouvert = properties.decouvert || ''
  const structure = properties.structure || ''
  const numero = properties.numero || ''

  // Format period
  let periode = ''
  if (debut && fin && debut !== fin) {
    periode = `${debut} - ${fin}`
  } else if (debut) {
    periode = debut as string
  }

  return `
    <div class="popup-content">
      <h3 class="font-semibold text-purple-800">${nom}</h3>
      ${nature ? `<p class="text-sm"><strong>Type:</strong> ${nature}</p>` : ''}
      ${periode ? `<p class="text-sm"><strong>Periode:</strong> ${periode}</p>` : ''}
      ${structure ? `<p class="text-sm"><strong>Structuur:</strong> ${structure}</p>` : ''}
      ${commune ? `<p class="text-sm text-gray-600">${commune}</p>` : ''}
      ${decouvert ? `<p class="text-xs text-gray-500">Ontdekt: ${decouvert}</p>` : ''}
      ${numero ? `<p class="text-xs text-gray-400">${numero}</p>` : ''}
    </div>
  `
}

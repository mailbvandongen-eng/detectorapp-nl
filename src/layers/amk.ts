/**
 * AMK Monumenten Layer
 * RCE Archeologische Monumentenkaart with 4 value levels
 */

import L from 'leaflet'
import { loadTopoJSON, createGeoJSONLayer } from '../utils/layerLoader.js'

// AMK color scheme (RCE official colors)
const AMK_COLORS = {
  'Terrein van archeologische waarde': '#c4b5fd',
  'Terrein van hoge archeologische waarde': '#8b5cf6',
  'Terrein van zeer hoge archeologische waarde': '#6d28d9',
  'Terrein van zeer hoge archeologische waarde, beschermd': '#4c1d95'
}

export async function createAMKLayer() {
  try {
    const geojson = await loadTopoJSON('/detectorapp-nl/data/amk_monumenten.topojson')

    return createGeoJSONLayer(geojson, {
      style: (feature) => {
        const waarde = (feature.properties?.WAARDE || '').trim()
        const color = AMK_COLORS[waarde] || '#ddd'

        return {
          fillColor: color,
          fillOpacity: 0.45,
          color: color,
          weight: 1.1,
          opacity: 0.8
        }
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties
        const waarde = (props?.WAARDE || '').trim()
        const popup = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #4c1d95;">AMK Monument</h3>
            <p><strong>Waarde:</strong> ${waarde || 'Onbekend'}</p>
            <p><strong>Naam:</strong> ${props?.NAAM || 'Geen naam'}</p>
            ${props?.GEMEENTE ? `<p><strong>Gemeente:</strong> ${props.GEMEENTE}</p>` : ''}
          </div>
        `
        layer.bindPopup(popup)
      }
    })
  } catch (error) {
    console.error('Failed to load AMK layer:', error)
    return null
  }
}

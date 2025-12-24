/**
 * Romeinse wegen layer (Itiner-E)
 * Global Roman road network dataset
 */

import L from 'leaflet'
import { loadGeoJSON, createGeoJSONLayer } from '../utils/layerLoader.js'

export async function createRomeinseWegenLayer() {
  try {
    const geojson = await loadGeoJSON('/detectorapp-nl/data/romeinse_wegen_itiner_e.geojson')

    return createGeoJSONLayer(geojson, {
      style: {
        color: '#dc2626',
        weight: 2,
        opacity: 0.7
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties
        const popup = `
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #dc2626;">Romeinse Weg</h3>
            ${props.name ? `<p><strong>Naam:</strong> ${props.name}</p>` : ''}
            ${props.type ? `<p><strong>Type:</strong> ${props.type}</p>` : ''}
            <p style="font-size: 11px; color: #666; margin-top: 8px;">Bron: Itiner-E</p>
          </div>
        `
        layer.bindPopup(popup)
      }
    })
  } catch (error) {
    console.error('Failed to load Romeinse wegen layer:', error)
    return null
  }
}

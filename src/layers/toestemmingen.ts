/**
 * Toestemmingen Layer
 * Permission markers with green stars
 */

import L from 'leaflet'
import { loadGeoJSON } from '../utils/layerLoader.js'

function createToestemmingIcon(zoom) {
  const size = Math.max(12, Math.min(22, zoom * 1.2))

  return L.divIcon({
    html: `<div style="font-size: ${size}px; color: #22c55e; line-height: 1;">★</div>`,
    className: 'toestemmings-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

export async function createToestemmingenLayer(map) {
  try {
    const geojson = await loadGeoJSON('/webapp/data/toestemmingen_custom.geojson')

    console.log(`📊 Loaded ${geojson.features.length} toestemmingen`)

    const layerGroup = L.layerGroup()
    const markers = []

    // Create markers
    geojson.features.forEach(feature => {
      const [lng, lat] = feature.geometry.coordinates
      const props = feature.properties

      const marker = L.marker([lat, lng], {
        icon: createToestemmingIcon(map.getZoom())
      })

      // Create popup
      let popup = '<div style="min-width: 200px;">'
      popup += '<h3 style="margin: 0 0 8px 0; color: #22c55e;">Toestemming</h3>'

      if (props.name || props.Name) {
        popup += `<p><strong>Naam:</strong> ${props.name || props.Name}</p>`
      }
      if (props.location || props.Location) {
        popup += `<p><strong>Locatie:</strong> ${props.location || props.Location}</p>`
      }
      if (props.description) {
        // Strip HTML tags for cleaner display
        const desc = props.description.replace(/<[^>]*>/g, '')
        if (desc.trim()) {
          popup += `<p><strong>Beschrijving:</strong> ${desc}</p>`
        }
      }
      if (props.date) {
        popup += `<p><strong>Datum:</strong> ${props.date}</p>`
      }

      popup += '<p style="font-size: 11px; color: #666; margin-top: 8px;">Bron: Eigen data</p>'
      popup += '</div>'

      marker.bindPopup(popup)
      markers.push(marker)
      layerGroup.addLayer(marker)
    })

    // Update icon size on zoom
    map.on('zoomend', () => {
      const newZoom = map.getZoom()
      markers.forEach(marker => {
        marker.setIcon(createToestemmingIcon(newZoom))
      })
    })

    console.log(`✓ Created ${markers.length} permission markers`)

    return layerGroup

  } catch (error) {
    console.error('Failed to load Toestemmingen layer:', error)
    return null
  }
}

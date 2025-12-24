/**
 * Archis-punten Layer with clustering
 * Archaeological find spots with category-based coloring
 */

import L from 'leaflet'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { loadGeoJSON } from '../utils/layerLoader.js'

// Category colors matching V3
const CATEGORY_COLORS = {
  'aardewerk': '#dc2626',    // Red
  'site': '#7c3aed',         // Purple
  'grafveld': '#16a34a',     // Green
  'beleidskaart': '#7c3aed', // Purple
  'metaal': '#ea580c',       // Orange
  'overig': '#7c3aed',       // Purple
  'undefined': '#7c3aed'     // Purple
}

function createArchisIcon(category) {
  const size = 14
  const dot = '●'
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS['undefined']

  return L.divIcon({
    html: `<div style="color: ${color}; font-size: 14px; line-height: 1;">${dot}</div>`,
    className: 'archis-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  })
}

export async function createArchisPuntenLayer() {
  try {
    const geojson = await loadGeoJSON('/detectorapp-nl/data/punten_custom.geojson')

    console.log(`📊 Loaded ${geojson.features.length} Archis points`)

    // Count categories
    const categories = {}
    geojson.features.forEach(f => {
      const cat = f.properties.category || 'undefined'
      categories[cat] = (categories[cat] || 0) + 1
    })
    console.log('📊 Categories:', categories)

    // Store total for legend
    window.puntenCategories = geojson.features.length

    // Create marker cluster group
    const clusterGroup = L.markerClusterGroup({
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 16,
      spiderfyDistanceMultiplier: 1.5,
      animate: true,
      animateAddingMarkers: false,
      iconCreateFunction: function(cluster) {
        const markers = cluster.getAllChildMarkers()
        const count = markers.length
        let className = 'marker-cluster-small'

        if (count > 100) className = 'marker-cluster-large'
        else if (count > 10) className = 'marker-cluster-medium'

        return L.divIcon({
          html: `<div><span>${count}</span></div>`,
          className: 'marker-cluster ' + className,
          iconSize: L.point(40, 40)
        })
      }
    })

    // Create GeoJSON layer with all markers (V3 style)
    const markers = L.geoJSON(geojson, {
      pointToLayer: (feature, latlng) => {
        const category = feature.properties.category || 'site'
        return L.marker(latlng, {
          icon: createArchisIcon(category)
        })
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties
        const category = props.category || 'site'
        let popup = '<div style="min-width: 200px;">'

        if (props.source === 'archis_romeins') {
          popup += '<h3 style="margin: 0 0 8px 0; color: #7c3aed;">Romeinse vondst</h3>'
          if (props.type_label) popup += `<p><strong>Type:</strong> ${props.type_label}</p>`
          if (props.materiaal_label) popup += `<p><strong>Materiaal:</strong> ${props.materiaal_label}</p>`
          if (props.cultuur_label) popup += `<p><strong>Cultuur:</strong> ${props.cultuur_label}</p>`
          if (props.datering) popup += `<p><strong>Datering:</strong> ${props.datering}</p>`
        } else {
          popup += `<h3 style="margin: 0 0 8px 0; color: ${CATEGORY_COLORS[category]};">Archis punt</h3>`
          popup += `<p><strong>Categorie:</strong> ${category}</p>`
          if (props.type) popup += `<p><strong>Type:</strong> ${props.type}</p>`
          if (props.description) popup += `<p><strong>Beschrijving:</strong> ${props.description}</p>`
        }

        popup += '</div>'
        layer.bindPopup(popup)
      }
    })

    // Add ALL markers to cluster group at once (V3 style)
    clusterGroup.addLayer(markers)

    console.log(`✓ Created ${geojson.features.length} clustered markers`)

    return clusterGroup

  } catch (error) {
    console.error('Failed to load Archis-punten layer:', error)
    return null
  }
}

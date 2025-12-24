/**
 * Archis-punten Layer for OpenLayers
 * Archaeological find spots - NO clustering (v3.6.3)
 * Excludes Kromme Rijn aardewerk (separate layer)
 */

import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { loadGeoJSON, parseGeoJSON } from '../utils/layerLoaderOL.js'
import { createDynamicIconStyle } from './iconStyles'

// Category colors
const CATEGORY_COLORS: Record<string, string> = {
  'aardewerk': '#dc2626',    // Red
  'site': '#7c3aed',         // Purple
  'grafveld': '#16a34a',     // Green
  'beleidskaart': '#7c3aed', // Purple
  'metaal': '#ea580c',       // Orange
  'overig': '#7c3aed',       // Purple
  'undefined': '#7c3aed'     // Purple
}

export async function createArchisPuntenLayerOL() {
  try {
    const geojson = await loadGeoJSON('/webapp/data/punten_custom.geojson')
    const allFeatures = parseGeoJSON(geojson)

    // Filter OUT Kromme Rijn aardewerk (those go in separate layer)
    const features = allFeatures.filter(feature => {
      const category = feature.get('category')
      const toelichting = feature.get('toelichting') || ''

      // Exclude if it's pottery (aardewerk) from Kromme Rijn area
      const isKrommeRijnAardewerk =
        category === 'aardewerk' &&
        toelichting.toLowerCase().includes('kromme rijn')

      return !isKrommeRijnAardewerk
    })

    // Create vector source (NO clustering)
    const vectorSource = new VectorSource({ features })

    const layer = new VectorLayer({
      properties: { title: 'Archis-punten', type: 'overlay' },
      source: vectorSource,
      visible: false,
      style: createDynamicIconStyle('mapPin', (feature) => {
        const category = feature.get('category') || 'site'
        return CATEGORY_COLORS[category] || '#7c3aed'
      }),
      zIndex: 30
    })

    console.log(`✓ Archis-punten loaded (${features.length} points, no clustering, Kromme Rijn aardewerk excluded)`)
    return layer

  } catch (error) {
    console.error('Failed to load Archis-punten layer:', error)
    return null
  }
}

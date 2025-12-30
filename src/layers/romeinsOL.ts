/**
 * Romeinse wegen Layers for OpenLayers
 * Itiner-E Roman road network dataset
 * Two versions:
 * - Romeinse wegen: filtered to Benelux + Rheinland (default for Detectie preset)
 * - Romeinse wegen (Wereld): complete world dataset
 */

import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Stroke } from 'ol/style'
import type { Feature } from 'ol'
import type { Geometry, LineString, MultiLineString } from 'ol/geom'
import { loadGeoJSON, parseGeoJSON } from '../utils/layerLoaderOL.js'

// Bounding box for Benelux + relevant Germany (Rheinland-Westfalen to Saarland/Frankfurt)
// West: Belgium west, East: past Frankfurt, South: Saarland, North: North Netherlands
const BENELUX_BOUNDS = {
  minLon: 2.5,
  maxLon: 10.5,
  minLat: 49.0,
  maxLat: 54.0
}

// Cache styles per resolution to avoid recreating
const styleCache = new Map<string, Style>()

function getLineWidth(resolution: number): number {
  // Thinner when zoomed out, thicker when zoomed in
  if (resolution > 300) return 0.5    // Very zoomed out
  if (resolution > 150) return 0.75   // Zoomed out
  if (resolution > 75) return 1       // Medium-far
  if (resolution > 40) return 1.5     // Medium
  if (resolution > 20) return 2       // Medium-close
  if (resolution > 10) return 2.5     // Close
  return 3                            // Very close
}

function createStyle(resolution: number): Style {
  const width = getLineWidth(resolution)
  const cacheKey = `roman-${width}`

  let style = styleCache.get(cacheKey)
  if (!style) {
    style = new Style({
      stroke: new Stroke({
        color: '#dc2626',
        width: width
      })
    })
    styleCache.set(cacheKey, style)
  }
  return style
}

// Check if a feature intersects the bounding box
function featureIntersectsBounds(feature: Feature<Geometry>): boolean {
  const geometry = feature.getGeometry()
  if (!geometry) return false

  // Get coordinates based on geometry type
  let coordinates: number[][] = []

  if (geometry.getType() === 'LineString') {
    coordinates = (geometry as LineString).getCoordinates()
  } else if (geometry.getType() === 'MultiLineString') {
    // Flatten all line coordinates
    const lines = (geometry as MultiLineString).getCoordinates()
    coordinates = lines.flat()
  }

  // Check if any coordinate is within bounds
  return coordinates.some(coord => {
    const [lon, lat] = coord
    return lon >= BENELUX_BOUNDS.minLon &&
           lon <= BENELUX_BOUNDS.maxLon &&
           lat >= BENELUX_BOUNDS.minLat &&
           lat <= BENELUX_BOUNDS.maxLat
  })
}

/**
 * Romeinse wegen - filtered to Benelux + Rheinland region
 * Default layer for Detectie preset
 */
export async function createRomeinseWegenLayerOL() {
  try {
    const geojson = await loadGeoJSON('/detectorapp-nl/data/romeinse_wegen_itiner_e.geojson')
    const allFeatures = parseGeoJSON(geojson)

    // Filter to only features that intersect the Benelux bounds
    const filteredFeatures = allFeatures.filter(featureIntersectsBounds)

    const layer = new VectorLayer({
      properties: { title: 'Romeinse wegen' },
      source: new VectorSource({ features: filteredFeatures }),
      style: (feature, resolution) => createStyle(resolution),
      opacity: 0.8,
      zIndex: 20
    })

    console.log(`✓ Romeinse wegen loaded (${filteredFeatures.length}/${allFeatures.length} features in Benelux region)`)
    return layer

  } catch (error) {
    console.error('Failed to load Romeinse wegen layer:', error)
    return null
  }
}

/**
 * Romeinse wegen (Wereld) - complete world dataset
 * Optional layer for users who want to see the full network
 */
export async function createRomeinseWegenWereldLayerOL() {
  try {
    const geojson = await loadGeoJSON('/detectorapp-nl/data/romeinse_wegen_itiner_e.geojson')
    const features = parseGeoJSON(geojson)

    const layer = new VectorLayer({
      properties: { title: 'Romeinse wegen (Wereld)' },
      source: new VectorSource({ features }),
      style: (feature, resolution) => createStyle(resolution),
      opacity: 0.8,
      zIndex: 20
    })

    console.log(`✓ Romeinse wegen (Wereld) loaded (${features.length} features)`)
    return layer

  } catch (error) {
    console.error('Failed to load Romeinse wegen (Wereld) layer:', error)
    return null
  }
}

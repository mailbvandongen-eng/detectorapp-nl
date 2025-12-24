/**
 * Layer Loader for OpenLayers
 * Utilities for loading GeoJSON and TopoJSON data
 */

import GeoJSON from 'ol/format/GeoJSON'
import * as topojson from 'topojson-client'

/**
 * Load GeoJSON from URL
 */
export async function loadGeoJSON(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.statusText}`)
    }
    const data = await response.json()
    console.log(`✓ Loaded GeoJSON from ${url}`)
    return data
  } catch (error) {
    console.error(`Error loading GeoJSON from ${url}:`, error)
    throw error
  }
}

/**
 * Load TopoJSON and convert to GeoJSON
 */
export async function loadTopoJSON(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to load ${url}: ${response.statusText}`)
    }
    const topoData = await response.json()

    // Get first object from topology
    const objectName = Object.keys(topoData.objects)[0]
    const geojson = topojson.feature(topoData, topoData.objects[objectName])

    console.log(`✓ Loaded and converted TopoJSON from ${url}`)
    return geojson
  } catch (error) {
    console.error(`Error loading TopoJSON from ${url}:`, error)
    throw error
  }
}

/**
 * Parse GeoJSON to OpenLayers features
 */
export function parseGeoJSON(geojson) {
  const format = new GeoJSON({
    featureProjection: 'EPSG:3857' // Web Mercator (OpenLayers default)
  })
  return format.readFeatures(geojson)
}

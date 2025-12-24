/**
 * Layer loader utility
 * Handles loading GeoJSON and TopoJSON files
 */

import L from 'leaflet'
import * as topojson from 'topojson-client'

export async function loadGeoJSON(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.statusText}`)
  }
  return await response.json()
}

export async function loadTopoJSON(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.statusText}`)
  }
  const data = await response.json()
  
  // Convert TopoJSON to GeoJSON
  const objectKey = Object.keys(data.objects)[0]
  return topojson.feature(data, data.objects[objectKey])
}

export function createGeoJSONLayer(geojson, options = {}) {
  return L.geoJSON(geojson, {
    style: options.style,
    pointToLayer: options.pointToLayer,
    onEachFeature: options.onEachFeature
  })
}

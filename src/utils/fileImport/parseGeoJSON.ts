/**
 * GeoJSON Parser
 * Parses GeoJSON files and handles Dutch RD coordinate transformation
 */

import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import type { CustomFeatureCollection, CustomFeature } from '../../store/customLayerStore'

// Register Dutch RD projection (EPSG:28992)
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')
register(proj4)

export interface ParseResult {
  success: boolean
  features: CustomFeatureCollection
  errors: string[]
  warnings: string[]
  metadata: {
    featureCount: number
    geometryTypes: string[]
    coordinateSystem: 'WGS84' | 'RD' | 'unknown'
    transformed: boolean
  }
}

/**
 * Detect if coordinates are in Dutch RD (EPSG:28992) or WGS84
 */
function detectCoordinateSystem(coords: number[]): 'WGS84' | 'RD' | 'unknown' {
  if (!coords || coords.length < 2) return 'unknown'

  const [x, y] = coords

  // Dutch RD range: X: 7000-300000, Y: 289000-629000
  if (x >= 7000 && x <= 300000 && y >= 289000 && y <= 629000) {
    return 'RD'
  }

  // WGS84 lat/lng: -180 to 180, -90 to 90
  // For Netherlands: lon 3-7, lat 50-54
  if (Math.abs(x) <= 180 && Math.abs(y) <= 90) {
    return 'WGS84'
  }

  return 'unknown'
}

/**
 * Transform RD coordinates to WGS84
 */
function transformRDtoWGS84(coords: number[]): number[] {
  const [x, y] = coords
  const transformed = proj4('EPSG:28992', 'EPSG:4326', [x, y])
  return transformed
}

/**
 * Recursively transform coordinates in geometry
 */
function transformGeometryCoords(
  coords: number[] | number[][] | number[][][] | number[][][][],
  transform: (c: number[]) => number[]
): number[] | number[][] | number[][][] | number[][][][] {
  // Check if this is a coordinate pair (array of 2-3 numbers)
  if (typeof coords[0] === 'number') {
    return transform(coords as number[])
  }

  // Otherwise recurse into nested arrays
  return (coords as (number[] | number[][] | number[][][])[]).map(c =>
    transformGeometryCoords(c, transform)
  ) as number[][] | number[][][] | number[][][][]
}

/**
 * Get first coordinate from any geometry type
 */
function getFirstCoordinate(geometry: CustomFeature['geometry']): number[] | null {
  const coords = geometry.coordinates

  if (!coords || (Array.isArray(coords) && coords.length === 0)) return null

  // Point: [x, y]
  if (geometry.type === 'Point') {
    return coords as number[]
  }

  // LineString, MultiPoint: [[x, y], ...]
  if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
    return (coords as number[][])[0]
  }

  // Polygon, MultiLineString: [[[x, y], ...], ...]
  if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
    return (coords as number[][][])[0]?.[0]
  }

  // MultiPolygon: [[[[x, y], ...], ...], ...]
  if (geometry.type === 'MultiPolygon') {
    return (coords as number[][][][])[0]?.[0]?.[0]
  }

  return null
}

/**
 * Parse GeoJSON from file
 */
export async function parseGeoJSON(file: File): Promise<ParseResult> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const text = await file.text()
    const geojson = JSON.parse(text)

    // Validate GeoJSON structure
    if (!geojson.type) {
      errors.push('Ongeldig GeoJSON: geen "type" veld gevonden')
      return {
        success: false,
        features: { type: 'FeatureCollection', features: [] },
        errors,
        warnings,
        metadata: { featureCount: 0, geometryTypes: [], coordinateSystem: 'unknown', transformed: false }
      }
    }

    // Handle both Feature and FeatureCollection
    let features: CustomFeature[] = []

    if (geojson.type === 'FeatureCollection') {
      features = geojson.features || []
    } else if (geojson.type === 'Feature') {
      features = [geojson]
    } else if (geojson.type === 'GeometryCollection') {
      // Convert GeometryCollection to features
      features = (geojson.geometries || []).map((geometry: CustomFeature['geometry'], i: number) => ({
        type: 'Feature' as const,
        geometry,
        properties: { id: i }
      }))
    } else {
      // Assume it's a bare geometry
      features = [{
        type: 'Feature' as const,
        geometry: geojson,
        properties: {}
      }]
    }

    if (features.length === 0) {
      warnings.push('Geen features gevonden in bestand')
    }

    // Detect coordinate system from first feature
    let coordinateSystem: 'WGS84' | 'RD' | 'unknown' = 'unknown'
    let transformed = false

    if (features.length > 0 && features[0].geometry) {
      const firstCoord = getFirstCoordinate(features[0].geometry)
      if (firstCoord) {
        coordinateSystem = detectCoordinateSystem(firstCoord)
      }
    }

    // Transform RD coordinates to WGS84
    if (coordinateSystem === 'RD') {
      warnings.push('Rijksdriehoek coordinaten gedetecteerd, worden omgezet naar WGS84')
      transformed = true

      features = features.map(feature => {
        if (!feature.geometry) return feature

        const transformedCoords = transformGeometryCoords(
          feature.geometry.coordinates,
          transformRDtoWGS84
        )

        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: transformedCoords
          }
        }
      })

      coordinateSystem = 'WGS84'
    }

    // Collect geometry types
    const geometryTypes = [...new Set(
      features
        .filter(f => f.geometry)
        .map(f => f.geometry.type)
    )]

    return {
      success: true,
      features: {
        type: 'FeatureCollection',
        features
      },
      errors,
      warnings,
      metadata: {
        featureCount: features.length,
        geometryTypes,
        coordinateSystem,
        transformed
      }
    }
  } catch (error) {
    errors.push(`Fout bij parsen: ${error instanceof Error ? error.message : 'Onbekende fout'}`)
    return {
      success: false,
      features: { type: 'FeatureCollection', features: [] },
      errors,
      warnings,
      metadata: { featureCount: 0, geometryTypes: [], coordinateSystem: 'unknown', transformed: false }
    }
  }
}

/**
 * GPX Parser
 * Parses GPX files using OpenLayers format
 */

import GPX from 'ol/format/GPX'
import GeoJSON from 'ol/format/GeoJSON'
import type { ParseResult } from './parseGeoJSON'
import type { CustomFeatureCollection, CustomFeature } from '../../store/customLayerStore'

/**
 * Parse GPX from file
 */
export async function parseGPX(file: File): Promise<ParseResult> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const text = await file.text()

    // Create GPX format parser
    const gpxFormat = new GPX()

    // Parse GPX to OpenLayers features
    const olFeatures = gpxFormat.readFeatures(text, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:4326', // Keep as WGS84
    })

    if (olFeatures.length === 0) {
      warnings.push('Geen features gevonden in GPX bestand')
    }

    // Convert OpenLayers features to GeoJSON
    const geojsonFormat = new GeoJSON()
    const geojsonObject = geojsonFormat.writeFeaturesObject(olFeatures, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:4326',
    })

    // Process features - extract GPX-specific properties
    const features: CustomFeature[] = geojsonObject.features.map((feature, index) => {
      const properties: Record<string, unknown> = { ...feature.properties }

      // GPX often has name, desc, time, ele (elevation)
      const name = properties.name || properties.Name || `Waypoint ${index + 1}`
      const description = properties.desc || properties.description || ''
      const time = properties.time || null
      const elevation = properties.ele || null

      return {
        type: 'Feature' as const,
        geometry: feature.geometry as CustomFeature['geometry'],
        properties: {
          ...properties,
          name,
          description,
          time,
          elevation,
        }
      }
    })

    // Collect geometry types
    const geometryTypes = [...new Set(
      features
        .filter(f => f.geometry)
        .map(f => f.geometry.type)
    )]

    // GPX typically has Point (waypoints), LineString (tracks), or both
    if (geometryTypes.includes('LineString')) {
      warnings.push('GPX track routes worden als lijnen weergegeven')
    }

    return {
      success: true,
      features: {
        type: 'FeatureCollection',
        features
      } as CustomFeatureCollection,
      errors,
      warnings,
      metadata: {
        featureCount: features.length,
        geometryTypes,
        coordinateSystem: 'WGS84',
        transformed: false
      }
    }
  } catch (error) {
    errors.push(`Fout bij parsen GPX: ${error instanceof Error ? error.message : 'Onbekende fout'}`)
    return {
      success: false,
      features: { type: 'FeatureCollection', features: [] },
      errors,
      warnings,
      metadata: { featureCount: 0, geometryTypes: [], coordinateSystem: 'unknown', transformed: false }
    }
  }
}

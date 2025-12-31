/**
 * KML Parser
 * Parses KML files using OpenLayers format
 */

import KML from 'ol/format/KML'
import GeoJSON from 'ol/format/GeoJSON'
import type { ParseResult } from './parseGeoJSON'
import type { CustomFeatureCollection, CustomFeature } from '../../store/customLayerStore'

/**
 * Parse KML from file
 */
export async function parseKML(file: File): Promise<ParseResult> {
  const errors: string[] = []
  const warnings: string[] = []

  try {
    const text = await file.text()

    // Create KML format parser
    const kmlFormat = new KML({
      extractStyles: false, // Don't extract KML styles
    })

    // Parse KML to OpenLayers features
    const olFeatures = kmlFormat.readFeatures(text, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:4326', // Keep as WGS84
    })

    if (olFeatures.length === 0) {
      warnings.push('Geen features gevonden in KML bestand')
    }

    // Convert OpenLayers features to GeoJSON
    const geojsonFormat = new GeoJSON()
    const geojsonObject = geojsonFormat.writeFeaturesObject(olFeatures, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:4326',
    })

    // Process features - extract properties
    const features: CustomFeature[] = geojsonObject.features.map((feature, index) => {
      const properties: Record<string, unknown> = { ...feature.properties }

      // KML often stores name and description
      const name = properties.name || properties.Name || `Feature ${index + 1}`
      const description = properties.description || properties.Description || ''

      return {
        type: 'Feature' as const,
        geometry: feature.geometry as CustomFeature['geometry'],
        properties: {
          ...properties,
          name,
          description,
        }
      }
    })

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
    errors.push(`Fout bij parsen KML: ${error instanceof Error ? error.message : 'Onbekende fout'}`)
    return {
      success: false,
      features: { type: 'FeatureCollection', features: [] },
      errors,
      warnings,
      metadata: { featureCount: 0, geometryTypes: [], coordinateSystem: 'unknown', transformed: false }
    }
  }
}

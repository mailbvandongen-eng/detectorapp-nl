/**
 * File Import Utilities
 * Unified file parsing for GeoJSON, KML, and GPX
 */

import { parseGeoJSON, type ParseResult } from './parseGeoJSON'
import { parseKML } from './parseKML'
import { parseGPX } from './parseGPX'

export type { ParseResult } from './parseGeoJSON'

export type SupportedFileType = 'geojson' | 'kml' | 'gpx' | 'unsupported'

/**
 * Detect file type from extension
 */
export function detectFileType(filename: string): SupportedFileType {
  const extension = filename.split('.').pop()?.toLowerCase()

  switch (extension) {
    case 'geojson':
    case 'json':
      return 'geojson'
    case 'kml':
    case 'kmz': // Note: KMZ needs to be unzipped first
      return 'kml'
    case 'gpx':
      return 'gpx'
    default:
      return 'unsupported'
  }
}

/**
 * Get accepted file extensions for file input
 */
export function getAcceptedExtensions(): string {
  return '.geojson,.json,.kml,.gpx'
}

/**
 * Get human-readable list of supported formats
 */
export function getSupportedFormatsText(): string {
  return 'GeoJSON, KML (Google My Maps), GPX'
}

/**
 * Parse file based on its type
 */
export async function parseFile(file: File): Promise<ParseResult> {
  const fileType = detectFileType(file.name)

  switch (fileType) {
    case 'geojson':
      return parseGeoJSON(file)
    case 'kml':
      return parseKML(file)
    case 'gpx':
      return parseGPX(file)
    case 'unsupported':
    default:
      return {
        success: false,
        features: { type: 'FeatureCollection', features: [] },
        errors: [`Niet-ondersteund bestandsformaat: ${file.name}. Ondersteunde formaten: ${getSupportedFormatsText()}`],
        warnings: [],
        metadata: {
          featureCount: 0,
          geometryTypes: [],
          coordinateSystem: 'unknown',
          transformed: false
        }
      }
  }
}

/**
 * Validate file before parsing
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Bestand te groot (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum is 10 MB.`
    }
  }

  // Check file type
  const fileType = detectFileType(file.name)
  if (fileType === 'unsupported') {
    return {
      valid: false,
      error: `Niet-ondersteund bestandsformaat. Ondersteunde formaten: ${getSupportedFormatsText()}`
    }
  }

  // KMZ files need special handling (zipped KML)
  if (file.name.toLowerCase().endsWith('.kmz')) {
    return {
      valid: false,
      error: 'KMZ bestanden worden nog niet ondersteund. Pak het bestand uit en importeer het .kml bestand.'
    }
  }

  return { valid: true }
}

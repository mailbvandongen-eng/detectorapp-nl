/**
 * Map Engine Configuration
 *
 * Feature flag voor migratie van OpenLayers naar ArcGIS SDK.
 * Tijdens migratie kunnen beide engines parallel draaien.
 *
 * @see Plan: C:\Users\bobva\.claude\plans\silly-wiggling-sphinx.md
 */

export type MapEngine = 'openlayers' | 'arcgis'

interface MapEngineConfig {
  // Primary map engine
  engine: MapEngine

  // Feature flags for gradual migration
  features: {
    // Use ArcGIS for base layers (Fase 2)
    arcgisBaseLayers: boolean

    // Use ArcGIS for WMS layers (Fase 3)
    arcgisWMSLayers: boolean

    // Use ArcGIS for vector/GeoJSON layers (Fase 3)
    arcgisVectorLayers: boolean

    // Use ArcGIS hitTest for popups (Fase 4)
    arcgisPopups: boolean

    // Use ArcGIS GraphicsLayer for GPS marker (Fase 5)
    arcgisGPS: boolean

    // Use ArcGIS widgets for tools (Fase 6)
    arcgisTools: boolean
  }

  // Debug mode - log engine switches and sync events
  debug: boolean
}

/**
 * Current map engine configuration.
 *
 * Migratie volgorde:
 * 1. engine: 'arcgis' - Schakel hoofdengine over
 * 2. arcgisBaseLayers: true - Basemaps via ArcGIS
 * 3. arcgisWMSLayers: true - WMS lagen via ArcGIS
 * 4. arcgisVectorLayers: true - Vector lagen via ArcGIS
 * 5. arcgisPopups: true - Popups via hitTest
 * 6. arcgisGPS: true - GPS marker via GraphicsLayer
 * 7. arcgisTools: true - Measure/Draw via widgets
 *
 * Na volledige migratie: verwijder OL dependencies
 */
export const mapEngineConfig: MapEngineConfig = {
  // ArcGIS als primaire engine (Glenn Heeres / Esri vereiste)
  engine: 'arcgis',

  features: {
    // Fase 2: Base layers via ArcGIS
    arcgisBaseLayers: true,

    // Fase 3: Layer migratie - TEST ENABLED
    arcgisWMSLayers: true,
    arcgisVectorLayers: true,

    // Fase 4: Popups (nog niet klaar)
    arcgisPopups: false,

    // Fase 5: GPS (nog niet klaar)
    arcgisGPS: false,

    // Fase 6: Tools (nog niet klaar)
    arcgisTools: false
  },

  debug: true
}

/**
 * Check if a specific feature should use ArcGIS
 */
export function useArcGISFeature(feature: keyof MapEngineConfig['features']): boolean {
  return mapEngineConfig.engine === 'arcgis' && mapEngineConfig.features[feature]
}

/**
 * Check if primary engine is ArcGIS
 */
export function isArcGISEngine(): boolean {
  return mapEngineConfig.engine === 'arcgis'
}

/**
 * Check if primary engine is OpenLayers
 */
export function isOpenLayersEngine(): boolean {
  return mapEngineConfig.engine === 'openlayers'
}

/**
 * Debug log for engine operations
 */
export function engineLog(message: string, ...args: any[]): void {
  if (mapEngineConfig.debug) {
    console.log(`🗺️ [${mapEngineConfig.engine.toUpperCase()}] ${message}`, ...args)
  }
}

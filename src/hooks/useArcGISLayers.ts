/**
 * useArcGISLayers Hook
 *
 * Beheert ArcGIS SDK layers - laadt configs, converteert, en synchroniseert met map.
 * Vervangt de OpenLayers layer management wanneer arcgisWMSLayers/arcgisVectorLayers enabled zijn.
 *
 * @see arcgisLayerConverter.ts - Converter logica
 * @see arcgisLayerConfigs.ts - Layer configuraties
 */

import { useEffect, useRef, useCallback } from 'react'
import type MapView from '@arcgis/core/views/MapView'
import type Layer from '@arcgis/core/layers/Layer'
import { useMapStore } from '../store/mapStore'
import { useLayerStore } from '../store/layerStore'
import { useArcGISFeature, engineLog } from '../config/mapEngineConfig'
import { convertToArcGISLayer } from '../layers/arcgisLayerConverter'
import { allLayerConfigs, getLayerConfig } from '../layers/arcgisLayerConfigs'

// Cache for converted layers
const layerCache = new Map<string, Layer>()

/**
 * Hook to manage ArcGIS layers based on feature flags
 */
export function useArcGISLayers() {
  const arcgisView = useMapStore(state => state.arcgisView)
  const visible = useLayerStore(state => state.visible)
  const opacity = useLayerStore(state => state.opacity)

  const useWMSLayers = useArcGISFeature('arcgisWMSLayers')
  const useVectorLayers = useArcGISFeature('arcgisVectorLayers')

  // Track which layers are added to the map
  const addedLayers = useRef<Set<string>>(new Set())

  /**
   * Get or create an ArcGIS layer from config
   */
  const getOrCreateLayer = useCallback((name: string): Layer | null => {
    // Check cache first
    if (layerCache.has(name)) {
      return layerCache.get(name)!
    }

    // Get config
    const config = getLayerConfig(name)
    if (!config) {
      // No ArcGIS config for this layer - it's handled by OpenLayers
      return null
    }

    // Check if this layer type should be handled by ArcGIS
    if (config.type === 'wms' && !useWMSLayers) return null
    if (config.type === 'geojson' && !useVectorLayers) return null
    // Imagery layers are always handled by ArcGIS when available
    if (config.type === 'imagery') {
      // These are premium AHN layers - always use ArcGIS
    }

    try {
      // Convert and cache
      const layer = convertToArcGISLayer(config)
      layerCache.set(name, layer)
      engineLog(`Layer created and cached: ${name}`)
      return layer
    } catch (error) {
      console.error(`Failed to create ArcGIS layer: ${name}`, error)
      return null
    }
  }, [useWMSLayers, useVectorLayers])

  /**
   * Add layer to map if not already added
   */
  const addLayerToMap = useCallback((name: string, view: MapView) => {
    if (addedLayers.current.has(name)) return
    if (!view.map) return

    const layer = getOrCreateLayer(name)
    if (!layer) return

    view.map.add(layer)
    addedLayers.current.add(name)
    engineLog(`Layer added to map: ${name}`)
  }, [getOrCreateLayer])

  /**
   * Sync visibility with layer store
   */
  useEffect(() => {
    if (!arcgisView?.map) return

    // Process all configured layers
    for (const [name, isVisible] of Object.entries(visible)) {
      const config = getLayerConfig(name)
      if (!config) continue

      // Skip layers that shouldn't be handled by ArcGIS yet
      if (config.type === 'wms' && !useWMSLayers) continue
      if (config.type === 'geojson' && !useVectorLayers) continue

      // Get or create layer
      const layer = getOrCreateLayer(name)
      if (!layer) continue

      // Add to map if visible and not added
      if (isVisible && !addedLayers.current.has(name)) {
        addLayerToMap(name, arcgisView)
      }

      // Update visibility
      layer.visible = isVisible
    }
  }, [arcgisView, visible, useWMSLayers, useVectorLayers, getOrCreateLayer, addLayerToMap])

  /**
   * Sync opacity with layer store
   */
  useEffect(() => {
    for (const [name, opacityValue] of Object.entries(opacity)) {
      const layer = layerCache.get(name)
      if (layer) {
        layer.opacity = opacityValue
      }
    }
  }, [opacity])

  /**
   * Load all immediate load layers on startup
   */
  useEffect(() => {
    if (!arcgisView?.map) return

    // Only load if feature flags are enabled
    if (!useWMSLayers && !useVectorLayers) {
      engineLog('ArcGIS layer features not enabled - skipping layer loading')
      return
    }

    engineLog('Loading ArcGIS layers...')

    // Load all configs that match enabled features
    let loadedCount = 0
    for (const [name, config] of Object.entries(allLayerConfigs)) {
      // Check if this layer type should be handled by ArcGIS
      if (config.type === 'wms' && !useWMSLayers) continue
      if (config.type === 'geojson' && !useVectorLayers) continue

      // Create layer (this adds to cache)
      const layer = getOrCreateLayer(name)
      if (layer) {
        loadedCount++
      }
    }

    engineLog(`Loaded ${loadedCount} ArcGIS layer configs`)
  }, [arcgisView, useWMSLayers, useVectorLayers, getOrCreateLayer])

  return {
    layerCache,
    addedLayers: addedLayers.current,
    getOrCreateLayer,
    addLayerToMap
  }
}

/**
 * Get a specific layer from cache
 */
export function getArcGISLayer(name: string): Layer | undefined {
  return layerCache.get(name)
}

/**
 * Check if a layer is managed by ArcGIS
 */
export function isArcGISManagedLayer(name: string): boolean {
  return layerCache.has(name)
}

/**
 * Clear layer cache (useful for hot reload during development)
 */
export function clearLayerCache(): void {
  layerCache.clear()
  engineLog('Layer cache cleared')
}

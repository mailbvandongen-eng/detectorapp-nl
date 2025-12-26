import { useEffect, useRef } from 'react'
import { useMapStore, useLayerStore } from '../store'

/**
 * Dynamic AHN scaling hook
 *
 * Monitors the viewport and adjusts AHN layer opacity/visibility
 * based on zoom level. At higher zoom levels, it increases contrast
 * to make subtle height differences more visible.
 *
 * Future improvements:
 * - Query local min/max heights via WCS
 * - Use WebGL for dynamic color mapping
 * - Generate custom SLD for PDOK WMS
 */
export function useDynamicAHN() {
  const map = useMapStore(state => state.map)
  const setLayerOpacity = useLayerStore(state => state.setLayerOpacity)
  const visible = useLayerStore(state => state.visible)
  const lastZoomRef = useRef<number | null>(null)

  useEffect(() => {
    if (!map) return

    const handleMoveEnd = () => {
      const zoom = map.getView().getZoom()
      if (!zoom) return

      // Only update if zoom changed significantly
      if (lastZoomRef.current !== null && Math.abs(zoom - lastZoomRef.current) < 0.5) {
        return
      }
      lastZoomRef.current = zoom

      // Check if AHN layers are visible
      const ahn05mVisible = visible['AHN 0.5m']
      const hillshadeVisible = visible['AHN4 Multi-Hillshade NL']

      if (!ahn05mVisible && !hillshadeVisible) return

      // Adjust opacity based on zoom level
      // Higher zoom = higher contrast (higher opacity)
      // This makes local height differences more visible when zoomed in
      if (ahn05mVisible) {
        if (zoom >= 18) {
          // Very zoomed in: max contrast
          setLayerOpacity('AHN 0.5m', 0.85)
        } else if (zoom >= 16) {
          // Zoomed in: high contrast
          setLayerOpacity('AHN 0.5m', 0.75)
        } else if (zoom >= 14) {
          // Medium zoom
          setLayerOpacity('AHN 0.5m', 0.65)
        } else {
          // Zoomed out: lower opacity
          setLayerOpacity('AHN 0.5m', 0.55)
        }
      }

      // Similar for hillshade
      if (hillshadeVisible) {
        if (zoom >= 18) {
          setLayerOpacity('AHN4 Multi-Hillshade NL', 0.80)
        } else if (zoom >= 16) {
          setLayerOpacity('AHN4 Multi-Hillshade NL', 0.70)
        } else if (zoom >= 14) {
          setLayerOpacity('AHN4 Multi-Hillshade NL', 0.60)
        } else {
          setLayerOpacity('AHN4 Multi-Hillshade NL', 0.50)
        }
      }
    }

    map.on('moveend', handleMoveEnd)

    // Initial check
    handleMoveEnd()

    return () => {
      map.un('moveend', handleMoveEnd)
    }
  }, [map, visible, setLayerOpacity])
}

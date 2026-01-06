import { useEffect, useRef } from 'react'
import { useMapStore } from '../../store/mapStore'
import { useRouteRecordingStore } from '../../store/routeRecordingStore'
import VectorSource from 'ol/source/Vector'
import { Heatmap as HeatmapLayer } from 'ol/layer'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat } from 'ol/proj'

export function CoverageHeatmapLayer() {
  const map = useMapStore(state => state.map)
  const { savedRoutes, visibleRouteIds, heatmapEnabled } = useRouteRecordingStore()
  const layerRef = useRef<HeatmapLayer | null>(null)
  const sourceRef = useRef<VectorSource | null>(null)

  // Create layer once
  useEffect(() => {
    if (!map) return

    const source = new VectorSource()
    sourceRef.current = source

    const heatmapLayer = new HeatmapLayer({
      source,
      blur: 15,
      radius: 10,
      weight: () => 1,
      gradient: ['#00f', '#0ff', '#0f0', '#ff0', '#f00'], // Blue to red
      opacity: 0.6,
      zIndex: 90 // Below routes but above base map
    })

    layerRef.current = heatmapLayer
    map.addLayer(heatmapLayer)

    return () => {
      if (map && layerRef.current) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map])

  // Update features when routes, visibility or heatmap mode changes
  useEffect(() => {
    if (!sourceRef.current || !layerRef.current) return

    sourceRef.current.clear()

    // Only show heatmap if enabled
    if (!heatmapEnabled) {
      layerRef.current.setVisible(false)
      return
    }

    // Get all visible routes
    const visibleRoutes = savedRoutes.filter(r => visibleRouteIds.has(r.id))

    // Create point features for all route points
    const features: Feature<Point>[] = []

    for (const route of visibleRoutes) {
      for (const point of route.points) {
        const feature = new Feature({
          geometry: new Point(fromLonLat(point.coordinates))
        })
        features.push(feature)
      }
    }

    sourceRef.current.addFeatures(features)

    // Show layer if there are features
    layerRef.current.setVisible(features.length > 0)
  }, [savedRoutes, visibleRouteIds, heatmapEnabled])

  return null
}

import { useEffect, useRef } from 'react'
import { Feature } from 'ol'
import { LineString, Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Stroke, Circle, Fill, Text } from 'ol/style'
import { useMapStore } from '../../store/mapStore'
import { useRouteRecordingStore } from '../../store/routeRecordingStore'

// Generate distinct colors for different routes
const ROUTE_COLORS = [
  '#a855f7', // purple
  '#3b82f6', // blue
  '#22c55e', // green
  '#f97316', // orange
  '#ec4899', // pink
  '#14b8a6', // teal
  '#eab308', // yellow
  '#8b5cf6', // violet
]

export function SavedRoutesLayer() {
  const map = useMapStore(state => state.map)
  const { savedRoutes, visibleRouteIds } = useRouteRecordingStore()
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const sourceRef = useRef<VectorSource | null>(null)

  // Create layer on mount
  useEffect(() => {
    if (!map) return

    const source = new VectorSource()
    sourceRef.current = source

    const layer = new VectorLayer({
      source,
      zIndex: 998, // Just below current recording
      properties: {
        name: 'saved-routes-layer'
      }
    })

    layerRef.current = layer
    map.addLayer(layer)

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map])

  // Update features when visible routes change
  useEffect(() => {
    if (!sourceRef.current) return

    // Clear existing features
    sourceRef.current.clear()

    // Get visible routes
    const visibleRoutes = savedRoutes.filter(r => visibleRouteIds.has(r.id))

    visibleRoutes.forEach((route, index) => {
      const color = ROUTE_COLORS[index % ROUTE_COLORS.length]
      const coordinates = route.points.map(p => fromLonLat(p.coordinates))

      if (coordinates.length < 2) return

      // Create line feature
      const lineFeature = new Feature({
        geometry: new LineString(coordinates),
        routeId: route.id,
        routeName: route.name
      })

      lineFeature.setStyle(new Style({
        stroke: new Stroke({
          color: color,
          width: 4,
          lineCap: 'round',
          lineJoin: 'round'
        })
      }))

      sourceRef.current!.addFeature(lineFeature)

      // Add start point marker
      const startPoint = new Feature({
        geometry: new Point(coordinates[0]),
        routeId: route.id,
        type: 'start'
      })
      startPoint.setStyle(new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: '#22c55e' }),
          stroke: new Stroke({ color: 'white', width: 2 })
        }),
        text: new Text({
          text: 'S',
          font: 'bold 10px sans-serif',
          fill: new Fill({ color: 'white' }),
          offsetY: 1
        })
      }))
      sourceRef.current!.addFeature(startPoint)

      // Add end point marker
      const endPoint = new Feature({
        geometry: new Point(coordinates[coordinates.length - 1]),
        routeId: route.id,
        type: 'end'
      })
      endPoint.setStyle(new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: '#ef4444' }),
          stroke: new Stroke({ color: 'white', width: 2 })
        }),
        text: new Text({
          text: 'E',
          font: 'bold 10px sans-serif',
          fill: new Fill({ color: 'white' }),
          offsetY: 1
        })
      }))
      sourceRef.current!.addFeature(endPoint)

      // Add route name label at midpoint
      const midIndex = Math.floor(coordinates.length / 2)
      const labelPoint = new Feature({
        geometry: new Point(coordinates[midIndex]),
        routeId: route.id,
        type: 'label'
      })
      labelPoint.setStyle(new Style({
        text: new Text({
          text: route.name,
          font: '12px sans-serif',
          fill: new Fill({ color: '#1f2937' }),
          stroke: new Stroke({ color: 'white', width: 3 }),
          offsetY: -15
        })
      }))
      sourceRef.current!.addFeature(labelPoint)
    })
  }, [savedRoutes, visibleRouteIds])

  return null
}

import { useEffect, useRef } from 'react'
import { Feature } from 'ol'
import { LineString, Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Style, Stroke, Circle, Fill } from 'ol/style'
import { useMapStore } from '../../store/mapStore'
import { useRouteRecordingStore } from '../../store/routeRecordingStore'

export function RouteRecordingLayer() {
  const map = useMapStore(state => state.map)
  const { currentPoints, state: recordingState } = useRouteRecordingStore()
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const sourceRef = useRef<VectorSource | null>(null)

  // Create layer on mount
  useEffect(() => {
    if (!map) return

    const source = new VectorSource()
    sourceRef.current = source

    const layer = new VectorLayer({
      source,
      zIndex: 999, // High z-index to show above other layers
      properties: {
        name: 'route-recording-layer'
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

  // Update features when points change
  useEffect(() => {
    if (!sourceRef.current) return

    // Clear existing features
    sourceRef.current.clear()

    // Don't show anything if not recording or no points
    if (recordingState === 'idle' || currentPoints.length === 0) {
      return
    }

    // Convert points to map coordinates
    const coordinates = currentPoints.map(p => fromLonLat(p.coordinates))

    // Create line feature if we have at least 2 points
    if (coordinates.length >= 2) {
      const lineFeature = new Feature({
        geometry: new LineString(coordinates)
      })

      // Style for the recorded route line
      lineFeature.setStyle(new Style({
        stroke: new Stroke({
          color: recordingState === 'paused' ? 'rgba(234, 179, 8, 0.8)' : 'rgba(168, 85, 247, 0.8)', // Yellow when paused, purple when recording
          width: 4,
          lineCap: 'round',
          lineJoin: 'round'
        })
      }))

      sourceRef.current.addFeature(lineFeature)
    }

    // Add start point marker
    if (coordinates.length >= 1) {
      const startPoint = new Feature({
        geometry: new Point(coordinates[0])
      })
      startPoint.setStyle(new Style({
        image: new Circle({
          radius: 8,
          fill: new Fill({ color: 'rgba(34, 197, 94, 1)' }), // Green for start
          stroke: new Stroke({ color: 'white', width: 2 })
        })
      }))
      sourceRef.current.addFeature(startPoint)
    }

    // Add current position marker (last point)
    if (coordinates.length >= 1) {
      const currentPos = new Feature({
        geometry: new Point(coordinates[coordinates.length - 1])
      })
      currentPos.setStyle(new Style({
        image: new Circle({
          radius: 6,
          fill: new Fill({ color: recordingState === 'paused' ? 'rgba(234, 179, 8, 1)' : 'rgba(168, 85, 247, 1)' }),
          stroke: new Stroke({ color: 'white', width: 2 })
        })
      }))
      sourceRef.current.addFeature(currentPos)
    }
  }, [currentPoints, recordingState])

  return null
}

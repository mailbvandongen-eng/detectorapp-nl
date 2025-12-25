import { useEffect, useRef } from 'react'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Fill, Stroke, Icon, Circle as CircleStyle } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import { useMapStore, useGPSStore } from '../../store'

// Create arrow SVG for GPS marker - Google Maps style navigation arrow
function createArrowSVG(color: string = '#4285F4'): string {
  // Simple arrow pointing up (north), will be rotated by heading
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
    <polygon points="20,4 32,32 20,26 8,32" fill="${color}" stroke="white" stroke-width="2.5" stroke-linejoin="round"/>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

export function GpsMarker() {
  const map = useMapStore(state => state.map)
  const rotation = useMapStore(state => state.rotation)
  const position = useGPSStore(state => state.position)
  const accuracy = useGPSStore(state => state.accuracy)
  const tracking = useGPSStore(state => state.tracking)
  const navigationMode = useGPSStore(state => state.navigationMode)
  const smoothHeading = useGPSStore(state => state.smoothHeading)
  const firstFix = useGPSStore(state => state.firstFix)
  const resetFirstFix = useGPSStore(state => state.resetFirstFix)
  const centerOnUser = useGPSStore(state => state.config.centerOnUser)
  const animationDuration = useGPSStore(state => state.config.animationDuration)

  const markerRef = useRef<Feature | null>(null)
  const accuracyRef = useRef<Feature | null>(null)
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null)

  // Initialize GPS marker layer
  useEffect(() => {
    if (!map) return
    // Show marker if tracking OR if we have a last known position
    if (!tracking && !position) return

    // Create features
    const defaultCoords = fromLonLat([5.1214, 52.0907])

    // GPS marker (navigation arrow - Google Maps style)
    markerRef.current = new Feature({
      geometry: new Point(defaultCoords)
    })
    // Arrow style will be set in the heading update effect

    // Accuracy circle
    accuracyRef.current = new Feature({
      geometry: new Point(defaultCoords)
    })

    // Create layer (no cone needed - arrow shows direction)
    layerRef.current = new VectorLayer({
      source: new VectorSource({
        features: [accuracyRef.current, markerRef.current]
      }),
      zIndex: 1000
    })

    map.addLayer(layerRef.current)

    // Cleanup
    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map, tracking, position])

  // Update position
  useEffect(() => {
    if (!map || !position || !markerRef.current || !accuracyRef.current) return

    const coords = fromLonLat([position.lng, position.lat])

    // Update marker position
    markerRef.current.getGeometry()?.setCoordinates(coords)
    accuracyRef.current.getGeometry()?.setCoordinates(coords)

    // Update accuracy circle
    if (accuracy) {
      const metersPerPixel = map.getView().getResolution() || 1
      const accuracyRadius = accuracy / metersPerPixel

      accuracyRef.current.setStyle(
        new Style({
          image: new CircleStyle({
            radius: Math.min(accuracyRadius, 100),
            fill: new Fill({ color: 'rgba(66, 133, 244, 0.15)' }),
            stroke: new Stroke({ color: '#4285f4', width: 2 })
          })
        })
      )
    }

    // First GPS fix: jump to position + zoom to street level
    if (firstFix && tracking) {
      map.getView().setCenter(coords)
      map.getView().setZoom(17)
      resetFirstFix()
      console.log('✓ GPS locked - jumped to position + street level')
    }

    // Center on user (Waze-style) - only when actively tracking
    if (tracking && centerOnUser && !firstFix) {
      map.getView().animate({
        center: coords,
        duration: animationDuration
      })
    }
  }, [map, tracking, position, accuracy, firstFix, resetFirstFix, centerOnUser, animationDuration])

  // Update arrow rotation based on heading
  useEffect(() => {
    if (!map || !markerRef.current) return

    const view = map.getView()
    const mapRotation = view.getRotation()

    // Calculate arrow rotation
    let arrowRotation: number
    if (navigationMode === 'free') {
      // Free mode: arrow rotates with compass/GPS heading
      // If no heading available, point north (0)
      arrowRotation = smoothHeading !== null ? (smoothHeading * Math.PI) / 180 : 0
    } else {
      // Drive mode: arrow counter-rotates to stay pointing up on screen
      arrowRotation = -mapRotation
    }

    // Set arrow style with rotation
    markerRef.current.setStyle(
      new Style({
        image: new Icon({
          src: createArrowSVG('#4285F4'),
          scale: 1,
          rotation: arrowRotation,
          rotateWithView: false, // We handle rotation ourselves
          anchor: [0.5, 0.5] // Center of the arrow
        })
      })
    )
  }, [map, navigationMode, smoothHeading, rotation])

  return null // No visual component, just OpenLayers features
}

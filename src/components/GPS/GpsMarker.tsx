import { useEffect, useRef } from 'react'
import { Feature } from 'ol'
import { Point, Polygon } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import { useMapStore, useGPSStore } from '../../store'

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
  const coneRef = useRef<Feature | null>(null)
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null)

  // Initialize GPS marker layer
  useEffect(() => {
    if (!map) return
    // Show marker if tracking OR if we have a last known position
    if (!tracking && !position) return

    // Create features
    const defaultCoords = fromLonLat([5.1214, 52.0907])

    // GPS marker (blue beacon - Google Maps style)
    // 20px diameter = radius 10px, mooi wit randje
    markerRef.current = new Feature({
      geometry: new Point(defaultCoords)
    })
    markerRef.current.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 10,                             // 20px diameter - iets kleiner dan 27px
          fill: new Fill({ color: '#4285F4' }),   // Google Blue
          stroke: new Stroke({ color: 'white', width: 4 }) // 4px mooi wit randje
        })
      })
    )

    // Accuracy circle
    accuracyRef.current = new Feature({
      geometry: new Point(defaultCoords)
    })

    // Direction cone
    coneRef.current = new Feature({
      geometry: new Polygon([[[0, 0], [0, 0], [0, 0], [0, 0]]])
    })
    coneRef.current.setStyle(
      new Style({
        fill: new Fill({ color: 'rgba(66, 133, 244, 0.5)' }),
        stroke: new Stroke({ color: '#4285f4', width: 2 })
      })
    )

    // Create layer
    layerRef.current = new VectorLayer({
      source: new VectorSource({
        features: [accuracyRef.current, coneRef.current, markerRef.current]
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

  // Update direction cone
  useEffect(() => {
    if (!map || !position || !coneRef.current || !markerRef.current) return

    const coords = fromLonLat([position.lng, position.lat])
    const view = map.getView()
    const resolution = view.getResolution() || 1

    // Google Maps style cone: "Zaklamp straal" / kijkrichting indicator
    // Beacon diameter: 20px (radius 10), cone start vanaf zijkant beacon
    const beaconRadius = 10
    const coneLength = beaconRadius * 3 * resolution  // ~45px vanaf beacon edge
    const coneAngle = Math.PI / 4                     // ~51° totale openingshoek (45-60° range)

    // Cone rotation based on navigation mode
    const mapRotation = view.getRotation()

    let coneHeading: number
    if (navigationMode === 'free') {
      // Vrije modus: cone rotates with phone orientation (compass heading)
      // If no heading available, point north (0)
      coneHeading = smoothHeading !== null ? (smoothHeading * Math.PI) / 180 : 0
    } else {
      // Rijmodus: cone counter-rotates to stay pointing up on screen
      // If map rotation = R, cone heading = -R, so cone appears at 0° (up)
      coneHeading = -mapRotation
    }

    // Cone start point: vanaf de RAND van de beacon (niet center)
    const startX = coords[0] + Math.sin(coneHeading) * beaconRadius * resolution
    const startY = coords[1] + Math.cos(coneHeading) * beaconRadius * resolution

    // Calculate cone edges from start point
    // Left edge of cone
    const leftAngle = coneHeading - coneAngle / 2
    const leftX = startX + Math.sin(leftAngle) * coneLength
    const leftY = startY + Math.cos(leftAngle) * coneLength

    // Right edge of cone
    const rightAngle = coneHeading + coneAngle / 2
    const rightX = startX + Math.sin(rightAngle) * coneLength
    const rightY = startY + Math.cos(rightAngle) * coneLength

    // Cone coordinates: Start from edge of beacon, fan out
    const coneCoords = [
      [startX, startY],  // Edge of beacon (start point)
      [leftX, leftY],    // Left edge
      [rightX, rightY],  // Right edge
      [startX, startY]   // Back to start (close polygon)
    ]

    coneRef.current.setGeometry(new Polygon([coneCoords]))

    // Google Maps style: "Zaklamp straal" effect
    // Gradient van 40% bij beacon → 5% bij punt (gemiddeld ~25% opacity)
    // Zachte/vervagde randen (geen harde stroke)
    coneRef.current.setStyle(
      new Style({
        fill: new Fill({ color: 'rgba(66, 133, 244, 0.18)' }), // Gemiddelde opacity tussen basis (40%) en punt (5%)
        stroke: new Stroke({ color: 'rgba(66, 133, 244, 0.1)', width: 0.5 }) // Zeer subtiele rand
      })
    )
  }, [map, position, rotation, navigationMode, smoothHeading])

  return null // No visual component, just OpenLayers features
}

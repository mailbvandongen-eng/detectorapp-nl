import { useEffect, useRef, useMemo } from 'react'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Fill, Stroke, Icon, Circle as CircleStyle } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import { useMapStore, useGPSStore } from '../../store'

// Get goTo function for syncing both map engines
const useGoTo = () => useMapStore(state => state.goTo)
import { useSettingsStore } from '../../store/settingsStore'

// Arrow SVG - rotates with heading to show direction
const ARROW_SVG = (() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <polygon points="24,6 38,38 24,30 10,38" fill="#4285F4" stroke="white" stroke-width="3" stroke-linejoin="round"/>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
})()

// Passive dot style - small blue circle (Google Maps style)
const DOT_STYLE = new Style({
  image: new CircleStyle({
    radius: 7,
    fill: new Fill({ color: '#4285F4' }),
    stroke: new Stroke({ color: 'white', width: 2.5 })
  })
})

export function GpsMarker() {
  const map = useMapStore(state => state.map)
  const goTo = useGoTo()
  const position = useGPSStore(state => state.position)
  const accuracy = useGPSStore(state => state.accuracy)
  const tracking = useGPSStore(state => state.tracking)
  const smoothHeading = useGPSStore(state => state.smoothHeading)
  const navigationMode = useGPSStore(state => state.navigationMode)
  const showAccuracyCircle = useSettingsStore(state => state.showAccuracyCircle)
  const firstFix = useGPSStore(state => state.firstFix)
  const resetFirstFix = useGPSStore(state => state.resetFirstFix)
  const centerOnUser = useGPSStore(state => state.config.centerOnUser)

  const markerRef = useRef<Feature | null>(null)
  const accuracyRef = useRef<Feature | null>(null)
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null)

  // Arrow style - rotates with heading to show direction on the MAP
  const createArrowStyle = useMemo(() => (rotation: number) => new Style({
    image: new Icon({
      src: ARROW_SVG,
      scale: 0.9,
      rotation: rotation,
      rotateWithView: true,
      anchor: [0.5, 0.5]
    })
  }), [])

  // Initialize GPS marker layer - show whenever we have a position
  useEffect(() => {
    if (!map || !position) return

    const coords = fromLonLat([position.lng, position.lat])

    markerRef.current = new Feature({
      geometry: new Point(coords)
    })
    // Start with dot or arrow depending on tracking state
    markerRef.current.setStyle(tracking ? createArrowStyle(0) : DOT_STYLE)

    accuracyRef.current = new Feature({
      geometry: new Point(coords)
    })

    layerRef.current = new VectorLayer({
      source: new VectorSource({
        features: [accuracyRef.current, markerRef.current]
      }),
      zIndex: 1000
    })

    map.addLayer(layerRef.current)

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map, !!position, createArrowStyle]) // Only re-create layer when map loads or position first appears

  // Switch between dot and arrow when tracking state changes
  useEffect(() => {
    if (!markerRef.current) return

    if (tracking) {
      const rotation = smoothHeading !== null ? (smoothHeading * Math.PI) / 180 : 0
      markerRef.current.setStyle(createArrowStyle(rotation))
    } else {
      markerRef.current.setStyle(DOT_STYLE)
    }
  }, [tracking, createArrowStyle, smoothHeading])

  // Update position and center map
  useEffect(() => {
    if (!map || !position || !markerRef.current || !accuracyRef.current) return

    const coords = fromLonLat([position.lng, position.lat])

    markerRef.current.getGeometry()?.setCoordinates(coords)
    accuracyRef.current.getGeometry()?.setCoordinates(coords)

    // Accuracy circle - only when tracking
    if (tracking && showAccuracyCircle && accuracy) {
      const metersPerPixel = map.getView().getResolution() || 1
      const accuracyRadius = Math.min(accuracy / metersPerPixel, 80)

      accuracyRef.current.setStyle(
        new Style({
          image: new CircleStyle({
            radius: accuracyRadius,
            fill: new Fill({ color: 'rgba(66, 133, 244, 0.12)' })
          })
        })
      )
    } else {
      accuracyRef.current.setStyle(new Style({}))
    }

    // First GPS fix: jump to position (syncs both ArcGIS and OL)
    if (firstFix && tracking && position) {
      goTo({ center: [position.lng, position.lat], zoom: 17, animate: false })
      resetFirstFix()
      return
    }

    // Center on user when tracking (syncs both ArcGIS and OL)
    if (tracking && centerOnUser && !firstFix && position) {
      goTo({ center: [position.lng, position.lat], animate: true })
    }
  }, [map, tracking, position, accuracy, firstFix, resetFirstFix, centerOnUser, showAccuracyCircle, goTo])

  // Update arrow rotation when tracking
  useEffect(() => {
    if (!markerRef.current || !tracking) return

    const rotation = smoothHeading !== null ? (smoothHeading * Math.PI) / 180 : 0
    markerRef.current.setStyle(createArrowStyle(rotation))
  }, [smoothHeading, createArrowStyle, tracking])

  // Heading-up mode: rotate map so heading direction is "up" (syncs both ArcGIS and OL)
  useEffect(() => {
    if (!map || !tracking) return

    if (navigationMode === 'headingUp' && smoothHeading !== null) {
      // goTo takes rotation in degrees, negative to rotate map opposite to heading
      goTo({ rotation: -smoothHeading, animate: true })
    }
  }, [map, tracking, navigationMode, smoothHeading, goTo])

  // Reset map rotation when leaving heading-up mode (syncs both ArcGIS and OL)
  useEffect(() => {
    if (!map) return

    if (navigationMode === 'free') {
      goTo({ rotation: 0, animate: true })
    }
  }, [map, navigationMode, goTo])

  return null
}

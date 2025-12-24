import { useEffect, useRef } from 'react'
import { useMapStore } from '../store/mapStore'
import { useGPSStore } from '../store/gpsStore'

// Original smooth easing (worked well before)
const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
}

export function useMapRotation() {
  const map = useMapStore(state => state.map)
  const rotationEnabled = useMapStore(state => state.rotationEnabled)
  const setRotation = useMapStore(state => state.setRotation)
  const smoothHeading = useGPSStore(state => state.smoothHeading)
  const tracking = useGPSStore(state => state.tracking)
  const navigationMode = useGPSStore(state => state.navigationMode)
  const lastRotationRef = useRef<number | null>(null)
  const lastModeRef = useRef<string | null>(null)

  // Handle zoom when switching to drive mode
  useEffect(() => {
    if (!map) return

    // Switching to drive mode: jump to neighborhood zoom (15)
    if (navigationMode === 'drive' && lastModeRef.current !== 'drive') {
      map.getView().animate({
        zoom: 15,
        duration: 500
      })
      console.log('🚗 Rijmodus: zoom naar wijkniveau (15)')
    }

    lastModeRef.current = navigationMode
  }, [map, navigationMode])

  // Handle map rotation based on mode
  useEffect(() => {
    // Vrije modus: keep map north-up (rotation = 0)
    if (navigationMode === 'free') {
      if (map && map.getView().getRotation() !== 0) {
        map.getView().animate({ rotation: 0, duration: 500 })
        setRotation(0)
        lastRotationRef.current = null
      }
      return
    }

    // Rijmodus: rotate map with movement direction
    if (!map || !tracking || !rotationEnabled || smoothHeading === null) {
      // Reset rotation if disabled or not tracking
      if (map && !tracking) {
        map.getView().animate({ rotation: 0, duration: 500 })
        setRotation(0)
        lastRotationRef.current = null
      }
      return
    }

    // Convert heading to radians for OpenLayers
    const targetRotation = (smoothHeading * Math.PI) / 180
    const currentRotation = lastRotationRef.current ?? map.getView().getRotation()

    // Calculate angular difference (handle wrap-around)
    let diff = targetRotation - currentRotation
    while (diff > Math.PI) diff -= 2 * Math.PI
    while (diff < -Math.PI) diff += 2 * Math.PI

    // Threshold: Only rotate if change exceeds 5 degrees
    const ROTATION_THRESHOLD = 0.087 // ~5 degrees
    if (Math.abs(diff) < ROTATION_THRESHOLD) return

    // Original smooth animation (worked well)
    map.getView().animate({
      rotation: targetRotation,
      duration: 250, // Original timing
      easing: easeInOutQuad // Original easing
    })

    lastRotationRef.current = targetRotation
    setRotation(smoothHeading)
  }, [map, tracking, rotationEnabled, smoothHeading, setRotation])
}

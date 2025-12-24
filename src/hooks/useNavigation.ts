import { useEffect, useRef } from 'react'
import { useGPSStore } from '../store/gpsStore'
import { useNavigationStore } from '../store/navigationStore'
import { useMapStore } from '../store/mapStore'
import { fromLonLat } from 'ol/proj'

/**
 * Hook that manages navigation behavior:
 * - Auto-activates drive mode when navigation starts
 * - Auto-centers map on user during navigation
 * - Updates current step based on GPS position
 * - Manages 3D tilt effect
 */
export function useNavigation() {
  const map = useMapStore(state => state.map)
  const position = useGPSStore(state => state.position)
  const tracking = useGPSStore(state => state.tracking)
  const navigationMode = useGPSStore(state => state.navigationMode)
  const toggleMode = useGPSStore(state => state.toggleMode)

  const isNavigating = useNavigationStore(state => state.isNavigating)
  const updateCurrentStep = useNavigationStore(state => state.updateCurrentStep)
  const destination = useNavigationStore(state => state.destination)

  const wasNavigatingRef = useRef(false)
  const lastCenterTimeRef = useRef(0)

  // Auto-activate drive mode when navigation starts
  useEffect(() => {
    if (isNavigating && !wasNavigatingRef.current) {
      // Navigation just started
      console.log('🧭 Navigation started - activating drive mode')

      // Switch to drive mode if not already
      if (navigationMode === 'free') {
        toggleMode()
      }

      wasNavigatingRef.current = true
    } else if (!isNavigating && wasNavigatingRef.current) {
      // Navigation just stopped
      console.log('🧭 Navigation stopped - deactivating drive mode')

      // Switch back to free mode
      if (navigationMode === 'drive') {
        toggleMode()
      }

      wasNavigatingRef.current = false
    }
  }, [isNavigating, navigationMode, toggleMode])

  // Update current step when position changes
  useEffect(() => {
    if (!isNavigating || !position) return

    updateCurrentStep({
      lng: position.lng,
      lat: position.lat
    })
  }, [isNavigating, position, updateCurrentStep])

  // Auto-center on user during navigation (with smoother animation)
  useEffect(() => {
    if (!map || !position || !isNavigating || !tracking) return

    const now = Date.now()
    // Throttle centering to every 500ms for smoother experience
    if (now - lastCenterTimeRef.current < 500) return
    lastCenterTimeRef.current = now

    const coords = fromLonLat([position.lng, position.lat])

    // Smooth center animation
    map.getView().animate({
      center: coords,
      duration: 300
    })
  }, [map, position, isNavigating, tracking])

  // Keep map zoomed at navigation level
  useEffect(() => {
    if (!map || !isNavigating) return

    const currentZoom = map.getView().getZoom() || 15

    // If zoomed out too far during navigation, zoom back in
    if (currentZoom < 14) {
      map.getView().animate({
        zoom: 15,
        duration: 500
      })
    }
  }, [map, isNavigating, position])

  return {
    isNavigating,
    destination
  }
}

import { useEffect, useCallback } from 'react'
import { useGPSStore } from '../store'

export function useGPS() {
  const {
    tracking,
    startTracking,
    stopTracking,
    updatePosition,
    setWatchId
  } = useGPSStore()

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    updatePosition(position)
  }, [updatePosition])

  const handleError = useCallback((error: GeolocationPositionError) => {
    console.error('GPS error:', error)
    alert(`GPS fout: ${error.message}`)
    stopTracking()
  }, [stopTracking])

  useEffect(() => {
    if (!tracking) return

    if (!navigator.geolocation) {
      alert('Geolocation wordt niet ondersteund door deze browser')
      stopTracking()
      return
    }

    // Seed position quickly with a low-accuracy one-shot fix.
    // This helps centering and marker visibility on slow/weak GPS devices.
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      () => {
        // Ignore here; continuous watch below remains the primary source.
      },
      {
        enableHighAccuracy: false,
        maximumAge: 120000,
        timeout: 5000
      }
    )

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 12000
      }
    )

    setWatchId(id)

    // Cleanup on unmount or tracking stop
    return () => {
      navigator.geolocation.clearWatch(id)
    }
  }, [tracking, handleSuccess, handleError, setWatchId, stopTracking])

  return {
    tracking,
    start: startTracking,
    stop: stopTracking,
    toggle: () => tracking ? stopTracking() : startTracking()
  }
}

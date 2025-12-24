import { useEffect } from 'react'
import { useGPSStore } from '../store'

export function useDeviceOrientation() {
  const tracking = useGPSStore(state => state.tracking)
  const headingSource = useGPSStore(state => state.headingSource)
  const updateHeading = useGPSStore(state => state.updateHeading)

  useEffect(() => {
    // Only use compass when headingSource is explicitly 'compass'
    // Don't update if: not tracking, GPS is active, or FREEZE mode (null)
    if (!tracking || headingSource !== 'compass') return

    // THROTTLE: DeviceOrientation fires at 60Hz, but we only need 10Hz max
    // This prevents animation conflicts and jitter
    let lastUpdate = 0
    const THROTTLE_MS = 100 // 10 updates per second (was 60Hz = 16ms)

    const handleOrientation = (event: DeviceOrientationEvent) => {
      const now = Date.now()
      if (now - lastUpdate < THROTTLE_MS) return
      lastUpdate = now

      if (event.alpha !== null) {
        // Standard deviceorientation (Android Chrome)
        // Alpha is 0-360, where 0 is North
        // Convert to heading (360 - alpha because alpha increases clockwise)
        updateHeading(360 - event.alpha, 'compass')
      }
    }

    const handleOrientationAbsolute = (event: DeviceOrientationEvent) => {
      const now = Date.now()
      if (now - lastUpdate < THROTTLE_MS) return
      lastUpdate = now

      if (event.alpha !== null) {
        // iOS Safari uses deviceorientationabsolute
        updateHeading(360 - event.alpha, 'compass')
      }
    }

    const handleWebkitOrientation = (event: any) => {
      const now = Date.now()
      if (now - lastUpdate < THROTTLE_MS) return
      lastUpdate = now

      // iOS Safari fallback (older devices)
      if (event.webkitCompassHeading !== undefined) {
        updateHeading(event.webkitCompassHeading, 'compass')
      }
    }

    // Listen to both events (device-specific)
    window.addEventListener('deviceorientationabsolute', handleOrientationAbsolute)
    window.addEventListener('deviceorientation', handleOrientation)
    window.addEventListener('deviceorientation', handleWebkitOrientation)

    return () => {
      window.removeEventListener('deviceorientationabsolute', handleOrientationAbsolute)
      window.removeEventListener('deviceorientation', handleOrientation)
      window.removeEventListener('deviceorientation', handleWebkitOrientation)
    }
  }, [tracking, headingSource, updateHeading])
}

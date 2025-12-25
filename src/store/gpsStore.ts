import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface GPSConfig {
  smoothingFactor: number
  minRotationSpeed: number
  centerOnUser: boolean
  animationDuration: number
}

interface GPSPosition {
  lat: number
  lng: number
}

type NavigationMode = 'free' | 'drive'

interface GPSState {
  // State
  tracking: boolean
  navigationMode: NavigationMode
  position: GPSPosition | null
  heading: number | null
  smoothHeading: number | null
  accuracy: number | null
  speed: number | null
  headingSource: 'gps' | 'compass' | null
  watchId: number | null
  firstFix: boolean

  // Configuration
  config: GPSConfig

  // Actions
  startTracking: () => void
  stopTracking: () => void
  toggleMode: () => void
  updatePosition: (pos: GeolocationPosition) => void
  updateHeading: (raw: number, source?: 'gps' | 'compass') => void
  setWatchId: (id: number) => void
  resetFirstFix: () => void
}

export const useGPSStore = create<GPSState>()(
  immer((set, get) => ({
    // Initial state
    tracking: true, // GPS always on by default
    navigationMode: 'free', // Default: vrije modus (north-up, cone rotates)
    position: null,
    heading: null,
    smoothHeading: null,
    accuracy: null,
    speed: null,
    headingSource: null,
    watchId: null,
    firstFix: true,

    config: {
      smoothingFactor: 0.2, // Smoother rotation (80% old, 20% new) - reduces jitter
      minRotationSpeed: 8, // GPS dead-zone: 8° - larger to reduce noise
      centerOnUser: true,
      animationDuration: 100
    },

    // Actions
    startTracking: () => {
      set(state => {
        state.tracking = true
      })
    },

    stopTracking: () => {
      set(state => {
        const { watchId } = get()
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId)
        }

        // Stop tracking but KEEP position and heading visible
        state.tracking = false
        state.speed = null
        state.headingSource = null
        state.watchId = null
        // Don't reset position, heading, smoothHeading - beacon stays visible
      })
    },

    toggleMode: () => {
      set(state => {
        state.navigationMode = state.navigationMode === 'free' ? 'drive' : 'free'
        console.log(`🗺️ Navigation mode: ${state.navigationMode}`)
      })
    },

    updatePosition: (pos: GeolocationPosition) => {
      set(state => {
        state.position = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
        state.accuracy = pos.coords.accuracy
        state.speed = pos.coords.speed // meters/second (can be null)

        // GPS Reliability Check: Indoor detection via GPS accuracy
        const GPS_ACCURACY_THRESHOLD = 15 // meters - below this = outdoor/good GPS
        const SPEED_THRESHOLD = 0.5 // ~1.8 km/h (slow walking) - was 1.8 (6.5 km/h)

        const isGPSReliable =
          pos.coords.accuracy !== null &&
          pos.coords.accuracy < GPS_ACCURACY_THRESHOLD

        // INDOOR DETECTION: Poor GPS = freeze rotation completely
        // Indoors, BOTH GPS and compass are unreliable (interference)
        if (!isGPSReliable) {
          // Poor GPS accuracy (> 15m) = likely indoors
          // Freeze rotation - no GPS, no compass (compass unreliable indoors too!)
          state.headingSource = null
          return
        }

        // OUTDOOR (good GPS): Hybrid GPS/compass system
        if (
          pos.coords.heading !== null &&
          pos.coords.speed !== null &&
          pos.coords.speed > SPEED_THRESHOLD
        ) {
          // Moving fast with good GPS - use GPS bearing
          state.headingSource = 'gps'
          const gpsHeading = pos.coords.heading // 0-360 where 0 is North

          // Use unified updateHeading with 'gps' source (8° dead-zone)
          get().updateHeading(gpsHeading, 'gps')
        } else {
          // Stationary with good GPS (outdoor) - use compass
          // Compass works well outdoors with clear magnetic field
          state.headingSource = 'compass'
        }
      })
    },

    updateHeading: (raw: number, source: 'gps' | 'compass' = 'compass') => {
      set(state => {
        const { smoothHeading: current, config } = get()

        // First heading value
        if (current === null) {
          state.smoothHeading = raw
          state.heading = raw
          return
        }

        // Handle wrap-around (359° -> 1° should be +2°, not -358°)
        let diff = raw - current
        if (diff > 180) diff -= 360
        if (diff < -180) diff += 360

        // Dead-zone to prevent jitter
        // Compass (outdoor stationary): 8° threshold (was 3°)
        // GPS (outdoor moving): 8° threshold
        const threshold = source === 'compass' ? 8 : config.minRotationSpeed
        if (Math.abs(diff) < threshold) return

        // Exponential smoothing
        const newSmooth = current + diff * config.smoothingFactor
        state.smoothHeading = (newSmooth + 360) % 360
        state.heading = raw
      })
    },

    setWatchId: (id: number) => {
      set(state => {
        state.watchId = id
      })
    },

    resetFirstFix: () => {
      set(state => {
        state.firstFix = false
      })
    }
  }))
)

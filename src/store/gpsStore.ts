import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

export type NavigationMode = 'free' | 'headingUp'

interface GPSPosition {
  lat: number
  lng: number
}

interface GPSState {
  // State
  tracking: boolean
  position: GPSPosition | null
  heading: number | null
  smoothHeading: number | null
  rawGPSHeading: number | null
  accuracy: number | null
  speed: number | null
  headingSource: 'gps' | 'compass' | null
  watchId: number | null
  firstFix: boolean
  navigationMode: NavigationMode

  // Configuration
  config: {
    centerOnUser: boolean
  }

  // Actions
  fetchPassivePosition: () => void
  startTracking: () => void
  stopTracking: () => void
  updatePosition: (pos: GeolocationPosition) => void
  setSmoothedHeading: (heading: number) => void
  setWatchId: (id: number) => void
  resetFirstFix: () => void
  setNavigationMode: (mode: NavigationMode) => void
  toggleNavigationMode: () => void
}

export const useGPSStore = create<GPSState>()(
  immer((set, get) => ({
    // Initial state
    tracking: false,
    position: null,
    heading: null,
    smoothHeading: null,
    rawGPSHeading: null,
    accuracy: null,
    speed: null,
    headingSource: null,
    watchId: null,
    firstFix: true,
    navigationMode: 'free' as NavigationMode,

    config: {
      centerOnUser: true
    },

    // Actions
    fetchPassivePosition: () => {
      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          set(state => {
            // Only set passive position if not already tracking
            if (!state.tracking) {
              state.position = {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude
              }
              state.accuracy = pos.coords.accuracy
            }
          })
        },
        () => {
          // Silently fail - passive position is not critical
        },
        { enableHighAccuracy: false, maximumAge: 60000, timeout: 10000 }
      )
    },

    startTracking: () => {
      set(state => {
        state.tracking = true
        state.firstFix = true // Reset zodat we naar straatniveau zoomen bij nieuwe GPS sessie
      })
    },

    stopTracking: () => {
      set(state => {
        const { watchId } = get()
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId)
        }

        state.tracking = false
        state.speed = null
        state.headingSource = null
        state.heading = null
        state.smoothHeading = null
        state.rawGPSHeading = null
        state.watchId = null
        state.navigationMode = 'free'
        // Position stays visible as a passive dot
      })
    },

    updatePosition: (pos: GeolocationPosition) => {
      set(state => {
        state.position = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        }
        state.accuracy = pos.coords.accuracy
        state.speed = pos.coords.speed

        // Store raw GPS heading for useHeading to process
        state.rawGPSHeading = pos.coords.heading

        // Determine heading source based on GPS quality and speed
        const GPS_ACCURACY_THRESHOLD = 20
        const SPEED_THRESHOLD = 0.5 // ~1.8 km/h

        const isGPSReliable =
          pos.coords.accuracy !== null &&
          pos.coords.accuracy < GPS_ACCURACY_THRESHOLD

        if (!isGPSReliable) {
          // Poor GPS - no reliable heading source
          state.headingSource = null
        } else if (
          pos.coords.heading !== null &&
          pos.coords.speed !== null &&
          pos.coords.speed > SPEED_THRESHOLD
        ) {
          // Moving with good GPS - use GPS bearing
          state.headingSource = 'gps'
        } else {
          // Stationary with good GPS - use compass
          state.headingSource = 'compass'
        }
      })
    },

    setSmoothedHeading: (heading: number) => {
      set(state => {
        state.smoothHeading = heading
        state.heading = heading
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
    },

    setNavigationMode: (mode: NavigationMode) => {
      set(state => {
        state.navigationMode = mode
      })
    },

    toggleNavigationMode: () => {
      set(state => {
        state.navigationMode = state.navigationMode === 'free' ? 'headingUp' : 'free'
      })
    }
  }))
)

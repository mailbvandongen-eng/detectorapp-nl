import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface Coordinate {
  lng: number
  lat: number
}

interface NavigationStep {
  instruction: string
  maneuver: string // turn-left, turn-right, arrive, depart, straight, etc.
  distance: number // meters
  duration: number // seconds
  location: Coordinate
}

interface NavigationState {
  // State
  isNavigating: boolean
  destination: Coordinate | null
  destinationName: string | null
  routeCoordinates: Coordinate[] | null
  distance: number | null // total meters
  duration: number | null // total seconds
  loading: boolean
  error: string | null

  // Turn-by-turn
  steps: NavigationStep[]
  currentStepIndex: number

  // Voice guidance
  voiceEnabled: boolean
  lastSpokenStep: number
  lastSpokenTime: number // Timestamp to prevent rapid repeats
  lastSpokenDistance: number // Distance at which we last spoke

  // Actions
  startNavigation: (destination: Coordinate, name: string, origin: Coordinate) => Promise<void>
  stopNavigation: () => void
  clearError: () => void
  updateCurrentStep: (userLocation: Coordinate) => void
  setVoiceEnabled: (enabled: boolean) => void
  speakInstruction: (text: string) => void
}

// OSRM Demo server (gratis, geen API key nodig)
const OSRM_API = 'https://router.project-osrm.org/route/v1/driving'

// Translate OSRM maneuver types to Dutch instructions
function translateManeuver(maneuver: string, modifier?: string): string {
  const translations: Record<string, string> = {
    'depart': 'Start de route',
    'arrive': 'U bent aangekomen',
    'turn-left': 'Sla linksaf',
    'turn-right': 'Sla rechtsaf',
    'turn-slight-left': 'Houd links aan',
    'turn-slight-right': 'Houd rechts aan',
    'turn-sharp-left': 'Sla scherp linksaf',
    'turn-sharp-right': 'Sla scherp rechtsaf',
    'uturn': 'Keer om',
    'straight': 'Ga rechtdoor',
    'merge': 'Voeg in',
    'on-ramp': 'Neem de oprit',
    'off-ramp': 'Neem de afrit',
    'fork-left': 'Houd links aan bij de splitsing',
    'fork-right': 'Houd rechts aan bij de splitsing',
    'end-of-road-left': 'Sla linksaf aan het einde van de weg',
    'end-of-road-right': 'Sla rechtsaf aan het einde van de weg',
    'roundabout': 'Neem de rotonde',
    'rotary': 'Neem de rotonde',
    'continue': 'Blijf de weg volgen',
    'notification': 'Let op'
  }

  // Combine maneuver with modifier for more specific instructions
  const key = modifier ? `${maneuver}-${modifier}` : maneuver
  return translations[key] || translations[maneuver] || 'Volg de route'
}

// Calculate distance between two coordinates (Haversine formula)
function getDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

export const useNavigationStore = create<NavigationState>()(
  immer((set, get) => ({
    isNavigating: false,
    destination: null,
    destinationName: null,
    routeCoordinates: null,
    distance: null,
    duration: null,
    loading: false,
    error: null,
    steps: [],
    currentStepIndex: 0,
    voiceEnabled: true,
    lastSpokenStep: -1,
    lastSpokenTime: 0,
    lastSpokenDistance: -1,

    startNavigation: async (destination: Coordinate, name: string, origin: Coordinate) => {
      set(state => {
        state.loading = true
        state.error = null
      })

      try {
        // OSRM format with steps for turn-by-turn
        const url = `${OSRM_API}/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=true`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error('Route berekening mislukt')
        }

        const data = await response.json()

        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0]

          // OSRM returns GeoJSON coordinates [lng, lat]
          const coordinates: Coordinate[] = route.geometry.coordinates.map(
            (coord: [number, number]) => ({
              lng: coord[0],
              lat: coord[1]
            })
          )

          // Extract turn-by-turn steps
          const steps: NavigationStep[] = []
          if (route.legs && route.legs[0] && route.legs[0].steps) {
            for (const step of route.legs[0].steps) {
              const maneuverType = step.maneuver?.type || 'continue'
              const modifier = step.maneuver?.modifier

              steps.push({
                instruction: translateManeuver(maneuverType, modifier),
                maneuver: modifier ? `${maneuverType}-${modifier}` : maneuverType,
                distance: step.distance || 0,
                duration: step.duration || 0,
                location: {
                  lng: step.maneuver?.location?.[0] || origin.lng,
                  lat: step.maneuver?.location?.[1] || origin.lat
                }
              })
            }
          }

          set(state => {
            state.isNavigating = true
            state.destination = destination
            state.destinationName = name
            state.routeCoordinates = coordinates
            state.distance = route.distance
            state.duration = route.duration
            state.steps = steps
            state.currentStepIndex = 0
            state.lastSpokenStep = -1
            state.loading = false
          })

          // Speak first instruction
          if (steps.length > 0) {
            const firstStep = steps[0]
            const distanceText = firstStep.distance > 1000
              ? `${(firstStep.distance / 1000).toFixed(1)} kilometer`
              : `${Math.round(firstStep.distance)} meter`
            get().speakInstruction(`${firstStep.instruction}. Over ${distanceText}.`)
          }

          console.log(`🧭 Navigation started to ${name}`)
          console.log(`📏 Distance: ${(route.distance / 1000).toFixed(1)} km`)
          console.log(`⏱️ Duration: ${Math.round(route.duration / 60)} min`)
          console.log(`📍 Steps: ${steps.length}`)
        } else {
          throw new Error(data.message || 'Geen route gevonden')
        }
      } catch (error: any) {
        console.error('Navigation error:', error)
        set(state => {
          state.loading = false
          state.error = error.message || 'Navigatie fout'
        })
      }
    },

    stopNavigation: () => {
      // Stop any ongoing speech
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }

      set(state => {
        state.isNavigating = false
        state.destination = null
        state.destinationName = null
        state.routeCoordinates = null
        state.distance = null
        state.duration = null
        state.error = null
        state.steps = []
        state.currentStepIndex = 0
        state.lastSpokenStep = -1
        state.lastSpokenTime = 0
        state.lastSpokenDistance = -1
      })
      console.log('🧭 Navigation stopped')
    },

    clearError: () => {
      set(state => {
        state.error = null
      })
    },

    updateCurrentStep: (userLocation: Coordinate) => {
      const { steps, currentStepIndex, lastSpokenStep, lastSpokenTime, lastSpokenDistance, voiceEnabled } = get()

      if (steps.length === 0) return

      const now = Date.now()
      const MIN_SPEAK_INTERVAL = 5000 // Minimum 5 seconds between voice prompts

      // Find the closest upcoming step
      let newIndex = currentStepIndex
      for (let i = currentStepIndex; i < steps.length; i++) {
        const stepLocation = steps[i].location
        const distance = getDistance(userLocation, stepLocation)

        // If we're within 30m of a step, consider it reached
        if (distance < 30) {
          newIndex = Math.min(i + 1, steps.length - 1)
        }
      }

      // Update step index and speak if changed
      if (newIndex !== currentStepIndex) {
        set(state => {
          state.currentStepIndex = newIndex
        })

        // Speak the new instruction (only if enough time has passed)
        if (voiceEnabled && newIndex !== lastSpokenStep && newIndex < steps.length) {
          if (now - lastSpokenTime > MIN_SPEAK_INTERVAL) {
            const step = steps[newIndex]
            const distanceText = step.distance > 1000
              ? `${(step.distance / 1000).toFixed(1)} kilometer`
              : `${Math.round(step.distance)} meter`

            get().speakInstruction(`${step.instruction}. Over ${distanceText}.`)

            set(state => {
              state.lastSpokenStep = newIndex
              state.lastSpokenTime = now
              state.lastSpokenDistance = -1 // Reset for new step
            })
          }
        }
      }

      // Also speak upcoming turn warnings (with throttling)
      if (voiceEnabled && currentStepIndex < steps.length) {
        const currentStep = steps[currentStepIndex]
        const distanceToStep = getDistance(userLocation, currentStep.location)

        // Only speak if enough time has passed since last speech
        if (now - lastSpokenTime < MIN_SPEAK_INTERVAL) return

        // Warn at specific distances (200m, 100m, 50m) - but only once per distance bracket
        const warnings = [200, 100, 50]
        for (const warningDist of warnings) {
          // Check if we're in this warning zone and haven't spoken for this distance yet
          if (distanceToStep <= warningDist && distanceToStep > warningDist - 30) {
            // Only speak if we haven't spoken at this distance bracket
            if (lastSpokenDistance === -1 || Math.abs(lastSpokenDistance - warningDist) > 30) {
              if (currentStep.maneuver !== 'depart' && currentStep.maneuver !== 'arrive') {
                get().speakInstruction(`Over ${warningDist} meter, ${currentStep.instruction.toLowerCase()}.`)

                set(state => {
                  state.lastSpokenTime = now
                  state.lastSpokenDistance = warningDist
                })
                break // Only speak one warning
              }
            }
          }
        }
      }
    },

    setVoiceEnabled: (enabled: boolean) => {
      set(state => {
        state.voiceEnabled = enabled
      })

      if (!enabled && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    },

    speakInstruction: (text: string) => {
      if (!get().voiceEnabled) return

      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel()

        const utterance = new SpeechSynthesisUtterance(text)
        utterance.lang = 'nl-NL'
        utterance.rate = 1.0
        utterance.pitch = 1.0
        utterance.volume = 1.0

        // Try to find a Dutch voice
        const voices = window.speechSynthesis.getVoices()
        const dutchVoice = voices.find(v => v.lang.startsWith('nl'))
        if (dutchVoice) {
          utterance.voice = dutchVoice
        }

        window.speechSynthesis.speak(utterance)
        console.log(`🔊 Speaking: ${text}`)
      }
    }
  }))
)

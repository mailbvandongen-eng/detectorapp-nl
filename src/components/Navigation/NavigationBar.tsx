import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Volume2, VolumeX, ArrowUp, ArrowLeft, ArrowRight, CornerUpLeft, CornerUpRight, RotateCcw, Navigation, ArrowUpLeft, ArrowUpRight, Circle } from 'lucide-react'
import { useNavigationStore } from '../../store/navigationStore'

// Map maneuver types to icons
function getManeuverIcon(maneuver: string) {
  const iconProps = { size: 24, className: "text-white" }

  if (maneuver.includes('left')) {
    if (maneuver.includes('sharp')) return <CornerUpLeft {...iconProps} />
    if (maneuver.includes('slight')) return <ArrowUpLeft {...iconProps} />
    return <ArrowLeft {...iconProps} />
  }
  if (maneuver.includes('right')) {
    if (maneuver.includes('sharp')) return <CornerUpRight {...iconProps} />
    if (maneuver.includes('slight')) return <ArrowUpRight {...iconProps} />
    return <ArrowRight {...iconProps} />
  }
  if (maneuver.includes('uturn')) return <RotateCcw {...iconProps} />
  if (maneuver.includes('arrive')) return <Circle {...iconProps} />
  if (maneuver.includes('roundabout') || maneuver.includes('rotary')) return <RotateCcw {...iconProps} />

  // Default: straight/continue/depart
  return <ArrowUp {...iconProps} />
}

export function NavigationBar() {
  const isNavigating = useNavigationStore(state => state.isNavigating)
  const destinationName = useNavigationStore(state => state.destinationName)
  const distance = useNavigationStore(state => state.distance)
  const duration = useNavigationStore(state => state.duration)
  const steps = useNavigationStore(state => state.steps)
  const currentStepIndex = useNavigationStore(state => state.currentStepIndex)
  const voiceEnabled = useNavigationStore(state => state.voiceEnabled)
  const setVoiceEnabled = useNavigationStore(state => state.setVoiceEnabled)
  const stopNavigation = useNavigationStore(state => state.stopNavigation)

  const currentStep = steps[currentStepIndex]

  const formatDistance = (meters: number | null) => {
    if (!meters) return '--'
    if (meters < 1000) {
      return `${Math.round(meters)} m`
    }
    return `${(meters / 1000).toFixed(1)} km`
  }

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '--'
    if (seconds < 60) {
      return `${Math.round(seconds)} sec`
    }
    const minutes = Math.round(seconds / 60)
    if (minutes < 60) {
      return `${minutes} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}u ${mins}m`
  }

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          className="fixed top-16 left-2 right-2 z-[1100] bg-white rounded-xl shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Current instruction - prominent display */}
          {currentStep && (
            <div className="bg-blue-600 px-4 py-3 flex items-center gap-3">
              {/* Maneuver icon */}
              <div className="w-12 h-12 rounded-full bg-blue-700 flex items-center justify-center flex-shrink-0">
                {getManeuverIcon(currentStep.maneuver)}
              </div>

              {/* Instruction text */}
              <div className="flex-1 min-w-0">
                <div className="text-white font-bold text-lg truncate">
                  {currentStep.instruction}
                </div>
                <div className="text-blue-200 text-sm">
                  Over {formatDistance(currentStep.distance)}
                </div>
              </div>

              {/* Voice toggle */}
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                  voiceEnabled ? 'bg-blue-700 text-white' : 'bg-blue-800 text-blue-400'
                }`}
                title={voiceEnabled ? 'Geluid uit' : 'Geluid aan'}
              >
                {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
            </div>
          )}

          {/* Destination info row */}
          <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-100">
            {/* Navigation icon */}
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Navigation size={20} className="text-gray-600" />
            </div>

            {/* Destination info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={12} />
                <span>Bestemming</span>
              </div>
              <div className="font-medium text-gray-900 truncate text-sm">
                {destinationName || 'Bestemming'}
              </div>
            </div>

            {/* Distance & Duration */}
            <div className="text-right flex-shrink-0">
              <div className="text-lg font-bold text-blue-600">
                {formatDistance(distance)}
              </div>
              <div className="text-xs text-gray-500">
                {formatDuration(duration)}
              </div>
            </div>

            {/* Stop button */}
            <button
              onClick={stopNavigation}
              className="w-10 h-10 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center flex-shrink-0 transition-colors"
              title="Stop navigatie"
            >
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Steps progress indicator */}
          {steps.length > 1 && (
            <div className="px-4 pb-2">
              <div className="flex gap-1">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      index < currentStepIndex
                        ? 'bg-green-500'
                        : index === currentStepIndex
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-gray-400 mt-1 text-center">
                Stap {currentStepIndex + 1} van {steps.length}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

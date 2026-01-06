import { useEffect, useCallback, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Footprints, Play, Pause, RotateCcw, ChevronUp, ChevronDown, RefreshCw } from 'lucide-react'
import { useStepCounterStore, detectStep, requestMotionPermission } from '../../store/stepCounterStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useAuthStore } from '../../store/authStore'
import { getTodaySteps, hasGoogleFitAccess } from '../../services/googleFitService'

// Google Fit icon
function GoogleFitIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className}>
      <path fill="#4285F4" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
      <path fill="#fff" d="M12 6.5c-.83 0-1.5.67-1.5 1.5v4c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V8c0-.83-.67-1.5-1.5-1.5zm3.5 5.5c0 1.93-1.57 3.5-3.5 3.5S8.5 13.93 8.5 12h-2c0 2.76 2.01 5.05 4.64 5.46.17.03.34.04.51.04h.7c.17 0 .34-.01.51-.04C15.49 17.05 17.5 14.76 17.5 12h-2z"/>
    </svg>
  )
}

export function StepCounter() {
  const {
    steps,
    distance,
    isActive,
    todaySteps,
    setActive,
    incrementStep,
    resetSession
  } = useStepCounterStore()

  const showStepCounter = useSettingsStore(state => state.showStepCounter)
  const accessToken = useAuthStore(state => state.accessToken)
  const user = useAuthStore(state => state.user)

  const [isExpanded, setIsExpanded] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null)
  const [googleFitSteps, setGoogleFitSteps] = useState<number | null>(null)
  const [googleFitLoading, setGoogleFitLoading] = useState(false)
  const [googleFitError, setGoogleFitError] = useState<string | null>(null)

  // Format distance nicely
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`
    }
    return `${Math.round(meters)} m`
  }

  // Format duration
  const formatDuration = (startTime: number | null) => {
    if (!startTime) return '0:00'
    const seconds = Math.floor((Date.now() - startTime) / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Fetch Google Fit steps
  const fetchGoogleFitSteps = useCallback(async () => {
    if (!accessToken) return

    setGoogleFitLoading(true)
    setGoogleFitError(null)

    try {
      const steps = await getTodaySteps(accessToken)
      setGoogleFitSteps(steps)
    } catch (error: any) {
      if (error.message === 'TOKEN_EXPIRED') {
        setGoogleFitError('Opnieuw inloggen vereist')
      } else if (error.message === 'FITNESS_API_DISABLED') {
        setGoogleFitError('Google Fit niet gekoppeld')
      } else {
        setGoogleFitError('Kon stappen niet ophalen')
      }
      console.error('Google Fit error:', error)
    } finally {
      setGoogleFitLoading(false)
    }
  }, [accessToken])

  // Fetch Google Fit steps on mount and when expanded
  useEffect(() => {
    if (isExpanded && accessToken && googleFitSteps === null) {
      fetchGoogleFitSteps()
    }
  }, [isExpanded, accessToken, googleFitSteps, fetchGoogleFitSteps])

  // Handle device motion events
  const handleMotion = useCallback((event: DeviceMotionEvent) => {
    if (!isActive) return

    const acceleration = event.accelerationIncludingGravity
    if (!acceleration) return

    if (detectStep({
      x: acceleration.x || 0,
      y: acceleration.y || 0,
      z: acceleration.z || 0
    })) {
      incrementStep()
    }
  }, [isActive, incrementStep])

  // Set up motion listener
  useEffect(() => {
    if (!isActive || !permissionGranted) return

    window.addEventListener('devicemotion', handleMotion)
    return () => {
      window.removeEventListener('devicemotion', handleMotion)
    }
  }, [isActive, permissionGranted, handleMotion])

  // Request permission and start counting
  const handleToggle = async () => {
    if (!isActive) {
      // Starting - request permission if needed
      if (permissionGranted === null) {
        const granted = await requestMotionPermission()
        setPermissionGranted(granted)

        if (!granted) {
          alert('Stappenteller heeft toegang tot bewegingssensoren nodig.')
          return
        }
      }
    }

    setActive(!isActive)
  }

  if (!showStepCounter) return null

  return (
    <motion.div
      className="fixed bottom-[180px] right-2 z-[800]"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      {/* Collapsed view - just the button with step count */}
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="collapsed"
            onClick={() => setIsExpanded(true)}
            className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg transition-all ${
              isActive
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Footprints size={18} className={isActive ? 'animate-pulse' : ''} />
            <span className="font-medium text-sm">{steps.toLocaleString()}</span>
            <ChevronUp size={14} className="opacity-50" />
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden w-48"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {/* Header */}
            <div className={`px-3 py-2 flex items-center justify-between ${
              isActive ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'
            }`}>
              <div className="flex items-center gap-2">
                <Footprints size={16} className={isActive ? 'animate-pulse' : ''} />
                <span className="font-medium text-sm">Stappenteller</span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="p-0.5 rounded hover:bg-black/10 transition-colors"
              >
                <ChevronDown size={16} />
              </button>
            </div>

            {/* Stats */}
            <div className="p-3 space-y-2">
              {/* Current session */}
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-800">
                  {steps.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">stappen deze sessie</div>
              </div>

              {/* Distance */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Afstand:</span>
                <span className="font-medium">{formatDistance(distance)}</span>
              </div>

              {/* Today total (device) */}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vandaag (app):</span>
                <span className="font-medium">{todaySteps.toLocaleString()}</span>
              </div>

              {/* Google Fit steps */}
              {user && (
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <GoogleFitIcon size={14} />
                    <span className="text-gray-500">Google Fit:</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {googleFitLoading ? (
                      <RefreshCw size={12} className="animate-spin text-blue-500" />
                    ) : googleFitError ? (
                      <span className="text-xs text-red-400">{googleFitError}</span>
                    ) : googleFitSteps !== null ? (
                      <span className="font-medium text-blue-600">{googleFitSteps.toLocaleString()}</span>
                    ) : (
                      <button
                        onClick={fetchGoogleFitSteps}
                        className="text-xs text-blue-500 hover:underline"
                      >
                        Ophalen
                      </button>
                    )}
                    {googleFitSteps !== null && !googleFitLoading && (
                      <button
                        onClick={fetchGoogleFitSteps}
                        className="p-0.5 hover:bg-gray-100 rounded"
                        title="Vernieuwen"
                      >
                        <RefreshCw size={10} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2 pt-2">
                <motion.button
                  onClick={handleToggle}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                      : 'bg-green-100 text-green-600 hover:bg-green-200'
                  }`}
                  whileTap={{ scale: 0.95 }}
                >
                  {isActive ? (
                    <>
                      <Pause size={14} />
                      <span>Pauze</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      <span>Start</span>
                    </>
                  )}
                </motion.button>

                <motion.button
                  onClick={() => {
                    resetSession()
                  }}
                  className="px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                  whileTap={{ scale: 0.95 }}
                  title="Reset sessie"
                >
                  <RotateCcw size={14} />
                </motion.button>
              </div>
            </div>

            {/* Permission warning */}
            {permissionGranted === false && (
              <div className="px-3 pb-3 text-xs text-red-500">
                Geen toegang tot bewegingssensoren
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default StepCounter

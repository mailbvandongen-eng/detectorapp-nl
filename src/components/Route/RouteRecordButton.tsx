import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, Route, X, Save, Clock, Ruler, Gauge, List } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { useUIStore } from '../../store/uiStore'
import { useRouteRecordingStore, exportRouteAsGPX } from '../../store/routeRecordingStore'
import type { RecordingState } from '../../store/routeRecordingStore'

export function RouteRecordButton() {
  const showRouteRecordButton = useSettingsStore(state => state.showRouteRecordButton)
  const toggleRouteDashboard = useUIStore(state => state.toggleRouteDashboard)
  const {
    state: recordingState,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    addPoint,
    getCurrentDistance,
    getCurrentDuration,
    getAverageSpeed,
    currentPoints,
    savedRoutes
  } = useRouteRecordingStore()

  const [showStopDialog, setShowStopDialog] = useState(false)
  const [routeName, setRouteName] = useState('')
  const [showStats, setShowStats] = useState(false)
  const watchIdRef = useRef<number | null>(null)

  // Format time as HH:MM:SS
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`
    }
    return `${(meters / 1000).toFixed(2)} km`
  }

  // Format speed
  const formatSpeed = (kmh: number) => {
    return `${kmh.toFixed(1)} km/h`
  }

  // Start/stop GPS watching based on recording state
  useEffect(() => {
    if (recordingState === 'recording') {
      // Start watching position
      if ('geolocation' in navigator && watchIdRef.current === null) {
        watchIdRef.current = navigator.geolocation.watchPosition(
          (position) => {
            addPoint(
              position.coords.longitude,
              position.coords.latitude,
              position.coords.accuracy
            )
          },
          (error) => {
            console.error('GPS error:', error)
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 1000
          }
        )
      }
    } else {
      // Stop watching
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
    }
  }, [recordingState, addPoint])

  // Don't render if disabled in settings
  if (!showRouteRecordButton) return null

  const handleStartRecording = () => {
    startRecording()
    setShowStats(true)
  }

  const handlePauseRecording = () => {
    pauseRecording()
  }

  const handleResumeRecording = () => {
    resumeRecording()
  }

  const handleStopClick = () => {
    setRouteName(`Route ${new Date().toLocaleDateString('nl-NL')}`)
    setShowStopDialog(true)
  }

  const handleSaveRoute = () => {
    const route = stopRecording(routeName)
    setShowStopDialog(false)
    setShowStats(false)
    setRouteName('')

    if (route) {
      // Ask user if they want to export as GPX
      if (confirm(`Route "${route.name}" opgeslagen! (${formatDistance(route.totalDistance)})\n\nDirect exporteren als GPX?`)) {
        exportRouteAsGPX(route)
      }
    }
  }

  const handleCancelRecording = () => {
    if (currentPoints.length > 2) {
      if (!confirm('Weet je zeker dat je de opname wilt annuleren? De route wordt niet opgeslagen.')) {
        return
      }
    }
    cancelRecording()
    setShowStopDialog(false)
    setShowStats(false)
  }

  // Get current stats for display
  const distance = getCurrentDistance()
  const duration = getCurrentDuration()
  const speed = getAverageSpeed()

  const getButtonColor = (state: RecordingState) => {
    switch (state) {
      case 'recording':
        return 'bg-red-500 hover:bg-red-600'
      case 'paused':
        return 'bg-yellow-500 hover:bg-yellow-600'
      default:
        return 'bg-purple-500 hover:bg-purple-600'
    }
  }

  const getButtonIcon = (state: RecordingState) => {
    switch (state) {
      case 'recording':
        return <Pause size={22} strokeWidth={2} />
      case 'paused':
        return <Play size={22} strokeWidth={2} />
      default:
        return <Route size={22} strokeWidth={2} />
    }
  }

  const handleMainButtonClick = () => {
    switch (recordingState) {
      case 'idle':
        handleStartRecording()
        break
      case 'recording':
        handlePauseRecording()
        break
      case 'paused':
        handleResumeRecording()
        break
    }
  }

  return (
    <>
      {/* Main button - positioned left of vondst button */}
      <motion.button
        className={`fixed bottom-2 right-[114px] z-[1000] w-11 h-11 ${getButtonColor(recordingState)} text-white rounded-xl shadow-sm flex items-center justify-center cursor-pointer border-0 outline-none backdrop-blur-sm`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMainButtonClick}
        title={recordingState === 'idle' ? 'Route opnemen' : recordingState === 'recording' ? 'Pauzeren' : 'Hervatten'}
      >
        {getButtonIcon(recordingState)}
        {/* Recording indicator pulse */}
        {recordingState === 'recording' && (
          <motion.div
            className="absolute inset-0 rounded-xl bg-red-400"
            animate={{ opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.button>

      {/* Dashboard button - visible when idle and has saved routes */}
      <AnimatePresence>
        {recordingState === 'idle' && savedRoutes.length > 0 && (
          <motion.button
            className="fixed bottom-2 right-[168px] z-[1000] w-11 h-11 bg-purple-400 hover:bg-purple-500 text-white rounded-xl shadow-sm flex items-center justify-center cursor-pointer border-0 outline-none"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleRouteDashboard}
            title={`Mijn routes (${savedRoutes.length})`}
          >
            <List size={18} strokeWidth={2} />
            {/* Badge showing count */}
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-white text-purple-600 text-xs font-bold rounded-full flex items-center justify-center shadow-sm">
              {savedRoutes.length}
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Stop button - only visible during recording/paused */}
      <AnimatePresence>
        {(recordingState === 'recording' || recordingState === 'paused') && (
          <motion.button
            className="fixed bottom-2 right-[168px] z-[1000] w-11 h-11 bg-gray-700 hover:bg-gray-800 text-white rounded-xl shadow-sm flex items-center justify-center cursor-pointer border-0 outline-none"
            initial={{ opacity: 0, scale: 0.8, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStopClick}
            title="Stoppen en opslaan"
          >
            <Square size={18} strokeWidth={2} fill="currentColor" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Live stats panel - visible during recording */}
      <AnimatePresence>
        {showStats && recordingState !== 'idle' && (
          <motion.div
            className="fixed bottom-16 right-2 z-[999] bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-3 min-w-[180px]"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {recordingState === 'recording' ? '● Opname' : '⏸ Gepauzeerd'}
              </span>
              <button
                onClick={() => setShowStats(false)}
                className="p-0.5 text-gray-400 hover:text-gray-600 border-0 outline-none bg-transparent"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-2">
              {/* Distance */}
              <div className="flex items-center gap-2">
                <Ruler size={16} className="text-purple-500" />
                <span className="text-lg font-semibold text-gray-800">{formatDistance(distance)}</span>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-blue-500" />
                <LiveTime duration={duration} recordingState={recordingState} formatTime={formatTime} />
              </div>

              {/* Average speed */}
              <div className="flex items-center gap-2">
                <Gauge size={16} className="text-green-500" />
                <span className="text-sm text-gray-600">{formatSpeed(speed)}</span>
              </div>

              {/* Points count */}
              <div className="text-xs text-gray-400 pt-1 border-t border-gray-100">
                {currentPoints.length} punten opgenomen
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stop/Save dialog */}
      <AnimatePresence>
        {showStopDialog && (
          <>
            <motion.div
              className="fixed inset-0 z-[1500] bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStopDialog(false)}
            />
            <motion.div
              className="fixed left-4 right-4 top-1/2 z-[1501] bg-white rounded-xl shadow-2xl p-4 max-w-sm mx-auto"
              initial={{ opacity: 0, scale: 0.9, y: '-40%' }}
              animate={{ opacity: 1, scale: 1, y: '-50%' }}
              exit={{ opacity: 0, scale: 0.9, y: '-40%' }}
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Route opslaan</h3>

              {/* Stats summary */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Afstand:</span>
                  <span className="font-medium">{formatDistance(distance)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Duur:</span>
                  <span className="font-medium">{formatTime(duration)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Gem. snelheid:</span>
                  <span className="font-medium">{formatSpeed(speed)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Punten:</span>
                  <span className="font-medium">{currentPoints.length}</span>
                </div>
              </div>

              {/* Name input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naam van de route
                </label>
                <input
                  type="text"
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Route naam..."
                  autoFocus
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={handleCancelRecording}
                  className="flex-1 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border-0 outline-none"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSaveRoute}
                  disabled={currentPoints.length < 2}
                  className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white rounded-lg transition-colors border-0 outline-none flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  Opslaan
                </button>
              </div>

              {currentPoints.length < 2 && (
                <p className="text-xs text-red-500 text-center mt-2">
                  Minimaal 2 punten nodig om op te slaan
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

// Live updating time component
function LiveTime({
  duration,
  recordingState,
  formatTime
}: {
  duration: number
  recordingState: RecordingState
  formatTime: (ms: number) => string
}) {
  const [displayTime, setDisplayTime] = useState(duration)

  useEffect(() => {
    if (recordingState !== 'recording') {
      setDisplayTime(duration)
      return
    }

    const interval = setInterval(() => {
      setDisplayTime(prev => prev + 1000)
    }, 1000)

    return () => clearInterval(interval)
  }, [recordingState, duration])

  // Reset when duration changes significantly (e.g., on resume)
  useEffect(() => {
    setDisplayTime(duration)
  }, [duration])

  return (
    <span className="text-lg font-semibold text-gray-800">{formatTime(displayTime)}</span>
  )
}

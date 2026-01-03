import { motion, AnimatePresence } from 'framer-motion'
import { useMapStore } from '../../store/mapStore'
import { useEffect, useState } from 'react'

export function CompassButton() {
  const map = useMapStore(state => state.map)
  const [rotation, setRotation] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  // Listen to map rotation changes
  useEffect(() => {
    if (!map) return

    const view = map.getView()

    const updateRotation = () => {
      const rot = view.getRotation()
      // Convert radians to degrees
      const degrees = (rot * 180) / Math.PI
      setRotation(degrees)
      // Show compass when rotated more than 5 degrees from north
      setIsVisible(Math.abs(rot) > 0.087) // ~5 degrees in radians
    }

    // Initial check
    updateRotation()

    // Listen to rotation changes
    view.on('change:rotation', updateRotation)

    return () => {
      view.un('change:rotation', updateRotation)
    }
  }, [map])

  // Reset rotation to north
  const resetToNorth = () => {
    if (!map) return
    map.getView().animate({
      rotation: 0,
      duration: 300
    })
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={resetToNorth}
          className="fixed top-[60px] right-2 z-[800] w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
          title="Klik om noorden te herstellen"
        >
          {/* Google Maps style compass needle */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            style={{ transform: `rotate(${-rotation}deg)` }}
          >
            {/* North pointer (red) */}
            <path
              d="M12 2 L14.5 12 L12 10 L9.5 12 Z"
              fill="#EA4335"
            />
            {/* South pointer (white with gray border) */}
            <path
              d="M12 22 L9.5 12 L12 14 L14.5 12 Z"
              fill="white"
              stroke="#9CA3AF"
              strokeWidth="0.5"
            />
            {/* Center dot */}
            <circle cx="12" cy="12" r="2" fill="#374151" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'
import { useUIStore, useMapStore } from '../../store'
import { useEffect, useState } from 'react'
import { isCommercialMode } from '../../config/buildMode'

export function KaartlagenButton() {
  const themesPanelOpen = useUIStore(state => state.themesPanelOpen)
  const toggleThemesPanel = useUIStore(state => state.toggleThemesPanel)
  const map = useMapStore(state => state.map)
  const [compassVisible, setCompassVisible] = useState(false)
  const isCommercial = isCommercialMode()

  // Listen to map rotation to know when compass is visible
  useEffect(() => {
    if (!map) return

    const view = map.getView()

    const updateCompassVisibility = () => {
      const rot = view.getRotation()
      // Compass shows when rotated more than ~5 degrees
      setCompassVisible(Math.abs(rot) > 0.087)
    }

    updateCompassVisibility()
    view.on('change:rotation', updateCompassVisibility)

    return () => {
      view.un('change:rotation', updateCompassVisibility)
    }
  }, [map])

  // Commercial: bottom-right corner
  // Personal: top-right, below hamburger/compass
  if (isCommercial) {
    return (
      <motion.button
        className={`
          fixed bottom-2 right-2 z-[800]
          w-11 h-11 cursor-pointer border-0 outline-none
          flex items-center justify-center
          rounded-xl backdrop-blur-sm
          transition-all duration-200
          ${themesPanelOpen
            ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30'
            : 'bg-white/80 text-gray-500 hover:bg-white/90 shadow-sm'
          }
        `}
        onClick={toggleThemesPanel}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={themesPanelOpen ? 'Kaartlagen sluiten' : 'Kaartlagen openen'}
        title="Kaartlagen"
      >
        <Layers size={22} strokeWidth={2} className="drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]" />
      </motion.button>
    )
  }

  // Personal mode: position below hamburger menu, or below compass if visible
  const topPosition = compassVisible
    ? 'calc(max(0.5rem, env(safe-area-inset-top, 0.5rem)) + 112px)'
    : 'calc(max(0.5rem, env(safe-area-inset-top, 0.5rem)) + 52px)'

  return (
    <motion.button
      className={`
        fixed right-2 z-[800]
        w-11 h-11 cursor-pointer border-0 outline-none
        flex items-center justify-center
        rounded-xl backdrop-blur-sm
        transition-all duration-200
        ${themesPanelOpen
          ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30'
          : 'bg-white/80 text-gray-500 hover:bg-white/90 shadow-sm'
        }
      `}
      style={{ top: topPosition }}
      animate={{ top: topPosition }}
      transition={{ duration: 0.2 }}
      onClick={toggleThemesPanel}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={themesPanelOpen ? 'Kaartlagen sluiten' : 'Kaartlagen openen'}
      title="Kaartlagen"
    >
      <Layers size={22} strokeWidth={2} className="drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]" />
    </motion.button>
  )
}

// Keep old export for backwards compatibility
export function LayerControlButton() {
  return <KaartlagenButton />
}

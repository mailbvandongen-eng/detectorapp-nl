import { motion } from 'framer-motion'
import { Map } from 'lucide-react'
import { useUIStore } from '../../store'

export function KaartlagenButton() {
  const themesPanelOpen = useUIStore(state => state.themesPanelOpen)
  const toggleThemesPanel = useUIStore(state => state.toggleThemesPanel)

  return (
    <motion.button
      className={`
        fixed bottom-[80px] md:bottom-[90px] right-2 z-[1000]
        w-10 h-10 cursor-pointer border-0 outline-none
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
      <Map size={20} strokeWidth={2} />
    </motion.button>
  )
}

// Keep old export for backwards compatibility
export function LayerControlButton() {
  return <KaartlagenButton />
}

import { motion } from 'framer-motion'
import { Compass, Navigation } from 'lucide-react'
import { useGPSStore } from '../../store/gpsStore'

export function ModeToggleButton() {
  const navigationMode = useGPSStore(state => state.navigationMode)
  const toggleMode = useGPSStore(state => state.toggleMode)

  const isFreeMode = navigationMode === 'free'

  return (
    <motion.button
      className={`
        fixed bottom-[85px] md:bottom-[110px] right-2.5 z-[1000]
        w-11 h-11 cursor-pointer border-0 outline-none
        flex items-center justify-center
        rounded-xl backdrop-blur-sm
        transition-all duration-200
        ${isFreeMode
          ? 'bg-white/80 text-gray-500 hover:bg-white/90 shadow-sm'
          : 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30'
        }
      `}
      onClick={toggleMode}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isFreeMode ? 'Vrije modus (north-up)' : 'Rijmodus (map rotatie)'}
      title={isFreeMode ? 'Schakel naar rijmodus' : 'Schakel naar vrije modus'}
    >
      {isFreeMode ? (
        <Compass size={22} strokeWidth={2} />
      ) : (
        <Navigation size={22} strokeWidth={2} />
      )}
    </motion.button>
  )
}

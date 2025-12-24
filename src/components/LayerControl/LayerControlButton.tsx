import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'
import { useUIStore } from '../../store'

export function LayerControlButton() {
  const layerControlOpen = useUIStore(state => state.layerControlOpen)
  const toggleLayerControl = useUIStore(state => state.toggleLayerControl)

  return (
    <motion.button
      className={`
        fixed bottom-[85px] md:bottom-[95px] right-2.5 z-[1000]
        w-11 h-11 cursor-pointer border-0 outline-none
        flex items-center justify-center
        rounded-xl backdrop-blur-sm
        transition-all duration-200
        ${layerControlOpen
          ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg shadow-blue-500/30'
          : 'bg-white/80 text-gray-500 hover:bg-white/90 shadow-sm'
        }
      `}
      onClick={toggleLayerControl}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={layerControlOpen ? 'Kaartlagen sluiten' : 'Kaartlagen openen'}
      title={layerControlOpen ? 'Kaartlagen sluiten' : 'Kaartlagen openen'}
    >
      <Layers size={22} strokeWidth={2} />
    </motion.button>
  )
}

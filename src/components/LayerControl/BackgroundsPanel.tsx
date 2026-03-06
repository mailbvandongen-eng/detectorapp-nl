import { motion, AnimatePresence } from 'framer-motion'
import { X, Map } from 'lucide-react'
import { useUIStore } from '../../store'
import { LayerItem } from './LayerItem'

export function BackgroundsPanel() {
  const { backgroundsPanelOpen, toggleBackgroundsPanel } = useUIStore()

  return (
    <AnimatePresence>
      {backgroundsPanelOpen && (
        <>
          {/* Invisible backdrop - click to close */}
          <motion.div
            className="fixed inset-0 z-[998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleBackgroundsPanel}
          />
          <motion.div
            className="fixed top-2.5 left-14 z-[999] bg-white rounded-lg shadow-lg overflow-hidden w-[180px]"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center gap-2">
                <Map size={14} />
                <span className="font-medium text-sm">Achtergronden</span>
              </div>
              <button
                onClick={toggleBackgroundsPanel}
                className="p-0.5 rounded border-0 outline-none hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-2">
              <LayerItem name="Esri Licht" type="base" />
              <LayerItem name="Esri Straten" type="base" />
              <LayerItem name="Esri Satelliet" type="base" hasOverlay />
              <LayerItem name="Luchtfoto" type="base" hasOverlay />
              <LayerItem name="TMK 1850" type="base" hasOverlay />
              <LayerItem name="Bonnebladen 1900" type="base" hasOverlay />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

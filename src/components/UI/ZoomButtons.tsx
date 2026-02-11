import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'
import { useMapStore } from '../../store'
import { isArcGISEngine } from '../../config/mapEngineConfig'

export function ZoomButtons() {
  const map = useMapStore(state => state.map)
  const arcgisView = useMapStore(state => state.arcgisView)
  const zoom = useMapStore(state => state.zoom)
  const goTo = useMapStore(state => state.goTo)

  const handleZoomIn = () => {
    if (isArcGISEngine() && arcgisView) {
      // ArcGIS primary: use goTo which syncs both engines
      const currentZoom = arcgisView.zoom ?? zoom
      goTo({ zoom: currentZoom + 1, animate: true })
    } else if (map) {
      // OL primary: control OL directly
      const view = map.getView()
      const currentZoom = view.getZoom()
      if (currentZoom !== undefined) {
        view.animate({ zoom: currentZoom + 1, duration: 200 })
      }
    }
  }

  const handleZoomOut = () => {
    if (isArcGISEngine() && arcgisView) {
      // ArcGIS primary: use goTo which syncs both engines
      const currentZoom = arcgisView.zoom ?? zoom
      goTo({ zoom: currentZoom - 1, animate: true })
    } else if (map) {
      // OL primary: control OL directly
      const view = map.getView()
      const currentZoom = view.getZoom()
      if (currentZoom !== undefined) {
        view.animate({ zoom: currentZoom - 1, duration: 200 })
      }
    }
  }

  return (
    <motion.div
      className="fixed bottom-2 right-2 z-[800] flex flex-row-reverse gap-1"
    >
      {/* Minus button - appears on the right due to flex-row-reverse */}
      <motion.button
        className="w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
        onClick={handleZoomOut}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Uitzoomen"
      >
        <Minus size={22} className="text-gray-600 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]" />
      </motion.button>
      {/* Plus button - appears in the middle */}
      <motion.button
        className="w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
        onClick={handleZoomIn}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Inzoomen"
      >
        <Plus size={22} className="text-gray-600 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]" />
      </motion.button>
    </motion.div>
  )
}

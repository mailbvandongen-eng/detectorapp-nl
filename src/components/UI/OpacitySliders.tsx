import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react'
import { useLayerStore } from '../../store/layerStore'

// All layers that should have opacity sliders - NL only
const OPACITY_LAYERS = [
  // Hillshade NL
  { name: 'AHN4 Hoogtekaart Kleur', color: 'blue', default: 0.85 },
  { name: 'AHN4 Hillshade NL', color: 'blue', default: 0.7 },
  { name: 'AHN4 Multi-Hillshade NL', color: 'blue', default: 0.7 },
  { name: 'AHN4 Helling NL', color: 'blue', default: 0.6 },
  { name: 'AHN 0.5m', color: 'blue', default: 0.7 },
  { name: 'World Hillshade', color: 'blue', default: 0.7 },
  // Terrain layers
  { name: 'Geomorfologie', color: 'green', default: 0.5 },
  { name: 'Bodemkaart', color: 'amber', default: 0.6 },
  { name: 'IKAW', color: 'orange', default: 0.5 },
  { name: 'Archeo Landschappen', color: 'green', default: 0.5 },
  // Archaeological layers
  { name: 'AMK Monumenten', color: 'purple', default: 0.8 },
]

const COLOR_CLASSES: Record<string, string> = {
  blue: 'accent-blue-500',
  amber: 'accent-amber-500',
  red: 'accent-red-500',
  indigo: 'accent-indigo-500',
  green: 'accent-green-500',
  orange: 'accent-orange-500',
  purple: 'accent-purple-500',
}

export function OpacitySliders() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const visibleLayers = useLayerStore(state => state.visible)
  const opacities = useLayerStore(state => state.opacity)
  const setLayerOpacity = useLayerStore(state => state.setLayerOpacity)

  // Filter to only visible layers
  const activeSliders = OPACITY_LAYERS.filter(layer => visibleLayers[layer.name])

  // Only show if at least one layer is visible
  if (activeSliders.length === 0) return null

  // Show first 3 by default, or all if expanded
  const displayedSliders = isExpanded ? activeSliders : activeSliders.slice(0, 3)
  const hasMore = activeSliders.length > 3

  return (
    <div className="fixed bottom-[122px] md:bottom-[128px] right-2 z-[900]">
      {/* Toggle button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="w-11 h-11 bg-white/80 rounded-xl backdrop-blur-sm shadow-sm flex items-center justify-center cursor-pointer border-0 outline-none hover:bg-white/90 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Opacity sliders"
        title={isOpen ? 'Sluit opacity sliders' : 'Open opacity sliders'}
      >
        <SlidersHorizontal size={22} strokeWidth={2} className="text-gray-500" />
        {activeSliders.length > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white text-[10px] rounded-full flex items-center justify-center">
            {activeSliders.length}
          </span>
        )}
      </motion.button>

      {/* Sliders panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 right-14 bg-white/95 rounded-lg shadow-lg p-3 min-w-[220px] max-h-[60vh] overflow-y-auto"
          >
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              Transparantie
            </div>
            <div className="space-y-3">
              {displayedSliders.map(layer => {
                const opacity = opacities[layer.name] ?? layer.default
                return (
                  <div key={layer.name}>
                    <label className="text-xs font-medium text-gray-700 mb-1 block truncate" title={layer.name}>
                      {layer.name}
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={opacity * 100}
                        onChange={(e) => setLayerOpacity(layer.name, parseInt(e.target.value) / 100)}
                        className={`flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer ${COLOR_CLASSES[layer.color]}`}
                      />
                      <span className="text-xs text-gray-500 w-8 text-right select-none pointer-events-none">
                        {Math.round(opacity * 100)}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Expand/collapse button */}
            {hasMore && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full mt-3 pt-2 border-t border-gray-200 flex items-center justify-center gap-1 text-xs text-gray-500 hover:text-gray-700"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp size={14} />
                    Minder tonen
                  </>
                ) : (
                  <>
                    <ChevronDown size={14} />
                    {activeSliders.length - 3} meer...
                  </>
                )}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

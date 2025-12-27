import { RotateCcw, Compass, TreePalm, Layers, ChevronUp, Mountain, Waves, Search, Target, Settings, Grid3X3, LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLayerStore, useGPSStore, useUIStore, usePresetStore } from '../../store'

// Icon mapping for dynamic icon rendering
const ICON_MAP: Record<string, LucideIcon> = {
  Compass,
  TreePalm,
  Mountain,
  Waves,
  Search,
  Target,
  Layers,
  Grid: Grid3X3
}

// Icon color mapping
const ICON_COLORS: Record<string, string> = {
  Compass: 'text-purple-600',
  Waves: 'text-cyan-600',
  TreePalm: 'text-green-600',
  Mountain: 'text-stone-600',
  Search: 'text-amber-600',
  Target: 'text-red-600',
  Layers: 'text-blue-600',
  Grid: 'text-lime-600'
}

const HOVER_COLORS: Record<string, string> = {
  Compass: 'hover:bg-purple-50',
  Waves: 'hover:bg-cyan-50',
  TreePalm: 'hover:bg-green-50',
  Mountain: 'hover:bg-stone-50',
  Search: 'hover:bg-amber-50',
  Target: 'hover:bg-red-50',
  Layers: 'hover:bg-blue-50',
  Grid: 'hover:bg-lime-50'
}

// All overlay layers for reset
const ALL_OVERLAYS = [
  'Labels Overlay',
  'Hunebedden', 'FAMKE Steentijd', 'Grafheuvels', 'Terpen',
  'AMK Monumenten', 'Romeinse wegen', 'Kastelen', 'IKAW', 'Archeo Landschappen',
  'Rijksmonumenten', 'Werelderfgoed',
  'WWII Bunkers', 'Slagvelden', 'Militaire Vliegvelden',
  'Verdedigingslinies', 'Inundatiegebieden', 'Militaire Objecten',
  'Paleokaart 800 n.Chr.', 'Paleokaart 100 n.Chr.', 'Paleokaart 500 v.Chr.',
  'Paleokaart 1500 v.Chr.', 'Paleokaart 2750 v.Chr.', 'Paleokaart 5500 v.Chr.', 'Paleokaart 9000 v.Chr.',
  'Religieus Erfgoed',
  'UIKAV Punten', 'UIKAV Vlakken', 'UIKAV Expert', 'UIKAV Buffer', 'UIKAV Indeling',
  'Veengebieden', 'AHN 0.5m', 'Geomorfologie', 'Bodemkaart',
  'AHN4 Hillshade NL', 'AHN4 Multi-Hillshade NL', 'AHN4 Hoogtekaart Kleur', 'World Hillshade',
  'Fossielen Nederland', 'Fossielen België', 'Fossielen Duitsland', 'Fossielen Frankrijk',
  'Parken', 'Speeltuinen', 'Musea', 'Strandjes',
  'Gewaspercelen', 'Kadastrale Grenzen'
]

// Base layers
const BASE_LAYERS = [
  'CartoDB (licht)',
  'OpenStreetMap',
  'Luchtfoto',
  'TMK 1850',
  'Bonnebladen 1900'
]

export function PresetButtons() {
  const setLayerVisibility = useLayerStore(state => state.setLayerVisibility)
  const stopTracking = useGPSStore(state => state.stopTracking)
  const { presetsPanelOpen, togglePresetsPanel, toggleSettingsPanel, closeAllPanels } = useUIStore()
  const { presets, applyPreset } = usePresetStore()

  const resetAll = () => {
    // Close any open panels
    closeAllPanels()

    // Turn off all overlay layers
    ALL_OVERLAYS.forEach(layer => setLayerVisibility(layer, false))

    // Set CartoDB as active base layer
    BASE_LAYERS.forEach(layer => {
      setLayerVisibility(layer, layer === 'CartoDB (licht)')
    })

    // Stop GPS tracking
    stopTracking()

    console.log('🔄 Reset: CartoDB (licht), alle lagen uit, GPS uit')
  }

  const handleApplyPreset = (id: string) => {
    applyPreset(id)
    closeAllPanels()
  }

  return (
    <>
      {/* Reset button - bottom left */}
      <button
        onClick={resetAll}
        className="fixed bottom-[30px] md:bottom-10 left-2 z-[800] w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
        title="Reset - CartoDB, alle lagen uit, GPS uit"
      >
        <RotateCcw size={22} className="text-gray-600" />
      </button>

      {/* Settings button - next to reset */}
      <button
        onClick={toggleSettingsPanel}
        className="fixed bottom-[30px] md:bottom-10 left-[60px] z-[800] w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
        title="Instellingen"
      >
        <Settings size={22} className="text-gray-600" />
      </button>

      {/* Presets button - above reset */}
      <button
        onClick={togglePresetsPanel}
        className="fixed bottom-[85px] md:bottom-[95px] left-2 z-[800] w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
        title="Presets"
      >
        {presetsPanelOpen ? (
          <ChevronUp size={22} className="text-blue-600" />
        ) : (
          <Layers size={22} className="text-blue-600" />
        )}
      </button>

      {/* Expanded: preset options */}
      <AnimatePresence>
        {presetsPanelOpen && (
          <>
            {/* Invisible backdrop - click to close */}
            <motion.div
              className="fixed inset-0 z-[-1]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={togglePresetsPanel}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed bottom-[85px] md:bottom-[95px] left-14 bg-white/95 rounded-xl shadow-lg overflow-hidden min-w-[140px] backdrop-blur-sm z-[801]"
            >
              <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium">
                Presets
              </div>
              <div className="p-2">
                {presets.map(preset => {
                  const IconComponent = ICON_MAP[preset.icon] || Layers
                  const iconColor = ICON_COLORS[preset.icon] || 'text-blue-600'
                  const hoverColor = HOVER_COLORS[preset.icon] || 'hover:bg-blue-50'

                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 ${hoverColor} rounded text-left transition-colors border-0 outline-none bg-transparent`}
                    >
                      <IconComponent size={14} className={iconColor} />
                      <span className="text-xs text-gray-700">{preset.name}</span>
                      {!preset.isBuiltIn && (
                        <span className="ml-auto text-[10px] text-gray-400">custom</span>
                      )}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

import { useState } from 'react'
import { RotateCcw, Compass, TreePalm, Layers, ChevronUp, Mountain, Waves, Search, Target, Grid3X3, Save, Plus, RotateCw, Check, LucideIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLayerStore, useGPSStore, useUIStore, usePresetStore, useSettingsStore, useMapStore } from '../../store'
import type { Preset } from '../../store/presetStore'
import { fromLonLat } from 'ol/proj'

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

// All overlay layers for reset - must include ALL layers from layerStore
const ALL_OVERLAYS = [
  // Mijn data
  'Mijn Vondsten',
  // Base layer overlays
  'Labels Overlay', 'TMK 1850', 'Bonnebladen 1900',
  // Steentijd
  'Hunebedden', 'FAMKE Steentijd', 'FAMKE IJzertijd', 'Grafheuvels', 'Terpen',
  // Archeologie
  'AMK Monumenten', 'AMK Romeins', 'AMK Steentijd', 'AMK Vroege ME', 'AMK Late ME', 'AMK Overig',
  'Romeinse wegen (regio)', 'Romeinse wegen (Wereld)', 'Romeinse Forten', 'Romeinse Forten Lijnen', 'Kastelen', 'IKAW', 'Archeo Onderzoeken',
  // Erfgoed
  'Rijksmonumenten', 'Werelderfgoed', 'Religieus Erfgoed', 'Essen', 'Ruïnes',
  // Militair
  'WWII Bunkers', 'Slagvelden', 'Militaire Vliegvelden',
  'Verdedigingslinies', 'Inundatiegebieden', 'Militaire Objecten',
  // Paleokaarten
  'Paleokaart 800 n.Chr.', 'Paleokaart 100 n.Chr.', 'Paleokaart 500 v.Chr.',
  'Paleokaart 1500 v.Chr.', 'Paleokaart 2750 v.Chr.', 'Paleokaart 5500 v.Chr.', 'Paleokaart 9000 v.Chr.',
  // UIKAV
  'UIKAV Punten', 'UIKAV Vlakken', 'UIKAV Expert', 'UIKAV Buffer', 'UIKAV Indeling',
  // Hoogtekaarten (Esri + WebGL)
  'Hoogtekaart (WebGL)', 'AHN4 Hoogtekaart Kleur', 'AHN4 Hillshade NL', 'AHN4 Multi-Hillshade NL', 'AHN 0.5m',
  // Terrein
  'Veengebieden', 'Geomorfologie', 'Bodemkaart',
  // Fossielen, Mineralen & Goud
  'Fossiel Hotspots', 'Mineralen Hotspots', 'Goudrivieren',
  'Fossielen Nederland', 'Fossielen België', 'Fossielen Duitsland', 'Fossielen Frankrijk',
  // Recreatie
  'Parken', 'Speeltuinen', 'Musea', 'Strandjes', 'Kringloopwinkels',
  'Ruiterpaden', 'Laarzenpaden',
  // Percelen
  'Gewaspercelen', 'Kadastrale Grenzen',
  // Provinciale Waardenkaarten - Zuid-Holland
  'Scheepswrakken', 'Woonheuvels ZH', 'Windmolens', 'Erfgoedlijnen', 'Oude Kernen',
  // Provinciale Waardenkaarten - Gelderland
  'Relictenkaart Punten', 'Relictenkaart Lijnen', 'Relictenkaart Vlakken',
  // Provinciale Waardenkaarten - Zeeland
  'Verdronken Dorpen'
]

// Base layers
const BASE_LAYERS = [
  'CartoDB (licht)',
  'OpenStreetMap',
  'Luchtfoto',
  'TMK 1850',
  'Bonnebladen 1900'
]

// Center of Netherlands (Utrecht area) and zoom level for ~50km view
const NL_CENTER = [5.2913, 52.1326] // [lon, lat]
const NL_ZOOM = 8 // ~50km view

export function PresetButtons() {
  const setLayerVisibility = useLayerStore(state => state.setLayerVisibility)
  const stopTracking = useGPSStore(state => state.stopTracking)
  const map = useMapStore(state => state.map)
  const { presetsPanelOpen, togglePresetsPanel, closeAllPanels } = useUIStore()
  const { presets, applyPreset, updatePreset, createPreset, resetToDefaults } = usePresetStore()
  const visible = useLayerStore(state => state.visible)

  // Explicit selectors to ensure re-render on state change
  const presetPanelFontScale = useSettingsStore(state => state.presetPanelFontScale)
  const setPresetPanelFontScale = useSettingsStore(state => state.setPresetPanelFontScale)
  const showFontSliders = useSettingsStore(state => state.showFontSliders)

  // Calculate font size based on panel-specific fontScale
  const baseFontSize = 12 * presetPanelFontScale / 100

  // State for save feedback
  const [savedPresetId, setSavedPresetId] = useState<string | null>(null)
  const [showAddPreset, setShowAddPreset] = useState(false)
  const [newPresetName, setNewPresetName] = useState('')

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

    // Zoom to center of Netherlands at ~50km view
    if (map) {
      const view = map.getView()
      view.animate({
        center: fromLonLat(NL_CENTER),
        zoom: NL_ZOOM,
        duration: 500
      })
    }

    console.log('🔄 Reset: CartoDB, alle lagen uit, GPS uit, zoom naar Nederland')
  }

  const handleApplyPreset = (id: string) => {
    applyPreset(id)
    closeAllPanels()
  }

  // Save current visible layers to a preset
  const handleSaveToPreset = (e: React.MouseEvent, presetId: string) => {
    e.stopPropagation()
    const currentLayers = Object.entries(visible)
      .filter(([layerName, isVisible]) => isVisible && ALL_OVERLAYS.includes(layerName))
      .map(([layerName]) => layerName)
    updatePreset(presetId, { layers: currentLayers })

    // Show feedback
    setSavedPresetId(presetId)
    setTimeout(() => setSavedPresetId(null), 2000)
    console.log(`💾 Lagen opgeslagen naar preset`)
  }

  // Add new preset with current layers
  const handleAddPreset = () => {
    if (!newPresetName.trim()) return
    createPreset(newPresetName.trim(), 'Layers')
    setNewPresetName('')
    setShowAddPreset(false)
  }

  // Reset presets to defaults
  const handleResetPresets = () => {
    if (confirm('Alle presets terugzetten naar standaard? Dit verwijdert aangepaste presets.')) {
      resetToDefaults()
    }
  }

  return (
    <>
      {/* Reset button - bottom left, above nothing */}
      <motion.button
        onClick={resetAll}
        className="fixed bottom-2 left-2 z-[800] w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Reset - CartoDB, alle lagen uit, GPS uit"
      >
        <RotateCcw size={20} className="text-gray-600" />
      </motion.button>

      {/* Presets button - above reset */}
      <motion.button
        onClick={togglePresetsPanel}
        className="fixed bottom-[60px] left-2 z-[800] w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Presets"
      >
        {presetsPanelOpen ? (
          <ChevronUp size={20} className="text-blue-600" />
        ) : (
          <Layers size={20} className="text-blue-600" />
        )}
      </motion.button>

      {/* Expanded: preset options */}
      <AnimatePresence>
        {presetsPanelOpen && (
          <>
            {/* Invisible backdrop - click to close */}
            <motion.div
              className="fixed inset-0 z-[800]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={togglePresetsPanel}
            />
            <motion.div
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed bottom-[60px] left-[56px] bg-white/95 rounded-xl shadow-lg overflow-hidden w-[240px] backdrop-blur-sm z-[801]"
            >
              {/* Header with title and font size slider - blue bg, white text */}
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-blue-500" style={{ fontSize: `${baseFontSize}px` }}>
                <span className="font-medium text-white">Presets</span>
                {/* Font size slider - only if boomer mode enabled */}
                {showFontSliders && (
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-blue-200">T</span>
                    <input
                      type="range"
                      min="80"
                      max="130"
                      step="10"
                      value={presetPanelFontScale}
                      onInput={(e) => {
                        setPresetPanelFontScale(parseInt((e.target as HTMLInputElement).value))
                      }}
                      onChange={(e) => setPresetPanelFontScale(parseInt(e.target.value))}
                      className="w-16 opacity-70 hover:opacity-100 transition-opacity"
                      title={`Tekstgrootte: ${presetPanelFontScale}%`}
                    />
                    <span className="text-[11px] text-blue-200">T</span>
                  </div>
                )}
              </div>
              <div className="p-2 max-h-[300px] overflow-y-auto">
                {presets.map(preset => {
                  const IconComponent = ICON_MAP[preset.icon] || Layers
                  const iconColor = ICON_COLORS[preset.icon] || 'text-blue-600'
                  const hoverColor = HOVER_COLORS[preset.icon] || 'hover:bg-blue-50'
                  const isSaved = savedPresetId === preset.id

                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset.id)}
                      className={`w-full h-8 flex items-center gap-2 px-2 ${hoverColor} rounded text-left transition-colors border-0 outline-none bg-transparent overflow-hidden ${isSaved ? 'bg-green-50' : ''}`}
                      style={{ fontSize: `${baseFontSize}px` }}
                    >
                      <IconComponent size={14} className={`${iconColor} flex-shrink-0`} />
                      <span className="text-gray-700 truncate flex-1">{preset.name}</span>
                      {isSaved ? (
                        <span className="ml-auto p-1 flex-shrink-0">
                          <Check size={14} className="text-green-500" />
                        </span>
                      ) : (
                        <span
                          onClick={(e) => handleSaveToPreset(e, preset.id)}
                          className="ml-auto p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                          title="Huidige lagen opslaan naar deze preset"
                        >
                          <Save size={12} className="text-gray-400 hover:text-blue-500" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Footer: Add preset & Reset */}
              <div className="border-t border-gray-200 p-2">
                {showAddPreset ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={newPresetName}
                      onChange={(e) => setNewPresetName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddPreset()
                        if (e.key === 'Escape') setShowAddPreset(false)
                      }}
                      placeholder="Naam preset..."
                      autoFocus
                      className="flex-1 px-2 py-1 text-sm rounded bg-gray-50 border-0 outline-none focus:ring-1 focus:ring-blue-400"
                      style={{ fontSize: `${baseFontSize}px` }}
                    />
                    <button
                      onClick={handleAddPreset}
                      disabled={!newPresetName.trim()}
                      className="px-2 py-1 bg-blue-500 text-white rounded text-sm disabled:opacity-50 border-0 outline-none"
                    >
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setShowAddPreset(true)}
                      className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors border-0 outline-none"
                      style={{ fontSize: `${baseFontSize}px` }}
                    >
                      <Plus size={14} />
                      <span>Nieuwe preset</span>
                    </button>
                    <button
                      onClick={handleResetPresets}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors border-0 outline-none"
                      title="Presets terugzetten naar standaard"
                    >
                      <RotateCw size={14} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

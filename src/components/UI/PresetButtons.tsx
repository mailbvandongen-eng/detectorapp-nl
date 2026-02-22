import { useState } from 'react'
import { RotateCcw, Compass, TreePalm, Layers, ChevronUp, Mountain, Waves, Search, Target, Grid3X3, Save, Plus, RotateCw, Check, LucideIcon, Bookmark } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fromLonLat } from 'ol/proj'
import { useLayerStore, useGPSStore, useUIStore, usePresetStore, useSettingsStore, useMapStore } from '../../store'
import { useMonumentFilterStore } from '../../store/monumentFilterStore'
import { isCommercialMode } from '../../config/buildMode'
import type { Preset } from '../../store/presetStore'

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

// Icon color mapping - subtle colors, only colored when active
// Inactive: gray icon, Active: colored icon
const ICON_COLORS_INACTIVE = 'text-gray-400'
const ICON_COLORS_ACTIVE: Record<string, string> = {
  Compass: 'text-purple-500',
  Waves: 'text-cyan-500',
  TreePalm: 'text-green-500',
  Mountain: 'text-stone-500',
  Search: 'text-amber-500',
  Target: 'text-red-500',
  Layers: 'text-blue-500',
  Grid: 'text-lime-500'
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
  'Romeinse wegen (regio)', 'Romeinse wegen (Wereld)', 'Romeinse Forten', 'Kastelen', 'IKAW', 'Archeo Onderzoeken',
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

// Base layers - Esri basemaps + custom
const BASE_LAYERS = [
  'Esri Licht',
  'Esri Straten',
  'Esri Satelliet',
  'Luchtfoto',
  'TMK 1850',
  'Bonnebladen 1900'
]

// VASTE reset waarden - Nederland centrum (Utrecht), ~50km view
// Niet wijzigen! Dit zijn de definitieve reset waarden.
const RESET_CENTER: [number, number] = [5.12, 52.09] // Utrecht - centrum Nederland
const RESET_ZOOM = 7 // ~50km view

export function PresetButtons() {
  const setLayerVisibility = useLayerStore(state => state.setLayerVisibility)
  const stopTracking = useGPSStore(state => state.stopTracking)
  const clearMonumentFilter = useMonumentFilterStore(state => state.clearFilter)
  const { presetsPanelOpen, togglePresetsPanel, closeAllPanels } = useUIStore()
  const { presets, applyPreset, updatePreset, createPreset, resetToDefaults } = usePresetStore()
  const visible = useLayerStore(state => state.visible)
  const isCommercial = isCommercialMode()

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

    // Set Esri Licht as active base layer (for OL)
    BASE_LAYERS.forEach(layer => {
      setLayerVisibility(layer, layer === 'Esri Licht')
    })

    // Reset default background in settings (persisted to localStorage)
    useSettingsStore.getState().setDefaultBackground('Esri Licht')

    // Get map references
    const mapStore = useMapStore.getState()

    // Set ArcGIS basemap
    mapStore.setBasemap('Esri Licht')

    // Stop GPS tracking
    stopTracking()

    // Clear monument filter
    clearMonumentFilter()

    // Reset map view using unified goTo - VASTE WAARDEN
    mapStore.goTo({
      center: RESET_CENTER,
      zoom: RESET_ZOOM,
      animate: true
    })

    console.log('Reset: Esri Licht, alle lagen uit, GPS uit, zoom naar Nederland (midden)')
  }

  const handleApplyPreset = (id: string) => {
    applyPreset(id)
    closeAllPanels()
  }

  // Save current visible layers to a preset
  const handleSaveToPreset = (e: React.MouseEvent, presetId: string, presetName: string) => {
    e.stopPropagation()

    // Confirm before overwriting
    if (!confirm(`Preset "${presetName}" overschrijven met huidige lagen?`)) {
      return
    }

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
    if (confirm('Presets terugzetten naar standaard?')) {
      resetToDefaults()
    }
  }

  // Commercial: top-left, Personal: bottom-left
  const resetPosition = isCommercial
    ? "fixed top-[56px] left-2 z-[800]"
    : "fixed bottom-2 left-2 z-[800]"
  const presetsPosition = isCommercial
    ? "fixed top-2 left-2 z-[800]"
    : "fixed bottom-[60px] left-2 z-[800]"
  const panelPosition = isCommercial
    ? "fixed top-2 left-[56px]"
    : "fixed bottom-[60px] left-[56px]"

  return (
    <>
      {/* Reset button */}
      <motion.button
        onClick={resetAll}
        className={`${resetPosition} w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Reset - Esri Licht, alle lagen uit, GPS uit"
      >
        <RotateCcw size={20} className="text-gray-600 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]" />
      </motion.button>

      {/* Presets button */}
      <motion.button
        onClick={togglePresetsPanel}
        className={`${presetsPosition} w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Presets"
      >
        {presetsPanelOpen ? (
          <ChevronUp size={20} className="text-gray-600 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]" />
        ) : (
          <Bookmark size={20} className="text-gray-600 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]" />
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
              className={`${panelPosition} bg-white/95 rounded-xl shadow-lg overflow-hidden w-[240px] backdrop-blur-sm z-[801]`}
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
                  const isSaved = savedPresetId === preset.id

                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset.id)}
                      className={`preset-btn w-full h-8 flex items-center gap-1.5 px-2 hover:bg-gray-100 rounded text-left transition-colors border-0 outline-none bg-transparent overflow-hidden ${isSaved ? 'bg-green-50' : ''}`}
                      style={{ fontSize: `${baseFontSize}px` }}
                      data-icon={preset.icon}
                    >
                      {/* Icon: gray by default, colored on hover via CSS */}
                      <IconComponent size={14} className="preset-icon flex-shrink-0 text-gray-400 transition-colors" />
                      <span className="text-gray-700 truncate flex-1">{preset.name}</span>
                      {isSaved ? (
                        <span className="p-1 flex-shrink-0">
                          <Check size={14} className="text-green-500" />
                        </span>
                      ) : (
                        <span
                          onClick={(e) => handleSaveToPreset(e, preset.id, preset.name)}
                          className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                          title="Huidige lagen opslaan naar deze preset"
                        >
                          <Save size={12} className="text-gray-400 hover:text-blue-500" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Footer: Add preset left, Reset right */}
              <div className="border-t border-gray-200 px-2 py-1.5">
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
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setShowAddPreset(true)}
                      className="h-8 flex items-center gap-1.5 px-2 text-blue-600 hover:bg-blue-50 rounded transition-colors border-0 outline-none"
                      style={{ fontSize: `${baseFontSize}px` }}
                    >
                      <Plus size={14} />
                      <span className="text-gray-600">Voeg preset toe</span>
                    </button>
                    <button
                      onClick={handleResetPresets}
                      className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors border-0 outline-none"
                      title="Herstel standaard"
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

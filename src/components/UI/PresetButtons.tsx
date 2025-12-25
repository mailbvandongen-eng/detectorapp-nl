import { useState } from 'react'
import { RotateCcw, Compass, TreePalm, Layers, ChevronUp, Mountain, Waves, Search, Target } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLayerStore, useGPSStore } from '../../store'

// Layer presets - NL only
const DETECTIE_LAYERS = [
  'AMK Monumenten',
  'Romeinse wegen',
  'IKAW'
]

const RECREATIE_LAYERS = [
  'Parken',
  'Speeltuinen',
  'Strandjes'
]

const UITERWAARDEN_LAYERS = [
  'UIKAV Punten',
  'UIKAV Vlakken',
  'UIKAV Expert',
  'UIKAV Buffer',
  'UIKAV Indeling'
]

const HILLSHADE_LAYERS = [
  'AHN 0.5m',
  'Geomorfologie',
  'AHN4 Multi-Hillshade NL'
]

const ANALYSE_LAYERS = [
  'IKAW',
  'Geomorfologie',
  'Bodemkaart',
  'AHN4 Multi-Hillshade NL',
  'AMK Monumenten'
]

const WOII_LAYERS = [
  'WWII Bunkers',
  'Slagvelden',
  'Militaire Vliegvelden',
  'Verdedigingslinies',
  'Militaire Objecten'
]

// All overlay layers - NL only
const ALL_OVERLAYS = [
  // Labels overlay (for hybrid map)
  'Labels Overlay',
  // Steentijd layers
  'Hunebedden',
  'FAMKE Steentijd',
  'Grafheuvels',
  'Terpen',
  // Archaeological layers
  'AMK Monumenten',
  'Romeinse wegen',
  'Kastelen',
  'IKAW',
  'Archeo Landschappen',
  // Erfgoed & Monumenten
  'Rijksmonumenten',
  'Werelderfgoed',
  // WOII & Militair
  'WWII Bunkers',
  'Slagvelden',
  'Militaire Vliegvelden',
  // Verdedigingswerken
  'Verdedigingslinies',
  'Inundatiegebieden',
  'Militaire Objecten',
  // Paleokaarten
  'Paleokaart 800 n.Chr.',
  'Paleokaart 100 n.Chr.',
  'Paleokaart 500 v.Chr.',
  'Paleokaart 1500 v.Chr.',
  'Paleokaart 2750 v.Chr.',
  'Paleokaart 5500 v.Chr.',
  'Paleokaart 9000 v.Chr.',
  // Religieus erfgoed
  'Religieus Erfgoed',
  // UIKAV layers
  'UIKAV Punten',
  'UIKAV Vlakken',
  'UIKAV Expert',
  'UIKAV Buffer',
  'UIKAV Indeling',
  // Terrain layers
  'Veengebieden',
  'AHN 0.5m',
  'Geomorfologie',
  'Bodemkaart',
  // Hillshade layers NL
  'AHN4 Hillshade NL',
  'AHN4 Multi-Hillshade NL',
  'AHN4 Helling NL',
  'World Hillshade',
  // Fossil layers
  'Fossielen Nederland',
  'Fossielen België',
  'Fossielen Duitsland',
  'Fossielen Frankrijk',
  // Recreation layers
  'Parken',
  'Speeltuinen',
  'Musea',
  'Strandjes'
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
  const [isOpen, setIsOpen] = useState(false)
  const setLayerVisibility = useLayerStore(state => state.setLayerVisibility)
  const stopTracking = useGPSStore(state => state.stopTracking)

  const resetAll = () => {
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

  const applyPreset = (layers: string[]) => {
    // First clear all overlays
    ALL_OVERLAYS.forEach(layer => setLayerVisibility(layer, false))
    // Then enable preset layers
    layers.forEach(layer => setLayerVisibility(layer, true))
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-[30px] md:bottom-10 left-2 z-[800]">
      {/* Stacked vertically: preset on top, reset below */}
      <div className="flex flex-col gap-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
          title="Presets"
        >
          {isOpen ? (
            <ChevronUp size={22} className="text-blue-600" />
          ) : (
            <Layers size={22} className="text-blue-600" />
          )}
        </button>
        <button
          onClick={resetAll}
          className="w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
          title="Reset - CartoDB, alle lagen uit, GPS uit"
        >
          <RotateCcw size={22} className="text-gray-600" />
        </button>
      </div>

      {/* Expanded: preset options */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-0 left-14 bg-white/95 rounded-xl shadow-lg overflow-hidden min-w-[140px] backdrop-blur-sm"
          >
            <div className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-medium">
              Presets
            </div>
            <div className="p-2">
            <button
              onClick={() => applyPreset(DETECTIE_LAYERS)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-purple-50 rounded text-left transition-colors border-0 outline-none bg-transparent"
            >
              <Compass size={14} className="text-purple-600" />
              <span className="text-xs text-gray-700">Detectie</span>
            </button>
            <button
              onClick={() => applyPreset(UITERWAARDEN_LAYERS)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-cyan-50 rounded text-left transition-colors border-0 outline-none bg-transparent"
            >
              <Waves size={14} className="text-cyan-600" />
              <span className="text-xs text-gray-700">Uiterwaarden</span>
            </button>
            <button
              onClick={() => applyPreset(RECREATIE_LAYERS)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-green-50 rounded text-left transition-colors border-0 outline-none bg-transparent"
            >
              <TreePalm size={14} className="text-green-600" />
              <span className="text-xs text-gray-700">Recreatie</span>
            </button>
            <button
              onClick={() => applyPreset(HILLSHADE_LAYERS)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-stone-50 rounded text-left transition-colors border-0 outline-none bg-transparent"
            >
              <Mountain size={14} className="text-stone-600" />
              <span className="text-xs text-gray-700">Hillshade</span>
            </button>
            <button
              onClick={() => applyPreset(ANALYSE_LAYERS)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-amber-50 rounded text-left transition-colors border-0 outline-none bg-transparent"
            >
              <Search size={14} className="text-amber-600" />
              <span className="text-xs text-gray-700">Analyse</span>
            </button>
            <button
              onClick={() => applyPreset(WOII_LAYERS)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-red-50 rounded text-left transition-colors border-0 outline-none bg-transparent"
            >
              <Target size={14} className="text-red-600" />
              <span className="text-xs text-gray-700">WOII</span>
            </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

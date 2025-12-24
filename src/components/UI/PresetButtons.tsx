import { useState } from 'react'
import { RotateCcw, Compass, TreePalm, ShoppingBag, Layers, ChevronUp, Mountain } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLayerStore, useGPSStore } from '../../store'

// Layer presets
const DETECTIE_LAYERS = [
  'AMK Monumenten',
  'Romeinse wegen',
  'Castella (punten)',
  'Castella (lijnen)',
  'Toestemmingen'
]

const RECREATIE_LAYERS = [
  'Parken',
  'Speeltuinen',
  'Strandjes'
]

const UITJES_LAYERS = [
  'Musea',
  'Kringloopwinkels'
]

const HILLSHADE_LAYERS = [
  'AHN 0.5m',
  'Geomorfologie',
  'AHN4 Multi-Hillshade NL'
]

// All overlay layers (complete list)
const ALL_OVERLAYS = [
  // Steentijd layers
  'Hunebedden',
  'EUROEVOL Sites',
  'FAMKE Steentijd',
  'Archeo Landschappen',
  'IKAW',
  // Archaeological layers
  'AMK Monumenten',
  'Archis-punten',
  'CAI Vlaanderen',
  'Romeinse wegen',
  'Castella (punten)',
  'Castella (lijnen)',
  'Oppida',
  'Kastelen',
  'Toestemmingen',
  'Archeo Zones Vlaanderen',
  'Beschermde Sites Vlaanderen',
  'Monumenten BE',
  'Archeo Zones BE',
  'Arch Sites BE',
  'Erfgoed Landschap BE',
  'CAI Elementen',
  'Hist. Gebouwen FR',
  'INRAP Sites FR',
  'Archeo Sites Bretagne',
  'Operaties Bretagne',
  'Archeo Parijs',
  'Sites Patrimoine Occitanie',
  'Sites Patrimoine PACA',
  'Maginotlinie',
  'Sites Patrimoine Normandie',
  'Vici.org Romeins',
  // UIKAV layers
  'Archeo Punten',
  'Vlakken',
  'Expert',
  'Bufferlaag',
  'Indeling',
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
  // Hillshade layers BE
  'Hillshade Vlaanderen 25cm',
  'Skyview Vlaanderen 25cm',
  'DTM Vlaanderen 1m',
  'Hillshade Wallonië',
  // Hillshade layers DE
  'Hillshade NRW 25cm',
  'Hillshade NRW Kleur',
  // Hillshade layers FR
  'Hillshade Frankrijk',
  'LiDAR HD Frankrijk',
  'RGE Alti Frankrijk 1m',
  'Hoogtelijn Frankrijk',
  // Fossil layers
  'Fossielen Nederland',
  'Fossielen België',
  'Fossielen Duitsland',
  'Fossielen Frankrijk',
  // Recreation layers
  'Parken',
  'Speeltuinen',
  'Musea',
  'Strandjes',
  'Kringloopwinkels'
]

// Base layers
const BASE_LAYERS = [
  'CartoDB Positron',
  'OpenStreetMap',
  'Satellite',
  'TMK 1850',
  'Bonnebladen 1900',
  'Carte Cassini'
]

export function PresetButtons() {
  const [isOpen, setIsOpen] = useState(false)
  const setLayerVisibility = useLayerStore(state => state.setLayerVisibility)
  const stopTracking = useGPSStore(state => state.stopTracking)

  const resetAll = () => {
    // Turn off all overlay layers
    ALL_OVERLAYS.forEach(layer => setLayerVisibility(layer, false))

    // Set CartoDB Positron as active base layer
    BASE_LAYERS.forEach(layer => {
      setLayerVisibility(layer, layer === 'CartoDB Positron')
    })

    // Stop GPS tracking
    stopTracking()

    console.log('🔄 Reset: CartoDB Positron, alle lagen uit, GPS uit')
  }

  const applyPreset = (layers: string[]) => {
    // First clear all overlays
    ALL_OVERLAYS.forEach(layer => setLayerVisibility(layer, false))
    // Then enable preset layers
    layers.forEach(layer => setLayerVisibility(layer, true))
    setIsOpen(false)
  }

  return (
    <div className="fixed bottom-12 left-2.5 z-[800]">
      {/* Collapsed: just toggle button + reset */}
      <div className="flex gap-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-blue-50 rounded shadow-sm border-0 outline-none transition-colors"
          title="Presets"
        >
          {isOpen ? (
            <ChevronUp size={16} className="text-blue-600" />
          ) : (
            <Layers size={16} className="text-blue-600" />
          )}
        </button>
        <button
          onClick={resetAll}
          className="w-8 h-8 flex items-center justify-center bg-white/90 hover:bg-gray-100 rounded shadow-sm border-0 outline-none transition-colors"
          title="Reset - CartoDB, alle lagen uit, GPS uit"
        >
          <RotateCcw size={16} className="text-gray-600" />
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
            className="absolute bottom-10 left-0 bg-white/95 rounded-lg shadow-lg p-1.5 min-w-[140px]"
          >
            <button
              onClick={() => applyPreset(DETECTIE_LAYERS)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-purple-50 rounded text-left transition-colors border-0 outline-none bg-transparent"
            >
              <Compass size={14} className="text-purple-600" />
              <span className="text-xs text-gray-700">Detectie</span>
            </button>
            <button
              onClick={() => applyPreset(RECREATIE_LAYERS)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-green-50 rounded text-left transition-colors border-0 outline-none bg-transparent"
            >
              <TreePalm size={14} className="text-green-600" />
              <span className="text-xs text-gray-700">Recreatie</span>
            </button>
            <button
              onClick={() => applyPreset(UITJES_LAYERS)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-amber-50 rounded text-left transition-colors border-0 outline-none bg-transparent"
            >
              <ShoppingBag size={14} className="text-amber-600" />
              <span className="text-xs text-gray-700">Uitjes</span>
            </button>
            <button
              onClick={() => applyPreset(HILLSHADE_LAYERS)}
              className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-stone-50 rounded text-left transition-colors border-0 outline-none bg-transparent"
            >
              <Mountain size={14} className="text-stone-600" />
              <span className="text-xs text-gray-700">Hillshade</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

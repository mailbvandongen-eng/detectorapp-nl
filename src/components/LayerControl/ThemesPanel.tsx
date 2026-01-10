import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { X, Layers, Check, Upload, ExternalLink, Globe, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useUIStore, useSettingsStore } from '../../store'
import { useCustomPointLayerStore } from '../../store/customPointLayerStore'
import { useCustomLayerStore } from '../../store/customLayerStore'
import { LayerGroup } from './LayerGroup'
import { LayerItem } from './LayerItem'
import { CustomLayerItem } from '../CustomLayers/CustomLayerItem'

// Speciale archeologische 3D projecten - externe links
const SPECIAL_PROJECTS = [
  { name: 'Rapa Nui - Moai Productie', url: 'https://arcg.is/qu59O1', desc: 'Paaseiland steengroeve in 3D' },
  { name: 'Digital Giza - Piramides', url: 'http://giza.fas.harvard.edu/giza3d/', desc: 'Harvard 3D reconstructie' },
  { name: 'Stonehenge 360°', url: 'https://www.english-heritage.org.uk/visit/places/stonehenge/history-and-stories/stonehenge360/', desc: 'English Heritage virtuele tour' },
  { name: 'Pompeii 3D Explorer', url: 'https://www.cyark.org/projects/pompeii/3D-Explorer', desc: 'CyArk LiDAR scans' },
  { name: 'Virtual Angkor Wat', url: 'https://www.virtualangkor.com/', desc: '3D reconstructie 1300 n.Chr.' },
  { name: 'Petra Virtuele Tour', url: 'https://www.zamaniproject.org/site-jordan-petra.html', desc: 'Zamani Project 3D' },
]

const HERITAGE_PLATFORMS = [
  { name: 'CyArk (200+ sites)', url: 'https://www.cyark.org/projects/', desc: 'Wereldwijd erfgoed archief' },
  { name: 'Google Open Heritage', url: 'https://artsandculture.google.com/project/openheritage', desc: '26+ UNESCO sites in 3D' },
]

export function ThemesPanel() {
  const { themesPanelOpen, toggleThemesPanel, toggleSettingsPanel } = useUIStore()
  const { layers: customLayers, toggleVisibility } = useCustomPointLayerStore()
  const importedLayers = useCustomLayerStore(state => state.layers)
  const panelRef = useRef<HTMLDivElement>(null)

  // Explicit selectors to ensure re-render on state change
  const layerPanelFontScale = useSettingsStore(state => state.layerPanelFontScale)
  const setLayerPanelFontScale = useSettingsStore(state => state.setLayerPanelFontScale)
  const showFontSliders = useSettingsStore(state => state.showFontSliders)

  // Calculate font size based on panel-specific fontScale
  const baseFontSize = 13 * layerPanelFontScale / 100

  // State for special projects section
  const [specialProjectsOpen, setSpecialProjectsOpen] = useState(false)

  // Close on click outside
  useEffect(() => {
    if (!themesPanelOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        toggleThemesPanel()
      }
    }

    // Small delay to prevent immediate close
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [themesPanelOpen, toggleThemesPanel])

  return (
    <AnimatePresence>
      {themesPanelOpen && (
          <motion.div
            ref={panelRef}
            className="fixed top-2.5 right-2 z-[1101] bg-white rounded-lg shadow-lg overflow-hidden w-[300px] max-h-[calc(100vh-200px)] flex flex-col"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header with title and font size slider - blue bg, white text, scales with slider */}
            <div className="flex items-center justify-between px-3 py-2 bg-blue-500" style={{ fontSize: `${baseFontSize}px` }}>
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-white" />
                <span className="font-medium text-white">Kaartlagen</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Font size slider - only if boomer mode enabled */}
                {showFontSliders && (
                  <>
                    <span className="text-[10px] text-blue-200">T</span>
                    <input
                      type="range"
                      min="80"
                      max="130"
                      step="10"
                      value={layerPanelFontScale}
                      onInput={(e) => {
                        setLayerPanelFontScale(parseInt((e.target as HTMLInputElement).value))
                      }}
                      onChange={(e) => setLayerPanelFontScale(parseInt(e.target.value))}
                      className="w-20 opacity-70 hover:opacity-100 transition-opacity"
                      title={`Tekstgrootte: ${layerPanelFontScale}%`}
                    />
                    <span className="text-xs text-blue-200">T</span>
                  </>
                )}
                <button
                  onClick={toggleThemesPanel}
                  className="p-0.5 rounded border-0 outline-none bg-blue-400/50 hover:bg-blue-400 transition-colors ml-1"
                >
                  <X size={16} className="text-white" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          <div className="p-2 overflow-y-auto flex-1" style={{ fontSize: `${baseFontSize}px` }}>
            {/* Mijn lagen - custom point layers with orange header */}
            {customLayers.filter(l => !l.archived).length > 0 && (
              <div className="mb-2 pb-1 border-b border-gray-100">
                <div className="flex items-center gap-1 py-0.5 px-1 mb-1">
                  <span className="text-orange-600 font-medium" style={{ fontSize: '0.9em' }}>Mijn lagen</span>
                </div>
                {customLayers.filter(l => !l.archived).map(layer => (
                  <button
                    key={layer.id}
                    onClick={(e) => { e.stopPropagation(); toggleVisibility(layer.id) }}
                    className={`w-full flex items-center justify-between py-1 pl-3 pr-2 border-0 outline-none transition-colors text-left ${
                      layer.visible ? 'bg-orange-50 hover:bg-orange-100' : 'bg-transparent hover:bg-orange-50'
                    }`}
                    style={{ fontSize: 'inherit' }}
                  >
                    <span className="flex items-center gap-2 text-gray-600">
                      {layer.name}
                      <span className="text-xs text-gray-400">({layer.points.length})</span>
                    </span>
                    <div
                      className="w-4 h-4 rounded-sm flex items-center justify-center transition-all duration-100 flex-shrink-0"
                      style={{
                        backgroundColor: layer.visible ? '#f97316' : 'white',
                        border: layer.visible ? '2px solid #f97316' : '2px solid #fb923c',
                        color: 'white'
                      }}
                    >
                      {layer.visible && <Check size={12} strokeWidth={3} />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Geïmporteerde lagen - section with teal/cyan header */}
            {importedLayers.length > 0 && (
              <div className="mb-2 pb-1 border-b border-gray-100">
                <div className="flex items-center gap-1 py-0.5 px-1 mb-1">
                  <Upload size={12} className="text-cyan-600" />
                  <span className="text-cyan-600 font-medium" style={{ fontSize: '0.9em' }}>Geïmporteerde lagen</span>
                </div>
                {importedLayers.map(layer => (
                  <CustomLayerItem key={layer.id} layer={layer} compact />
                ))}
                <button
                  onClick={() => { toggleThemesPanel(); toggleSettingsPanel() }}
                  className="w-full text-left py-1 pl-3 text-xs text-cyan-500 hover:text-cyan-700 hover:bg-cyan-50 transition-colors"
                >
                  + Laag importeren...
                </button>
              </div>
            )}

            {/* Basislaag - vaste sectie zonder pijltje */}
            <div className="mb-2">
              <div className="flex items-center gap-1 py-1 px-1 mb-1">
                <span className="text-blue-600 font-medium" style={{ fontSize: '0.95em' }}>Basislaag</span>
              </div>
              <div className="space-y-0">
                <LayerItem name="CartoDB (licht)" type="base" />
                <LayerItem name="OpenStreetMap" type="base" />
                <LayerItem name="Luchtfoto" type="base" hasOverlay />
                <LayerItem name="TMK 1850" type="base" hasOverlay />
                <LayerItem name="Bonnebladen 1900" type="base" hasOverlay />
              </div>
            </div>

            {/* Thema's - vaste sectie, daaronder inklapbare groepen */}
            <div className="mb-2">
              <div className="flex items-center gap-1 py-1 px-1 mb-1 border-t border-gray-100 pt-2">
                <span className="text-blue-600 font-medium" style={{ fontSize: '0.95em' }}>Thema's</span>
              </div>
              {/* Steentijd (Stone Age) */}
              <LayerGroup title="Steentijd & Prehistorie" defaultExpanded={false} layerNames={['Hunebedden', 'Grafheuvels', 'Terpen']}>
                <LayerItem name="Hunebedden" type="overlay" />
                <LayerItem name="Grafheuvels" type="overlay" />
                <LayerItem name="Terpen" type="overlay" />
              </LayerGroup>

              {/* Paleogeografische kaarten - eigen groep */}
              <LayerGroup title="Paleokaarten" defaultExpanded={false} layerNames={['Paleokaart 9000 v.Chr.', 'Paleokaart 5500 v.Chr.', 'Paleokaart 2750 v.Chr.', 'Paleokaart 1500 v.Chr.', 'Paleokaart 500 v.Chr.', 'Paleokaart 100 n.Chr.', 'Paleokaart 800 n.Chr.']}>
                <LayerItem name="Paleokaart 9000 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 5500 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 2750 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 1500 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 500 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 100 n.Chr." type="overlay" />
                <LayerItem name="Paleokaart 800 n.Chr." type="overlay" />
              </LayerGroup>

              {/* Archaeological Layers */}
              <LayerGroup title="Archeologische lagen" defaultExpanded={false} layerNames={['FAMKE Steentijd', 'FAMKE IJzertijd', 'AMK Monumenten', 'AMK Romeins', 'AMK Steentijd', 'AMK Vroege ME', 'AMK Late ME', 'AMK Overig', 'Archeo Onderzoeken', 'Romeinse wegen (regio)', 'Romeinse wegen (Wereld)', 'Romeinse Forten', 'Romeinse Forten Lijnen']}>
                <LayerItem name="FAMKE Steentijd" type="overlay" />
                <LayerItem name="FAMKE IJzertijd" type="overlay" />
                <LayerItem name="AMK Monumenten" type="overlay" />
                {/* AMK per periode */}
                <LayerGroup title="AMK per periode" defaultExpanded={false} layerNames={['AMK Romeins', 'AMK Steentijd', 'AMK Vroege ME', 'AMK Late ME', 'AMK Overig']}>
                  <LayerItem name="AMK Romeins" type="overlay" />
                  <LayerItem name="AMK Steentijd" type="overlay" />
                  <LayerItem name="AMK Vroege ME" type="overlay" />
                  <LayerItem name="AMK Late ME" type="overlay" />
                  <LayerItem name="AMK Overig" type="overlay" />
                </LayerGroup>
                <LayerItem name="Archeo Onderzoeken" type="overlay" />
                {/* Romeinse tijd - wegen en forten direct zichtbaar */}
                <LayerGroup title="Romeinse tijd" defaultExpanded={false} layerNames={['Romeinse wegen (regio)', 'Romeinse wegen (Wereld)', 'Romeinse Forten', 'Romeinse Forten Lijnen']}>
                  <LayerItem name="Romeinse wegen (regio)" type="overlay" />
                  <LayerItem name="Romeinse wegen (Wereld)" type="overlay" />
                  <LayerItem name="Romeinse Forten" type="overlay" />
                  <LayerItem name="Romeinse Forten Lijnen" type="overlay" />
                </LayerGroup>
              </LayerGroup>

              {/* Archeologische verwachtingen */}
              <LayerGroup title="Archeologische verwachtingen" defaultExpanded={false} layerNames={['IKAW', 'UIKAV Punten', 'UIKAV Vlakken', 'UIKAV Expert', 'UIKAV Buffer', 'UIKAV Indeling']}>
                <LayerItem name="IKAW" type="overlay" />
                <LayerItem name="UIKAV Punten" type="overlay" />
                <LayerItem name="UIKAV Vlakken" type="overlay" />
                <LayerItem name="UIKAV Expert" type="overlay" />
                <LayerItem name="UIKAV Buffer" type="overlay" />
                <LayerItem name="UIKAV Indeling" type="overlay" />
              </LayerGroup>

              {/* Erfgoed & Monumenten */}
              <LayerGroup title="Erfgoed & Monumenten" defaultExpanded={false} layerNames={['Rijksmonumenten', 'Werelderfgoed', 'Religieus Erfgoed', 'Kastelen', 'Ruïnes']}>
                <LayerItem name="Rijksmonumenten" type="overlay" />
                <LayerItem name="Werelderfgoed" type="overlay" />
                <LayerItem name="Religieus Erfgoed" type="overlay" />
                <LayerItem name="Kastelen" type="overlay" />
                <LayerItem name="Ruïnes" type="overlay" />
              </LayerGroup>

              {/* WOII & Militair */}
              <LayerGroup title="WOII & Militair" defaultExpanded={false} layerNames={['WWII Bunkers', 'Slagvelden', 'Militaire Vliegvelden', 'Verdedigingslinies', 'Militaire Objecten', 'Inundatiegebieden']}>
                <LayerItem name="WWII Bunkers" type="overlay" />
                <LayerItem name="Slagvelden" type="overlay" />
                <LayerItem name="Militaire Vliegvelden" type="overlay" />
                <LayerItem name="Verdedigingslinies" type="overlay" />
                <LayerItem name="Militaire Objecten" type="overlay" />
                <LayerItem name="Inundatiegebieden" type="overlay" />
              </LayerGroup>

              {/* Hillshade & LiDAR Layers */}
              <LayerGroup title="Hillshade & LiDAR" defaultExpanded={false} layerNames={['Hoogtekaart (WebGL)', 'AHN4 Hoogtekaart Kleur', 'AHN4 Hillshade NL', 'AHN4 Multi-Hillshade NL', 'AHN 0.5m']}>
                <LayerItem name="Hoogtekaart (WebGL)" type="overlay" />
                <LayerItem name="AHN4 Hoogtekaart Kleur" type="overlay" />
                <LayerItem name="AHN4 Hillshade NL" type="overlay" />
                <LayerItem name="AHN4 Multi-Hillshade NL" type="overlay" />
                <LayerItem name="AHN 0.5m" type="overlay" />
              </LayerGroup>

              {/* Terrain Layers */}
              <LayerGroup title="Terrein & Bodem" defaultExpanded={false} layerNames={['Veengebieden', 'Geomorfologie', 'Bodemkaart', 'Essen']}>
                <LayerItem name="Veengebieden" type="overlay" />
                <LayerItem name="Geomorfologie" type="overlay" />
                <LayerItem name="Bodemkaart" type="overlay" />
                <LayerItem name="Essen" type="overlay" />
              </LayerGroup>

              {/* Percelen - Kadaster & Landbouw */}
              <LayerGroup title="Percelen" defaultExpanded={false} layerNames={['Gewaspercelen', 'Kadastrale Grenzen']}>
                <LayerItem name="Gewaspercelen" type="overlay" />
                <LayerItem name="Kadastrale Grenzen" type="overlay" />
              </LayerGroup>

              {/* Provinciale Thema's */}
              <LayerGroup title="Provinciale Thema's" defaultExpanded={false} layerNames={['Scheepswrakken', 'Woonheuvels ZH', 'Windmolens', 'Erfgoedlijnen', 'Oude Kernen', 'Relictenkaart Punten', 'Relictenkaart Lijnen', 'Relictenkaart Vlakken', 'Verdronken Dorpen']}>
                {/* Zuid-Holland */}
                <LayerGroup title="Zuid-Holland" defaultExpanded={false} layerNames={['Scheepswrakken', 'Woonheuvels ZH', 'Windmolens', 'Erfgoedlijnen', 'Oude Kernen']}>
                  <LayerItem name="Scheepswrakken" type="overlay" />
                  <LayerItem name="Woonheuvels ZH" type="overlay" />
                  <LayerItem name="Windmolens" type="overlay" />
                  <LayerItem name="Erfgoedlijnen" type="overlay" />
                  <LayerItem name="Oude Kernen" type="overlay" />
                </LayerGroup>
                {/* Gelderland */}
                <LayerGroup title="Gelderland" defaultExpanded={false} layerNames={['Relictenkaart Punten', 'Relictenkaart Lijnen', 'Relictenkaart Vlakken']}>
                  <LayerItem name="Relictenkaart Punten" type="overlay" />
                  <LayerItem name="Relictenkaart Lijnen" type="overlay" />
                  <LayerItem name="Relictenkaart Vlakken" type="overlay" />
                </LayerGroup>
                {/* Zeeland */}
                <LayerGroup title="Zeeland" defaultExpanded={false} layerNames={['Verdronken Dorpen']}>
                  <LayerItem name="Verdronken Dorpen" type="overlay" />
                </LayerGroup>
              </LayerGroup>

              {/* Fossils, Minerals & Gold */}
              <LayerGroup title="Fossielen, Mineralen & Goud" defaultExpanded={false} layerNames={['Fossiel Hotspots', 'Mineralen Hotspots', 'Goudrivieren', 'Fossielen Nederland', 'Fossielen België', 'Fossielen Duitsland', 'Fossielen Frankrijk']}>
                <LayerItem name="Fossiel Hotspots" type="overlay" />
                <LayerItem name="Mineralen Hotspots" type="overlay" />
                <LayerItem name="Goudrivieren" type="overlay" />
                <LayerItem name="Fossielen Nederland" type="overlay" />
                <LayerItem name="Fossielen België" type="overlay" />
                <LayerItem name="Fossielen Duitsland" type="overlay" />
                <LayerItem name="Fossielen Frankrijk" type="overlay" />
              </LayerGroup>

              {/* Recreation */}
              <LayerGroup title="Recreatie" defaultExpanded={false} layerNames={['Ruiterpaden', 'Laarzenpaden', 'Parken', 'Speeltuinen', 'Musea', 'Strandjes', 'Kringloopwinkels']}>
                <LayerItem name="Ruiterpaden" type="overlay" />
                <LayerItem name="Laarzenpaden" type="overlay" />
                <LayerItem name="Parken" type="overlay" />
                <LayerItem name="Speeltuinen" type="overlay" />
                <LayerItem name="Musea" type="overlay" />
                <LayerItem name="Strandjes" type="overlay" />
                <LayerItem name="Kringloopwinkels" type="overlay" />
              </LayerGroup>

              {/* Speciale Projecten - externe 3D archeologische sites */}
              <div className="mb-2">
                <button
                  onClick={(e) => { e.stopPropagation(); setSpecialProjectsOpen(!specialProjectsOpen) }}
                  className="w-full flex items-center gap-1 py-1 px-1 hover:bg-purple-50 rounded transition-colors border-0 outline-none bg-transparent"
                >
                  {specialProjectsOpen ? (
                    <ChevronDown size={14} className="text-purple-500" />
                  ) : (
                    <ChevronRight size={14} className="text-purple-500" />
                  )}
                  <Globe size={12} className="text-purple-500" />
                  <span className="text-purple-600 font-medium" style={{ fontSize: '0.95em' }}>Speciale Projecten</span>
                  <ExternalLink size={10} className="text-purple-400 ml-auto" />
                </button>

                {specialProjectsOpen && (
                  <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                    {/* Individuele sites */}
                    {SPECIAL_PROJECTS.map((project) => (
                      <a
                        key={project.name}
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center justify-between py-1.5 pl-6 pr-2 hover:bg-purple-50 rounded transition-colors text-left"
                        style={{ fontSize: 'inherit' }}
                      >
                        <div className="flex flex-col">
                          <span className="text-gray-700">{project.name}</span>
                          <span className="text-gray-400" style={{ fontSize: '0.8em' }}>{project.desc}</span>
                        </div>
                        <ExternalLink size={12} className="text-purple-400 flex-shrink-0 ml-2" />
                      </a>
                    ))}

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-1.5 mx-2" />

                    {/* Platforms */}
                    {HERITAGE_PLATFORMS.map((platform) => (
                      <a
                        key={platform.name}
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full flex items-center justify-between py-1.5 pl-6 pr-2 hover:bg-purple-50 rounded transition-colors text-left"
                        style={{ fontSize: 'inherit' }}
                      >
                        <div className="flex flex-col">
                          <span className="text-gray-700 font-medium">{platform.name}</span>
                          <span className="text-gray-400" style={{ fontSize: '0.8em' }}>{platform.desc}</span>
                        </div>
                        <ExternalLink size={12} className="text-purple-400 flex-shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

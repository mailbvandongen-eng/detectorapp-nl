import { motion, AnimatePresence } from 'framer-motion'
import { useRef, useEffect } from 'react'
import { X, Layers } from 'lucide-react'
import { useUIStore } from '../../store'
import { LayerGroup } from './LayerGroup'
import { LayerItem } from './LayerItem'

export function ThemesPanel() {
  const { themesPanelOpen, toggleThemesPanel } = useUIStore()
  const panelRef = useRef<HTMLDivElement>(null)

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
            className="fixed top-2.5 right-2 z-[1101] bg-white rounded-lg shadow-lg overflow-hidden w-[240px] max-h-[calc(100vh-200px)] flex flex-col"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center gap-2">
                <Layers size={14} />
                <span className="font-medium text-sm">Kaartlagen</span>
              </div>
              <button
                onClick={toggleThemesPanel}
                className="p-0.5 rounded border-0 outline-none hover:bg-white/20 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          <div className="p-2 overflow-y-auto flex-1">
            {/* Mijn Vondsten - direct weergeven, niet in groep */}
            <div className="mb-2 pb-1 border-b border-gray-100">
              <LayerItem name="Mijn Vondsten" type="overlay" />
            </div>

            {/* Achtergronden */}
            <LayerGroup title="Achtergronden" defaultExpanded={true}>
              <LayerItem name="CartoDB (licht)" type="base" />
              <LayerItem name="OpenStreetMap" type="base" />
              <LayerItem name="Luchtfoto" type="base" />
              <LayerItem name="Labels Overlay" type="overlay" />
              <LayerItem name="TMK 1850" type="base" />
              <LayerItem name="Bonnebladen 1900" type="base" />
            </LayerGroup>

            {/* Thema's - alle overlay lagen */}
            <LayerGroup title="Thema's" defaultExpanded={true}>
              {/* Steentijd (Stone Age) */}
              <LayerGroup title="Steentijd & Prehistorie" defaultExpanded={false} layerNames={['Hunebedden', 'FAMKE Steentijd', 'Grafheuvels', 'Terpen', 'Essen']}>
                <LayerItem name="Hunebedden" type="overlay" />
                <LayerItem name="FAMKE Steentijd" type="overlay" />
                <LayerItem name="Grafheuvels" type="overlay" />
                <LayerItem name="Terpen" type="overlay" />
                <LayerItem name="Essen" type="overlay" />
              </LayerGroup>

              {/* Archaeological Layers */}
              <LayerGroup title="Archeologische lagen" defaultExpanded={false} layerNames={['AMK Monumenten', 'AMK Romeins', 'AMK Steentijd', 'AMK Vroege ME', 'AMK Late ME', 'AMK Overig', 'Romeinse wegen', 'Romeinse wegen (Wereld)', 'IKAW', 'Archeo Landschappen']}>
                <LayerItem name="AMK Monumenten" type="overlay" />
                {/* AMK per periode */}
                <LayerGroup title="AMK per periode" defaultExpanded={false} layerNames={['AMK Romeins', 'AMK Steentijd', 'AMK Vroege ME', 'AMK Late ME', 'AMK Overig']}>
                  <LayerItem name="AMK Romeins" type="overlay" />
                  <LayerItem name="AMK Steentijd" type="overlay" />
                  <LayerItem name="AMK Vroege ME" type="overlay" />
                  <LayerItem name="AMK Late ME" type="overlay" />
                  <LayerItem name="AMK Overig" type="overlay" />
                </LayerGroup>
                <LayerItem name="Romeinse wegen" type="overlay" />
                <LayerItem name="Romeinse wegen (Wereld)" type="overlay" />
                <LayerItem name="IKAW" type="overlay" />
                <LayerItem name="Archeo Landschappen" type="overlay" />
              </LayerGroup>

              {/* Erfgoed & Monumenten */}
              <LayerGroup title="Erfgoed & Monumenten" defaultExpanded={false} layerNames={['Rijksmonumenten', 'Werelderfgoed', 'Religieus Erfgoed', 'Kastelen']}>
                <LayerItem name="Rijksmonumenten" type="overlay" />
                <LayerItem name="Werelderfgoed" type="overlay" />
                <LayerItem name="Religieus Erfgoed" type="overlay" />
                <LayerItem name="Kastelen" type="overlay" />
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

              {/* Paleogeografische kaarten */}
              <LayerGroup title="Paleokaarten (tijdreizen)" defaultExpanded={false} layerNames={['Paleokaart 800 n.Chr.', 'Paleokaart 100 n.Chr.', 'Paleokaart 500 v.Chr.', 'Paleokaart 1500 v.Chr.', 'Paleokaart 2750 v.Chr.', 'Paleokaart 5500 v.Chr.', 'Paleokaart 9000 v.Chr.']}>
                <LayerItem name="Paleokaart 800 n.Chr." type="overlay" />
                <LayerItem name="Paleokaart 100 n.Chr." type="overlay" />
                <LayerItem name="Paleokaart 500 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 1500 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 2750 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 5500 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 9000 v.Chr." type="overlay" />
              </LayerGroup>


              {/* Uiterwaarden Layers */}
              <LayerGroup title="Uiterwaarden (UIKAV)" defaultExpanded={false} layerNames={['UIKAV Punten', 'UIKAV Vlakken', 'UIKAV Expert', 'UIKAV Buffer', 'UIKAV Indeling']}>
                <LayerItem name="UIKAV Punten" type="overlay" />
                <LayerItem name="UIKAV Vlakken" type="overlay" />
                <LayerItem name="UIKAV Expert" type="overlay" />
                <LayerItem name="UIKAV Buffer" type="overlay" />
                <LayerItem name="UIKAV Indeling" type="overlay" />
              </LayerGroup>

              {/* Hillshade & LiDAR Layers */}
              <LayerGroup title="Hillshade & LiDAR" defaultExpanded={false} layerNames={['AHN4 Hoogtekaart Kleur', 'AHN4 Hillshade NL', 'AHN4 Multi-Hillshade NL', 'AHN 0.5m', 'World Hillshade']}>
                <LayerItem name="AHN4 Hoogtekaart Kleur" type="overlay" />
                <LayerItem name="AHN4 Hillshade NL" type="overlay" />
                <LayerItem name="AHN4 Multi-Hillshade NL" type="overlay" />
                <LayerItem name="AHN 0.5m" type="overlay" />
                <LayerItem name="World Hillshade" type="overlay" />
              </LayerGroup>

              {/* Terrain Layers */}
              <LayerGroup title="Terrein & Bodem" defaultExpanded={false} layerNames={['Veengebieden', 'Geomorfologie', 'Bodemkaart']}>
                <LayerItem name="Veengebieden" type="overlay" />
                <LayerItem name="Geomorfologie" type="overlay" />
                <LayerItem name="Bodemkaart" type="overlay" />
              </LayerGroup>

              {/* Percelen - Kadaster & Landbouw */}
              <LayerGroup title="Percelen" defaultExpanded={false} layerNames={['Gewaspercelen', 'Kadastrale Grenzen']}>
                <LayerItem name="Gewaspercelen" type="overlay" />
                <LayerItem name="Kadastrale Grenzen" type="overlay" />
              </LayerGroup>

              {/* Provinciale Waardenkaarten */}
              <LayerGroup title="Provinciale Kaarten" defaultExpanded={false} layerNames={['Scheepswrakken', 'Woonheuvels ZH', 'Romeinse Forten', 'Windmolens', 'Erfgoedlijnen', 'Oude Kernen', 'Relictenkaart Punten', 'Relictenkaart Lijnen', 'Relictenkaart Vlakken', 'Verdronken Dorpen']}>
                {/* Zuid-Holland */}
                <LayerGroup title="Zuid-Holland" defaultExpanded={false} layerNames={['Scheepswrakken', 'Woonheuvels ZH', 'Romeinse Forten', 'Windmolens', 'Erfgoedlijnen', 'Oude Kernen']}>
                  <LayerItem name="Scheepswrakken" type="overlay" />
                  <LayerItem name="Woonheuvels ZH" type="overlay" />
                  <LayerItem name="Romeinse Forten" type="overlay" />
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

              {/* Fossils */}
              <LayerGroup title="Fossielen (vondsten)" defaultExpanded={false} layerNames={['Fossielen Nederland', 'Fossielen België', 'Fossielen Duitsland', 'Fossielen Frankrijk']}>
                <LayerItem name="Fossielen Nederland" type="overlay" />
                <LayerItem name="Fossielen België" type="overlay" />
                <LayerItem name="Fossielen Duitsland" type="overlay" />
                <LayerItem name="Fossielen Frankrijk" type="overlay" />
              </LayerGroup>

              {/* Recreation */}
              <LayerGroup title="Recreatie" defaultExpanded={false} layerNames={['Parken', 'Speeltuinen', 'Musea', 'Strandjes']}>
                <LayerItem name="Parken" type="overlay" />
                <LayerItem name="Speeltuinen" type="overlay" />
                <LayerItem name="Musea" type="overlay" />
                <LayerItem name="Strandjes" type="overlay" />
              </LayerGroup>
            </LayerGroup>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useUIStore } from '../../store'
import { LayerGroup } from './LayerGroup'
import { LayerItem } from './LayerItem'

export function LayerControlPanel() {
  const { layerControlOpen, toggleLayerControl } = useUIStore()

  return (
    <AnimatePresence>
      {layerControlOpen && (
        <motion.div
          className="fixed top-2.5 right-2.5 z-[999] bg-white rounded-lg shadow-lg overflow-hidden w-[280px] max-h-[calc(100vh-220px)] flex flex-col"
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
        >
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <span className="font-medium text-sm">Kaartlagen</span>
            <button
              onClick={toggleLayerControl}
              className="p-0.5 rounded border-0 outline-none hover:bg-white/20 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="p-2 overflow-y-auto flex-1">
              {/* Base Layers - collapsed by default */}
              <LayerGroup title="Achtergrond" defaultExpanded={false}>
                <LayerItem name="CartoDB (licht)" type="base" />
                <LayerItem name="OpenStreetMap" type="base" />
                <LayerItem name="Luchtfoto" type="base" />
                <LayerItem name="Labels Overlay" type="overlay" />
                <LayerItem name="TMK 1850" type="base" />
                <LayerItem name="Bonnebladen 1900" type="base" />
              </LayerGroup>

              {/* Steentijd (Stone Age) */}
              <LayerGroup title="Steentijd & Prehistorie" defaultExpanded={false}>
                <LayerItem name="Hunebedden" type="overlay" />
                <LayerItem name="FAMKE Steentijd" type="overlay" />
                <LayerItem name="Grafheuvels" type="overlay" />
                <LayerItem name="Terpen" type="overlay" />
                <LayerItem name="Essen" type="overlay" />
              </LayerGroup>

              {/* Archaeological Layers */}
              <LayerGroup title="Archeologische lagen" defaultExpanded={false}>
                <LayerItem name="AMK Monumenten" type="overlay" />
                <LayerItem name="Romeinse wegen" type="overlay" />
                <LayerItem name="Romeinse wegen (Wereld)" type="overlay" />
                <LayerItem name="Kastelen" type="overlay" />
                <LayerItem name="IKAW" type="overlay" />
                <LayerItem name="Archeo Landschappen" type="overlay" />
              </LayerGroup>

              {/* Erfgoed & Monumenten */}
              <LayerGroup title="Erfgoed & Monumenten" defaultExpanded={false}>
                <LayerItem name="Rijksmonumenten" type="overlay" />
                <LayerItem name="Werelderfgoed" type="overlay" />
              </LayerGroup>

              {/* WOII & Militair */}
              <LayerGroup title="WOII & Militair" defaultExpanded={false}>
                <LayerItem name="WWII Bunkers" type="overlay" />
                <LayerItem name="Slagvelden" type="overlay" />
                <LayerItem name="Militaire Vliegvelden" type="overlay" />
                <LayerItem name="Verdedigingslinies" type="overlay" />
                <LayerItem name="Militaire Objecten" type="overlay" />
                <LayerItem name="Inundatiegebieden" type="overlay" />
              </LayerGroup>

              {/* Paleogeografische kaarten */}
              <LayerGroup title="Paleokaarten (tijdreizen)" defaultExpanded={false}>
                <LayerItem name="Paleokaart 800 n.Chr." type="overlay" />
                <LayerItem name="Paleokaart 100 n.Chr." type="overlay" />
                <LayerItem name="Paleokaart 500 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 1500 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 2750 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 5500 v.Chr." type="overlay" />
                <LayerItem name="Paleokaart 9000 v.Chr." type="overlay" />
              </LayerGroup>

              {/* Religieus erfgoed */}
              <LayerGroup title="Religieus Erfgoed" defaultExpanded={false}>
                <LayerItem name="Religieus Erfgoed" type="overlay" />
              </LayerGroup>

              {/* Uiterwaarden Layers - renamed */}
              <LayerGroup title="Uiterwaarden (UIKAV)" defaultExpanded={false}>
                <LayerItem name="UIKAV Punten" type="overlay" />
                <LayerItem name="UIKAV Vlakken" type="overlay" />
                <LayerItem name="UIKAV Expert" type="overlay" />
                <LayerItem name="UIKAV Buffer" type="overlay" />
                <LayerItem name="UIKAV Indeling" type="overlay" />
              </LayerGroup>

              {/* Hillshade & LiDAR Layers - NL only */}
              <LayerGroup title="Hillshade & LiDAR" defaultExpanded={false}>
                <LayerItem name="AHN4 Hoogtekaart Kleur" type="overlay" />
                <LayerItem name="AHN4 Hillshade NL" type="overlay" />
                <LayerItem name="AHN4 Multi-Hillshade NL" type="overlay" />
                <LayerItem name="AHN4 Helling NL" type="overlay" />
                <LayerItem name="AHN 0.5m" type="overlay" />
                <LayerItem name="World Hillshade" type="overlay" />
              </LayerGroup>

              {/* Terrain Layers */}
              <LayerGroup title="Terrein & Bodem" defaultExpanded={false}>
                <LayerItem name="Veengebieden" type="overlay" />
                <LayerItem name="Geomorfologie" type="overlay" />
                <LayerItem name="Bodemkaart" type="overlay" />
              </LayerGroup>

              {/* Fossils - PBDB data */}
              <LayerGroup title="Fossielen (vondsten)" defaultExpanded={false}>
                <LayerItem name="Fossielen Nederland" type="overlay" />
                <LayerItem name="Fossielen België" type="overlay" />
                <LayerItem name="Fossielen Duitsland" type="overlay" />
                <LayerItem name="Fossielen Frankrijk" type="overlay" />
              </LayerGroup>

              {/* Recreation */}
              <LayerGroup title="Recreatie" defaultExpanded={false}>
                <LayerItem name="Parken" type="overlay" />
                <LayerItem name="Speeltuinen" type="overlay" />
                <LayerItem name="Musea" type="overlay" />
                <LayerItem name="Strandjes" type="overlay" />
              </LayerGroup>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

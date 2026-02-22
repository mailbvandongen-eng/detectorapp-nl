import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Layers, Search, MapPin, Compass, SlidersHorizontal, Filter, Menu, RotateCcw,
  Cloud, Ruler, Pencil, Printer, Plus, Minus, Navigation, Map,
  ChevronRight, Settings, Route, Star, Eye, EyeOff
} from 'lucide-react'
import { isCommercialMode } from '../../config/buildMode'

interface HandleidingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function HandleidingModal({ isOpen, onClose }: HandleidingModalProps) {
  const isCommercial = isCommercialMode()
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[2002]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-x-4 top-4 bottom-4 z-[2003] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-lg max-h-full pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Map size={18} className="text-white" />
                  <span className="font-medium text-white">Handleiding</span>
                </div>
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-white/20 transition-colors border-0 outline-none"
                >
                  <X size={18} className="text-white" />
                </button>
              </div>

              {/* Content - scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">

                {/* Intro */}
                <section>
                  <p className="text-sm text-gray-600">
                    DetectorApp.nl is dé gratis kaartapplicatie voor metaaldetectoristen, fossielen- en mineralenzoekers en amateur-archeologen.
                    Met <strong>70+ kaartlagen</strong>, GPS tracking, cloud sync en uitgebreid vondstenbeheer.
                  </p>
                </section>

                {/* Schermindeling */}
                <Section title="Schermindeling" icon={<Map size={16} />}>
                  <p className="text-xs text-gray-600 mb-3">
                    De knoppen zijn verdeeld over het scherm voor optimaal gebruik:
                  </p>

                  <div className="space-y-3">
                    <LocationGroup title="Linksboven" items={[
                      // Weather, Measure, Draw hidden in commercial
                      ...(!isCommercial ? [
                        { icon: <Cloud size={14} />, name: "Weerwidget", desc: "Actueel weer en buienradar" },
                        { icon: <Ruler size={14} />, name: "Meten", desc: "Afstanden meten op de kaart" },
                        { icon: <Pencil size={14} />, name: "Tekenen", desc: "Punten, lijnen en vlakken tekenen" },
                      ] : []),
                      { icon: <Printer size={14} />, name: "Exporteren", desc: "Kaart opslaan als afbeelding" },
                    ]} />

                    <LocationGroup title="Rechtsboven" items={[
                      { icon: <Menu size={14} />, name: "Menu", desc: "Instellingen en opties" },
                      { icon: <Compass size={14} />, name: "Kompas", desc: "Verschijnt bij gedraaide kaart" },
                      { icon: <Map size={14} />, name: "Kaartlagen", desc: "Lagen aan/uit zetten" },
                    ]} />

                    <LocationGroup title="Rechtsonder" items={[
                      { icon: <Navigation size={14} />, name: "GPS", desc: "Je locatie volgen" },
                      { icon: <Plus size={14} />, name: "Zoom", desc: "In- en uitzoomen" },
                    ]} />

                    <LocationGroup title="Onderkant" items={[
                      { icon: <Search size={14} />, name: "Zoekbalk", desc: "Zoek locaties en adressen" },
                      { icon: <Layers size={14} />, name: "Legenda", desc: "Actieve lagen bekijken" },
                    ]} />
                  </div>
                </Section>

                {/* Hamburger Menu */}
                <Section title="Menu opties" icon={<Menu size={16} />}>
                  <p className="text-xs text-gray-600 mb-3">
                    Het hamburger menu (rechtsboven) bevat belangrijke functies:
                  </p>

                  <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                    <MenuItem icon={<Settings size={14} />} name="Instellingen" desc="App configuratie aanpassen" />
                    <MenuItem icon={<Search size={14} />} name="Monument zoeken" desc="Zoek specifieke monumenten" />
                    <MenuItem icon={<Star size={14} />} name="Info" desc="Over de app" />
                  </div>

                  <div className="mt-3 p-3 bg-blue-50 rounded-xl">
                    <h4 className="text-xs font-semibold text-blue-800 mb-2 flex items-center gap-1">
                      <Eye size={12} />
                      Knoppen aan/uit zetten
                    </h4>
                    <p className="text-xs text-blue-700 mb-2">
                      In het menu kun je knoppen tonen of verbergen om je scherm overzichtelijk te houden:
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1 ml-4 list-disc">
                      <li><strong>Vondst registreren</strong> - Knop voor vondsten vastleggen</li>
                      {!isCommercial && <li><strong>Route opnemen</strong> - Knop voor routes vastleggen</li>}
                      <li><strong>Eigen lagen</strong> - Knop voor aangepaste puntenlagen</li>
                      {!isCommercial && <li><strong>Weer</strong> - Weerwidget linksboven</li>}
                    </ul>
                  </div>
                </Section>

                {/* GPS Functie */}
                <Section title="GPS Locatie" icon={<Navigation size={16} />}>
                  <p className="text-xs text-gray-600 mb-2">
                    De GPS-knop heeft drie standen (Google Maps stijl):
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm">
                        <Navigation size={16} className="text-gray-400" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-700">Uit</span>
                        <span className="text-xs text-gray-500 ml-1">- GPS niet actief</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center bg-blue-500 rounded-lg shadow-sm">
                        <Navigation size={16} className="text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-blue-700">Volgen</span>
                        <span className="text-xs text-blue-600 ml-1">- Kaart gecentreerd op je locatie</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                      <div className="w-8 h-8 flex items-center justify-center bg-green-500 rounded-lg shadow-sm">
                        <Navigation size={16} className="text-white" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-green-700">Rijmodus</span>
                        <span className="text-xs text-green-600 ml-1">- Kaart draait met je mee</span>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* Kaartlagen */}
                <Section title="Kaartlagen (70+)">
                  <p className="text-xs text-gray-600 mb-2">
                    De app bevat uitgebreide informatielagen:
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <LayerCategory name="Archeologie" items={["AMK per periode", "IKAW", "Archeo Onderzoeken", "Essen"]} />
                    <LayerCategory name="Prehistorie" items={["Hunebedden", "Grafheuvels", "Terpen", "Paleokaarten"]} />
                    <LayerCategory name="Romeins" items={["Romeinse wegen", "Forten", "Limesweg"]} />
                    <LayerCategory name="WOII & Militair" items={["Bunkers", "Slagvelden", "Vliegvelden", "Linies"]} />
                    <LayerCategory name="Hoogtekaarten" items={["AHN Hillshade", "Multi-Hillshade", "Hoogtekaart Kleur"]} />
                    <LayerCategory name="Bodem & Terrein" items={["Bodemkaart", "Geomorfologie", "Veengebieden"]} />
                    <LayerCategory name="Fossielen" items={["Fossiel hotspots", "Mineralen", "Goudrivieren"]} />
                    <LayerCategory name="Erfgoed" items={["Rijksmonumenten", "Kastelen", "Ruïnes", "Kerken"]} />
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Tip: Klik op de kaart om popup-informatie te zien over lagen op die locatie.
                  </p>
                </Section>

                {/* Meet en Tekentool - hidden in commercial */}
                {!isCommercial && (
                  <Section title="Meten en Tekenen" icon={<Ruler size={16} />}>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-xl">
                        <h4 className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                          <Ruler size={12} />
                          Meetgereedschap
                        </h4>
                        <p className="text-xs text-blue-700">
                          Klik om te meten, dubbelklik om te stoppen. De afstand wordt automatisch berekend in meters of kilometers.
                        </p>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-xl">
                        <h4 className="text-xs font-semibold text-orange-800 mb-1 flex items-center gap-1">
                          <Pencil size={12} />
                          Tekengereedschap
                        </h4>
                        <p className="text-xs text-orange-700 mb-2">
                          Teken punten, lijnen en vlakken op de kaart. Kies uit:
                        </p>
                        <div className="flex gap-2">
                          <span className="text-xs bg-orange-100 px-2 py-1 rounded">Punt</span>
                          <span className="text-xs bg-orange-100 px-2 py-1 rounded">Lijn</span>
                          <span className="text-xs bg-orange-100 px-2 py-1 rounded">Vlak</span>
                        </div>
                        <p className="text-xs text-orange-600 mt-2">
                          Tekeningen kunnen opgeslagen worden naar je eigen lagen.
                        </p>
                      </div>
                    </div>
                  </Section>
                )}

                {/* Presets */}
                <Section title="Presets" icon={<Star size={16} />}>
                  <p className="text-xs text-gray-600 mb-2">
                    Presets zijn vooraf ingestelde combinaties van kaartlagen. Ideaal om snel te wisselen tussen:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                    <li><strong>Detectie</strong> - AMK, IKAW, Archeo Onderzoeken, Gewaspercelen</li>
                    <li><strong>Steentijd</strong> - Hunebedden, Grafheuvels, Paleokaarten</li>
                    <li><strong>Romeins</strong> - Romeinse wegen, Forten, AMK Romeins</li>
                    <li><strong>WOII</strong> - Bunkers, Slagvelden, Vliegvelden</li>
                    <li><strong>Fossielen</strong> - Fossiel hotspots, PBDB data</li>
                    <li><strong>Mineralen</strong> - Mineralen hotspots, Goudrivieren</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    Tip: Overschrijf een preset met je eigen lagen via het diskette-icoon.
                  </p>
                </Section>

                {/* Mijn Lagen */}
                <Section title="Mijn Lagen" icon={<MapPin size={16} />}>
                  <p className="text-xs text-gray-600 mb-2">
                    Sla interessante locaties op in eigen lagen:
                  </p>
                  <ol className="text-xs text-gray-600 space-y-1 ml-4 list-decimal">
                    <li>Tik op een object op de kaart (monument, bunker, etc.)</li>
                    <li>Tik op de <strong>oranje +</strong> knop in de popup</li>
                    <li>Kies een bestaande laag of maak een nieuwe aan</li>
                  </ol>
                  <div className="mt-2 p-2 bg-orange-50 rounded-lg">
                    <p className="text-xs text-orange-700">
                      <strong>Tip:</strong> De volledige vorm (polygoon) en popup-info worden mee opgeslagen!
                    </p>
                  </div>
                </Section>

                {/* Vondsten */}
                <Section title="Vondsten Registreren" icon={<MapPin size={16} />}>
                  <p className="text-xs text-gray-600 mb-2">
                    Registreer je vondsten met locatie, foto's en details:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1 ml-4 list-disc">
                    <li><strong>Via GPS:</strong> Menu → Vondst toevoegen</li>
                    <li><strong>Long-press:</strong> Houd vinger op kaart → "Vondst toevoegen"</li>
                    <li><strong>Velden:</strong> Type, materiaal, periode, diepte, conditie, gewicht</li>
                    <li><strong>Export:</strong> Excel, CSV, GeoJSON, GPX, KML</li>
                  </ul>
                </Section>

                {/* Cloud Sync */}
                <Section title="Cloud Sync" icon={<Cloud size={16} />}>
                  <p className="text-xs text-gray-600 mb-2">
                    Synchroniseer je data tussen apparaten met Google login:
                  </p>
                  <div className="space-y-2">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700">
                        <strong>Wat wordt gesynchroniseerd:</strong><br/>
                        • Mijn Lagen (eigen punten)<br/>
                        • Vondsten registraties<br/>
                        • Preset instellingen
                      </p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700">
                        <strong>Privacy:</strong> Je data is alleen voor jou toegankelijk. GPS wordt niet opgeslagen.
                      </p>
                    </div>
                  </div>
                </Section>

                {/* Monster Filter */}
                <Section title="Monument Filter" icon={<Filter size={16} />}>
                  <p className="text-xs text-gray-600">
                    Filter AMK monumenten op tijdsperiode. Handig om specifieke periodes te onderzoeken zoals de Romeinse tijd, Middeleeuwen of Bronstijd.
                  </p>
                </Section>

                {/* Exporteren */}
                <Section title="Kaart Exporteren" icon={<Printer size={16} />}>
                  <p className="text-xs text-gray-600">
                    Exporteer je huidige kaartweergave als afbeelding (PNG/JPEG) of print direct via PDF. Je kunt een titel toevoegen en de datum wordt automatisch toegevoegd.
                  </p>
                </Section>

                {/* Tips */}
                <section className="p-4 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl">
                  <h3 className="text-sm font-semibold text-gray-800 mb-2">Tips voor gebruik</h3>
                  <ul className="text-xs text-gray-700 space-y-2">
                    <li className="flex items-start gap-2">
                      <ChevronRight size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Detectie:</strong> Combineer AMK + Gewaspercelen + IKAW voor kansrijke locaties</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Terrein:</strong> AHN Hillshade toont grafheuvels, wallen en greppels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Fossielen:</strong> Check Fossiel Hotspots + Geomorfologie voor oude zeebodems</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Historisch:</strong> TMK 1850 toont verdwenen structuren en oude wegen</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <ChevronRight size={12} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span><strong>Privacy:</strong> Alle functies werken ook zonder login (lokale opslag)</span>
                    </li>
                  </ul>
                </section>

              </div>

              {/* Footer */}
              <div className="flex items-center justify-center px-4 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                <button
                  onClick={onClose}
                  className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors border-0 outline-none"
                >
                  Sluiten
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Helper components
function Section({ title, icon, children }: { title: string, icon?: React.ReactNode, children: React.ReactNode }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
        {icon && <span className="text-blue-500">{icon}</span>}
        {title}
      </h3>
      {children}
    </section>
  )
}

function LocationGroup({ title, items }: { title: string, items: { icon: React.ReactNode, name: string, desc: string }[] }) {
  return (
    <div className="p-2 bg-gray-50 rounded-lg">
      <h4 className="text-xs font-semibold text-gray-600 mb-1.5">{title}</h4>
      <div className="space-y-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-blue-500">{item.icon}</span>
            <span className="text-xs text-gray-700 font-medium">{item.name}</span>
            <span className="text-xs text-gray-400">- {item.desc}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MenuItem({ icon, name, desc }: { icon: React.ReactNode, name: string, desc: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-gray-500">{icon}</span>
      <span className="text-xs text-gray-700 font-medium">{name}</span>
      <span className="text-xs text-gray-400">- {desc}</span>
    </div>
  )
}

function LayerCategory({ name, items }: { name: string, items: string[] }) {
  return (
    <div className="p-2 bg-gray-50 rounded-lg">
      <h4 className="text-xs font-semibold text-gray-600 mb-1">{name}</h4>
      <div className="text-xs text-gray-500 space-y-0.5">
        {items.map((item, i) => (
          <div key={i}>{item}</div>
        ))}
      </div>
    </div>
  )
}

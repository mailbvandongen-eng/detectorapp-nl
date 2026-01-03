import { useState } from 'react'
import { Info, X, FileText, BookOpen, Map, Navigation, MapPin, Layers, MousePointer, Smartphone, Bug } from 'lucide-react'

// Bug report form URL
const BUG_REPORT_URL = 'https://forms.gle/R5LCk11Bzu5XrkBj8'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store'

type TabType = 'info' | 'functies' | 'handleiding'

export function InfoButton() {
  const { infoPanelOpen, toggleInfoPanel } = useUIStore()
  const [activeTab, setActiveTab] = useState<TabType>('info')

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'info', label: 'Info', icon: <Info size={14} /> },
    { id: 'functies', label: 'Functies', icon: <FileText size={14} /> },
    { id: 'handleiding', label: 'Handleiding', icon: <BookOpen size={14} /> }
  ]

  return (
    <>
      {/* Info Button - top right corner */}
      <button
        onClick={toggleInfoPanel}
        className="fixed top-3 right-2.5 z-[800] w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-lg shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
        title="Info & Help"
      >
        <Info size={16} className="text-gray-600" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {infoPanelOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[1600] bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleInfoPanel}
            />

            {/* Modal Content */}
            <motion.div
              className="fixed inset-4 z-[1601] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-w-lg mx-auto my-auto max-h-[90vh]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <span className="font-medium">DetectorApp NL</span>
                <button
                  onClick={toggleInfoPanel}
                  className="p-1 rounded hover:bg-white/20 transition-colors border-0 outline-none"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors border-0 outline-none ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                {activeTab === 'info' && <InfoTab />}
                {activeTab === 'functies' && <FunctiesTab />}
                {activeTab === 'handleiding' && <HandleidingTab />}

                {/* Bug report & Version */}
                <section className="pt-2 border-t border-gray-200 space-y-2">
                  <a
                    href={BUG_REPORT_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Bug size={14} />
                    <span className="text-sm">Meld een bug</span>
                  </a>
                  <p className="text-xs text-gray-400 text-center">
                    DetectorApp NL v2.10.3
                  </p>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function InfoTab() {
  return (
    <>
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Over deze app</h3>
        <p className="text-gray-600">
          DetectorApp NL is dé kaartapplicatie voor metaaldetectie en archeologische verkenning in Nederland.
          Met 50+ kaartlagen, GPS tracking en vondstenbeheer.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Databronnen & Licenties</h3>
        <ul className="space-y-2 text-gray-600">
          <li>
            <strong>RCE / Cultureelerfgoed.nl</strong> (CC0/CC-BY)
            <br />
            <span className="text-xs">AMK, Rijksmonumenten, Werelderfgoed, Paleokaarten, Religieus Erfgoed</span>
          </li>
          <li>
            <strong>PDOK / Kadaster</strong> (CC0/CC-BY)
            <br />
            <span className="text-xs">Luchtfoto, AHN, IKAW, Bodemkaart, Geomorfologie</span>
          </li>
          <li>
            <strong>OpenStreetMap</strong> (ODbL)
            <br />
            <span className="text-xs">Hunebedden, Grafheuvels, Bunkers, Kastelen, Parken, etc.</span>
          </li>
          <li>
            <strong>Itiner-E</strong> (CC BY 4.0)
            <br />
            <span className="text-xs">Romeinse wegen - Brughmans, Pažout, de Soto & Bjerregaard Vahlstrup</span>
          </li>
          <li>
            <strong>CARTO</strong> (CC BY 3.0)
            <br />
            <span className="text-xs">CartoDB basiskaart</span>
          </li>
          <li>
            <strong>Map5.nl / Kadaster</strong>
            <br />
            <span className="text-xs">Historische kaarten (TMK 1850, Bonnebladen 1900)</span>
          </li>
          <li>
            <strong>Friesland Geoportal</strong>
            <br />
            <span className="text-xs">FAMKE Steentijd, Terpen</span>
          </li>
          <li>
            <strong>UIKAV / Rijkswaterstaat</strong>
            <br />
            <span className="text-xs">Uiterwaarden archeologische data</span>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Privacy</h3>
        <div className="text-gray-600 space-y-2">
          <p>
            <strong>Locatiegegevens:</strong> Alleen voor navigatie, niet opgeslagen of gedeeld.
          </p>
          <p>
            <strong>Geen tracking:</strong> Geen analytics of gebruiksstatistieken.
          </p>
          <p>
            <strong>Lokale opslag:</strong> Alle data blijft op je apparaat.
          </p>
        </div>
      </section>
    </>
  )
}

function FunctiesTab() {
  return (
    <>
      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Map size={16} className="text-blue-600" />
          Kaartlagen (50+)
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li><strong>Basis:</strong> CartoDB, OpenStreetMap, PDOK Luchtfoto</li>
          <li><strong>Historisch:</strong> TMK 1850, Bonnebladen 1900</li>
          <li><strong>Hoogtekaarten:</strong> AHN4 Hillshade, Multi-Hillshade, Hoogtekaart Kleur, AHN 0.5m</li>
          <li><strong>Archeologie:</strong> AMK Monumenten (per periode), Romeinse wegen, Kastelen, IKAW</li>
          <li><strong>Prehistorie:</strong> Hunebedden, Grafheuvels, Terpen, Paleokaarten</li>
          <li><strong>Militair:</strong> WWII Bunkers, Slagvelden, Vliegvelden, Verdedigingslinies</li>
          <li><strong>Terrein:</strong> Veengebieden, Geomorfologie, Bodemkaart</li>
          <li><strong>Percelen:</strong> Gewaspercelen, Kadastrale Grenzen</li>
          <li><strong>Provinciaal:</strong> Relictenkaart, Scheepswrakken, Verdronken Dorpen</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Navigation size={16} className="text-green-600" />
          GPS & Navigatie
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li>Live GPS tracking met nauwkeurigheidscirkel</li>
          <li>Heading-up mode (kaart draait mee)</li>
          <li>Route navigatie naar locatie</li>
          <li>Adres zoeken</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <MapPin size={16} className="text-orange-600" />
          Vondsten
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li>Toevoegen via GPS, long-press of handmatig</li>
          <li>Velden: type, materiaal, periode, diepte, conditie, gewicht, foto-link</li>
          <li>Export: Excel, CSV, GeoJSON, GPX, KML</li>
          <li>Dashboard met statistieken</li>
          <li>Lokale opslag (geen account nodig)</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Layers size={16} className="text-purple-600" />
          Presets
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li>Detectie, Steentijd, Romeins, Middeleeuwen, WOII, Analyse</li>
          <li>Eigen presets aanmaken en bewerken</li>
          <li>Snel wisselen tussen configuraties</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <MousePointer size={16} className="text-cyan-600" />
          Perceelinformatie
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li>Klik op kaart voor perceelinfo (Kadaster)</li>
          <li>Hoogtekaart per perceel (AHN4)</li>
          <li>Eigenaar lookup</li>
        </ul>
      </section>
    </>
  )
}

function HandleidingTab() {
  return (
    <>
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Eerste stappen</h3>
        <ol className="text-gray-600 space-y-2 text-xs list-decimal list-inside">
          <li>Tik op de <strong>GPS knop</strong> (rechtsonder) om je locatie te zien</li>
          <li>Kies een <strong>preset</strong> (links, laagjes-icoon) of selecteer kaartlagen handmatig</li>
          <li>Tik op de <strong>Kaartlagen knop</strong> voor alle beschikbare lagen</li>
        </ol>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Vondst toevoegen</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p><strong>Methode 1 - GPS:</strong> Tik op de oranje + knop rechtsonder. Je huidige locatie wordt automatisch ingevuld.</p>
          <p><strong>Methode 2 - Long-press:</strong> Houd je vinger lang op de kaart. Kies "Vondst toevoegen" in het menu.</p>
          <p><strong>Methode 3 - Handmatig:</strong> In het vondstenformulier, tik "Kies op kaart" en selecteer de exacte locatie.</p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Perceelinformatie</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p>Tik op een willekeurige plek op de kaart om perceelinfo te zien. Je krijgt:</p>
          <ul className="list-disc list-inside ml-2">
            <li>Kadastrale gegevens</li>
            <li>Oppervlakte</li>
            <li>Hoogtekaart van het perceel (AHN4)</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Presets gebruiken</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p><strong>Toepassen:</strong> Tik op het laagjes-icoon links en kies een preset.</p>
          <p><strong>Nieuw aanmaken:</strong> Zet de gewenste lagen aan, ga naar Instellingen → Presets → "Huidige lagen als preset opslaan".</p>
          <p><strong>Bewerken:</strong> Zet de gewenste lagen aan, ga naar Instellingen → Presets → tik op het potlood-icoon naast de preset.</p>
          <p><strong>Verwijderen:</strong> Ga naar Instellingen → Presets → tik op het prullenbak-icoon.</p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Navigatie</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p><strong>Heading-up:</strong> Tik op het kompas-icoon om de kaart mee te laten draaien met je looprichting.</p>
          <p><strong>Route:</strong> Long-press op een locatie en kies "Navigeer hierheen".</p>
          <p><strong>Zoeken:</strong> Gebruik de zoekbalk bovenaan om een adres te vinden.</p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Tips voor in het veld</h3>
        <ul className="text-gray-600 space-y-1 text-xs list-disc list-inside">
          <li>Gebruik <strong>AHN Hillshade</strong> om reliëf te zien (grafheuvels, wallen)</li>
          <li>Combineer <strong>AMK</strong> met <strong>Gewaspercelen</strong> voor detectie</li>
          <li>Check de <strong>IKAW</strong> voor archeologische verwachting</li>
          <li>Gebruik <strong>historische kaarten</strong> om oude structuren te vinden</li>
          <li>Zet <strong>GPS tracking</strong> aan om je route te volgen</li>
        </ul>
      </section>
    </>
  )
}

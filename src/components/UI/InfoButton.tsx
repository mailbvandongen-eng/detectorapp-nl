import { useState } from 'react'
import { Info, X, FileText, BookOpen, Map, Navigation, MapPin, Layers, MousePointer, Bug, ExternalLink } from 'lucide-react'

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
        className="fixed top-2 right-2 z-[800] w-11 h-11 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
        title="Info & Help"
      >
        <Info size={22} className="text-gray-600" />
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
                    DetectorApp NL v2.22.0
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
          Met 60+ kaartlagen, GPS tracking met richtingspijl en vondstenbeheer.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Databronnen & Licenties</h3>
        <ul className="space-y-2 text-gray-600">
          <li>
            <strong>RCE / Cultureelerfgoed.nl</strong> (CC0/CC-BY)
            <br />
            <span className="text-xs">AMK, Rijksmonumenten, Werelderfgoed, Paleokaarten, Religieus Erfgoed, Essen</span>
          </li>
          <li>
            <strong>PDOK / Kadaster</strong> (CC0/CC-BY)
            <br />
            <span className="text-xs">Luchtfoto, AHN, IKAW, Bodemkaart, Geomorfologie, Kadastrale Grenzen</span>
          </li>
          <li>
            <strong>OpenStreetMap</strong> (ODbL)
            <br />
            <span className="text-xs">Hunebedden, Grafheuvels, Bunkers, Kastelen, Parken, Kringloopwinkels, Musea</span>
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
            <strong>Provinciale data</strong>
            <br />
            <span className="text-xs">Relictenkaart (Gelderland), Scheepswrakken (Zuid-Holland), Verdronken Dorpen (Zeeland)</span>
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
          Kaartlagen (60+)
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li><strong>Basis:</strong> CartoDB, OpenStreetMap, PDOK Luchtfoto</li>
          <li><strong>Historisch:</strong> TMK 1850, Bonnebladen 1900</li>
          <li><strong>Hoogtekaarten:</strong> AHN4 Hillshade, Multi-Hillshade, Hoogtekaart Kleur, AHN 0.5m</li>
          <li><strong>Archeologie:</strong> AMK Monumenten (per periode), Romeinse wegen, Kastelen, IKAW</li>
          <li><strong>Prehistorie:</strong> Hunebedden, Grafheuvels, Terpen, Paleokaarten (7 periodes)</li>
          <li><strong>Militair:</strong> WWII Bunkers, Slagvelden, Vliegvelden, Verdedigingslinies</li>
          <li><strong>Terrein:</strong> Veengebieden, Geomorfologie, Bodemkaart</li>
          <li><strong>Percelen:</strong> Gewaspercelen, Kadastrale Grenzen</li>
          <li><strong>Recreatie:</strong> Parken, Musea, Kringloopwinkels, Strandjes</li>
          <li><strong>Provinciaal:</strong> Relictenkaart, Scheepswrakken, Verdronken Dorpen</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Navigation size={16} className="text-green-600" />
          GPS Tracking
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li>Live GPS tracking met nauwkeurigheidscirkel</li>
          <li>Richtingspijl draait mee met je telefoon (zoals Google Maps)</li>
          <li>Kaart handmatig draaien + kompasknop om terug te draaien naar noorden</li>
          <li>Schaalbalk onderaan (instelbaar in Instellingen)</li>
          <li>Open locatie in Google Maps (long-press → "Open in Google Maps")</li>
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
          <li>Detectie, Steentijd, Romeins, Middeleeuwen, WOII, Analyse, Fossielen</li>
          <li>Alle presets zijn aanpasbaar - klik op het diskette-icoon om huidige lagen op te slaan</li>
          <li>Eigen presets aanmaken via Instellingen</li>
          <li>Tekstgrootte per panel instelbaar via slider in header</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <MousePointer size={16} className="text-cyan-600" />
          Perceelinformatie
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li>Zet "Kadastrale Grenzen" aan en tik op een perceel</li>
          <li>Toont: kadastrale aanduiding (gemeente, sectie, nummer) + oppervlakte</li>
          <li>Link naar eigenaar opzoeken (betaalde dienst)</li>
          <li>Hoogtekaart per perceel (AHN4)</li>
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
        <h3 className="font-semibold text-gray-800 mb-2">GPS knop</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p><strong>Uit (grijs icoon):</strong> GPS tracking uit, geen locatie zichtbaar.</p>
          <p><strong>Aan (blauw icoon):</strong> GPS tracking aan, je locatie en richting worden getoond.</p>
          <p><strong>Richtingspijl:</strong> De blauwe pijl draait vloeiend mee met de richting van je telefoon.</p>
          <p><strong>Kompasknop:</strong> Verschijnt rechtsboven als de kaart gedraaid is. Tik om terug naar noorden te draaien.</p>
        </div>
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
        <h3 className="font-semibold text-gray-800 mb-2">Presets gebruiken</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p><strong>Toepassen:</strong> Tik op het laagjes-icoon links en kies een preset.</p>
          <p><strong>Snel opslaan:</strong> Zet de gewenste lagen aan en tik op het diskette-icoon naast een preset om die te overschrijven.</p>
          <p><strong>Nieuw aanmaken:</strong> Ga naar Instellingen → Presets → "Huidige lagen als preset opslaan".</p>
          <p><strong>Tekstgrootte:</strong> Gebruik de slider in de header van het Presets/Kaartlagen panel.</p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Zoeken & Navigatie</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p><strong>Zoeken:</strong> Gebruik de zoekbalk bovenaan om een adres te vinden.</p>
          <p><strong>Google Maps:</strong> Long-press op een locatie en kies "Open in Google Maps" om te navigeren.</p>
          <p><strong>Schaalbalk:</strong> Onderaan de kaart - aan/uit in Instellingen.</p>
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
          <li>Tik op objecten (bunkers, musea, etc.) voor openingstijden en info</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <ExternalLink size={16} className="text-blue-600" />
          Meer informatie
        </h3>
        <p className="text-gray-600 text-xs mb-2">
          Uitleg over grondsoorten wordt direct in de popup getoond bij Bodemkaart en Gewaspercelen.
        </p>
        <ul className="text-gray-600 space-y-2 text-xs">
          <li>
            <a href="https://legendageomorfologie.wur.nl/" target="_blank" rel="noopener" className="text-blue-600 hover:underline font-medium">
              Geomorfologie legenda (WUR)
            </a>
            <br />
            <span className="text-gray-500">Uitgebreide uitleg over landvormen</span>
          </li>
          <li>
            <a href="https://legenda-bodemkaart.bodemdata.nl/" target="_blank" rel="noopener" className="text-blue-600 hover:underline font-medium">
              Bodemkaart legenda (BRO)
            </a>
            <br />
            <span className="text-gray-500">Volledige bodemclassificatie</span>
          </li>
        </ul>
      </section>
    </>
  )
}

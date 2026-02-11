import { useState } from 'react'
import { Info, X, FileText, BookOpen, Map, Navigation, MapPin, Layers, MousePointer, Bug, ExternalLink, Cloud, Upload, FolderPlus, Mountain, Gem, Skull, Shield, Maximize2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '../../store'
import { version } from '../../../package.json'
import { HandleidingModal } from './HandleidingModal'

// Bug report form URL
const BUG_REPORT_URL = 'https://forms.gle/R5LCk11Bzu5XrkBj8'

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
              {/* Header - blue bg, white text */}
              <div className="flex items-center justify-between px-4 py-3 bg-blue-500">
                <span className="font-medium text-white">DetectorApp NL v{version}</span>
                <button
                  onClick={toggleInfoPanel}
                  className="p-1 rounded bg-blue-400/50 hover:bg-blue-400 transition-colors border-0 outline-none"
                >
                  <X size={18} className="text-white" strokeWidth={2.5} />
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
                    <span className="text-sm">Meld een bug of geef feedback</span>
                  </a>
                  <p className="text-xs text-gray-400 text-center">
                    DetectorApp NL v{version} - Gratis en zonder tracking
                  </p>
                </section>
              </div>
            </motion.div>
          </>
        )}
    </AnimatePresence>
  )
}

function InfoTab() {
  return (
    <>
      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Over deze app</h3>
        <p className="text-gray-600">
          DetectorApp NL is dé gratis kaartapplicatie voor metaaldetectie, fossielen zoeken en archeologische verkenning in Nederland.
          Met 70+ kaartlagen, GPS tracking met richtingspijl, eigen lagen, cloud sync en uitgebreid vondstenbeheer.
        </p>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Databronnen & Licenties</h3>
        <ul className="space-y-2 text-gray-600">
          <li>
            <strong>RCE / Cultureelerfgoed.nl</strong> (CC0/CC-BY)
            <br />
            <span className="text-xs">AMK Monumenten, Rijksmonumenten, Werelderfgoed, Paleokaarten, Religieus Erfgoed, Essen, Archeo Onderzoeken</span>
          </li>
          <li>
            <strong>PDOK / Kadaster</strong> (CC0/CC-BY)
            <br />
            <span className="text-xs">Luchtfoto, AHN Hoogtekaarten, IKAW, Bodemkaart, Geomorfologie, Kadastrale Grenzen, Gewaspercelen</span>
          </li>
          <li>
            <strong>OpenStreetMap</strong> (ODbL)
            <br />
            <span className="text-xs">Hunebedden, Grafheuvels, Bunkers, Kastelen, Terpen, Parken, Kringloopwinkels, Musea, Speeltuinen, Strandjes</span>
          </li>
          <li>
            <strong>Itiner-E / Wetenschappelijk</strong> (CC BY 4.0)
            <br />
            <span className="text-xs">Romeinse wegen - Brughmans, Pažout, de Soto & Bjerregaard Vahlstrup</span>
          </li>
          <li>
            <strong>Mindat.org</strong>
            <br />
            <span className="text-xs">Mineralen hotspots en vindplaatsen</span>
          </li>
          <li>
            <strong>Paleontica / Fossielen data</strong>
            <br />
            <span className="text-xs">Fossiel hotspots en vindplaatsen</span>
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
            <span className="text-xs">Uiterwaarden archeologische data, Expert advies, Bufferlagen</span>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Privacy & Opslag</h3>
        <div className="text-gray-600 space-y-2">
          <p>
            <strong>Volledig anoniem mogelijk:</strong> Je kunt deze app gebruiken zonder enige registratie of login. Al je data blijft dan 100% op je eigen apparaat.
          </p>
          <p>
            <strong>Geen tracking:</strong> Deze app verzamelt geen analytics, cookies, gebruiksstatistieken of persoonlijke gegevens. Er is geen server die je gedrag registreert.
          </p>
          <p>
            <strong>Locatiegegevens:</strong> Je GPS-positie wordt alleen gebruikt om je locatie op de kaart te tonen. Deze wordt niet opgeslagen of gedeeld met derden.
          </p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Google Login - Wat betekent het?</h3>
        <div className="text-gray-600 space-y-2">
          <p className="font-medium text-green-700">
            ✓ Google login is volledig optioneel
          </p>
          <p>
            <strong>Wat wordt gesynchroniseerd:</strong>
          </p>
          <ul className="list-disc list-inside ml-2 text-xs space-y-1">
            <li>Je eigen aangemaakte lagen (Mijn Lagen)</li>
            <li>Je vondsten registraties</li>
            <li>Je preset-instellingen</li>
          </ul>
          <p>
            <strong>Wat NIET wordt gedeeld:</strong>
          </p>
          <ul className="list-disc list-inside ml-2 text-xs space-y-1">
            <li>Je GPS-locatie wordt niet opgeslagen in de cloud</li>
            <li>Je zoekgeschiedenis wordt niet bewaard</li>
            <li>Welke kaartlagen je bekijkt wordt niet geregistreerd</li>
            <li>Niemand anders kan je data zien - alleen jij</li>
          </ul>
          <p>
            <strong>Waarom inloggen?</strong> Alleen voor synchronisatie tussen apparaten (telefoon/tablet/PC) en als backup voor je vondsten.
          </p>
          <p className="text-xs text-gray-500 italic">
            Tip: Gebruik de app gerust zonder login als je privacy belangrijker vindt dan synchronisatie. Alle functies werken ook offline.
          </p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Zonder login (anoniem)</h3>
        <div className="text-gray-600 space-y-2">
          <p className="font-medium text-blue-700">
            ✓ 95% van de functies werkt zonder login
          </p>
          <p><strong>Beschikbaar zonder login:</strong></p>
          <ul className="list-disc list-inside ml-2 text-xs space-y-1">
            <li>Alle 70+ kaartlagen bekijken</li>
            <li>GPS tracking en navigatie</li>
            <li>Vondsten registreren (lokaal opgeslagen)</li>
            <li>Eigen lagen aanmaken (lokaal opgeslagen)</li>
            <li>Export naar Excel/CSV/GeoJSON/GPX/KML</li>
            <li>Lagen importeren</li>
            <li>Alle presets en instellingen</li>
          </ul>
          <p><strong>Alleen met login:</strong></p>
          <ul className="list-disc list-inside ml-2 text-xs space-y-1">
            <li>Synchronisatie tussen apparaten</li>
            <li>Cloud backup van je vondsten</li>
          </ul>
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
          Kaartlagen (70+)
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li><strong>Basis:</strong> Esri Licht, Esri Straten, Esri Satelliet, PDOK Luchtfoto</li>
          <li><strong>Historisch:</strong> TMK 1850, Bonnebladen 1900</li>
          <li><strong>Hoogtekaarten:</strong> AHN4 Hillshade, Multi-Hillshade, Hoogtekaart Kleur, AHN 0.5m</li>
          <li><strong>Archeologie:</strong> AMK Monumenten (per periode), Archeo Onderzoeken, IKAW, Essen</li>
          <li><strong>Romeins:</strong> Romeinse wegen, Romeinse Forten met historische info, Limesweg</li>
          <li><strong>Prehistorie:</strong> Hunebedden, Grafheuvels, Terpen, Paleokaarten (7 periodes)</li>
          <li><strong>Militair:</strong> WWII Bunkers, Slagvelden, Vliegvelden, Verdedigingslinies</li>
          <li><strong>Erfgoed:</strong> Rijksmonumenten, Kastelen, Ruïnes, Religieus Erfgoed</li>
          <li><strong>Terrein:</strong> Veengebieden, Geomorfologie, Bodemkaart</li>
          <li><strong>Percelen:</strong> Gewaspercelen (met bouwplantoelichting), Kadastrale Grenzen</li>
          <li><strong>Recreatie:</strong> Parken, Musea, Kringloopwinkels, Strandjes, Wandelroutes</li>
          <li><strong>Provinciaal:</strong> Relictenkaart, Scheepswrakken, Verdronken Dorpen</li>
          <li><strong>UIKAV:</strong> Uiterwaard data, Expert advies, Vlakken, Punten, Bufferlagen</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Gem size={16} className="text-purple-600" />
          Mineralen & Fossielen
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li><strong>Mineralen hotspots:</strong> Vindplaatsen uit Mindat.org met mineralenlijst</li>
          <li><strong>Goudrivieren:</strong> Bekende locaties voor goud zoeken</li>
          <li><strong>Fossiel hotspots:</strong> Vindplaatsen met fossieltypen en periodes</li>
          <li><strong>Premium lagen:</strong> Gedetailleerde data (beschikbaar met account)</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <FolderPlus size={16} className="text-orange-600" />
          Mijn Lagen
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li><strong>Eigen lagen:</strong> Maak lagen voor vakantie, projecten, etc.</li>
          <li><strong>Toevoegen:</strong> Tik op + in popup om monument/locatie aan laag toe te voegen</li>
          <li><strong>Polygonen:</strong> Hele monumentgebieden worden opgeslagen, niet alleen een punt</li>
          <li><strong>Originele info:</strong> Popup content blijft behouden</li>
          <li><strong>Kleuren:</strong> Elke laag krijgt eigen kleur (aanpasbaar)</li>
          <li><strong>Import:</strong> Laad GeoJSON, KML of GPX bestanden</li>
          <li><strong>Export:</strong> Exporteer lagen als GeoJSON</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Cloud size={16} className="text-green-600" />
          Google Cloud Sync
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li><strong>Inloggen:</strong> Via hamburger menu rechtsboven</li>
          <li><strong>Synchronisatie:</strong> Lagen en vondsten automatisch naar cloud</li>
          <li><strong>Meerdere apparaten:</strong> Altijd toegang tot je data</li>
          <li><strong>Veilig:</strong> Alleen jij hebt toegang tot je gegevens</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Navigation size={16} className="text-green-600" />
          GPS & Navigatie
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li>Live GPS tracking met nauwkeurigheidscirkel</li>
          <li>Richtingspijl draait mee met je telefoon</li>
          <li>Kaart handmatig draaien + kompasknop naar noorden</li>
          <li>Schaalbalk onderaan (aan/uit in Instellingen)</li>
          <li>Open locatie in Google Maps vanuit popup</li>
          <li>Zoekbalk voor adressen en plaatsen</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <MapPin size={16} className="text-orange-600" />
          Vondsten
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li>Toevoegen via GPS locatie, long-press of handmatig</li>
          <li>Velden: type, materiaal, periode, diepte, conditie, gewicht</li>
          <li>Foto's toevoegen (link of upload)</li>
          <li>Export: Excel, CSV, GeoJSON, GPX, KML</li>
          <li>Dashboard met statistieken</li>
          <li>Cloud sync met Google account</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Layers size={16} className="text-purple-600" />
          Presets
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li><strong>Standaard:</strong> Detectie, Steentijd, Romeins, Middeleeuwen, WOII, Analyse, Fossielen, Mineralen</li>
          <li><strong>Aanpasbaar:</strong> Overschrijf preset met huidige lagen (diskette-icoon)</li>
          <li><strong>Eigen presets:</strong> Maak nieuwe via Instellingen</li>
          <li><strong>Tekstgrootte:</strong> Aanpasbaar per panel via slider</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <MousePointer size={16} className="text-cyan-600" />
          Perceelinformatie
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li>Kadastrale aanduiding (gemeente, sectie, nummer)</li>
          <li>Oppervlakte in m² en hectare</li>
          <li>Gewas en bouwplan met uitleg</li>
          <li>Bodemtype met beschrijving</li>
          <li>AHN hoogte in meters NAP</li>
          <li>Hoogtekaart per perceel (bergje-icoon)</li>
          <li>Link naar eigenaar opzoeken (Kadaster)</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <Shield size={16} className="text-red-600" />
          Monumenten & Erfgoed
        </h3>
        <ul className="text-gray-600 space-y-1 text-xs">
          <li><strong>AMK:</strong> Archeologische Monumenten per periode</li>
          <li><strong>Romeinse Forten:</strong> Uitgebreide historische info per fort</li>
          <li><strong>Rijksmonumenten:</strong> Met bescherming en historie</li>
          <li><strong>Verdedigingswerken:</strong> Linies, forten, schansen</li>
          <li><strong>Popup info:</strong> Directe uitleg over archeologische waarde</li>
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
          <li>Tik op de <strong>GPS knop</strong> (rechtsonder, oranje) om je locatie te zien</li>
          <li>Kies een <strong>preset</strong> (linksonder, laagjes-icoon) voor een snelle start</li>
          <li>Of open <strong>Kaartlagen</strong> om individuele lagen aan te zetten</li>
          <li>Tik op objecten op de kaart voor gedetailleerde informatie</li>
        </ol>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Hamburger Menu</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p>Rechtsboven vind je het menu met:</p>
          <ul className="list-disc list-inside ml-2 space-y-1">
            <li><strong>Google Login:</strong> Synchroniseer je data naar de cloud</li>
            <li><strong>Vondst toevoegen:</strong> Registreer een nieuwe vondst</li>
            <li><strong>Info & Handleiding:</strong> Dit scherm</li>
            <li><strong>Instellingen:</strong> Presets, export, weergave</li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">GPS & Navigatie</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p><strong>GPS knop (oranje):</strong> Aan/uit toggle voor locatie tracking.</p>
          <p><strong>Richtingspijl:</strong> Blauwe pijl toont de richting van je telefoon.</p>
          <p><strong>Kaart draaien:</strong> Met twee vingers of via kompas.</p>
          <p><strong>Kompasknop:</strong> Verschijnt rechtsboven als kaart gedraaid is. Tik om naar noorden te draaien.</p>
          <p><strong>Google Maps:</strong> Vanuit elke popup kun je direct navigeren.</p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Locaties opslaan in Mijn Lagen</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p><strong>Stap 1:</strong> Tik op een object op de kaart (monument, bunker, etc.)</p>
          <p><strong>Stap 2:</strong> Tik op de <strong>oranje +</strong> knop in de popup header</p>
          <p><strong>Stap 3:</strong> Kies een bestaande laag of maak een nieuwe aan</p>
          <p><strong>Resultaat:</strong> De locatie inclusief vorm (polygoon) en info wordt opgeslagen!</p>
          <p className="text-gray-500 italic">Tip: Maak lagen voor vakantiebestemmingen, projecten of interessante locaties.</p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Vondst registreren</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p><strong>Via GPS:</strong> Open menu → Vondst toevoegen. Je locatie wordt automatisch ingevuld.</p>
          <p><strong>Via long-press:</strong> Houd je vinger op de kaart → kies "Vondst toevoegen".</p>
          <p><strong>Handmatig:</strong> In het formulier → "Kies op kaart" voor exacte locatie.</p>
          <p><strong>Foto's:</strong> Voeg foto-links toe of upload direct.</p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Presets gebruiken</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p><strong>Toepassen:</strong> Linksonder → preset kiezen.</p>
          <p><strong>Aanpassen:</strong> Zet gewenste lagen aan → tik diskette-icoon naast preset.</p>
          <p><strong>Nieuw maken:</strong> Instellingen → Presets → "Huidige lagen opslaan".</p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Cloud Sync instellen</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p><strong>Stap 1:</strong> Open hamburger menu rechtsboven</p>
          <p><strong>Stap 2:</strong> Tik op "Inloggen met Google"</p>
          <p><strong>Stap 3:</strong> Kies je Google account</p>
          <p><strong>Klaar!</strong> Je lagen en vondsten worden automatisch gesynchroniseerd.</p>
          <p className="text-gray-500 italic">Je data is veilig en alleen voor jou toegankelijk.</p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Lagen importeren</h3>
        <div className="text-gray-600 space-y-2 text-xs">
          <p><strong>Stap 1:</strong> Ga naar Instellingen (hamburger menu)</p>
          <p><strong>Stap 2:</strong> Scroll naar "Lagen importeren"</p>
          <p><strong>Stap 3:</strong> Kies een GeoJSON, KML of GPX bestand</p>
          <p><strong>Resultaat:</strong> Nieuwe laag met je geimporteerde data!</p>
          <p className="text-gray-500 italic">Handig voor routes, waypoints of eigen datasets.</p>
        </div>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Tips voor detectie</h3>
        <ul className="text-gray-600 space-y-1 text-xs list-disc list-inside">
          <li>Gebruik <strong>AHN Hillshade</strong> om reliëf te zien (grafheuvels, wallen)</li>
          <li>Combineer <strong>AMK</strong> met <strong>Gewaspercelen</strong> voor slimme zoeklocaties</li>
          <li>Check <strong>IKAW</strong> voor archeologische verwachting</li>
          <li>Gebruik <strong>historische kaarten</strong> (TMK 1850) om oude structuren te vinden</li>
          <li>Bekijk <strong>Archeo Onderzoeken</strong> voor eerdere vondsten in het gebied</li>
          <li><strong>Bodemkaart</strong> toont of grond geschikt is (popup legt uit)</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Tips voor fossielen</h3>
        <ul className="text-gray-600 space-y-1 text-xs list-disc list-inside">
          <li>Zet <strong>Fossiel hotspots</strong> aan voor bekende vindplaatsen</li>
          <li>Bekijk <strong>Paleokaarten</strong> voor historische kustlijnen</li>
          <li>Check <strong>Geomorfologie</strong> voor oude zeebodems en rivieren</li>
          <li>Popup toont welke fossielen op elke locatie gevonden zijn</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2">Tips voor mineralen</h3>
        <ul className="text-gray-600 space-y-1 text-xs list-disc list-inside">
          <li>Zet <strong>Mineralen hotspots</strong> aan voor vindplaatsen</li>
          <li>Bekijk <strong>Goudrivieren</strong> voor goudzoekmogelijkheden</li>
          <li>Popup toont welke mineralen op elke locatie voorkomen</li>
          <li>Links naar Mindat.org voor gedetailleerde info</li>
        </ul>
      </section>

      <section>
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <ExternalLink size={16} className="text-blue-600" />
          Handige links
        </h3>
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
          <li>
            <a href="https://www.mindat.org/" target="_blank" rel="noopener" className="text-blue-600 hover:underline font-medium">
              Mindat.org - Mineralen database
            </a>
            <br />
            <span className="text-gray-500">Wereldwijde mineralen informatie</span>
          </li>
          <li>
            <a href="https://www.cultureelerfgoed.nl/" target="_blank" rel="noopener" className="text-blue-600 hover:underline font-medium">
              Rijksdienst voor Cultureel Erfgoed
            </a>
            <br />
            <span className="text-gray-500">Officiële monumenten informatie</span>
          </li>
        </ul>
      </section>
    </>
  )
}

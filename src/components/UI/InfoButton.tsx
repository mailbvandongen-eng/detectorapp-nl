import { useState } from 'react'
import { Info, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function InfoButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Info Button - top right corner */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-2.5 right-2.5 z-[800] w-8 h-8 flex items-center justify-center bg-white/80 hover:bg-white/90 rounded-lg shadow-sm border-0 outline-none transition-colors backdrop-blur-sm"
        title="Info & Attributies"
      >
        <Info size={16} className="text-blue-600" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-[1600] bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
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
                <span className="font-medium">Info & Attributies</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded hover:bg-white/20 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
                {/* About */}
                <section>
                  <h3 className="font-semibold text-gray-800 mb-2">Over deze app</h3>
                  <p className="text-gray-600">
                    Detectorapp NL is een kaartapplicatie voor metal detecting en archeologische verkenning in Nederland.
                  </p>
                </section>

                {/* Data Sources */}
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

                {/* Privacy Policy */}
                <section>
                  <h3 className="font-semibold text-gray-800 mb-2">Privacy</h3>
                  <div className="text-gray-600 space-y-2">
                    <p>
                      <strong>Locatiegegevens:</strong> Deze app gebruikt uw GPS-locatie alleen voor navigatie op de kaart. Locatiegegevens worden niet opgeslagen of gedeeld met derden.
                    </p>
                    <p>
                      <strong>Geen tracking:</strong> We verzamelen geen persoonlijke gegevens, analytics of gebruiksstatistieken.
                    </p>
                    <p>
                      <strong>Lokale opslag:</strong> Alle kaartdata wordt lokaal in de app opgeslagen. Er worden geen gegevens naar externe servers gestuurd.
                    </p>
                  </div>
                </section>

                {/* Contact */}
                <section>
                  <h3 className="font-semibold text-gray-800 mb-2">Contact</h3>
                  <p className="text-gray-600">
                    Vragen of feedback? Neem contact op via de ontwikkelaar.
                  </p>
                </section>

                {/* Version */}
                <section className="pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-400 text-center">
                    Detectorapp NL v2.3.0
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

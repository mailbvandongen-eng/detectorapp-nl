import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Layers, Search, MapPin, Compass, SlidersHorizontal, Filter, Menu, RotateCcw, BookOpen, Sparkles } from 'lucide-react'
import { useSettingsStore } from '../../store/settingsStore'
import { HandleidingModal } from './HandleidingModal'
import { version } from '../../../package.json'

// Recent changelog entries (most recent first)
const CHANGELOG = [
  { version: '2.32', changes: ['Verbeterde kaart synchronisatie', 'Import lagen met kleur/icoon selectie', 'Tekenen en meten tools hersteld'] },
  { version: '2.31', changes: ['ArcGIS basemap integratie', 'Snellere kaartweergave', 'Verbeterde GPS tracking'] },
  { version: '2.30', changes: ['Monument filter op periode', 'Route opname functie', 'Lokale vondsten opslag'] },
]

interface WelcomeModalProps {
  isOpen: boolean
  onClose: () => void
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const setHideWelcomeModal = useSettingsStore(state => state.setHideWelcomeModal)
  const [showHandleiding, setShowHandleiding] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const handleClose = () => {
    if (dontShowAgain) {
      setHideWelcomeModal(true)
    }
    onClose()
  }

  const handleShowHandleiding = () => {
    onClose() // Close welcome modal
    setShowHandleiding(true) // Open handleiding
  }

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - click to close */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[2000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Floating popup */}
          <motion.div
            className="fixed inset-x-4 top-4 bottom-4 z-[2001] flex items-center justify-center pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col w-full max-w-md max-h-full pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">Hoe werkt de app?</h2>
                <button
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors border-0 outline-none"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              {/* Content - scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Tools section */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Knoppen op de kaart</h3>
                  <p className="text-xs text-gray-500 mb-3">Aan de linker- en rechterkant vind je tools:</p>

                  <div className="space-y-2">
                    <ToolItem icon={<Layers size={16} />} title="Kaartlagen" description="Selecteer welke lagen je wilt zien" />
                    <ToolItem icon={<Search size={16} />} title="Zoeken" description="Zoek naar een adres of plaatsnaam" />
                    <ToolItem icon={<MapPin size={16} />} title="GPS Locatie" description="Volg je positie op de kaart" />
                    <ToolItem icon={<Compass size={16} />} title="Presets" description="Snel wisselen tussen kaartlagen" />
                    <ToolItem icon={<Filter size={16} />} title="Monument Filter" description="Filter monumenten op periode" />
                    <ToolItem icon={<SlidersHorizontal size={16} />} title="Transparantie" description="Pas doorzichtigheid aan" />
                    <ToolItem icon={<Menu size={16} />} title="Menu" description="Instellingen en meer" />
                    <ToolItem icon={<RotateCcw size={16} />} title="Reset" description="Kaart naar beginstand" />
                  </div>
                </section>

                {/* Kaartlagen info */}
                <section className="bg-blue-50 rounded-xl p-3">
                  <h3 className="text-sm font-semibold text-blue-800 mb-1">Kaartlagen gebruiken</h3>
                  <p className="text-xs text-blue-700">
                    Klik op een locatie om informatie te zien over monumenten en archeologische gegevens.
                  </p>
                </section>

                {/* Handleiding link */}
                <button
                  onClick={handleShowHandleiding}
                  className="w-full flex items-start gap-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors border-0 outline-none text-left"
                >
                  <BookOpen size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-0.5">Handleiding</h3>
                    <span className="text-xs text-blue-600">
                      Bekijk volledige handleiding &rarr;
                    </span>
                  </div>
                </button>

                {/* Changelog section */}
                <section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles size={16} className="text-purple-600" />
                    <h3 className="text-sm font-semibold text-purple-800">Nieuw in v{version}</h3>
                  </div>
                  <div className="space-y-2">
                    {CHANGELOG.slice(0, 2).map((entry) => (
                      <div key={entry.version}>
                        <div className="text-xs font-medium text-purple-700 mb-0.5">v{entry.version}</div>
                        <ul className="text-xs text-purple-600 space-y-0.5">
                          {entry.changes.map((change, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-purple-400 mt-0.5">•</span>
                              <span>{change}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                <label className="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs text-gray-500">Toon niet meer</span>
                </label>
                <button
                  onClick={handleClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors border-0 outline-none"
                >
                  Ok
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

      {/* Handleiding Modal - renders outside of welcome modal */}
      <HandleidingModal isOpen={showHandleiding} onClose={() => setShowHandleiding(false)} />
    </>
  )
}

function ToolItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-medium text-gray-700">{title}</span>
        <span className="text-xs text-gray-400 ml-1">- {description}</span>
      </div>
    </div>
  )
}

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { version } from '../../../package.json'

// Changelog entries (most recent first)
const CHANGELOG = [
  { version: '2.32', changes: ['Verbeterde kaart synchronisatie', 'Import lagen met kleur/icoon selectie', 'Tekenen en meten tools hersteld', 'Schaal balk gecentreerd'] },
  { version: '2.31', changes: ['ArcGIS basemap integratie', 'Snellere kaartweergave', 'Verbeterde GPS tracking'] },
  { version: '2.30', changes: ['Monument filter op periode', 'Route opname functie', 'Lokale vondsten opslag'] },
  { version: '2.29', changes: ['Presets systeem toegevoegd', 'Verbeterde layer manager', 'Bug fixes'] },
  { version: '2.28', changes: ['Weerwidget toegevoegd', 'Buienradar integratie', 'Performance verbeteringen'] },
  { version: '2.27', changes: ['Provinciale waardenkaarten', 'Relictenkaart Gelderland', 'Verdronken dorpen Zeeland'] },
  { version: '2.26', changes: ['UIKAV lagen toegevoegd', 'Fossiel hotspots', 'Goudrivieren kaart'] },
  { version: '2.25', changes: ['Paleokaarten alle periodes', 'Verbeterde hillshade', 'AHN 0.5m toegevoegd'] },
]

export function ChangelogModal() {
  const { changelogOpen, closeChangelog } = useUIStore()

  return (
    <AnimatePresence>
      {changelogOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[2000]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeChangelog}
          />

          {/* Modal */}
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
              <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-white" />
                  <span className="font-semibold text-white">Wat is nieuw</span>
                </div>
                <button
                  onClick={closeChangelog}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-colors border-0 outline-none"
                >
                  <X size={20} className="text-white" />
                </button>
              </div>

              {/* Content - scrollable */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Current version highlight */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-3 border border-purple-100">
                  <div className="text-sm font-semibold text-purple-800 mb-1">
                    Huidige versie: v{version}
                  </div>
                </div>

                {/* Changelog entries */}
                <div className="space-y-4">
                  {CHANGELOG.map((entry) => (
                    <div key={entry.version} className="border-l-2 border-blue-200 pl-3">
                      <div className="text-sm font-semibold text-blue-700 mb-1">
                        Versie {entry.version}
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {entry.changes.map((change, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-purple-400 mt-0.5">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                <button
                  onClick={closeChangelog}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors border-0 outline-none"
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

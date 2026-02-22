import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useSettingsStore } from '../../store/settingsStore'
import { isCommercialMode } from '../../config/buildMode'
import { version } from '../../../package.json'

// Changelog entries - filtered based on build mode
const getChangelog = (isCommercial: boolean) => {
  if (isCommercial) {
    // Commercial: exclude route/weather/measure/draw references
    return [
      { version: '2.32.78', changes: ['Changelog apart via menu', 'Schaalbalk fix', 'Reset naar Nederland midden'] },
      { version: '2.31', changes: ['ArcGIS basemap integratie', 'Snellere kaartweergave', 'Verbeterde GPS tracking'] },
      { version: '2.30', changes: ['Monument filter op periode', 'Lokale vondsten opslag'] },
      { version: '2.29', changes: ['Presets systeem toegevoegd', 'Verbeterde layer manager', 'Bug fixes'] },
      { version: '2.28', changes: ['Performance verbeteringen'] },
      { version: '2.27', changes: ['Provinciale waardenkaarten', 'Relictenkaart Gelderland', 'Verdronken dorpen Zeeland'] },
      { version: '2.26', changes: ['UIKAV lagen toegevoegd', 'Fossiel hotspots', 'Goudrivieren kaart'] },
      { version: '2.25', changes: ['Paleokaarten alle periodes', 'Verbeterde hillshade', 'AHN 0.5m toegevoegd'] },
    ]
  }
  // Personal: full changelog
  return [
    { version: '2.32.78', changes: ['Changelog apart via menu', 'Schaalbalk fix', 'Reset naar Nederland midden', 'Search/weather mobile fix'] },
    { version: '2.31', changes: ['ArcGIS basemap integratie', 'Snellere kaartweergave', 'Verbeterde GPS tracking'] },
    { version: '2.30', changes: ['Monument filter op periode', 'Route opname functie', 'Lokale vondsten opslag'] },
    { version: '2.29', changes: ['Presets systeem toegevoegd', 'Verbeterde layer manager', 'Bug fixes'] },
    { version: '2.28', changes: ['Weerwidget toegevoegd', 'Buienradar integratie', 'Performance verbeteringen'] },
    { version: '2.27', changes: ['Provinciale waardenkaarten', 'Relictenkaart Gelderland', 'Verdronken dorpen Zeeland'] },
    { version: '2.26', changes: ['UIKAV lagen toegevoegd', 'Fossiel hotspots', 'Goudrivieren kaart'] },
    { version: '2.25', changes: ['Paleokaarten alle periodes', 'Verbeterde hillshade', 'AHN 0.5m toegevoegd'] },
  ]
}

export function ChangelogModal() {
  const { changelogOpen, closeChangelog } = useUIStore()

  // Font scaling from settings
  const fontScale = useSettingsStore(state => state.fontScale)
  const setFontScale = useSettingsStore(state => state.setFontScale)
  const showFontSliders = useSettingsStore(state => state.showFontSliders)

  // Get changelog based on build mode
  const isCommercial = isCommercialMode()
  const CHANGELOG = getChangelog(isCommercial)

  const baseFontSize = 14 * fontScale / 100

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
              className="bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col w-full max-w-sm mx-auto my-auto max-h-[85vh] pointer-events-auto"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header - compact like PresetButtons */}
              <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-blue-500 flex-shrink-0">
                <span className="font-medium text-white" style={{ fontSize: `${baseFontSize}px` }}>Wijzigingen</span>
                {showFontSliders && (
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-blue-200">T</span>
                    <input
                      type="range"
                      min="80"
                      max="150"
                      step="10"
                      value={fontScale}
                      onChange={(e) => setFontScale(parseInt(e.target.value))}
                      className="w-16 opacity-70 hover:opacity-100 transition-opacity"
                      title={`Tekstgrootte: ${fontScale}%`}
                    />
                    <span className="text-[11px] text-blue-200">T</span>
                  </div>
                )}
                <button
                  onClick={closeChangelog}
                  className="p-1 rounded hover:bg-white/20 transition-colors border-0 outline-none"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>

              {/* Content - scrollable, em-based font sizes */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4"
                style={{ fontSize: `${baseFontSize}px` }}
              >
                {/* Current version */}
                <div className="bg-gray-100 rounded-lg p-3">
                  <span className="font-medium text-gray-700" style={{ fontSize: '0.9em' }}>
                    Huidige versie: v{version}
                  </span>
                </div>

                {/* Changelog entries */}
                <div className="space-y-3">
                  {CHANGELOG.map((entry) => (
                    <div key={entry.version} className="border-l-2 border-gray-300 pl-3">
                      <div className="font-medium text-gray-700 mb-1" style={{ fontSize: '0.9em' }}>
                        v{entry.version}
                      </div>
                      <ul className="text-gray-600 space-y-0.5" style={{ fontSize: '0.85em' }}>
                        {entry.changes.map((change, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 flex gap-3 border-t border-gray-100" style={{ fontSize: `${baseFontSize}px` }}>
                <button
                  onClick={closeChangelog}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors border-0 outline-none"
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

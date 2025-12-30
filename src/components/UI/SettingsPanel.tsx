import { useState } from 'react'
import { X, Settings, Map, Navigation, Smartphone, Layers, Plus, Trash2, MapPin, Download, LogOut, BarChart3, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, useSettingsStore, usePresetStore, useLayerStore } from '../../store'
import { useLocalVondstenStore } from '../../store/localVondstenStore'
import { clearPasswordAuth } from '../Auth/PasswordGate'
import { VondstenDashboard } from '../Vondst/VondstenDashboard'
import type { DefaultBackground } from '../../store/settingsStore'

// All overlay layer names for updating presets - must match PresetButtons.tsx and presetStore.ts
const ALL_OVERLAYS = [
  // Base layer overlays
  'Labels Overlay', 'TMK 1850', 'Bonnebladen 1900',
  // Steentijd
  'Hunebedden', 'FAMKE Steentijd', 'Grafheuvels', 'Terpen',
  // Archeologie
  'AMK Monumenten', 'AMK Romeins', 'AMK Steentijd', 'AMK Vroege ME', 'AMK Late ME', 'AMK Overig',
  'Romeinse wegen', 'Romeinse wegen (Wereld)', 'Kastelen', 'IKAW', 'Archeo Landschappen',
  // Erfgoed
  'Rijksmonumenten', 'Werelderfgoed', 'Religieus Erfgoed',
  // Militair
  'WWII Bunkers', 'Slagvelden', 'Militaire Vliegvelden',
  'Verdedigingslinies', 'Inundatiegebieden', 'Militaire Objecten',
  // Paleokaarten
  'Paleokaart 800 n.Chr.', 'Paleokaart 100 n.Chr.', 'Paleokaart 500 v.Chr.',
  'Paleokaart 1500 v.Chr.', 'Paleokaart 2750 v.Chr.', 'Paleokaart 5500 v.Chr.', 'Paleokaart 9000 v.Chr.',
  // UIKAV
  'UIKAV Punten', 'UIKAV Vlakken', 'UIKAV Expert', 'UIKAV Buffer', 'UIKAV Indeling',
  // Hoogtekaarten
  'AHN4 Hoogtekaart Kleur', 'AHN4 Hillshade NL', 'AHN4 Multi-Hillshade NL', 'AHN 0.5m', 'World Hillshade',
  // Terrein
  'Veengebieden', 'Geomorfologie', 'Bodemkaart',
  // Fossielen
  'Fossielen Nederland', 'Fossielen België', 'Fossielen Duitsland', 'Fossielen Frankrijk',
  // Recreatie
  'Parken', 'Speeltuinen', 'Musea', 'Strandjes',
  // Percelen
  'Gewaspercelen', 'Kadastrale Grenzen',
  // Provinciale Waardenkaarten - Zuid-Holland
  'Scheepswrakken', 'Woonheuvels ZH', 'Romeinse Forten', 'Windmolens', 'Erfgoedlijnen', 'Oude Kernen',
  // Provinciale Waardenkaarten - Gelderland
  'Relictenkaart Punten', 'Relictenkaart Lijnen', 'Relictenkaart Vlakken',
  // Provinciale Waardenkaarten - Zeeland
  'Verdronken Dorpen'
]

export function SettingsPanel() {
  const { settingsPanelOpen, toggleSettingsPanel, vondstDashboardOpen, toggleVondstDashboard } = useUIStore()
  const settings = useSettingsStore()
  const { presets, createPreset, deletePreset, updatePreset } = usePresetStore()
  const visibleLayers = useLayerStore(state => state.visible)
  const vondsten = useLocalVondstenStore(state => state.vondsten)
  const [newPresetName, setNewPresetName] = useState('')
  const [showNewPresetInput, setShowNewPresetInput] = useState(false)

  const handleCreatePreset = () => {
    if (newPresetName.trim()) {
      createPreset(newPresetName.trim(), 'Layers')
      setNewPresetName('')
      setShowNewPresetInput(false)
    }
  }

  const handleUpdatePreset = (id: string, name: string) => {
    // Get currently visible overlay layers
    const currentLayers = Object.entries(visibleLayers)
      .filter(([layerName, isVisible]) => isVisible && ALL_OVERLAYS.includes(layerName))
      .map(([layerName]) => layerName)

    if (currentLayers.length === 0) {
      alert('Zet eerst minimaal één kaartlaag aan voordat je de preset bijwerkt.')
      return
    }

    updatePreset(id, { layers: currentLayers })
    console.log(`✏️ Preset "${name}" bijgewerkt met ${currentLayers.length} lagen`)
  }

  return (
    <>
    <AnimatePresence>
      {settingsPanelOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[1600] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleSettingsPanel}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-4 z-[1601] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-w-sm mx-auto my-auto max-h-[85vh]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center gap-2">
                <Settings size={18} />
                <span className="font-medium">Instellingen</span>
              </div>
              <button
                onClick={toggleSettingsPanel}
                className="p-1 rounded hover:bg-white/20 transition-colors border-0 outline-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Kaart */}
              <Section title="Kaart" icon={<Map size={16} />}>
                <OptionRow label="Standaard achtergrond">
                  <select
                    value={settings.defaultBackground}
                    onChange={(e) => settings.setDefaultBackground(e.target.value as DefaultBackground)}
                    className="px-2 py-1 text-sm bg-gray-100 rounded border-0 outline-none"
                  >
                    <option value="CartoDB (licht)">Licht</option>
                    <option value="OpenStreetMap">OSM</option>
                    <option value="Luchtfoto">Luchtfoto</option>
                  </select>
                </OptionRow>
                <ToggleRow
                  label="Schaalbalk tonen"
                  checked={settings.showScaleBar}
                  onChange={settings.setShowScaleBar}
                />
              </Section>

              {/* GPS */}
              <Section title="GPS" icon={<Navigation size={16} />}>
                <ToggleRow
                  label="GPS aan bij start"
                  checked={settings.gpsAutoStart}
                  onChange={settings.setGpsAutoStart}
                />
                <ToggleRow
                  label="Kaart draait mee (heading up)"
                  checked={settings.headingUpMode}
                  onChange={settings.setHeadingUpMode}
                />
                <ToggleRow
                  label="Nauwkeurigheidscirkel"
                  checked={settings.showAccuracyCircle}
                  onChange={settings.setShowAccuracyCircle}
                />
              </Section>

              {/* Feedback */}
              <Section title="Feedback" icon={<Smartphone size={16} />}>
                <ToggleRow
                  label="Trillen bij acties"
                  checked={settings.hapticFeedback}
                  onChange={settings.setHapticFeedback}
                />
              </Section>

              {/* Vondsten */}
              <Section title="Vondsten" icon={<MapPin size={16} />}>
                <ToggleRow
                  label="Vondsten knop tonen"
                  checked={settings.showVondstButton}
                  onChange={settings.setShowVondstButton}
                />
                <p className="text-xs text-gray-500 mt-1 py-1">
                  Vondsten worden altijd lokaal op dit apparaat opgeslagen.
                </p>
                {/* Dashboard button */}
                <button
                  onClick={toggleVondstDashboard}
                  className="flex items-center gap-2 mt-2 px-2 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded transition-colors border-0 outline-none w-full"
                >
                  <BarChart3 size={14} />
                  <span>Dashboard ({vondsten.length} vondsten)</span>
                </button>
                <ExportButton />
              </Section>

              {/* Presets */}
              <Section title="Presets" icon={<Layers size={16} />}>
                <div className="space-y-2">
                  {presets.map(preset => (
                    <div key={preset.id} className="flex items-center justify-between py-1">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm text-gray-600">
                          {preset.name}
                          {preset.isBuiltIn && (
                            <span className="ml-1 text-[10px] text-gray-400">(standaard)</span>
                          )}
                        </span>
                        <span className="ml-1 text-[10px] text-gray-400">
                          ({preset.layers.length} lagen)
                        </span>
                      </div>
                      {!preset.isBuiltIn && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleUpdatePreset(preset.id, preset.name)}
                            className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors border-0 outline-none"
                            title="Bijwerken met huidige lagen"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => deletePreset(preset.id)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors border-0 outline-none"
                            title="Verwijderen"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* New preset input */}
                  {showNewPresetInput ? (
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        value={newPresetName}
                        onChange={(e) => setNewPresetName(e.target.value)}
                        placeholder="Naam nieuwe preset"
                        className="flex-1 px-2 py-1 text-sm bg-gray-100 rounded border-0 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && handleCreatePreset()}
                        autoFocus
                      />
                      <button
                        onClick={handleCreatePreset}
                        className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors border-0 outline-none"
                      >
                        Opslaan
                      </button>
                      <button
                        onClick={() => setShowNewPresetInput(false)}
                        className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors border-0 outline-none"
                      >
                        Annuleren
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewPresetInput(true)}
                      className="flex items-center gap-2 mt-2 px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors border-0 outline-none w-full"
                    >
                      <Plus size={14} />
                      <span>Huidige lagen als preset opslaan</span>
                    </button>
                  )}
                </div>
              </Section>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 space-y-2">
              <button
                onClick={clearPasswordAuth}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors border-0 outline-none"
              >
                <LogOut size={16} />
                <span>Uitloggen</span>
              </button>
              <p className="text-xs text-gray-400 text-center">
                Instellingen worden lokaal opgeslagen
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Vondsten Dashboard */}
    <VondstenDashboard
      isOpen={vondstDashboardOpen}
      onClose={toggleVondstDashboard}
    />
    </>
  )
}

// Section component
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100">
        <span className="text-blue-600">{icon}</span>
        <span className="font-medium text-gray-800 text-sm">{title}</span>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </section>
  )
}

// Option row with label and control
function OptionRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      {children}
    </div>
  )
}

// Toggle switch row
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-colors border-0 outline-none relative ${
          checked ? 'bg-blue-500' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  )
}

// Export dropdown for vondsten
function ExportButton() {
  const [showDropdown, setShowDropdown] = useState(false)
  const {
    vondsten,
    exportAsGeoJSON,
    exportAsCSV,
    exportAsExcel,
    exportAsGPX,
    exportAsKML
  } = useLocalVondstenStore()

  const exportOptions = [
    { label: 'Excel (.xlsx)', action: exportAsExcel, desc: 'Spreadsheet' },
    { label: 'CSV', action: exportAsCSV, desc: 'Comma-separated' },
    { label: 'GeoJSON', action: exportAsGeoJSON, desc: 'GIS software' },
    { label: 'GPX', action: exportAsGPX, desc: 'GPS apparaten' },
    { label: 'KML', action: exportAsKML, desc: 'Google Earth' }
  ]

  const handleExport = (action: () => void) => {
    action()
    setShowDropdown(false)
  }

  if (vondsten.length === 0) {
    return (
      <div className="flex items-center gap-2 mt-2 px-2 py-1.5 text-sm text-gray-400 bg-gray-100 rounded w-full cursor-not-allowed">
        <Download size={14} />
        <span>Geen vondsten om te exporteren</span>
      </div>
    )
  }

  return (
    <div className="relative mt-2">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center justify-between gap-2 px-2 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors border-0 outline-none w-full"
      >
        <div className="flex items-center gap-2">
          <Download size={14} />
          <span>Exporteer vondsten ({vondsten.length})</span>
        </div>
        <span className="text-xs">▼</span>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
          {exportOptions.map((option, i) => (
            <button
              key={i}
              onClick={() => handleExport(option.action)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors border-0 outline-none flex justify-between items-center"
            >
              <span className="text-gray-700">{option.label}</span>
              <span className="text-xs text-gray-400">{option.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}


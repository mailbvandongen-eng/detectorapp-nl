import { useState } from 'react'
import { X, Settings, Map, Navigation, Smartphone, Layers, Plus, Trash2, MapPin, Download, LogOut, BarChart3, Pencil, Upload, Bug, Code, User, Sliders, Route, Volume2, Car } from 'lucide-react'

// Bug report form URL
const BUG_REPORT_URL = 'https://forms.gle/R5LCk11Bzu5XrkBj8'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore, useSettingsStore, usePresetStore, useSubscriptionStore, useParkingStore } from '../../store'
import { useLocalVondstenStore } from '../../store/localVondstenStore'
import { useCustomLayerStore } from '../../store/customLayerStore'
import { useCustomPointLayerStore } from '../../store/customPointLayerStore'
import { clearPasswordAuth } from '../Auth/PasswordGate'
import { VondstenDashboard } from '../Vondst/VondstenDashboard'
import { ImportLayerModal, CustomLayerItem } from '../CustomLayers'
import { GoogleSignInButton } from '../Auth/GoogleSignInButton'
import type { DefaultBackground } from '../../store/settingsStore'

type TabType = 'algemeen' | 'lagen' | 'vondsten'

export function SettingsPanel() {
  const { settingsPanelOpen, toggleSettingsPanel, vondstDashboardOpen, toggleVondstDashboard, openLayerManagerModal } = useUIStore()
  const settings = useSettingsStore()
  const { presets, createPreset, deletePreset, updatePreset } = usePresetStore()
  const vondsten = useLocalVondstenStore(state => state.vondsten)
  const customLayers = useCustomLayerStore(state => state.layers)
  const { layers: customPointLayers, updateLayer: updateCustomPointLayer } = useCustomPointLayerStore()
  const { devMode, setDevMode, tier } = useSubscriptionStore()
  const { showParkingButton, setShowParkingButton } = useParkingStore()
  const [newPresetName, setNewPresetName] = useState('')
  const [showNewPresetInput, setShowNewPresetInput] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [renamingPresetId, setRenamingPresetId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [renamingLayerId, setRenamingLayerId] = useState<string | null>(null)
  const [renameLayerValue, setRenameLayerValue] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('algemeen')

  // Calculate font size based on fontScale setting
  const baseFontSize = 14 * settings.fontScale / 100

  const handleCreatePreset = () => {
    if (newPresetName.trim()) {
      createPreset(newPresetName.trim(), 'Layers')
      setNewPresetName('')
      setShowNewPresetInput(false)
    }
  }

  const startRenamePreset = (id: string, currentName: string) => {
    setRenamingPresetId(id)
    setRenameValue(currentName)
  }

  const handleRenamePreset = (id: string) => {
    if (renameValue.trim()) {
      updatePreset(id, { name: renameValue.trim() })
      console.log(`✏️ Preset hernoemd naar "${renameValue.trim()}"`)
    }
    setRenamingPresetId(null)
    setRenameValue('')
  }

  const cancelRename = () => {
    setRenamingPresetId(null)
    setRenameValue('')
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'algemeen', label: 'Algemeen', icon: <Sliders size={14} /> },
    { id: 'lagen', label: 'Lagen', icon: <Layers size={14} /> },
    { id: 'vondsten', label: 'Vondsten', icon: <MapPin size={14} /> }
  ]

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
            {/* Header - blue bg, white text, scales with slider */}
            <div className="flex items-center justify-between px-4 py-3 bg-blue-500" style={{ fontSize: `${baseFontSize}px` }}>
              <div className="flex items-center gap-2">
                <Settings size={18} className="text-white" />
                <span className="font-medium text-white">Instellingen</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Font size slider in header */}
                <span className="text-[10px] text-blue-200">T</span>
                <input
                  type="range"
                  min="80"
                  max="150"
                  step="10"
                  value={settings.fontScale}
                  onInput={(e) => {
                    settings.setFontScale(parseInt((e.target as HTMLInputElement).value))
                  }}
                  onChange={(e) => settings.setFontScale(parseInt(e.target.value))}
                  className="w-20 opacity-70 hover:opacity-100 transition-opacity"
                  title={`Tekstgrootte: ${settings.fontScale}%`}
                />
                <span className="text-xs text-blue-200">T</span>
                <button
                  onClick={toggleSettingsPanel}
                  className="p-1 rounded bg-blue-400/50 hover:bg-blue-400 transition-colors border-0 outline-none ml-1"
                >
                  <X size={18} className="text-white" strokeWidth={2.5} />
                </button>
              </div>
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

            {/* Content - apply font scaling directly */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ fontSize: `${baseFontSize}px` }}>
              {activeTab === 'algemeen' && (
                <>
                  {/* Account / Cloud Sync */}
                  <Section title="Account" icon={<User size={16} />}>
                    <GoogleSignInButton />
                  </Section>

                  {/* Kaart */}
                  <Section title="Kaart" icon={<Map size={16} />}>
                    <OptionRow label="Standaard achtergrond">
                      <select
                        value={settings.defaultBackground}
                        onChange={(e) => settings.setDefaultBackground(e.target.value as DefaultBackground)}
                        className="px-2 py-1 bg-gray-100 rounded border-0 outline-none"
                        style={{ fontSize: '0.9em' }}
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
                    <ToggleRow
                      label="Spraakfeedback vondsten"
                      checked={settings.voiceFeedbackEnabled}
                      onChange={settings.setVoiceFeedbackEnabled}
                    />
                    {settings.voiceFeedbackEnabled && (
                      <p className="text-gray-500 mt-1" style={{ fontSize: '0.75em' }}>
                        <Volume2 size={12} className="inline mr-1" />
                        Spreekt vondst info uit bij toevoegen
                      </p>
                    )}
                  </Section>

                  {/* Development */}
                  <Section title="Development" icon={<Code size={16} />}>
                    <ToggleRow
                      label="Dev Mode (alles ontgrendeld)"
                      checked={devMode}
                      onChange={setDevMode}
                    />
                    <p className="text-gray-500 mt-1" style={{ fontSize: '0.75em' }}>
                      Huidige tier: <span className="font-medium text-blue-600">{tier}</span>
                      {devMode && <span className="text-green-600"> (alle lagen ontgrendeld)</span>}
                    </p>
                  </Section>
                </>
              )}

              {activeTab === 'lagen' && (
                <>
                  {/* Mijn lagen (CustomPointLayers) */}
                  <Section title="Mijn lagen" icon={<Layers size={16} />} isOwn>
                    <div className="space-y-1">
                      {customPointLayers.filter(l => !l.archived).length === 0 ? (
                        <p className="text-gray-500 py-1" style={{ fontSize: '0.75em' }}>
                          Nog geen eigen lagen aangemaakt.
                        </p>
                      ) : (
                        customPointLayers.filter(l => !l.archived).map(layer => (
                          <div key={layer.id} className="flex items-center gap-2 py-1.5 px-2 hover:bg-gray-50 rounded">
                            {renamingLayerId === layer.id ? (
                              <input
                                type="text"
                                value={renameLayerValue}
                                onChange={(e) => setRenameLayerValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    if (renameLayerValue.trim()) {
                                      updateCustomPointLayer(layer.id, { name: renameLayerValue.trim() })
                                    }
                                    setRenamingLayerId(null)
                                  } else if (e.key === 'Escape') {
                                    setRenamingLayerId(null)
                                  }
                                }}
                                onBlur={() => {
                                  if (renameLayerValue.trim()) {
                                    updateCustomPointLayer(layer.id, { name: renameLayerValue.trim() })
                                  }
                                  setRenamingLayerId(null)
                                }}
                                autoFocus
                                className="flex-1 px-1.5 py-0.5 text-sm bg-orange-50 rounded outline-none focus:ring-1 focus:ring-orange-400"
                              />
                            ) : (
                              <>
                                <span className="flex-1 text-sm text-gray-700 truncate">{layer.name}</span>
                                <span className="text-xs text-gray-400">{layer.points.length} punten</span>
                                <button
                                  onClick={() => {
                                    setRenamingLayerId(layer.id)
                                    setRenameLayerValue(layer.name)
                                  }}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors border-0 outline-none bg-transparent"
                                  title="Naam bewerken"
                                >
                                  <Pencil size={12} />
                                </button>
                              </>
                            )}
                          </div>
                        ))
                      )}
                      <button
                        onClick={() => {
                          openLayerManagerModal()
                          toggleSettingsPanel()
                        }}
                        className="flex items-center gap-2 mt-2 px-2 py-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors border-0 outline-none w-full"
                        style={{ fontSize: '0.9em' }}
                      >
                        <Settings size={14} />
                        <span>Lagen beheren</span>
                      </button>
                    </div>
                  </Section>

                  {/* Lagen importeren */}
                  <Section title="Lagen importeren" icon={<Upload size={16} />}>
                    <div className="space-y-1">
                      {customLayers.length > 0 && (
                        <>
                          {customLayers.map(layer => (
                            <CustomLayerItem key={layer.id} layer={layer} />
                          ))}
                          <div className="border-t border-gray-100 my-2" />
                        </>
                      )}
                      <button
                        onClick={() => setImportModalOpen(true)}
                        className="flex items-center gap-2 px-2 py-1.5 text-cyan-600 hover:bg-cyan-50 rounded transition-colors border-0 outline-none w-full"
                        style={{ fontSize: '0.9em' }}
                      >
                        <Plus size={14} />
                        <span>Nieuwe laag importeren</span>
                      </button>
                      <p className="text-gray-400 mt-1" style={{ fontSize: '0.7em' }}>
                        GeoJSON, KML (Google My Maps), GPX
                      </p>
                    </div>
                  </Section>

                  {/* Presets */}
                  <Section title="Presets" icon={<Layers size={16} />}>
                    <div className="space-y-2">
                      {presets.map(preset => (
                        <div key={preset.id} className="flex items-center justify-between py-1">
                          {renamingPresetId === preset.id ? (
                            // Inline rename mode
                            <div className="flex-1 flex items-center gap-1">
                              <input
                                type="text"
                                value={renameValue}
                                onChange={(e) => setRenameValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleRenamePreset(preset.id)
                                  if (e.key === 'Escape') cancelRename()
                                }}
                                className="flex-1 px-2 py-0.5 bg-blue-50 rounded border border-blue-300 outline-none"
                                style={{ fontSize: '0.9em' }}
                                autoFocus
                              />
                              <button
                                onClick={() => handleRenamePreset(preset.id)}
                                className="px-2 py-0.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors border-0 outline-none"
                                style={{ fontSize: '0.7em' }}
                              >
                                OK
                              </button>
                              <button
                                onClick={cancelRename}
                                className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors border-0 outline-none"
                                style={{ fontSize: '0.7em' }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            // Normal display mode
                            <>
                              <div className="flex-1 min-w-0">
                                <span className="text-gray-600" style={{ fontSize: '0.9em' }}>
                                  {preset.name}
                                  {preset.isBuiltIn && (
                                    <span className="ml-1 text-gray-400" style={{ fontSize: '0.7em' }}>(standaard)</span>
                                  )}
                                </span>
                                <span className="ml-1 text-gray-400" style={{ fontSize: '0.7em' }}>
                                  ({preset.layers.length} lagen)
                                </span>
                              </div>
                              {!preset.isBuiltIn && (
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => startRenamePreset(preset.id, preset.name)}
                                    className="p-1 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors border-0 outline-none"
                                    title="Naam wijzigen"
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
                            </>
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
                            className="flex-1 px-2 py-1 bg-gray-100 rounded border-0 outline-none"
                            style={{ fontSize: '0.9em' }}
                            onKeyDown={(e) => e.key === 'Enter' && handleCreatePreset()}
                            autoFocus
                          />
                          <button
                            onClick={handleCreatePreset}
                            className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors border-0 outline-none"
                            style={{ fontSize: '0.75em' }}
                          >
                            Opslaan
                          </button>
                          <button
                            onClick={() => setShowNewPresetInput(false)}
                            className="px-2 py-1 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 transition-colors border-0 outline-none"
                            style={{ fontSize: '0.75em' }}
                          >
                            Annuleren
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowNewPresetInput(true)}
                          className="flex items-center gap-2 mt-2 px-2 py-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors border-0 outline-none w-full"
                          style={{ fontSize: '0.9em' }}
                        >
                          <Plus size={14} />
                          <span>Huidige lagen als preset opslaan</span>
                        </button>
                      )}
                    </div>
                  </Section>
                </>
              )}

              {activeTab === 'vondsten' && (
                <>
                  {/* Vondsten */}
                  <Section title="Vondsten" icon={<MapPin size={16} />} isOwn>
                    <ToggleRow
                      label="Vondsten knop tonen"
                      checked={settings.showVondstButton}
                      onChange={settings.setShowVondstButton}
                    />
                    <p className="text-gray-500 mt-1 py-1" style={{ fontSize: '0.75em' }}>
                      Vondsten worden altijd lokaal op dit apparaat opgeslagen.
                    </p>
                    {/* Dashboard button */}
                    <button
                      onClick={toggleVondstDashboard}
                      className="flex items-center gap-2 mt-2 px-2 py-1.5 text-orange-600 hover:bg-orange-50 rounded transition-colors border-0 outline-none w-full"
                      style={{ fontSize: '0.9em' }}
                    >
                      <BarChart3 size={14} />
                      <span>Dashboard ({vondsten.length} vondsten)</span>
                    </button>
                    <ExportButton />
                  </Section>

                  {/* Route opnemen */}
                  <Section title="Route opnemen" icon={<Route size={16} />} isOwn>
                    <ToggleRow
                      label="Route knop tonen"
                      checked={settings.showRouteRecordButton}
                      onChange={settings.setShowRouteRecordButton}
                    />
                    <p className="text-gray-500 mt-1" style={{ fontSize: '0.75em' }}>
                      Neem je route op tijdens het detecteren of wandelen. Routes worden lokaal opgeslagen en kunnen als GPX geëxporteerd worden.
                    </p>
                  </Section>

                  {/* Parkeerhulp */}
                  <Section title="Parkeerhulp" icon={<Car size={16} />}>
                    <ToggleRow
                      label="Parkeerknop tonen"
                      checked={showParkingButton}
                      onChange={setShowParkingButton}
                    />
                    <p className="text-gray-500 mt-1" style={{ fontSize: '0.75em' }}>
                      Sla op waar je auto staat en navigeer er later naar terug.
                    </p>
                  </Section>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 space-y-2" style={{ fontSize: `${baseFontSize}px` }}>
              <a
                href={BUG_REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border-0 outline-none"
                style={{ fontSize: '0.9em' }}
              >
                <Bug size={16} />
                <span>Meld een bug</span>
              </a>
              <button
                onClick={clearPasswordAuth}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border-0 outline-none"
                style={{ fontSize: '0.9em' }}
              >
                <LogOut size={16} />
                <span>Uitloggen</span>
              </button>
              <p className="text-gray-400 text-center" style={{ fontSize: '0.75em' }}>
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

    {/* Import Layer Modal */}
    <ImportLayerModal
      isOpen={importModalOpen}
      onClose={() => setImportModalOpen(false)}
    />
    </>
  )
}

// Section component - uses em-based font sizes for scaling
function Section({ title, icon, children, isOwn }: { title: string; icon: React.ReactNode; children: React.ReactNode; isOwn?: boolean }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-2 pb-1 border-b border-gray-100">
        <span className={isOwn ? 'text-orange-600' : 'text-blue-600'}>{icon}</span>
        <span className={`font-medium ${isOwn ? 'text-orange-600' : 'text-gray-800'}`} style={{ fontSize: '1em' }}>{title}</span>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </section>
  )
}

// Option row with label and control - uses em-based font sizes
function OptionRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600" style={{ fontSize: '0.9em' }}>{label}</span>
      {children}
    </div>
  )
}

// Toggle switch row - uses em-based font sizes
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600" style={{ fontSize: '0.9em' }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-5 rounded-full transition-all border-0 outline-none relative ${
          checked ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>
    </div>
  )
}

// Export dropdown for vondsten - uses em-based font sizes
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
      <div className="flex items-center gap-2 mt-2 px-2 py-1.5 text-gray-400 bg-gray-100 rounded w-full cursor-not-allowed" style={{ fontSize: '0.9em' }}>
        <Download size={14} />
        <span>Geen vondsten om te exporteren</span>
      </div>
    )
  }

  return (
    <div className="relative mt-2">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center justify-between gap-2 px-2 py-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors border-0 outline-none w-full"
        style={{ fontSize: '0.9em' }}
      >
        <div className="flex items-center gap-2">
          <Download size={14} />
          <span>Exporteer vondsten ({vondsten.length})</span>
        </div>
        <span style={{ fontSize: '0.8em' }}>▼</span>
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
          {exportOptions.map((option, i) => (
            <button
              key={i}
              onClick={() => handleExport(option.action)}
              className="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors border-0 outline-none flex justify-between items-center"
              style={{ fontSize: '0.9em' }}
            >
              <span className="text-gray-700">{option.label}</span>
              <span className="text-gray-400" style={{ fontSize: '0.8em' }}>{option.desc}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

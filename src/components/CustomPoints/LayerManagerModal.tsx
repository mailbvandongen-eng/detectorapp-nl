import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Download, Eye, EyeOff, ChevronDown, ChevronRight, Upload, Layers } from 'lucide-react'
import { useUIStore, useSettingsStore } from '../../store'
import { useCustomPointLayerStore, type CustomPointLayer } from '../../store/customPointLayerStore'

export function LayerManagerModal() {
  const { layerManagerModalOpen, closeLayerManagerModal, openCreateLayerModal } = useUIStore()
  const { layers, removeLayer, toggleVisibility, exportLayerAsGeoJSON, importLayerFromGeoJSON } = useCustomPointLayerStore()
  const settings = useSettingsStore()

  // Calculate font size based on fontScale setting
  const baseFontSize = 14 * settings.fontScale / 100

  const [expandedLayerId, setExpandedLayerId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const handleDelete = (layerId: string) => {
    if (confirmDelete === layerId) {
      removeLayer(layerId)
      setConfirmDelete(null)
    } else {
      setConfirmDelete(layerId)
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000)
    }
  }

  const handleExport = (layerId: string) => {
    exportLayerAsGeoJSON(layerId)
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const result = importLayerFromGeoJSON(text)

      if (!result.success) {
        setImportError(result.error || 'Import mislukt')
        setTimeout(() => setImportError(null), 3000)
      }
    } catch {
      setImportError('Kon bestand niet lezen')
      setTimeout(() => setImportError(null), 3000)
    }

    // Reset file input
    e.target.value = ''
  }

  const handleClose = () => {
    setExpandedLayerId(null)
    setConfirmDelete(null)
    setImportError(null)
    closeLayerManagerModal()
  }

  const handleNewLayer = () => {
    handleClose()
    openCreateLayerModal()
  }

  return (
    <AnimatePresence>
      {layerManagerModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[1700] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 z-[1701] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-w-lg mx-auto my-auto max-h-[85vh]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Header - met font slider */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <div className="flex items-center gap-2">
                <Layers size={18} />
                <span className="font-medium">Mijn Lagen beheren</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Font size slider */}
                <span className="text-[10px] opacity-70">T</span>
                <input
                  type="range"
                  min="80"
                  max="150"
                  step="10"
                  value={settings.fontScale}
                  onChange={(e) => settings.setFontScale(parseInt(e.target.value))}
                  className="header-slider w-16 opacity-70 hover:opacity-100 transition-opacity"
                  title={`Tekstgrootte: ${settings.fontScale}%`}
                />
                <span className="text-xs opacity-70">T</span>
                <button
                  onClick={handleClose}
                  className="p-1 rounded hover:bg-white/20 transition-colors border-0 outline-none ml-1"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content - met font scaling */}
            <div className="flex-1 overflow-y-auto" style={{ fontSize: `${baseFontSize}px` }}>
              {layers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="mb-4" style={{ fontSize: '1em' }}>Je hebt nog geen eigen lagen.</p>
                  <button
                    onClick={handleNewLayer}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors border-0 outline-none"
                    style={{ fontSize: '1em' }}
                  >
                    <Plus size={16} className="inline mr-2" />
                    Nieuwe laag aanmaken
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {layers.map(layer => (
                    <LayerItem
                      key={layer.id}
                      layer={layer}
                      isExpanded={expandedLayerId === layer.id}
                      onToggleExpand={() => setExpandedLayerId(expandedLayerId === layer.id ? null : layer.id)}
                      onToggleVisibility={() => toggleVisibility(layer.id)}
                      onExport={() => handleExport(layer.id)}
                      onDelete={() => handleDelete(layer.id)}
                      confirmDelete={confirmDelete === layer.id}
                    />
                  ))}
                </div>
              )}

              {/* Import error */}
              {importError && (
                <div className="mx-4 my-2 p-3 bg-red-50 text-red-700 text-sm rounded-lg">
                  {importError}
                </div>
              )}
            </div>

            {/* Footer - geen border-t */}
            <div className="p-4 flex gap-3" style={{ fontSize: `${baseFontSize}px` }}>
              {/* Import button */}
              <label className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 border-0 outline-none">
                <Upload size={16} />
                <span style={{ fontSize: '1em' }}>Importeren</span>
                <input
                  type="file"
                  accept=".geojson,.json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              {/* New layer button */}
              <button
                onClick={handleNewLayer}
                className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors border-0 outline-none flex items-center justify-center gap-2"
                style={{ fontSize: '1em' }}
              >
                <Plus size={16} />
                <span>Nieuwe laag</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Layer item component
function LayerItem({
  layer,
  isExpanded,
  onToggleExpand,
  onToggleVisibility,
  onExport,
  onDelete,
  confirmDelete
}: {
  layer: CustomPointLayer
  isExpanded: boolean
  onToggleExpand: () => void
  onToggleVisibility: () => void
  onExport: () => void
  onDelete: () => void
  confirmDelete: boolean
}) {
  return (
    <div className="bg-white">
      {/* Layer header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Expand button */}
        <button
          onClick={onToggleExpand}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors border-0 outline-none bg-transparent"
        >
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </button>

        {/* Color dot */}
        <div
          className="w-4 h-4 rounded-full flex-shrink-0"
          style={{ backgroundColor: layer.color }}
        />

        {/* Layer name and count */}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-800 truncate">{layer.name}</div>
          <div className="text-xs text-gray-500">{layer.points.length} punten</div>
        </div>

        {/* Visibility toggle */}
        <button
          onClick={onToggleVisibility}
          className={`p-2 rounded transition-colors border-0 outline-none ${
            layer.visible ? 'text-blue-500 hover:bg-blue-50' : 'text-gray-400 hover:bg-gray-100'
          }`}
          title={layer.visible ? 'Verbergen' : 'Tonen'}
        >
          {layer.visible ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors border-0 outline-none"
          title="Exporteren als GeoJSON"
        >
          <Download size={18} />
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          className={`p-2 rounded transition-colors border-0 outline-none ${
            confirmDelete
              ? 'text-white bg-red-500 hover:bg-red-600'
              : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
          }`}
          title={confirmDelete ? 'Klik nogmaals om te verwijderen' : 'Verwijderen'}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-3 pl-12 space-y-2">
              {/* Categories */}
              <div className="flex flex-wrap gap-1">
                {layer.categories.map(cat => (
                  <span
                    key={cat}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>

              {/* Points preview */}
              {layer.points.length > 0 && (
                <div className="text-xs text-gray-500 space-y-1 max-h-32 overflow-y-auto">
                  {layer.points.slice(0, 5).map(point => (
                    <div key={point.id} className="flex items-center gap-2">
                      <span className="font-medium">{point.name}</span>
                      <span className="text-gray-400">({point.category})</span>
                    </div>
                  ))}
                  {layer.points.length > 5 && (
                    <div className="text-gray-400">
                      ...en {layer.points.length - 5} meer
                    </div>
                  )}
                </div>
              )}

              {/* Created date */}
              <div className="text-xs text-gray-400">
                Aangemaakt: {new Date(layer.createdAt).toLocaleDateString('nl-NL')}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

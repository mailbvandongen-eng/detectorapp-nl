import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin } from 'lucide-react'
import { useUIStore, useSettingsStore } from '../../store'
import { useCustomPointLayerStore } from '../../store/customPointLayerStore'

export function AddPointModal() {
  const { addPointModalOpen, addPointModalLayerId, addPointModalLocation, closeAddPointModal } = useUIStore()
  const { layers, addPoint, getLayer } = useCustomPointLayerStore()
  const settings = useSettingsStore()

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [notes, setNotes] = useState('')
  const [url, setUrl] = useState('')

  const layer = addPointModalLayerId ? getLayer(addPointModalLayerId) : null

  // Calculate font size based on fontScale setting
  const baseFontSize = 14 * settings.fontScale / 100

  // Set default category when layer changes
  useEffect(() => {
    if (layer && layer.categories.length > 0 && !category) {
      setCategory(layer.categories[0])
    }
  }, [layer])

  const handleSubmit = () => {
    if (!name.trim() || !addPointModalLayerId || !addPointModalLocation) return

    addPoint(addPointModalLayerId, {
      name: name.trim(),
      category: category || 'Overig',
      notes: notes.trim(),
      url: url.trim() || undefined,
      coordinates: [addPointModalLocation.lng, addPointModalLocation.lat]
    })

    // Reset form
    setName('')
    setCategory('')
    setNotes('')
    setUrl('')
    closeAddPointModal()
  }

  const handleClose = () => {
    setName('')
    setCategory('')
    setNotes('')
    setUrl('')
    closeAddPointModal()
  }

  if (!layer) return null

  return (
    <AnimatePresence>
      {addPointModalOpen && (
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
            className="fixed inset-4 z-[1701] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-w-sm mx-auto my-auto max-h-[85vh]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Header - met font slider zoals Instellingen */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                <span className="font-medium">Punt toevoegen</span>
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

            {/* Layer info - geen border */}
            <div className="px-4 py-2 bg-gray-50">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="text-sm text-gray-600">{layer.name}</span>
              </div>
            </div>

            {/* Content - met font scaling */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ fontSize: `${baseFontSize}px` }}>
              {/* Point name */}
              <div>
                <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: '0.9em' }}>
                  Naam *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bijv. Grube Clara"
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontSize: '1em' }}
                  autoFocus
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: '0.9em' }}>
                  Categorie
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontSize: '1em' }}
                >
                  {layer.categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: '0.9em' }}>
                  Notities
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Beschrijving, tips, opmerkingen..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  style={{ fontSize: '1em' }}
                />
              </div>

              {/* URL */}
              <div>
                <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: '0.9em' }}>
                  Link (optioneel)
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontSize: '1em' }}
                />
              </div>

              {/* Location info */}
              {addPointModalLocation && (
                <div className="text-gray-400" style={{ fontSize: '0.75em' }}>
                  Locatie: {addPointModalLocation.lat.toFixed(5)}, {addPointModalLocation.lng.toFixed(5)}
                </div>
              )}
            </div>

            {/* Footer - geen border-t */}
            <div className="p-4 flex gap-3" style={{ fontSize: `${baseFontSize}px` }}>
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-0 outline-none"
                style={{ fontSize: '1em' }}
              >
                Annuleren
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors border-0 outline-none"
                style={{ fontSize: '1em' }}
              >
                Toevoegen
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

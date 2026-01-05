import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Trash2, Layers } from 'lucide-react'
import { useUIStore, useSettingsStore } from '../../store'
import { useCustomPointLayerStore, DEFAULT_CATEGORIES } from '../../store/customPointLayerStore'

export function CreateLayerModal() {
  const { createLayerModalOpen, closeCreateLayerModal } = useUIStore()
  const { addLayer } = useCustomPointLayerStore()
  const settings = useSettingsStore()

  const [name, setName] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([...DEFAULT_CATEGORIES])
  const [newCategory, setNewCategory] = useState('')

  // Calculate font size based on fontScale setting
  const baseFontSize = 14 * settings.fontScale / 100

  const handleAddCategory = () => {
    const trimmed = newCategory.trim()
    if (trimmed && !selectedCategories.includes(trimmed)) {
      setSelectedCategories([...selectedCategories, trimmed])
      setNewCategory('')
    }
  }

  const handleRemoveCategory = (cat: string) => {
    setSelectedCategories(selectedCategories.filter(c => c !== cat))
  }

  const handleToggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter(c => c !== cat))
    } else {
      setSelectedCategories([...selectedCategories, cat])
    }
  }

  const handleSubmit = () => {
    if (!name.trim()) return

    addLayer(name.trim(), selectedCategories)

    // Reset form
    setName('')
    setSelectedCategories([...DEFAULT_CATEGORIES])
    setNewCategory('')
    closeCreateLayerModal()
  }

  const handleClose = () => {
    setName('')
    setSelectedCategories([...DEFAULT_CATEGORIES])
    setNewCategory('')
    closeCreateLayerModal()
  }

  return (
    <AnimatePresence>
      {createLayerModalOpen && (
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
            {/* Header - met font slider */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center gap-2">
                <Layers size={18} />
                <span className="font-medium">Nieuwe laag</span>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ fontSize: `${baseFontSize}px` }}>
              {/* Layer name */}
              <div>
                <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: '0.9em' }}>
                  Naam van de laag
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="bijv. Vakantie Frankrijk 2026"
                  className="w-full px-3 py-2 bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ fontSize: '1em' }}
                  autoFocus
                />
              </div>

              {/* Default categories */}
              <div>
                <label className="block font-medium text-gray-700 mb-2" style={{ fontSize: '0.9em' }}>
                  Categorieën
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      onClick={() => handleToggleCategory(cat)}
                      className={`px-3 py-1 rounded-full transition-colors border-0 outline-none ${
                        selectedCategories.includes(cat)
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      style={{ fontSize: '0.9em' }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom categories */}
              {selectedCategories.filter(c => !DEFAULT_CATEGORIES.includes(c)).length > 0 && (
                <div>
                  <label className="block font-medium text-gray-700 mb-2" style={{ fontSize: '0.9em' }}>
                    Eigen categorieën
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedCategories
                      .filter(c => !DEFAULT_CATEGORIES.includes(c))
                      .map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleRemoveCategory(cat)}
                          className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500 text-white hover:bg-purple-600 transition-colors border-0 outline-none"
                          style={{ fontSize: '0.9em' }}
                        >
                          {cat}
                          <Trash2 size={12} />
                        </button>
                      ))}
                  </div>
                </div>
              )}

              {/* Add custom category */}
              <div>
                <label className="block font-medium text-gray-700 mb-1" style={{ fontSize: '0.9em' }}>
                  Eigen categorie toevoegen
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="bijv. Grot, Bron, ..."
                    className="flex-1 px-3 py-2 bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontSize: '1em' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim()}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors border-0 outline-none"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
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
                Aanmaken
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Image, Plus, Trash2, FileText, Ruler, Clock, Calendar, MapPin, Camera } from 'lucide-react'
import { useRouteRecordingStore } from '../../store/routeRecordingStore'
import type { RecordedRoute, RoutePhoto } from '../../store/routeRecordingStore'

interface RouteDetailsModalProps {
  route: RecordedRoute
  onClose: () => void
}

const formatDistance = (meters: number) => {
  if (meters < 1000) return `${Math.round(meters)} m`
  return `${(meters / 1000).toFixed(2)} km`
}

const formatDuration = (ms: number) => {
  const seconds = Math.floor(ms / 1000)
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}u ${m}m`
  return `${m} min`
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function RouteDetailsModal({ route, onClose }: RouteDetailsModalProps) {
  const { updateRouteNotes, addPhotoToRoute, removePhotoFromRoute } = useRouteRecordingStore()
  const [notes, setNotes] = useState(route.notes || '')
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'notes'>('info')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSaveNotes = () => {
    updateRouteNotes(route.id, notes)
  }

  const handleAddPhoto = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Create a blob URL for the image
    const url = URL.createObjectURL(file)

    addPhotoToRoute(route.id, {
      url,
      caption: file.name
    })

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleRemovePhoto = (photoId: string) => {
    if (confirm('Foto verwijderen?')) {
      removePhotoFromRoute(route.id, photoId)
    }
  }

  // Get fresh route data
  const currentRoute = useRouteRecordingStore(state =>
    state.savedRoutes.find(r => r.id === route.id)
  ) || route

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1700] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="relative bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-md max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-purple-500 text-white">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium truncate">{currentRoute.name}</h3>
            <p className="text-xs text-purple-200">{formatDate(currentRoute.createdAt)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-purple-400/50 hover:bg-purple-400 transition-colors border-0 outline-none ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 text-sm font-medium border-0 outline-none transition-colors ${
              activeTab === 'info'
                ? 'text-purple-600 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin size={16} className="inline mr-1" />
            Info
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-2 text-sm font-medium border-0 outline-none transition-colors ${
              activeTab === 'photos'
                ? 'text-purple-600 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Camera size={16} className="inline mr-1" />
            Foto's ({currentRoute.photos?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-2 text-sm font-medium border-0 outline-none transition-colors ${
              activeTab === 'notes'
                ? 'text-purple-600 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText size={16} className="inline mr-1" />
            Notities
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-purple-600 mb-1">
                    <Ruler size={16} />
                    <span className="text-xs text-gray-500">Afstand</span>
                  </div>
                  <p className="text-lg font-semibold">{formatDistance(currentRoute.totalDistance)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-blue-600 mb-1">
                    <Clock size={16} />
                    <span className="text-xs text-gray-500">Duur</span>
                  </div>
                  <p className="text-lg font-semibold">{formatDuration(currentRoute.totalDuration)}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-green-600 mb-1">
                  <MapPin size={16} />
                  <span className="text-xs text-gray-500">Punten</span>
                </div>
                <p className="text-lg font-semibold">{currentRoute.points.length} GPS punten</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-orange-600 mb-1">
                  <Calendar size={16} />
                  <span className="text-xs text-gray-500">Aangemaakt</span>
                </div>
                <p className="text-sm">{formatDate(currentRoute.createdAt)}</p>
              </div>
            </div>
          )}

          {activeTab === 'photos' && (
            <div className="space-y-4">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAddPhoto}
                className="hidden"
              />

              {/* Add photo button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-8 border-2 border-dashed border-purple-300 rounded-lg text-purple-500 hover:bg-purple-50 transition-colors flex flex-col items-center gap-2"
              >
                <Plus size={24} />
                <span className="text-sm">Foto toevoegen</span>
              </button>

              {/* Photos grid */}
              {currentRoute.photos && currentRoute.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {currentRoute.photos.map((photo) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || 'Route foto'}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors border-0 outline-none"
                      >
                        <Trash2 size={12} />
                      </button>
                      {photo.caption && (
                        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/50 text-white text-xs truncate">
                          {photo.caption}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-4">
                  Nog geen foto's toegevoegd
                </p>
              )}
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-4">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Voeg notities toe over deze route..."
                className="w-full h-48 p-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              />
              <button
                onClick={handleSaveNotes}
                className="w-full px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors border-0 outline-none"
              >
                Notities opslaan
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

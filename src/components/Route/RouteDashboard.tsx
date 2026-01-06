import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Route, Trash2, Download, Pencil, Eye, EyeOff, Calendar, Ruler, Clock, MapPin, Flame, Grid3x3, Crosshair, Timer, Upload, Mountain, Info, Share2 } from 'lucide-react'
import { useRouteRecordingStore, exportRouteAsGPX } from '../../store/routeRecordingStore'
import type { RecordedRoute } from '../../store/routeRecordingStore'
import { ElevationProfile } from './ElevationProfile'
import { RouteDetailsModal } from './RouteDetailsModal'

// Mini map preview using canvas
function RoutePreview({ route, size = 80 }: { route: RecordedRoute; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || route.points.length < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, size, size)

    // Calculate bounds
    const lons = route.points.map(p => p.coordinates[0])
    const lats = route.points.map(p => p.coordinates[1])
    const minLon = Math.min(...lons)
    const maxLon = Math.max(...lons)
    const minLat = Math.min(...lats)
    const maxLat = Math.max(...lats)

    // Add padding
    const padding = 8
    const width = size - padding * 2
    const height = size - padding * 2

    // Scale function
    const scaleX = (lon: number) => {
      if (maxLon === minLon) return size / 2
      return padding + ((lon - minLon) / (maxLon - minLon)) * width
    }
    const scaleY = (lat: number) => {
      if (maxLat === minLat) return size / 2
      return padding + height - ((lat - minLat) / (maxLat - minLat)) * height
    }

    // Draw route line
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.beginPath()
    route.points.forEach((point, i) => {
      const x = scaleX(point.coordinates[0])
      const y = scaleY(point.coordinates[1])
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()

    // Draw start point (green)
    const startX = scaleX(route.points[0].coordinates[0])
    const startY = scaleY(route.points[0].coordinates[1])
    ctx.fillStyle = '#22c55e'
    ctx.beginPath()
    ctx.arc(startX, startY, 4, 0, Math.PI * 2)
    ctx.fill()

    // Draw end point (red)
    const endX = scaleX(route.points[route.points.length - 1].coordinates[0])
    const endY = scaleY(route.points[route.points.length - 1].coordinates[1])
    ctx.fillStyle = '#ef4444'
    ctx.beginPath()
    ctx.arc(endX, endY, 4, 0, Math.PI * 2)
    ctx.fill()

  }, [route, size])

  if (route.points.length < 2) {
    return (
      <div
        className="bg-gray-100 rounded flex items-center justify-center text-gray-400"
        style={{ width: size, height: size }}
      >
        <MapPin size={20} />
      </div>
    )
  }

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="rounded"
    />
  )
}

// Format helpers
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
    year: 'numeric'
  })
}

interface RouteDashboardProps {
  isOpen: boolean
  onClose: () => void
  onViewRoute?: (route: RecordedRoute) => void
}

export function RouteDashboard({ isOpen, onClose, onViewRoute }: RouteDashboardProps) {
  const {
    savedRoutes,
    deleteRoute,
    renameRoute,
    clearAllRoutes,
    visibleRouteIds,
    toggleRouteVisibility: storeToggleVisibility,
    showAllRoutes,
    hideAllRoutes,
    heatmapEnabled,
    toggleHeatmap,
    gridEnabled,
    toggleGrid,
    centerGridOnCurrentLocation,
    gridSize,
    setGridSize,
    autoPauseEnabled,
    setAutoPauseEnabled,
    autoPauseSeconds,
    setAutoPauseSeconds,
    importRouteFromGPX
  } = useRouteRecordingStore()
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [showGridSettings, setShowGridSettings] = useState(false)
  const [showAutoPauseSettings, setShowAutoPauseSettings] = useState(false)
  const [elevationRoute, setElevationRoute] = useState<RecordedRoute | null>(null)
  const [detailsRoute, setDetailsRoute] = useState<RecordedRoute | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleShareRoute = async (route: RecordedRoute) => {
    const shareText = `🗺️ ${route.name}

📏 Afstand: ${formatDistance(route.totalDistance)}
⏱️ Duur: ${formatDuration(route.totalDuration)}
📍 ${route.points.length} GPS punten
📅 ${formatDate(route.createdAt)}

Opgenomen met DetectorApp NL`

    // Try Web Share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: route.name,
          text: shareText
        })
        return
      } catch (e) {
        // User cancelled or API not supported
        if ((e as Error).name !== 'AbortError') {
          console.error('Share failed:', e)
        }
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText)
      alert('Route info gekopieerd naar klembord!')
    } catch (e) {
      // Final fallback: prompt with text
      prompt('Kopieer de route info:', shareText)
    }
  }

  const handleImportGPX = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const result = importRouteFromGPX(text, file.name.replace('.gpx', ''))

      if (result.success) {
        alert(`Route geïmporteerd: ${file.name}`)
      } else {
        alert(`Import mislukt: ${result.error}`)
      }
    } catch (e) {
      alert('Fout bij lezen van bestand')
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleStartRename = (route: RecordedRoute) => {
    setRenamingId(route.id)
    setRenameValue(route.name)
  }

  const handleFinishRename = (id: string) => {
    if (renameValue.trim()) {
      renameRoute(id, renameValue.trim())
    }
    setRenamingId(null)
    setRenameValue('')
  }

  const handleDelete = (route: RecordedRoute) => {
    if (confirm(`Weet je zeker dat je "${route.name}" wilt verwijderen?`)) {
      deleteRoute(route.id)
    }
  }

  const handleClearAll = () => {
    if (savedRoutes.length === 0) return
    if (confirm(`Weet je zeker dat je alle ${savedRoutes.length} routes wilt verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
      clearAllRoutes()
    }
  }

  const toggleRouteVisibility = (routeId: string) => {
    storeToggleVisibility(routeId)
    // Also trigger the onViewRoute callback if provided
    const route = savedRoutes.find(r => r.id === routeId)
    if (route && onViewRoute) {
      onViewRoute(route)
    }
  }

  // Calculate totals
  const totalDistance = savedRoutes.reduce((sum, r) => sum + r.totalDistance, 0)
  const totalDuration = savedRoutes.reduce((sum, r) => sum + r.totalDuration, 0)

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[1600] bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-4 z-[1601] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-w-md mx-auto my-auto max-h-[85vh]"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-purple-500 text-white">
              <div className="flex items-center gap-2">
                <Route size={20} />
                <span className="font-medium">Mijn Routes</span>
                <span className="text-purple-200 text-sm">({savedRoutes.length})</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded bg-purple-400/50 hover:bg-purple-400 transition-colors border-0 outline-none"
              >
                <X size={18} />
              </button>
            </div>

            {/* Stats summary */}
            {savedRoutes.length > 0 && (
              <div className="px-4 py-2 bg-purple-50 border-b border-purple-100 flex items-center justify-between text-sm">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5 text-purple-700">
                    <Ruler size={14} />
                    <span>Totaal: {formatDistance(totalDistance)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-purple-700">
                    <Clock size={14} />
                    <span>{formatDuration(totalDuration)}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowAutoPauseSettings(!showAutoPauseSettings)}
                    className={`px-2 py-1 text-xs rounded transition-colors border-0 outline-none ${
                      autoPauseEnabled
                        ? 'bg-green-100 text-green-600'
                        : 'text-purple-600 hover:bg-purple-100'
                    }`}
                    title={autoPauseEnabled ? 'Auto-pauze uit' : 'Auto-pauze aan'}
                  >
                    <Timer size={14} />
                  </button>
                  <button
                    onClick={() => setShowGridSettings(!showGridSettings)}
                    className={`px-2 py-1 text-xs rounded transition-colors border-0 outline-none ${
                      gridEnabled
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-purple-600 hover:bg-purple-100'
                    }`}
                    title={gridEnabled ? 'Grid verbergen' : 'Grid tonen'}
                  >
                    <Grid3x3 size={14} />
                  </button>
                  <button
                    onClick={toggleHeatmap}
                    className={`px-2 py-1 text-xs rounded transition-colors border-0 outline-none ${
                      heatmapEnabled
                        ? 'bg-orange-100 text-orange-600'
                        : 'text-purple-600 hover:bg-purple-100'
                    }`}
                    title={heatmapEnabled ? 'Heatmap verbergen' : 'Heatmap tonen'}
                  >
                    <Flame size={14} />
                  </button>
                  <button
                    onClick={showAllRoutes}
                    className="px-2 py-1 text-xs text-purple-600 hover:bg-purple-100 rounded transition-colors border-0 outline-none"
                    title="Alle tonen"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={hideAllRoutes}
                    className="px-2 py-1 text-xs text-purple-600 hover:bg-purple-100 rounded transition-colors border-0 outline-none"
                    title="Alle verbergen"
                  >
                    <EyeOff size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Grid settings panel */}
            <AnimatePresence>
              {showGridSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-purple-100"
                >
                  <div className="px-4 py-3 bg-blue-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-blue-800">Grid Assistent</span>
                      <button
                        onClick={toggleGrid}
                        className={`px-3 py-1 text-xs rounded-full transition-colors border-0 outline-none ${
                          gridEnabled
                            ? 'bg-blue-500 text-white'
                            : 'bg-blue-200 text-blue-700'
                        }`}
                      >
                        {gridEnabled ? 'Aan' : 'Uit'}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={centerGridOnCurrentLocation}
                        className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors border-0 outline-none flex items-center justify-center gap-2"
                      >
                        <Crosshair size={14} />
                        Centreer op mijn locatie
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-blue-700">Celgrootte: {gridSize}m</label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={gridSize}
                        onChange={(e) => setGridSize(Number(e.target.value))}
                        className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-blue-600">
                        <span>5m</span>
                        <span>50m</span>
                      </div>
                    </div>

                    <p className="text-xs text-blue-600">
                      Gebruik het grid om systematisch een veld af te zoeken. Elk vak heeft een label (A1, B2, etc.) voor referentie.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auto-pause settings panel */}
            <AnimatePresence>
              {showAutoPauseSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-purple-100"
                >
                  <div className="px-4 py-3 bg-green-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Auto-pauze</span>
                      <button
                        onClick={() => setAutoPauseEnabled(!autoPauseEnabled)}
                        className={`px-3 py-1 text-xs rounded-full transition-colors border-0 outline-none ${
                          autoPauseEnabled
                            ? 'bg-green-500 text-white'
                            : 'bg-green-200 text-green-700'
                        }`}
                      >
                        {autoPauseEnabled ? 'Aan' : 'Uit'}
                      </button>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-green-700">
                        Pauze na: {autoPauseSeconds < 60 ? `${autoPauseSeconds}s` : `${Math.floor(autoPauseSeconds / 60)}m ${autoPauseSeconds % 60}s`}
                      </label>
                      <input
                        type="range"
                        min="30"
                        max="300"
                        step="30"
                        value={autoPauseSeconds}
                        onChange={(e) => setAutoPauseSeconds(Number(e.target.value))}
                        className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-green-600">
                        <span>30s</span>
                        <span>5min</span>
                      </div>
                    </div>

                    <p className="text-xs text-green-600">
                      De opname pauzeert automatisch als je langer dan {autoPauseSeconds < 60 ? `${autoPauseSeconds} seconden` : `${Math.floor(autoPauseSeconds / 60)} minuten`} stilstaat. Ideaal voor pauzes tijdens het detecteren.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Routes list */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {savedRoutes.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Route size={48} className="mx-auto mb-3 text-gray-300" />
                  <p className="font-medium">Nog geen routes</p>
                  <p className="text-sm mt-1">Start een opname om je eerste route vast te leggen</p>
                </div>
              ) : (
                savedRoutes.map(route => (
                  <motion.div
                    key={route.id}
                    layout
                    className="bg-gray-50 rounded-lg p-3 flex gap-3"
                  >
                    {/* Preview */}
                    <RoutePreview route={route} size={70} />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      {renamingId === route.id ? (
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleFinishRename(route.id)
                            if (e.key === 'Escape') setRenamingId(null)
                          }}
                          onBlur={() => handleFinishRename(route.id)}
                          className="w-full px-2 py-1 text-sm bg-white border border-purple-300 rounded outline-none focus:ring-2 focus:ring-purple-400"
                          autoFocus
                        />
                      ) : (
                        <h3 className="font-medium text-gray-800 truncate">{route.name}</h3>
                      )}

                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {formatDate(route.createdAt)}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Ruler size={12} />
                          {formatDistance(route.totalDistance)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {formatDuration(route.totalDuration)}
                        </span>
                        <span>{route.points.length} punten</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => toggleRouteVisibility(route.id)}
                        className={`p-1.5 rounded transition-colors border-0 outline-none ${
                          visibleRouteIds.has(route.id)
                            ? 'bg-purple-100 text-purple-600'
                            : 'text-gray-400 hover:text-purple-600 hover:bg-purple-50'
                        }`}
                        title={visibleRouteIds.has(route.id) ? 'Verbergen op kaart' : 'Tonen op kaart'}
                      >
                        {visibleRouteIds.has(route.id) ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => handleStartRename(route)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors border-0 outline-none"
                        title="Naam wijzigen"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setDetailsRoute(route)}
                        className="p-1.5 text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 rounded transition-colors border-0 outline-none"
                        title="Details & foto's"
                      >
                        <Info size={16} />
                      </button>
                      <button
                        onClick={() => setElevationRoute(route)}
                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors border-0 outline-none"
                        title="Hoogteprofiel"
                      >
                        <Mountain size={16} />
                      </button>
                      <button
                        onClick={() => handleShareRoute(route)}
                        className="p-1.5 text-gray-400 hover:text-pink-600 hover:bg-pink-50 rounded transition-colors border-0 outline-none"
                        title="Delen"
                      >
                        <Share2 size={16} />
                      </button>
                      <button
                        onClick={() => exportRouteAsGPX(route)}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors border-0 outline-none"
                        title="Exporteer als GPX"
                      >
                        <Download size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(route)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors border-0 outline-none"
                        title="Verwijderen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-gray-100 space-y-2">
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".gpx"
                onChange={handleImportGPX}
                className="hidden"
              />

              {/* Import button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-3 py-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors border-0 outline-none text-sm flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                GPX bestand importeren
              </button>

              {savedRoutes.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="w-full px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border-0 outline-none text-sm"
                >
                  Alle routes verwijderen
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

      {/* Elevation Profile Modal */}
      <AnimatePresence>
        {elevationRoute && (
          <ElevationProfile
            route={elevationRoute}
            onClose={() => setElevationRoute(null)}
          />
        )}
      </AnimatePresence>

      {/* Route Details Modal */}
      <AnimatePresence>
        {detailsRoute && (
          <RouteDetailsModal
            route={detailsRoute}
            onClose={() => setDetailsRoute(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudRain, X, Play, Pause, ZoomIn, ZoomOut, Calendar, Radio, Search, MapPin, Crosshair } from 'lucide-react'
import { useGPSStore, useWeatherStore } from '../../store'

interface RainRadarProps {
  isOpen: boolean
  onClose: () => void
}

type ViewMode = 'radar' | 'forecast'

interface SearchResult {
  name: string
  admin1?: string
  country: string
  latitude: number
  longitude: number
}

// Rain Radar Modal with animated map using RainViewer API
export function RainRadar({ isOpen, onClose }: RainRadarProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const [frameIndex, setFrameIndex] = useState(0)
  const [radarFrames, setRadarFrames] = useState<string[]>([])
  const [radarTimestamps, setRadarTimestamps] = useState<number[]>([])
  const [zoom, setZoom] = useState(7)
  const [viewMode, setViewMode] = useState<ViewMode>('radar')

  // Location search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lon: number; name: string } | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const gpsPosition = useGPSStore(state => state.position)
  const weatherData = useWeatherStore(state => state.weatherData)

  // RainViewer API for radar frames
  useEffect(() => {
    if (!isOpen || viewMode !== 'radar') return

    const fetchRadarData = async () => {
      try {
        const response = await fetch('https://api.rainviewer.com/public/weather-maps.json')
        const data = await response.json()
        if (data.radar?.past) {
          const frames: string[] = []
          const timestamps: number[] = []

          // Past frames
          data.radar.past.forEach((f: { path: string; time: number }) => {
            frames.push(`https://tilecache.rainviewer.com${f.path}/256/{z}/{x}/{y}/2/1_1.png`)
            timestamps.push(f.time * 1000)
          })

          // Nowcast frames (future)
          if (data.radar?.nowcast) {
            data.radar.nowcast.forEach((f: { path: string; time: number }) => {
              frames.push(`https://tilecache.rainviewer.com${f.path}/256/{z}/{x}/{y}/2/1_1.png`)
              timestamps.push(f.time * 1000)
            })
          }

          setRadarFrames(frames)
          setRadarTimestamps(timestamps)
        }
      } catch (error) {
        console.error('Failed to fetch radar data:', error)
      }
    }
    fetchRadarData()
  }, [isOpen, viewMode])

  // Animation loop
  useEffect(() => {
    if (!isPlaying || radarFrames.length === 0 || viewMode !== 'radar') return
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % radarFrames.length)
    }, 500)
    return () => clearInterval(interval)
  }, [isPlaying, radarFrames.length, viewMode])

  // Location search with debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true)
      try {
        const response = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=5&language=nl&format=json`
        )
        const data = await response.json()
        if (data.results) {
          setSearchResults(data.results.map((r: any) => ({
            name: r.name,
            admin1: r.admin1,
            country: r.country,
            latitude: r.latitude,
            longitude: r.longitude
          })))
        } else {
          setSearchResults([])
        }
      } catch {
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery])

  // Use selected location, GPS position, or default to center of Netherlands
  const lat = selectedLocation?.lat || gpsPosition?.lat || 52.1326
  const lng = selectedLocation?.lon || gpsPosition?.lon || 5.2913
  const locationName = selectedLocation?.name || (gpsPosition ? 'Huidige locatie' : 'Nederland')

  // Calculate tile coordinates
  const n = Math.pow(2, zoom)
  const x = Math.floor((lng + 180) / 360 * n)
  const y = Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * n)

  const getTimeLabel = () => {
    if (radarTimestamps.length === 0 || !radarTimestamps[frameIndex]) return 'Laden...'
    const frameTime = new Date(radarTimestamps[frameIndex])
    const now = Date.now()
    const diffMinutes = Math.round((radarTimestamps[frameIndex] - now) / 60000)

    if (Math.abs(diffMinutes) < 3) return 'Nu'
    if (diffMinutes < 0) return `${diffMinutes} min`
    return `+${diffMinutes} min`
  }

  // Get 48h precipitation data
  const precipitation48h = weatherData?.precipitation48h || []

  // Group by hour for cleaner display
  const hourlyPrecip = precipitation48h.reduce((acc: { time: string; precip: number }[], item, idx) => {
    if (idx % 4 === 0) { // Every hour (4 x 15min)
      const hourTotal = precipitation48h.slice(idx, idx + 4).reduce((sum, p) => sum + p.precipitation, 0)
      acc.push({ time: item.time, precip: hourTotal })
    }
    return acc
  }, [])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1800] flex items-center justify-center bg-black/50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden select-none"
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CloudRain size={20} className="text-blue-500" />
                <span className="font-semibold text-gray-800">Buienradar</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-2 rounded-full transition-colors border-0 outline-none ${showSearch ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100 bg-transparent text-gray-500'}`}
                >
                  <Search size={16} />
                </button>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors border-0 outline-none bg-transparent">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Location search */}
            <AnimatePresence>
              {showSearch && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Zoek locatie..."
                        className="w-full px-3 py-2 pl-9 bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>

                    {/* Search results */}
                    {searchResults.length > 0 && (
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        {searchResults.map((result, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setSelectedLocation({
                                lat: result.latitude,
                                lon: result.longitude,
                                name: result.name
                              })
                              setSearchQuery('')
                              setSearchResults([])
                              setShowSearch(false)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors border-0 outline-none bg-transparent text-left"
                          >
                            <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                            <div className="min-w-0">
                              <div className="text-sm font-medium text-gray-800 truncate">{result.name}</div>
                              <div className="text-[10px] text-gray-500 truncate">
                                {result.admin1 && `${result.admin1}, `}{result.country}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Current location button */}
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => {
                          setSelectedLocation(null)
                          setSearchQuery('')
                          setShowSearch(false)
                        }}
                        className="flex items-center gap-1.5 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors border-0 outline-none bg-transparent"
                      >
                        <Crosshair size={12} />
                        Huidige locatie
                      </button>
                      {selectedLocation && (
                        <span className="text-[10px] text-gray-500">
                          {locationName}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Current location indicator (when search is closed) */}
            {!showSearch && selectedLocation && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <MapPin size={12} />
                <span>{locationName}</span>
              </div>
            )}

            {/* View mode tabs */}
            <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
              <button
                onClick={() => setViewMode('radar')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-medium transition-colors border-0 outline-none ${
                  viewMode === 'radar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Radio size={14} />
                Live radar
              </button>
              <button
                onClick={() => setViewMode('forecast')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-sm font-medium transition-colors border-0 outline-none ${
                  viewMode === 'forecast' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Calendar size={14} />
                48 uur
              </button>
            </div>

            {viewMode === 'radar' ? (
              <>
                {/* Radar map */}
                <div className="relative bg-gray-200 rounded-xl overflow-hidden" style={{ aspectRatio: '1/1' }}>
                  {/* Base map (OSM) - 3x3 grid for more coverage */}
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {[-1, 0, 1].map(dy =>
                      [-1, 0, 1].map(dx => (
                        <img
                          key={`${dx}-${dy}-${zoom}`}
                          src={`https://tile.openstreetmap.org/${zoom}/${x + dx}/${y + dy}.png`}
                          alt=""
                          className="w-full h-full object-cover"
                          style={{ filter: 'saturate(0.3) brightness(1.1)' }}
                        />
                      ))
                    )}
                  </div>

                  {/* Radar overlay - 3x3 grid */}
                  {radarFrames.length > 0 && (
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {[-1, 0, 1].map(dy =>
                        [-1, 0, 1].map(dx => (
                          <img
                            key={`radar-${dx}-${dy}-${zoom}`}
                            src={radarFrames[frameIndex]?.replace('{z}', zoom.toString()).replace('{x}', (x + dx).toString()).replace('{y}', (y + dy).toString())}
                            alt=""
                            className="w-full h-full object-cover"
                            style={{ mixBlendMode: 'multiply' }}
                          />
                        ))
                      )}
                    </div>
                  )}

                  {/* Time indicator */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm font-medium">
                    {getTimeLabel()}
                  </div>

                  {/* Zoom controls */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    <button
                      onClick={() => setZoom(z => Math.min(10, z + 1))}
                      className="w-8 h-8 bg-white/90 hover:bg-white rounded-lg shadow flex items-center justify-center border-0 outline-none transition-colors"
                      disabled={zoom >= 10}
                    >
                      <ZoomIn size={16} className={zoom >= 10 ? 'text-gray-300' : 'text-gray-700'} />
                    </button>
                    <button
                      onClick={() => setZoom(z => Math.max(5, z - 1))}
                      className="w-8 h-8 bg-white/90 hover:bg-white rounded-lg shadow flex items-center justify-center border-0 outline-none transition-colors"
                      disabled={zoom <= 5}
                    >
                      <ZoomOut size={16} className={zoom <= 5 ? 'text-gray-300' : 'text-gray-700'} />
                    </button>
                  </div>

                  {/* Location marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
                  </div>
                </div>

                {/* Timeline slider */}
                <div className="space-y-2">
                  <input
                    type="range"
                    min="0"
                    max={Math.max(0, radarFrames.length - 1)}
                    value={frameIndex}
                    onChange={(e) => {
                      setIsPlaying(false)
                      setFrameIndex(parseInt(e.target.value))
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[9px] text-gray-400">
                    <span>-1 uur</span>
                    <span>Nu</span>
                    <span>+30 min</span>
                  </div>
                </div>

                {/* Play controls */}
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors border-0 outline-none"
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                    <span className="text-sm font-medium">{isPlaying ? 'Pauzeren' : 'Afspelen'}</span>
                  </button>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-2 text-[10px] text-gray-500">
                  <span>Licht</span>
                  <div className="flex h-2">
                    <div className="w-4 bg-blue-200 rounded-l" />
                    <div className="w-4 bg-blue-400" />
                    <div className="w-4 bg-blue-600" />
                    <div className="w-4 bg-purple-600" />
                    <div className="w-4 bg-red-500 rounded-r" />
                  </div>
                  <span>Zwaar</span>
                </div>
              </>
            ) : (
              /* 48-hour precipitation forecast */
              <div className="space-y-3">
                {hourlyPrecip.length > 0 ? (
                  <>
                    {/* Chart */}
                    <div className="bg-gray-50 rounded-xl p-3">
                      <div className="text-[10px] text-gray-500 mb-2">Verwachte neerslag (mm/uur)</div>

                      {/* Day labels */}
                      <div className="flex mb-1">
                        {[0, 1].map(dayOffset => {
                          const date = new Date()
                          date.setDate(date.getDate() + dayOffset)
                          const dayName = dayOffset === 0 ? 'Vandaag' : dayOffset === 1 ? 'Morgen' : date.toLocaleDateString('nl-NL', { weekday: 'short' })
                          return (
                            <div key={dayOffset} className="flex-1 text-[10px] font-medium text-gray-600">
                              {dayName}
                            </div>
                          )
                        })}
                      </div>

                      {/* Precipitation bars */}
                      <div className="relative h-24 flex items-end gap-px">
                        {hourlyPrecip.slice(0, 48).map((hour, i) => {
                          const maxPrecip = Math.max(...hourlyPrecip.map(h => h.precip), 2)
                          const height = (hour.precip / maxPrecip) * 100
                          const time = new Date(hour.time)
                          const isNewDay = time.getHours() === 0
                          const intensity = hour.precip > 4 ? 'bg-purple-500' :
                                           hour.precip > 2 ? 'bg-blue-600' :
                                           hour.precip > 1 ? 'bg-blue-500' :
                                           hour.precip > 0.5 ? 'bg-blue-400' :
                                           hour.precip > 0 ? 'bg-blue-300' : 'bg-gray-200'

                          return (
                            <div key={i} className={`flex-1 flex flex-col justify-end ${isNewDay ? 'border-l border-gray-300' : ''}`}>
                              <div
                                className={`w-full rounded-t-sm transition-all ${intensity}`}
                                style={{ height: `${Math.max(height, hour.precip > 0 ? 4 : 2)}%` }}
                                title={`${time.getHours()}:00 - ${hour.precip.toFixed(1)} mm`}
                              />
                            </div>
                          )
                        })}
                      </div>

                      {/* Time labels */}
                      <div className="flex mt-1 text-[8px] text-gray-400">
                        <span className="flex-1">0u</span>
                        <span className="flex-1 text-center">12u</span>
                        <span className="flex-1 text-center">0u</span>
                        <span className="flex-1 text-center">12u</span>
                        <span className="text-right">0u</span>
                      </div>
                    </div>

                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 rounded-lg p-2.5">
                        <div className="text-[10px] text-gray-500">Vandaag totaal</div>
                        <div className="text-lg font-bold text-blue-600">
                          {hourlyPrecip.slice(0, 24).reduce((sum, h) => sum + h.precip, 0).toFixed(1)} mm
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2.5">
                        <div className="text-[10px] text-gray-500">Morgen totaal</div>
                        <div className="text-lg font-bold text-blue-600">
                          {hourlyPrecip.slice(24, 48).reduce((sum, h) => sum + h.precip, 0).toFixed(1)} mm
                        </div>
                      </div>
                    </div>

                    {/* Rainy hours list */}
                    <div className="max-h-32 overflow-y-auto">
                      {hourlyPrecip.filter(h => h.precip > 0.1).slice(0, 8).map((hour, i) => {
                        const time = new Date(hour.time)
                        const isToday = time.getDate() === new Date().getDate()
                        return (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0">
                            <span className="text-sm text-gray-600">
                              {isToday ? 'Vandaag' : 'Morgen'} {time.getHours()}:00
                            </span>
                            <span className={`text-sm font-medium ${hour.precip > 2 ? 'text-blue-600' : 'text-gray-600'}`}>
                              {hour.precip.toFixed(1)} mm
                            </span>
                          </div>
                        )
                      })}
                      {hourlyPrecip.filter(h => h.precip > 0.1).length === 0 && (
                        <div className="text-center py-4 text-sm text-green-600">
                          Geen neerslag verwacht
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Geen voorspellingsdata beschikbaar
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

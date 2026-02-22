import { useEffect, useRef, useState, useCallback } from 'react'
import TileLayer from 'ol/layer/Tile'
import XYZ from 'ol/source/XYZ'
import { useMapStore } from '../../store/mapStore'
import { motion, AnimatePresence } from 'framer-motion'
import { CloudRain, Play, Pause, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface RadarFrame {
  path: string
  time: number
}

interface RainRadarLayerProps {
  isVisible: boolean
  onClose: () => void
}

// Color scheme 8 = Black and White (greyscale) - matches Buienradar style
// Light grey for light precipitation, dark for heavy
const RAINVIEWER_COLOR_SCHEME = 8
const RAINVIEWER_SMOOTH = 1 // 1 = smooth radar
const RAINVIEWER_SNOW = 1   // 1 = show snow

export function RainRadarLayer({ isVisible, onClose }: RainRadarLayerProps) {
  const map = useMapStore(state => state.map)

  // Keep references to all frame layers for smooth transitions
  const layersRef = useRef<Map<number, TileLayer<XYZ>>>(new Map())
  const animationRef = useRef<number | null>(null)
  const lastFrameTimeRef = useRef<number>(0)

  // Radar state
  const [frames, setFrames] = useState<RadarFrame[]>([])
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')
  const [opacity, setOpacity] = useState(70)

  // Speed in ms - slightly faster for smoother feel
  const speedMs = speed === 'slow' ? 700 : speed === 'normal' ? 400 : 200

  // Fetch radar frames from RainViewer API
  const fetchRadarData = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://api.rainviewer.com/public/weather-maps.json')
      const data = await response.json()

      const allFrames: RadarFrame[] = []

      // Past frames (last ~2 hours)
      if (data.radar?.past) {
        data.radar.past.forEach((f: { path: string; time: number }) => {
          allFrames.push({ path: f.path, time: f.time * 1000 })
        })
      }

      // Nowcast/forecast frames (next ~2 hours)
      if (data.radar?.nowcast) {
        data.radar.nowcast.forEach((f: { path: string; time: number }) => {
          allFrames.push({ path: f.path, time: f.time * 1000 })
        })
      }

      setFrames(allFrames)
      // Start at most recent past frame
      const nowIndex = data.radar?.past?.length ? data.radar.past.length - 1 : 0
      setCurrentFrameIndex(nowIndex)
    } catch (error) {
      console.error('Failed to fetch radar data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    if (isVisible) {
      fetchRadarData()
      // Refresh radar data every 5 minutes
      const refreshInterval = setInterval(fetchRadarData, 5 * 60 * 1000)
      return () => clearInterval(refreshInterval)
    }
  }, [isVisible, fetchRadarData])

  // Helper to create tile URL
  const getTileUrl = useCallback((framePath: string) => {
    return `https://tilecache.rainviewer.com${framePath}/256/{z}/{x}/{y}/${RAINVIEWER_COLOR_SCHEME}/${RAINVIEWER_SMOOTH}_${RAINVIEWER_SNOW}.png`
  }, [])

  // Preload all frame layers for smooth animation
  useEffect(() => {
    if (!map || !isVisible || frames.length === 0) return

    // Create layers for all frames (preload)
    frames.forEach((frame, index) => {
      if (!layersRef.current.has(index)) {
        const source = new XYZ({
          url: getTileUrl(frame.path),
          crossOrigin: 'anonymous'
        })

        const layer = new TileLayer({
          source,
          opacity: 0, // Start hidden
          zIndex: 1500,
          properties: {
            name: `rain-radar-frame-${index}`,
            title: 'Buienradar'
          }
        })

        layersRef.current.set(index, layer)
        map.addLayer(layer)
      }
    })

    // Show current frame
    layersRef.current.forEach((layer, index) => {
      layer.setOpacity(index === currentFrameIndex ? opacity / 100 : 0)
    })

    return () => {
      // Cleanup handled in separate effect
    }
  }, [map, isVisible, frames, getTileUrl])

  // Update visible frame (fast opacity switch for smooth animation)
  useEffect(() => {
    if (!isVisible || frames.length === 0) return

    layersRef.current.forEach((layer, index) => {
      layer.setOpacity(index === currentFrameIndex ? opacity / 100 : 0)
    })
  }, [currentFrameIndex, opacity, isVisible, frames.length])

  // Remove all layers when hidden
  useEffect(() => {
    if (!isVisible && map) {
      layersRef.current.forEach((layer) => {
        map.removeLayer(layer)
      })
      layersRef.current.clear()
    }
  }, [isVisible, map])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map) {
        layersRef.current.forEach((layer) => {
          map.removeLayer(layer)
        })
        layersRef.current.clear()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [map])

  // Smooth animation loop using requestAnimationFrame
  useEffect(() => {
    if (!isPlaying || frames.length === 0 || !isVisible) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      return
    }

    const animate = (timestamp: number) => {
      if (!lastFrameTimeRef.current) {
        lastFrameTimeRef.current = timestamp
      }

      const elapsed = timestamp - lastFrameTimeRef.current

      if (elapsed >= speedMs) {
        setCurrentFrameIndex(prev => (prev + 1) % frames.length)
        lastFrameTimeRef.current = timestamp
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
      lastFrameTimeRef.current = 0
    }
  }, [isPlaying, frames.length, speedMs, isVisible])

  // Get time label for current frame
  const getTimeLabel = useCallback(() => {
    if (frames.length === 0 || !frames[currentFrameIndex]) return '--:--'

    const frameTime = frames[currentFrameIndex].time
    const now = Date.now()
    const diffMinutes = Math.round((frameTime - now) / 60000)

    const time = new Date(frameTime)
    const timeStr = time.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })

    if (Math.abs(diffMinutes) < 3) return `${timeStr} (nu)`
    if (diffMinutes < 0) return `${timeStr} (${diffMinutes}m)`
    return `${timeStr} (+${diffMinutes}m)`
  }, [frames, currentFrameIndex])

  // Step through frames manually
  const stepFrame = (direction: 'prev' | 'next') => {
    setIsPlaying(false)
    setCurrentFrameIndex(prev => {
      if (direction === 'prev') {
        return prev > 0 ? prev - 1 : frames.length - 1
      }
      return (prev + 1) % frames.length
    })
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-4 left-2 right-2 z-[1600] bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200"
        style={{ maxWidth: '400px', margin: '0 auto' }}
      >
        {/* Compact single-row header with time and close */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <CloudRain size={14} className="text-blue-500" />
            <span className="text-xs font-medium text-gray-700">
              {isLoading ? 'Laden...' : getTimeLabel()}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors border-0 outline-none bg-transparent"
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>

        {/* Compact controls row */}
        <div className="px-3 py-2 flex items-center gap-2">
          {/* Play controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => stepFrame('prev')}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors border-0 outline-none bg-transparent"
            >
              <ChevronLeft size={14} className="text-gray-600" />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`p-1.5 rounded transition-colors border-0 outline-none ${
                isPlaying ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            </button>
            <button
              onClick={() => stepFrame('next')}
              className="p-1.5 hover:bg-gray-100 rounded transition-colors border-0 outline-none bg-transparent"
            >
              <ChevronRight size={14} className="text-gray-600" />
            </button>
          </div>

          {/* Timeline slider */}
          <div className="flex-1 flex items-center gap-1">
            <span className="text-[9px] text-gray-400 w-6">-2u</span>
            <input
              type="range"
              min="0"
              max={Math.max(0, frames.length - 1)}
              value={currentFrameIndex}
              onChange={(e) => {
                setIsPlaying(false)
                setCurrentFrameIndex(parseInt(e.target.value))
              }}
              className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <span className="text-[9px] text-gray-400 w-8 text-right">+30m</span>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-0.5 bg-gray-100 rounded p-0.5">
            {(['slow', 'normal', 'fast'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-1.5 py-0.5 text-[9px] rounded transition-colors border-0 outline-none ${
                  speed === s ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 bg-transparent'
                }`}
              >
                {s === 'slow' ? '½' : s === 'normal' ? '1' : '2'}×
              </button>
            ))}
          </div>

        </div>

        {/* Opacity slider - prominent row */}
        <div className="px-3 py-1.5 flex items-center gap-2 border-t border-gray-100">
          <span className="text-[10px] text-gray-500 w-14">Dekking</span>
          <input
            type="range"
            min="10"
            max="100"
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-[10px] text-gray-500 w-8 text-right">{opacity}%</span>
        </div>

        {/* Legend - greyscale matching color scheme 8 */}
        <div className="px-3 pb-1.5 flex items-center justify-center gap-1.5">
          <span className="text-[8px] text-gray-400">Licht</span>
          <div className="flex h-1.5 rounded overflow-hidden">
            <div className="w-3" style={{ backgroundColor: '#e0e0e0' }} />
            <div className="w-3" style={{ backgroundColor: '#b0b0b0' }} />
            <div className="w-3" style={{ backgroundColor: '#808080' }} />
            <div className="w-3" style={{ backgroundColor: '#505050' }} />
            <div className="w-3" style={{ backgroundColor: '#202020' }} />
          </div>
          <span className="text-[8px] text-gray-400">Zwaar</span>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { X, Mountain, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { RecordedRoute } from '../../store/routeRecordingStore'

interface ElevationProfileProps {
  route: RecordedRoute
  onClose: () => void
}

// Simulate elevation data based on route distance
// In a real implementation, this would fetch from AHN or another elevation API
function generateSimulatedElevation(route: RecordedRoute): { distance: number; elevation: number }[] {
  const data: { distance: number; elevation: number }[] = []
  let cumulativeDistance = 0

  // Generate simulated elevation based on position
  // This creates a realistic-looking profile without actual elevation data
  route.points.forEach((point, index) => {
    if (index > 0) {
      const prev = route.points[index - 1]
      const R = 6371000
      const dLat = (point.coordinates[1] - prev.coordinates[1]) * Math.PI / 180
      const dLon = (point.coordinates[0] - prev.coordinates[0]) * Math.PI / 180
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(prev.coordinates[1] * Math.PI / 180) *
                Math.cos(point.coordinates[1] * Math.PI / 180) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      cumulativeDistance += R * c
    }

    // Generate simulated elevation (typically 0-10m for Dutch terrain)
    // Using a combination of sine waves for realistic variation
    const baseElevation = 5
    const variation = Math.sin(cumulativeDistance / 50) * 2 +
                     Math.sin(cumulativeDistance / 120) * 1.5 +
                     Math.sin(cumulativeDistance / 30 + point.coordinates[0] * 1000) * 0.5

    data.push({
      distance: cumulativeDistance,
      elevation: Math.max(0, baseElevation + variation)
    })
  })

  return data
}

export function ElevationProfile({ route, onClose }: ElevationProfileProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [elevationData, setElevationData] = useState<{ distance: number; elevation: number }[]>([])
  const [stats, setStats] = useState({ min: 0, max: 0, gain: 0, loss: 0 })

  useEffect(() => {
    // Generate or fetch elevation data
    const data = generateSimulatedElevation(route)
    setElevationData(data)

    // Calculate stats
    if (data.length > 0) {
      const elevations = data.map(d => d.elevation)
      const min = Math.min(...elevations)
      const max = Math.max(...elevations)

      let gain = 0
      let loss = 0
      for (let i = 1; i < data.length; i++) {
        const diff = data[i].elevation - data[i - 1].elevation
        if (diff > 0) gain += diff
        else loss += Math.abs(diff)
      }

      setStats({ min, max, gain, loss })
    }
  }, [route])

  // Draw profile on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || elevationData.length < 2) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height
    const padding = { top: 20, right: 20, bottom: 30, left: 40 }

    // Clear canvas
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, width, height)

    // Get data bounds
    const maxDist = Math.max(...elevationData.map(d => d.distance))
    const minElev = Math.min(...elevationData.map(d => d.elevation)) - 1
    const maxElev = Math.max(...elevationData.map(d => d.elevation)) + 1

    // Scale functions
    const scaleX = (dist: number) =>
      padding.left + (dist / maxDist) * (width - padding.left - padding.right)
    const scaleY = (elev: number) =>
      height - padding.bottom - ((elev - minElev) / (maxElev - minElev)) * (height - padding.top - padding.bottom)

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1

    // Horizontal grid
    const elevSteps = 5
    for (let i = 0; i <= elevSteps; i++) {
      const elev = minElev + (maxElev - minElev) * (i / elevSteps)
      const y = scaleY(elev)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()

      // Label
      ctx.fillStyle = '#9ca3af'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(`${elev.toFixed(1)}m`, padding.left - 5, y + 3)
    }

    // Distance labels
    const distSteps = 5
    for (let i = 0; i <= distSteps; i++) {
      const dist = (maxDist / distSteps) * i
      const x = scaleX(dist)

      ctx.fillStyle = '#9ca3af'
      ctx.font = '10px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(1)}km`, x, height - 10)
    }

    // Draw filled area
    ctx.beginPath()
    ctx.moveTo(scaleX(elevationData[0].distance), height - padding.bottom)
    elevationData.forEach(d => {
      ctx.lineTo(scaleX(d.distance), scaleY(d.elevation))
    })
    ctx.lineTo(scaleX(elevationData[elevationData.length - 1].distance), height - padding.bottom)
    ctx.closePath()

    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)')
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.05)')
    ctx.fillStyle = gradient
    ctx.fill()

    // Draw line
    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.beginPath()
    elevationData.forEach((d, i) => {
      const x = scaleX(d.distance)
      const y = scaleY(d.elevation)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.stroke()

  }, [elevationData])

  const formatDistance = (m: number) => {
    if (m < 1000) return `${Math.round(m)} m`
    return `${(m / 1000).toFixed(2)} km`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-4 z-[1700] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-w-lg mx-auto my-auto max-h-[70vh]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-purple-500 text-white">
        <div className="flex items-center gap-2">
          <Mountain size={20} />
          <span className="font-medium">Hoogteprofiel</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded bg-purple-400/50 hover:bg-purple-400 transition-colors border-0 outline-none"
        >
          <X size={18} />
        </button>
      </div>

      {/* Route name */}
      <div className="px-4 py-2 bg-purple-50 border-b border-purple-100">
        <h3 className="font-medium text-gray-800 truncate">{route.name}</h3>
        <p className="text-xs text-gray-500">{formatDistance(route.totalDistance)}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 p-3 border-b border-gray-100">
        <div className="text-center">
          <div className="flex items-center justify-center text-blue-500 mb-1">
            <Minus size={14} />
          </div>
          <div className="text-xs text-gray-500">Min</div>
          <div className="text-sm font-medium">{stats.min.toFixed(1)}m</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-purple-500 mb-1">
            <Mountain size={14} />
          </div>
          <div className="text-xs text-gray-500">Max</div>
          <div className="text-sm font-medium">{stats.max.toFixed(1)}m</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-green-500 mb-1">
            <TrendingUp size={14} />
          </div>
          <div className="text-xs text-gray-500">Stijging</div>
          <div className="text-sm font-medium">{stats.gain.toFixed(1)}m</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center text-red-500 mb-1">
            <TrendingDown size={14} />
          </div>
          <div className="text-xs text-gray-500">Daling</div>
          <div className="text-sm font-medium">{stats.loss.toFixed(1)}m</div>
        </div>
      </div>

      {/* Profile chart */}
      <div className="flex-1 p-3">
        <canvas
          ref={canvasRef}
          width={350}
          height={200}
          className="w-full h-full"
        />
      </div>

      {/* Note */}
      <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-100">
        <p className="text-xs text-yellow-700">
          <strong>Let op:</strong> Dit zijn gesimuleerde hoogtewaarden. Koppeling met AHN-data komt binnenkort.
        </p>
      </div>
    </motion.div>
  )
}

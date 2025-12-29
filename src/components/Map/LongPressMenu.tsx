import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Navigation, X, MapPin, Plus } from 'lucide-react'
import { toLonLat } from 'ol/proj'
import { useMapStore } from '../../store'
import { useGPSStore } from '../../store/gpsStore'
import { useNavigationStore } from '../../store/navigationStore'
import { useUIStore } from '../../store/uiStore'

interface LongPressLocation {
  pixel: [number, number]
  coordinate: [number, number] // [lng, lat]
}

export function LongPressMenu() {
  const map = useMapStore(state => state.map)
  const position = useGPSStore(state => state.position)
  const startNavigation = useNavigationStore(state => state.startNavigation)
  const isNavigating = useNavigationStore(state => state.isNavigating)
  const openVondstForm = useUIStore(state => state.openVondstForm)

  const [menuLocation, setMenuLocation] = useState<LongPressLocation | null>(null)
  const [visible, setVisible] = useState(false)
  const [canClose, setCanClose] = useState(false) // Prevent immediate close on finger lift

  const longPressTimer = useRef<number | null>(null)
  const startPos = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!map) {
      console.log('📍 LongPressMenu: map not ready')
      return
    }

    const viewport = map.getViewport()
    if (!viewport) {
      console.log('📍 LongPressMenu: viewport not ready')
      return
    }

    console.log('📍 LongPressMenu: attached to viewport', viewport)

    const LONG_PRESS_DURATION = 600 // ms
    const MOVE_THRESHOLD = 15 // pixels

    const handleTouchStart = (e: TouchEvent) => {
      console.log('👆 Touch start, touches:', e.touches.length)
      if (e.touches.length !== 1) return // Only single touch

      const touch = e.touches[0]
      startPos.current = { x: touch.clientX, y: touch.clientY }
      console.log('👆 Starting long press timer at:', startPos.current)

      // Clear any existing timer
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }

      longPressTimer.current = window.setTimeout(() => {
        console.log('⏱️ Timer fired! startPos:', startPos.current)
        if (!startPos.current) return

        // Get map from global reference (not immer-wrapped)
        const currentMap = (window as any).__olMap
        if (!currentMap) {
          console.log('❌ Map not available (global)')
          return
        }

        // Get the map element's bounding rect
        const rect = viewport.getBoundingClientRect()
        const pixel: [number, number] = [
          startPos.current.x - rect.left,
          startPos.current.y - rect.top
        ]

        // Get coordinate at pixel
        const coordinate = currentMap.getCoordinateFromPixel(pixel)
        if (coordinate) {
          const lonLat = toLonLat(coordinate) as [number, number]

          // Prevent default context menu
          e.preventDefault()

          setMenuLocation({
            pixel: [startPos.current.x, startPos.current.y],
            coordinate: lonLat
          })
          setVisible(true)
          setCanClose(false) // Prevent immediate close

          // Allow closing after finger is lifted (300ms delay)
          setTimeout(() => setCanClose(true), 300)

          // Haptic feedback
          if ('vibrate' in navigator) {
            navigator.vibrate(50)
          }

          console.log('🎯 Long press detected at:', lonLat)
        }
      }, LONG_PRESS_DURATION)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!longPressTimer.current || !startPos.current) return

      const touch = e.touches[0]
      const dx = touch.clientX - startPos.current.x
      const dy = touch.clientY - startPos.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > MOVE_THRESHOLD) {
        console.log('👆 Touch moved too much, cancelling. Distance:', distance)
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }

    const handleTouchEnd = () => {
      console.log('👆 Touch end, timer active:', !!longPressTimer.current)
      if (longPressTimer.current) {
        console.log('👆 Cancelling timer on touch end')
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
      startPos.current = null
    }

    // Prevent default context menu on long press
    const handleContextMenu = (e: Event) => {
      if (visible) {
        e.preventDefault()
      }
    }

    // Mouse events for desktop
    const handleMouseDown = (e: MouseEvent) => {
      if (e.button !== 0) return // Only left click
      console.log('🖱️ Mouse down')
      startPos.current = { x: e.clientX, y: e.clientY }

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }

      longPressTimer.current = window.setTimeout(() => {
        console.log('⏱️ Mouse timer fired!')
        if (!startPos.current) return

        // Get map from global reference (not immer-wrapped)
        const currentMap = (window as any).__olMap
        console.log('🗺️ __olMap:', currentMap)
        console.log('🗺️ __olMap constructor:', currentMap?.constructor?.name)
        console.log('🗺️ has getCoordinateAtPixel:', typeof currentMap?.getCoordinateAtPixel)
        if (!currentMap) {
          console.log('❌ Map not available (global)')
          return
        }

        const rect = viewport.getBoundingClientRect()
        const pixel: [number, number] = [
          startPos.current.x - rect.left,
          startPos.current.y - rect.top
        ]

        console.log('📍 Pixel:', pixel)
        const coordinate = currentMap.getCoordinateFromPixel(pixel)
        console.log('📍 Coordinate:', coordinate)
        if (coordinate) {
          const lonLat = toLonLat(coordinate) as [number, number]

          setMenuLocation({
            pixel: [startPos.current.x, startPos.current.y],
            coordinate: lonLat
          })
          setVisible(true)
          setCanClose(false)
          setTimeout(() => setCanClose(true), 300)

          console.log('🎯 Long press (mouse) detected at:', lonLat)
        }
      }, LONG_PRESS_DURATION)
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!longPressTimer.current || !startPos.current) return

      const dx = e.clientX - startPos.current.x
      const dy = e.clientY - startPos.current.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > MOVE_THRESHOLD) {
        console.log('🖱️ Mouse moved, cancelling')
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }

    const handleMouseUp = () => {
      console.log('🖱️ Mouse up')
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
      startPos.current = null
    }

    // Add touch event listeners
    viewport.addEventListener('touchstart', handleTouchStart, { passive: false })
    viewport.addEventListener('touchmove', handleTouchMove, { passive: true })
    viewport.addEventListener('touchend', handleTouchEnd)
    viewport.addEventListener('touchcancel', handleTouchEnd)
    viewport.addEventListener('contextmenu', handleContextMenu)

    // Add mouse event listeners
    viewport.addEventListener('mousedown', handleMouseDown)
    viewport.addEventListener('mousemove', handleMouseMove)
    viewport.addEventListener('mouseup', handleMouseUp)
    viewport.addEventListener('mouseleave', handleMouseUp)

    return () => {
      viewport.removeEventListener('touchstart', handleTouchStart)
      viewport.removeEventListener('touchmove', handleTouchMove)
      viewport.removeEventListener('touchend', handleTouchEnd)
      viewport.removeEventListener('touchcancel', handleTouchEnd)
      viewport.removeEventListener('contextmenu', handleContextMenu)
      viewport.removeEventListener('mousedown', handleMouseDown)
      viewport.removeEventListener('mousemove', handleMouseMove)
      viewport.removeEventListener('mouseup', handleMouseUp)
      viewport.removeEventListener('mouseleave', handleMouseUp)

      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [map, visible])

  const handleClose = () => {
    if (!canClose) return // Prevent closing immediately after opening
    setVisible(false)
    setMenuLocation(null)
    setCanClose(false)
  }

  const handleNavigate = async () => {
    if (!menuLocation || !position) return

    const [lng, lat] = menuLocation.coordinate

    // Generate a name based on coordinates
    const name = `${lat.toFixed(4)}, ${lng.toFixed(4)}`

    await startNavigation(
      { lng, lat },
      name,
      { lng: position.lng, lat: position.lat }
    )

    // Force close (bypass canClose check)
    setVisible(false)
    setMenuLocation(null)
    setCanClose(false)
  }

  const forceClose = () => {
    setVisible(false)
    setMenuLocation(null)
    setCanClose(false)
  }

  const handleAddVondst = () => {
    if (!menuLocation) return

    const [lng, lat] = menuLocation.coordinate

    // Open vondst form with this location
    openVondstForm({ lat, lng })

    // Close menu
    setVisible(false)
    setMenuLocation(null)
    setCanClose(false)
  }

  // Format coordinate for display
  const formatCoordinate = (coord: [number, number]) => {
    const [lng, lat] = coord
    return `${lat.toFixed(5)}°N, ${lng.toFixed(5)}°E`
  }

  return (
    <AnimatePresence>
      {visible && menuLocation && (
        <>
          {/* Backdrop - tap to close */}
          <motion.div
            className="fixed inset-0 z-[1600]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Context Menu */}
          <motion.div
            className="fixed z-[1601] bg-white rounded-xl shadow-2xl overflow-hidden min-w-[200px]"
            style={{
              // Position menu near the long press location
              left: Math.min(menuLocation.pixel[0], window.innerWidth - 220),
              top: Math.min(menuLocation.pixel[1], window.innerHeight - 180)
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header with coordinates */}
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} />
                <span className="text-xs font-mono">
                  {formatCoordinate(menuLocation.coordinate)}
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              {/* Add vondst */}
              <button
                onClick={handleAddVondst}
                className="w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-orange-50 text-gray-700"
              >
                <Plus size={20} className="text-orange-500" />
                <span className="font-medium">Vondst toevoegen</span>
              </button>

              {/* Divider */}
              <div className="border-t border-gray-100 my-1" />

              {/* Navigate to... */}
              <button
                onClick={handleNavigate}
                disabled={!position || isNavigating}
                className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                  position && !isNavigating
                    ? 'hover:bg-blue-50 text-gray-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                <Navigation size={20} className={position && !isNavigating ? 'text-blue-500' : 'text-gray-300'} />
                <span className="font-medium">Navigeer hierheen</span>
              </button>

              {/* Show warning if no GPS */}
              {!position && (
                <div className="px-4 py-2 text-xs text-amber-600 bg-amber-50">
                  GPS positie niet beschikbaar
                </div>
              )}

              {/* Show warning if already navigating */}
              {isNavigating && (
                <div className="px-4 py-2 text-xs text-blue-600 bg-blue-50">
                  Navigatie al actief
                </div>
              )}
            </div>

            {/* Cancel button */}
            <div className="border-t border-gray-100">
              <button
                onClick={forceClose}
                className="w-full px-4 py-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <X size={18} />
                <span>Annuleren</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

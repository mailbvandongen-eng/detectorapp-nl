import { useEffect, useState, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, Plus, ExternalLink, Layers, ChevronRight, Check, Camera, Settings2, Crosshair } from 'lucide-react'
import { toLonLat } from 'ol/proj'
import { useMapStore } from '../../store'
import { useUIStore } from '../../store/uiStore'
import { useCustomPointLayerStore, CustomPointLayer } from '../../store/customPointLayerStore'

// Check if a coordinate is already in a layer (within ~10m tolerance)
const TOLERANCE = 0.0001 // ~10 meters at equator
function isCoordinateInLayer(layer: CustomPointLayer, coord: [number, number]): boolean {
  return layer.points.some(point => {
    const dx = Math.abs(point.coordinates[0] - coord[0])
    const dy = Math.abs(point.coordinates[1] - coord[1])
    return dx < TOLERANCE && dy < TOLERANCE
  })
}

interface LongPressLocation {
  pixel: [number, number]
  coordinate: [number, number] // [lng, lat]
}

export function LongPressMenu() {
  const map = useMapStore(state => state.map)
  const openVondstForm = useUIStore(state => state.openVondstForm)
  const { openAddPointModal, openCreateLayerModal, openLayerManagerModal } = useUIStore()
  const customLayers = useCustomPointLayerStore(state => state.layers)

  const [menuLocation, setMenuLocation] = useState<LongPressLocation | null>(null)
  const [visible, setVisible] = useState(false)
  const [canClose, setCanClose] = useState(false) // Prevent immediate close on finger lift
  const [showLayerSubmenu, setShowLayerSubmenu] = useState(false)

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
    setShowLayerSubmenu(false)
  }

  const forceClose = () => {
    setVisible(false)
    setMenuLocation(null)
    setCanClose(false)
    setShowLayerSubmenu(false)
  }

  const handleAddToLayer = (layerId: string) => {
    if (!menuLocation) return

    const [lng, lat] = menuLocation.coordinate
    openAddPointModal(layerId, { lat, lng })

    forceClose()
  }

  const handleCreateNewLayer = () => {
    openCreateLayerModal()
    forceClose()
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

  const handleOpenGoogleMaps = () => {
    if (!menuLocation) return

    const [lng, lat] = menuLocation.coordinate
    const url = `https://www.google.com/maps?q=${lat},${lng}`
    window.open(url, '_blank')

    // Close menu
    setVisible(false)
    setMenuLocation(null)
    setCanClose(false)
  }

  // Take photo with location metadata
  const handleTakePhoto = () => {
    if (!menuLocation) return

    // Create hidden file input for camera
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Use back camera

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Open vondst form with location AND photo
      const [lng, lat] = menuLocation.coordinate
      openVondstForm({ lat, lng }, file)
    }

    input.click()
    forceClose()
  }

  // Open layer manager
  const handleManageLayers = () => {
    openLayerManagerModal()
    forceClose()
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
            className="fixed z-[1601] bg-white rounded-xl shadow-md overflow-hidden min-w-[200px] border-0 outline-none"
            style={{
              // Position menu near the long press location
              left: Math.min(menuLocation.pixel[0], window.innerWidth - 220),
              top: Math.min(menuLocation.pixel[1], window.innerHeight - 240)
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
          >
            {/* Header with coordinates - white bg, blue text */}
            <div className="px-4 py-3 bg-white border-b border-gray-100">
              <div className="flex items-center gap-2 text-blue-600">
                <MapPin size={16} />
                <span className="text-xs font-mono">
                  {formatCoordinate(menuLocation.coordinate)}
                </span>
              </div>
            </div>

            {/* Menu items */}
            <div className="bg-white">
              {/* Add vondst */}
              <button
                onClick={handleAddVondst}
                className="w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-orange-50 text-gray-700 bg-white border-0 outline-none"
              >
                <Crosshair size={20} className="text-orange-500" />
                <span className="font-medium">Vondst toevoegen</span>
              </button>

              {/* Take photo */}
              <button
                onClick={handleTakePhoto}
                className="w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-green-50 text-gray-700 bg-white border-0 outline-none"
              >
                <Camera size={20} className="text-green-500" />
                <span className="font-medium">Foto maken</span>
              </button>

              {/* Add to layer - with submenu */}
              <div className="relative">
                <button
                  onClick={() => setShowLayerSubmenu(!showLayerSubmenu)}
                  className="w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-blue-50 text-gray-700 bg-white border-0 outline-none"
                >
                  <Layers size={20} className="text-purple-500" />
                  <span className="font-medium flex-1 text-left">Voeg toe aan laag...</span>
                  <ChevronRight size={16} className={`text-gray-400 transition-transform ${showLayerSubmenu ? 'rotate-90' : ''}`} />
                </button>

                {/* Layer submenu */}
                <AnimatePresence>
                  {showLayerSubmenu && (
                    <motion.div
                      className="bg-gray-50 border-t border-gray-100"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      {customLayers.length === 0 ? (
                        <button
                          onClick={handleCreateNewLayer}
                          className="w-full px-4 py-2 pl-11 flex items-center gap-2 text-sm text-purple-600 hover:bg-purple-50 bg-transparent border-0 outline-none"
                        >
                          <Plus size={14} />
                          <span>Maak eerst een laag aan</span>
                        </button>
                      ) : (
                        <>
                          {customLayers.map(layer => {
                            const isAlreadyAdded = menuLocation ? isCoordinateInLayer(layer, menuLocation.coordinate) : false
                            return (
                              <button
                                key={layer.id}
                                onClick={() => !isAlreadyAdded && handleAddToLayer(layer.id)}
                                className={`w-full px-4 py-2 pl-11 flex items-center gap-2 text-sm bg-transparent border-0 outline-none ${
                                  isAlreadyAdded
                                    ? 'text-gray-400 cursor-not-allowed'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                                title={isAlreadyAdded ? 'Al toegevoegd aan deze laag' : undefined}
                                disabled={isAlreadyAdded}
                              >
                                {isAlreadyAdded ? (
                                  <Check size={14} className="text-green-500 flex-shrink-0" />
                                ) : (
                                  <div
                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                    style={{ backgroundColor: layer.color }}
                                  />
                                )}
                                <span className="truncate">{layer.name}</span>
                                <span className="text-xs text-gray-400 ml-auto">
                                  {isAlreadyAdded ? 'al toegevoegd' : `(${layer.points.length})`}
                                </span>
                              </button>
                            )
                          })}
                          <button
                            onClick={handleCreateNewLayer}
                            className="w-full px-4 py-2 pl-11 flex items-center gap-2 text-sm text-purple-600 hover:bg-purple-50 bg-transparent border-0 outline-none border-t border-gray-200"
                          >
                            <Plus size={14} />
                            <span>Nieuwe laag...</span>
                          </button>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Manage layers */}
              <button
                onClick={handleManageLayers}
                className="w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-purple-50 text-gray-700 bg-white border-0 outline-none"
              >
                <Settings2 size={20} className="text-purple-500" />
                <span className="font-medium">Lagen beheren</span>
              </button>

              {/* Open in Google Maps */}
              <button
                onClick={handleOpenGoogleMaps}
                className="w-full px-4 py-3 flex items-center gap-3 transition-colors hover:bg-blue-50 text-gray-700 bg-white border-0 outline-none"
              >
                <ExternalLink size={20} className="text-blue-600" />
                <span className="font-medium">Open in Google Maps</span>
              </button>
            </div>

            {/* Cancel button */}
            <div className="bg-white">
              <button
                onClick={forceClose}
                className="w-full px-4 py-3 flex items-center justify-center gap-2 text-gray-500 hover:bg-blue-50 transition-colors bg-white border-0 outline-none"
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

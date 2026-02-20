import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ruler, X, Trash2 } from 'lucide-react'
import { useMapStore, useUIStore, useSettingsStore } from '../../store'
import { engineLog } from '../../config/mapEngineConfig'
import Sketch from '@arcgis/core/widgets/Sketch'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine'
import type Graphic from '@arcgis/core/Graphic'
import type MapView from '@arcgis/core/views/MapView'

export function ArcGISMeasureTool() {
  const arcgisView = useMapStore(state => state.arcgisView)
  const setDrawingMode = useUIStore(state => state.setDrawingMode)
  const showMeasureTool = useSettingsStore(state => state.showMeasureTool)
  const [isActive, setIsActive] = useState(false)
  const [currentDistance, setCurrentDistance] = useState<string | null>(null)
  const [totalMeasurements, setTotalMeasurements] = useState(0)

  const layerRef = useRef<GraphicsLayer | null>(null)
  const sketchRef = useRef<Sketch | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Initialize graphics layer
  useEffect(() => {
    if (!arcgisView) return

    const layer = new GraphicsLayer({
      id: 'arcgis-measure-layer',
      title: 'Metingen',
      listMode: 'hide'
    })
    layerRef.current = layer
    arcgisView.map.add(layer)

    engineLog('MeasureTool: GraphicsLayer toegevoegd')

    return () => {
      if (layerRef.current) {
        arcgisView.map.remove(layerRef.current)
        layerRef.current = null
      }
    }
  }, [arcgisView])

  // Set drawing mode when active changes
  useEffect(() => {
    setDrawingMode(isActive)
    return () => {
      if (isActive) setDrawingMode(false)
    }
  }, [isActive, setDrawingMode])

  // Calculate distance for a polyline
  const calculateDistance = useCallback((graphic: Graphic): string => {
    if (!graphic.geometry || graphic.geometry.type !== 'polyline') {
      return '0 m'
    }

    // Use geodesicLength for accurate distance
    const length = geometryEngine.geodesicLength(graphic.geometry, 'meters')
    return formatLength(length)
  }, [])

  // Initialize Sketch widget when active
  useEffect(() => {
    if (!arcgisView || !layerRef.current || !isActive) {
      // Clean up sketch when deactivated
      if (sketchRef.current) {
        sketchRef.current.destroy()
        sketchRef.current = null
      }
      return
    }

    // Create container for sketch (hidden, we use our own UI)
    const container = document.createElement('div')
    container.style.display = 'none'
    document.body.appendChild(container)
    containerRef.current = container

    const sketch = new Sketch({
      view: arcgisView,
      layer: layerRef.current,
      container,
      creationMode: 'single',
      defaultCreateOptions: {
        mode: 'click'
      },
      visibleElements: {
        createTools: { point: false, polygon: false, rectangle: false, circle: false },
        selectionTools: { 'lasso-selection': false, 'rectangle-selection': false },
        settingsMenu: false,
        undoRedoMenu: false
      },
      snappingOptions: {
        enabled: true,
        featureSources: []
      }
    })

    sketchRef.current = sketch

    // Style the graphics
    sketch.viewModel.polylineSymbol = {
      type: 'simple-line',
      color: [59, 130, 246, 1], // blue-500
      width: 3,
      style: 'dash'
    } as any

    sketch.viewModel.activeVertexSymbol = {
      type: 'simple-marker',
      color: [59, 130, 246, 1],
      size: 8,
      outline: { color: [255, 255, 255], width: 2 }
    } as any

    sketch.viewModel.vertexSymbol = {
      type: 'simple-marker',
      color: [59, 130, 246, 1],
      size: 6,
      outline: { color: [255, 255, 255], width: 2 }
    } as any

    // Listen for drawing events
    sketch.on('create', (event) => {
      if (event.state === 'active') {
        // Update distance while drawing
        const distance = calculateDistance(event.graphic)
        setCurrentDistance(distance)
      } else if (event.state === 'complete') {
        const distance = calculateDistance(event.graphic)
        setCurrentDistance(distance)
        setTotalMeasurements(prev => prev + 1)

        // Add distance label to graphic
        event.graphic.attributes = {
          distance,
          type: 'measurement'
        }

        engineLog('MeasureTool: Meting voltooid -', distance)

        // Start new measurement automatically
        setTimeout(() => {
          if (sketchRef.current) {
            sketchRef.current.create('polyline')
          }
        }, 100)
      }
    })

    // Start drawing immediately
    sketch.create('polyline')
    engineLog('MeasureTool: Sketch widget gestart')

    return () => {
      if (sketchRef.current) {
        sketchRef.current.destroy()
        sketchRef.current = null
      }
      if (containerRef.current) {
        containerRef.current.remove()
        containerRef.current = null
      }
    }
  }, [arcgisView, isActive, calculateDistance])

  const toggleMeasure = () => {
    setIsActive(!isActive)
    if (isActive) {
      setCurrentDistance(null)
    }
  }

  const clearMeasurements = () => {
    if (layerRef.current) {
      layerRef.current.removeAll()
      setTotalMeasurements(0)
      setCurrentDistance(null)
      engineLog('MeasureTool: Metingen gewist')
    }
  }

  // Don't render if hidden
  if (!showMeasureTool) return null

  return (
    <>
      {/* Measure button - left side, under weather widget */}
      <motion.button
        onClick={toggleMeasure}
        className={`fixed top-[90px] left-2 z-[800] w-11 h-11 flex items-center justify-center rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm ${
          isActive ? 'bg-blue-500' : 'bg-white/80 hover:bg-white/90'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Afstanden meten"
      >
        <Ruler size={20} className={isActive ? 'text-white' : 'text-blue-500 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]'} />
      </motion.button>

      {/* Measurement panel */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[90px] left-[56px] z-[801] bg-white/95 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden min-w-[180px]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-blue-500">
              <span className="font-medium text-white text-xs">Meten</span>
              <button
                onClick={toggleMeasure}
                className="p-0.5 rounded hover:bg-white/20 transition-colors border-0 outline-none"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
              <p className="text-xs text-gray-500">
                Klik om te meten. Dubbelklik om te stoppen.
              </p>

              {currentDistance && (
                <div className="bg-blue-50 rounded-lg p-2">
                  <div className="text-xs text-blue-600 font-medium">Afstand</div>
                  <div className="text-lg font-bold text-blue-700">{currentDistance}</div>
                </div>
              )}

              {totalMeasurements > 0 && (
                <button
                  onClick={clearMeasurements}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors border-0 outline-none"
                >
                  <Trash2 size={12} />
                  Wis metingen ({totalMeasurements})
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Format length to human readable
function formatLength(length: number): string {
  if (length >= 1000) {
    return `${(length / 1000).toFixed(2)} km`
  }
  return `${Math.round(length)} m`
}

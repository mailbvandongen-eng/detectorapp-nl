import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, X, Trash2, MapPin, Spline, Pentagon, Move, Save } from 'lucide-react'
import { useMapStore, useUIStore, useSettingsStore } from '../../store'
import { useCustomPointLayerStore } from '../../store/customPointLayerStore'
import { engineLog } from '../../config/mapEngineConfig'
import Sketch from '@arcgis/core/widgets/Sketch'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import * as geometryEngine from '@arcgis/core/geometry/geometryEngine'
import * as webMercatorUtils from '@arcgis/core/geometry/support/webMercatorUtils'
import type Graphic from '@arcgis/core/Graphic'
import type { Point, Polyline, Polygon } from '@arcgis/core/geometry'
import type { FeatureGeometry, GeometryType } from '../../store/customPointLayerStore'

type DrawMode = 'select' | 'point' | 'line' | 'polygon'

// Layer name for drawings
const DRAWINGS_LAYER_NAME = 'Mijn Tekeningen'

export function ArcGISDrawTool() {
  const arcgisView = useMapStore(state => state.arcgisView)
  const setDrawingMode = useUIStore(state => state.setDrawingMode)
  const showDrawTool = useSettingsStore(state => state.showDrawTool)
  const showMeasureTool = useSettingsStore(state => state.showMeasureTool)
  const [isActive, setIsActive] = useState(false)
  const [drawMode, setDrawMode] = useState<DrawMode>('select')
  const [featureCount, setFeatureCount] = useState(0)
  const [currentMeasurement, setCurrentMeasurement] = useState<string | null>(null)

  const { layers, addLayer, addPoint } = useCustomPointLayerStore()

  const layerRef = useRef<GraphicsLayer | null>(null)
  const sketchRef = useRef<Sketch | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Initialize graphics layer
  useEffect(() => {
    if (!arcgisView) return

    const layer = new GraphicsLayer({
      id: 'arcgis-draw-layer',
      title: 'Tekeningen',
      listMode: 'hide'
    })
    layerRef.current = layer
    arcgisView.map.add(layer)

    engineLog('DrawTool: GraphicsLayer toegevoegd')

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

  // Calculate measurement for graphics
  const calculateMeasurement = useCallback((graphic: Graphic): string | null => {
    if (!graphic.geometry) return null

    if (graphic.geometry.type === 'polyline') {
      const length = geometryEngine.geodesicLength(graphic.geometry, 'meters')
      return formatLength(length)
    } else if (graphic.geometry.type === 'polygon') {
      const area = geometryEngine.geodesicArea(graphic.geometry, 'square-meters')
      return formatArea(Math.abs(area))
    }
    return null
  }, [])

  // Initialize Sketch widget when active
  useEffect(() => {
    if (!arcgisView || !layerRef.current || !isActive) {
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
      defaultUpdateOptions: {
        tool: 'reshape',
        enableRotation: false,
        enableScaling: false
      },
      snappingOptions: {
        enabled: true,
        featureSources: []
      }
    })

    sketchRef.current = sketch

    // Set symbols
    sketch.viewModel.pointSymbol = {
      type: 'simple-marker',
      color: [249, 115, 22, 1], // orange-500
      size: 10,
      outline: { color: [255, 255, 255], width: 2 }
    } as any

    sketch.viewModel.polylineSymbol = {
      type: 'simple-line',
      color: [249, 115, 22, 1],
      width: 3
    } as any

    sketch.viewModel.polygonSymbol = {
      type: 'simple-fill',
      color: [249, 115, 22, 0.2],
      outline: { color: [249, 115, 22], width: 3 }
    } as any

    sketch.viewModel.activeVertexSymbol = {
      type: 'simple-marker',
      color: [234, 88, 12, 1], // orange-600
      size: 8,
      outline: { color: [255, 255, 255], width: 2 }
    } as any

    // Listen for drawing events
    sketch.on('create', (event) => {
      if (event.state === 'active') {
        const measurement = calculateMeasurement(event.graphic)
        setCurrentMeasurement(measurement)
      } else if (event.state === 'complete') {
        const measurement = calculateMeasurement(event.graphic)
        setCurrentMeasurement(null)

        // Store measurement and type in attributes
        event.graphic.attributes = {
          measurement,
          drawType: drawMode,
          created: new Date().toISOString()
        }

        setFeatureCount(prev => prev + 1)
        engineLog('DrawTool: Tekening voltooid -', drawMode, measurement || '')
      }
    })

    // Handle delete key for selected graphics
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (sketchRef.current?.viewModel.state === 'active') {
          const selected = sketchRef.current.viewModel.updateGraphics
          if (selected && selected.length > 0) {
            selected.forEach(g => layerRef.current?.remove(g))
            sketchRef.current.cancel()
            setFeatureCount(layerRef.current?.graphics.length || 0)
          }
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    engineLog('DrawTool: Sketch widget gestart')

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      if (sketchRef.current) {
        sketchRef.current.destroy()
        sketchRef.current = null
      }
      if (containerRef.current) {
        containerRef.current.remove()
        containerRef.current = null
      }
    }
  }, [arcgisView, isActive, calculateMeasurement, drawMode])

  // Start drawing when mode changes
  useEffect(() => {
    if (!sketchRef.current || !isActive) return

    if (drawMode === 'select') {
      // Cancel any active drawing, enable selection
      sketchRef.current.cancel()
    } else {
      const toolMap: Record<DrawMode, 'point' | 'polyline' | 'polygon'> = {
        point: 'point',
        line: 'polyline',
        polygon: 'polygon',
        select: 'point'
      }
      sketchRef.current.create(toolMap[drawMode])
    }
  }, [drawMode, isActive])

  const toggleDraw = () => {
    if (isActive) {
      if (featureCount > 0 && !confirm('Tekeningen verwijderen? Klik eerst op Opslaan om te bewaren.')) {
        return
      }
      clearDrawings()
    }
    setIsActive(!isActive)
    setDrawMode('select')
    setCurrentMeasurement(null)
  }

  const clearDrawings = () => {
    if (layerRef.current) {
      layerRef.current.removeAll()
      setFeatureCount(0)
      setCurrentMeasurement(null)
      engineLog('DrawTool: Tekeningen gewist')
    }
  }

  const saveDrawings = () => {
    if (!layerRef.current || featureCount === 0) return

    // Ensure layer exists
    let drawingsLayer = layers.find(l => l.name === DRAWINGS_LAYER_NAME)
    if (!drawingsLayer) {
      const newLayerId = useCustomPointLayerStore.getState().addLayer(DRAWINGS_LAYER_NAME, ['Punt', 'Lijn', 'Vlak'])
      drawingsLayer = useCustomPointLayerStore.getState().getLayer(newLayerId)
    }

    if (!drawingsLayer) {
      alert('Kon tekeningen laag niet aanmaken')
      return
    }

    const graphics = layerRef.current.graphics.toArray()
    let savedCount = 0

    graphics.forEach((graphic, index) => {
      const geom = graphic.geometry
      if (!geom) return

      const attrs = graphic.attributes || {}
      const drawType = attrs.drawType as DrawMode || 'point'
      const measurement = attrs.measurement as string | undefined

      let centerCoords: [number, number]
      let featureGeometry: FeatureGeometry | undefined

      // Convert Web Mercator to WGS84
      const geomWgs84 = webMercatorUtils.webMercatorToGeographic(geom)

      if (geom.type === 'point') {
        const pt = geomWgs84 as Point
        centerCoords = [pt.longitude, pt.latitude]
      } else if (geom.type === 'polyline') {
        const line = geomWgs84 as Polyline
        const paths = line.paths
        if (paths.length > 0 && paths[0].length > 0) {
          const midIndex = Math.floor(paths[0].length / 2)
          centerCoords = [paths[0][midIndex][0], paths[0][midIndex][1]]

          featureGeometry = {
            type: 'LineString' as GeometryType,
            coordinates: paths[0].map(c => [c[0], c[1]])
          }
        } else {
          return
        }
      } else if (geom.type === 'polygon') {
        const poly = geomWgs84 as Polygon
        const extent = poly.extent
        centerCoords = [(extent.xmin + extent.xmax) / 2, (extent.ymin + extent.ymax) / 2]

        featureGeometry = {
          type: 'Polygon' as GeometryType,
          coordinates: poly.rings.map(ring => ring.map(c => [c[0], c[1]]))
        }
      } else {
        return
      }

      const categoryMap: Record<DrawMode, string> = {
        point: 'Punt',
        line: 'Lijn',
        polygon: 'Vlak',
        select: 'Punt'
      }

      addPoint(drawingsLayer!.id, {
        name: `Tekening ${new Date().toLocaleDateString('nl-NL')} #${index + 1}`,
        category: categoryMap[drawType],
        notes: measurement ? `Afmeting: ${measurement}` : '',
        coordinates: centerCoords,
        geometry: featureGeometry
      })

      savedCount++
    })

    alert(`${savedCount} tekening(en) opgeslagen naar "${DRAWINGS_LAYER_NAME}"`)
    clearDrawings()
    setIsActive(false)
  }

  // Don't render if hidden
  if (!showDrawTool) return null

  // Calculate position dynamically
  const topPosition = 90 + (showMeasureTool ? 48 : 0)

  return (
    <>
      {/* Draw button */}
      <motion.button
        onClick={toggleDraw}
        className={`fixed left-2 z-[800] w-11 h-11 flex items-center justify-center rounded-xl shadow-sm border-0 outline-none transition-colors backdrop-blur-sm ${
          isActive ? 'bg-orange-500' : 'bg-white/80 hover:bg-white/90'
        }`}
        style={{ top: `${topPosition}px` }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        title="Tekenen op de kaart"
      >
        <Pencil size={20} className={isActive ? 'text-white' : 'text-orange-500 drop-shadow-[1px_1px_1px_rgba(0,0,0,0.15)]'} />
      </motion.button>

      {/* Drawing panel */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, x: -10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-[56px] z-[801] bg-white/95 rounded-xl shadow-lg backdrop-blur-sm overflow-hidden min-w-[200px]"
            style={{ top: `${topPosition}px` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-orange-500">
              <span className="font-medium text-white text-xs">Tekenen</span>
              <button
                onClick={toggleDraw}
                className="p-0.5 rounded hover:bg-white/20 transition-colors border-0 outline-none"
              >
                <X size={14} className="text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3">
              {/* Drawing tools */}
              <div className="flex gap-1">
                <ToolButton
                  icon={<Move size={16} />}
                  active={drawMode === 'select'}
                  onClick={() => setDrawMode('select')}
                  title="Selecteren"
                />
                <ToolButton
                  icon={<MapPin size={16} />}
                  active={drawMode === 'point'}
                  onClick={() => setDrawMode('point')}
                  title="Punt"
                />
                <ToolButton
                  icon={<Spline size={16} />}
                  active={drawMode === 'line'}
                  onClick={() => setDrawMode('line')}
                  title="Lijn"
                />
                <ToolButton
                  icon={<Pentagon size={16} />}
                  active={drawMode === 'polygon'}
                  onClick={() => setDrawMode('polygon')}
                  title="Vlak"
                />
              </div>

              <p className="text-xs text-gray-500">
                {drawMode === 'select'
                  ? 'Klik om te selecteren, Delete om te verwijderen'
                  : drawMode === 'point'
                  ? 'Klik om een punt te plaatsen'
                  : 'Klik om te tekenen, dubbelklik om te voltooien'}
              </p>

              {currentMeasurement && (
                <div className="bg-orange-50 rounded-lg p-2">
                  <div className="text-xs text-orange-600 font-medium">
                    {drawMode === 'polygon' ? 'Oppervlakte' : 'Afstand'}
                  </div>
                  <div className="text-lg font-bold text-orange-700">{currentMeasurement}</div>
                </div>
              )}

              {featureCount > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={saveDrawings}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-white bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors border-0 outline-none"
                  >
                    <Save size={12} />
                    Opslaan ({featureCount})
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Alle tekeningen verwijderen?')) {
                        clearDrawings()
                      }
                    }}
                    className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors border-0 outline-none"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function ToolButton({
  icon,
  active,
  onClick,
  title
}: {
  icon: React.ReactNode
  active: boolean
  onClick: () => void
  title: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors border-0 outline-none ${
        active
          ? 'bg-orange-500 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
      title={title}
    >
      {icon}
    </button>
  )
}

// Format length to human readable
function formatLength(length: number): string {
  if (length >= 1000) {
    return `${(length / 1000).toFixed(2)} km`
  }
  return `${Math.round(length)} m`
}

// Format area to human readable
function formatArea(area: number): string {
  if (area >= 10000) {
    return `${(area / 10000).toFixed(2)} ha`
  }
  return `${Math.round(area)} m²`
}

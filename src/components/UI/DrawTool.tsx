import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, X, Trash2, MapPin, Spline, Pentagon, Move, Save } from 'lucide-react'
import { useMapStore, useUIStore, useSettingsStore } from '../../store'
import { useCustomPointLayerStore } from '../../store/customPointLayerStore'
import { useArcGISFeature } from '../../config/mapEngineConfig'
import { ArcGISDrawTool } from './ArcGISDrawTool'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Draw, Modify, Select } from 'ol/interaction'
import { LineString, Polygon, Point } from 'ol/geom'
import { getLength, getArea } from 'ol/sphere'
import { Style, Stroke, Fill, Circle as CircleStyle, Text } from 'ol/style'
import { toLonLat } from 'ol/proj'
import type Feature from 'ol/Feature'
import type { Geometry } from 'ol/geom'
import type { FeatureGeometry, GeometryType } from '../../store/customPointLayerStore'

type DrawMode = 'select' | 'point' | 'line' | 'polygon'

// Layer name for drawings
const DRAWINGS_LAYER_NAME = 'Mijn Tekeningen'

export function DrawTool() {
  // Use ArcGIS implementation if feature flag is enabled
  const useArcGIS = useArcGISFeature('arcgisTools')
  if (useArcGIS) {
    return <ArcGISDrawTool />
  }

  return <OpenLayersDrawTool />
}

function OpenLayersDrawTool() {
  const map = useMapStore(state => state.map)
  const setDrawingMode = useUIStore(state => state.setDrawingMode)
  const showDrawTool = useSettingsStore(state => state.showDrawTool)
  const showMeasureTool = useSettingsStore(state => state.showMeasureTool)
  const [isActive, setIsActive] = useState(false)
  const [drawMode, setDrawMode] = useState<DrawMode>('select')
  const [featureCount, setFeatureCount] = useState(0)
  const [currentMeasurement, setCurrentMeasurement] = useState<string | null>(null)

  const { layers, addLayer, addPoint, getLayer } = useCustomPointLayerStore()

  const layerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const sourceRef = useRef<VectorSource | null>(null)
  const drawRef = useRef<Draw | null>(null)
  const selectRef = useRef<Select | null>(null)
  const modifyRef = useRef<Modify | null>(null)

  // Initialize vector layer for drawings preview
  useEffect(() => {
    if (!map) return

    const source = new VectorSource()
    sourceRef.current = source

    const layer = new VectorLayer({
      source,
      style: createStyle,
      zIndex: 999,
      properties: { name: 'draw-preview-layer' }
    })
    layerRef.current = layer

    map.addLayer(layer)

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map])

  // Set drawing mode when active changes
  useEffect(() => {
    setDrawingMode(isActive)
    return () => {
      if (isActive) setDrawingMode(false)
    }
  }, [isActive, setDrawingMode])

  // Handle draw mode changes
  useEffect(() => {
    if (!map || !sourceRef.current) return

    // Remove existing interactions
    if (drawRef.current) {
      map.removeInteraction(drawRef.current)
      drawRef.current = null
    }
    if (selectRef.current) {
      map.removeInteraction(selectRef.current)
      selectRef.current = null
    }
    if (modifyRef.current) {
      map.removeInteraction(modifyRef.current)
      modifyRef.current = null
    }

    if (!isActive) return

    if (drawMode === 'select') {
      // Select and modify mode
      const select = new Select({
        layers: [layerRef.current!],
        style: createSelectedStyle
      })
      selectRef.current = select

      const modify = new Modify({
        features: select.getFeatures()
      })
      modifyRef.current = modify

      map.addInteraction(select)
      map.addInteraction(modify)

      // Handle delete on selected feature
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const selectedFeatures = select.getFeatures()
          selectedFeatures.forEach(feature => {
            sourceRef.current?.removeFeature(feature)
          })
          selectedFeatures.clear()
          setFeatureCount(sourceRef.current?.getFeatures().length || 0)
        }
      }
      document.addEventListener('keydown', handleKeyDown)

      return () => {
        document.removeEventListener('keydown', handleKeyDown)
        if (selectRef.current) map.removeInteraction(selectRef.current)
        if (modifyRef.current) map.removeInteraction(modifyRef.current)
      }
    } else {
      // Drawing mode
      const drawType = drawMode === 'point' ? 'Point' : drawMode === 'line' ? 'LineString' : 'Polygon'

      const draw = new Draw({
        source: sourceRef.current,
        type: drawType,
        style: createDrawingStyle
      })
      drawRef.current = draw

      draw.on('drawstart', (evt) => {
        setCurrentMeasurement(null)

        // Listen for geometry changes during drawing
        const geom = evt.feature.getGeometry()
        if (geom) {
          geom.on('change', () => {
            if (drawMode === 'line') {
              const length = getLength(geom as LineString, { projection: 'EPSG:3857' })
              setCurrentMeasurement(formatLength(length))
            } else if (drawMode === 'polygon') {
              const area = getArea(geom as Polygon, { projection: 'EPSG:3857' })
              setCurrentMeasurement(formatArea(area))
            }
          })
        }
      })

      draw.on('drawend', (evt) => {
        const geom = evt.feature.getGeometry()

        // Set measurement label
        if (drawMode === 'line' && geom) {
          const length = getLength(geom as LineString, { projection: 'EPSG:3857' })
          evt.feature.set('measurement', formatLength(length))
        } else if (drawMode === 'polygon' && geom) {
          const area = getArea(geom as Polygon, { projection: 'EPSG:3857' })
          evt.feature.set('measurement', formatArea(area))
        }

        evt.feature.set('drawType', drawMode)
        setFeatureCount(prev => prev + 1)
        setCurrentMeasurement(null)
      })

      map.addInteraction(draw)

      return () => {
        if (drawRef.current) {
          map.removeInteraction(drawRef.current)
        }
      }
    }
  }, [map, isActive, drawMode])

  const toggleDraw = () => {
    if (isActive) {
      // Turning off - offer to save if there are features
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
    if (sourceRef.current) {
      sourceRef.current.clear()
      setFeatureCount(0)
      setCurrentMeasurement(null)
    }
  }

  const saveDrawings = () => {
    if (!sourceRef.current || featureCount === 0) return

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

    const features = sourceRef.current.getFeatures()
    let savedCount = 0

    features.forEach((feature, index) => {
      const geom = feature.getGeometry()
      if (!geom) return

      const drawType = feature.get('drawType') as DrawMode || 'point'
      const measurement = feature.get('measurement') as string | undefined

      // Get center point for display
      let centerCoords: [number, number]
      let featureGeometry: FeatureGeometry | undefined

      if (geom.getType() === 'Point') {
        const coords = (geom as Point).getCoordinates()
        centerCoords = toLonLat(coords) as [number, number]
      } else if (geom.getType() === 'LineString') {
        const coords = (geom as LineString).getCoordinates()
        const midIndex = Math.floor(coords.length / 2)
        centerCoords = toLonLat(coords[midIndex]) as [number, number]

        // Store full geometry
        featureGeometry = {
          type: 'LineString' as GeometryType,
          coordinates: coords.map(c => toLonLat(c))
        }
      } else if (geom.getType() === 'Polygon') {
        const coords = (geom as Polygon).getCoordinates()
        // Get centroid
        const extent = geom.getExtent()
        const center = [(extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2]
        centerCoords = toLonLat(center) as [number, number]

        // Store full geometry
        featureGeometry = {
          type: 'Polygon' as GeometryType,
          coordinates: coords.map(ring => ring.map(c => toLonLat(c)))
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

  // Calculate position dynamically based on which tools above are visible
  // Base position is 90px (under weather widget), each tool adds 48px (44px button + 4px gap)
  const topPosition = 90 + (showMeasureTool ? 48 : 0)

  return (
    <>
      {/* Draw button - left side, dynamic position */}
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

// Style for completed drawings
function createStyle(feature: Feature<Geometry>): Style {
  const measurement = feature.get('measurement') as string | undefined
  const drawType = feature.get('drawType') as DrawMode

  const baseStyle = {
    stroke: new Stroke({
      color: '#f97316',
      width: 3
    }),
    fill: new Fill({
      color: 'rgba(249, 115, 22, 0.2)'
    }),
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({ color: '#f97316' }),
      stroke: new Stroke({ color: '#ffffff', width: 2 })
    })
  }

  return new Style({
    ...baseStyle,
    text: measurement ? new Text({
      text: measurement,
      font: 'bold 11px sans-serif',
      fill: new Fill({ color: '#c2410c' }),
      stroke: new Stroke({ color: '#ffffff', width: 3 }),
      offsetY: drawType === 'polygon' ? 0 : -15,
      placement: drawType === 'line' ? 'line' : 'point',
      overflow: true
    }) : undefined
  })
}

// Style while drawing
function createDrawingStyle(): Style {
  return new Style({
    stroke: new Stroke({
      color: '#ea580c',
      width: 3,
      lineDash: [10, 10]
    }),
    fill: new Fill({
      color: 'rgba(234, 88, 12, 0.1)'
    }),
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({ color: '#ea580c' }),
      stroke: new Stroke({ color: '#ffffff', width: 2 })
    })
  })
}

// Style for selected features
function createSelectedStyle(): Style {
  return new Style({
    stroke: new Stroke({
      color: '#2563eb',
      width: 4
    }),
    fill: new Fill({
      color: 'rgba(37, 99, 235, 0.2)'
    }),
    image: new CircleStyle({
      radius: 8,
      fill: new Fill({ color: '#2563eb' }),
      stroke: new Stroke({ color: '#ffffff', width: 2 })
    })
  })
}

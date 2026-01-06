import { useEffect, useRef, useCallback } from 'react'
import { useMapStore } from '../../store/mapStore'
import { useRouteRecordingStore } from '../../store/routeRecordingStore'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import { LineString, Polygon } from 'ol/geom'
import { fromLonLat, toLonLat } from 'ol/proj'
import { Style, Stroke, Fill, Text } from 'ol/style'
import { getDistance } from 'ol/sphere'

// Generate grid lines based on center point and grid settings
function generateGridFeatures(
  centerLonLat: [number, number],
  gridSize: number, // meters
  gridCount: number, // number of cells in each direction
  gridColor: string
): Feature[] {
  const features: Feature[] = []

  // Calculate offset in degrees (approximate)
  // 1 degree lat ≈ 111km, 1 degree lon ≈ 111km * cos(lat)
  const latOffset = gridSize / 111000
  const lonOffset = gridSize / (111000 * Math.cos(centerLonLat[1] * Math.PI / 180))

  const halfCount = Math.floor(gridCount / 2)

  // Calculate bounds
  const minLon = centerLonLat[0] - halfCount * lonOffset
  const maxLon = centerLonLat[0] + halfCount * lonOffset
  const minLat = centerLonLat[1] - halfCount * latOffset
  const maxLat = centerLonLat[1] + halfCount * latOffset

  // Create vertical lines
  for (let i = -halfCount; i <= halfCount; i++) {
    const lon = centerLonLat[0] + i * lonOffset
    const coords = [
      fromLonLat([lon, minLat]),
      fromLonLat([lon, maxLat])
    ]
    const feature = new Feature({
      geometry: new LineString(coords),
      type: 'grid-line'
    })
    feature.setStyle(new Style({
      stroke: new Stroke({
        color: gridColor,
        width: i === 0 ? 2 : 1,
        lineDash: i === 0 ? undefined : [5, 5]
      })
    }))
    features.push(feature)
  }

  // Create horizontal lines
  for (let i = -halfCount; i <= halfCount; i++) {
    const lat = centerLonLat[1] + i * latOffset
    const coords = [
      fromLonLat([minLon, lat]),
      fromLonLat([maxLon, lat])
    ]
    const feature = new Feature({
      geometry: new LineString(coords),
      type: 'grid-line'
    })
    feature.setStyle(new Style({
      stroke: new Stroke({
        color: gridColor,
        width: i === 0 ? 2 : 1,
        lineDash: i === 0 ? undefined : [5, 5]
      })
    }))
    features.push(feature)
  }

  // Add cell labels (A1, A2, B1, B2, etc.)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let row = -halfCount; row < halfCount; row++) {
    for (let col = -halfCount; col < halfCount; col++) {
      const cellCenterLon = centerLonLat[0] + (col + 0.5) * lonOffset
      const cellCenterLat = centerLonLat[1] + (row + 0.5) * latOffset

      // Create label
      const labelIndex = row + halfCount
      const colIndex = col + halfCount
      if (labelIndex >= 0 && labelIndex < letters.length) {
        const label = `${letters[labelIndex]}${colIndex + 1}`
        const labelFeature = new Feature({
          geometry: new LineString([fromLonLat([cellCenterLon, cellCenterLat]), fromLonLat([cellCenterLon, cellCenterLat])]),
          type: 'grid-label'
        })
        labelFeature.setStyle(new Style({
          text: new Text({
            text: label,
            font: '12px sans-serif',
            fill: new Fill({ color: gridColor }),
            stroke: new Stroke({ color: 'rgba(255,255,255,0.8)', width: 3 })
          })
        }))
        features.push(labelFeature)
      }
    }
  }

  // Add center marker
  const centerFeature = new Feature({
    geometry: new LineString([
      fromLonLat([centerLonLat[0] - lonOffset * 0.2, centerLonLat[1]]),
      fromLonLat([centerLonLat[0] + lonOffset * 0.2, centerLonLat[1]])
    ]),
    type: 'grid-center'
  })
  centerFeature.setStyle(new Style({
    stroke: new Stroke({
      color: '#ef4444',
      width: 3
    })
  }))
  features.push(centerFeature)

  const centerFeature2 = new Feature({
    geometry: new LineString([
      fromLonLat([centerLonLat[0], centerLonLat[1] - latOffset * 0.2]),
      fromLonLat([centerLonLat[0], centerLonLat[1] + latOffset * 0.2])
    ]),
    type: 'grid-center'
  })
  centerFeature2.setStyle(new Style({
    stroke: new Stroke({
      color: '#ef4444',
      width: 3
    })
  }))
  features.push(centerFeature2)

  return features
}

export function GridOverlayLayer() {
  const map = useMapStore(state => state.map)
  const {
    gridEnabled,
    gridCenter,
    gridSize,
    gridCount,
    gridColor
  } = useRouteRecordingStore()
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null)
  const sourceRef = useRef<VectorSource | null>(null)

  // Create layer on mount
  useEffect(() => {
    if (!map) return

    const source = new VectorSource()
    sourceRef.current = source

    const layer = new VectorLayer({
      source,
      zIndex: 85, // Below routes
      properties: {
        name: 'grid-overlay-layer'
      }
    })

    layerRef.current = layer
    map.addLayer(layer)

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map])

  // Update grid when settings change
  useEffect(() => {
    if (!sourceRef.current || !layerRef.current) return

    sourceRef.current.clear()

    if (!gridEnabled || !gridCenter) {
      layerRef.current.setVisible(false)
      return
    }

    const features = generateGridFeatures(
      gridCenter,
      gridSize,
      gridCount,
      gridColor
    )

    sourceRef.current.addFeatures(features)
    layerRef.current.setVisible(true)
  }, [gridEnabled, gridCenter, gridSize, gridCount, gridColor])

  return null
}

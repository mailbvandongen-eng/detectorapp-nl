import { useEffect, useRef } from 'react'
import { useMapStore } from '../../store'
import { useCustomLayerStore, type CustomLayer, type CustomFeature } from '../../store/customLayerStore'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Feature } from 'ol'
import { Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon } from 'ol/geom'
import type { Geometry } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { Style, Circle, Fill, Stroke, Text } from 'ol/style'

/**
 * Create OpenLayers geometry from GeoJSON geometry
 */
function createGeometry(geoJsonGeometry: CustomFeature['geometry']): Geometry | null {
  const { type, coordinates } = geoJsonGeometry

  // Transform coordinates from WGS84 to Web Mercator
  const transformCoords = (coords: number[]): number[] => {
    return fromLonLat(coords)
  }

  const transformCoordsArray = (coords: number[][]): number[][] => {
    return coords.map(transformCoords)
  }

  const transformCoordsArray2 = (coords: number[][][]): number[][][] => {
    return coords.map(transformCoordsArray)
  }

  const transformCoordsArray3 = (coords: number[][][][]): number[][][][] => {
    return coords.map(transformCoordsArray2)
  }

  switch (type) {
    case 'Point':
      return new Point(transformCoords(coordinates as number[]))
    case 'LineString':
      return new LineString(transformCoordsArray(coordinates as number[][]))
    case 'Polygon':
      return new Polygon(transformCoordsArray2(coordinates as number[][][]))
    case 'MultiPoint':
      return new MultiPoint(transformCoordsArray(coordinates as number[][]))
    case 'MultiLineString':
      return new MultiLineString(transformCoordsArray2(coordinates as number[][][]))
    case 'MultiPolygon':
      return new MultiPolygon(transformCoordsArray3(coordinates as number[][][][]))
    default:
      console.warn(`Unsupported geometry type: ${type}`)
      return null
  }
}

/**
 * Create style for a feature based on layer settings and geometry type
 */
function createStyle(layer: CustomLayer, geometryType: string, resolution: number): Style {
  const color = layer.color

  // Calculate size based on resolution (zoom)
  const baseRadius = 10
  const minRadius = 5
  const maxRadius = 14

  let radius = baseRadius
  if (resolution > 50) {
    radius = minRadius
  } else if (resolution > 10) {
    radius = Math.max(minRadius, baseRadius - (resolution - 10) / 10)
  } else if (resolution < 2) {
    radius = maxRadius
  }

  // Point style
  if (geometryType === 'Point' || geometryType === 'MultiPoint') {
    return new Style({
      image: new Circle({
        radius,
        fill: new Fill({ color }),
        stroke: new Stroke({ color: '#ffffff', width: 2 })
      })
    })
  }

  // Line style
  if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
    return new Style({
      stroke: new Stroke({
        color,
        width: 3
      })
    })
  }

  // Polygon style
  if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
    // Create semi-transparent fill
    const fillColor = hexToRgba(color, 0.3)
    return new Style({
      fill: new Fill({ color: fillColor }),
      stroke: new Stroke({
        color,
        width: 2
      })
    })
  }

  // Fallback
  return new Style({
    image: new Circle({
      radius,
      fill: new Fill({ color }),
      stroke: new Stroke({ color: '#ffffff', width: 2 })
    })
  })
}

/**
 * Convert hex color to rgba
 */
function hexToRgba(hex: string, alpha: number): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    const r = parseInt(result[1], 16)
    const g = parseInt(result[2], 16)
    const b = parseInt(result[3], 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return hex
}

/**
 * Renders custom layers on the map
 * This is a render-less component that manages OpenLayers layers
 */
export function CustomLayerMarkers() {
  const map = useMapStore(state => state.map)
  const layers = useCustomLayerStore(state => state.layers)
  const layersRef = useRef<Map<string, VectorLayer<VectorSource>>>(new Map())

  // Create/update layers
  useEffect(() => {
    if (!map) return

    // Track which layers we've processed
    const processedIds = new Set<string>()

    layers.forEach(layer => {
      processedIds.add(layer.id)

      // Create vector source with features
      const source = new VectorSource()

      layer.features.features.forEach((geoJsonFeature, index) => {
        if (!geoJsonFeature.geometry) return

        const geometry = createGeometry(geoJsonFeature.geometry)
        if (!geometry) return

        const feature = new Feature({
          geometry,
          properties: geoJsonFeature.properties,
          layerId: layer.id,
          featureIndex: index
        })

        // Set zoom-dependent style
        feature.setStyle((_, resolution) => {
          return createStyle(layer, geoJsonFeature.geometry.type, resolution)
        })

        source.addFeature(feature)
      })

      // Check if layer already exists
      const existingLayer = layersRef.current.get(layer.id)

      if (existingLayer) {
        // Update existing layer
        existingLayer.setSource(source)
        existingLayer.setVisible(layer.visible)
        existingLayer.setOpacity(layer.opacity)
      } else {
        // Create new layer
        const vectorLayer = new VectorLayer({
          source,
          zIndex: 900, // Below Mijn Vondsten (1000)
          visible: layer.visible,
          opacity: layer.opacity,
          properties: {
            title: layer.name,
            customLayerId: layer.id
          }
        })

        map.addLayer(vectorLayer)
        layersRef.current.set(layer.id, vectorLayer)
      }
    })

    // Remove layers that no longer exist in store
    layersRef.current.forEach((vectorLayer, id) => {
      if (!processedIds.has(id)) {
        map.removeLayer(vectorLayer)
        layersRef.current.delete(id)
      }
    })
  }, [map, layers])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (map) {
        layersRef.current.forEach(vectorLayer => {
          map.removeLayer(vectorLayer)
        })
        layersRef.current.clear()
      }
    }
  }, [map])

  return null // Render-less component
}

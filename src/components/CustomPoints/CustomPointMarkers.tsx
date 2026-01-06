import { useEffect, useRef } from 'react'
import { useMapStore, useSettingsStore } from '../../store'
import { useCustomPointLayerStore, type FeatureGeometry } from '../../store/customPointLayerStore'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Feature } from 'ol'
import { Point, LineString, Polygon, MultiPoint, MultiLineString, MultiPolygon } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { Style, Circle, Fill, Stroke, Text } from 'ol/style'
import type { Geometry } from 'ol/geom'

// Category icons (first letter)
const CATEGORY_LABELS: Record<string, string> = {
  'Mineraal': 'M',
  'Fossiel': 'F',
  'Erfgoed': 'E',
  'Monument': 'Mo',
  'Overig': '•'
}

// Helper to convert FeatureGeometry (WGS84) to OpenLayers geometry (EPSG:3857)
function createOLGeometry(geometry: FeatureGeometry): Geometry {
  const { type, coordinates } = geometry

  // Transform coordinates from WGS84 [lon, lat] to Web Mercator
  const transformCoords = (coords: any): any => {
    if (typeof coords[0] === 'number') {
      // Single coordinate [lon, lat]
      return fromLonLat(coords as [number, number])
    }
    // Nested array - recurse
    return coords.map(transformCoords)
  }

  const webMercatorCoords = transformCoords(coordinates)

  switch (type) {
    case 'Point':
      return new Point(webMercatorCoords)
    case 'LineString':
      return new LineString(webMercatorCoords)
    case 'Polygon':
      return new Polygon(webMercatorCoords)
    case 'MultiPoint':
      return new MultiPoint(webMercatorCoords)
    case 'MultiLineString':
      return new MultiLineString(webMercatorCoords)
    case 'MultiPolygon':
      return new MultiPolygon(webMercatorCoords)
    default:
      // Fallback to point
      return new Point(fromLonLat(coordinates as [number, number]))
  }
}

export function CustomPointMarkers() {
  const map = useMapStore(state => state.map)
  const layers = useCustomPointLayerStore(state => state.layers)
  const showCustomPointLayers = useSettingsStore(state => state.showCustomPointLayers)
  const layersRef = useRef<Map<string, VectorLayer<VectorSource>>>(new Map())

  useEffect(() => {
    if (!map) return

    const existingLayerIds = new Set(layers.map(l => l.id))

    // Remove layers that no longer exist
    layersRef.current.forEach((layer, id) => {
      if (!existingLayerIds.has(id)) {
        map.removeLayer(layer)
        layersRef.current.delete(id)
      }
    })

    // Add/update layers
    layers.forEach(customLayer => {
      const source = new VectorSource()

      // Add features for each point
      customLayer.points.forEach(point => {
        // Use full geometry if available, otherwise create point from coordinates
        let olGeometry: Geometry
        const hasFullGeometry = point.geometry && point.geometry.type !== 'Point'

        if (point.geometry) {
          olGeometry = createOLGeometry(point.geometry)
        } else {
          olGeometry = new Point(fromLonLat(point.coordinates))
        }

        const feature = new Feature({
          geometry: olGeometry,
          // Store data for popup
          layerType: 'customPoint',
          customPoint: point,
          customLayerId: customLayer.id,
          customLayerName: customLayer.name,
          customLayerColor: customLayer.color
        })

        const label = CATEGORY_LABELS[point.category] || point.category.charAt(0).toUpperCase()

        // Style depends on geometry type
        if (hasFullGeometry) {
          // Style for polygons, lines, etc.
          const geometryType = point.geometry!.type
          feature.setStyle(() => {
            if (geometryType === 'Polygon' || geometryType === 'MultiPolygon') {
              return new Style({
                fill: new Fill({ color: customLayer.color + '40' }), // 25% opacity fill
                stroke: new Stroke({ color: customLayer.color, width: 2 })
              })
            } else if (geometryType === 'LineString' || geometryType === 'MultiLineString') {
              return new Style({
                stroke: new Stroke({ color: customLayer.color, width: 3 })
              })
            }
            // MultiPoint or other - use circle style
            return new Style({
              image: new Circle({
                radius: 8,
                fill: new Fill({ color: customLayer.color }),
                stroke: new Stroke({ color: '#ffffff', width: 2 })
              })
            })
          })
        } else {
          // Zoom-dependent style function for points
          feature.setStyle((_, resolution) => {
            const baseRadius = 12
            const minRadius = 6
            const maxRadius = 14

            let radius = baseRadius
            if (resolution > 50) {
              radius = minRadius
            } else if (resolution > 10) {
              radius = Math.max(minRadius, baseRadius - (resolution - 10) / 10)
            } else if (resolution < 2) {
              radius = maxRadius
            }

            const fontSize = Math.max(8, Math.min(12, radius - 2))

            return new Style({
              image: new Circle({
                radius,
                fill: new Fill({ color: customLayer.color }),
                stroke: new Stroke({ color: '#ffffff', width: radius > 8 ? 2 : 1 })
              }),
              text: radius >= 8 ? new Text({
                text: label,
                font: `bold ${fontSize}px sans-serif`,
                fill: new Fill({ color: '#ffffff' }),
                offsetY: 1
              }) : undefined
            })
          })
        }

        source.addFeature(feature)
      })

      // Check if layer exists
      const existingLayer = layersRef.current.get(customLayer.id)

      if (existingLayer) {
        // Update existing layer - combine global toggle with individual layer visibility
        existingLayer.setSource(source)
        existingLayer.setVisible(showCustomPointLayers && customLayer.visible)
      } else {
        // Create new layer - combine global toggle with individual layer visibility
        const vectorLayer = new VectorLayer({
          source,
          zIndex: 950, // Between imported layers (900) and vondsten (1000)
          properties: {
            title: customLayer.name,
            customPointLayerId: customLayer.id
          },
          visible: showCustomPointLayers && customLayer.visible
        })
        map.addLayer(vectorLayer)
        layersRef.current.set(customLayer.id, vectorLayer)
      }
    })

    return () => {
      // Cleanup all layers on unmount
      layersRef.current.forEach(layer => {
        if (map) map.removeLayer(layer)
      })
      layersRef.current.clear()
    }
  }, [map, layers, showCustomPointLayers])

  return null // Render-less component
}

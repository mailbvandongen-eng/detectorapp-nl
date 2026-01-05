import { useEffect, useRef } from 'react'
import { useMapStore, useSettingsStore } from '../../store'
import { useCustomPointLayerStore } from '../../store/customPointLayerStore'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { Style, Circle, Fill, Stroke, Text } from 'ol/style'

// Category icons (first letter)
const CATEGORY_LABELS: Record<string, string> = {
  'Mineraal': 'M',
  'Fossiel': 'F',
  'Erfgoed': 'E',
  'Monument': 'Mo',
  'Overig': '•'
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
        const feature = new Feature({
          geometry: new Point(fromLonLat(point.coordinates)),
          // Store data for popup
          layerType: 'customPoint',
          customPoint: point,
          customLayerId: customLayer.id,
          customLayerName: customLayer.name,
          customLayerColor: customLayer.color
        })

        const label = CATEGORY_LABELS[point.category] || point.category.charAt(0).toUpperCase()

        // Zoom-dependent style function
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

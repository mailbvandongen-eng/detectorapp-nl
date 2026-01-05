import { useEffect, useRef } from 'react'
import { useMapStore, useSettingsStore } from '../../store'
import { useLocalVondstenStore } from '../../store/localVondstenStore'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { Style, Circle, Fill, Stroke, Text } from 'ol/style'

// Icon colors per object type
const TYPE_COLORS: Record<string, string> = {
  'Munt': '#f59e0b',      // amber
  'Aardewerk': '#a16207', // brown
  'Gesp': '#6b7280',      // gray
  'Fibula': '#8b5cf6',    // purple
  'Ring': '#ec4899',      // pink
  'Speld': '#6366f1',     // indigo
  'Sieraad': '#f43f5e',   // rose
  'Gereedschap': '#64748b', // slate
  'Wapen': '#ef4444',     // red
  'Anders': '#3b82f6'     // blue
}

// Short labels for markers
const TYPE_LABELS: Record<string, string> = {
  'Munt': 'M',
  'Aardewerk': 'A',
  'Gesp': 'G',
  'Fibula': 'F',
  'Ring': 'R',
  'Speld': 'S',
  'Sieraad': 'Si',
  'Gereedschap': 'Gr',
  'Wapen': 'W',
  'Anders': '?'
}

export function LocalVondstMarkers() {
  const map = useMapStore(state => state.map)
  const vondsten = useLocalVondstenStore(state => state.vondsten)
  const showLocalVondsten = useSettingsStore(state => state.showLocalVondsten)
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null)

  // Create/update layer with markers
  useEffect(() => {
    if (!map) return

    // Create vector source with markers
    const source = new VectorSource()

    // Add features for each vondst
    vondsten.forEach(vondst => {
      const feature = new Feature({
        geometry: new Point(fromLonLat([vondst.location.lng, vondst.location.lat])),
        vondst: vondst // Store vondst data on feature for popup
      })

      const color = TYPE_COLORS[vondst.objectType] || TYPE_COLORS['Anders']
      const label = TYPE_LABELS[vondst.objectType] || '?'

      // Zoom-dependent style function
      feature.setStyle((feature, resolution) => {
        // Calculate radius based on resolution (zoom)
        // Higher resolution = zoomed out = smaller icons
        const baseRadius = 12
        const minRadius = 6
        const maxRadius = 14

        // resolution ~1 at zoom 17, ~150 at zoom 10, ~2500 at zoom 5
        let radius = baseRadius
        if (resolution > 50) {
          radius = minRadius // Very zoomed out
        } else if (resolution > 10) {
          radius = Math.max(minRadius, baseRadius - (resolution - 10) / 10)
        } else if (resolution < 2) {
          radius = maxRadius // Very zoomed in
        }

        const fontSize = Math.max(8, Math.min(12, radius - 2))

        return new Style({
          image: new Circle({
            radius,
            fill: new Fill({ color }),
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

    // Create or update layer
    if (layerRef.current) {
      layerRef.current.setSource(source)
    } else {
      layerRef.current = new VectorLayer({
        source,
        zIndex: 1000,
        properties: { title: 'Mijn Vondsten' }
      })
      layerRef.current.setVisible(showLocalVondsten)
      map.addLayer(layerRef.current)
    }

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
    }
  }, [map, vondsten])

  // Update visibility when toggled
  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.setVisible(showLocalVondsten)
    }
  }, [showLocalVondsten])

  return null // This is a render-less component
}

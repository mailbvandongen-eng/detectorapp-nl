import { useEffect, useRef } from 'react'
import { useMapStore } from '../../store/mapStore'
import { useParkingStore } from '../../store/parkingStore'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat } from 'ol/proj'
import { Style, Icon, Text, Fill, Stroke } from 'ol/style'

// Car icon as data URL (amber/orange color)
const carIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="%23f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>`

export function ParkingMarker() {
  const map = useMapStore(state => state.map)
  const parkingLocation = useParkingStore(state => state.parkingLocation)
  const layerRef = useRef<VectorLayer<VectorSource> | null>(null)

  useEffect(() => {
    if (!map) return

    // Create source and layer
    const source = new VectorSource()
    const layer = new VectorLayer({
      source,
      zIndex: 950, // Above most layers but below GPS marker
      properties: { name: 'parking-marker' }
    })

    map.addLayer(layer)
    layerRef.current = layer

    return () => {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map])

  // Update marker when parking location changes
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    const source = layer.getSource()
    if (!source) return

    source.clear()

    if (!parkingLocation) return

    // Create parking marker feature
    const feature = new Feature({
      geometry: new Point(fromLonLat([parkingLocation.lng, parkingLocation.lat])),
      type: 'parking'
    })

    // Style with car icon and label
    feature.setStyle(new Style({
      image: new Icon({
        src: `data:image/svg+xml,${encodeURIComponent(carIconSvg.replace(/%23/g, '#'))}`,
        scale: 1.2,
        anchor: [0.5, 0.5]
      }),
      text: new Text({
        text: 'Auto',
        offsetY: 24,
        font: 'bold 11px sans-serif',
        fill: new Fill({ color: '#78350f' }),
        stroke: new Stroke({ color: '#ffffff', width: 3 }),
        padding: [2, 4, 2, 4]
      })
    }))

    source.addFeature(feature)
  }, [parkingLocation])

  return null
}

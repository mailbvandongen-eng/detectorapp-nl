import { useEffect, useRef } from 'react'
import { Feature } from 'ol'
import { LineString, Point } from 'ol/geom'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Style, Stroke, Fill, Circle as CircleStyle, Icon } from 'ol/style'
import { fromLonLat } from 'ol/proj'
import { useMapStore } from '../../store/mapStore'
import { useNavigationStore } from '../../store/navigationStore'

export function RouteLayer() {
  const map = useMapStore(state => state.map)
  const routeCoordinates = useNavigationStore(state => state.routeCoordinates)
  const destination = useNavigationStore(state => state.destination)
  const isNavigating = useNavigationStore(state => state.isNavigating)

  const layerRef = useRef<VectorLayer<VectorSource> | null>(null)

  useEffect(() => {
    if (!map) return

    // Create route layer
    const source = new VectorSource()
    layerRef.current = new VectorLayer({
      source,
      zIndex: 500 // Below GPS marker (1000) but above other layers
    })

    map.addLayer(layerRef.current)

    return () => {
      if (layerRef.current && map) {
        map.removeLayer(layerRef.current)
      }
    }
  }, [map])

  // Update route when coordinates change
  useEffect(() => {
    if (!layerRef.current) return

    const source = layerRef.current.getSource()
    if (!source) return

    // Clear previous route
    source.clear()

    if (!isNavigating || !routeCoordinates || routeCoordinates.length === 0) {
      return
    }

    // Convert coordinates to OpenLayers format
    const olCoords = routeCoordinates.map(coord =>
      fromLonLat([coord.lng, coord.lat])
    )

    // Create route line
    const routeLine = new Feature({
      geometry: new LineString(olCoords)
    })

    // Google Maps style route: blue line with white border
    routeLine.setStyle([
      // White border (drawn first, underneath)
      new Style({
        stroke: new Stroke({
          color: 'white',
          width: 8,
          lineCap: 'round',
          lineJoin: 'round'
        })
      }),
      // Blue route line
      new Style({
        stroke: new Stroke({
          color: '#4285F4',
          width: 5,
          lineCap: 'round',
          lineJoin: 'round'
        })
      })
    ])

    source.addFeature(routeLine)

    // Add destination marker
    if (destination) {
      const destMarker = new Feature({
        geometry: new Point(fromLonLat([destination.lng, destination.lat]))
      })

      destMarker.setStyle(
        new Style({
          image: new CircleStyle({
            radius: 12,
            fill: new Fill({ color: '#EA4335' }), // Google Red
            stroke: new Stroke({ color: 'white', width: 3 })
          })
        })
      )

      source.addFeature(destMarker)
    }

    // Fit map to route extent
    if (map) {
      const extent = source.getExtent()
      map.getView().fit(extent, {
        padding: [80, 80, 80, 80],
        duration: 500
      })
    }
  }, [map, isNavigating, routeCoordinates, destination])

  return null
}

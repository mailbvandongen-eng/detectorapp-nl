import { useEffect, useRef } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import { fromLonLat } from 'ol/proj'
import { useMapStore } from '../store'
import type { MapViewOptions } from '../types/map'

interface UseMapOptions {
  target: string
  viewOptions?: Partial<MapViewOptions>
}

export function useMap({ target, viewOptions }: UseMapOptions) {
  const mapRef = useRef<Map | null>(null)
  const setMap = useMapStore(state => state.setMap)

  useEffect(() => {
    // Create map only once
    if (!mapRef.current) {
      const defaultView: MapViewOptions = {
        center: [5.1214, 52.0907], // Netherlands center
        zoom: 8,
        rotation: 0,
        minZoom: 3,
        maxZoom: 19,
        ...viewOptions
      }

      const map = new Map({
        target,
        view: new View({
          center: fromLonLat(defaultView.center),
          zoom: defaultView.zoom,
          rotation: defaultView.rotation,
          minZoom: defaultView.minZoom,
          maxZoom: defaultView.maxZoom
        })
      })

      mapRef.current = map
      setMap(map)

      // Expose map globally for extent-based loaders (fossils, etc.)
      ;(window as any).__olMap = map
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined)
        setMap(null)
        ;(window as any).__olMap = null
      }
    }
  }, [target, viewOptions, setMap])

  return mapRef.current
}

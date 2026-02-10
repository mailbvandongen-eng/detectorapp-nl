import { useEffect, useRef } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import { fromLonLat } from 'ol/proj'
import { ScaleLine } from 'ol/control'
import { useMapStore, useSettingsStore } from '../store'
import { isArcGISEngine, engineLog } from '../config/mapEngineConfig'
import type { MapViewOptions } from '../types/map'

interface UseMapOptions {
  target: string
  viewOptions?: Partial<MapViewOptions>
}

/**
 * Hook voor OpenLayers map initialisatie.
 *
 * Bij ArcGIS engine: OL map wordt nog steeds gecreëerd voor legacy layers,
 * maar is onzichtbaar (gebruikt door layerStore voor WMS/Vector layers).
 *
 * Na volledige migratie: deze hook kan verwijderd worden.
 */
export function useMap({ target, viewOptions }: UseMapOptions) {
  const mapRef = useRef<Map | null>(null)
  const scaleLineRef = useRef<ScaleLine | null>(null)
  const setMap = useMapStore(state => state.setMap)
  const showScaleBar = useSettingsStore(state => state.showScaleBar)

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
        controls: [], // Hide default zoom controls - using custom ZoomButtons
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

      engineLog('OpenLayers map created', {
        target,
        isOverlay: isArcGISEngine(),
        center: defaultView.center,
        zoom: defaultView.zoom
      })
    }

    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.setTarget(undefined)
        setMap(null)
        ;(window as any).__olMap = null
        engineLog('OpenLayers map destroyed')
      }
    }
  }, [target, viewOptions, setMap])

  // Handle ScaleLine control based on settings
  // Only show for OpenLayers engine (ArcGIS has its own scale bar)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    // Skip ScaleLine if ArcGIS is primary (ArcGIS handles scale bar)
    if (isArcGISEngine()) {
      if (scaleLineRef.current) {
        map.removeControl(scaleLineRef.current)
        scaleLineRef.current = null
      }
      return
    }

    if (showScaleBar) {
      // Add ScaleLine if not already added
      if (!scaleLineRef.current) {
        scaleLineRef.current = new ScaleLine({
          units: 'metric',
          bar: false,
          text: true,
          minWidth: 80
        })
        map.addControl(scaleLineRef.current)
      }
    } else {
      // Remove ScaleLine if present
      if (scaleLineRef.current) {
        map.removeControl(scaleLineRef.current)
        scaleLineRef.current = null
      }
    }
  }, [showScaleBar])

  return mapRef.current
}

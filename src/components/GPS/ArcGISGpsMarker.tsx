/**
 * ArcGIS GPS Marker Component
 *
 * Vervangt de OpenLayers GpsMarker wanneer arcgisGPS feature flag enabled is.
 * Gebruikt GraphicsLayer met Point graphics voor marker en accuracy circle.
 */

import { useEffect, useRef, useCallback } from 'react'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Graphic from '@arcgis/core/Graphic'
import Point from '@arcgis/core/geometry/Point'
import Circle from '@arcgis/core/geometry/Circle'
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol'
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol'
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol'
import { useMapStore, useGPSStore } from '../../store'
import { useSettingsStore } from '../../store/settingsStore'
import { engineLog } from '../../config/mapEngineConfig'

// Arrow SVG - rotates with heading to show direction
const createArrowSVG = (rotation: number) => {
  // SVG needs rotation in the transform
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <g transform="rotate(${rotation}, 24, 24)">
      <polygon points="24,6 38,38 24,30 10,38" fill="#4285F4" stroke="white" stroke-width="3" stroke-linejoin="round"/>
    </g>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// Passive dot symbol - small blue circle (Google Maps style)
const DOT_SYMBOL = new SimpleMarkerSymbol({
  style: 'circle',
  color: [66, 133, 244, 1], // #4285F4
  size: 14,
  outline: {
    color: [255, 255, 255, 1],
    width: 2.5
  }
})

// Accuracy circle symbol
const ACCURACY_SYMBOL = new SimpleFillSymbol({
  color: [66, 133, 244, 0.12], // rgba(66, 133, 244, 0.12)
  outline: {
    color: [66, 133, 244, 0.3],
    width: 1
  }
})

export function ArcGISGpsMarker() {
  const arcgisView = useMapStore(state => state.arcgisView)
  const goTo = useMapStore(state => state.goTo)

  const position = useGPSStore(state => state.position)
  const accuracy = useGPSStore(state => state.accuracy)
  const tracking = useGPSStore(state => state.tracking)
  const smoothHeading = useGPSStore(state => state.smoothHeading)
  const navigationMode = useGPSStore(state => state.navigationMode)
  const firstFix = useGPSStore(state => state.firstFix)
  const resetFirstFix = useGPSStore(state => state.resetFirstFix)
  const centerOnUser = useGPSStore(state => state.config.centerOnUser)

  const showAccuracyCircle = useSettingsStore(state => state.showAccuracyCircle)

  // Refs for graphics and layer
  const layerRef = useRef<GraphicsLayer | null>(null)
  const markerGraphicRef = useRef<Graphic | null>(null)
  const accuracyGraphicRef = useRef<Graphic | null>(null)
  const isInitialized = useRef(false)

  // Create arrow symbol with rotation
  const createArrowSymbol = useCallback((heading: number) => {
    return new PictureMarkerSymbol({
      url: createArrowSVG(heading),
      width: 40,
      height: 40
    })
  }, [])

  // Initialize GPS layer
  useEffect(() => {
    if (!arcgisView?.map || isInitialized.current) return

    engineLog('Initializing ArcGIS GPS layer...')

    // Create graphics layer for GPS
    const gpsLayer = new GraphicsLayer({
      id: 'gps-layer',
      title: 'GPS Position',
      listMode: 'hide' // Don't show in layer list
    })

    // Add to map at high z-index
    arcgisView.map.add(gpsLayer)
    layerRef.current = gpsLayer
    isInitialized.current = true

    engineLog('ArcGIS GPS layer initialized')

    return () => {
      if (layerRef.current && arcgisView?.map) {
        arcgisView.map.remove(layerRef.current)
        layerRef.current = null
        isInitialized.current = false
        engineLog('ArcGIS GPS layer removed')
      }
    }
  }, [arcgisView])

  // Update position and marker
  useEffect(() => {
    if (!layerRef.current || !position) return

    const point = new Point({
      longitude: position.lng,
      latitude: position.lat,
      spatialReference: { wkid: 4326 }
    })

    // Create or update accuracy circle
    if (tracking && showAccuracyCircle && accuracy && accuracy > 0) {
      const circle = new Circle({
        center: point,
        radius: accuracy,
        radiusUnit: 'meters',
        geodesic: true
      })

      if (accuracyGraphicRef.current) {
        // Update existing graphic
        accuracyGraphicRef.current.geometry = circle
        accuracyGraphicRef.current.visible = true
      } else {
        // Create new accuracy graphic
        const accuracyGraphic = new Graphic({
          geometry: circle,
          symbol: ACCURACY_SYMBOL
        })
        layerRef.current.add(accuracyGraphic)
        accuracyGraphicRef.current = accuracyGraphic
      }
    } else if (accuracyGraphicRef.current) {
      // Hide accuracy circle
      accuracyGraphicRef.current.visible = false
    }

    // Create or update marker
    // In heading-up mode: kaart roteert, dus pijl moet altijd omhoog (0 graden)
    // In free mode: kaart is noord-georiënteerd, dus pijl toont heading
    const arrowRotation = navigationMode === 'headingUp' ? 0 : (smoothHeading ?? 0)
    const symbol = tracking
      ? createArrowSymbol(arrowRotation)
      : DOT_SYMBOL

    if (markerGraphicRef.current) {
      // Update existing graphic
      markerGraphicRef.current.geometry = point
      markerGraphicRef.current.symbol = symbol
    } else {
      // Create new marker graphic
      const markerGraphic = new Graphic({
        geometry: point,
        symbol: symbol
      })
      layerRef.current.add(markerGraphic)
      markerGraphicRef.current = markerGraphic
    }
  }, [position, accuracy, tracking, smoothHeading, showAccuracyCircle, createArrowSymbol])

  // Handle first fix - center map on position
  useEffect(() => {
    if (!arcgisView || !position || !firstFix || !tracking) return

    engineLog('GPS first fix - centering map')
    goTo({ center: [position.lng, position.lat], zoom: 17, animate: false })
    resetFirstFix()
  }, [arcgisView, position, firstFix, tracking, goTo, resetFirstFix])

  // Center on user when tracking
  useEffect(() => {
    if (!arcgisView || !position || !tracking || firstFix || !centerOnUser) return

    goTo({ center: [position.lng, position.lat], animate: true })
  }, [arcgisView, position, tracking, firstFix, centerOnUser, goTo])

  // Update arrow rotation when heading changes
  useEffect(() => {
    if (!markerGraphicRef.current || !tracking || smoothHeading === null) return

    // In heading-up mode: kaart roteert, dus pijl moet altijd omhoog (0 graden)
    // In free mode: kaart is noord-georiënteerd, dus pijl toont heading
    const arrowRotation = navigationMode === 'headingUp' ? 0 : smoothHeading
    markerGraphicRef.current.symbol = createArrowSymbol(arrowRotation)
  }, [smoothHeading, tracking, navigationMode, createArrowSymbol])

  // Heading-up mode: rotate map so heading direction is "up"
  useEffect(() => {
    if (!arcgisView || !tracking) return

    if (navigationMode === 'headingUp' && smoothHeading !== null) {
      goTo({ rotation: -smoothHeading, animate: true })
    }
  }, [arcgisView, tracking, navigationMode, smoothHeading, goTo])

  // Reset map rotation when leaving heading-up mode
  useEffect(() => {
    if (!arcgisView) return

    if (navigationMode === 'free') {
      goTo({ rotation: 0, animate: true })
    }
  }, [arcgisView, navigationMode, goTo])

  return null
}

export default ArcGISGpsMarker

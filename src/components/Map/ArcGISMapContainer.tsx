/**
 * ArcGIS MapContainer - Primaire kaart engine
 *
 * Na volledige migratie vervangt dit MapContainer.tsx volledig.
 * Huidige fase: Base layers + AHN ImageryLayers
 *
 * @see Plan: C:\Users\bobva\.claude\plans\silly-wiggling-sphinx.md
 */
import { useEffect, useRef, useState } from 'react'
import EsriMap from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import Basemap from '@arcgis/core/Basemap'
import WebTileLayer from '@arcgis/core/layers/WebTileLayer'
import VectorTileLayer from '@arcgis/core/layers/VectorTileLayer'
import TileLayer from '@arcgis/core/layers/TileLayer'
import ScaleBar from '@arcgis/core/widgets/ScaleBar'
import { useMapStore, useSettingsStore, useGPSStore } from '../../store'
import { engineLog } from '../../config/mapEngineConfig'

// Base layer configuration
const BASE_LAYERS = {
  'CartoDB (licht)': {
    type: 'webtile',
    url: 'https://{subDomain}.basemaps.cartocdn.com/light_all/{level}/{col}/{row}.png',
    subDomains: ['a', 'b', 'c', 'd'],
    copyright: '© OpenStreetMap contributors © CARTO'
  },
  'OpenStreetMap': {
    type: 'webtile',
    url: 'https://{subDomain}.tile.openstreetmap.org/{level}/{col}/{row}.png',
    subDomains: ['a', 'b', 'c'],
    copyright: '© OpenStreetMap contributors'
  },
  'Luchtfoto': {
    type: 'webtile',
    url: 'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/EPSG:3857/{level}/{col}/{row}.jpeg',
    subDomains: [],
    copyright: '© Kadaster / PDOK Luchtfoto'
  },
  'TMK 1850': {
    type: 'webtile',
    url: 'https://s.map5.nl/map/gast/tiles/tmk_1850/EPSG3857/{level}/{col}/{row}.png',
    subDomains: [],
    copyright: '© Kadaster / Map5.nl',
    maxScale: 4514 // ~zoom 14
  },
  'Bonnebladen 1900': {
    type: 'webtile',
    url: 'https://s.map5.nl/map/gast/tiles/bonne_1900/EPSG3857/{level}/{col}/{row}.png',
    subDomains: [],
    copyright: '© Kadaster / Map5.nl',
    maxScale: 4514 // ~zoom 14
  }
} as const

type BaseLayerName = keyof typeof BASE_LAYERS

interface ArcGISMapContainerProps {
  defaultBackground?: string
}

export function ArcGISMapContainer({ defaultBackground = 'CartoDB (licht)' }: ArcGISMapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<MapView | null>(null)
  const scaleBarRef = useRef<ScaleBar | null>(null)
  const [isReady, setIsReady] = useState(false)

  const setArcGISMap = useMapStore(state => state.setArcGISMap)
  const setCenter = useMapStore(state => state.setCenter)
  const setZoom = useMapStore(state => state.setZoom)
  const showScaleBar = useSettingsStore(state => state.showScaleBar)
  const settingsDefaultBg = useSettingsStore(state => state.defaultBackground)
  const gpsAutoStart = useSettingsStore(state => state.gpsAutoStart)
  const startTracking = useGPSStore(state => state.startTracking)

  // Use settings default or prop
  const activeBg = settingsDefaultBg || defaultBackground

  // Initialize ArcGIS MapView
  useEffect(() => {
    if (!containerRef.current || viewRef.current) return

    engineLog('Initializing ArcGIS MapView...')

    // Create base layer
    const baseLayerConfig = BASE_LAYERS[activeBg as BaseLayerName] || BASE_LAYERS['CartoDB (licht)']
    const baseLayer = createBaseLayer(activeBg as BaseLayerName, baseLayerConfig)

    // Create basemap with the layer
    const basemap = new Basemap({
      baseLayers: [baseLayer],
      title: activeBg
    })

    // Create map
    const map = new EsriMap({
      basemap
    })

    // Create view
    const view = new MapView({
      container: containerRef.current,
      map,
      center: [5.1214, 52.0907], // Netherlands center [lon, lat]
      zoom: 8,
      constraints: {
        minZoom: 3,
        maxZoom: 19,
        rotationEnabled: true
      },
      ui: {
        components: ['attribution'] // Only show attribution, no zoom/compass
      }
    })

    viewRef.current = view

    // Wait for view to be ready
    view.when(() => {
      engineLog('ArcGIS MapView ready', {
        center: [view.center?.longitude, view.center?.latitude],
        zoom: view.zoom
      })

      // Store in Zustand
      setArcGISMap(map, view)
      setIsReady(true)

      // Sync view changes to store
      view.watch('center', (center) => {
        if (center) {
          setCenter([center.longitude, center.latitude])
        }
      })

      view.watch('zoom', (zoom) => {
        if (zoom !== undefined) {
          setZoom(zoom)
        }
      })

      // GPS autostart
      if (gpsAutoStart) {
        setTimeout(() => {
          startTracking()
          engineLog('GPS autostart - tracking started')
        }, 500)
      }
    }).catch((error: Error) => {
      console.error('❌ ArcGIS MapView initialization failed:', error)
    })

    // Cleanup
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy()
        viewRef.current = null
        engineLog('ArcGIS MapView destroyed')
      }
    }
  }, []) // Only run once

  // Handle ScaleBar widget
  useEffect(() => {
    const view = viewRef.current
    if (!view || !isReady) return

    if (showScaleBar) {
      if (!scaleBarRef.current) {
        scaleBarRef.current = new ScaleBar({
          view,
          unit: 'metric',
          style: 'line'
        })
        view.ui.add(scaleBarRef.current, 'bottom-left')
        engineLog('ScaleBar added')
      }
    } else {
      if (scaleBarRef.current) {
        view.ui.remove(scaleBarRef.current)
        scaleBarRef.current.destroy()
        scaleBarRef.current = null
        engineLog('ScaleBar removed')
      }
    }
  }, [showScaleBar, isReady])

  // Handle basemap changes
  useEffect(() => {
    const view = viewRef.current
    if (!view || !isReady) return

    const baseLayerConfig = BASE_LAYERS[activeBg as BaseLayerName]
    if (!baseLayerConfig) {
      engineLog('Unknown basemap:', activeBg)
      return
    }

    const baseLayer = createBaseLayer(activeBg as BaseLayerName, baseLayerConfig)
    const basemap = new Basemap({
      baseLayers: [baseLayer],
      title: activeBg
    })

    view.map.basemap = basemap
    engineLog('Basemap changed to:', activeBg)
  }, [activeBg, isReady])

  return (
    <div
      ref={containerRef}
      id="arcgis-map-container"
      style={{
        width: '100%',
        height: '100vh',
        position: 'absolute',
        top: 0,
        left: 0
      }}
    />
  )
}

/**
 * Create a base layer from config
 */
function createBaseLayer(name: BaseLayerName, config: typeof BASE_LAYERS[BaseLayerName]) {
  if (config.type === 'webtile') {
    return new WebTileLayer({
      urlTemplate: config.url.replace('{subDomain}', '{subDomain}'),
      subDomains: config.subDomains.length > 0 ? [...config.subDomains] : undefined,
      copyright: config.copyright,
      title: name,
      maxScale: 'maxScale' in config ? config.maxScale : undefined
    })
  }

  // Fallback
  return new WebTileLayer({
    urlTemplate: 'https://{subDomain}.basemaps.cartocdn.com/light_all/{level}/{col}/{row}.png',
    subDomains: ['a', 'b', 'c', 'd'],
    copyright: '© OpenStreetMap contributors © CARTO',
    title: 'CartoDB (licht)'
  })
}

export default ArcGISMapContainer

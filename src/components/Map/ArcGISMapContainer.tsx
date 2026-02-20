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
import TileLayer from '@arcgis/core/layers/TileLayer'
// ScaleBar widget deprecated - using arcgis-scale-bar web component instead
import { useMapStore, useSettingsStore, useGPSStore } from '../../store'
import { engineLog } from '../../config/mapEngineConfig'
import { useArcGISLayers } from '../../hooks/useArcGISLayers'

// Basemap configuration types
type EsriTileConfig = { type: 'esritile'; url: string; copyright: string }
type WebTileConfig = { type: 'webtile'; url: string; subDomains?: string[]; copyright: string; maxScale?: number }
type BasemapConfig = EsriTileConfig | WebTileConfig

// Base layer configuration - using public Esri tile services (no special API key needed)
const BASE_LAYERS: Record<string, BasemapConfig> = {
  'Esri Licht': {
    type: 'esritile',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer',
    copyright: '© Esri'
  },
  'Esri Straten': {
    type: 'esritile',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer',
    copyright: '© Esri'
  },
  'Esri Satelliet': {
    type: 'esritile',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer',
    copyright: '© Esri'
  },
  'Luchtfoto': {
    type: 'webtile',
    url: 'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/EPSG:3857/{level}/{col}/{row}.jpeg',
    copyright: '© Kadaster / PDOK Luchtfoto'
  },
  // Historical maps from Map5.nl (publicly accessible XYZ tiles)
  'TMK 1850': {
    type: 'webtile',
    url: 'https://s.map5.nl/map/gast/tiles/tmk_1850/EPSG3857/{level}/{col}/{row}.png',
    copyright: '© Kadaster / Map5.nl'
  },
  'Bonnebladen 1900': {
    type: 'webtile',
    url: 'https://s.map5.nl/map/gast/tiles/bonne_1900/EPSG3857/{level}/{col}/{row}.png',
    copyright: '© Kadaster / Map5.nl'
  }
}

type BaseLayerName = keyof typeof BASE_LAYERS

interface ArcGISMapContainerProps {
  defaultBackground?: string
}

export function ArcGISMapContainer({ defaultBackground = 'Esri Licht' }: ArcGISMapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<MapView | null>(null)
  const scaleBarRef = useRef<HTMLElement | null>(null)
  const [isReady, setIsReady] = useState(false)

  // Use ArcGIS layers hook for WMS/Vector/Imagery layers
  // The hook internally checks feature flags and manages layer loading/visibility
  useArcGISLayers()

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

    // Create basemap
    const basemap = createBasemap(activeBg)

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
      console.error('ArcGIS MapView initialization failed:', error)
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

  // Handle ScaleBar - using web component instead of deprecated widget
  useEffect(() => {
    const view = viewRef.current
    if (!view || !isReady) return

    if (showScaleBar) {
      if (!scaleBarRef.current) {
        // Create arcgis-scale-bar web component
        const scaleBar = document.createElement('arcgis-scale-bar')
        scaleBar.setAttribute('unit', 'metric')
        ;(scaleBar as any).view = view
        scaleBarRef.current = scaleBar
        view.ui.add(scaleBar, 'bottom-center')
        engineLog('ScaleBar (web component) added')
      }
    } else {
      if (scaleBarRef.current) {
        view.ui.remove(scaleBarRef.current)
        scaleBarRef.current = null
        engineLog('ScaleBar removed')
      }
    }
  }, [showScaleBar, isReady])

  // Handle basemap changes
  useEffect(() => {
    const view = viewRef.current
    if (!view?.map || !isReady) return

    const basemap = createBasemap(activeBg)
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
 * Create a basemap from config - supports Esri TileLayers and custom WebTile
 */
function createBasemap(name: string): Basemap {
  const config = BASE_LAYERS[name] || BASE_LAYERS['Esri Licht']
  engineLog('Creating basemap:', name, config.type)

  if (config.type === 'esritile') {
    // Use Esri TileLayer for ArcGIS Server tile services
    const tileLayer = new TileLayer({
      url: config.url,
      copyright: config.copyright,
      title: name
    })

    return new Basemap({
      baseLayers: [tileLayer],
      title: name
    })
  }

  // Create custom WebTileLayer basemap for standard XYZ/TMS tiles
  const baseLayer = new WebTileLayer({
    urlTemplate: config.url,
    subDomains: config.subDomains,
    copyright: config.copyright,
    title: name,
    maxScale: config.maxScale
  })

  return new Basemap({
    baseLayers: [baseLayer],
    title: name
  })
}

export default ArcGISMapContainer

import { useEffect, useRef, useState } from 'react'
import 'ol/ol.css'
import { Tile as TileLayer } from 'ol/layer'
import { OSM, XYZ } from 'ol/source'
import { useMap } from '../../hooks/useMap'
import { useLayerStore, useMapStore, useSettingsStore, useGPSStore } from '../../store'
import { getImmediateLoadLayers } from '../../layers/layerRegistry'
import { toLonLat } from 'ol/proj'
import { isArcGISEngine, useArcGISFeature, engineLog } from '../../config/mapEngineConfig'

// ArcGIS imports
import EsriMap from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import Basemap from '@arcgis/core/Basemap'
import WebTileLayer from '@arcgis/core/layers/WebTileLayer'
import ScaleBar from '@arcgis/core/widgets/ScaleBar'

// Base layer names
const BASE_LAYERS = [
  'CartoDB (licht)',
  'OpenStreetMap',
  'Luchtfoto',
  'TMK 1850',
  'Bonnebladen 1900'
]

// ArcGIS base layer configurations
const ARCGIS_BASE_LAYERS: Record<string, { url: string; subDomains?: string[]; copyright: string; maxScale?: number }> = {
  'CartoDB (licht)': {
    url: 'https://{subDomain}.basemaps.cartocdn.com/light_all/{level}/{col}/{row}.png',
    subDomains: ['a', 'b', 'c', 'd'],
    copyright: '© OpenStreetMap contributors © CARTO'
  },
  'OpenStreetMap': {
    url: 'https://{subDomain}.tile.openstreetmap.org/{level}/{col}/{row}.png',
    subDomains: ['a', 'b', 'c'],
    copyright: '© OpenStreetMap contributors'
  },
  'Luchtfoto': {
    url: 'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/EPSG:3857/{level}/{col}/{row}.jpeg',
    copyright: '© Kadaster / PDOK Luchtfoto'
  },
  'TMK 1850': {
    url: 'https://s.map5.nl/map/gast/tiles/tmk_1850/EPSG3857/{level}/{col}/{row}.png',
    copyright: '© Kadaster / Map5.nl',
    maxScale: 4514
  },
  'Bonnebladen 1900': {
    url: 'https://s.map5.nl/map/gast/tiles/bonne_1900/EPSG3857/{level}/{col}/{row}.png',
    copyright: '© Kadaster / Map5.nl',
    maxScale: 4514
  }
}

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const arcgisContainerRef = useRef<HTMLDivElement>(null)
  const olContainerRef = useRef<HTMLDivElement>(null)
  const initialBgApplied = useRef(false)
  const arcgisInitialized = useRef(false)
  const scaleBarRef = useRef<ScaleBar | null>(null)
  const [arcgisReady, setArcgisReady] = useState(false)

  // Determine engine mode
  const arcgisIsPrimary = isArcGISEngine()
  const arcgisBaseLayers = useArcGISFeature('arcgisBaseLayers')

  useMap({ target: arcgisIsPrimary ? 'ol-overlay' : 'map' }) // Initialize OpenLayers map
  const map = useMapStore(state => state.map) // Get reactive OL map from store
  const arcgisView = useMapStore(state => state.arcgisView)
  const setArcGISMap = useMapStore(state => state.setArcGISMap)
  const registerLayer = useLayerStore(state => state.registerLayer)
  const setLayerVisibility = useLayerStore(state => state.setLayerVisibility)
  const defaultBackground = useSettingsStore(state => state.defaultBackground)
  const showScaleBar = useSettingsStore(state => state.showScaleBar)

  useEffect(() => {
    if (!map) {
      console.warn('⚠️ Map not initialized yet')
      return
    }

    engineLog('Initializing OL map layers...', { arcgisBaseLayers })

    // Skip OL base layers if ArcGIS handles them
    if (!arcgisBaseLayers) {
      // Base layers (only when OL is primary or ArcGIS doesn't handle basemaps)
      const osmLayer = new TileLayer({
        properties: { title: 'OpenStreetMap', type: 'base' },
        visible: false,
        source: new OSM()
      })

      const cartoDBLayer = new TileLayer({
        properties: { title: 'CartoDB (licht)', type: 'base' },
        visible: true,
        source: new XYZ({
          url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
          attributions: '© OpenStreetMap contributors © CARTO'
        })
      })

      // PDOK Luchtfoto RGB - 8cm resolutie, meest recente jaargang
      const satelliteLayer = new TileLayer({
        properties: { title: 'Luchtfoto', type: 'base' },
        visible: false,
        source: new XYZ({
          url: 'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/EPSG:3857/{z}/{x}/{y}.jpeg',
          attributions: '© Kadaster / PDOK Luchtfoto',
          maxZoom: 19
        })
      })

      // CartoDB labels overlay (for hybrid satellite + labels)
      const labelsLayer = new TileLayer({
        properties: { title: 'Labels Overlay', type: 'overlay' },
        visible: false,
        source: new XYZ({
          url: 'https://{a-d}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png',
          attributions: '© OpenStreetMap contributors © CARTO',
          maxZoom: 20
        }),
        zIndex: 100
      })

      // Historical map layers from Map5.nl
      const tmk1850Layer = new TileLayer({
        properties: { title: 'TMK 1850', type: 'base' },
        visible: false,
        source: new XYZ({
          url: 'https://s.map5.nl/map/gast/tiles/tmk_1850/EPSG3857/{z}/{x}/{y}.png',
          attributions: '© Kadaster / Map5.nl',
          crossOrigin: 'anonymous',
          maxZoom: 14
        })
      })

      const bonne1900Layer = new TileLayer({
        properties: { title: 'Bonnebladen 1900', type: 'base' },
        visible: false,
        source: new XYZ({
          url: 'https://s.map5.nl/map/gast/tiles/bonne_1900/EPSG3857/{z}/{x}/{y}.png',
          attributions: '© Kadaster / Map5.nl',
          crossOrigin: 'anonymous',
          maxZoom: 14
        })
      })

      // Add base layers to map
      map.addLayer(osmLayer)
      map.addLayer(cartoDBLayer)
      map.addLayer(satelliteLayer)
      map.addLayer(labelsLayer)
      map.addLayer(tmk1850Layer)
      map.addLayer(bonne1900Layer)

      // Register base layers in store
      registerLayer('OpenStreetMap', osmLayer)
      registerLayer('CartoDB (licht)', cartoDBLayer)
      registerLayer('Luchtfoto', satelliteLayer)
      registerLayer('Labels Overlay', labelsLayer)
      registerLayer('TMK 1850', tmk1850Layer)
      registerLayer('Bonnebladen 1900', bonne1900Layer)

      engineLog('OL base layers added')
    } else {
      engineLog('Skipping OL base layers (ArcGIS handles basemaps)')
    }

    // Force map to render
    map.updateSize()
    engineLog('OL map ready', {
      size: map.getSize(),
      center: map.getView().getCenter(),
      zoom: map.getView().getZoom()
    })

    // Load immediate-load layers (WMS/Tile layers that load tiles on-demand)
    loadImmediateLayers()

  }, [map, registerLayer, arcgisBaseLayers])

  async function loadImmediateLayers() {
    if (!map) {
      console.error('❌ Cannot load layers: map is null')
      return
    }

    const immediateLoadLayers = getImmediateLoadLayers()
    engineLog(`Loading ${immediateLoadLayers.length} immediate-load layers (WMS/Tile)...`)

    // Load all WMS layers in parallel
    const results = await Promise.allSettled(
      immediateLoadLayers.map(async (layerDef) => {
        try {
          const layer = await layerDef.factory()
          if (layer) {
            return { name: layerDef.name, layer }
          }
          return null
        } catch (error) {
          console.warn(`⚠️ Failed to create ${layerDef.name}:`, error)
          return null
        }
      })
    )

    // Add successful layers to map
    let addedCount = 0
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value) {
        const { name, layer } = result.value
        map.addLayer(layer)
        registerLayer(name, layer)
        addedCount++
      }
    })

    engineLog(`Immediate layers loaded: ${addedCount}/${immediateLoadLayers.length}`)
    engineLog(`Total OL layers: ${map.getLayers().getLength()}`)
  }

  // Initialize ArcGIS Map
  useEffect(() => {
    if (!arcgisContainerRef.current || arcgisInitialized.current) return

    // For primary engine mode, don't wait for OL map
    // For overlay mode, wait for OL map to sync position
    if (!arcgisIsPrimary && !map) return

    engineLog('Initializing ArcGIS MapView...', { isPrimary: arcgisIsPrimary })

    // Get initial view state
    let lonLat: [number, number] = [5.1214, 52.0907]
    let zoom = 8

    if (map) {
      const olView = map.getView()
      const center = olView.getCenter()
      zoom = olView.getZoom() || 8
      lonLat = center ? toLonLat(center) as [number, number] : [5.1214, 52.0907]
    }

    // Create basemap for primary engine mode
    let basemap: Basemap | undefined
    if (arcgisIsPrimary && arcgisBaseLayers) {
      const bgName = defaultBackground || 'CartoDB (licht)'
      const config = ARCGIS_BASE_LAYERS[bgName] || ARCGIS_BASE_LAYERS['CartoDB (licht)']

      const baseLayer = new WebTileLayer({
        urlTemplate: config.url,
        subDomains: config.subDomains,
        copyright: config.copyright,
        title: bgName,
        maxScale: config.maxScale
      })

      basemap = new Basemap({
        baseLayers: [baseLayer],
        title: bgName
      })
    }

    // Create ArcGIS Map
    const esriMap = new EsriMap({
      basemap: basemap // undefined for overlay mode (transparent)
    })

    // Create ArcGIS MapView
    const esriView = new MapView({
      container: arcgisContainerRef.current,
      map: esriMap,
      center: lonLat,
      zoom: zoom,
      constraints: {
        rotationEnabled: true,
        minZoom: 3,
        maxZoom: 19
      },
      ui: {
        components: arcgisIsPrimary ? ['attribution'] : [] // Show attribution only when primary
      },
      // Transparent background for overlay mode
      background: arcgisIsPrimary ? undefined : {
        color: [0, 0, 0, 0]
      }
    })

    // Wait for view to be ready
    esriView.when(() => {
      engineLog('ArcGIS MapView ready', {
        center: [esriView.center?.longitude, esriView.center?.latitude],
        zoom: esriView.zoom,
        isPrimary: arcgisIsPrimary
      })

      setArcGISMap(esriMap, esriView)
      setArcgisReady(true)
      arcgisInitialized.current = true

      // Set up view synchronization
      if (arcgisIsPrimary && map) {
        // ArcGIS is primary: sync ArcGIS → OL
        esriView.watch('center', (center) => {
          if (center && map) {
            const { fromLonLat } = require('ol/proj')
            map.getView().setCenter(fromLonLat([center.longitude, center.latitude]))
          }
        })

        esriView.watch('zoom', (newZoom) => {
          if (newZoom !== undefined && map) {
            map.getView().setZoom(newZoom)
          }
        })

        esriView.watch('rotation', (rotation) => {
          if (rotation !== undefined && map) {
            map.getView().setRotation((rotation * Math.PI) / 180)
          }
        })
      } else if (map) {
        // OL is primary: sync OL → ArcGIS
        const olView = map.getView()

        olView.on('change:center', () => {
          const newCenter = olView.getCenter()
          if (newCenter) {
            const newLonLat = toLonLat(newCenter)
            esriView.goTo({ center: newLonLat }, { animate: false })
          }
        })

        olView.on('change:resolution', () => {
          const newZoom = olView.getZoom()
          if (newZoom !== undefined) {
            esriView.goTo({ zoom: newZoom }, { animate: false })
          }
        })
      }
    }).catch((error: Error) => {
      console.error('❌ ArcGIS MapView initialization failed:', error)
    })

    return () => {
      if (esriView) {
        esriView.destroy()
      }
    }
  }, [map, setArcGISMap, arcgisIsPrimary, arcgisBaseLayers, defaultBackground])

  // Handle ScaleBar for ArcGIS primary mode
  useEffect(() => {
    if (!arcgisIsPrimary || !arcgisReady || !arcgisView) return

    if (showScaleBar) {
      if (!scaleBarRef.current) {
        scaleBarRef.current = new ScaleBar({
          view: arcgisView,
          unit: 'metric',
          style: 'line'
        })
        arcgisView.ui.add(scaleBarRef.current, 'bottom-left')
        engineLog('ScaleBar added')
      }
    } else {
      if (scaleBarRef.current) {
        arcgisView.ui.remove(scaleBarRef.current)
        scaleBarRef.current.destroy()
        scaleBarRef.current = null
        engineLog('ScaleBar removed')
      }
    }
  }, [showScaleBar, arcgisReady, arcgisView, arcgisIsPrimary])

  // Handle basemap changes for ArcGIS primary mode
  useEffect(() => {
    if (!arcgisIsPrimary || !arcgisBaseLayers || !arcgisReady || !arcgisView) return

    const bgName = defaultBackground || 'CartoDB (licht)'
    const config = ARCGIS_BASE_LAYERS[bgName]
    if (!config) {
      engineLog('Unknown basemap:', bgName)
      return
    }

    const baseLayer = new WebTileLayer({
      urlTemplate: config.url,
      subDomains: config.subDomains,
      copyright: config.copyright,
      title: bgName,
      maxScale: config.maxScale
    })

    const basemap = new Basemap({
      baseLayers: [baseLayer],
      title: bgName
    })

    arcgisView.map.basemap = basemap
    engineLog('Basemap changed to:', bgName)
  }, [defaultBackground, arcgisReady, arcgisView, arcgisIsPrimary, arcgisBaseLayers])

  // Apply default background setting on first load (only for OL base layers)
  useEffect(() => {
    // Skip if ArcGIS handles basemaps
    if (arcgisBaseLayers) {
      initialBgApplied.current = true
      return
    }

    if (!map || initialBgApplied.current) return

    // Wait a tick for layers to be registered
    const timer = setTimeout(() => {
      const bgToApply = defaultBackground || 'CartoDB (licht)'

      // Turn off all base layers first
      BASE_LAYERS.forEach(layer => {
        setLayerVisibility(layer, false)
      })

      // Then turn on the default
      if (BASE_LAYERS.includes(bgToApply)) {
        setLayerVisibility(bgToApply, true)
      } else {
        setLayerVisibility('CartoDB (licht)', true)
      }

      initialBgApplied.current = true
      engineLog('Default OL background:', bgToApply)
    }, 100)

    return () => clearTimeout(timer)
  }, [map, defaultBackground, setLayerVisibility, arcgisBaseLayers])

  // GPS autostart on app load
  const gpsAutoStart = useSettingsStore(state => state.gpsAutoStart)
  const startTracking = useGPSStore(state => state.startTracking)
  const gpsStarted = useRef(false)

  useEffect(() => {
    // Wait for appropriate map to be ready
    const mapReady = arcgisIsPrimary ? arcgisReady : !!map
    if (!mapReady || gpsStarted.current) return

    if (gpsAutoStart) {
      const timer = setTimeout(() => {
        startTracking()
        gpsStarted.current = true
        engineLog('GPS autostart - tracking started')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [map, arcgisReady, gpsAutoStart, startTracking, arcgisIsPrimary])

  // Styles based on engine mode
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100vh'
  }

  // ArcGIS primary: ArcGIS on bottom, OL overlay on top (for WMS/Vector layers)
  // OL primary: OL on bottom, ArcGIS overlay on top (for AHN layers)
  const arcgisStyle: React.CSSProperties = arcgisIsPrimary ? {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1
  } : {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    pointerEvents: 'none', // Let OL handle interactions
    opacity: arcgisReady ? 1 : 0,
    transition: 'opacity 0.3s ease'
  }

  const olStyle: React.CSSProperties = arcgisIsPrimary ? {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 10,
    pointerEvents: 'none', // Let ArcGIS handle interactions
    // Hide OL base layers when ArcGIS handles them
    opacity: arcgisBaseLayers ? 0.99 : 1 // Slight opacity to ensure rendering
  } : {
    width: '100%',
    height: '100vh'
  }

  return (
    <div style={containerStyle}>
      {arcgisIsPrimary ? (
        <>
          {/* ArcGIS MapView (primary - handles basemaps and interaction) */}
          <div
            id="arcgis-map"
            ref={arcgisContainerRef}
            style={arcgisStyle}
          />
          {/* OpenLayers Map (overlay - for WMS/Vector layers during migration) */}
          <div
            id="ol-overlay"
            ref={olContainerRef}
            style={olStyle}
          />
        </>
      ) : (
        <>
          {/* OpenLayers Map (primary) */}
          <div
            id="map"
            ref={containerRef}
            style={olStyle}
          />
          {/* ArcGIS MapView Overlay (for AHN layers) */}
          <div
            id="arcgis-map"
            ref={arcgisContainerRef}
            style={arcgisStyle}
          />
        </>
      )}
    </div>
  )
}

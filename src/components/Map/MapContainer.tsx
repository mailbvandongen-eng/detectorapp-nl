import { useEffect, useRef, useState, useCallback } from 'react'
import 'ol/ol.css'
import { Tile as TileLayer } from 'ol/layer'
import { OSM, XYZ } from 'ol/source'
import { useMap } from '../../hooks/useMap'
import { useLayerStore, useMapStore, useSettingsStore, useGPSStore } from '../../store'
import { getImmediateLoadLayers } from '../../layers/layerRegistry'
import { toLonLat, fromLonLat } from 'ol/proj'
import { isArcGISEngine, useArcGISFeature, engineLog } from '../../config/mapEngineConfig'

// ArcGIS imports
import EsriMap from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import Basemap from '@arcgis/core/Basemap'
import WebTileLayer from '@arcgis/core/layers/WebTileLayer'
import EsriTileLayer from '@arcgis/core/layers/TileLayer'
import ScaleBar from '@arcgis/core/widgets/ScaleBar'
import esriConfig from '@arcgis/core/config'

// Base layer names - updated to use Esri basemaps
const BASE_LAYERS = [
  'Esri Licht',
  'Esri Straten',
  'Esri Satelliet',
  'Luchtfoto',
  'TMK 1850',
  'Bonnebladen 1900'
]

// Hybrid basemap types
type EsriTileConfig = { type: 'esritile'; url: string; copyright: string }
type WebTileConfig = { type: 'webtile'; url: string; subDomains?: string[]; copyright: string; maxScale?: number }
type HybridOLConfig = { type: 'hybrid-ol'; olLayerName: string }
type BasemapConfig = EsriTileConfig | WebTileConfig | HybridOLConfig

// ArcGIS base layer configurations - using Esri tile services (no special API key needed)
const ARCGIS_BASE_LAYERS: Record<string, BasemapConfig> = {
  // Esri tile services (public, no extra API privileges required)
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
  // PDOK aerial imagery (high resolution Netherlands)
  'Luchtfoto': {
    type: 'webtile',
    url: 'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_orthoHR/EPSG:3857/{level}/{col}/{row}.jpeg',
    copyright: '© Kadaster / PDOK Luchtfoto'
  },
  // Historical maps - HYBRID: use OL layers (works reliably)
  'TMK 1850': {
    type: 'hybrid-ol',
    olLayerName: 'TMK 1850'
  },
  'Bonnebladen 1900': {
    type: 'hybrid-ol',
    olLayerName: 'Bonnebladen 1900'
  }
}

// Netherlands center
const NL_CENTER: [number, number] = [5.1214, 52.0907]
const NL_ZOOM = 8

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const arcgisContainerRef = useRef<HTMLDivElement>(null)
  const initialBgApplied = useRef(false)
  const arcgisInitialized = useRef(false)
  const arcgisViewRef = useRef<MapView | null>(null)
  const scaleBarRef = useRef<ScaleBar | null>(null)
  const [arcgisReady, setArcgisReady] = useState(false)

  // Determine engine mode
  const arcgisIsPrimary = isArcGISEngine()
  const arcgisBaseLayers = useArcGISFeature('arcgisBaseLayers')

  // OL map target - 'map' for primary, 'ol-overlay' for overlay mode
  const olTarget = arcgisIsPrimary ? 'ol-overlay' : 'map'
  useMap({ target: olTarget })

  const map = useMapStore(state => state.map)
  const arcgisView = useMapStore(state => state.arcgisView)
  const setArcGISMap = useMapStore(state => state.setArcGISMap)
  const registerLayer = useLayerStore(state => state.registerLayer)
  const setLayerVisibility = useLayerStore(state => state.setLayerVisibility)
  const defaultBackground = useSettingsStore(state => state.defaultBackground)
  const showScaleBar = useSettingsStore(state => state.showScaleBar)

  // Create ArcGIS basemap helper - supports Esri TileLayers and custom WebTileLayers
  const createArcGISBasemap = useCallback((bgName: string): Basemap => {
    const config = ARCGIS_BASE_LAYERS[bgName] || ARCGIS_BASE_LAYERS['Esri Licht']
    engineLog('Creating basemap:', bgName, config.type)

    if (config.type === 'esritile') {
      // Use Esri TileLayer for ArcGIS Server tile services
      console.log('🗺️ Creating Esri TileLayer basemap:', bgName, config.url)
      const esriTileLayer = new EsriTileLayer({
        url: config.url,
        copyright: config.copyright,
        title: bgName
      })

      return new Basemap({
        baseLayers: [esriTileLayer],
        title: bgName
      })
    } else if (config.type === 'webtile') {
      // Use custom WebTileLayer for standard XYZ/TMS tiles (PDOK, etc.)
      console.log('🗺️ Creating WebTileLayer basemap:', bgName)
      const baseLayer = new WebTileLayer({
        urlTemplate: config.url,
        subDomains: config.subDomains,
        copyright: config.copyright,
        title: bgName,
        maxScale: config.maxScale
      })

      return new Basemap({
        baseLayers: [baseLayer],
        title: bgName
      })
    } else {
      // hybrid-ol type - return empty basemap (OL layer handles it)
      console.log('🗺️ Creating empty basemap for hybrid-ol:', bgName)
      return new Basemap({ title: 'empty' })
    }
  }, [])

  useEffect(() => {
    if (!map) {
      console.warn('⚠️ Map not initialized yet')
      return
    }

    engineLog('Initializing OL map layers...', { arcgisBaseLayers })

    // Historical map layers from Map5.nl - ALWAYS create these for hybrid mode
    const tmk1850Layer = new TileLayer({
      properties: { title: 'TMK 1850', type: 'base' },
      visible: false,
      source: new XYZ({
        url: 'https://s.map5.nl/map/gast/tiles/tmk_1850/EPSG3857/{z}/{x}/{y}.png',
        attributions: '© Kadaster / Map5.nl',
        crossOrigin: 'anonymous',
        maxZoom: 14
      }),
      zIndex: 0  // Below other layers
    })

    const bonne1900Layer = new TileLayer({
      properties: { title: 'Bonnebladen 1900', type: 'base' },
      visible: false,
      source: new XYZ({
        url: 'https://s.map5.nl/map/gast/tiles/bonne_1900/EPSG3857/{z}/{x}/{y}.png',
        attributions: '© Kadaster / Map5.nl',
        crossOrigin: 'anonymous',
        maxZoom: 14
      }),
      zIndex: 0  // Below other layers
    })

    // Always add historical layers (needed for hybrid mode)
    map.addLayer(tmk1850Layer)
    map.addLayer(bonne1900Layer)
    registerLayer('TMK 1850', tmk1850Layer)
    registerLayer('Bonnebladen 1900', bonne1900Layer)
    engineLog('OL historical layers added for hybrid mode')

    // Skip other OL base layers if ArcGIS handles them
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

      // Add base layers to map
      map.addLayer(osmLayer)
      map.addLayer(cartoDBLayer)
      map.addLayer(satelliteLayer)
      map.addLayer(labelsLayer)

      // Register base layers in store (historical maps already registered above)
      registerLayer('OpenStreetMap', osmLayer)
      registerLayer('CartoDB (licht)', cartoDBLayer)
      registerLayer('Luchtfoto', satelliteLayer)
      registerLayer('Labels Overlay', labelsLayer)

      engineLog('OL base layers added')
    } else {
      engineLog('Skipping OL base layers (ArcGIS handles basemaps, historical maps still available)')
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
    // Already initialized?
    if (arcgisInitialized.current) return

    const container = arcgisContainerRef.current
    if (!container) {
      engineLog('ArcGIS container not ready')
      return
    }

    // For overlay mode (OL primary), wait for OL map
    if (!arcgisIsPrimary && !map) {
      engineLog('Waiting for OL map (overlay mode)')
      return
    }

    // Wait for next frame to ensure container has dimensions
    const initializeMap = () => {
      const rect = container.getBoundingClientRect()
      engineLog('ArcGIS container dimensions:', { width: rect.width, height: rect.height })

      if (rect.width === 0 || rect.height === 0) {
        engineLog('Container has no dimensions, retrying...')
        requestAnimationFrame(initializeMap)
        return
      }

      // Mark as initializing to prevent duplicate init
      arcgisInitialized.current = true

      engineLog('Initializing ArcGIS MapView...', {
        isPrimary: arcgisIsPrimary,
        containerId: container.id
      })

      // Create basemap for primary mode
      const bgName = defaultBackground || 'Esri Licht'
      const bgConfig = ARCGIS_BASE_LAYERS[bgName] || ARCGIS_BASE_LAYERS['Esri Licht']
      console.log('🔧 ArcGIS init - bgName:', bgName, 'type:', bgConfig.type)

      let esriMap: EsriMap

      if (arcgisIsPrimary && arcgisBaseLayers) {
        if (bgConfig.type === 'hybrid-ol') {
          // HYBRID: Start with empty basemap, OL layer will be shown separately
          console.log('🔧 Using HYBRID basemap (OL layer):', bgConfig.olLayerName)
          esriMap = new EsriMap({ basemap: new Basemap({ title: 'empty' }) })
        } else {
          // Create Esri TileLayer or WebTile basemap
          const basemap = createArcGISBasemap(bgName)
          console.log('🔧 Using basemap:', bgName)
          esriMap = new EsriMap({ basemap })
        }
      } else {
        esriMap = new EsriMap()
      }

      console.log('🔧 EsriMap created, basemap:', esriMap.basemap?.title || 'none')

      // Create ArcGIS MapView with explicit center and zoom
      const esriView = new MapView({
        container: container,
        map: esriMap,
        center: NL_CENTER,
        zoom: NL_ZOOM,
        constraints: {
          rotationEnabled: true,
          minZoom: 3,
          maxZoom: 19
        },
        ui: {
          components: arcgisIsPrimary ? ['attribution'] : []
        },
        background: arcgisIsPrimary ? undefined : { color: [0, 0, 0, 0] }
      })

      // Store view ref for cleanup
      arcgisViewRef.current = esriView

      // Wait for view to be ready
      esriView.when(() => {
        engineLog('ArcGIS MapView ready', {
          center: [esriView.center?.longitude, esriView.center?.latitude],
          zoom: esriView.zoom,
          scale: esriView.scale
        })

        // Store in Zustand
        setArcGISMap(esriMap, esriView)
        setArcgisReady(true)

        // Setup view sync
        if (arcgisIsPrimary) {
          // ArcGIS primary: BIDIRECTIONAL sync (ArcGIS ↔ OL)
          // This is needed because:
          // - User pan/zoom goes to ArcGIS → needs to sync to OL for layers
          // - GPS tracking updates OL directly → needs to sync to ArcGIS for basemap
          const setupSync = (olMap: any) => {
            if (!olMap) return

            // Flag to prevent infinite sync loops
            let syncing = false

            // ArcGIS → OL sync (user pan/zoom)
            esriView.watch('center', (center) => {
              if (center && olMap && !syncing) {
                syncing = true
                olMap.getView().setCenter(fromLonLat([center.longitude, center.latitude]))
                syncing = false
              }
            })

            esriView.watch('zoom', (newZoom) => {
              if (newZoom !== undefined && olMap && !syncing) {
                syncing = true
                olMap.getView().setZoom(newZoom)
                syncing = false
              }
            })

            // OL → ArcGIS sync (GPS updates, programmatic moves)
            const olView = olMap.getView()

            olView.on('change:center', () => {
              if (syncing) return
              const newCenter = olView.getCenter()
              if (newCenter && !esriView.destroyed) {
                syncing = true
                const newLonLat = toLonLat(newCenter)
                esriView.goTo({ center: newLonLat }, { animate: false })
                syncing = false
              }
            })

            olView.on('change:resolution', () => {
              if (syncing) return
              const newZoom = olView.getZoom()
              if (newZoom !== undefined && !esriView.destroyed) {
                syncing = true
                esriView.goTo({ zoom: newZoom }, { animate: false })
                syncing = false
              }
            })

            engineLog('Bidirectional ArcGIS ↔ OL sync complete')
          }

          // Setup sync when OL map is available
          const currentOLMap = useMapStore.getState().map
          if (currentOLMap) {
            setupSync(currentOLMap)
          } else {
            const unsubscribe = useMapStore.subscribe((state) => {
              if (state.map) {
                setupSync(state.map)
                unsubscribe()
              }
            })
          }
        } else if (map) {
          // OL primary: sync OL → ArcGIS
          const olView = map.getView()

          olView.on('change:center', () => {
            const newCenter = olView.getCenter()
            if (newCenter && !esriView.destroyed) {
              const newLonLat = toLonLat(newCenter)
              esriView.goTo({ center: newLonLat }, { animate: false })
            }
          })

          olView.on('change:resolution', () => {
            const newZoom = olView.getZoom()
            if (newZoom !== undefined && !esriView.destroyed) {
              esriView.goTo({ zoom: newZoom }, { animate: false })
            }
          })

          engineLog('OL → ArcGIS sync complete')
        }
      }).catch((error: Error) => {
        console.error('❌ ArcGIS MapView init failed:', error)
        arcgisInitialized.current = false
      })
    }

    // Start initialization on next frame
    const rafId = requestAnimationFrame(initializeMap)

    return () => {
      cancelAnimationFrame(rafId)
      // Note: Don't destroy view here - it causes issues with React strict mode
      // View cleanup happens when component unmounts
    }
  }, [map, setArcGISMap, arcgisIsPrimary, arcgisBaseLayers, defaultBackground, createArcGISBasemap])

  // Cleanup ArcGIS view on unmount
  useEffect(() => {
    return () => {
      if (arcgisViewRef.current && !arcgisViewRef.current.destroyed) {
        arcgisViewRef.current.destroy()
        arcgisViewRef.current = null
        arcgisInitialized.current = false
        engineLog('ArcGIS MapView destroyed')
      }
    }
  }, [])

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
    if (!arcgisIsPrimary || !arcgisBaseLayers || !arcgisReady || !arcgisView?.map) return

    // Handle legacy basemap names (migration from CartoDB to Esri)
    let bgName = defaultBackground || 'Esri Licht'
    if (!ARCGIS_BASE_LAYERS[bgName]) {
      engineLog('Unknown basemap, falling back to Esri Licht:', bgName)
      bgName = 'Esri Licht'
    }

    const bgConfig = ARCGIS_BASE_LAYERS[bgName]

    // First, hide all OL historical layers
    setLayerVisibility('TMK 1850', false)
    setLayerVisibility('Bonnebladen 1900', false)

    if (bgConfig.type === 'hybrid-ol') {
      // HYBRID: Use OL layer for historical maps
      console.log('🔄 Changing to HYBRID basemap (OL layer):', bgConfig.olLayerName)
      // Set ArcGIS to empty/transparent basemap
      arcgisView.map.basemap = new Basemap({ title: 'empty' })
      // Show the OL historical layer
      setLayerVisibility(bgConfig.olLayerName, true)
    } else {
      // For Esri TileLayer or WebTile basemaps
      console.log('🔄 Changing to basemap:', bgName, bgConfig.type)
      arcgisView.map.basemap = createArcGISBasemap(bgName)
    }

    engineLog('Basemap changed to:', bgName)
  }, [defaultBackground, arcgisReady, arcgisView, arcgisIsPrimary, arcgisBaseLayers, createArcGISBasemap, setLayerVisibility])

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
      const bgToApply = defaultBackground || 'Esri Licht'

      // Turn off all base layers first
      BASE_LAYERS.forEach(layer => {
        setLayerVisibility(layer, false)
      })

      // Then turn on the default
      if (BASE_LAYERS.includes(bgToApply)) {
        setLayerVisibility(bgToApply, true)
      } else {
        setLayerVisibility('Esri Licht', true)
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

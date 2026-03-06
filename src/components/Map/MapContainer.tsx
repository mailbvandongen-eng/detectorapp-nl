import { useEffect, useRef, useState, useCallback } from 'react'
import 'ol/ol.css'
import { Tile as TileLayer } from 'ol/layer'
import { OSM, XYZ } from 'ol/source'
import { useMap } from '../../hooks/useMap'
import { useArcGISLayers } from '../../hooks/useArcGISLayers'
import { useLayerStore, useMapStore, useSettingsStore, useGPSStore, useUIStore } from '../../store'
import { getImmediateLoadLayers } from '../../layers/layerRegistry'
import { toLonLat, fromLonLat } from 'ol/proj'
import { isArcGISEngine, useArcGISFeature, engineLog } from '../../config/mapEngineConfig'

// ArcGIS imports
import EsriMap from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import Basemap from '@arcgis/core/Basemap'
import WebTileLayer from '@arcgis/core/layers/WebTileLayer'
import EsriTileLayer from '@arcgis/core/layers/TileLayer'
// ScaleBar widget deprecated - using arcgis-scale-bar web component instead
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

// Basemap types - all ArcGIS native now (no more hybrid OL mess)
type EsriTileConfig = { type: 'esritile'; url: string; copyright: string }
type WebTileConfig = { type: 'webtile'; url: string; subDomains?: string[]; copyright: string; maxScale?: number }
type BasemapConfig = EsriTileConfig | WebTileConfig

// ArcGIS base layer configurations
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
  // Historical maps from Map5.nl - now as native ArcGIS WebTileLayers
  // Max zoom 14 = scale ~35000 (prevent "paid subscription required" message)
  'TMK 1850': {
    type: 'webtile',
    url: 'https://s.map5.nl/map/gast/tiles/tmk_1850/EPSG3857/{level}/{col}/{row}.png',
    copyright: '© Map5.nl / Kadaster',
    maxScale: 35000  // Zoom 14 limit
  },
  'Bonnebladen 1900': {
    type: 'webtile',
    url: 'https://s.map5.nl/map/gast/tiles/bonne_1900/EPSG3857/{level}/{col}/{row}.png',
    copyright: '© Map5.nl / Kadaster',
    maxScale: 35000  // Zoom 14 limit
  }
}

// Netherlands center - heel Nederland in beeld bij opstart
const NL_CENTER: [number, number] = [5.3, 52.15] // Centrum Nederland
const NL_ZOOM = 7.2 // Heel Nederland zichtbaar

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const arcgisContainerRef = useRef<HTMLDivElement>(null)
  const initialBgApplied = useRef(false)
  const arcgisInitialized = useRef(false)
  const arcgisViewRef = useRef<MapView | null>(null)
  const scaleBarRef = useRef<HTMLElement | null>(null)
  const [arcgisReady, setArcgisReady] = useState(false)

  // Determine engine mode
  const arcgisIsPrimary = isArcGISEngine()
  const arcgisBaseLayers = useArcGISFeature('arcgisBaseLayers')
  const isDrawingMode = useUIStore(state => state.isDrawingMode)

  // OL map target - 'map' for primary, 'ol-overlay' for overlay mode
  const olTarget = arcgisIsPrimary ? 'ol-overlay' : 'map'
  useMap({ target: olTarget })

  // ArcGIS layers hook - manages WMS/Vector/Imagery layers when feature flags enabled
  useArcGISLayers()

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
      // Fallback - should not happen
      console.warn('🗺️ Unknown basemap type:', bgName)
      return new Basemap({ title: bgName })
    }
  }, [])

  useEffect(() => {
    if (!map) {
      console.warn('⚠️ Map not initialized yet')
      return
    }

    engineLog('Initializing OL map layers...', { arcgisBaseLayers })

    // Skip OL base layers if ArcGIS handles basemaps (TMK/Bonnebladen are now native ArcGIS WebTileLayers)
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
      // ALTIJD starten met Esri Licht, ongeacht wat er gepersisteerd is
      const bgName = 'Esri Licht'
      const bgConfig = ARCGIS_BASE_LAYERS[bgName]
      console.log('🔧 ArcGIS init - starting with Esri Licht')

      let esriMap: EsriMap

      if (arcgisIsPrimary && arcgisBaseLayers) {
        // All basemaps are now native ArcGIS (no more hybrid-ol)
        const basemap = createArcGISBasemap(bgName)
        console.log('🔧 Using basemap:', bgName)
        esriMap = new EsriMap({ basemap })
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
          // ArcGIS primary: ONE-WAY sync (ArcGIS → OL only for user interaction)
          // GPS updates go through setCenter/setZoom which update both views directly
          const setupSync = (olMap: any) => {
            if (!olMap) return

            // Only sync ArcGIS → OL (user pan/zoom on basemap)
            // Real-time sync during drag/zoom for smooth overlay movement

            // ArcGIS → OL sync (user pan/zoom) - real-time during interaction
            esriView.watch('center', (center) => {
              if (center && olMap) {
                olMap.getView().setCenter(fromLonLat([center.longitude, center.latitude]))
              }
            })

            esriView.watch('zoom', (newZoom) => {
              if (newZoom !== undefined && olMap) {
                olMap.getView().setZoom(newZoom)
              }
            })

            // Rotation sync (for heading-up mode)
            esriView.watch('rotation', (rotation) => {
              if (rotation !== undefined && olMap) {
                // ArcGIS uses degrees, OL uses radians
                olMap.getView().setRotation((rotation * Math.PI) / 180)
              }
            })

            // Fallback sync when interaction ends for final position
            esriView.watch('interacting', (interacting) => {
              if (!interacting && olMap) {
                const center = esriView.center
                const zoom = esriView.zoom
                if (center) {
                  olMap.getView().setCenter(fromLonLat([center.longitude, center.latitude]))
                }
                if (zoom !== undefined) {
                  olMap.getView().setZoom(zoom)
                }
              }
            })

            engineLog('ArcGIS → OL sync complete')
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

  // Handle ScaleBar for ArcGIS primary mode - using web component
  useEffect(() => {
    if (!arcgisIsPrimary || !arcgisReady || !arcgisView) return

    if (showScaleBar) {
      if (!scaleBarRef.current) {
        // Create arcgis-scale-bar web component
        const scaleBar = document.createElement('arcgis-scale-bar')
        scaleBar.setAttribute('unit', 'metric')
        // Set the view reference - web component needs the view
        ;(scaleBar as any).view = arcgisView
        scaleBarRef.current = scaleBar
        arcgisView.ui.add(scaleBar, 'bottom-center')
        engineLog('ScaleBar (web component) added')
      }
    } else {
      if (scaleBarRef.current) {
        arcgisView.ui.remove(scaleBarRef.current)
        scaleBarRef.current = null
        engineLog('ScaleBar removed')
      }
    }
  }, [showScaleBar, arcgisReady, arcgisView, arcgisIsPrimary])

  // Track if this is initial load (skip basemap change from persisted value)
  const isInitialBasemapLoad = useRef(true)

  // Handle basemap changes for ArcGIS primary mode
  // Skip first render - initial basemap is set during map creation
  useEffect(() => {
    if (!arcgisIsPrimary || !arcgisBaseLayers || !arcgisReady || !arcgisView?.map) return

    // Skip initial load - we start with Esri Licht, ignore persisted value
    if (isInitialBasemapLoad.current) {
      isInitialBasemapLoad.current = false
      // Reset persisted value to Esri Licht
      useSettingsStore.getState().setDefaultBackground('Esri Licht')
      return
    }

    // Handle legacy basemap names (migration from CartoDB to Esri)
    let bgName = defaultBackground || 'Esri Licht'
    if (!ARCGIS_BASE_LAYERS[bgName]) {
      engineLog('Unknown basemap, falling back to Esri Licht:', bgName)
      bgName = 'Esri Licht'
    }

    // All basemaps are now native ArcGIS WebTileLayers (including TMK/Bonnebladen)
    console.log('🔄 Changing to basemap:', bgName)
    arcgisView.map.basemap = createArcGISBasemap(bgName)

    // GEEN view constraints - de WebTileLayer maxScale voorkomt betaalde tile requests
    // View constraints blokkeren het hele zoomen inclusief labels overlay
    // De historische kaart wordt gewoon leeg/geschaald bij verder inzoomen

    engineLog('Basemap changed to:', bgName)
  }, [defaultBackground, arcgisReady, arcgisView, arcgisIsPrimary, arcgisBaseLayers, createArcGISBasemap])

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
    // Enable pointer events when drawing/measuring, otherwise let ArcGIS handle
    pointerEvents: isDrawingMode ? 'auto' : 'none',
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

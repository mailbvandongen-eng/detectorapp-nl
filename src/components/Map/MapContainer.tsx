import { useEffect, useRef } from 'react'
import 'ol/ol.css'
import { Tile as TileLayer } from 'ol/layer'
import { OSM, XYZ } from 'ol/source'
import { useMap } from '../../hooks/useMap'
import { useLayerStore, useMapStore, useSettingsStore, useGPSStore } from '../../store'
import { layerRegistry, getImmediateLoadLayers } from '../../layers/layerRegistry'

// Base layer names
const BASE_LAYERS = [
  'CartoDB (licht)',
  'OpenStreetMap',
  'Luchtfoto',
  'TMK 1850',
  'Bonnebladen 1900'
]

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  const initialBgApplied = useRef(false)
  useMap({ target: 'map' }) // Initialize map
  const map = useMapStore(state => state.map) // Get reactive map from store
  const registerLayer = useLayerStore(state => state.registerLayer)
  const setLayerVisibility = useLayerStore(state => state.setLayerVisibility)
  const defaultBackground = useSettingsStore(state => state.defaultBackground)

  useEffect(() => {
    if (!map) {
      console.warn('⚠️ Map not initialized yet')
      return
    }

    console.log('🗺️ Initializing map layers...')

    // Base layers
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

    // ESRI World Imagery - reliable free satellite imagery
    const satelliteLayer = new TileLayer({
      properties: { title: 'Luchtfoto', type: 'base' },
      visible: false,
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        attributions: '© Esri, Maxar, Earthstar Geographics',
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
      zIndex: 100 // Above satellite, below vector layers
    })

    // Historical map layers from Map5.nl (XYZ tiles in Web Mercator)
    // maxZoom: 14 to avoid paywall tiles at higher zoom levels
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
    map.addLayer(labelsLayer) // Labels overlay for hybrid map
    map.addLayer(tmk1850Layer)
    map.addLayer(bonne1900Layer)
    console.log('✅ Base layers added:', {
      osm: osmLayer.getVisible(),
      cartodb: cartoDBLayer.getVisible(),
      satellite: satelliteLayer.getVisible()
    })

    // Register base layers in store
    registerLayer('OpenStreetMap', osmLayer)
    registerLayer('CartoDB (licht)', cartoDBLayer)
    registerLayer('Luchtfoto', satelliteLayer)
    registerLayer('Labels Overlay', labelsLayer)
    registerLayer('TMK 1850', tmk1850Layer)
    registerLayer('Bonnebladen 1900', bonne1900Layer)

    // Force map to render
    map.updateSize()
    console.log('📏 Map size:', map.getSize())
    console.log('📍 Map center:', map.getView().getCenter())
    console.log('🔍 Map zoom:', map.getView().getZoom())

    // Load immediate-load layers (WMS/Tile layers that load tiles on-demand)
    loadImmediateLayers()

  }, [map, registerLayer])

  async function loadImmediateLayers() {
    if (!map) {
      console.error('❌ Cannot load layers: map is null')
      return
    }

    const immediateLoadLayers = getImmediateLoadLayers()
    console.log(`📦 Loading ${immediateLoadLayers.length} immediate-load layers (WMS/Tile)...`)

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
        console.log(`  ✓ ${name}`)
      }
    })

    console.log(`✅ Immediate layers loaded: ${addedCount}/${immediateLoadLayers.length}`)
    console.log(`📊 Total layers on map: ${map.getLayers().getLength()}`)
    console.log('💤 Vector layers will load on first toggle (lazy loading enabled)')
  }

  // Apply default background setting on first load
  useEffect(() => {
    if (!map || initialBgApplied.current) return

    // Wait a tick for layers to be registered
    const timer = setTimeout(() => {
      // Always ensure CartoDB is the default fallback
      const bgToApply = defaultBackground || 'CartoDB (licht)'

      // Turn off all base layers first
      BASE_LAYERS.forEach(layer => {
        setLayerVisibility(layer, false)
      })

      // Then turn on the default (or CartoDB as fallback)
      if (BASE_LAYERS.includes(bgToApply)) {
        setLayerVisibility(bgToApply, true)
      } else {
        // Fallback to CartoDB if invalid setting
        setLayerVisibility('CartoDB (licht)', true)
      }

      initialBgApplied.current = true
      console.log(`🗺️ Default background: ${bgToApply}`)
    }, 100)

    return () => clearTimeout(timer)
  }, [map, defaultBackground, setLayerVisibility])

  // GPS autostart on app load
  const gpsAutoStart = useSettingsStore(state => state.gpsAutoStart)
  const startTracking = useGPSStore(state => state.startTracking)
  const gpsStarted = useRef(false)

  useEffect(() => {
    if (!map || gpsStarted.current) return

    if (gpsAutoStart) {
      // Wait for map to be ready before starting GPS
      const timer = setTimeout(() => {
        startTracking()
        gpsStarted.current = true
        console.log('📍 GPS autostart enabled - tracking started')
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [map, gpsAutoStart, startTracking])

  const mapStyle: React.CSSProperties = {
    width: '100%',
    height: '100vh',
  }

  return (
    <div
      id="map"
      ref={containerRef}
      style={mapStyle}
    />
  )
}

import { useEffect, useRef } from 'react'
import 'ol/ol.css'
import { Tile as TileLayer } from 'ol/layer'
import { OSM, XYZ } from 'ol/source'
import { useMap } from '../../hooks/useMap'
import { useLayerStore, useMapStore } from '../../store'
import { useNavigationStore } from '../../store/navigationStore'
import { layerRegistry, getImmediateLoadLayers } from '../../layers/layerRegistry'

export function MapContainer() {
  const containerRef = useRef<HTMLDivElement>(null)
  useMap({ target: 'map' }) // Initialize map
  const map = useMapStore(state => state.map) // Get reactive map from store
  const registerLayer = useLayerStore(state => state.registerLayer)
  const isNavigating = useNavigationStore(state => state.isNavigating)

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

    // PDOK Luchtfoto - Dutch government aerial imagery (free, CC0)
    const satelliteLayer = new TileLayer({
      properties: { title: 'Luchtfoto (PDOK)', type: 'base' },
      visible: false,
      source: new XYZ({
        url: 'https://service.pdok.nl/hwh/luchtfotorgb/wmts/v1_0/Actueel_ortho25/EPSG:3857/{z}/{x}/{y}.jpeg',
        attributions: '© Kadaster / PDOK',
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
    registerLayer('Luchtfoto (PDOK)', satelliteLayer)
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

  // 3D tilt effect during navigation (Google Maps style)
  const mapStyle: React.CSSProperties = {
    width: '100%',
    height: '100vh',
    transition: 'transform 0.5s ease-out',
    transformOrigin: 'center bottom',
    // Apply 3D perspective tilt when navigating
    ...(isNavigating ? {
      transform: 'perspective(1000px) rotateX(25deg) scale(1.1)',
    } : {})
  }

  return (
    <div
      id="map"
      ref={containerRef}
      style={mapStyle}
    />
  )
}

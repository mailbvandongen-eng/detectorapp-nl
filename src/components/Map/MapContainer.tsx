import { useEffect, useRef } from 'react'
import 'ol/ol.css'
import { Tile as TileLayer } from 'ol/layer'
import { OSM, XYZ, WMTS } from 'ol/source'
import WMTSTileGrid from 'ol/tilegrid/WMTS'
import { get as getProjection } from 'ol/proj'
import { getTopLeft, getWidth } from 'ol/extent'
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
      properties: { title: 'CartoDB Positron', type: 'base' },
      visible: true,
      source: new XYZ({
        url: 'https://{a-d}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
        attributions: '© OpenStreetMap contributors © CARTO'
      })
    })

    const satelliteLayer = new TileLayer({
      properties: { title: 'Satellite', type: 'base' },
      visible: false,
      source: new XYZ({
        url: 'https://mt{0-3}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
        attributions: '© Google'
      })
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

    // Carte de Cassini (France ~1750) - WMTS from IGN
    // Create WMTS tile grid for Web Mercator (PM_6_14 = zoom levels 6-14)
    const projection = getProjection('EPSG:3857')!
    const projectionExtent = projection.getExtent()!
    const size = getWidth(projectionExtent) / 256
    // Only zoom levels 6-14 are available
    const resolutions: number[] = []
    const matrixIds: string[] = []
    for (let z = 6; z <= 14; ++z) {
      resolutions.push(size / Math.pow(2, z))
      matrixIds.push(z.toString())
    }

    const cassiniLayer = new TileLayer({
      properties: { title: 'Carte Cassini', type: 'base' },
      visible: false,
      minZoom: 6,
      maxZoom: 14,
      source: new WMTS({
        url: 'https://data.geopf.fr/wmts',
        layer: 'BNF-IGNF_GEOGRAPHICALGRIDSYSTEMS.CASSINI',
        matrixSet: 'PM_6_14',
        format: 'image/png',
        style: 'normal',
        tileGrid: new WMTSTileGrid({
          origin: getTopLeft(projectionExtent),
          resolutions: resolutions,
          matrixIds: matrixIds
        }),
        attributions: '© IGN France / BnF - Carte de Cassini',
        crossOrigin: 'anonymous'
      })
    })

    // Add base layers to map
    map.addLayer(osmLayer)
    map.addLayer(cartoDBLayer)
    map.addLayer(satelliteLayer)
    map.addLayer(tmk1850Layer)
    map.addLayer(bonne1900Layer)
    map.addLayer(cassiniLayer)
    console.log('✅ Base layers added:', {
      osm: osmLayer.getVisible(),
      cartodb: cartoDBLayer.getVisible(),
      satellite: satelliteLayer.getVisible()
    })

    // Register base layers in store
    registerLayer('OpenStreetMap', osmLayer)
    registerLayer('CartoDB Positron', cartoDBLayer)
    registerLayer('Satellite', satelliteLayer)
    registerLayer('TMK 1850', tmk1850Layer)
    registerLayer('Bonnebladen 1900', bonne1900Layer)
    registerLayer('Carte Cassini', cassiniLayer)

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

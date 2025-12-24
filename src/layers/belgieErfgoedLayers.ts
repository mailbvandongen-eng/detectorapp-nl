import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Fill, Stroke, Circle as CircleStyle } from 'ol/style'

// Belgian heritage layers from Onroerend Erfgoed (GeoJSON)
// Downloaded from https://geo.onroerenderfgoed.be/downloads

// Protected Archaeological Sites Belgium
export async function createBeschermdeMonumentenBELayerOL() {
  try {
    const response = await fetch('/webapp/data/bes_monument_be.geojson')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const geojson = await response.json()
    console.log(`🏛️ BE Monumenten: loaded ${geojson.features?.length || 0} protected monuments`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    return new VectorLayer({
      source,
      properties: { title: 'Monumenten BE' },
      visible: false,
      zIndex: 25,
      opacity: 0.8,
      style: new Style({
        fill: new Fill({ color: 'rgba(139, 69, 19, 0.3)' }),
        stroke: new Stroke({ color: '#8B4513', width: 2 }),
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: '#8B4513' }),
          stroke: new Stroke({ color: 'white', width: 1 })
        })
      })
    })
  } catch (error) {
    console.error('❌ Failed to load BE Monumenten:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Monumenten BE' },
      visible: false
    })
  }
}

// Archaeological Zones Belgium
export async function createArcheoZonesBELayerOL() {
  try {
    const response = await fetch('/webapp/data/vast_az_be.geojson')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const geojson = await response.json()
    console.log(`🗺️ BE Archeo Zones: loaded ${geojson.features?.length || 0} zones`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    return new VectorLayer({
      source,
      properties: { title: 'Archeo Zones BE' },
      visible: false,
      zIndex: 23,
      opacity: 0.6,
      style: new Style({
        fill: new Fill({ color: 'rgba(255, 140, 0, 0.25)' }),
        stroke: new Stroke({ color: '#FF8C00', width: 2, lineDash: [5, 5] })
      })
    })
  } catch (error) {
    console.error('❌ Failed to load BE Archeo Zones:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Archeo Zones BE' },
      visible: false
    })
  }
}

// Protected Archaeological Sites Belgium
export async function createBeschArchSitesBELayerOL() {
  try {
    const response = await fetch('/webapp/data/bes_arch_site_be.geojson')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const geojson = await response.json()
    console.log(`⛏️ BE Arch Sites: loaded ${geojson.features?.length || 0} sites`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    return new VectorLayer({
      source,
      properties: { title: 'Arch Sites BE' },
      visible: false,
      zIndex: 26,
      opacity: 0.7,
      style: new Style({
        fill: new Fill({ color: 'rgba(178, 34, 34, 0.35)' }),
        stroke: new Stroke({ color: '#B22222', width: 2 }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({ color: '#B22222' }),
          stroke: new Stroke({ color: 'white', width: 1.5 })
        })
      })
    })
  } catch (error) {
    console.error('❌ Failed to load BE Arch Sites:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Arch Sites BE' },
      visible: false
    })
  }
}

// Heritage Landscapes Belgium
export async function createErfgoedLandschappenBELayerOL() {
  try {
    const response = await fetch('/webapp/data/bes_landschap_be.geojson')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const geojson = await response.json()
    console.log(`🌳 BE Erfgoed Landschap: loaded ${geojson.features?.length || 0} landscapes`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    return new VectorLayer({
      source,
      properties: { title: 'Erfgoed Landschap BE' },
      visible: false,
      zIndex: 22,
      opacity: 0.5,
      style: new Style({
        fill: new Fill({ color: 'rgba(34, 139, 34, 0.2)' }),
        stroke: new Stroke({ color: '#228B22', width: 2, lineDash: [8, 4] })
      })
    })
  } catch (error) {
    console.error('❌ Failed to load BE Erfgoed Landschap:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'Erfgoed Landschap BE' },
      visible: false
    })
  }
}

// CAI Archaeological Elements (expanded - 7000+ elements)
export async function createCAIElementenBELayerOL() {
  try {
    const response = await fetch('/webapp/data/cai_elementen_be.geojson')
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const geojson = await response.json()
    console.log(`📍 CAI Elementen: loaded ${geojson.features?.length || 0} archaeological elements`)

    const source = new VectorSource({
      features: new GeoJSON().readFeatures(geojson, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    })

    return new VectorLayer({
      source,
      properties: { title: 'CAI Elementen' },
      visible: false,
      zIndex: 24,
      style: new Style({
        fill: new Fill({ color: 'rgba(255, 107, 53, 0.3)' }),
        stroke: new Stroke({ color: '#ff6b35', width: 2 }),
        image: new CircleStyle({
          radius: 5,
          fill: new Fill({ color: '#ff6b35' }),
          stroke: new Stroke({ color: 'white', width: 1 })
        })
      })
    })
  } catch (error) {
    console.error('❌ Failed to load CAI Elementen:', error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title: 'CAI Elementen' },
      visible: false
    })
  }
}

import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { Style, Icon } from 'ol/style'

// Cache for localStorage
const CACHE_KEY = 'winkelcentra_cache'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

interface WinkelcentrumCache {
  timestamp: number
  data: WinkelcentrumFeature[]
}

interface WinkelcentrumFeature {
  lon: number
  lat: number
  name: string
  opening_hours?: string
  website?: string
  phone?: string
  address?: string
  wheelchair?: string
  shops?: number
}

/**
 * Fetch shopping centers from OpenStreetMap via Overpass API
 */
async function fetchWinkelcentra(): Promise<WinkelcentrumFeature[]> {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { timestamp, data } = JSON.parse(cached) as WinkelcentrumCache
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log(`✓ Winkelcentra loaded from cache (${data.length} locations)`)
        return data
      }
    }
  } catch {
    // Cache read failed
  }

  // Fetch shopping centers from Overpass API
  const query = `
    [out:json][timeout:60];
    area["ISO3166-1"="NL"]->.nl;
    (
      // Shopping malls and centers
      nwr["shop"="mall"](area.nl);
      nwr["landuse"="retail"]["name"](area.nl);
      // Shopping streets/areas with name
      nwr["shop"="department_store"](area.nl);
    );
    out center;
  `

  try {
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`
    })

    if (!response.ok) {
      throw new Error(`Overpass API error: ${response.status}`)
    }

    const data = await response.json()

    const features: WinkelcentrumFeature[] = data.elements
      .filter((el: any) => {
        const lon = el.lon ?? el.center?.lon
        const lat = el.lat ?? el.center?.lat
        const tags = el.tags || {}
        // Must have a name
        return lon && lat && tags.name
      })
      .map((el: any) => {
        const tags = el.tags || {}
        const lon = el.lon ?? el.center?.lon
        const lat = el.lat ?? el.center?.lat

        // Build address from available tags
        let address = ''
        if (tags['addr:street']) {
          address = tags['addr:street']
          if (tags['addr:housenumber']) address += ' ' + tags['addr:housenumber']
          if (tags['addr:city']) address += ', ' + tags['addr:city']
        }

        return {
          lon,
          lat,
          name: tags.name,
          opening_hours: tags.opening_hours,
          website: tags.website || tags['contact:website'],
          phone: tags.phone || tags['contact:phone'],
          address: address || undefined,
          wheelchair: tags.wheelchair,
          shops: tags.shops ? parseInt(tags.shops) : undefined
        }
      })

    // Cache the result
    try {
      const cache: WinkelcentrumCache = { timestamp: Date.now(), data: features }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch {
      // Cache write failed
    }

    console.log(`✓ Winkelcentra fetched from OSM (${features.length} locations)`)
    return features

  } catch (error) {
    console.warn('⚠ Failed to fetch winkelcentra from Overpass:', error)

    // Try stale cache
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data } = JSON.parse(cached) as WinkelcentrumCache
        console.log(`✓ Using stale cache (${data.length} locations)`)
        return data
      }
    } catch {
      // No cache
    }

    return []
  }
}

// Create shopping center icon SVG
function createWinkelcentrumIcon(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="#8b5cf6" stroke="white" stroke-width="2"/>
    <g transform="translate(8, 8)" fill="white">
      <rect x="1" y="6" width="14" height="9" rx="1" fill="none" stroke="white" stroke-width="1.5"/>
      <path d="M4 6V4a4 4 0 0 1 8 0v2" fill="none" stroke="white" stroke-width="1.5"/>
    </g>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// Create style based on zoom
function getWinkelcentrumStyle(resolution: number): Style {
  let scale = 1.0
  if (resolution > 150) scale = 0.5
  else if (resolution > 75) scale = 0.6
  else if (resolution > 40) scale = 0.7
  else if (resolution > 20) scale = 0.85
  else if (resolution > 10) scale = 1.0
  else scale = 1.2

  return new Style({
    image: new Icon({
      src: createWinkelcentrumIcon(),
      scale: scale,
      anchor: [0.5, 0.5]
    })
  })
}

/**
 * Winkelcentra in Nederland
 * Bron: OpenStreetMap via Overpass API
 * Uses lazy loading - data is only fetched when layer is first made visible
 */
export async function createWinkelcentraLayerOL() {
  // Start with empty source - data loaded lazily
  const source = new VectorSource()
  let dataLoaded = false
  let isLoading = false

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Winkelcentra', type: 'overlay' },
    visible: false,
    style: (feature, resolution) => getWinkelcentrumStyle(resolution),
    zIndex: 28
  })

  // Lazy load data when layer becomes visible
  layer.on('change:visible', async () => {
    if (layer.getVisible() && !dataLoaded && !isLoading) {
      isLoading = true
      console.log('🔄 Winkelcentra: laden...')

      const winkelData = await fetchWinkelcentra()

      const features = winkelData.map(item => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([item.lon, item.lat])),
          name: item.name,
          opening_hours: item.opening_hours,
          website: item.website,
          phone: item.phone,
          address: item.address,
          wheelchair: item.wheelchair,
          shops: item.shops
        })
        return feature
      })

      source.addFeatures(features)
      dataLoaded = true
      isLoading = false
      console.log(`✓ Winkelcentra geladen (${features.length} locaties)`)
    }
  })

  return layer
}

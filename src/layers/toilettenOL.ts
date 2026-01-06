import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { Style, Icon } from 'ol/style'

// Cache for localStorage
const CACHE_KEY = 'toiletten_cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

interface ToiletCache {
  timestamp: number
  data: ToiletFeature[]
}

interface ToiletFeature {
  lon: number
  lat: number
  name?: string
  fee?: string
  access?: string
  wheelchair?: string
  opening_hours?: string
  operator?: string
}

/**
 * Fetch public toilets from OpenStreetMap via Overpass API
 */
async function fetchToiletten(): Promise<ToiletFeature[]> {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { timestamp, data } = JSON.parse(cached) as ToiletCache
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log(`✓ Toiletten loaded from cache (${data.length} locations)`)
        return data
      }
    }
  } catch {
    // Cache read failed
  }

  // Fetch fresh data from Overpass API
  const query = `
    [out:json][timeout:30];
    area["ISO3166-1"="NL"]->.nl;
    (
      nwr["amenity"="toilets"](area.nl);
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

    const features: ToiletFeature[] = data.elements
      .filter((el: any) => {
        const lon = el.lon ?? el.center?.lon
        const lat = el.lat ?? el.center?.lat
        return lon && lat
      })
      .map((el: any) => {
        const tags = el.tags || {}
        const lon = el.lon ?? el.center?.lon
        const lat = el.lat ?? el.center?.lat

        return {
          lon,
          lat,
          name: tags.name || 'Openbaar toilet',
          fee: tags.fee,
          access: tags.access,
          wheelchair: tags.wheelchair,
          opening_hours: tags.opening_hours,
          operator: tags.operator
        }
      })

    // Cache the result
    try {
      const cache: ToiletCache = { timestamp: Date.now(), data: features }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch {
      // Cache write failed
    }

    console.log(`✓ Toiletten fetched from OSM (${features.length} locations)`)
    return features

  } catch (error) {
    console.warn('⚠ Failed to fetch toiletten from Overpass:', error)

    // Try stale cache
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data } = JSON.parse(cached) as ToiletCache
        console.log(`✓ Using stale cache (${data.length} locations)`)
        return data
      }
    } catch {
      // No cache
    }

    return []
  }
}

// Create toilet icon SVG
function createToiletIcon(): string {
  // Simple toilet/restroom icon
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="#0ea5e9" stroke="white" stroke-width="2"/>
    <g transform="translate(7, 6)" fill="white">
      <circle cx="5" cy="3" r="2.5"/>
      <path d="M2 7h6v8H2z"/>
      <circle cx="13" cy="3" r="2.5"/>
      <path d="M10 7h6l-1 8h-4z"/>
    </g>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// Create style based on zoom
function getToiletStyle(resolution: number): Style {
  let scale = 1.0
  if (resolution > 150) scale = 0.5
  else if (resolution > 75) scale = 0.6
  else if (resolution > 40) scale = 0.7
  else if (resolution > 20) scale = 0.85
  else if (resolution > 10) scale = 1.0
  else scale = 1.2

  return new Style({
    image: new Icon({
      src: createToiletIcon(),
      scale: scale,
      anchor: [0.5, 0.5]
    })
  })
}

/**
 * Openbare toiletten in Nederland
 * Bron: OpenStreetMap via Overpass API
 * Uses lazy loading - data is only fetched when layer is first made visible
 */
export async function createToilettenLayerOL() {
  // Start with empty source - data loaded lazily
  const source = new VectorSource()
  let dataLoaded = false
  let isLoading = false

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Openbare Toiletten', type: 'overlay' },
    visible: false,
    style: (feature, resolution) => getToiletStyle(resolution),
    zIndex: 28
  })

  // Lazy load data when layer becomes visible
  layer.on('change:visible', async () => {
    if (layer.getVisible() && !dataLoaded && !isLoading) {
      isLoading = true
      console.log('🔄 Toiletten: laden...')

      const toiletData = await fetchToiletten()

      const features = toiletData.map(item => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([item.lon, item.lat])),
          name: item.name,
          fee: item.fee,
          access: item.access,
          wheelchair: item.wheelchair,
          opening_hours: item.opening_hours,
          operator: item.operator
        })
        return feature
      })

      source.addFeatures(features)
      dataLoaded = true
      isLoading = false
      console.log(`✓ Toiletten geladen (${features.length} locaties)`)
    }
  })

  return layer
}

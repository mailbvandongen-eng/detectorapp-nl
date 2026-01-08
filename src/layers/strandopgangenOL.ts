import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { Style, Icon } from 'ol/style'

// Cache for localStorage
const CACHE_KEY = 'strandopgangen_cache'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days

interface StrandopgangCache {
  timestamp: number
  data: StrandopgangFeature[]
}

interface StrandopgangFeature {
  lon: number
  lat: number
  name?: string
  ref?: string
  access?: string
  wheelchair?: string
  surface?: string
}

/**
 * Fetch beach access points from OpenStreetMap via Overpass API
 */
async function fetchStrandopgangen(): Promise<StrandopgangFeature[]> {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { timestamp, data } = JSON.parse(cached) as StrandopgangCache
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log(`✓ Strandopgangen loaded from cache (${data.length} locations)`)
        return data
      }
    }
  } catch {
    // Cache read failed
  }

  // Fetch beach access points from Overpass API
  // Strandpalen in NL zijn genummerd (paal 10, 11, etc.) en staan als tourism=information
  const query = `
    [out:json][timeout:45];
    area["ISO3166-1"="NL"]->.nl;
    (
      // Strandpalen - de meest voorkomende manier om strandopgangen te markeren in NL
      nwr["tourism"="information"]["ref"~"^[0-9]"](area.nl);
      // Standaard strandpalen/markers
      nwr["man_made"="marker"]["natural"="beach"](area.nl);
      nwr["tourism"="information"]["information"="guidepost"](area.nl);
      // Strandpaviljoens en resorts (vaak bij opgang)
      nwr["leisure"="beach_resort"](area.nl);
      nwr["amenity"="restaurant"]["beach"](area.nl);
      // Parkeerplaatsen bij strand (goede indicator voor opgang)
      nwr["amenity"="parking"]["name"~"[Ss]trand|[Bb]each|[Dd]uin",i](area.nl);
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

    const features: StrandopgangFeature[] = data.elements
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
          name: tags.name || tags.ref || 'Strandopgang',
          ref: tags.ref,
          access: tags.access,
          wheelchair: tags.wheelchair,
          surface: tags.surface
        }
      })

    // Cache the result
    try {
      const cache: StrandopgangCache = { timestamp: Date.now(), data: features }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch {
      // Cache write failed
    }

    console.log(`✓ Strandopgangen fetched from OSM (${features.length} locations)`)
    return features

  } catch (error) {
    console.warn('⚠ Failed to fetch strandopgangen from Overpass:', error)

    // Try stale cache
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data } = JSON.parse(cached) as StrandopgangCache
        console.log(`✓ Using stale cache (${data.length} locations)`)
        return data
      }
    } catch {
      // No cache
    }

    return []
  }
}

// Create beach access icon SVG - wave/beach themed
function createStrandopgangIcon(): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="#0891b2" stroke="white" stroke-width="2"/>
    <g transform="translate(6, 8)" fill="white">
      <path d="M2 8c2-2 4-2 6 0s4 2 6 0s4-2 6 0" stroke="white" stroke-width="2" fill="none"/>
      <path d="M2 12c2-2 4-2 6 0s4 2 6 0s4-2 6 0" stroke="white" stroke-width="2" fill="none"/>
      <circle cx="10" cy="4" r="3" fill="white"/>
    </g>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// Create style based on zoom
function getStrandopgangStyle(resolution: number): Style {
  let scale = 1.0
  if (resolution > 150) scale = 0.5
  else if (resolution > 75) scale = 0.6
  else if (resolution > 40) scale = 0.7
  else if (resolution > 20) scale = 0.85
  else if (resolution > 10) scale = 1.0
  else scale = 1.2

  return new Style({
    image: new Icon({
      src: createStrandopgangIcon(),
      scale: scale,
      anchor: [0.5, 0.5]
    })
  })
}

/**
 * Strandopgangen in Nederland
 * Bron: OpenStreetMap via Overpass API
 * Uses lazy loading - data is only fetched when layer is first made visible
 */
export async function createStrandopgangenLayerOL() {
  // Start with empty source - data loaded lazily
  const source = new VectorSource()
  let dataLoaded = false
  let isLoading = false

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Strandopgangen', type: 'overlay' },
    visible: false,
    style: (feature, resolution) => getStrandopgangStyle(resolution),
    zIndex: 27
  })

  // Lazy load data when layer becomes visible
  layer.on('change:visible', async () => {
    if (layer.getVisible() && !dataLoaded && !isLoading) {
      isLoading = true
      console.log('🔄 Strandopgangen: laden...')

      const strandData = await fetchStrandopgangen()

      const features = strandData.map(item => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([item.lon, item.lat])),
          name: item.name,
          ref: item.ref,
          access: item.access,
          wheelchair: item.wheelchair,
          surface: item.surface
        })
        return feature
      })

      source.addFeatures(features)
      dataLoaded = true
      isLoading = false
      console.log(`✓ Strandopgangen geladen (${features.length} locaties)`)
    }
  })

  return layer
}

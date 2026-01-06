import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Feature } from 'ol'
import { LineString } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { Style, Stroke } from 'ol/style'

// Cache for localStorage
const CACHE_KEY = 'ruiterpaden_cache'
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000 // 7 days (trails don't change often)

interface RuiterpadCache {
  timestamp: number
  data: RuiterpadFeature[]
}

interface RuiterpadFeature {
  coords: [number, number][]
  name?: string
  surface?: string
  access?: string
}

/**
 * Fetch horse riding trails from OpenStreetMap via Overpass API
 */
async function fetchRuiterpaden(): Promise<RuiterpadFeature[]> {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { timestamp, data } = JSON.parse(cached) as RuiterpadCache
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log(`✓ Ruiterpaden loaded from cache (${data.length} trails)`)
        return data
      }
    }
  } catch {
    // Cache read failed
  }

  // Fetch fresh data from Overpass API
  const query = `
    [out:json][timeout:60];
    area["ISO3166-1"="NL"]->.nl;
    (
      way["highway"="bridleway"](area.nl);
      way["horse"="designated"](area.nl);
      way["horse"="yes"]["highway"~"path|track"](area.nl);
    );
    out geom;
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

    const features: RuiterpadFeature[] = data.elements
      .filter((el: any) => el.type === 'way' && el.geometry && el.geometry.length > 1)
      .map((el: any) => {
        const tags = el.tags || {}
        const coords: [number, number][] = el.geometry.map((g: any) => [g.lon, g.lat])

        return {
          coords,
          name: tags.name || undefined,
          surface: tags.surface,
          access: tags.access
        }
      })

    // Cache the result
    try {
      const cache: RuiterpadCache = { timestamp: Date.now(), data: features }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch {
      // Cache write failed (too large?)
      console.warn('⚠ Could not cache ruiterpaden (too large)')
    }

    console.log(`✓ Ruiterpaden fetched from OSM (${features.length} trails)`)
    return features

  } catch (error) {
    console.warn('⚠ Failed to fetch ruiterpaden from Overpass:', error)

    // Try stale cache
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data } = JSON.parse(cached) as RuiterpadCache
        console.log(`✓ Using stale cache (${data.length} trails)`)
        return data
      }
    } catch {
      // No cache
    }

    return []
  }
}

// Create style based on zoom - horse trail styling (brown dashed line)
function getRuiterpadStyle(resolution: number): Style {
  let width = 3
  if (resolution > 100) width = 1.5
  else if (resolution > 50) width = 2
  else if (resolution > 20) width = 2.5
  else if (resolution > 10) width = 3
  else width = 4

  return new Style({
    stroke: new Stroke({
      color: '#92400e', // Amber-800 (earthy brown)
      width: width,
      lineDash: [8, 4], // Dashed line for trails
      lineCap: 'round',
      lineJoin: 'round'
    })
  })
}

/**
 * Ruiterpaden in Nederland
 * Bron: OpenStreetMap via Overpass API
 * Uses lazy loading - data is only fetched when layer is first made visible
 */
export async function createRuiterpadenLayerOL() {
  // Start with empty source - data loaded lazily
  const source = new VectorSource()
  let dataLoaded = false
  let isLoading = false

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Ruiterpaden', type: 'overlay' },
    visible: false,
    style: (feature, resolution) => getRuiterpadStyle(resolution),
    zIndex: 15 // Below point markers
  })

  // Lazy load data when layer becomes visible
  layer.on('change:visible', async () => {
    if (layer.getVisible() && !dataLoaded && !isLoading) {
      isLoading = true
      console.log('🔄 Ruiterpaden: laden...')

      const ruiterpadData = await fetchRuiterpaden()

      const features = ruiterpadData.map(item => {
        const coords = item.coords.map(c => fromLonLat(c))
        const feature = new Feature({
          geometry: new LineString(coords),
          name: item.name || 'Ruiterpad',
          surface: item.surface,
          access: item.access
        })
        return feature
      })

      source.addFeatures(features)
      dataLoaded = true
      isLoading = false
      console.log(`✓ Ruiterpaden geladen (${features.length} paden)`)
    }
  })

  return layer
}

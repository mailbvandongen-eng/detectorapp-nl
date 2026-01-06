import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import { fromLonLat } from 'ol/proj'
import { LAYER_STYLES } from './iconStyles'

// Cache key for localStorage
const CACHE_KEY = 'kringloopwinkels_cache'
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours in ms

interface KringloopCache {
  timestamp: number
  data: KringloopFeature[]
}

interface KringloopFeature {
  lon: number
  lat: number
  name?: string
  website?: string
  phone?: string
  address?: string
  opening_hours?: string
}

/**
 * Fetch kringloopwinkels from OpenStreetMap via Overpass API
 * Returns cached data if available and fresh
 */
async function fetchKringloopwinkels(): Promise<KringloopFeature[]> {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { timestamp, data } = JSON.parse(cached) as KringloopCache
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log(`✓ Kringloopwinkels loaded from cache (${data.length} locations)`)
        return data
      }
    }
  } catch {
    // Cache read failed, continue to fetch
  }

  // Fetch fresh data from Overpass API
  const query = `
    [out:json][timeout:30];
    area["ISO3166-1"="NL"]->.nl;
    (
      nwr["shop"="second_hand"](area.nl);
      nwr["shop"="charity"](area.nl);
      nwr["second_hand"="yes"](area.nl);
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

    const features: KringloopFeature[] = data.elements
      .filter((el: any) => {
        // Get coordinates - either from node or from center of way/relation
        const lon = el.lon ?? el.center?.lon
        const lat = el.lat ?? el.center?.lat
        return lon && lat
      })
      .map((el: any) => {
        const tags = el.tags || {}
        const lon = el.lon ?? el.center?.lon
        const lat = el.lat ?? el.center?.lat

        // Build address from components
        const addressParts = [
          tags['addr:street'],
          tags['addr:housenumber'],
          tags['addr:postcode'],
          tags['addr:city']
        ].filter(Boolean)

        return {
          lon,
          lat,
          name: tags.name || tags.operator || 'Kringloopwinkel',
          website: tags.website || tags['contact:website'],
          phone: tags.phone || tags['contact:phone'],
          address: addressParts.length > 0 ? addressParts.join(' ') : undefined,
          opening_hours: tags.opening_hours
        }
      })

    // Cache the result
    try {
      const cache: KringloopCache = { timestamp: Date.now(), data: features }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
    } catch {
      // Cache write failed (quota exceeded?), continue anyway
    }

    console.log(`✓ Kringloopwinkels fetched from OSM (${features.length} locations)`)
    return features

  } catch (error) {
    console.warn('⚠ Failed to fetch kringloopwinkels from Overpass:', error)

    // Try to return stale cache if available
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data } = JSON.parse(cached) as KringloopCache
        console.log(`✓ Using stale cache (${data.length} locations)`)
        return data
      }
    } catch {
      // No cache available
    }

    return []
  }
}

/**
 * Kringloopwinkels (thrift stores) in Nederland
 * Bron: OpenStreetMap via Overpass API (live data)
 * ~840+ locaties
 * Uses lazy loading - data is only fetched when layer is first made visible
 */
export async function createKringloopwinkelsLayerOL() {
  // Start with empty source - data loaded lazily
  const source = new VectorSource()
  let dataLoaded = false
  let isLoading = false

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Kringloopwinkels', type: 'overlay' },
    visible: false,
    style: LAYER_STYLES.recycle(),
    zIndex: 27
  })

  // Lazy load data when layer becomes visible
  layer.on('change:visible', async () => {
    if (layer.getVisible() && !dataLoaded && !isLoading) {
      isLoading = true
      console.log('🔄 Kringloopwinkels: laden...')

      const kringloopData = await fetchKringloopwinkels()

      const features = kringloopData.map(item => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([item.lon, item.lat])),
          name: item.name,
          website: item.website,
          phone: item.phone,
          address: item.address,
          opening_hours: item.opening_hours
        })
        return feature
      })

      source.addFeatures(features)
      dataLoaded = true
      isLoading = false
      console.log(`✓ Kringloopwinkels geladen (${features.length} winkels)`)
    }
  })

  return layer
}

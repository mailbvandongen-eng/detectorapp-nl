import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import { Feature } from 'ol'
import { Point } from 'ol/geom'
import proj4 from 'proj4'
import { register } from 'ol/proj/proj4'
import { Style, Icon } from 'ol/style'

// Ensure EPSG:28992 is registered
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')
register(proj4)

// Cache for localStorage
const CACHE_KEY = 'relicten_gelderland_cache_v2'
const CACHE_DURATION = 14 * 24 * 60 * 60 * 1000 // 14 days (data doesn't change often)

interface RelictFeature {
  coords: [number, number] // lon, lat (WGS84)
  type: string
  klasse: number
}

interface RelictCache {
  timestamp: number
  data: RelictFeature[]
}

// Type code to icon mapping
// Type codes are like "KV14", "K21", "B35" - we extract the letter prefix
const TYPE_ICONS: Record<string, { icon: string; color: string; name: string }> = {
  'KV': { icon: 'castle', color: '#7c3aed', name: 'Kasteel/Vesting' },
  'K': { icon: 'church', color: '#9333ea', name: 'Kapel' },
  'M': { icon: 'windmill', color: '#b45309', name: 'Molen' },
  'EK': { icon: 'duck', color: '#0891b2', name: 'Eendenkooi' },
  'H': { icon: 'estate', color: '#4f46e5', name: 'Havezate' },
  'B': { icon: 'farm', color: '#65a30d', name: 'Boerderij' },
  'OB': { icon: 'ruins', color: '#6b7280', name: 'Oude Bebouwing' },
  'WM': { icon: 'watermill', color: '#0284c7', name: 'Watermolen' },
  'BR': { icon: 'bridge', color: '#64748b', name: 'Brug' },
  'S': { icon: 'landmark', color: '#0f766e', name: 'Spoor/Relict' },
  'G': { icon: 'tumulus', color: '#854d0e', name: 'Graf/Heuvel' },
  'T': { icon: 'terp', color: '#0d9488', name: 'Terp' },
  'P': { icon: 'well', color: '#0d9488', name: 'Put/Bron' },
  'V': { icon: 'bunker', color: '#57534e', name: 'Verdediging' }
}

// Default style for unknown types
const DEFAULT_ICON = { icon: 'mapPin', color: '#dc2626', name: 'Onbekend' }

// Lucide icon SVG paths
const LUCIDE_ICONS: Record<string, string> = {
  castle: 'M22 20v-9H2v9M2 14h20M12 11V2M10 2h4M6 11V5M4 5h4M18 11V5M16 5h4M7 14v6M12 14v6M17 14v6',
  church: 'M12 2v4M10 4h4M4 22V12l8-6 8 6v10M4 22h16M9 22v-6h6v6',
  windmill: 'M12 2v20M12 12l8-4M12 12l-8-4M12 12l4 8M12 12l-4 8',
  duck: 'M4 16c0-4 4-8 8-8s8 4 8 8H4zM12 8V4M10 4h4M8 12h8',
  estate: 'M3 21h18M6 21V12l6-5 6 5v9M10 21v-4h4v4M6 12V9M18 12V9M4 9l8-6 8 6',
  watermill: 'M2 16h20M6 16v5M18 16v5M12 2v6M12 8a6 6 0 1 0 0 12M8 14h8',
  well: 'M8 21v-6M16 21v-6M6 15h12M9 15V9a3 3 0 0 1 6 0v6M12 3v2',
  farm: 'M3 21h18M5 21V10l7-7 7 7v11M10 21v-4h4v4',
  bridge: 'M2 18h20M4 18v-4c0-2 3.5-4 8-4s8 2 8 4v4M8 10v8M16 10v8',
  ruins: 'M3 22h4V14h2v8h6v-8h2v8h4M5 14l7-10l7 10M9 10h6',
  landmark: 'M3 22h18M6 18v4M10 18v4M14 18v4M18 18v4M12 2l10 8H2l10-8z',
  tumulus: 'M2 20h20M4 20c0-6 3.5-12 8-12s8 6 8 12',
  terp: 'M2 20h20M4 20c0-5 3-10 8-10s8 5 8 10M10 10v-3h4v3',
  bunker: 'M3 21h18M5 21V7l7-4 7 4v14M9 21V11h6v10M9 11h6M5 7h14',
  mapPin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z'
}

// Create SVG icon with filled circle background
function createFilledIconSvg(iconPath: string, bgColor: string, size: number = 28): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="${bgColor}" stroke="white" stroke-width="2"/>
    <g transform="translate(4, 4) scale(1)">
      <path d="${iconPath}" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// Extract type prefix from full type code (e.g., "KV14" -> "KV", "K21" -> "K")
function extractTypePrefix(typeCode: string): string {
  if (!typeCode) return ''
  // Match letters at start, up to 2 characters
  const match = typeCode.match(/^([A-Z]{1,2})/)
  return match ? match[1] : ''
}

// Get style for a feature based on its type
function getRelictStyle(typeCode: string, resolution: number): Style {
  const prefix = extractTypePrefix(typeCode)
  const iconInfo = TYPE_ICONS[prefix] || DEFAULT_ICON
  const iconPath = LUCIDE_ICONS[iconInfo.icon] || LUCIDE_ICONS.mapPin

  // Scale based on zoom
  let scale = 1.0
  if (resolution > 100) scale = 0.5
  else if (resolution > 50) scale = 0.6
  else if (resolution > 20) scale = 0.8
  else if (resolution > 10) scale = 0.9

  const svgSrc = createFilledIconSvg(iconPath, iconInfo.color)

  return new Style({
    image: new Icon({
      src: svgSrc,
      scale: scale,
      anchor: [0.5, 0.5]
    })
  })
}

// Style cache to avoid recreating styles
const styleCache = new Map<string, Style>()

function getCachedStyle(typeCode: string, resolution: number): Style {
  // Round resolution to nearest 10 for caching
  const roundedRes = Math.round(resolution / 10) * 10
  const cacheKey = `${extractTypePrefix(typeCode)}-${roundedRes}`

  let style = styleCache.get(cacheKey)
  if (!style) {
    style = getRelictStyle(typeCode, resolution)
    styleCache.set(cacheKey, style)
  }
  return style
}

/**
 * Fetch Relicten data from Gelderland WFS service
 */
async function fetchRelicten(): Promise<RelictFeature[]> {
  // Check cache first
  try {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      const { timestamp, data } = JSON.parse(cached) as RelictCache
      if (Date.now() - timestamp < CACHE_DURATION) {
        console.log(`✓ Relicten Gelderland loaded from cache (${data.length} features)`)
        return data
      }
    }
  } catch {
    // Cache read failed
  }

  // Fetch from WFS
  const wfsUrl = 'https://geoserver.gelderland.nl/geoserver/ngr_a/wfs?' +
    'service=WFS&version=2.0.0&request=GetFeature' +
    '&typeName=ChAr_Relictenkaart_p' +
    '&outputFormat=application/json'

  try {
    console.log('🔄 Relicten Gelderland: laden van WFS...')
    const response = await fetch(wfsUrl)

    if (!response.ok) {
      throw new Error(`WFS error: ${response.status}`)
    }

    const data = await response.json()

    const features: RelictFeature[] = data.features
      .filter((f: any) => f.geometry && f.geometry.coordinates)
      .map((f: any) => {
        // Convert RD (EPSG:28992) to WGS84 (EPSG:4326)
        const rdCoords = f.geometry.coordinates
        const wgs84 = proj4('EPSG:28992', 'EPSG:4326', rdCoords)

        return {
          coords: wgs84 as [number, number],
          type: f.properties.type || '',
          klasse: f.properties.klasse || 0
        }
      })

    // Cache the result
    try {
      const cache: RelictCache = { timestamp: Date.now(), data: features }
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
      console.log(`✓ Relicten Gelderland cached (${features.length} features)`)
    } catch {
      console.warn('⚠ Could not cache Relicten Gelderland (too large)')
    }

    console.log(`✓ Relicten Gelderland fetched from WFS (${features.length} features)`)
    return features

  } catch (error) {
    console.warn('⚠ Failed to fetch Relicten Gelderland:', error)

    // Try stale cache
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (cached) {
        const { data } = JSON.parse(cached) as RelictCache
        console.log(`✓ Using stale cache (${data.length} features)`)
        return data
      }
    } catch {
      // No cache
    }

    return []
  }
}

/**
 * Relictenkaart Punten Gelderland - met eigen iconen
 * Havezaten, molens, eendenkooien, kastelen, kapellen, etc.
 * Bron: Provincie Gelderland via WFS
 * Uses lazy loading - data is only fetched when layer is first made visible
 */
export async function createRelictenPuntenLayerOL() {
  // Start with empty source - data loaded lazily
  const source = new VectorSource()
  let dataLoaded = false
  let isLoading = false

  const layer = new VectorLayer({
    source: source,
    properties: { title: 'Relictenkaart Punten', type: 'overlay' },
    visible: false,
    style: (feature, resolution) => {
      const typeCode = feature.get('type') || ''
      return getCachedStyle(typeCode, resolution)
    },
    zIndex: 20,
    maxResolution: 150 // Alleen tonen vanaf ~10km hoogte
  })

  // Lazy load data when layer becomes visible
  layer.on('change:visible', async () => {
    if (layer.getVisible() && !dataLoaded && !isLoading) {
      isLoading = true

      const relictData = await fetchRelicten()

      const features = relictData.map(item => {
        // Convert lon/lat to Web Mercator
        const mercator = proj4('EPSG:4326', 'EPSG:3857', item.coords)
        const feature = new Feature({
          geometry: new Point(mercator),
          type: item.type,
          klasse: item.klasse
        })
        return feature
      })

      source.addFeatures(features)
      dataLoaded = true
      isLoading = false
      console.log(`✓ Relictenkaart Punten geladen (${features.length} punten)`)
    }
  })

  return layer
}

// Export type info for popup usage
export const RELICT_TYPE_INFO = TYPE_ICONS

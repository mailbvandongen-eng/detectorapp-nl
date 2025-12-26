/**
 * AHN Height Query Worker
 * Queries PDOK AHN WMS GetFeatureInfo to get elevation at a point
 */

interface Env {
  PDOK_WMS_URL: string
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(request.url)

    // Get coordinates from query params
    const lat = parseFloat(url.searchParams.get('lat') || '')
    const lon = parseFloat(url.searchParams.get('lon') || '')

    if (isNaN(lat) || isNaN(lon)) {
      return new Response(JSON.stringify({ error: 'Missing lat/lon parameters' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Validate coordinates are within Netherlands bounds
    if (lat < 50.5 || lat > 53.7 || lon < 3.3 || lon > 7.3) {
      return new Response(JSON.stringify({
        error: 'Coordinates outside Netherlands',
        height: null
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    try {
      // Convert lat/lon to Web Mercator (EPSG:3857) for WMS request
      const x = lon * 20037508.34 / 180
      const y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180) * 20037508.34 / 180

      // Create a small bbox around the point (1m buffer)
      const buffer = 0.5 // meters in web mercator
      const bbox = `${x - buffer},${y - buffer},${x + buffer},${y + buffer}`

      // Build WMS GetFeatureInfo request
      const wmsParams = new URLSearchParams({
        SERVICE: 'WMS',
        VERSION: '1.3.0',
        REQUEST: 'GetFeatureInfo',
        LAYERS: 'dtm_05m',
        QUERY_LAYERS: 'dtm_05m',
        INFO_FORMAT: 'application/json',
        CRS: 'EPSG:3857',
        BBOX: bbox,
        WIDTH: '1',
        HEIGHT: '1',
        I: '0',
        J: '0'
      })

      const wmsUrl = `${env.PDOK_WMS_URL}?${wmsParams.toString()}`

      const response = await fetch(wmsUrl, {
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        // Try alternative: GetMap with single pixel and read response
        return await getHeightViaGetMap(env.PDOK_WMS_URL, lat, lon, corsHeaders)
      }

      const data = await response.json() as { features?: Array<{ properties?: { GRAY_INDEX?: number } }> }

      // Extract height from response
      let height: number | null = null
      if (data.features && data.features.length > 0) {
        const feature = data.features[0]
        // AHN returns GRAY_INDEX as the elevation value
        height = feature.properties?.GRAY_INDEX ?? null
      }

      return new Response(JSON.stringify({
        lat,
        lon,
        height,
        unit: 'm NAP'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } catch (error) {
      console.error('Error fetching height:', error)
      return new Response(JSON.stringify({
        error: 'Failed to fetch height data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
  }
}

// Fallback: Get height by requesting a single-pixel GetMap and reading the value
async function getHeightViaGetMap(
  wmsUrl: string,
  lat: number,
  lon: number,
  corsHeaders: Record<string, string>
): Promise<Response> {
  // Convert to RD (Dutch grid) for better accuracy
  // Using approximate transformation
  const { x: rdX, y: rdY } = wgs84ToRd(lat, lon)

  // Create 1m bbox around point in RD coordinates
  const buffer = 0.5
  const bbox = `${rdX - buffer},${rdY - buffer},${rdX + buffer},${rdY + buffer}`

  const wmsParams = new URLSearchParams({
    SERVICE: 'WMS',
    VERSION: '1.3.0',
    REQUEST: 'GetFeatureInfo',
    LAYERS: 'dtm_05m',
    QUERY_LAYERS: 'dtm_05m',
    INFO_FORMAT: 'text/plain',
    CRS: 'EPSG:28992',
    BBOX: bbox,
    WIDTH: '1',
    HEIGHT: '1',
    I: '0',
    J: '0'
  })

  const response = await fetch(`${wmsUrl}?${wmsParams.toString()}`)
  const text = await response.text()

  // Parse the text response for elevation value
  // Format is typically "GRAY_INDEX = 1.234" or similar
  const match = text.match(/[-+]?\d*\.?\d+/)
  const height = match ? parseFloat(match[0]) : null

  return new Response(JSON.stringify({
    lat,
    lon,
    height,
    unit: 'm NAP'
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

// Approximate WGS84 to RD (EPSG:28992) transformation
// For better accuracy, use proj4 library
function wgs84ToRd(lat: number, lon: number): { x: number, y: number } {
  // Reference point: Amersfoort
  const refLat = 52.15517440
  const refLon = 5.38720621
  const refX = 155000
  const refY = 463000

  const dLat = (lat - refLat) * 3600 // in arc seconds
  const dLon = (lon - refLon) * 3600

  // Polynomial coefficients (simplified)
  const x = refX +
    190094.945 * dLon +
    -11832.228 * dLat * dLon +
    -114.221 * dLat * dLat * dLon +
    -32.391 * dLon * dLon * dLon

  const y = refY +
    309056.544 * dLat +
    3638.893 * dLon * dLon +
    72.915 * dLat * dLon * dLon +
    -157.984 * dLat * dLat * dLat

  return { x, y }
}

import { Map } from 'ol'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import { Fill, Stroke, Style } from 'ol/style'
import { GeoJSON } from 'ol/format'
import { toLonLat } from 'ol/proj'
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'
import type { Polygon, MultiPolygon } from 'ol/geom'
import ImageLayer from 'ol/layer/Image'
import ImageArcGISRest from 'ol/source/ImageArcGISRest'
import type { RenderEvent } from 'ol/render/Event'

// Version for debugging
console.log('📦 parcelHighlight.ts v3.1 loaded - fixed pixelRatio for Android')

// Register RD projection with both proj4 and OpenLayers
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')
register(proj4)

// Store reference to the layers and geometry for clipping
let hillshadeLayer: ImageLayer<ImageArcGISRest> | null = null
let outlineLayer: VectorLayer<VectorSource> | null = null
let clipGeometry: Polygon | MultiPolygon | null = null

/**
 * Clear any existing parcel highlight from the map
 */
export function clearParcelHighlight(map: Map) {
  if (hillshadeLayer) {
    map.removeLayer(hillshadeLayer)
    hillshadeLayer = null
  }
  if (outlineLayer) {
    map.removeLayer(outlineLayer)
    outlineLayer = null
  }
  clipGeometry = null
}

/**
 * Fetch parcel geometry from BRP WFS and show height map overlay
 * Shows hillshade within parcel bounding box with parcel outline
 */
export async function showParcelHeightMap(
  map: Map,
  coordinate: number[]
): Promise<boolean> {
  try {
    // Convert click coordinate to RD
    const lonLat = toLonLat(coordinate)
    console.log(`🖱️ Click (3857): ${coordinate[0].toFixed(0)}, ${coordinate[1].toFixed(0)}`)
    console.log(`🖱️ LonLat (WGS84): ${lonLat[0].toFixed(5)}, ${lonLat[1].toFixed(5)}`)

    const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
    console.log(`🖱️ RD (28992): ${rd ? rd[0].toFixed(0) + ', ' + rd[1].toFixed(0) : 'FAILED'}`)

    // Check if within Netherlands bounds
    if (!rd || rd[0] < 7000 || rd[0] > 300000 || rd[1] < 289000 || rd[1] > 629000) {
      console.error('❌ Coordinate outside Netherlands or transformation failed:', rd)
      return false
    }

    // Clear any existing highlight
    clearParcelHighlight(map)

    // Fetch parcel geometry via WFS with BBOX filter (more reliable than CQL_FILTER)
    const buffer = 1 // 1 meter buffer around click point
    const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`
    const cacheBuster = Date.now()
    const wfsUrl = `https://service.pdok.nl/rvo/brpgewaspercelen/wfs/v1_0?` +
      `SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=brpgewaspercelen:BrpGewas&` +
      `OUTPUTFORMAT=json&SRSNAME=EPSG:28992&` +
      `BBOX=${bbox},EPSG:28992&_=${cacheBuster}`
    console.log('🌐 WFS URL:', wfsUrl)

    // Add timeout to prevent hanging
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    const response = await fetch(wfsUrl, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      console.error('WFS request failed:', response.status)
      return false
    }

    const data = await response.json()
    console.log('📥 WFS RESPONSE:', JSON.stringify(data).substring(0, 500))

    if (!data.features || data.features.length === 0) {
      console.log('No parcel found at location')
      return false
    }

    // Get the parcel feature
    const parcelFeature = data.features[0]
    console.log('📥 PARCEL ID:', parcelFeature.id || parcelFeature.properties?.id || 'geen ID')
    console.log('📥 PARCEL BBOX:', JSON.stringify(parcelFeature.bbox || 'geen bbox'))

    // Parse the geometry (in RD coordinates → Web Mercator)
    const geojsonFormat = new GeoJSON()
    const feature = geojsonFormat.readFeature(parcelFeature, {
      dataProjection: 'EPSG:28992',
      featureProjection: 'EPSG:3857'
    })

    const geometry = feature.getGeometry() as Polygon | MultiPolygon
    if (!geometry) {
      console.log('No geometry in parcel feature')
      return false
    }

    // Debug: log parcel info
    const props = parcelFeature.properties || {}
    console.log(`📍 Parcel: ${props.category || 'unknown'} - ${props.gewasnaam || props.gewas || 'geen gewas'}`)
    console.log(`📍 Geometry type: ${geometry.getType()}, extent: ${geometry.getExtent().map((v: number) => v.toFixed(0)).join(', ')}`)

    // Get extent for the hillshade layer
    const extent = geometry.getExtent()

    // Buffer the extent slightly for the hillshade
    const width = extent[2] - extent[0]
    const height = extent[3] - extent[1]
    const hillshadeBuffer = Math.max(width, height) * 0.05
    const hillshadeExtent: [number, number, number, number] = [
      extent[0] - hillshadeBuffer,
      extent[1] - hillshadeBuffer,
      extent[2] + hillshadeBuffer,
      extent[3] + hillshadeBuffer
    ]

    // Buffer for zooming (larger)
    const zoomBuffer = Math.max(width, height) * 0.3
    const zoomExtent: [number, number, number, number] = [
      extent[0] - zoomBuffer,
      extent[1] - zoomBuffer,
      extent[2] + zoomBuffer,
      extent[3] + zoomBuffer
    ]

    // Store geometry for clipping
    clipGeometry = geometry

    // Create colored elevation layer with polygon clipping
    // Using AHN4 DTM 50cm from Esri Nederland ImageServer with DYNAMIC color ramp
    hillshadeLayer = new ImageLayer({
      source: new ImageArcGISRest({
        url: 'https://ahn.arcgisonline.nl/arcgis/rest/services/Hoogtebestand/AHN4_DTM_50cm/ImageServer',
        params: {
          renderingRule: JSON.stringify({
            rasterFunction: 'AHN - Color Ramp D'  // DYNAMISCH! blauw→groen→geel→bruin
          })
        },
        crossOrigin: 'anonymous'
      }),
      extent: hillshadeExtent,
      zIndex: 998
    })

    // Add canvas clipping to render only within polygon
    hillshadeLayer.on('prerender', (evt: RenderEvent) => {
      if (!clipGeometry) return
      const ctx = evt.context as CanvasRenderingContext2D
      if (!ctx) return

      const frameState = evt.frameState
      if (!frameState) return

      ctx.save()
      ctx.beginPath()

      // Get polygon coordinates and convert to render pixels using frameState
      const coords = clipGeometry.getType() === 'Polygon'
        ? (clipGeometry as Polygon).getCoordinates()[0]
        : (clipGeometry as MultiPolygon).getCoordinates()[0][0]

      // Use map's getPixelFromCoordinate for accurate conversion
      // This handles all transforms including pixelRatio correctly
      coords.forEach((coord, i) => {
        const pixel = map.getPixelFromCoordinate(coord)
        if (!pixel) return

        // Apply pixelRatio to convert CSS pixels to device pixels
        // The canvas is scaled by pixelRatio, so we need to scale the coordinates
        const pixelRatio = frameState.pixelRatio
        const px = pixel[0] * pixelRatio
        const py = pixel[1] * pixelRatio

        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      })

      ctx.closePath()
      ctx.clip()
    })

    hillshadeLayer.on('postrender', (evt: RenderEvent) => {
      const ctx = evt.context as CanvasRenderingContext2D
      if (ctx) {
        ctx.restore()
      }
    })

    // Add hillshade layer to map
    map.addLayer(hillshadeLayer)

    // Create vector layer with parcel outline (on top)
    const vectorSource = new VectorSource({
      features: [feature]
    })

    outlineLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0)' // transparent fill to show hillshade
        }),
        stroke: new Stroke({
          color: '#dc2626', // red outline
          width: 3
        })
      }),
      zIndex: 999
    })

    // Add outline layer to map
    map.addLayer(outlineLayer)

    // Don't zoom - just show the overlay in place
    console.log('✅ Parcel height map displayed')
    return true

  } catch (error) {
    console.error('Failed to show parcel height map:', error)
    return false
  }
}

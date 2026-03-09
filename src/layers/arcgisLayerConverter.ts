/**
 * ArcGIS Layer Converter
 *
 * Universele converter die declaratieve layer configs omzet naar ArcGIS SDK layers.
 * Ondersteunt: WMS, GeoJSON, XYZ tiles, ImageServer
 *
 * @see Migratie plan: .claude/notes.md
 */

import WMSLayer from '@arcgis/core/layers/WMSLayer'
import GeoJSONLayer from '@arcgis/core/layers/GeoJSONLayer'
import WebTileLayer from '@arcgis/core/layers/WebTileLayer'
import ImageryLayer from '@arcgis/core/layers/ImageryLayer'
import type Layer from '@arcgis/core/layers/Layer'
import SimpleRenderer from '@arcgis/core/renderers/SimpleRenderer'
import UniqueValueRenderer from '@arcgis/core/renderers/UniqueValueRenderer'
import PictureMarkerSymbol from '@arcgis/core/symbols/PictureMarkerSymbol'
import SimpleMarkerSymbol from '@arcgis/core/symbols/SimpleMarkerSymbol'
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol'
import SimpleFillSymbol from '@arcgis/core/symbols/SimpleFillSymbol'
import { engineLog } from '../config/mapEngineConfig'

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ArcGISLayerType = 'wms' | 'geojson' | 'webtile' | 'imagery'

export interface WMSLayerConfig {
  type: 'wms'
  url: string
  sublayers: string[]  // Layer names
  title: string
  opacity?: number
  visible?: boolean
  minZoom?: number
  maxZoom?: number
  // Custom properties for popup handling
  queryable?: boolean
  queryUrl?: string
  queryType?: 'wms-getfeatureinfo' | 'arcgis-rest'
}

export interface GeoJSONLayerConfig {
  type: 'geojson'
  url: string  // URL to GeoJSON file
  title: string
  opacity?: number
  visible?: boolean
  zIndex?: number
  // Renderer config
  renderer?: RendererConfig
  // Popup template
  popupEnabled?: boolean
  popupTitle?: string
  popupContent?: string | ((feature: any) => string)
}

export interface WebTileLayerConfig {
  type: 'webtile'
  urlTemplate: string  // e.g., 'https://tiles.example.com/{z}/{x}/{y}.png'
  title: string
  opacity?: number
  visible?: boolean
  minZoom?: number
  maxZoom?: number
  attributions?: string
}

export interface ImageryLayerConfig {
  type: 'imagery'
  url: string  // ImageServer URL
  title: string
  opacity?: number
  visible?: boolean
  renderingRule?: object  // ArcGIS rendering rule
  attributions?: string
}

export type LayerConfig = WMSLayerConfig | GeoJSONLayerConfig | WebTileLayerConfig | ImageryLayerConfig

// ============================================
// RENDERER DEFINITIONS
// ============================================

export interface SimpleRendererConfig {
  type: 'simple'
  symbol: SymbolConfig
}

export interface UniqueValueRendererConfig {
  type: 'unique-value'
  field: string
  defaultSymbol: SymbolConfig
  uniqueValueInfos: Array<{
    value: string | number
    symbol: SymbolConfig
    label?: string
  }>
}

export type RendererConfig = SimpleRendererConfig | UniqueValueRendererConfig

// ============================================
// SYMBOL DEFINITIONS
// ============================================

export interface PictureMarkerConfig {
  type: 'picture-marker'
  url: string  // SVG data URL or image URL
  width: number
  height: number
}

export interface SimpleMarkerConfig {
  type: 'simple-marker'
  style: 'circle' | 'square' | 'diamond' | 'cross' | 'x'
  color: [number, number, number, number]  // RGBA
  size: number
  outline?: {
    color: [number, number, number, number]
    width: number
  }
}

export interface SimpleLineConfig {
  type: 'simple-line'
  color: [number, number, number, number]
  width: number
  style?: 'solid' | 'dash' | 'dot'
}

export interface SimpleFillConfig {
  type: 'simple-fill'
  color: [number, number, number, number]
  outline?: SimpleLineConfig
}

export type SymbolConfig = PictureMarkerConfig | SimpleMarkerConfig | SimpleLineConfig | SimpleFillConfig

// ============================================
// SYMBOL CONVERTER
// ============================================

function createSymbol(config: SymbolConfig): __esri.Symbol {
  switch (config.type) {
    case 'picture-marker':
      return new PictureMarkerSymbol({
        url: config.url,
        width: config.width,
        height: config.height
      })

    case 'simple-marker':
      return new SimpleMarkerSymbol({
        style: config.style,
        color: config.color,
        size: config.size,
        outline: config.outline ? {
          color: config.outline.color,
          width: config.outline.width
        } : undefined
      })

    case 'simple-line':
      return new SimpleLineSymbol({
        color: config.color,
        width: config.width,
        style: config.style || 'solid'
      })

    case 'simple-fill':
      return new SimpleFillSymbol({
        color: config.color,
        outline: config.outline ? new SimpleLineSymbol({
          color: config.outline.color,
          width: config.outline.width,
          style: config.outline.style || 'solid'
        }) : undefined
      })

    default:
      throw new Error(`Unknown symbol type: ${(config as any).type}`)
  }
}

// ============================================
// RENDERER CONVERTER
// ============================================

function createRenderer(config: RendererConfig): __esri.Renderer {
  switch (config.type) {
    case 'simple':
      return new SimpleRenderer({
        symbol: createSymbol(config.symbol) as any
      })

    case 'unique-value':
      return new UniqueValueRenderer({
        field: config.field,
        defaultSymbol: createSymbol(config.defaultSymbol) as any,
        uniqueValueInfos: config.uniqueValueInfos.map(info => ({
          value: info.value,
          symbol: createSymbol(info.symbol) as any,
          label: info.label
        }))
      })

    default:
      throw new Error(`Unknown renderer type: ${(config as any).type}`)
  }
}

// ============================================
// LAYER CONVERTERS
// ============================================

function createWMSLayer(config: WMSLayerConfig): WMSLayer {
  const layer = new WMSLayer({
    url: config.url,
    title: config.title,
    sublayers: config.sublayers.map(name => ({ name })),
    opacity: config.opacity ?? 1,
    visible: config.visible ?? false
  })

  // Store custom properties for popup handling
  if (config.queryable) {
    layer.set('queryable', true)
    layer.set('queryUrl', config.queryUrl)
    layer.set('queryType', config.queryType)
  }

  engineLog(`Created WMS layer: ${config.title}`, config.url)
  return layer
}

function createGeoJSONLayer(config: GeoJSONLayerConfig): GeoJSONLayer {
  const layerOptions: __esri.GeoJSONLayerProperties = {
    url: config.url,
    title: config.title,
    opacity: config.opacity ?? 1,
    visible: config.visible ?? false,
    popupEnabled: config.popupEnabled ?? true
  }

  // Add renderer if specified
  if (config.renderer) {
    layerOptions.renderer = createRenderer(config.renderer)
  }

  // Add popup template if specified
  if (config.popupTitle || config.popupContent) {
    layerOptions.popupTemplate = {
      title: config.popupTitle || '{name}',
      content: typeof config.popupContent === 'string'
        ? config.popupContent
        : '{*}'  // Show all attributes
    }
  }

  const layer = new GeoJSONLayer(layerOptions)

  engineLog(`Created GeoJSON layer: ${config.title}`, config.url)
  return layer
}

function createWebTileLayer(config: WebTileLayerConfig): WebTileLayer {
  const layer = new WebTileLayer({
    urlTemplate: config.urlTemplate,
    title: config.title,
    opacity: config.opacity ?? 1,
    visible: config.visible ?? false
  })

  if (config.attributions) {
    layer.copyright = config.attributions
  }

  engineLog(`Created WebTile layer: ${config.title}`, config.urlTemplate)
  return layer
}

function createImageryLayer(config: ImageryLayerConfig): ImageryLayer {
  const nav = typeof navigator !== 'undefined' ? (navigator as any) : null
  const connection = nav?.connection
  const effectiveType = connection?.effectiveType as string | undefined
  const saveData = Boolean(connection?.saveData)
  const lowBandwidth = saveData || effectiveType === 'slow-2g' || effectiveType === '2g' || effectiveType === '3g'

  // Use type assertion for layerOptions since renderingRule is valid but not in TS types
  const layerOptions: any = {
    url: config.url,
    title: config.title,
    opacity: config.opacity ?? 1,
    visible: config.visible ?? false,
    // Prefer lighter payloads on poor mobile connections.
    format: lowBandwidth ? 'jpg' : 'jpgpng',
    compressionQuality: lowBandwidth ? 55 : 75
  }

  // renderingRule is a valid ImageryLayer property for server-side rendering
  if (config.renderingRule) {
    layerOptions.renderingRule = config.renderingRule
  }

  const layer = new ImageryLayer(layerOptions)

  if (config.attributions) {
    layer.copyright = config.attributions
  }

  engineLog(`Created Imagery layer: ${config.title}`, config.url)
  return layer
}

// ============================================
// MAIN CONVERTER FUNCTION
// ============================================

/**
 * Convert a declarative layer config to an ArcGIS SDK layer
 */
export function convertToArcGISLayer(config: LayerConfig): Layer {
  switch (config.type) {
    case 'wms':
      return createWMSLayer(config)
    case 'geojson':
      return createGeoJSONLayer(config)
    case 'webtile':
      return createWebTileLayer(config)
    case 'imagery':
      return createImageryLayer(config)
    default:
      throw new Error(`Unknown layer type: ${(config as any).type}`)
  }
}

/**
 * Batch convert multiple layer configs
 */
export function convertLayersToArcGIS(configs: LayerConfig[]): Layer[] {
  return configs.map(config => convertToArcGISLayer(config))
}

// ============================================
// STYLE HELPERS - Convert OL icon SVGs to ArcGIS symbols
// ============================================

/**
 * Create an SVG data URL for use as PictureMarkerSymbol
 * Mirrors the approach used in iconStyles.ts
 */
export function createSvgDataUrl(
  iconPath: string,
  bgColor: string,
  iconColor: string = 'white',
  size: number = 32
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="${bgColor}" stroke="white" stroke-width="2"/>
    <g transform="translate(4, 4) scale(1)">
      <path d="${iconPath}" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

/**
 * Create a PictureMarkerSymbol config from an icon path
 */
export function createIconSymbolConfig(
  iconPath: string,
  bgColor: string,
  iconColor: string = 'white',
  size: number = 28
): PictureMarkerConfig {
  return {
    type: 'picture-marker',
    url: createSvgDataUrl(iconPath, bgColor, iconColor, size),
    width: size,
    height: size
  }
}

// ============================================
// LUCIDE ICONS (copied from iconStyles.ts for reference)
// ============================================

export const ARCGIS_ICONS = {
  dolmen: 'M4 20V12M20 20V12M2 12h20M4 12l2-2M20 12l-2-2M8 20V14M16 20V14',
  church: 'M12 2v4M10 4h4M4 22V12l8-6 8 6v10M4 22h16M9 22v-6h6v6',
  crossedSwords: 'M6 4l12 16M18 4L6 20M4 6l4-2M20 6l-4-2M4 18l4 2M20 18l-4 2',
  ammonite: 'M12 12a2 2 0 1 0 0-4M12 8a4 4 0 1 0 0 8M12 16a6 6 0 1 0 0-12M12 4a8 8 0 1 0 8 8',
  castle: 'M22 20v-9H2v9M2 14h20M12 11V2M10 2h4M6 11V5M4 5h4M18 11V5M16 5h4M7 14v6M12 14v6M17 14v6',
  bunker: 'M3 21h18M5 21V7l7-4 7 4v14M9 21V11h6v10M9 11h6M5 7h14',
  tumulus: 'M2 20h20M4 20c0-6 3.5-12 8-12s8 6 8 12',
  mapPin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',
  museum: 'M3 22h18M4 22V8l8-5 8 5v14M10 22v-4a2 2 0 0 1 4 0v4M8 11h.01M16 11h.01',
  baby: 'M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5M12 2a8 8 0 0 0-8 8v12h16V10a8 8 0 0 0-8-8z',
  recycle: 'M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5M11.5 3h1l4.243 7.346M16 12l3.185 5.5a1.786 1.786 0 0 1-.004 1.784 1.83 1.83 0 0 1-1.57.881H12.5M7.5 12l4.243-7.346M9.371 21h5.258M12 21v-5.5M7.5 12H3M16 12h5M7.5 12l2.5 4.5M16 12l-2.5 4.5',
  ruins: 'M3 22h4V14h2v8h6v-8h2v8h4M5 14l7-10l7 10M9 10h6',
}

// ============================================
// PREDEFINED RENDERER CONFIGS
// ============================================

export const ARCGIS_RENDERERS = {
  hunebed: (): SimpleRendererConfig => ({
    type: 'simple',
    symbol: createIconSymbolConfig(ARCGIS_ICONS.dolmen, '#78716c', 'white', 28)
  }),

  bunker: (): SimpleRendererConfig => ({
    type: 'simple',
    symbol: createIconSymbolConfig(ARCGIS_ICONS.bunker, '#57534e', 'white', 26)
  }),

  grafheuvel: (): SimpleRendererConfig => ({
    type: 'simple',
    symbol: createIconSymbolConfig(ARCGIS_ICONS.tumulus, '#854d0e', 'white', 26)
  }),

  castle: (): SimpleRendererConfig => ({
    type: 'simple',
    symbol: createIconSymbolConfig(ARCGIS_ICONS.castle, '#7c3aed', 'white', 28)
  }),

  museum: (): SimpleRendererConfig => ({
    type: 'simple',
    symbol: createIconSymbolConfig(ARCGIS_ICONS.museum, '#8b5cf6', 'white', 26)
  }),

  playground: (): SimpleRendererConfig => ({
    type: 'simple',
    symbol: createIconSymbolConfig(ARCGIS_ICONS.baby, '#f97316', 'white', 24)
  }),

  recycle: (): SimpleRendererConfig => ({
    type: 'simple',
    symbol: createIconSymbolConfig(ARCGIS_ICONS.recycle, '#84cc16', 'white', 26)
  }),

  church: (): SimpleRendererConfig => ({
    type: 'simple',
    symbol: createIconSymbolConfig(ARCGIS_ICONS.church, '#7c3aed', 'white', 26)
  }),

  slagveld: (): SimpleRendererConfig => ({
    type: 'simple',
    symbol: createIconSymbolConfig(ARCGIS_ICONS.crossedSwords, '#b91c1c', 'white', 26)
  }),

  fossil: (): SimpleRendererConfig => ({
    type: 'simple',
    symbol: createIconSymbolConfig(ARCGIS_ICONS.ammonite, '#92400e', 'white', 26)
  }),

  ruins: (): SimpleRendererConfig => ({
    type: 'simple',
    symbol: createIconSymbolConfig(ARCGIS_ICONS.ruins, '#6b7280', 'white', 26)
  }),

  // Simple colored markers for generic use
  simpleMarker: (color: [number, number, number, number], size: number = 12): SimpleRendererConfig => ({
    type: 'simple',
    symbol: {
      type: 'simple-marker',
      style: 'circle',
      color,
      size,
      outline: { color: [255, 255, 255, 1], width: 2 }
    }
  }),

  // Line renderer for paths/routes
  simpleLine: (color: [number, number, number, number], width: number = 3): SimpleRendererConfig => ({
    type: 'simple',
    symbol: {
      type: 'simple-line',
      color,
      width,
      style: 'solid'
    }
  }),

  // Fill renderer for polygons
  simpleFill: (fillColor: [number, number, number, number], outlineColor: [number, number, number, number] = [0, 0, 0, 1]): SimpleRendererConfig => ({
    type: 'simple',
    symbol: {
      type: 'simple-fill',
      color: fillColor,
      outline: {
        type: 'simple-line',
        color: outlineColor,
        width: 1
      }
    }
  })
}

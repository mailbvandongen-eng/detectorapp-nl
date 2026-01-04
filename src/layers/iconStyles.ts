import { Style, Icon } from 'ol/style'
import type { FeatureLike } from 'ol/Feature'

// Lucide icon SVG paths (24x24 viewBox)
export const LUCIDE_ICONS = {
  // Archaeological / Historical
  landmark: 'M3 22h18M6 18v4M10 18v4M14 18v4M18 18v4M12 2l10 8H2l10-8z',
  pickaxe: 'M14.531 12.469 6.619 20.38a1 1 0 1 1-1.414-1.414l7.911-7.912M15.686 4.314A2 2 0 0 0 14.272 3h-.529a2 2 0 0 1-1.414-.586l-.828-.828a2 2 0 0 0-2.828 0l-.828.828a2 2 0 0 1-1.414.586H5.9a2 2 0 0 0-1.414.586L2.172 5.9a2 2 0 0 0 0 2.828l.828.828A2 2 0 0 1 3.586 11v.529a2 2 0 0 0 .586 1.414l2.828 2.828a2 2 0 0 0 2.828 0l7.172-7.172a2 2 0 0 0 0-2.828l-1.314-1.457z',
  castle: 'M22 20v-9H2v9M2 14h20M12 11V2M10 2h4M6 11V5M4 5h4M18 11V5M16 5h4M7 14v6M12 14v6M17 14v6',
  mapPin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z',

  // Custom icons - Archeologie & Erfgoed
  dolmen: 'M4 20V12M20 20V12M2 12h20M4 12l2-2M20 12l-2-2M8 20V14M16 20V14',  // Hunebed: 3 staande stenen met deksteen
  church: 'M12 2v4M10 4h4M4 22V12l8-6 8 6v10M4 22h16M9 22v-6h6v6',  // Kerk met toren en kruis
  crossedSwords: 'M6 4l12 16M18 4L6 20M4 6l4-2M20 6l-4-2M4 18l4 2M20 18l-4 2',  // Gekruiste zwaarden voor slagvelden

  // Fossielen & Mineralen
  ammonite: 'M12 12a2 2 0 1 0 0-4M12 8a4 4 0 1 0 0 8M12 16a6 6 0 1 0 0-12M12 4a8 8 0 1 0 8 8',  // Ammonieten spiraal
  sharkTooth: 'M12 3L6 21M12 3l6 18M6 21h12M9 15l3-8M15 15l-3-8',  // Haaientand driehoek
  crystal: 'M12 2L8 7v10l4 5 4-5V7l-4-5M8 7h8M8 17h8',  // Kristalvorm voor mineralen

  // Approval / Permission
  thumbsUp: 'M7 10v12M15 5.88L14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z',
  checkCircle: 'M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3',
  shovel: 'M2 22l6-6M9 8l4-4c1-1 3-1 4 0l3 3c1 1 1 3 0 4l-4 4M9.5 8.5L15.5 14.5',

  // Recreation
  baby: 'M9 12h.01M15 12h.01M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5M12 2a8 8 0 0 0-8 8v12h16V10a8 8 0 0 0-8-8z',
  trees: 'M10 10v.01M14 6v.01M13 13.01V13M18 8.01V8M6 12.01V12M21 15l-3.5-7L14 15M14 15l-2.5-5L9 15M9 15l-3.5-7L2 15M2 22h20',
  recycle: 'M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5M11.5 3h1l4.243 7.346M16 12l3.185 5.5a1.786 1.786 0 0 1-.004 1.784 1.83 1.83 0 0 1-1.57.881H12.5M7.5 12l4.243-7.346M9.371 21h5.258M12 21v-5.5M7.5 12H3M16 12h5M7.5 12l2.5 4.5M16 12l-2.5 4.5',
  star: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',

  // Culture
  museum: 'M3 22h18M4 22V8l8-5 8 5v14M10 22v-4a2 2 0 0 1 4 0v4M8 11h.01M16 11h.01',

  // Nature / Science
  bone: 'M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z',

  // Military
  bunker: 'M3 21h18M5 21V7l7-4 7 4v14M9 21V11h6v10M9 11h6M5 7h14',

  // Burial / Mounds
  tumulus: 'M2 20h20M4 20c0-6 3.5-12 8-12s8 6 8 12',  // Simple burial mound shape
  terp: 'M2 20h20M4 20c0-5 3-10 8-10s8 5 8 10M10 10v-3h4v3',  // Mound with house
  ruins: 'M3 22h4V14h2v8h6v-8h2v8h4M5 14l7-10l7 10M9 10h6',  // Ruined building/arch

  // Default
  circle: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z',
  dot: 'M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0',
}

// Create SVG string with color and size
function createSvgIcon(path: string, color: string, size: number, strokeWidth: number = 2): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><path d="${path}"/></svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// Create filled circle with icon overlay
function createFilledIconSvg(iconPath: string, bgColor: string, iconColor: string, size: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="14" fill="${bgColor}" stroke="white" stroke-width="2"/>
    <g transform="translate(4, 4) scale(1)">
      <path d="${iconPath}" fill="none" stroke="${iconColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </g>
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// Get zoom-responsive scale factor
function getScaleForResolution(resolution: number): number {
  // Resolution roughly corresponds to meters per pixel
  // At zoom 8: resolution ~600, at zoom 14: resolution ~10, at zoom 18: resolution ~0.6
  if (resolution > 300) return 0.4      // Very zoomed out
  if (resolution > 150) return 0.5      // Zoomed out
  if (resolution > 75) return 0.6       // Medium-far
  if (resolution > 40) return 0.7       // Medium
  if (resolution > 20) return 0.85      // Medium-close
  if (resolution > 10) return 1.0       // Close
  return 1.2                            // Very close
}

// Style cache to avoid recreating styles
const styleCache = new Map<string, Style>()

export interface IconStyleOptions {
  icon: keyof typeof LUCIDE_ICONS
  color: string
  bgColor?: string        // If set, creates filled circle with icon
  baseSize?: number       // Base size in pixels (default 24)
  minScale?: number       // Minimum scale factor (default 0.4)
  maxScale?: number       // Maximum scale factor (default 1.2)
}

// Create a zoom-responsive icon style function
export function createIconStyle(options: IconStyleOptions) {
  const {
    icon,
    color,
    bgColor,
    baseSize = 24,
    minScale = 0.4,
    maxScale = 1.2
  } = options

  const iconPath = LUCIDE_ICONS[icon] || LUCIDE_ICONS.circle

  return function(feature: FeatureLike, resolution: number): Style {
    const scale = Math.max(minScale, Math.min(maxScale, getScaleForResolution(resolution)))
    const cacheKey = `${icon}-${color}-${bgColor || 'none'}-${scale.toFixed(2)}`

    let style = styleCache.get(cacheKey)
    if (!style) {
      const svgSrc = bgColor
        ? createFilledIconSvg(iconPath, bgColor, color, baseSize)
        : createSvgIcon(iconPath, color, baseSize)

      style = new Style({
        image: new Icon({
          src: svgSrc,
          scale: scale,
          anchor: [0.5, 0.5],
        })
      })
      styleCache.set(cacheKey, style)
    }

    return style
  }
}

// Create a dynamic color style function (for layers with category-based colors)
export function createDynamicIconStyle(
  icon: keyof typeof LUCIDE_ICONS,
  getColor: (feature: FeatureLike) => string,
  baseSize: number = 26
) {
  const iconPath = LUCIDE_ICONS[icon] || LUCIDE_ICONS.circle

  return function(feature: FeatureLike, resolution: number): Style {
    const bgColor = getColor(feature)
    const scale = Math.max(0.4, Math.min(1.2, getScaleForResolution(resolution)))
    const cacheKey = `${icon}-${bgColor}-${scale.toFixed(2)}`

    let style = styleCache.get(cacheKey)
    if (!style) {
      const svgSrc = createFilledIconSvg(iconPath, bgColor, 'white', baseSize)

      style = new Style({
        image: new Icon({
          src: svgSrc,
          scale: scale,
          anchor: [0.5, 0.5],
        })
      })
      styleCache.set(cacheKey, style)
    }

    return style
  }
}

// Predefined styles for common layer types
export const LAYER_STYLES = {
  archaeology: (color: string = '#7c3aed') => createIconStyle({
    icon: 'pickaxe',
    color: 'white',
    bgColor: color,
    baseSize: 28
  }),

  castle: () => createIconStyle({
    icon: 'castle',
    color: 'white',
    bgColor: '#7c3aed',
    baseSize: 28
  }),

  museum: () => createIconStyle({
    icon: 'museum',
    color: 'white',
    bgColor: '#8b5cf6',
    baseSize: 26
  }),

  playground: () => createIconStyle({
    icon: 'baby',
    color: 'white',
    bgColor: '#f97316',
    baseSize: 24
  }),

  recycle: () => createIconStyle({
    icon: 'recycle',
    color: 'white',
    bgColor: '#84cc16',
    baseSize: 26
  }),

  permission: () => createIconStyle({
    icon: 'thumbsUp',
    color: 'white',
    bgColor: '#22c55e',
    baseSize: 28
  }),

  landmark: (color: string = '#2b6cb0') => createIconStyle({
    icon: 'landmark',
    color: 'white',
    bgColor: color,
    baseSize: 28
  }),

  mapPin: (color: string = '#dc2626') => createIconStyle({
    icon: 'mapPin',
    color: 'white',
    bgColor: color,
    baseSize: 26
  }),

  fossil: () => createIconStyle({
    icon: 'ammonite',
    color: 'white',
    bgColor: '#92400e',  // amber-800 (fossil brown)
    baseSize: 26
  }),

  hunebed: () => createIconStyle({
    icon: 'dolmen',
    color: 'white',
    bgColor: '#78716c',  // stone-500 (greyish-brown for megalithic)
    baseSize: 28
  }),

  church: () => createIconStyle({
    icon: 'church',
    color: 'white',
    bgColor: '#7c3aed',  // purple-600 (religious heritage)
    baseSize: 26
  }),

  slagveld: () => createIconStyle({
    icon: 'crossedSwords',
    color: 'white',
    bgColor: '#b91c1c',  // red-700 (battle/war)
    baseSize: 26
  }),

  ammonite: () => createIconStyle({
    icon: 'ammonite',
    color: 'white',
    bgColor: '#92400e',  // amber-800 (fossil brown)
    baseSize: 26
  }),

  sharkTooth: () => createIconStyle({
    icon: 'sharkTooth',
    color: 'white',
    bgColor: '#475569',  // slate-600 (shark grey)
    baseSize: 26
  }),

  mineral: () => createIconStyle({
    icon: 'crystal',
    color: 'white',
    bgColor: '#7c3aed',  // purple-600 (crystal/gem)
    baseSize: 26
  }),

  neolithic: () => createIconStyle({
    icon: 'mapPin',
    color: 'white',
    bgColor: '#92400e',  // amber-800 (earthy brown for neolithic)
    baseSize: 24
  }),

  bunker: () => createIconStyle({
    icon: 'bunker',
    color: 'white',
    bgColor: '#57534e',  // stone-600 (concrete grey for WWII bunkers)
    baseSize: 26
  }),

  grafheuvel: () => createIconStyle({
    icon: 'tumulus',
    color: 'white',
    bgColor: '#854d0e',  // yellow-800 (bronze age brown)
    baseSize: 26
  }),

  terp: () => createIconStyle({
    icon: 'terp',
    color: 'white',
    bgColor: '#0d9488',  // teal-600 (Frisian green-blue)
    baseSize: 26
  }),

  ruins: () => createIconStyle({
    icon: 'ruins',
    color: 'white',
    bgColor: '#6b7280',  // gray-500 (weathered stone)
    baseSize: 26
  }),
}

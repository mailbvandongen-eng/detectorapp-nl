/**
 * WebGL Elevation Layer - STAP 1
 *
 * Simpelste mogelijke implementatie:
 * - Terrarium tiles → elevation in meters → grayscale
 * - Geen hillshade berekening
 * - Geen sliders
 * - Alleen Nederland
 * - Zee transparant
 */

import WebGLTileLayer from 'ol/layer/WebGLTile'
import XYZ from 'ol/source/XYZ'

// Terrarium tiles (gratis, geen API key)
const TERRARIUM_URL = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'

// Nederland bounding box in EPSG:3857
const NL_EXTENT = [370000, 6580000, 810000, 7130000]

// Nederland elevation range
const MIN_ELEV = -10  // Onder zeeniveau (polders)
const MAX_ELEV = 300  // Vaalserberg ~322m

/**
 * Stap 1: Elevation als grayscale
 *
 * Terrarium encoding: elevation = (R * 256 + G + B / 256) - 32768
 * Band values zijn 0-1 genormaliseerd, dus * 255
 */
export function createWebGLHillshadeLayerOL() {
  // Stap 1: Elevation berekenen uit RGB
  const r = ['band', 1]
  const g = ['band', 2]
  const b = ['band', 3]

  // Terrarium formule (band values zijn 0-1, dus *255)
  const elevation = [
    '+',
    ['*', 255 * 256, r],  // R * 256 * 255
    ['*', 255, g],         // G * 255
    ['/', ['*', 255, b], 256],  // B * 255 / 256
    -32768
  ]

  // Stap 2: Normaliseren naar 0-1 voor Nederland
  const normalized = [
    '/',
    ['-', elevation, MIN_ELEV],
    ['-', MAX_ELEV, MIN_ELEV]
  ]
  const clamped = ['clamp', normalized, 0, 1]

  // Stap 3: Grayscale (0-255)
  const gray = ['*', 255, clamped]

  // Stap 4: Alpha - zee transparant (elevation < 0)
  const alpha = ['case', ['>', elevation, -1], 255, 0]

  return new WebGLTileLayer({
    properties: {
      title: 'Hoogtekaart (WebGL)',
      type: 'webgl'
    },
    extent: NL_EXTENT,
    visible: false,
    opacity: 0.8,
    source: new XYZ({
      url: TERRARIUM_URL,
      crossOrigin: 'anonymous',
      maxZoom: 15,
      attributions: '© Mapzen, AWS Terrain Tiles'
    }),
    style: {
      color: ['color', gray, gray, gray, alpha]
    }
  })
}

// Placeholder functies (niet gebruikt, maar nodig voor imports)
export function createWebGLColorHeightLayerOL() {
  return createWebGLHillshadeLayerOL()
}

export function createWebGLCombinedHillshadeLayerOL() {
  return createWebGLHillshadeLayerOL()
}

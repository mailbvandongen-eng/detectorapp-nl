import TileLayer from 'ol/layer/Tile'
import TileWMS from 'ol/source/TileWMS'

/**
 * Linies en Stellingen - Verdedigingswerken van Nederland
 * WMS from RCE GeoVoorziening
 * Shows historical military defense lines, fortifications, and inundation areas
 * From 15th century through Cold War era
 *
 * Available layers:
 * - linies: Military defense lines
 * - inundaties: Inundation areas
 * - objecten: Military objects (forts, bunkers, redoubts)
 * - puntlocaties: Point locations
 */

const WMS_URL = 'https://services.rce.geovoorziening.nl/liniesenstellingen/wms'

// Linies (verdedigingslinies)
export function createLiniesLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Verdedigingslinies',
      type: 'wms'
    },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: WMS_URL,
      params: {
        'LAYERS': 'linies',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  console.log('🏰 Verdedigingslinies WMS layer loaded (RCE)')
  return layer
}

// Inundaties (inundation zones)
export function createInundatiesLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Inundatiegebieden',
      type: 'wms'
    },
    visible: false,
    opacity: 0.5,
    source: new TileWMS({
      url: WMS_URL,
      params: {
        'LAYERS': 'inundaties',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  console.log('💧 Inundatiegebieden WMS layer loaded (RCE)')
  return layer
}

// Objecten (forts, bunkers, redoubts, etc.)
export function createMilitaireObjectenLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Militaire Objecten',
      type: 'wms'
    },
    visible: false,
    opacity: 0.8,
    source: new TileWMS({
      url: WMS_URL,
      params: {
        'LAYERS': 'objecten',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  console.log('🏯 Militaire Objecten WMS layer loaded (RCE)')
  return layer
}

// Puntlocaties
export function createMilitairePuntenLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Militaire Puntlocaties',
      type: 'wms'
    },
    visible: false,
    opacity: 0.8,
    source: new TileWMS({
      url: WMS_URL,
      params: {
        'LAYERS': 'puntlocaties',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  console.log('📍 Militaire Puntlocaties WMS layer loaded (RCE)')
  return layer
}

import TileLayer from 'ol/layer/Tile'
import TileWMS from 'ol/source/TileWMS'

/**
 * Paleogeografische kaarten van Nederland
 * WMS from RCE GeoVoorziening
 * Shows how the Netherlands looked at different time periods
 * From 9000 BC to 2000 AD
 */

const WMS_URL = 'https://services.rce.geovoorziening.nl/paleogeografischekaarten/wms'

// 800 na Christus - Vroege Middeleeuwen
export function createPaleo800ncLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Paleokaart 800 n.Chr.',
      type: 'wms'
    },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: WMS_URL,
      params: {
        'LAYERS': 'Paleogeografischekaarten_800nc',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  console.log('🗺️ Paleokaart 800 n.Chr. WMS layer loaded (RCE)')
  return layer
}

// 100 na Christus - Romeinse tijd
export function createPaleo100ncLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Paleokaart 100 n.Chr.',
      type: 'wms'
    },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: WMS_URL,
      params: {
        'LAYERS': 'Paleogeografischekaarten_100nc',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  console.log('🗺️ Paleokaart 100 n.Chr. WMS layer loaded (RCE)')
  return layer
}

// 500 voor Christus - IJzertijd
export function createPaleo500vcLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Paleokaart 500 v.Chr.',
      type: 'wms'
    },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: WMS_URL,
      params: {
        'LAYERS': 'Paleogeografischekaarten_500vc',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  console.log('🗺️ Paleokaart 500 v.Chr. WMS layer loaded (RCE)')
  return layer
}

// 1500 voor Christus - Bronstijd
export function createPaleo1500vcLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Paleokaart 1500 v.Chr.',
      type: 'wms'
    },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: WMS_URL,
      params: {
        'LAYERS': 'Paleogeografischekaarten_1500vc',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  console.log('🗺️ Paleokaart 1500 v.Chr. WMS layer loaded (RCE)')
  return layer
}

// 2750 voor Christus - Laat Neolithicum
export function createPaleo2750vcLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Paleokaart 2750 v.Chr.',
      type: 'wms'
    },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: WMS_URL,
      params: {
        'LAYERS': 'Paleogeografischekaarten_2750vc',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  console.log('🗺️ Paleokaart 2750 v.Chr. WMS layer loaded (RCE)')
  return layer
}

// 5500 voor Christus - Mesolithicum
export function createPaleo5500vcLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Paleokaart 5500 v.Chr.',
      type: 'wms'
    },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: WMS_URL,
      params: {
        'LAYERS': 'Paleogeografischekaarten_5500vc',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  console.log('🗺️ Paleokaart 5500 v.Chr. WMS layer loaded (RCE)')
  return layer
}

// 9000 voor Christus - Einde IJstijd
export function createPaleo9000vcLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Paleokaart 9000 v.Chr.',
      type: 'wms'
    },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: WMS_URL,
      params: {
        'LAYERS': 'Paleogeografischekaarten_9000vc',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  console.log('🗺️ Paleokaart 9000 v.Chr. WMS layer loaded (RCE)')
  return layer
}

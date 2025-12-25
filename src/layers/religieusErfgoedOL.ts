import TileLayer from 'ol/layer/Tile'
import TileWMS from 'ol/source/TileWMS'

/**
 * Religieus Erfgoed - Landschapsatlas
 * WMS from RCE GeoVoorziening
 * Shows religious heritage sites: churches, chapels, synagogues, bell towers
 */

const WMS_URL = 'https://services.rce.geovoorziening.nl/landschapsatlas_view/wms'

export function createReligieusErfgoedLayerOL() {
  const layer = new TileLayer({
    properties: {
      title: 'Religieus Erfgoed',
      type: 'wms'
    },
    visible: false,
    opacity: 0.8,
    source: new TileWMS({
      url: WMS_URL,
      params: {
        'LAYERS': 'religieuserfgoed',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  console.log('⛪ Religieus Erfgoed WMS layer loaded (RCE)')
  return layer
}

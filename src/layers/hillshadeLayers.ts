import TileLayer from 'ol/layer/Tile'
import ImageLayer from 'ol/layer/Image'
import LayerGroup from 'ol/layer/Group'
import TileWMS from 'ol/source/TileWMS'
import XYZ from 'ol/source/XYZ'
import ImageArcGISRest from 'ol/source/ImageArcGISRest'

// Performance tuning for AHN ArcGIS ImageServer requests.
// This avoids oversized retina requests and improves responsiveness on mobile.
const AHN_IMAGE_SOURCE_OPTIONS = {
  hidpi: false,
  ratio: 1
} as const

// AHN4 Hoogtekaart Kleur - 50cm resolutie met dynamische kleuren
// Toont hoogteverschillen in kleur (blauw=laag → groen → oranje/bruin=hoog)
// Dynamische color ramp past zich aan aan lokale hoogteverschillen
export function createAHN4ColorElevationLayerOL() {
  const layer = new ImageLayer({
    properties: { title: 'AHN4 Hoogtekaart Kleur', type: 'arcgis' },
    visible: false,
    opacity: 1.0,  // Volle dekking voor beste kleuren
    source: new ImageArcGISRest({
      url: 'https://ahn.arcgisonline.nl/arcgis/rest/services/Hoogtebestand/AHN4_DTM_50cm/ImageServer',
      params: {
        renderingRule: JSON.stringify({
          rasterFunction: 'AHN - Color Ramp D'  // Dynamisch! blauw→groen→geel→bruin
        })
      },
      ...AHN_IMAGE_SOURCE_OPTIONS,
      crossOrigin: 'anonymous',
      attributions: '© Esri Nederland, AHN4 50cm'
    })
  })

  return layer
}

// AHN4 Hillshade Kleur - Combineert kleur + hillshade in één GroupLayer
// Bron: Esri Nederland Hoogteviewer (apps.arcgisonline.nl/hoogteviewer)
// Geeft 3D-effect door hillshade over de kleurlaag te leggen met multiply blend
export function createAHN4ShadedReliefLayerOL() {
  // Onderlaag: Kleur gebaseerd op hoogte
  const colorLayer = new ImageLayer({
    properties: { title: 'Color Base' },
    opacity: 1.0,
    source: new ImageArcGISRest({
      url: 'https://ahn.arcgisonline.nl/arcgis/rest/services/Hoogtebestand/AHN4_DTM_50cm/ImageServer',
      params: {
        renderingRule: JSON.stringify({
          rasterFunction: 'AHN - Color Ramp D'
        })
      },
      ...AHN_IMAGE_SOURCE_OPTIONS,
      crossOrigin: 'anonymous',
      attributions: '© Esri Nederland, AHN4 50cm'
    })
  })

  // Bovenlaag: Hillshade met multiply blend
  const hillshadeLayer = new ImageLayer({
    properties: { title: 'Hillshade Overlay' },
    opacity: 0.7,
    source: new ImageArcGISRest({
      url: 'https://ahn.arcgisonline.nl/arcgis/rest/services/Hoogtebestand/AHN4_DTM_50cm/ImageServer',
      params: {
        renderingRule: JSON.stringify({
          rasterFunction: 'AHN - Hillshade'
        })
      },
      ...AHN_IMAGE_SOURCE_OPTIONS,
      crossOrigin: 'anonymous'
    })
  })

  // Canvas blend mode voor multiply effect (3D schaduwwerking)
  hillshadeLayer.on('prerender', (evt) => {
    if (evt.context) {
      const ctx = evt.context as CanvasRenderingContext2D
      ctx.globalCompositeOperation = 'multiply'
    }
  })
  hillshadeLayer.on('postrender', (evt) => {
    if (evt.context) {
      const ctx = evt.context as CanvasRenderingContext2D
      ctx.globalCompositeOperation = 'source-over'
    }
  })

  // Groepeer beide lagen
  const group = new LayerGroup({
    properties: { title: 'AHN4 Hillshade Kleur', type: 'group' },
    visible: false,
    layers: [colorLayer, hillshadeLayer]
  })

  return group
}

// AHN4 Hillshade Netherlands - Esri Nederland ImageServer
// Uses dynamic hillshade rendering from AHN4 DTM data
export function createAHN4HillshadeLayerOL() {
  const layer = new ImageLayer({
    properties: { title: 'AHN4 Hillshade NL', type: 'arcgis' },
    visible: false,
    opacity: 0.7,
    source: new ImageArcGISRest({
      url: 'https://ahn.arcgisonline.nl/arcgis/rest/services/Hoogtebestand/AHN4_DTM_5m/ImageServer',
      params: {
        renderingRule: JSON.stringify({
          rasterFunction: 'AHN - Hillshade'
        })
      },
      ...AHN_IMAGE_SOURCE_OPTIONS,
      crossOrigin: 'anonymous',
      attributions: '© Esri Nederland, AHN'
    })
  })

  return layer
}

// AHN4 Multidirectional Hillshade - Better for subtle relief
export function createAHN4MultiHillshadeLayerOL() {
  const layer = new ImageLayer({
    properties: { title: 'AHN4 Multi-Hillshade NL', type: 'arcgis' },
    visible: false,
    opacity: 0.7,
    source: new ImageArcGISRest({
      url: 'https://ahn.arcgisonline.nl/arcgis/rest/services/Hoogtebestand/AHN4_DTM_5m/ImageServer',
      params: {
        renderingRule: JSON.stringify({
          rasterFunction: 'AHN - Hillshade (Multidirectionaal)'
        })
      },
      ...AHN_IMAGE_SOURCE_OPTIONS,
      crossOrigin: 'anonymous',
      attributions: '© Esri Nederland, AHN'
    })
  })

  return layer
}

// AHN4 Slope visualization - Shows steepness
export function createAHN4SlopeLayerOL() {
  const layer = new ImageLayer({
    properties: { title: 'AHN4 Helling NL', type: 'arcgis' },
    visible: false,
    opacity: 0.6,
    source: new ImageArcGISRest({
      url: 'https://ahn.arcgisonline.nl/arcgis/rest/services/Hoogtebestand/AHN4_DTM_5m/ImageServer',
      params: {
        renderingRule: JSON.stringify({
          rasterFunction: 'AHN - Slope'
        })
      },
      ...AHN_IMAGE_SOURCE_OPTIONS,
      crossOrigin: 'anonymous',
      attributions: '© Esri Nederland, AHN'
    })
  })

  return layer
}

// Esri World Hillshade - Global coverage, good base layer
// minZoom 8 prevents "Map data not yet available" at low zoom levels
export function createWorldHillshadeLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'World Hillshade', type: 'overlay' },
    visible: false,
    opacity: 0.6,
    minZoom: 8,  // Voorkomt "Map data not yet available" foutmelding
    source: new XYZ({
      url: 'https://services.arcgisonline.com/arcgis/rest/services/Elevation/World_Hillshade/MapServer/tile/{z}/{y}/{x}',
      attributions: '© Esri',
      crossOrigin: 'anonymous',
      maxZoom: 23
    })
  })

  return layer
}

// Flanders DHMV II - Multidirectional hillshade 25cm resolution
// Extremely detailed! Derived from 8 light directions, 35° sun height
export function createDHMVHillshadeLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Hillshade Vlaanderen 25cm', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://geo.api.vlaanderen.be/DHMV/wms',
      params: {
        'LAYERS': 'DHMV_II_HILL_25cm',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// Flanders DHMV II - Skyview Factor 25cm
// Excellent for detecting archaeological features in flat terrain
export function createDHMVSkyviewLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Skyview Vlaanderen 25cm', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://geo.api.vlaanderen.be/DHMV/wms',
      params: {
        'LAYERS': 'DHMV_II_SVF_25cm',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// Flanders DHMV II - Digital Terrain Model 1m
export function createDHMVDTMLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'DTM Vlaanderen 1m', type: 'wms' },
    visible: false,
    opacity: 0.6,
    source: new TileWMS({
      url: 'https://geo.api.vlaanderen.be/DHMV/wms',
      params: {
        'LAYERS': 'DHMVII_DTM_1m',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// NRW Germany - DGM Schummerung (Hillshade) 25cm resolution
// Grayscale hillshade with NW light source
export function createNRWHillshadeLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Hillshade NRW 25cm', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://www.wms.nrw.de/geobasis/wms_nw_dgm-schummerung',
      params: {
        'LAYERS': 'nw_dgm-schummerung_pan',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// NRW Germany - DGM Schummerung Color
// Colored hillshade with NW light source
export function createNRWHillshadeColorLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Hillshade NRW Kleur', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://www.wms.nrw.de/geobasis/wms_nw_dgm-schummerung',
      params: {
        'LAYERS': 'nw_dgm-schummerung_col',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// France IGN - Hillshade from BD Alti (25m resolution)
// Two light sources: NE at 45° elevation + zenith
export function createFranceHillshadeLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Hillshade Frankrijk', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://data.geopf.fr/wms-r/wms',
      params: {
        'LAYERS': 'ELEVATION.ELEVATIONGRIDCOVERAGE.SHADOW',
        'STYLES': 'estompage_grayscale',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// France IGN - LiDAR HD MNT Hillshade (high resolution!)
// Available for areas with LiDAR HD coverage
export function createFranceLidarHDHillshadeLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'LiDAR HD Frankrijk', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://data.geopf.fr/wms-r/wms',
      params: {
        'LAYERS': 'IGNF_LIDAR-HD_MNT_ELEVATION.ELEVATIONGRIDCOVERAGE.SHADOW',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// France IGN - RGE Alti High Resolution (1m DEM)
export function createFranceRGEAltiLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'RGE Alti Frankrijk 1m', type: 'wms' },
    visible: false,
    opacity: 0.6,
    source: new TileWMS({
      url: 'https://data.geopf.fr/wms-r/wms',
      params: {
        'LAYERS': 'ELEVATION.ELEVATIONGRIDCOVERAGE.HIGHRES',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// France IGN - Contour lines
export function createFranceContourLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Hoogtelijn Frankrijk', type: 'wms' },
    visible: false,
    opacity: 0.8,
    source: new TileWMS({
      url: 'https://data.geopf.fr/wms-r/wms',
      params: {
        'LAYERS': 'ELEVATION.CONTOUR.LINE',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// Wallonia Belgium - Hillshade MNT 2021-2022 (0.5m resolution)
// Derived from LiDAR acquisition 2021-2022
export function createWallonieHillshadeLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Hillshade Wallonië', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://geoservices.wallonie.be/arcgis/services/RELIEF/WALLONIE_MNT_2021_2022_HILLSHADE/MapServer/WMSServer',
      params: {
        'LAYERS': '0',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

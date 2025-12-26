import TileLayer from 'ol/layer/Tile'
import TileWMS from 'ol/source/TileWMS'

export function createAHNLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'AHN 0.5m', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://service.pdok.nl/rws/ahn/wms/v1_0',
      params: {
        'LAYERS': 'dtm_05m',
        'TILED': true
      },
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

export function createGeomorfologieLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Geomorfologie', type: 'wms' },
    visible: false,
    opacity: 0.5,
    source: new TileWMS({
      url: 'https://service.pdok.nl/bzk/bro-geomorfologischekaart/wms/v2_0',
      params: {
        'LAYERS': 'geomorphological_area',
        'TILED': true
      },
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

export function createBodemkaartLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Bodemkaart', type: 'wms' },
    visible: false,
    opacity: 0.6,
    source: new TileWMS({
      url: 'https://service.pdok.nl/bzk/bro-bodemkaart/wms/v1_0',
      params: {
        'LAYERS': 'soilarea',
        'TILED': true
      },
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// IKAW - Indicatieve Kaart Archeologische Waarden (RCE, 2008)
export function createIKAWLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'IKAW', type: 'wms' },
    visible: false,
    opacity: 0.5,
    source: new TileWMS({
      url: 'https://services.rce.geovoorziening.nl/ikaw/wms',
      params: {
        'LAYERS': 'IKAW3Indicatievekaartarcheologischewaarden2008',
        'STYLES': '',
        'TILED': true
      },
      serverType: 'geoserver',
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// FAMKE - Friese Archeologische Monumentenkaart Extra: Steentijd-Bronstijd advies
export function createFAMKESteentijdLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'FAMKE Steentijd', type: 'wms' },
    visible: false,
    opacity: 0.6,
    source: new TileWMS({
      url: 'https://geoportaal.fryslan.nl/arcgis/services/Themas/cultuurhistorie/MapServer/WMSServer',
      params: {
        'LAYERS': 'FAMKE_Advies_steentijd-bronstijd3339',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// Archeologische Landschappenkaart van Nederland (RCE)
// 26 landschappen met zones - zeer relevant voor steentijdarcheologie
export function createArcheoLandschappenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Archeo Landschappen', type: 'wms' },
    visible: false,
    opacity: 0.5,
    source: new TileWMS({
      url: 'https://services.rce.geovoorziening.nl/landschappenkaart/wms',
      params: {
        'LAYERS': 'landschappenkaart_nl',
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

// Vlaanderen - Vastgestelde Archeologische Zones (Onroerend Erfgoed)
export function createVlaanderenArcheoZonesLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Archeo Zones Vlaanderen', type: 'wms' },
    visible: false,
    opacity: 0.6,
    source: new TileWMS({
      url: 'https://geo.onroerenderfgoed.be/geoserver/wms',
      params: {
        'LAYERS': 'vioe_geoportaal:vast_az',
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

// Vlaanderen - Beschermde Archeologische Sites (Onroerend Erfgoed)
export function createVlaanderenBeschArchLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Beschermde Sites Vlaanderen', type: 'wms' },
    visible: false,
    opacity: 0.6,
    source: new TileWMS({
      url: 'https://geo.onroerenderfgoed.be/geoserver/wms',
      params: {
        'LAYERS': 'vioe_geoportaal:bes_arch_site',
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

// ============================================
// RCE - Rijksdienst voor het Cultureel Erfgoed
// ============================================

// Rijksmonumenten - 62.000+ beschermde monumenten
export function createRijksmonumentenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Rijksmonumenten', type: 'wms' },
    visible: false,
    opacity: 0.8,
    source: new TileWMS({
      url: 'https://data.geo.cultureelerfgoed.nl/openbaar/wms',
      params: {
        'LAYERS': 'rijksmonumentpunten',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// Archeologische Onderzoeksmeldingen - waar onderzoek is gedaan
export function createArcheoOnderzoekenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Archeo Onderzoeken', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://data.geo.cultureelerfgoed.nl/openbaar/wms',
      params: {
        'LAYERS': 'archeologische_onderzoeksmeldingen_openbaar_rd',
        'STYLES': '',
        'TILED': true,
        'FORMAT': 'image/png'
      },
      crossOrigin: 'anonymous'
    })
  })

  return layer
}

// UNESCO Werelderfgoed - incl. Hollandse Waterlinies, Stelling van Amsterdam
export function createWerelderfgoedLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Werelderfgoed', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://service.pdok.nl/rce/ps-ch/wms/v1_0',
      params: {
        'LAYERS': 'PS.ProtectedSite',
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

// ============================================
// Percelen - Kadaster & Landbouw
// ============================================

// BRP Gewaspercelen - 700.000 landbouwpercelen met gewastype
export function createBRPGewaspercelenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'BRP Gewaspercelen', type: 'wms' },
    visible: false,
    opacity: 0.6,
    source: new TileWMS({
      url: 'https://service.pdok.nl/rvo/brpgewaspercelen/wms/v1_0',
      params: {
        'LAYERS': 'brpgewaspercelen',
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

// Kadastrale Kaart - perceelgrenzen
export function createKadastraleKaartLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Kadastrale Grenzen', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://service.pdok.nl/kadaster/kadastralekaart/wms/v5_0',
      params: {
        'LAYERS': 'Perceel,OpenbareRuimteNaam,Bebouwing',
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

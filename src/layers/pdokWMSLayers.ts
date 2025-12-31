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

// Essen - Historische akkercomplexen op hogere gronden (RCE Landschapsatlas)
// Vaak locaties van prehistorische bewoning, plaggenbodems met artefacten
export function createEssenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Essen', type: 'wms' },
    visible: false,
    opacity: 0.6,
    source: new TileWMS({
      url: 'https://services.rce.geovoorziening.nl/landschapsatlas/wms',
      params: {
        'LAYERS': 'essen',
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

// Gewaspercelen (BRP) - 700.000 landbouwpercelen met gewastype
export function createGewaspercelenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Gewaspercelen', type: 'wms' },
    visible: false,
    opacity: 0.6,
    source: new TileWMS({
      url: 'https://service.pdok.nl/rvo/brpgewaspercelen/wms/v1_0',
      params: {
        'LAYERS': 'BrpGewas',
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
        'LAYERS': 'Perceel',
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
// Provinciale Cultuurhistorische Waardenkaarten
// ============================================

// --- Zuid-Holland ---

// Scheepswrakken - historische scheepsrestanten
export function createScheepswrakkenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Scheepswrakken', type: 'wms' },
    visible: false,
    opacity: 0.8,
    source: new TileWMS({
      url: 'https://geodata.zuid-holland.nl/geoserver/cultuur/wms',
      params: {
        'LAYERS': 'CHS_2015_ARCHEOLOGIE_SCHEEPSRESTANTEN',
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

// Woonheuvels - prehistorische terpen/woonheuvels
export function createWoonheuvelsLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Woonheuvels ZH', type: 'wms' },
    visible: false,
    opacity: 0.8,
    source: new TileWMS({
      url: 'https://geodata.zuid-holland.nl/geoserver/cultuur/wms',
      params: {
        'LAYERS': 'CHS_2015_ARCHEOLOGIE_WOONHEUVEL',
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

// Romeinse forten - castellum locaties
export function createRomeinseFortenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Romeinse Forten', type: 'wms' },
    visible: false,
    opacity: 0.8,
    source: new TileWMS({
      url: 'https://geodata.zuid-holland.nl/geoserver/cultuur/wms',
      params: {
        'LAYERS': 'CHS_2015_ARCHEOLOGIE_ROMEINSFORT',
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

// Historische windmolens
export function createWindmolensLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Windmolens', type: 'wms' },
    visible: false,
    opacity: 0.8,
    source: new TileWMS({
      url: 'https://geodata.zuid-holland.nl/geoserver/cultuur/wms',
      params: {
        'LAYERS': 'CHS_2015_NEDERZETTING_WINDMOLENS',
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

// Erfgoedlijnen - Limes, Atlantikwall, trekvaarten
export function createErfgoedlijnenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Erfgoedlijnen', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://geodata.zuid-holland.nl/geoserver/cultuur/wms',
      params: {
        'LAYERS': 'CHS_ERFGOEDLIJN_HOOFDSTRUCTUUR',
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

// Oude stads- en dorpskernen
export function createOudeKernenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Oude Kernen', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://geodata.zuid-holland.nl/geoserver/cultuur/wms',
      params: {
        'LAYERS': 'CHS_2015_ARCHEOLOGIE_KERNEN',
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

// --- Gelderland ---

// Relictenkaart punten - havezaten, molens, eendenkooien, kastelen, etc.
export function createRelictenkaartPuntenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Relictenkaart Punten', type: 'wms' },
    visible: false,
    opacity: 0.8,
    source: new TileWMS({
      url: 'https://geoserver.gelderland.nl/geoserver/ngr_a/wms',
      params: {
        'LAYERS': 'ChAr_Relictenkaart_p',
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

// Relictenkaart lijnen - historische wegen, waterlopen, etc.
export function createRelictenkaartLijnenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Relictenkaart Lijnen', type: 'wms' },
    visible: false,
    opacity: 0.7,
    source: new TileWMS({
      url: 'https://geoserver.gelderland.nl/geoserver/ngr_a/wms',
      params: {
        'LAYERS': 'ChAr_Relictenkaart_l',
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

// Relictenkaart vlakken - essen, heiderelicten, bossen, etc.
export function createRelictenkaartVlakkenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Relictenkaart Vlakken', type: 'wms' },
    visible: false,
    opacity: 0.5,
    source: new TileWMS({
      url: 'https://geoserver.gelderland.nl/geoserver/ngr_a/wms',
      params: {
        'LAYERS': 'ChAr_Relictenkaart_v',
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

// --- Zeeland ---

// Verdronken dorpen - 200+ verdronken nederzettingen
export function createVerdronkenDorpenLayerOL() {
  const layer = new TileLayer({
    properties: { title: 'Verdronken Dorpen', type: 'wms' },
    visible: false,
    opacity: 0.8,
    source: new TileWMS({
      url: 'https://opengeodata.zeeland.nl/geoserver/chs/wms',
      params: {
        'LAYERS': 'geocmd_vrddrppnt',
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

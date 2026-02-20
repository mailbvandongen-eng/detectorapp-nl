/**
 * ArcGIS Layer Configurations
 *
 * Declaratieve configuraties voor alle lagen.
 * Deze configs worden door arcgisLayerConverter.ts omgezet naar ArcGIS SDK layers.
 *
 * Migratie status: TEST FASE - eerste 10 lagen
 */

import type {
  LayerConfig,
  WMSLayerConfig,
  GeoJSONLayerConfig,
  ImageryLayerConfig
} from './arcgisLayerConverter'
import { ARCGIS_RENDERERS, ARCGIS_ICONS, createIconSymbolConfig } from './arcgisLayerConverter'

// ============================================
// WMS LAYERS - PDOK & RCE
// ============================================

export const wmsLayerConfigs: Record<string, WMSLayerConfig> = {
  'AHN 0.5m': {
    type: 'wms',
    url: 'https://service.pdok.nl/rws/ahn/wms/v1_0',
    sublayers: ['dtm_05m'],
    title: 'AHN 0.5m',
    opacity: 0.7
  },

  'Geomorfologie': {
    type: 'wms',
    url: 'https://service.pdok.nl/bzk/bro-geomorfologischekaart/wms/v2_0',
    sublayers: ['geomorphological_area'],
    title: 'Geomorfologie',
    opacity: 0.5
  },

  'Bodemkaart': {
    type: 'wms',
    url: 'https://service.pdok.nl/bzk/bro-bodemkaart/wms/v1_0',
    sublayers: ['soilarea'],
    title: 'Bodemkaart',
    opacity: 0.6
  },

  'IKAW': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/ikaw/wms',
    sublayers: ['IKAW3Indicatievekaartarcheologischewaarden2008'],
    title: 'IKAW',
    opacity: 0.5,
    queryable: true,
    queryType: 'wms-getfeatureinfo'
  },

  'FAMKE Steentijd': {
    type: 'wms',
    url: 'https://geoportaal.fryslan.nl/arcgis/services/Themas/cultuurhistorie/MapServer/WMSServer',
    sublayers: ['2'],
    title: 'FAMKE Steentijd',
    opacity: 0.6,
    queryable: true,
    queryUrl: 'https://geoportaal.fryslan.nl/arcgis/rest/services/Themas/cultuurhistorie/MapServer/2/query',
    queryType: 'arcgis-rest'
  },

  'FAMKE IJzertijd': {
    type: 'wms',
    url: 'https://geoportaal.fryslan.nl/arcgis/services/Themas/cultuurhistorie/MapServer/WMSServer',
    sublayers: ['1'],
    title: 'FAMKE IJzertijd',
    opacity: 0.6,
    queryable: true,
    queryUrl: 'https://geoportaal.fryslan.nl/arcgis/rest/services/Themas/cultuurhistorie/MapServer/1/query',
    queryType: 'arcgis-rest'
  },

  'Essen': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/landschapsatlas/wms',
    sublayers: ['essen'],
    title: 'Essen',
    opacity: 0.6
  },

  'Rijksmonumenten': {
    type: 'wms',
    url: 'https://data.geo.cultureelerfgoed.nl/openbaar/wms',
    sublayers: ['rijksmonumentpunten'],
    title: 'Rijksmonumenten',
    opacity: 0.8
  },

  'Archeo Onderzoeken': {
    type: 'wms',
    url: 'https://data.geo.cultureelerfgoed.nl/openbaar/wms',
    sublayers: ['archeologische_onderzoeksmeldingen_openbaar_rd'],
    title: 'Archeo Onderzoeken',
    opacity: 0.7
  },

  'Werelderfgoed': {
    type: 'wms',
    url: 'https://service.pdok.nl/rce/ps-ch/wms/v1_0',
    sublayers: ['PS.ProtectedSite'],
    title: 'Werelderfgoed',
    opacity: 0.7
  },

  'Gewaspercelen': {
    type: 'wms',
    url: 'https://service.pdok.nl/rvo/brpgewaspercelen/wms/v1_0',
    sublayers: ['BrpGewas'],
    title: 'Gewaspercelen',
    opacity: 0.6
  },

  'Kadastrale Grenzen': {
    type: 'wms',
    url: 'https://service.pdok.nl/kadaster/kadastralekaart/wms/v5_0',
    sublayers: ['Perceel'],
    title: 'Kadastrale Grenzen',
    opacity: 0.7
  },

  // Provinciale lagen - Zuid-Holland
  'Scheepswrakken': {
    type: 'wms',
    url: 'https://geodata.zuid-holland.nl/geoserver/cultuur/wms',
    sublayers: ['CHS_2015_ARCHEOLOGIE_SCHEEPSRESTANTEN'],
    title: 'Scheepswrakken',
    opacity: 0.8
  },

  'Woonheuvels ZH': {
    type: 'wms',
    url: 'https://geodata.zuid-holland.nl/geoserver/cultuur/wms',
    sublayers: ['CHS_2015_ARCHEOLOGIE_WOONHEUVEL'],
    title: 'Woonheuvels ZH',
    opacity: 0.8
  },

  'Windmolens': {
    type: 'wms',
    url: 'https://geodata.zuid-holland.nl/geoserver/cultuur/wms',
    sublayers: ['CHS_2015_NEDERZETTING_WINDMOLENS'],
    title: 'Windmolens',
    opacity: 0.8
  },

  'Erfgoedlijnen': {
    type: 'wms',
    url: 'https://geodata.zuid-holland.nl/geoserver/cultuur/wms',
    sublayers: ['CHS_ERFGOEDLIJN_HOOFDSTRUCTUUR'],
    title: 'Erfgoedlijnen',
    opacity: 0.7
  },

  'Oude Kernen': {
    type: 'wms',
    url: 'https://geodata.zuid-holland.nl/geoserver/cultuur/wms',
    sublayers: ['CHS_2015_ARCHEOLOGIE_KERNEN'],
    title: 'Oude Kernen',
    opacity: 0.7
  },

  // Gelderland
  'Relictenkaart Lijnen': {
    type: 'wms',
    url: 'https://geoserver.gelderland.nl/geoserver/ngr_a/wms',
    sublayers: ['ChAr_Relictenkaart_l'],
    title: 'Relictenkaart Lijnen',
    opacity: 0.7
  },

  'Relictenkaart Vlakken': {
    type: 'wms',
    url: 'https://geoserver.gelderland.nl/geoserver/ngr_a/wms',
    sublayers: ['ChAr_Relictenkaart_v'],
    title: 'Relictenkaart Vlakken',
    opacity: 0.5
  },

  // Zeeland
  'Verdronken Dorpen': {
    type: 'wms',
    url: 'https://opengeodata.zeeland.nl/geoserver/chs/wms',
    sublayers: ['geocmd_vrddrppnt'],
    title: 'Verdronken Dorpen',
    opacity: 0.8
  },

  // RCE Verdedigingswerken
  'Verdedigingslinies': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/linies/wms',
    sublayers: ['linies_en_stellingen'],
    title: 'Verdedigingslinies',
    opacity: 0.7
  },

  'Inundatiegebieden': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/linies/wms',
    sublayers: ['inundatiegebied'],
    title: 'Inundatiegebieden',
    opacity: 0.5
  },

  'Militaire Objecten': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/linies/wms',
    sublayers: ['militair_object'],
    title: 'Militaire Objecten',
    opacity: 0.8
  },

  // RCE Paleokaarten
  'Paleokaart 800 n.Chr.': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/paleogeografie/wms',
    sublayers: ['paleogeografie_800nc'],
    title: 'Paleokaart 800 n.Chr.',
    opacity: 0.7
  },

  'Paleokaart 100 n.Chr.': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/paleogeografie/wms',
    sublayers: ['paleogeografie_100nc'],
    title: 'Paleokaart 100 n.Chr.',
    opacity: 0.7
  },

  'Paleokaart 500 v.Chr.': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/paleogeografie/wms',
    sublayers: ['paleogeografie_500vc'],
    title: 'Paleokaart 500 v.Chr.',
    opacity: 0.7
  },

  'Paleokaart 1500 v.Chr.': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/paleogeografie/wms',
    sublayers: ['paleogeografie_1500vc'],
    title: 'Paleokaart 1500 v.Chr.',
    opacity: 0.7
  },

  'Paleokaart 2750 v.Chr.': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/paleogeografie/wms',
    sublayers: ['paleogeografie_2750vc'],
    title: 'Paleokaart 2750 v.Chr.',
    opacity: 0.7
  },

  'Paleokaart 5500 v.Chr.': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/paleogeografie/wms',
    sublayers: ['paleogeografie_5500vc'],
    title: 'Paleokaart 5500 v.Chr.',
    opacity: 0.7
  },

  'Paleokaart 9000 v.Chr.': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/paleogeografie/wms',
    sublayers: ['paleogeografie_9000vc'],
    title: 'Paleokaart 9000 v.Chr.',
    opacity: 0.7
  },

  'Religieus Erfgoed': {
    type: 'wms',
    url: 'https://services.rce.geovoorziening.nl/landschapsatlas/wms',
    sublayers: ['religieus_erfgoed'],
    title: 'Religieus Erfgoed',
    opacity: 0.8
  },

  'Terpen': {
    type: 'wms',
    url: 'https://fryslan.maps.arcgis.com/sharing/rest/services/Themas/cultuurhistorie/MapServer/WMSServer',
    sublayers: ['0'],  // Terpen layer
    title: 'Terpen',
    opacity: 0.7
  }
}

// ============================================
// GEOJSON LAYERS - Vector data
// ============================================

export const geojsonLayerConfigs: Record<string, GeoJSONLayerConfig> = {
  'Hunebedden': {
    type: 'geojson',
    url: '/detectorapp-nl/data/steentijd/hunebedden.geojson',
    title: 'Hunebedden',
    renderer: ARCGIS_RENDERERS.hunebed(),
    popupEnabled: true,
    popupTitle: '{name}'
  },

  'Grafheuvels': {
    type: 'geojson',
    url: '/detectorapp-nl/data/steentijd/grafheuvels.geojson',
    title: 'Grafheuvels',
    renderer: ARCGIS_RENDERERS.grafheuvel(),
    popupEnabled: true,
    popupTitle: '{name}'
  },

  'Kastelen': {
    type: 'geojson',
    url: '/detectorapp-nl/data/erfgoed/kastelen.geojson',
    title: 'Kastelen',
    renderer: ARCGIS_RENDERERS.castle(),
    popupEnabled: true,
    popupTitle: '{name}'
  },

  'Ruïnes': {
    type: 'geojson',
    url: '/detectorapp-nl/data/erfgoed/ruines.geojson',
    title: 'Ruïnes',
    renderer: ARCGIS_RENDERERS.ruins(),
    popupEnabled: true,
    popupTitle: '{name}'
  },

  'WWII Bunkers': {
    type: 'geojson',
    url: '/detectorapp-nl/data/woii/bunkers.geojson',
    title: 'WWII Bunkers',
    renderer: ARCGIS_RENDERERS.bunker(),
    popupEnabled: true,
    popupTitle: '{name}'
  },

  'Slagvelden': {
    type: 'geojson',
    url: '/detectorapp-nl/data/woii/slagvelden.geojson',
    title: 'Slagvelden',
    renderer: ARCGIS_RENDERERS.slagveld(),
    popupEnabled: true,
    popupTitle: '{name}'
  },

  'Musea': {
    type: 'geojson',
    url: '/detectorapp-nl/data/recreatie/musea.geojson',
    title: 'Musea',
    renderer: ARCGIS_RENDERERS.museum(),
    popupEnabled: true,
    popupTitle: '{name}'
  },

  'Speeltuinen': {
    type: 'geojson',
    url: '/detectorapp-nl/data/recreatie/speeltuinen.geojson',
    title: 'Speeltuinen',
    renderer: ARCGIS_RENDERERS.playground(),
    popupEnabled: true,
    popupTitle: '{name}'
  },

  'Kringloopwinkels': {
    type: 'geojson',
    url: '/detectorapp-nl/data/recreatie/kringloopwinkels.geojson',
    title: 'Kringloopwinkels',
    renderer: ARCGIS_RENDERERS.recycle(),
    popupEnabled: true,
    popupTitle: '{name}'
  },

  'Fossiel Hotspots': {
    type: 'geojson',
    url: '/detectorapp-nl/data/fossielen/fossiel-hotspots.geojson',
    title: 'Fossiel Hotspots',
    renderer: ARCGIS_RENDERERS.fossil(),
    popupEnabled: true,
    popupTitle: '{name}'
  },

  'Mineralen Hotspots': {
    type: 'geojson',
    url: '/detectorapp-nl/data/fossielen/mineralen-hotspots.geojson',
    title: 'Mineralen Hotspots',
    renderer: {
      type: 'simple',
      symbol: createIconSymbolConfig(ARCGIS_ICONS.ammonite, '#7c3aed', 'white', 26)
    },
    popupEnabled: true,
    popupTitle: '{name}'
  },

  'Goudrivieren': {
    type: 'geojson',
    url: '/detectorapp-nl/data/fossielen/goudrivieren.geojson',
    title: 'Goudrivieren',
    renderer: {
      type: 'simple',
      symbol: {
        type: 'simple-marker',
        style: 'circle',
        color: [255, 215, 0, 1],  // Gold
        size: 12,
        outline: { color: [255, 255, 255, 1], width: 2 }
      }
    },
    popupEnabled: true,
    popupTitle: '{name}'
  }
}

// ============================================
// IMAGERY LAYERS - AHN via Esri ImageServer
// ============================================

export const imageryLayerConfigs: Record<string, ImageryLayerConfig> = {
  'AHN4 Hoogtekaart Kleur': {
    type: 'imagery',
    url: 'https://ahn.arcgisonline.nl/arcgis/rest/services/Hoogtebestand/AHN4_DTM_50cm/ImageServer',
    title: 'AHN4 Hoogtekaart Kleur',
    opacity: 1.0,
    renderingRule: {
      rasterFunction: 'AHN - Color Ramp D'
    },
    attributions: '© Esri Nederland, AHN4 50cm'
  },

  'AHN4 Hillshade NL': {
    type: 'imagery',
    url: 'https://ahn.arcgisonline.nl/arcgis/rest/services/Hoogtebestand/AHN4_DTM_5m/ImageServer',
    title: 'AHN4 Hillshade NL',
    opacity: 0.7,
    renderingRule: {
      rasterFunction: 'AHN - Hillshade'
    },
    attributions: '© Esri Nederland, AHN'
  },

  'AHN4 Multi-Hillshade NL': {
    type: 'imagery',
    url: 'https://ahn.arcgisonline.nl/arcgis/rest/services/Hoogtebestand/AHN4_DTM_5m/ImageServer',
    title: 'AHN4 Multi-Hillshade NL',
    opacity: 0.7,
    renderingRule: {
      rasterFunction: 'AHN - Hillshade (Multidirectionaal)'
    },
    attributions: '© Esri Nederland, AHN'
  }
}

// ============================================
// COMBINED CONFIG - All layers
// ============================================

export const allLayerConfigs: Record<string, LayerConfig> = {
  ...wmsLayerConfigs,
  ...geojsonLayerConfigs,
  ...imageryLayerConfigs
}

/**
 * Get layer config by name
 */
export function getLayerConfig(name: string): LayerConfig | undefined {
  return allLayerConfigs[name]
}

/**
 * Get all layer configs of a specific type
 */
export function getLayerConfigsByType<T extends LayerConfig['type']>(
  type: T
): Record<string, Extract<LayerConfig, { type: T }>> {
  const result: Record<string, Extract<LayerConfig, { type: T }>> = {}
  for (const [name, config] of Object.entries(allLayerConfigs)) {
    if (config.type === type) {
      result[name] = config as Extract<LayerConfig, { type: T }>
    }
  }
  return result
}

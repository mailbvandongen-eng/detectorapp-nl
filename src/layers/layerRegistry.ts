import type { Layer } from 'ol/layer'

export interface LayerDefinition {
  name: string
  factory: () => Promise<Layer | null>
  immediateLoad: boolean  // true for WMS (tiles load on-demand), false for vector
}

// Layer registry - maps layer names to their factory functions
// WMS layers are marked as immediateLoad because tiles load on-demand anyway
// Vector layers are lazy loaded to improve startup time

export const layerRegistry: Record<string, LayerDefinition> = {
  // ============================================
  // IMMEDIATE LOAD - WMS/Tile layers (23 layers)
  // These are loaded at startup but tiles only fetch when visible
  // ============================================

  // PDOK WMS layers
  'AHN 0.5m': {
    name: 'AHN 0.5m',
    factory: async () => {
      const { createAHNLayerOL } = await import('./pdokWMSLayers')
      return createAHNLayerOL()
    },
    immediateLoad: true
  },
  'Geomorfologie': {
    name: 'Geomorfologie',
    factory: async () => {
      const { createGeomorfologieLayerOL } = await import('./pdokWMSLayers')
      return createGeomorfologieLayerOL()
    },
    immediateLoad: true
  },
  'Bodemkaart': {
    name: 'Bodemkaart',
    factory: async () => {
      const { createBodemkaartLayerOL } = await import('./pdokWMSLayers')
      return createBodemkaartLayerOL()
    },
    immediateLoad: true
  },
  'IKAW': {
    name: 'IKAW',
    factory: async () => {
      const { createIKAWLayerOL } = await import('./pdokWMSLayers')
      return createIKAWLayerOL()
    },
    immediateLoad: true
  },
  'FAMKE Steentijd': {
    name: 'FAMKE Steentijd',
    factory: async () => {
      const { createFAMKESteentijdLayerOL } = await import('./pdokWMSLayers')
      return createFAMKESteentijdLayerOL()
    },
    immediateLoad: true
  },
  'Archeo Landschappen': {
    name: 'Archeo Landschappen',
    factory: async () => {
      const { createArcheoLandschappenLayerOL } = await import('./pdokWMSLayers')
      return createArcheoLandschappenLayerOL()
    },
    immediateLoad: true
  },
  'Archeo Zones Vlaanderen': {
    name: 'Archeo Zones Vlaanderen',
    factory: async () => {
      const { createVlaanderenArcheoZonesLayerOL } = await import('./pdokWMSLayers')
      return createVlaanderenArcheoZonesLayerOL()
    },
    immediateLoad: true
  },
  'Beschermde Sites Vlaanderen': {
    name: 'Beschermde Sites Vlaanderen',
    factory: async () => {
      const { createVlaanderenBeschArchLayerOL } = await import('./pdokWMSLayers')
      return createVlaanderenBeschArchLayerOL()
    },
    immediateLoad: true
  },

  // Hillshade layers (all WMS/ArcGIS - immediate load)
  'AHN4 Hillshade NL': {
    name: 'AHN4 Hillshade NL',
    factory: async () => {
      const { createAHN4HillshadeLayerOL } = await import('./hillshadeLayers')
      return createAHN4HillshadeLayerOL()
    },
    immediateLoad: true
  },
  'AHN4 Multi-Hillshade NL': {
    name: 'AHN4 Multi-Hillshade NL',
    factory: async () => {
      const { createAHN4MultiHillshadeLayerOL } = await import('./hillshadeLayers')
      return createAHN4MultiHillshadeLayerOL()
    },
    immediateLoad: true
  },
  'AHN4 Helling NL': {
    name: 'AHN4 Helling NL',
    factory: async () => {
      const { createAHN4SlopeLayerOL } = await import('./hillshadeLayers')
      return createAHN4SlopeLayerOL()
    },
    immediateLoad: true
  },
  'World Hillshade': {
    name: 'World Hillshade',
    factory: async () => {
      const { createWorldHillshadeLayerOL } = await import('./hillshadeLayers')
      return createWorldHillshadeLayerOL()
    },
    immediateLoad: true
  },
  'Hillshade Vlaanderen 25cm': {
    name: 'Hillshade Vlaanderen 25cm',
    factory: async () => {
      const { createDHMVHillshadeLayerOL } = await import('./hillshadeLayers')
      return createDHMVHillshadeLayerOL()
    },
    immediateLoad: true
  },
  'Skyview Vlaanderen 25cm': {
    name: 'Skyview Vlaanderen 25cm',
    factory: async () => {
      const { createDHMVSkyviewLayerOL } = await import('./hillshadeLayers')
      return createDHMVSkyviewLayerOL()
    },
    immediateLoad: true
  },
  'DTM Vlaanderen 1m': {
    name: 'DTM Vlaanderen 1m',
    factory: async () => {
      const { createDHMVDTMLayerOL } = await import('./hillshadeLayers')
      return createDHMVDTMLayerOL()
    },
    immediateLoad: true
  },
  'Hillshade NRW 25cm': {
    name: 'Hillshade NRW 25cm',
    factory: async () => {
      const { createNRWHillshadeLayerOL } = await import('./hillshadeLayers')
      return createNRWHillshadeLayerOL()
    },
    immediateLoad: true
  },
  'Hillshade NRW Kleur': {
    name: 'Hillshade NRW Kleur',
    factory: async () => {
      const { createNRWHillshadeColorLayerOL } = await import('./hillshadeLayers')
      return createNRWHillshadeColorLayerOL()
    },
    immediateLoad: true
  },
  'Hillshade Frankrijk': {
    name: 'Hillshade Frankrijk',
    factory: async () => {
      const { createFranceHillshadeLayerOL } = await import('./hillshadeLayers')
      return createFranceHillshadeLayerOL()
    },
    immediateLoad: true
  },
  'LiDAR HD Frankrijk': {
    name: 'LiDAR HD Frankrijk',
    factory: async () => {
      const { createFranceLidarHDHillshadeLayerOL } = await import('./hillshadeLayers')
      return createFranceLidarHDHillshadeLayerOL()
    },
    immediateLoad: true
  },
  'RGE Alti Frankrijk 1m': {
    name: 'RGE Alti Frankrijk 1m',
    factory: async () => {
      const { createFranceRGEAltiLayerOL } = await import('./hillshadeLayers')
      return createFranceRGEAltiLayerOL()
    },
    immediateLoad: true
  },
  'Hoogtelijn Frankrijk': {
    name: 'Hoogtelijn Frankrijk',
    factory: async () => {
      const { createFranceContourLayerOL } = await import('./hillshadeLayers')
      return createFranceContourLayerOL()
    },
    immediateLoad: true
  },
  'Hillshade Wallonië': {
    name: 'Hillshade Wallonië',
    factory: async () => {
      const { createWallonieHillshadeLayerOL } = await import('./hillshadeLayers')
      return createWallonieHillshadeLayerOL()
    },
    immediateLoad: true
  },

  // CAI Vlaanderen (WMS-based)
  'CAI Vlaanderen': {
    name: 'CAI Vlaanderen',
    factory: async () => {
      const { createCAIVlaanderenLayerOL } = await import('./caiVlaanderenOL')
      return createCAIVlaanderenLayerOL()
    },
    immediateLoad: true
  },


  // ============================================
  // LAZY LOAD - Vector layers
  // These are only loaded when first toggled on
  // ============================================

  // Belgian Heritage GeoJSON layers (Onroerend Erfgoed)
  'Monumenten BE': {
    name: 'Monumenten BE',
    factory: async () => {
      const { createBeschermdeMonumentenBELayerOL } = await import('./belgieErfgoedLayers')
      return createBeschermdeMonumentenBELayerOL()
    },
    immediateLoad: false
  },
  'Archeo Zones BE': {
    name: 'Archeo Zones BE',
    factory: async () => {
      const { createArcheoZonesBELayerOL } = await import('./belgieErfgoedLayers')
      return createArcheoZonesBELayerOL()
    },
    immediateLoad: false
  },
  'Arch Sites BE': {
    name: 'Arch Sites BE',
    factory: async () => {
      const { createBeschArchSitesBELayerOL } = await import('./belgieErfgoedLayers')
      return createBeschArchSitesBELayerOL()
    },
    immediateLoad: false
  },
  'Erfgoed Landschap BE': {
    name: 'Erfgoed Landschap BE',
    factory: async () => {
      const { createErfgoedLandschappenBELayerOL } = await import('./belgieErfgoedLayers')
      return createErfgoedLandschappenBELayerOL()
    },
    immediateLoad: false
  },
  'CAI Elementen': {
    name: 'CAI Elementen',
    factory: async () => {
      const { createCAIElementenBELayerOL } = await import('./belgieErfgoedLayers')
      return createCAIElementenBELayerOL()
    },
    immediateLoad: false
  },

  // France historical buildings (large dataset, ~44k features)
  'Hist. Gebouwen FR': {
    name: 'Hist. Gebouwen FR',
    factory: async () => {
      const { createFrankrijkMonumentenLayerOL } = await import('./frankrijkMonumentenOL')
      return createFrankrijkMonumentenLayerOL()
    },
    immediateLoad: false
  },

  // France INRAP archaeological sites (624 excavations)
  'INRAP Sites FR': {
    name: 'INRAP Sites FR',
    factory: async () => {
      const { createInrapSitesFRLayerOL } = await import('./inrapSitesFROL')
      return createInrapSitesFRLayerOL()
    },
    immediateLoad: false
  },

  // Bretagne archaeological sites (23,683 sites from Carte Archéologique Nationale)
  'Archeo Sites Bretagne': {
    name: 'Archeo Sites Bretagne',
    factory: async () => {
      const { createArcheoBretagneLayerOL } = await import('./archeoBretagneOL')
      return createArcheoBretagneLayerOL()
    },
    immediateLoad: false
  },

  // Bretagne archaeological operations (3,623 excavations/diagnostics)
  'Operaties Bretagne': {
    name: 'Operaties Bretagne',
    factory: async () => {
      const { createBretagneOperationsLayerOL } = await import('./bretagneOperationsOL')
      return createBretagneOperationsLayerOL()
    },
    immediateLoad: false
  },

  // Paris Archaeological Reference (1,811 operations from R&CAP project)
  'Archeo Parijs': {
    name: 'Archeo Parijs',
    factory: async () => {
      const { createParisArcheoLayerOL } = await import('./parisArcheoOL')
      return createParisArcheoLayerOL()
    },
    immediateLoad: false
  },

  // Occitanie Heritage Sites (1,348 Sites Classés + Sites Inscrits)
  'Sites Patrimoine Occitanie': {
    name: 'Sites Patrimoine Occitanie',
    factory: async () => {
      const { createOccitaniePatrimoineLayerOL } = await import('./occitaniePatrimoineOL')
      return createOccitaniePatrimoineLayerOL()
    },
    immediateLoad: false
  },

  // PACA Heritage Sites (549 Sites Classés + Sites Inscrits)
  'Sites Patrimoine PACA': {
    name: 'Sites Patrimoine PACA',
    factory: async () => {
      const { createPacaPatrimoineLayerOL } = await import('./pacaPatrimoineOL')
      return createPacaPatrimoineLayerOL()
    },
    immediateLoad: false
  },

  // Wikimaginot - Maginot Line Fortifications (16,371 constructions)
  'Maginotlinie': {
    name: 'Maginotlinie',
    factory: async () => {
      const { createWikimaginotLayerOL } = await import('./wikimaginotOL')
      return createWikimaginotLayerOL()
    },
    immediateLoad: false
  },

  // Normandie Heritage Sites (623 Sites Classés + Sites Inscrits)
  'Sites Patrimoine Normandie': {
    name: 'Sites Patrimoine Normandie',
    factory: async () => {
      const { createNormandiePatrimoineLayerOL } = await import('./normandiePatrimoineOL')
      return createNormandiePatrimoineLayerOL()
    },
    immediateLoad: false
  },

  // Archaeological vector layers
  'AMK Monumenten': {
    name: 'AMK Monumenten',
    factory: async () => {
      const { createAMKLayerOL } = await import('./amkOL')
      return createAMKLayerOL()
    },
    immediateLoad: false
  },
  'Archis-punten': {
    name: 'Archis-punten',
    factory: async () => {
      const { createArchisPuntenLayerOL } = await import('./archisOL')
      return createArchisPuntenLayerOL()
    },
    immediateLoad: false
  },
  'Romeinse wegen': {
    name: 'Romeinse wegen',
    factory: async () => {
      const { createRomeinseWegenLayerOL } = await import('./romeinsOL')
      return createRomeinseWegenLayerOL()
    },
    immediateLoad: false
  },
  'Toestemmingen': {
    name: 'Toestemmingen',
    factory: async () => {
      const { createToestemmingenLayerOL } = await import('./toestemmingenOL')
      return createToestemmingenLayerOL()
    },
    immediateLoad: false
  },
  'Castella (punten)': {
    name: 'Castella (punten)',
    factory: async () => {
      const { createCastellaPuntenLayerOL } = await import('./castellaPuntenOL')
      return createCastellaPuntenLayerOL()
    },
    immediateLoad: false
  },
  'Castella (lijnen)': {
    name: 'Castella (lijnen)',
    factory: async () => {
      const { createCastellaLijnenLayerOL } = await import('./castellaLijnenOL')
      return createCastellaLijnenLayerOL()
    },
    immediateLoad: false
  },
  'Oppida': {
    name: 'Oppida',
    factory: async () => {
      const { createOppidaLayerOL } = await import('./oppidaOL')
      return createOppidaLayerOL()
    },
    immediateLoad: false
  },
  'Kastelen': {
    name: 'Kastelen',
    factory: async () => {
      const { createKastelenLayerOL } = await import('./kastelenOL')
      return createKastelenLayerOL()
    },
    immediateLoad: false
  },
  'Veengebieden': {
    name: 'Veengebieden',
    factory: async () => {
      const { createVeengebiedenLayerOL } = await import('./veengebiedenOL')
      return createVeengebiedenLayerOL()
    },
    immediateLoad: false
  },
  'Kromme Rijn Aardewerk': {
    name: 'Kromme Rijn Aardewerk',
    factory: async () => {
      const { createKrommeRijnAardewerkLayerOL } = await import('./krommeRijnAardewerkOL')
      return createKrommeRijnAardewerkLayerOL()
    },
    immediateLoad: false
  },

  // Steentijd (Stone Age) layers
  'Hunebedden': {
    name: 'Hunebedden',
    factory: async () => {
      const { createHunebeddenLayerOL } = await import('./hunebeddenOL')
      return createHunebeddenLayerOL()
    },
    immediateLoad: false
  },
  'EUROEVOL Sites': {
    name: 'EUROEVOL Sites',
    factory: async () => {
      const { createEuroevolLayerOL } = await import('./euroevolOL')
      return createEuroevolLayerOL()
    },
    immediateLoad: false
  },

  // UIKAV layers
  'Archeo Punten': {
    name: 'Archeo Punten',
    factory: async () => {
      const { createUIKAVArcheoPuntenLayerOL } = await import('./uikavArcheoPuntenOL')
      return createUIKAVArcheoPuntenLayerOL()
    },
    immediateLoad: false
  },
  'Vlakken': {
    name: 'Vlakken',
    factory: async () => {
      const { createUIKAVVlakkenLayerOL } = await import('./uikavVlakkenOL')
      return createUIKAVVlakkenLayerOL()
    },
    immediateLoad: false
  },
  'Bufferlaag': {
    name: 'Bufferlaag',
    factory: async () => {
      const { createUIKAVBufferlaagLayerOL } = await import('./uikavBufferlaagOL')
      return createUIKAVBufferlaagLayerOL()
    },
    immediateLoad: false
  },
  'Expert': {
    name: 'Expert',
    factory: async () => {
      const { createUIKAVExpertLayerOL } = await import('./uikavExpertOL')
      return createUIKAVExpertLayerOL()
    },
    immediateLoad: false
  },
  'Indeling': {
    name: 'Indeling',
    factory: async () => {
      const { createUIKAVUiterwaardenLayerOL } = await import('./uikavUiterwaardenOL')
      return createUIKAVUiterwaardenLayerOL()
    },
    immediateLoad: false
  },

  // Recreation layers
  'Speeltuinen': {
    name: 'Speeltuinen',
    factory: async () => {
      const { createSpeeltuinenLayerOL } = await import('./speeltuinenOL')
      return createSpeeltuinenLayerOL()
    },
    immediateLoad: false
  },
  'Musea': {
    name: 'Musea',
    factory: async () => {
      const { createMuseaLayerOL } = await import('./museaOL')
      return createMuseaLayerOL()
    },
    immediateLoad: false
  },
  'Strandjes': {
    name: 'Strandjes',
    factory: async () => {
      const { createStrandjesLayerOL } = await import('./strandjesOL')
      return createStrandjesLayerOL()
    },
    immediateLoad: false
  },
  'Parken': {
    name: 'Parken',
    factory: async () => {
      const { createParkenLayerOL } = await import('./parkenOL')
      return createParkenLayerOL()
    },
    immediateLoad: false
  },
  'Kringloopwinkels': {
    name: 'Kringloopwinkels',
    factory: async () => {
      const { createKringloopwinkelsLayerOL } = await import('./kringloopwinkelsOL')
      return createKringloopwinkelsLayerOL()
    },
    immediateLoad: false
  },

  // Fossil layers (remote API - definitely lazy load)
  'Fossielen Nederland': {
    name: 'Fossielen Nederland',
    factory: async () => {
      const { createFossielenLayerOL } = await import('./fossielenOL')
      return createFossielenLayerOL()
    },
    immediateLoad: false
  },
  'Fossielen België': {
    name: 'Fossielen België',
    factory: async () => {
      const { createFossielenBelgieLayerOL } = await import('./fossielenBelgieOL')
      return createFossielenBelgieLayerOL()
    },
    immediateLoad: false
  },
  'Fossielen Duitsland': {
    name: 'Fossielen Duitsland',
    factory: async () => {
      const { createFossielenDuitslandLayerOL } = await import('./fossielenDuitslandOL')
      return createFossielenDuitslandLayerOL()
    },
    immediateLoad: false
  },
  'Fossielen Frankrijk': {
    name: 'Fossielen Frankrijk',
    factory: async () => {
      const { createFossielenFrankrijkLayerOL } = await import('./fossielenFrankrijkOL')
      return createFossielenFrankrijkLayerOL()
    },
    immediateLoad: false
  },

  // Vici.org Roman sites (API)
  'Vici.org Romeins': {
    name: 'Vici.org Romeins',
    factory: async () => {
      const { createViciLayerOL } = await import('./viciOL')
      return createViciLayerOL()
    },
    immediateLoad: false
  },
}

// Helper to get all immediate load layers
export function getImmediateLoadLayers(): LayerDefinition[] {
  return Object.values(layerRegistry).filter(def => def.immediateLoad)
}

// Helper to get all lazy load layers
export function getLazyLoadLayers(): LayerDefinition[] {
  return Object.values(layerRegistry).filter(def => !def.immediateLoad)
}

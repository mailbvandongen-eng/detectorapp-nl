import type { Layer } from 'ol/layer'

export interface LayerDefinition {
  name: string
  factory: () => Promise<Layer | null>
  immediateLoad: boolean  // true for WMS (tiles load on-demand), false for vector
}

// Layer registry - NL only version
// WMS layers are marked as immediateLoad because tiles load on-demand anyway
// Vector layers are lazy loaded to improve startup time

export const layerRegistry: Record<string, LayerDefinition> = {
  // ============================================
  // IMMEDIATE LOAD - WMS/Tile layers
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

  // RCE WMS layers - Erfgoed & Monumenten
  'Rijksmonumenten': {
    name: 'Rijksmonumenten',
    factory: async () => {
      const { createRijksmonumentenLayerOL } = await import('./pdokWMSLayers')
      return createRijksmonumentenLayerOL()
    },
    immediateLoad: true
  },
  'Archeo Onderzoeken': {
    name: 'Archeo Onderzoeken',
    factory: async () => {
      const { createArcheoOnderzoekenLayerOL } = await import('./pdokWMSLayers')
      return createArcheoOnderzoekenLayerOL()
    },
    immediateLoad: true
  },
  'Werelderfgoed': {
    name: 'Werelderfgoed',
    factory: async () => {
      const { createWerelderfgoedLayerOL } = await import('./pdokWMSLayers')
      return createWerelderfgoedLayerOL()
    },
    immediateLoad: true
  },

  // Friesland WMS layers
  'Terpen': {
    name: 'Terpen',
    factory: async () => {
      const { createTerpenLayerOL } = await import('./terpenOL')
      return createTerpenLayerOL()
    },
    immediateLoad: true
  },

  // RCE Verdedigingswerken (Linies en Stellingen)
  'Verdedigingslinies': {
    name: 'Verdedigingslinies',
    factory: async () => {
      const { createLiniesLayerOL } = await import('./verdedigingswerkenOL')
      return createLiniesLayerOL()
    },
    immediateLoad: true
  },
  'Inundatiegebieden': {
    name: 'Inundatiegebieden',
    factory: async () => {
      const { createInundatiesLayerOL } = await import('./verdedigingswerkenOL')
      return createInundatiesLayerOL()
    },
    immediateLoad: true
  },
  'Militaire Objecten': {
    name: 'Militaire Objecten',
    factory: async () => {
      const { createMilitaireObjectenLayerOL } = await import('./verdedigingswerkenOL')
      return createMilitaireObjectenLayerOL()
    },
    immediateLoad: true
  },

  // RCE Paleogeografische kaarten
  'Paleokaart 800 n.Chr.': {
    name: 'Paleokaart 800 n.Chr.',
    factory: async () => {
      const { createPaleo800ncLayerOL } = await import('./paleokaartOL')
      return createPaleo800ncLayerOL()
    },
    immediateLoad: true
  },
  'Paleokaart 100 n.Chr.': {
    name: 'Paleokaart 100 n.Chr.',
    factory: async () => {
      const { createPaleo100ncLayerOL } = await import('./paleokaartOL')
      return createPaleo100ncLayerOL()
    },
    immediateLoad: true
  },
  'Paleokaart 500 v.Chr.': {
    name: 'Paleokaart 500 v.Chr.',
    factory: async () => {
      const { createPaleo500vcLayerOL } = await import('./paleokaartOL')
      return createPaleo500vcLayerOL()
    },
    immediateLoad: true
  },
  'Paleokaart 1500 v.Chr.': {
    name: 'Paleokaart 1500 v.Chr.',
    factory: async () => {
      const { createPaleo1500vcLayerOL } = await import('./paleokaartOL')
      return createPaleo1500vcLayerOL()
    },
    immediateLoad: true
  },
  'Paleokaart 2750 v.Chr.': {
    name: 'Paleokaart 2750 v.Chr.',
    factory: async () => {
      const { createPaleo2750vcLayerOL } = await import('./paleokaartOL')
      return createPaleo2750vcLayerOL()
    },
    immediateLoad: true
  },
  'Paleokaart 5500 v.Chr.': {
    name: 'Paleokaart 5500 v.Chr.',
    factory: async () => {
      const { createPaleo5500vcLayerOL } = await import('./paleokaartOL')
      return createPaleo5500vcLayerOL()
    },
    immediateLoad: true
  },
  'Paleokaart 9000 v.Chr.': {
    name: 'Paleokaart 9000 v.Chr.',
    factory: async () => {
      const { createPaleo9000vcLayerOL } = await import('./paleokaartOL')
      return createPaleo9000vcLayerOL()
    },
    immediateLoad: true
  },

  // RCE Religieus Erfgoed
  'Religieus Erfgoed': {
    name: 'Religieus Erfgoed',
    factory: async () => {
      const { createReligieusErfgoedLayerOL } = await import('./religieusErfgoedOL')
      return createReligieusErfgoedLayerOL()
    },
    immediateLoad: true
  },

  // Hillshade layers - NL only
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

  // Percelen - Kadaster & Landbouw
  'BRP Gewaspercelen': {
    name: 'BRP Gewaspercelen',
    factory: async () => {
      const { createBRPGewaspercelenLayerOL } = await import('./pdokWMSLayers')
      return createBRPGewaspercelenLayerOL()
    },
    immediateLoad: true
  },
  'Kadastrale Grenzen': {
    name: 'Kadastrale Grenzen',
    factory: async () => {
      const { createKadastraleKaartLayerOL } = await import('./pdokWMSLayers')
      return createKadastraleKaartLayerOL()
    },
    immediateLoad: true
  },

  // ============================================
  // LAZY LOAD - Vector layers
  // These are only loaded when first toggled on
  // ============================================

  // Archaeological vector layers
  'AMK Monumenten': {
    name: 'AMK Monumenten',
    factory: async () => {
      const { createAMKLayerOL } = await import('./amkOL')
      return createAMKLayerOL()
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

  // Steentijd (Stone Age) layers
  'Hunebedden': {
    name: 'Hunebedden',
    factory: async () => {
      const { createHunebeddenLayerOL } = await import('./hunebeddenOL')
      return createHunebeddenLayerOL()
    },
    immediateLoad: false
  },
  // UIKAV layers
  'UIKAV Punten': {
    name: 'UIKAV Punten',
    factory: async () => {
      const { createUIKAVArcheoPuntenLayerOL } = await import('./uikavArcheoPuntenOL')
      return createUIKAVArcheoPuntenLayerOL()
    },
    immediateLoad: false
  },
  'UIKAV Vlakken': {
    name: 'UIKAV Vlakken',
    factory: async () => {
      const { createUIKAVVlakkenLayerOL } = await import('./uikavVlakkenOL')
      return createUIKAVVlakkenLayerOL()
    },
    immediateLoad: false
  },
  'UIKAV Buffer': {
    name: 'UIKAV Buffer',
    factory: async () => {
      const { createUIKAVBufferlaagLayerOL } = await import('./uikavBufferlaagOL')
      return createUIKAVBufferlaagLayerOL()
    },
    immediateLoad: false
  },
  'UIKAV Expert': {
    name: 'UIKAV Expert',
    factory: async () => {
      const { createUIKAVExpertLayerOL } = await import('./uikavExpertOL')
      return createUIKAVExpertLayerOL()
    },
    immediateLoad: false
  },
  'UIKAV Indeling': {
    name: 'UIKAV Indeling',
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

  // Fossil layers - PBDB data
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

  // WWII Bunkers - from OpenStreetMap
  'WWII Bunkers': {
    name: 'WWII Bunkers',
    factory: async () => {
      const { createBunkersLayerOL } = await import('./bunkersOL')
      return createBunkersLayerOL()
    },
    immediateLoad: false
  },

  // Grafheuvels (burial mounds) - from OpenStreetMap
  'Grafheuvels': {
    name: 'Grafheuvels',
    factory: async () => {
      const { createGrafheuvelsLayerOL } = await import('./grafheuvelsOL')
      return createGrafheuvelsLayerOL()
    },
    immediateLoad: false
  },

  // Military layers - WWII related
  'Slagvelden': {
    name: 'Slagvelden',
    factory: async () => {
      const { createSlagveldenLayerOL } = await import('./slagveldenOL')
      return createSlagveldenLayerOL()
    },
    immediateLoad: false
  },
  'Militaire Vliegvelden': {
    name: 'Militaire Vliegvelden',
    factory: async () => {
      const { createVliegveldenLayerOL } = await import('./vliegveldenOL')
      return createVliegveldenLayerOL()
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

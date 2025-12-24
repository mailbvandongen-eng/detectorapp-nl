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

  // Fossil layer - NL only
  'Fossielen Nederland': {
    name: 'Fossielen Nederland',
    factory: async () => {
      const { createFossielenLayerOL } = await import('./fossielenOL')
      return createFossielenLayerOL()
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

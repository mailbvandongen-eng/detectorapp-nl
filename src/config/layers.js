/**
 * Layer metadata configuration
 * Defines categories, periods, and descriptions for all archaeological layers
 */

export const layerMetadata = {
  'AMK Monumenten': {
    category: 'Monumenten & Beschermingszones',
    period: 'Diverse perioden',
    description: 'RCE Archeologische Monumentenkaart met 4 waardeniveaus',
    type: 'topojson',
    file: 'amk_monumenten.topojson'
  },
  'Monumenten': {
    category: 'Monumenten & Beschermingszones',
    period: 'Diverse perioden',
    description: 'Custom monumenten verzameling',
    type: 'geojson',
    file: 'monumenten_custom.geojson'
  },
  'Uiterwaarden RCE': {
    category: 'Monumenten & Beschermingszones',
    period: 'Romeins - Nieuwste tijd (450 n.Chr.-1939)',
    description: 'RCE Uiterwaarden verwachtingskaart',
    type: 'geojson',
    file: 'uiterwaarden_verwachting.geojson'
  },
  'Romeinse wegen (Itiner-E)': {
    category: 'Romeinse Infrastructuur',
    period: 'Romeins (12 v.Chr.-450 n.Chr.)',
    description: 'Itiner-E wereldwijd wegennetwerk - 15,196 segmenten',
    type: 'geojson',
    file: 'romeinse_wegen_itiner_e.geojson'
  },
  'Romeinse wegen': {
    category: 'Romeinse Infrastructuur',
    period: 'Romeins (12 v.Chr.-450 n.Chr.)',
    description: 'Romeinse wegen custom verzameling',
    type: 'geojson',
    file: 'romeinse_wegen_custom.geojson'
  },
  'Archis-punten': {
    category: 'Archeologische Vondsten',
    period: 'Diverse perioden',
    description: 'Archeologische vondstlocaties',
    type: 'geojson',
    file: 'punten_custom.geojson'
  },
  'Toestemmingen': {
    category: 'Administratief',
    period: 'Heden',
    description: 'Detectie toestemmingen',
    type: 'geojson',
    file: 'toestemmingen_custom.geojson'
  }
}

export const categoryOrder = [
  'Monumenten & Beschermingszones',
  'Romeinse Infrastructuur',
  'Archeologische Vondsten',
  'Administratief'
]

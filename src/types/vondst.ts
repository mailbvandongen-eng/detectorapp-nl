export interface Vondst {
  id?: string
  userId: string
  location: {
    lat: number
    lng: number
    accuracy?: number
  }
  timestamp: string // ISO date string
  photos: string[] // Storage URLs
  notes: string
  objectType: VondstObjectType
  material?: string
  period?: string
  depth?: number // cm
  tags: string[]
  private: boolean
  createdAt: string
  updatedAt: string
}

export type VondstObjectType =
  | 'Munt'
  | 'Aardewerk'
  | 'Gesp'
  | 'Fibula'
  | 'Ring'
  | 'Speld'
  | 'Sieraad'
  | 'Gereedschap'
  | 'Wapen'
  | 'Anders'

export type VondstMaterial =
  | 'Brons'
  | 'IJzer'
  | 'Zilver'
  | 'Goud'
  | 'Lood'
  | 'Tin'
  | 'Keramiek'
  | 'Steen'
  | 'Glas'
  | 'Been'
  | 'Onbekend'

export type VondstPeriod =
  | 'Prehistorie'
  | 'IJzertijd'
  | 'Romeins (12 v.Chr.-450 n.Chr.)'
  | 'Middeleeuws (450-1500)'
  | 'Nieuwetijd (1500-1800)'
  | 'Modern (1800+)'
  | 'Onbekend'

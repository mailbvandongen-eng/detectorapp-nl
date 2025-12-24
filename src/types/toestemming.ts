export interface Toestemming {
  id?: string
  userId: string
  ownerName: string
  ownerPhone?: string
  ownerEmail?: string
  area: GeoJSONPolygon
  validUntil?: string // ISO date string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: number[][][]
}

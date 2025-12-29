import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import * as XLSX from 'xlsx'

// Condition type for finds
export type VondstCondition = 'Uitstekend' | 'Goed' | 'Matig' | 'Slecht' | 'Onbekend'

// Simplified local vondst type (no Firebase fields)
export interface LocalVondst {
  id: string
  location: {
    lat: number
    lng: number
  }
  timestamp: string // ISO date string
  notes: string
  objectType: string
  material: string
  period: string
  depth?: number // cm
  // New fields v2.6.0
  photoUrl?: string // Link to photo (Google Photos, iCloud, etc.)
  condition?: VondstCondition // Object condition
  weight?: number // Weight in grams
}

interface LocalVondstenState {
  vondsten: LocalVondst[]
  addVondst: (vondst: Omit<LocalVondst, 'id' | 'timestamp'>) => void
  removeVondst: (id: string) => void
  updateVondst: (id: string, updates: Partial<LocalVondst>) => void
  clearAll: () => void
  exportAsGeoJSON: () => void
  exportAsCSV: () => void
  exportAsExcel: () => void
  exportAsGPX: () => void
  exportAsKML: () => void
}

export const useLocalVondstenStore = create<LocalVondstenState>()(
  persist(
    (set, get) => ({
      vondsten: [],

      addVondst: (vondst) => set((state) => ({
        vondsten: [
          ...state.vondsten,
          {
            ...vondst,
            id: crypto.randomUUID(),
            timestamp: new Date().toISOString()
          }
        ]
      })),

      removeVondst: (id) => set((state) => ({
        vondsten: state.vondsten.filter(v => v.id !== id)
      })),

      updateVondst: (id, updates) => set((state) => ({
        vondsten: state.vondsten.map(v =>
          v.id === id ? { ...v, ...updates } : v
        )
      })),

      clearAll: () => set({ vondsten: [] }),

      exportAsGeoJSON: () => {
        const vondsten = get().vondsten
        if (vondsten.length === 0) {
          alert('Geen vondsten om te exporteren')
          return
        }

        const geojson = {
          type: 'FeatureCollection',
          features: vondsten.map(v => ({
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [v.location.lng, v.location.lat]
            },
            properties: {
              id: v.id,
              objectType: v.objectType,
              material: v.material,
              period: v.period,
              depth: v.depth,
              notes: v.notes,
              timestamp: v.timestamp,
              photoUrl: v.photoUrl,
              condition: v.condition,
              weight: v.weight
            }
          }))
        }

        // Download as file
        const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mijn-vondsten-${new Date().toISOString().split('T')[0]}.geojson`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      },

      exportAsCSV: () => {
        const vondsten = get().vondsten
        if (vondsten.length === 0) {
          alert('Geen vondsten om te exporteren')
          return
        }

        const header = 'ID,Latitude,Longitude,Datum,Type,Materiaal,Periode,Diepte (cm),Conditie,Gewicht (g),Notities,Foto URL\n'
        const rows = vondsten.map(v => {
          const date = new Date(v.timestamp).toLocaleDateString('nl-NL')
          const notes = v.notes ? `"${v.notes.replace(/"/g, '""')}"` : ''
          return `${v.id},${v.location.lat},${v.location.lng},${date},${v.objectType},${v.material},${v.period},${v.depth || ''},${v.condition || ''},${v.weight || ''},${notes},${v.photoUrl || ''}`
        }).join('\n')

        const csv = header + rows
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mijn-vondsten-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      },

      exportAsExcel: () => {
        const vondsten = get().vondsten
        if (vondsten.length === 0) {
          alert('Geen vondsten om te exporteren')
          return
        }

        // Prepare data for Excel
        const data = vondsten.map(v => ({
          'ID': v.id,
          'Latitude': v.location.lat,
          'Longitude': v.location.lng,
          'Datum': new Date(v.timestamp).toLocaleDateString('nl-NL'),
          'Type': v.objectType,
          'Materiaal': v.material,
          'Periode': v.period,
          'Diepte (cm)': v.depth || '',
          'Conditie': v.condition || '',
          'Gewicht (g)': v.weight || '',
          'Notities': v.notes || '',
          'Foto URL': v.photoUrl || ''
        }))

        // Create workbook and worksheet
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Vondsten')

        // Auto-size columns
        const colWidths = [
          { wch: 36 }, // ID
          { wch: 12 }, // Lat
          { wch: 12 }, // Lng
          { wch: 12 }, // Datum
          { wch: 15 }, // Type
          { wch: 12 }, // Materiaal
          { wch: 25 }, // Periode
          { wch: 12 }, // Diepte
          { wch: 12 }, // Conditie
          { wch: 12 }, // Gewicht
          { wch: 40 }, // Notities
          { wch: 50 }  // Foto URL
        ]
        ws['!cols'] = colWidths

        // Download
        XLSX.writeFile(wb, `mijn-vondsten-${new Date().toISOString().split('T')[0]}.xlsx`)
      },

      exportAsGPX: () => {
        const vondsten = get().vondsten
        if (vondsten.length === 0) {
          alert('Geen vondsten om te exporteren')
          return
        }

        const waypoints = vondsten.map(v => {
          const date = new Date(v.timestamp).toISOString()
          return `  <wpt lat="${v.location.lat}" lon="${v.location.lng}">
    <name>${v.objectType} - ${v.material}</name>
    <desc>${v.period}${v.depth ? `, ${v.depth}cm diep` : ''}${v.condition && v.condition !== 'Onbekend' ? `, ${v.condition}` : ''}${v.weight ? `, ${v.weight}g` : ''}${v.notes ? `. ${v.notes}` : ''}</desc>
    <time>${date}</time>
    <sym>Pin</sym>
  </wpt>`
        }).join('\n')

        const gpx = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="DetectorApp NL" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>Mijn Vondsten</name>
    <desc>Geexporteerd uit DetectorApp NL</desc>
    <time>${new Date().toISOString()}</time>
  </metadata>
${waypoints}
</gpx>`

        const blob = new Blob([gpx], { type: 'application/gpx+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mijn-vondsten-${new Date().toISOString().split('T')[0]}.gpx`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      },

      exportAsKML: () => {
        const vondsten = get().vondsten
        if (vondsten.length === 0) {
          alert('Geen vondsten om te exporteren')
          return
        }

        const placemarks = vondsten.map(v => {
          const date = new Date(v.timestamp).toLocaleDateString('nl-NL')
          const description = `<![CDATA[
            <b>Type:</b> ${v.objectType}<br/>
            <b>Materiaal:</b> ${v.material}<br/>
            <b>Periode:</b> ${v.period}<br/>
            ${v.depth ? `<b>Diepte:</b> ${v.depth} cm<br/>` : ''}
            ${v.condition && v.condition !== 'Onbekend' ? `<b>Conditie:</b> ${v.condition}<br/>` : ''}
            ${v.weight ? `<b>Gewicht:</b> ${v.weight} gram<br/>` : ''}
            <b>Datum:</b> ${date}<br/>
            ${v.notes ? `<b>Notities:</b> ${v.notes}<br/>` : ''}
            ${v.photoUrl ? `<a href="${v.photoUrl}">Bekijk foto</a>` : ''}
          ]]>`
          return `    <Placemark>
      <name>${v.objectType} - ${v.material}</name>
      <description>${description}</description>
      <Point>
        <coordinates>${v.location.lng},${v.location.lat},0</coordinates>
      </Point>
    </Placemark>`
        }).join('\n')

        const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Mijn Vondsten</name>
    <description>Geexporteerd uit DetectorApp NL</description>
${placemarks}
  </Document>
</kml>`

        const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `mijn-vondsten-${new Date().toISOString().split('T')[0]}.kml`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      }
    }),
    {
      name: 'detectorapp-local-vondsten'
    }
  )
)

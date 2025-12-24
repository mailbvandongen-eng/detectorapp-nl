import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import Feature from 'ol/Feature'
import Point from 'ol/geom/Point'
import { fromLonLat } from 'ol/proj'
import { LAYER_STYLES } from './iconStyles'

// Extended PBDB Occurrence interface with all useful fields
export interface PBDBOccurrence {
  oid: string           // occurrence ID
  tna: string           // taxon name
  idn: string           // identified name (full species)
  lng: string           // longitude
  lat: string           // latitude
  oei: string           // early interval (period)
  eag: number           // early age (Ma)
  lag: number           // late age (Ma)
  ggc: string           // geographic context
  phl: string           // phylum
  cll: string           // class
  odl: string           // order
  fml: string           // family
  gnl: string           // genus
  cnm: string           // collection name
  sfm: string           // formation
  smb: string           // member
  lt1: string           // lithology (rock type)
  env: string           // environment
}

export interface PBDBResponse<T> {
  records: T[]
}

const COUNTRY_NAMES: Record<string, string> = {
  NL: 'Nederland',
  BE: 'België',
  DE: 'Duitsland',
  FR: 'Frankrijk'
}

// Create fossil occurrences layer (individual fossil finds)
export async function createFossilOccurrenceLayer(
  countryCode: string,
  title: string
): Promise<VectorLayer<VectorSource>> {
  try {
    const response = await fetch(
      `https://paleobiodb.org/data1.2/occs/list.json?cc=${countryCode}&show=coords,loc,class,strat,lith,env`
    )

    if (!response.ok) {
      throw new Error(`PBDB API error: ${response.status}`)
    }

    const data: PBDBResponse<PBDBOccurrence> = await response.json()

    const features = data.records
      .filter(record => record.lng && record.lat)
      .map(record => {
        const feature = new Feature({
          geometry: new Point(fromLonLat([
            parseFloat(record.lng),
            parseFloat(record.lat)
          ]))
        })

        // Build taxonomic hierarchy
        const taxonomie = [record.phl, record.cll, record.odl, record.fml]
          .filter(Boolean)
          .join(' → ')

        // Format age
        let ouderdom = 'Onbekend'
        if (record.eag && record.lag) {
          ouderdom = record.eag === record.lag
            ? `${record.eag} Ma`
            : `${record.eag} - ${record.lag} Ma`
        } else if (record.eag) {
          ouderdom = `${record.eag} Ma`
        }

        feature.setProperties({
          naam: record.idn || record.tna || 'Onbekend',
          genus: record.gnl || '',
          periode: record.oei || 'Onbekend',
          ouderdom,
          taxonomie: taxonomie || 'Onbekend',
          klasse: record.cll || 'Onbekend',
          formatie: record.sfm || '',
          lid: record.smb || '',
          gesteente: record.lt1 || '',
          milieu: record.env || '',
          vindplaats: record.cnm || '',
          locatie: record.ggc || COUNTRY_NAMES[countryCode] || countryCode,
          bron: 'Paleobiology Database'
        })

        return feature
      })

    const source = new VectorSource({ features })

    const layer = new VectorLayer({
      source,
      properties: { title },
      visible: false,
      zIndex: 22,
      style: LAYER_STYLES.fossil()
    })

    console.log(`✓ ${title} loaded (${features.length} occurrences from PBDB)`)
    return layer

  } catch (error) {
    console.error(`❌ Failed to load ${title}:`, error)
    return new VectorLayer({
      source: new VectorSource(),
      properties: { title },
      visible: false,
      zIndex: 22,
      style: LAYER_STYLES.fossil()
    })
  }
}

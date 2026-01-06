import { useEffect, useState } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import TileWMS from 'ol/source/TileWMS'
import TileLayer from 'ol/layer/Tile'
import { toLonLat } from 'ol/proj'
import proj4 from 'proj4'
import { X, ChevronLeft, ChevronRight, Mountain, Loader2, Trash2, Type, ExternalLink, Plus, Check, Pencil } from 'lucide-react'
import { useMapStore } from '../../store'
import { showParcelHeightMap, clearParcelHighlight } from '../../layers/parcelHighlight'
import { useLocalVondstenStore, type LocalVondst } from '../../store/localVondstenStore'
import { useCustomPointLayerStore } from '../../store/customPointLayerStore'
import type { MapBrowserEvent } from 'ol'

// Register RD New projection
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')

// Translate opening hours from English to Dutch
function translateOpeningHours(hours: string): string {
  if (!hours) return hours

  // Day abbreviations: English to Dutch
  const dayMap: Record<string, string> = {
    'Mo': 'ma', 'Tu': 'di', 'We': 'wo', 'Th': 'do',
    'Fr': 'vr', 'Sa': 'za', 'Su': 'zo',
    'Mon': 'ma', 'Tue': 'di', 'Wed': 'wo', 'Thu': 'do',
    'Fri': 'vr', 'Sat': 'za', 'Sun': 'zo',
    'PH': 'feestdagen', 'SH': 'schoolvakantie'
  }

  let result = hours
  // Replace day abbreviations (case-insensitive, whole word)
  Object.entries(dayMap).forEach(([en, nl]) => {
    result = result.replace(new RegExp(`\\b${en}\\b`, 'gi'), nl)
  })

  // Replace common words
  result = result
    .replace(/\boff\b/gi, 'gesloten')
    .replace(/\bclosed\b/gi, 'gesloten')
    .replace(/\bopen\b/gi, 'open')

  return result
}

// AHN hoogte query - direct via WMS GetFeatureInfo
async function queryAHNHeight(coordinate: number[]): Promise<number | null> {
  try {
    const lonLat = toLonLat(coordinate)
    const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)

    // Check if within Netherlands bounds
    if (rd[0] < 7000 || rd[0] > 300000 || rd[1] < 289000 || rd[1] > 629000) {
      return null
    }

    const buffer = 1 // 1m buffer
    const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

    const url = `https://service.pdok.nl/rws/ahn/wms/v1_0?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=dtm_05m&QUERY_LAYERS=dtm_05m&INFO_FORMAT=application/json&CRS=EPSG:28992&BBOX=${bbox}&WIDTH=1&HEIGHT=1&I=0&J=0`

    const response = await fetch(url)
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      // AHN returns value_list as elevation in meters NAP (can be string or number)
      const props = data.features[0].properties
      const heightRaw = props?.value_list ?? props?.GRAY_INDEX ?? props?.value ?? props?.gray_index
      if (heightRaw !== undefined && heightRaw !== null) {
        const height = typeof heightRaw === 'number' ? heightRaw : parseFloat(heightRaw)
        if (!isNaN(height)) {
          return height
        }
      }
    }
  } catch (error) {
    console.warn('AHN height query failed:', error)
  }
  return null
}

// Kadastrale gemeente codes naar namen (meest voorkomende)
const KADASTRALE_GEMEENTEN: Record<string, string> = {
  'ABG': 'Alphen-Chaam', 'ACM': 'Alkmaar', 'ALF': 'Alfen', 'ALK': 'Alkemade',
  'AML': 'Ameland', 'AMR': 'Amerongen', 'AMS': 'Amsterdam', 'ANL': 'Anloo',
  'APD': 'Apeldoorn', 'ARN': 'Arnhem', 'ASN': 'Assen', 'AVW': 'Avenhorn',
  'BDA': 'Breda', 'BLK': 'Blokker', 'BRN': 'Barneveld', 'DEL': 'Delft',
  'DHG': 'Den Haag', 'DRD': 'Dordrecht', 'EHV': 'Eindhoven', 'EMN': 'Emmen',
  'EPE': 'Epe', 'GNP': 'Gennep', 'GRN': 'Groningen', 'GRV': 'Grave',
  'GTB': 'Giethoorn', 'HDK': 'Harderwijk', 'HLM': 'Haarlem', 'HLN': 'Heiloo',
  'HRL': 'Harlingen', 'HTN': 'Houten', 'LDN': 'Leiden', 'LWR': 'Leeuwarden',
  'MST': 'Maastricht', 'NKK': 'Nijkerk', 'NMG': 'Nijmegen', 'OTM': 'Ootmarsum',
  'RTD': 'Rotterdam', 'SND': 'Sneek', 'TBG': 'Tilburg', 'UTR': 'Utrecht',
  'VLO': 'Venlo', 'WGN': 'Wageningen', 'ZWL': 'Zwolle', 'ZTP': 'Zutphen',
  // Numerieke codes (kadastrale gemeentecodes)
  '444': 'Houten', '811': 'Gouda', '310': 'Utrecht', '344': 'Amsterdam',
  '363': 'Rotterdam', '518': 'Den Haag', '758': 'Eindhoven', '772': 'Tilburg',
  '855': 'Breda', '85': 'Arnhem', '268': 'Nijmegen', '14': 'Groningen',
  '80': 'Leeuwarden', '995': 'Maastricht', '106': 'Enschede', '153': 'Zwolle',
  '34': 'Almere',
}

// IKAW trefkans waarden
const IKAW_VALUES: Record<number, string> = {
  1: 'Zeer lage trefkans op archeologische resten',
  2: 'Lage trefkans op archeologische resten',
  3: 'Middelhoge trefkans op archeologische resten',
  4: 'Hoge trefkans op archeologische resten',
  5: 'Lage trefkans (water)',
  6: 'Middelhoge trefkans (water)',
  7: 'Hoge trefkans (water)',
  8: 'Water',
  9: 'Niet gekarteerd'
}

// Bodem uitleg - praktische info voor detectoristen
function getSoilExplanation(soilName: string, soilCode?: string): string[] {
  const tips: string[] = []
  const nameLower = soilName.toLowerCase()
  const codeLower = (soilCode || '').toLowerCase()

  // Kalk check - belangrijk voor conservering
  if (nameLower.includes('kalkhoudend') || codeLower.endsWith('a')) {
    tips.push('Kalkhoudend = goede metaalconservering')
  } else if (nameLower.includes('kalkarm') || nameLower.includes('kalkloos')) {
    tips.push('Kalkarm = meer corrosie op metalen')
  }

  // Grondsoort - wat betekent het voor graven/conservering
  if (nameLower.includes('poldervaag')) {
    tips.push('Poldervaaggrond = jonge rivierklei, ingepolderd gebied')
  } else if (nameLower.includes('enkeerdgrond') || nameLower.includes('enk')) {
    tips.push('Enkeerdgrond = oude akkers met plaggenbemesting - archeologisch interessant!')
  } else if (nameLower.includes('podzol')) {
    tips.push('Podzolgrond = uitgeloogde zandgrond, vaak zuur')
  } else if (nameLower.includes('veengrond') || nameLower.includes('veen')) {
    tips.push('Veengrond = zuur, slechte metaalconservering (tenzij waterverzadigd)')
  }

  // Textuur - graven
  if (nameLower.includes('zware klei')) {
    tips.push('Zware klei = moeilijk graven, goede conservering')
  } else if (nameLower.includes('lichte klei') || nameLower.includes('zavel')) {
    tips.push('Zavel/lichte klei = redelijk te graven')
  } else if (nameLower.includes('zand') && !nameLower.includes('zavel')) {
    tips.push('Zandgrond = makkelijk graven')
  }

  // Rivier vs zee
  if (nameLower.includes('rivierklei') || codeLower.startsWith('r')) {
    tips.push('Rivierafzetting')
  } else if (nameLower.includes('zeeklei') || codeLower.startsWith('m')) {
    tips.push('Zeekleiafzetting')
  }

  return tips
}

export function Popup() {
  const map = useMapStore(state => state.map)
  const removeVondst = useLocalVondstenStore(state => state.removeVondst)
  const updateVondst = useLocalVondstenStore(state => state.updateVondst)
  const vondsten = useLocalVondstenStore(state => state.vondsten)
  const { layers: customLayers, addPoint: addPointToLayer } = useCustomPointLayerStore()
  const [allContents, setAllContents] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const [parcelCoordinate, setParcelCoordinate] = useState<number[] | null>(null)
  const [showingHeightMap, setShowingHeightMap] = useState(false)
  const [loadingHeightMap, setLoadingHeightMap] = useState(false)
  const [currentVondstId, setCurrentVondstId] = useState<string | null>(null)
  const [editingVondst, setEditingVondst] = useState<LocalVondst | null>(null)
  const [mapsUrl, setMapsUrl] = useState<string | null>(null)
  const [showLayerPicker, setShowLayerPicker] = useState(false)
  const [addedToLayer, setAddedToLayer] = useState<string | null>(null)
  const [popupCoordinate, setPopupCoordinate] = useState<number[] | null>(null)
  // Popup text scale: 100 = normal, 120 = 20% bigger, etc
  const [textScale, setTextScale] = useState(() => {
    const saved = localStorage.getItem('popupTextScale')
    return saved ? parseInt(saved) : 100
  })

  // Save text scale to localStorage
  const handleTextScaleChange = (value: number) => {
    setTextScale(value)
    localStorage.setItem('popupTextScale', value.toString())
  }

  // Current content based on index
  const content = allContents[currentIndex] || ''
  const hasMultiple = allContents.length > 1

  // Extract title from content (first <strong> tag) and remove it from content
  const extractTitleAndContent = (html: string): { title: string; contentWithoutTitle: string } => {
    const match = html.match(/<strong[^>]*>(.*?)<\/strong>/)
    if (match) {
      const title = match[1].replace(/<[^>]+>/g, '') // Strip any inner tags
      const contentWithoutTitle = html.replace(match[0], '').replace(/^(<br\s*\/?>)+/, '') // Remove title and leading <br>
      return { title, contentWithoutTitle }
    }
    return { title: '', contentWithoutTitle: html }
  }

  // Transform HTML to use em-based font sizes instead of rem-based Tailwind classes
  // This allows the font size slider to actually scale the text
  const transformForScaling = (html: string): string => {
    // First pass: convert text-xs to em-based (0.857em = 12/14)
    let result = html.replace(/class="([^"]*)"/g, (match, classes) => {
      if (classes.includes('text-xs')) {
        const newClasses = classes.replace(/\btext-xs\b/g, '').trim()
        return newClasses
          ? `style="font-size:0.857em" class="${newClasses}"`
          : 'style="font-size:0.857em"'
      }
      if (classes.includes('text-sm')) {
        // Remove text-sm, will inherit 1em from parent
        const newClasses = classes.replace(/\btext-sm\b/g, '').trim()
        return newClasses ? `class="${newClasses}"` : ''
      }
      return match
    })
    // Clean up empty class attributes
    return result.replace(/class=""/g, '')
  }

  const { title: extractedTitle, contentWithoutTitle: rawContent } = extractTitleAndContent(content)
  const contentWithoutTitle = transformForScaling(rawContent)

  // Check if current content is a parcel
  const isParcel = content.includes('Landbouwperceel')
  // Check if current content is a vondst
  const isVondst = content.includes('data-vondst-id=')

  const goToPrevious = () => {
    setCurrentIndex(i => (i - 1 + allContents.length) % allContents.length)
  }

  const goToNext = () => {
    setCurrentIndex(i => (i + 1) % allContents.length)
  }

  const handleShowHeightMap = async () => {
    console.log('🔘 HOOGTEKAART KNOP GEKLIKT')
    console.log('🔘 parcelCoordinate uit state:', parcelCoordinate)

    if (!map || !parcelCoordinate || loadingHeightMap) {
      console.log('🔘 STOP - map:', !!map, 'coord:', parcelCoordinate, 'loading:', loadingHeightMap)
      return
    }

    console.log(`🔘 DOORGEVEN AAN showParcelHeightMap: [${parcelCoordinate[0]}, ${parcelCoordinate[1]}]`)
    setLoadingHeightMap(true)
    try {
      const success = await showParcelHeightMap(map, parcelCoordinate)
      if (success) {
        setShowingHeightMap(true)
      }
    } catch (error) {
      console.error('Failed to load height map:', error)
    } finally {
      setLoadingHeightMap(false)
    }
  }

  const handleHideHeightMap = () => {
    if (map) {
      clearParcelHighlight(map)
      setShowingHeightMap(false)
    }
  }

  useEffect(() => {
    if (!map) return

    // Format AMK popup from local data (no WMS query needed)
    const formatAMKPopup = (props: Record<string, any>): string => {
      let html = `<strong class="text-purple-800">AMK Monument</strong>`

      if (props.toponiem) {
        html += `<br/><span class="text-sm font-semibold">${props.toponiem}</span>`
      }
      if (props.kwaliteitswaarde) {
        html += `<br/><span class="text-sm text-purple-700">${props.kwaliteitswaarde}</span>`
      }
      if (props.omschrijving) {
        html += `<br/><span class="text-xs text-gray-600 mt-1 block">${props.omschrijving}</span>`
      }
      if (props.txt_label) {
        // Shorten long labels
        const labels = props.txt_label.split(', ').slice(0, 3).join(', ')
        html += `<br/><span class="text-xs text-gray-500 italic">${labels}${props.txt_label.split(', ').length > 3 ? '...' : ''}</span>`
      }

      return html
    }

    // Query WMS layers for feature info - returns array of all results
    const queryWMSLayers = async (coordinate: number[], viewResolution: number): Promise<string[]> => {
      const results: string[] = []
      const wmsLayers = map.getLayers().getArray().filter(layer => {
        if (layer instanceof TileLayer && layer.getVisible()) {
          const source = layer.getSource()
          return source instanceof TileWMS
        }
        return false
      }) as TileLayer<TileWMS>[]

      for (const layer of wmsLayers) {
        const source = layer.getSource()
        if (!source) continue

        const title = layer.get('title') || ''

        // Skip Paleokaarten - they're just visual overlays with no meaningful feature info
        if (title.startsWith('Paleokaart')) {
          continue
        }

        // Archeo Landschappen (RCE) - B1 stijl
        if (title === 'Archeo Landschappen') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 100
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://services.rce.geovoorziening.nl/landschappenkaart/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=landschappenkaart_nl&QUERY_LAYERS=landschappenkaart_nl&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              const naam = props.landschapsnaam || props.naam || 'Archeologisch Landschap'
              const omschrijving = props.omschrijving || ''

              let html = `<strong class="text-green-800">${naam}</strong>`

              if (omschrijving) {
                html += `<br/><span class="text-sm text-gray-600">${omschrijving}</span>`
              }

              // Wat zie je hier
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat zie je hier?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">Een archeologisch landschap is een gebied waar het landschap nog sporen draagt van menselijke activiteit uit het verleden. Denk aan oude akkers, nederzettingen of verdedigingswerken.</div>`

              // Wat kun je hier vinden
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kun je hier vinden?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">Aardewerk, munten, gereedschap en andere voorwerpen van vroegere bewoners. De kans op vondsten hangt af van het type landschap.</div>`

              // Meer weten
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Meer weten?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1"><a href="https://www.cultureelerfgoed.nl/onderwerpen/bronnen-en-kaarten/overzicht/landschappenkaart" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">RCE Landschappenkaart</a></div>`
              html += `<div class="text-sm text-gray-700 mt-1"><a href="https://nl.wikipedia.org/wiki/Landschapstypen_van_Nederland" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Wikipedia: Landschapstypen</a></div>`

              results.push(html)
            }
          } catch (error) {
            console.warn('Archeo Landschappen WMS query failed:', error)
          }
          continue
        }

        // Essen - Historische akkercomplexen
        if (title === 'Essen') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 100
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://services.rce.geovoorziening.nl/landschapsatlas/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=essen&QUERY_LAYERS=essen&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-amber-800">Es (historisch akkercomplex)</strong>`
              if (props.naam || props.Naam || props.NAME) {
                html += `<br/><span class="text-sm font-semibold text-amber-700">${props.naam || props.Naam || props.NAME}</span>`
              }
              if (props.type || props.Type || props.TYPE) {
                html += `<br/><span class="text-xs text-gray-600">${props.type || props.Type || props.TYPE}</span>`
              }
              if (props.omschrijving || props.Omschrijving) {
                html += `<br/><span class="text-xs text-gray-500">${props.omschrijving || props.Omschrijving}</span>`
              }

              // Wat is een es?
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat is een es?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">Een es is een oud akkercomplex op hogere zandgronden. Eeuwenlang werden hier gewassen verbouwd. De bodem werd bemest met plaggen en mest, waardoor de grond donker en vruchtbaar werd.</div>`

              // Wat kun je hier vinden?
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kun je hier vinden?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">Munten, gespen, knopen, aardewerk en soms bijzondere voorwerpen die door bemesting op het land terechtkwamen. Essen behoren tot de beste vindplaatsen voor metaaldetectie.</div>`

              // Conservering
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Conservering</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1 italic">De zure zandgrond tast metaal aan. IJzer en koper zijn vaak slecht bewaard. Zilver en brons houden zich beter.</div>`

              // Meer weten
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Meer weten?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1"><a href="https://nl.wikipedia.org/wiki/Es_(geografie)" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Wikipedia: Es (geografie)</a></div>`

              results.push(html)
            }
          } catch (error) {
            console.warn('Essen WMS query failed:', error)
          }
          continue
        }

        // FAMKE Steentijd (Friese Archeologische Monumentenkaart Extra) - B1 stijl
        if (title === 'FAMKE Steentijd') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 100
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://geoportaal.fryslan.nl/arcgis/services/Themas/cultuurhistorie/MapServer/WMSServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=FAMKE_Advies_steentijd-bronstijd3339&QUERY_LAYERS=FAMKE_Advies_steentijd-bronstijd3339&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-amber-800">FAMKE Steentijd-Bronstijd</strong>`
              html += `<br/><span class="text-sm text-gray-500">Friese verwachtingskaart voor oude vondsten</span>`

              const advies = props.advies || props.Advies || ''
              if (advies) {
                // Wat zie je hier sectie
                html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat betekent dit?</span></div>`
                html += `<div class="text-sm text-amber-700 mt-1">${advies}</div>`

                // Uitleg per adviestype in B1 taal
                const adviesLower = advies.toLowerCase()
                let uitleg = ''
                let kleur = 'text-gray-600'
                let vondstKans = ''

                if (adviesLower.includes('karterend')) {
                  uitleg = 'Op deze plek verwachten archeologen vondsten uit de steentijd of bronstijd. Bij graafwerk moet er eerst onderzoek komen.'
                  vondstKans = 'Goede kans op oude vondsten (vuursteen, bijlen, aardewerk)'
                  kleur = 'text-amber-600'
                } else if (adviesLower.includes('waarderend')) {
                  uitleg = 'Hier zijn mogelijk belangrijke vindplaatsen. Proefsleuven zijn nodig om te kijken wat er precies zit.'
                  vondstKans = 'Mogelijk interessante vondsten uit de prehistorie'
                  kleur = 'text-orange-600'
                } else if (adviesLower.includes('geen')) {
                  uitleg = 'De kans op prehistorische vondsten is hier klein. De grond is waarschijnlijk te jong of te veel verstoord.'
                  vondstKans = 'Weinig kans op steentijd-vondsten'
                  kleur = 'text-green-600'
                } else if (adviesLower.includes('quickscan')) {
                  uitleg = 'Hier is eerst bureau-onderzoek nodig. Er kunnen vondsten zitten, maar dat is nog niet zeker.'
                  vondstKans = 'Onbekend, nader onderzoek nodig'
                  kleur = 'text-blue-600'
                }

                if (uitleg) {
                  html += `<div class="text-sm ${kleur} mt-1">${uitleg}</div>`
                }

                // Wat kun je hier vinden
                if (vondstKans) {
                  html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kun je hier vinden?</span></div>`
                  html += `<div class="text-sm text-gray-700 mt-1">${vondstKans}</div>`
                }

                // Wat is FAMKE uitleg
                html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat is FAMKE?</span></div>`
                html += `<div class="text-sm text-gray-700 mt-1">FAMKE is de Friese Archeologische Monumentenkaart Extra. Deze kaart toont waar in Friesland vondsten uit de steentijd en bronstijd te verwachten zijn.</div>`
              }
              results.push(html)
            }
          } catch (error) {
            console.warn('FAMKE WMS query failed:', error)
          }
          continue
        }

        // Archeo Onderzoeken (RCE) - archaeological research locations
        if (title === 'Archeo Onderzoeken') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 100
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://data.geo.cultureelerfgoed.nl/openbaar/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=archeologische_onderzoeksmeldingen_openbaar_rd&QUERY_LAYERS=archeologische_onderzoeksmeldingen_openbaar_rd&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-blue-800">Archeologisch Onderzoek</strong>`

              // Research type with explanation
              const onderzoekType = props.type_onderzoek || ''
              if (onderzoekType) {
                html += `<br/><span class="text-sm font-semibold text-blue-700">${onderzoekType}</span>`
              }
              if (props.onderzoeksmeldingnummer) {
                html += `<br/><span class="text-xs text-gray-500">Melding: ${props.onderzoeksmeldingnummer}</span>`
              }
              if (props.uitvoerder) {
                html += `<br/><span class="text-sm text-gray-700">Uitvoerder: ${props.uitvoerder}</span>`
              }
              if (props.startdatum || props.einddatum) {
                const periode = [props.startdatum, props.einddatum].filter(Boolean).join(' - ')
                html += `<br/><span class="text-xs text-gray-600">Periode: ${periode}</span>`
              }
              if (props.gemeente) {
                html += `<br/><span class="text-xs text-gray-500">${props.gemeente}</span>`
              }

              // Wat betekent dit?
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat betekent dit?</span></div>`
              if (onderzoekType.toLowerCase().includes('opgraving')) {
                html += `<div class="text-sm text-gray-700 mt-1">Hier is een archeologische opgraving gedaan. Professionele archeologen hebben vondsten en sporen gedocumenteerd en geborgen.</div>`
              } else if (onderzoekType.toLowerCase().includes('bureauonderzoek')) {
                html += `<div class="text-sm text-gray-700 mt-1">Een bureauonderzoek naar de archeologische verwachting op basis van historische bronnen en kaarten.</div>`
              } else if (onderzoekType.toLowerCase().includes('booronderzoek')) {
                html += `<div class="text-sm text-gray-700 mt-1">Met boringen is onderzocht wat er in de grond zit. Vaak de eerste stap om te bepalen of er verder onderzoek nodig is.</div>`
              } else if (onderzoekType.toLowerCase().includes('proefsleuven')) {
                html += `<div class="text-sm text-gray-700 mt-1">Proefsleuven zijn gegraven om te kijken of er archeologische sporen in de grond zitten.</div>`
              } else {
                html += `<div class="text-sm text-gray-700 mt-1">Op deze locatie is archeologisch onderzoek uitgevoerd. De resultaten zijn opgeslagen in het landelijke archief.</div>`
              }

              // Interesse voor detectoristen
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Interessant voor detectie?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1 italic">Onderzoekslocaties kunnen interessant zijn: archeologen vinden vaak niet alles. Maar check altijd eerst of je daar mag zoeken.</div>`

              // Meer weten
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Meer weten?</span></div>`
              if (props.onderzoeksmeldingnummer) {
                html += `<div class="text-sm text-gray-700 mt-1"><a href="https://archis.cultureelerfgoed.nl/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Zoek in ARCHIS</a> <span class="text-gray-400">(melding ${props.onderzoeksmeldingnummer})</span></div>`
              }
              html += `<div class="text-sm text-gray-700 mt-1"><a href="https://nl.wikipedia.org/wiki/Archeologisch_onderzoek" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Wikipedia: Archeologisch onderzoek</a></div>`

              results.push(html)
            }
          } catch (error) {
            console.warn('Archeo Onderzoeken WMS query failed:', error)
          }
          continue
        }

        // Special handling for IKAW (Indicatieve Kaart Archeologische Waarden) - B1 stijl
        if (title === 'IKAW') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 500 // Larger buffer for IKAW's 50m raster cells
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://services.rce.geovoorziening.nl/ikaw/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=IKAW3Indicatievekaartarcheologischewaarden2008&QUERY_LAYERS=IKAW3Indicatievekaartarcheologischewaarden2008&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              const value = Math.round(props.PALETTE_INDEX || props.palette_index || 0)
              const label = IKAW_VALUES[value] || `Trefkans onbekend (${value})`

              let html = `<strong class="text-orange-800">IKAW Verwachtingskaart</strong>`
              html += `<br/><span class="text-sm text-gray-500">Kaart met kansen op archeologische vondsten</span>`

              // Wat betekent dit sectie
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat betekent dit?</span></div>`
              html += `<div class="text-sm text-orange-700 mt-1">${label}</div>`

              // Uitgebreide uitleg per trefkans categorie in B1 taal
              const uitleg: Record<number, { tekst: string; vondsten: string; kleur: string }> = {
                1: {
                  tekst: 'De kans op archeologische vondsten is hier zeer klein. De grond is waarschijnlijk verstoord of te jong.',
                  vondsten: 'Niet veel te verwachten, maar verrassingen zijn altijd mogelijk.',
                  kleur: 'text-gray-600'
                },
                2: {
                  tekst: 'De kans op vondsten is laag, maar niet uitgesloten. Soms worden hier toch interessante objecten gevonden.',
                  vondsten: 'Af en toe losse vondsten uit verschillende periodes.',
                  kleur: 'text-yellow-600'
                },
                3: {
                  tekst: 'Dit is een interessant gebied met een redelijke kans op vondsten. Hier woonden of werkten mensen in het verleden.',
                  vondsten: 'Aardewerk, munten, metalen voorwerpen uit verschillende tijdperken.',
                  kleur: 'text-amber-600'
                },
                4: {
                  tekst: 'Dit is een zeer kansrijk gebied! Hier zijn waarschijnlijk resten van oude bewoning of activiteit. Let op: bij graafwerk kan een vergunning nodig zijn.',
                  vondsten: 'Grote kans op interessante vondsten: aardewerk, munten, sieraden, gereedschap.',
                  kleur: 'text-orange-600'
                },
                5: {
                  tekst: 'Dit is een waterbodem. Vondsten zijn hier moeilijker te bereiken maar kunnen goed bewaard zijn gebleven.',
                  vondsten: 'Scheepswrakken, verloren lading, gedumpte voorwerpen.',
                  kleur: 'text-blue-600'
                },
                6: {
                  tekst: 'Waterbodem met archeologische potentie. Hier kunnen interessante vondsten liggen die door het water goed bewaard zijn.',
                  vondsten: 'Scheepsresten, ankers, aardewerk, metalen voorwerpen.',
                  kleur: 'text-blue-600'
                },
                7: {
                  tekst: 'Waterbodem met hoge archeologische waarde. Hier zijn bekende vindplaatsen of scheepswrakken.',
                  vondsten: 'Belangrijke maritieme vondsten, beschermd gebied.',
                  kleur: 'text-blue-700'
                }
              }

              const info = uitleg[value]
              if (info) {
                html += `<div class="text-sm ${info.kleur} mt-1">${info.tekst}</div>`

                html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kun je hier vinden?</span></div>`
                html += `<div class="text-sm text-gray-700 mt-1">${info.vondsten}</div>`
              }

              // Wat is IKAW
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat is de IKAW?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">De IKAW (Indicatieve Kaart Archeologische Waarden) toont de kans op archeologische vondsten in heel Nederland. De kaart is gemaakt door de Rijksdienst voor het Cultureel Erfgoed.</div>`

              results.push(html)
            }
          } catch (error) {
            console.warn('IKAW WMS query failed:', error)
          }
          continue
        }

        // Inundatiegebieden (RCE Linies en Stellingen)
        if (title === 'Inundatiegebieden') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 100
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://services.rce.geovoorziening.nl/liniesenstellingen/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=inundaties&QUERY_LAYERS=inundaties&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-blue-800">Inundatiegebied</strong>`

              if (props['linie-naam'] || props.linie_naam) {
                html += `<br/><span class="text-sm font-semibold text-blue-700">${props['linie-naam'] || props.linie_naam}</span>`
              }
              if (props.naam) {
                html += `<br/><span class="text-sm text-gray-700">${props.naam}</span>`
              }
              if (props.periode) {
                html += `<br/><span class="text-xs text-gray-500">${props.periode}</span>`
              }
              if (props.lin_period) {
                html += `<br/><span class="text-xs text-gray-400">${props.lin_period}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Inundatiegebieden WMS query failed:', error)
          }
          continue
        }

        // Militaire Objecten (RCE Linies en Stellingen) - B1 stijl
        if (title === 'Militaire Objecten') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 50
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://services.rce.geovoorziening.nl/liniesenstellingen/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=objecten&QUERY_LAYERS=objecten&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              const soort = props.obj_soort || ''
              const naam = props.obj_naam || ''
              const periode = props.lin_period || ''
              const linie = props['linie-naam'] || props.linie_naam || ''

              // Bepaal type en beschrijving op basis van obj_soort
              let typeTitel = soort || 'Militair Object'
              let uitleg = 'Dit is een historisch militair object uit de Nederlandse verdedigingsgeschiedenis.'
              let vondsten = ''

              const soortLower = soort.toLowerCase()

              if (soortLower.includes('fort')) {
                uitleg = 'Een fort is een versterkte verdedigingspost, vaak met dikke muren en geschutsopstellingen. Forten maakten deel uit van grotere verdedigingslinies.'
                vondsten = 'Rond forten worden soms kogels, knopen van uniformen, muntjes of andere militaire voorwerpen gevonden.'
              } else if (soortLower.includes('schans')) {
                uitleg = 'Een schans is een kleinere versterking, vaak gemaakt van aarde en palissaden. Schansen werden gebruikt om strategische punten te verdedigen.'
                vondsten = 'Bij schansen kun je musketkogels, knopen en soms munten uit de 17e-18e eeuw tegenkomen.'
              } else if (soortLower.includes('batterij') || soortLower.includes('battery')) {
                uitleg = 'Een batterij is een geschutsopstelling, vaak op een strategische plek om vijanden onder vuur te nemen.'
                vondsten = 'Bij batterijen worden soms kanonkogels of onderdelen van geschut gevonden.'
              } else if (soortLower.includes('bunker') || soortLower.includes('kazemat')) {
                uitleg = 'Een bunker of kazemat is een versterkte betonnen schuilplaats. Veel werden gebouwd rond 1940 als onderdeel van verdedigingslinies.'
                vondsten = 'Bij bunkers worden soms militaire voorwerpen uit WOII gevonden, zoals knopen, gespen of munitieresten.'
              } else if (soortLower.includes('sluis') || soortLower.includes('inlaatwerk')) {
                uitleg = 'Militaire sluizen en inlaatwerken werden gebruikt om land onder water te zetten (inunderen). Dit was een belangrijke verdedigingstactiek.'
                vondsten = 'Bij historische sluizen worden soms voorwerpen gevonden van soldaten die deze bewaakten.'
              } else if (soortLower.includes('toren') || soortLower.includes('wachttoren')) {
                uitleg = 'Wachttorens werden gebruikt om de omgeving in de gaten te houden en vijandelijke bewegingen te signaleren.'
                vondsten = 'Bij torens worden soms persoonlijke voorwerpen van soldaten gevonden.'
              } else if (soortLower.includes('kazerne')) {
                uitleg = 'Een kazerne is een gebouw waar soldaten gelegerd waren. Hier woonden, aten en oefenden de troepen.'
                vondsten = 'Rond kazernes worden regelmatig knopen, gespen en andere persoonlijke voorwerpen gevonden.'
              }

              // Bouw popup HTML
              let html = `<strong class="text-stone-800">${typeTitel}</strong>`

              if (naam) {
                html += `<br/><span class="text-sm font-semibold text-stone-700">${naam}</span>`
              }
              if (linie) {
                html += `<br/><span class="text-sm text-blue-600">${linie}</span>`
              }
              if (periode) {
                html += `<br/><span class="text-xs text-gray-500">${periode}</span>`
              }

              // Wat zie je hier
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat zie je hier?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">${uitleg}</div>`

              // Wat kun je hier vinden (als er specifieke info is)
              if (vondsten) {
                html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kun je hier vinden?</span></div>`
                html += `<div class="text-sm text-gray-700 mt-1">${vondsten}</div>`
              }

              // Meer weten
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Meer weten?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">`
              html += `<a href="https://erfgoedenlocatie.nl/linies-en-stellingen" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">RCE Linies en Stellingen</a>`
              html += `</div>`

              results.push(html)
            }
          } catch (error) {
            console.warn('Militaire Objecten WMS query failed:', error)
          }
          continue
        }

        // Verdedigingslinies (RCE Linies en Stellingen)
        if (title === 'Verdedigingslinies') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 100
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://services.rce.geovoorziening.nl/liniesenstellingen/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=linies&QUERY_LAYERS=linies&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-amber-800">Verdedigingslinie</strong>`

              // Uitleg per bekende linie
              const linieInfo: Record<string, string> = {
                'Hollandse Waterlinie': 'Verdedigingsstelsel (1815-1940) dat gebruik maakte van inundaties om Holland te beschermen. UNESCO Werelderfgoed.',
                'Nieuwe Hollandse Waterlinie': 'Uitgebreide versie (1815-1940) met forten en inundatiegebieden van Muiden tot Gorinchem.',
                'Stelling van Amsterdam': 'Ringverdediging rond Amsterdam (1880-1920) met 42 forten. UNESCO Werelderfgoed.',
                'Grebbelinie': 'Verdedigingslinie langs de Grebbe (17e-20e eeuw). Zware gevechten in mei 1940.',
                'IJssellinie': 'Koude Oorlog verdediging (1950-1968) langs de IJssel tegen Sovjet-invasie.',
                'Atlantikwall': 'Duitse kustverdediging WOII (1942-1945) van Noorwegen tot Spanje.',
                'Peel-Raamstelling': 'Verdedigingslinie in Brabant/Limburg. Gevechten mei 1940.',
                'Maas-Waalstelling': 'Linie tussen Maas en Waal, onderdeel landsverdediging.',
                'Zuiderwaterlinie': 'Waterlinie in West-Brabant en Zeeland (17e-19e eeuw).',
                'Staats-Spaanse Linies': 'Vestingwerken uit de 80-jarige oorlog (1568-1648).'
              }

              const linieName = props.naam || props.lin_naam || ''
              if (linieName) {
                html += `<br/><span class="text-sm font-semibold text-amber-700">${linieName}</span>`
                // Zoek uitleg (partial match)
                const matchingInfo = Object.entries(linieInfo).find(([key]) =>
                  linieName.toLowerCase().includes(key.toLowerCase()) ||
                  key.toLowerCase().includes(linieName.toLowerCase())
                )
                if (matchingInfo) {
                  html += `<br/><span class="text-sm text-gray-700">${matchingInfo[1]}</span>`
                }
              }
              if (props.lin_period) {
                html += `<br/><span class="text-xs text-purple-600">${props.lin_period}</span>`
              }
              if (props.status) {
                html += `<br/><span class="text-xs text-gray-400">${props.status}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Verdedigingslinies WMS query failed:', error)
          }
          continue
        }

        // Rijksmonumenten (RCE)
        if (title === 'Rijksmonumenten') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 50
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://data.geo.cultureelerfgoed.nl/openbaar/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=rijksmonumentpunten&QUERY_LAYERS=rijksmonumentpunten&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-red-800">Rijksmonument</strong>`

              if (props.cbsNaam || props.cbs_naam) {
                html += `<br/><span class="text-sm font-semibold">${props.cbsNaam || props.cbs_naam}</span>`
              }
              if (props.hoofdcategorie) {
                html += `<br/><span class="text-sm text-red-700">${props.hoofdcategorie}</span>`
              }
              if (props.subcategorie) {
                html += `<br/><span class="text-xs text-gray-600">${props.subcategorie}</span>`
              }
              if (props.rijksmonumentnummer) {
                html += `<br/><span class="text-xs text-gray-500">Nr: ${props.rijksmonumentnummer}</span>`
              }
              if (props.bouwjaar || props.oorspronkelijkebouwjaar) {
                html += `<br/><span class="text-xs text-gray-500">Bouwjaar: ${props.bouwjaar || props.oorspronkelijkebouwjaar}</span>`
              }

              // Meer weten - clickable links
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Meer weten?</span></div>`
              if (props.rijksmonumentnummer) {
                html += `<div class="text-sm text-gray-700 mt-1"><a href="https://monumentenregister.cultureelerfgoed.nl/monumenten/${props.rijksmonumentnummer}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Bekijk in Monumentenregister</a></div>`
              }
              html += `<div class="text-sm text-gray-700 mt-1"><a href="https://nl.wikipedia.org/wiki/Rijksmonument" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Wikipedia: Rijksmonument</a></div>`

              results.push(html)
            }
          } catch (error) {
            console.warn('Rijksmonumenten WMS query failed:', error)
          }
          continue
        }

        // Werelderfgoed (UNESCO)
        if (title === 'Werelderfgoed') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 500
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://service.pdok.nl/rce/ps-ch/wms/v1_0?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=PS.ProtectedSite&QUERY_LAYERS=PS.ProtectedSite&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-cyan-800">UNESCO Werelderfgoed</strong>`

              if (props.siteName || props.naam) {
                html += `<br/><span class="text-sm font-semibold text-cyan-700">${props.siteName || props.naam}</span>`
              }
              if (props.siteDesignation) {
                html += `<br/><span class="text-xs text-gray-600">${props.siteDesignation}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Werelderfgoed WMS query failed:', error)
          }
          continue
        }

        // Terpen (Friesland) - B1 stijl
        if (title === 'Terpen') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 100
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://geoportaal.fryslan.nl/arcgis/services/Themas/cultuurhistorie/MapServer/WMSServer?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=terpen3335&QUERY_LAYERS=terpen3335&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              const naam = props.naam || props.NAAM || props.Naam || 'Terp'
              const plaats = props.plaats || props.PLAATS || props.Plaats || ''

              let html = `<strong class="text-orange-800">${naam}</strong>`
              if (plaats) {
                html += `<br/><span class="text-sm text-gray-500">${plaats}</span>`
              }

              // Wat zie je hier
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat zie je hier?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">Een terp is een kunstmatige heuvel. Mensen bouwden deze heuvels om droog te wonen in het vlakke, natte land. Terpen zijn vaak meer dan 2000 jaar oud.</div>`

              // Wat kun je hier vinden
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kun je hier vinden?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">Op en rond terpen worden vaak vondsten gedaan:</div>`
              html += `<ul class="list-disc list-inside text-sm text-gray-700 mt-1 space-y-0.5">`
              html += `<li>Middeleeuws aardewerk en botten</li>`
              html += `<li>Munten uit verschillende periodes</li>`
              html += `<li>Metalen voorwerpen (gespen, fibulae, sieraden)</li>`
              html += `<li>Soms Romeinse of zelfs prehistorische vondsten</li>`
              html += `</ul>`

              // Waarom zijn terpen interessant
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Waarom zijn terpen interessant?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">Terpen waren vaak dorpskernen waar mensen eeuwenlang woonden. Door de ophoging bleven veel voorwerpen goed bewaard. Let op: sommige terpen zijn beschermd monument!</div>`

              // Bezoeken
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Bezoeken</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">Veel terpen zijn nog zichtbaar in het landschap. Vraag altijd toestemming aan de grondeigenaar voordat je gaat detecteren.</div>`

              results.push(html)
            }
          } catch (error) {
            console.warn('Terpen WMS query failed:', error)
          }
          continue
        }

        // Religieus Erfgoed (RCE Landschapsatlas) - B1 stijl
        if (title === 'Religieus Erfgoed') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 50
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://services.rce.geovoorziening.nl/landschapsatlas_view/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=religieuserfgoed&QUERY_LAYERS=religieuserfgoed&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              const naam = props.naam || props.NAAM || props.name || props.NAME || 'Onbekend'
              const denominatie = props.denominatie || props.DENOMINATIE || props.religie || ''
              const type = props.type || props.TYPE || props.functie || ''
              const bouwjaar = props.bouwjaar || props.BOUWJAAR || props.jaar || ''
              const gemeente = props.gemeente || props.GEMEENTE || props.plaats || ''

              let html = `<strong class="text-purple-800">${naam}</strong>`

              // Type en denominatie
              const typeLabel = type.toLowerCase()
              let typeUitleg = 'Een religieus gebouw of heilige plek.'
              let typeVondsten = 'Munten van kerkgangers, knopen, gespen, religieuze voorwerpen'

              if (typeLabel.includes('kerk') || typeLabel.includes('church')) {
                typeUitleg = 'Een kerk was het hart van de gemeenschap. Hier kwamen mensen samen voor diensten, maar ook voor belangrijke gebeurtenissen.'
                typeVondsten = 'Munten uit de collecte, knopen, gespen, pelgrimsinsignes, loden zegels'
              } else if (typeLabel.includes('kapel') || typeLabel.includes('chapel')) {
                typeUitleg = 'Een kapel is een klein gebedshuis, vaak bij een landgoed, langs een weg, of op een bijzondere plek.'
                typeVondsten = 'Devotionalia, munten, kruisjes, rozenkransen'
              } else if (typeLabel.includes('synagoge')) {
                typeUitleg = 'Een synagoge is een Joods gebedshuis. Veel synagogen in Nederland zijn verwoest of herbestemd na de Tweede Wereldoorlog.'
                typeVondsten = 'Munten, knopen, kleine religieuze voorwerpen'
              } else if (typeLabel.includes('klooster') || typeLabel.includes('monastery')) {
                typeUitleg = 'Een klooster was een woon- en werkplek voor monniken of nonnen. Veel kloosters hadden eigen werkplaatsen en landerijen.'
                typeVondsten = 'Religieuze voorwerpen, zegels, gereedschap, aardewerk, middeleeuwse munten'
              } else if (typeLabel.includes('toren') || typeLabel.includes('tower')) {
                typeUitleg = 'Een kerktoren of klokkentoren. Soms is alleen de toren nog over van een verdwenen kerk.'
                typeVondsten = 'Munten, knopen, bouwmateriaal'
              } else if (typeLabel.includes('begraafplaats') || typeLabel.includes('cemetery')) {
                typeUitleg = 'Een historische begraafplaats. Detecteren op begraafplaatsen is niet toegestaan zonder toestemming.'
                typeVondsten = 'Detecteren hier niet toegestaan'
              }

              // Denominatie (Rooms-Katholiek, Protestant, etc.)
              if (denominatie) {
                html += `<br/><span class="text-sm text-purple-600">${denominatie}</span>`
              }
              if (type) {
                html += `<br/><span class="text-sm text-gray-600">${type}</span>`
              }
              if (bouwjaar) {
                html += `<br/><span class="text-sm text-gray-500">Bouwjaar: ${bouwjaar}</span>`
              }
              if (gemeente) {
                html += `<br/><span class="text-xs text-gray-400">${gemeente}</span>`
              }

              // Wat zie je hier
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat zie je hier?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">${typeUitleg}</div>`

              // Wat kun je hier vinden
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kun je hier vinden?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">${typeVondsten}</div>`

              // Bezoeken
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Bezoeken</span></div>`
              if (typeLabel.includes('begraafplaats')) {
                html += `<div class="text-sm text-red-600 mt-1">Detecteren op begraafplaatsen is niet toegestaan. Respecteer de rust van de overledenen.</div>`
              } else {
                html += `<div class="text-sm text-gray-700 mt-1">Veel kerken en religieuze gebouwen zijn beschermd monument. Vraag altijd toestemming voordat je gaat detecteren op het terrein.</div>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Religieus Erfgoed WMS query failed:', error)
          }
          continue
        }

        // Gewaspercelen (BRP) - enriched with soil type from Bodemkaart
        if (title === 'Gewaspercelen') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 50
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            // Query BRP and Bodemkaart in parallel
            const brpUrl = `https://service.pdok.nl/rvo/brpgewaspercelen/wms/v1_0?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=BrpGewas&QUERY_LAYERS=BrpGewas&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`
            const bodemUrl = `https://service.pdok.nl/bzk/bro-bodemkaart/wms/v1_0?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=soilarea&QUERY_LAYERS=soilarea&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const [brpResponse, bodemResponse] = await Promise.all([
              fetch(brpUrl),
              fetch(bodemUrl).catch(() => null) // Don't fail if bodem query fails
            ])

            const brpData = await brpResponse.json()

            if (brpData.features && brpData.features.length > 0) {
              const props = brpData.features[0].properties
              let html = `<strong class="text-green-800">Landbouwperceel</strong>`

              if (props.gewas || props.gewasnaam) {
                html += `<br/><span class="text-sm font-semibold text-green-700">${props.gewas || props.gewasnaam}</span>`
              }
              if (props.categorie || props.category) {
                html += `<br/><span class="text-xs text-gray-600">${props.categorie || props.category}</span>`
              }
              if (props.oppervlakte) {
                html += `<br/><span class="text-xs text-gray-500">${props.oppervlakte} ha</span>`
              }

              // Add soil type from Bodemkaart if available
              if (bodemResponse) {
                try {
                  const bodemData = await bodemResponse.json()
                  if (bodemData.features && bodemData.features.length > 0) {
                    const bodemProps = bodemData.features[0].properties
                    const soilName = bodemProps.first_soilname || bodemProps.soilname || bodemProps.bodemtype
                    const soilCode = bodemProps.first_soilcode || bodemProps.soilcode || bodemProps.maparea_soilcode
                    if (soilName) {
                      html += `<br/><span class="text-xs text-amber-700 font-medium">Grondsoort: ${soilName}</span>`
                      // Praktische uitleg toevoegen
                      const tips = getSoilExplanation(soilName, soilCode)
                      if (tips.length > 0) {
                        html += `<br/><span class="text-xs text-gray-500 italic">${tips.join(' · ')}</span>`
                      }
                    }
                  }
                } catch {
                  // Ignore bodem parsing errors
                }
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('BRP Gewaspercelen WMS query failed:', error)
          }
          continue
        }

        // Kadastrale Grenzen
        if (title === 'Kadastrale Grenzen') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 20
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://service.pdok.nl/kadaster/kadastralekaart/wms/v5_0?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=Perceel&QUERY_LAYERS=Perceel&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties

              // Extract parcel info - try multiple field name variations
              const gemeente = props.kadastraleGemeenteWaarde || props.kadastrale_gemeente_waarde ||
                               props.kadastraleGemeente || KADASTRALE_GEMEENTEN[String(props.kadastraleGemeenteCode)] ||
                               props.kadastraleGemeenteCode
              const sectie = props.sectie || props.Sectie || ''
              const perceelnummer = props.perceelnummer || props.perceelNummer || props.Perceelnummer || ''
              const oppervlakte = props.kadastraleGrootteWaarde || props.kadastrale_grootte_waarde ||
                                  props.kadastraleGrootte || props.oppervlakte

              // Get AKR gemeente code for kadastralekaart.com link (e.g., "VBG01", "AMF00", "APT00")
              // The code is in AKRKadastraleGemeenteCodeWaarde field from PDOK WMS
              const akrGemeenteCode = props.AKRKadastraleGemeenteCodeWaarde ||
                                      props.akrKadastraleGemeenteCodeWaarde ||
                                      ''

              // Build kadastrale aanduiding for display (e.g., "Voorburg E 7139")
              const aanduiding = [gemeente, sectie, perceelnummer].filter(Boolean).join(' ')

              // Build perceelnummer for kadastralekaart.com (e.g., "VBG01-E-7139")
              const perceelId = akrGemeenteCode && sectie && perceelnummer
                ? `${akrGemeenteCode}-${sectie}-${perceelnummer}`
                : ''

              let html = `<strong class="text-indigo-800">Kadastraal Perceel</strong>`

              if (aanduiding) {
                html += `<br/><span class="text-sm text-indigo-700">${aanduiding}</span>`
              }

              // Show perceelId prominently - this is what users need to copy for Kadaster search
              if (perceelId) {
                html += `<br/><span class="text-sm font-bold text-gray-800 font-mono">${perceelId}</span>`
              }

              if (oppervlakte) {
                const opp = typeof oppervlakte === 'number' ? oppervlakte : parseFloat(oppervlakte)
                if (!isNaN(opp)) {
                  html += `<br/><span class="text-xs text-gray-600">${opp.toLocaleString('nl-NL')} m²</span>`
                }
              }

              // Eigenaar opzoeken uitleg met link naar Kadaster winkel
              html += `<br/><br/><span class="text-xs text-gray-600">Eigenaar opzoeken? Kopieer bovenstaande code, ga naar </span><a href="https://www.kadaster.nl/winkel" target="_blank" rel="noopener" class="text-xs text-blue-600 hover:underline">kadaster.nl/winkel</a><span class="text-xs text-gray-600"> en klik "Zoek op aanduiding"</span><span class="text-xs text-gray-400"> (betaalde dienst)</span>`

              results.push(html)
            }
          } catch (error) {
            console.warn('Kadastrale Grenzen WMS query failed:', error)
          }
          continue
        }

        // === PROVINCIALE WAARDENKAARTEN ===

        // Zuid-Holland: Scheepswrakken
        if (title === 'Scheepswrakken') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 100
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://geodata.zuid-holland.nl/geoserver/cultuur/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=CHS_2015_ARCHEOLOGIE_SCHEEPSRESTANTEN&QUERY_LAYERS=CHS_2015_ARCHEOLOGIE_SCHEEPSRESTANTEN&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-cyan-800">Scheepswrak</strong>`

              if (props.naam || props.NAAM) {
                html += `<br/><span class="text-sm font-semibold text-cyan-700">${props.naam || props.NAAM}</span>`
              }
              if (props.type || props.TYPE) {
                html += `<br/><span class="text-sm text-gray-700">${props.type || props.TYPE}</span>`
              }
              if (props.datering || props.DATERING) {
                html += `<br/><span class="text-xs text-gray-500">Datering: ${props.datering || props.DATERING}</span>`
              }
              if (props.bron || props.BRON) {
                html += `<br/><span class="text-xs text-gray-400">${props.bron || props.BRON}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Scheepswrakken WMS query failed:', error)
          }
          continue
        }

        // Zuid-Holland: Woonheuvels
        if (title === 'Woonheuvels ZH') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 100
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://geodata.zuid-holland.nl/geoserver/cultuur/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=CHS_2015_ARCHEOLOGIE_WOONHEUVEL&QUERY_LAYERS=CHS_2015_ARCHEOLOGIE_WOONHEUVEL&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-orange-800">Woonheuvel</strong>`

              if (props.naam || props.NAAM) {
                html += `<br/><span class="text-sm font-semibold text-orange-700">${props.naam || props.NAAM}</span>`
              }
              if (props.type || props.TYPE) {
                html += `<br/><span class="text-sm text-gray-700">${props.type || props.TYPE}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Woonheuvels WMS query failed:', error)
          }
          continue
        }

        // Zuid-Holland: Romeinse Forten
        if (title === 'Romeinse Forten') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 200
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://geodata.zuid-holland.nl/geoserver/cultuur/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=CHS_2015_ARCHEOLOGIE_ROMEINSFORT&QUERY_LAYERS=CHS_2015_ARCHEOLOGIE_ROMEINSFORT&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-red-800">Romeins Fort</strong>`

              if (props.naam || props.NAAM) {
                html += `<br/><span class="text-sm font-semibold text-red-700">${props.naam || props.NAAM}</span>`
              }
              if (props.type || props.TYPE) {
                html += `<br/><span class="text-sm text-gray-700">${props.type || props.TYPE}</span>`
              }
              if (props.periode || props.PERIODE) {
                html += `<br/><span class="text-xs text-gray-500">${props.periode || props.PERIODE}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Romeinse Forten WMS query failed:', error)
          }
          continue
        }

        // Zuid-Holland: Windmolens
        if (title === 'Windmolens') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 50
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://geodata.zuid-holland.nl/geoserver/cultuur/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=CHS_2015_NEDERZETTING_WINDMOLENS&QUERY_LAYERS=CHS_2015_NEDERZETTING_WINDMOLENS&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-amber-800">Windmolen</strong>`

              if (props.naam || props.NAAM) {
                html += `<br/><span class="text-sm font-semibold text-amber-700">${props.naam || props.NAAM}</span>`
              }
              if (props.type || props.TYPE || props.functie || props.FUNCTIE) {
                html += `<br/><span class="text-sm text-gray-700">${props.type || props.TYPE || props.functie || props.FUNCTIE}</span>`
              }
              if (props.bouwjaar || props.BOUWJAAR) {
                html += `<br/><span class="text-xs text-gray-500">Bouwjaar: ${props.bouwjaar || props.BOUWJAAR}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Windmolens WMS query failed:', error)
          }
          continue
        }

        // Zuid-Holland: Erfgoedlijnen
        if (title === 'Erfgoedlijnen') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 200
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://geodata.zuid-holland.nl/geoserver/cultuur/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=CHS_ERFGOEDLIJN_HOOFDSTRUCTUUR&QUERY_LAYERS=CHS_ERFGOEDLIJN_HOOFDSTRUCTUUR&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-purple-800">Erfgoedlijn</strong>`

              if (props.naam || props.NAAM || props.erfgoedlijn) {
                html += `<br/><span class="text-sm font-semibold text-purple-700">${props.naam || props.NAAM || props.erfgoedlijn}</span>`
              }
              if (props.type || props.TYPE) {
                html += `<br/><span class="text-sm text-gray-700">${props.type || props.TYPE}</span>`
              }
              if (props.omschrijving || props.OMSCHRIJVING) {
                html += `<br/><span class="text-xs text-gray-500">${props.omschrijving || props.OMSCHRIJVING}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Erfgoedlijnen WMS query failed:', error)
          }
          continue
        }

        // Zuid-Holland: Oude Kernen
        if (title === 'Oude Kernen') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 200
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://geodata.zuid-holland.nl/geoserver/cultuur/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=CHS_2015_ARCHEOLOGIE_KERNEN&QUERY_LAYERS=CHS_2015_ARCHEOLOGIE_KERNEN&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-stone-800">Historische Kern</strong>`

              if (props.naam || props.NAAM) {
                html += `<br/><span class="text-sm font-semibold text-stone-700">${props.naam || props.NAAM}</span>`
              }
              if (props.type || props.TYPE) {
                html += `<br/><span class="text-sm text-gray-700">${props.type || props.TYPE}</span>`
              }
              if (props.periode || props.PERIODE) {
                html += `<br/><span class="text-xs text-gray-500">${props.periode || props.PERIODE}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Oude Kernen WMS query failed:', error)
          }
          continue
        }

        // Gelderland: Relictenkaart Punten
        if (title === 'Relictenkaart Punten') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 50
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://geoserver.gelderland.nl/geoserver/ngr_a/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=ChAr_Relictenkaart_p&QUERY_LAYERS=ChAr_Relictenkaart_p&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties

              // Decode type codes to readable names
              const typeMap: Record<string, string> = {
                'KV': 'Kasteel/Vesting', 'K': 'Kapel', 'KE': 'Kerkhof',
                'B': 'Buitenhuis', 'OB': 'Oud Bebouwingsrelict', 'OV': 'Oude Verkaveling',
                'NR': 'Nijverheidsrelict', 'GH': 'Grafheuvel', 'BP': 'Begraafplaats',
                'HH': 'Havezate', 'RM': 'Rosmolen', 'WM': 'Windmolen',
                'PM': 'Poldermolen', 'EK': 'Eendenkooi', 'SH': 'Scholtenhoeve'
              }

              const typeCode = props.type?.replace(/[0-9]/g, '') || ''
              const typeName = typeMap[typeCode] || props.type || 'Cultuurhistorisch object'

              let html = `<strong class="text-emerald-800">Relict</strong>`
              html += `<br/><span class="text-sm font-semibold text-emerald-700">${typeName}</span>`

              if (props.type && typeCode !== props.type) {
                html += `<br/><span class="text-xs text-gray-500">Code: ${props.type}</span>`
              }
              if (props.streek) {
                html += `<br/><span class="text-xs text-gray-400">Streek: ${props.streek}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Relictenkaart Punten WMS query failed:', error)
          }
          continue
        }

        // Gelderland: Relictenkaart Lijnen
        if (title === 'Relictenkaart Lijnen') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 50
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://geoserver.gelderland.nl/geoserver/ngr_a/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=ChAr_Relictenkaart_l&QUERY_LAYERS=ChAr_Relictenkaart_l&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties

              // Decode klasse to readable names
              const klasseMap: Record<number, string> = {
                1: 'Sprengenbeek', 2: 'Oude waterloop', 3: 'Doorgaande weg',
                4: 'Hessenweg', 5: 'Oude weg', 6: 'Historische grens',
                7: 'Trekpad', 8: 'Jaagpad'
              }

              const klasseName = klasseMap[props.klasse] || `Historisch lijnrelict (${props.klasse})`

              let html = `<strong class="text-teal-800">Lijnrelict</strong>`
              html += `<br/><span class="text-sm font-semibold text-teal-700">${klasseName}</span>`

              results.push(html)
            }
          } catch (error) {
            console.warn('Relictenkaart Lijnen WMS query failed:', error)
          }
          continue
        }

        // Gelderland: Relictenkaart Vlakken
        if (title === 'Relictenkaart Vlakken') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 100
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://geoserver.gelderland.nl/geoserver/ngr_a/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=ChAr_Relictenkaart_v&QUERY_LAYERS=ChAr_Relictenkaart_v&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties

              // Decode klasse to readable names
              const klasseMap: Record<number, string> = {
                1: 'Onveranderd agrarisch (voor 1850)', 2: 'Jonge heideontginning (1850-1950)',
                3: 'Open essencomplex', 4: 'Kampenlandschap', 5: 'Heiderelict (1850)',
                6: 'Bosrelict (1850)', 7: 'Stuifzandrelict', 8: 'Oud bouwland',
                9: 'Historisch grasland', 10: 'Beekdal'
              }

              const klasseName = klasseMap[props.klasse] || `Historisch landschap (${props.klasse})`

              let html = `<strong class="text-lime-800">Landschapsrelict</strong>`
              html += `<br/><span class="text-sm font-semibold text-lime-700">${klasseName}</span>`

              if (props.st_area_shape_) {
                const ha = (props.st_area_shape_ / 10000).toFixed(1)
                html += `<br/><span class="text-xs text-gray-500">${ha} ha</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Relictenkaart Vlakken WMS query failed:', error)
          }
          continue
        }

        // Zeeland: Verdronken Dorpen
        if (title === 'Verdronken Dorpen') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 200
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://opengeodata.zeeland.nl/geoserver/chs/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=geocmd_vrddrppnt&QUERY_LAYERS=geocmd_vrddrppnt&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-blue-800">Verdronken Dorp</strong>`

              if (props.naam || props.NAAM) {
                html += `<br/><span class="text-sm font-semibold text-blue-700">${props.naam || props.NAAM}</span>`
              }
              if (props.verdronken || props.VERDRONKEN || props.jaar || props.JAAR) {
                html += `<br/><span class="text-xs text-gray-600">Verdronken: ${props.verdronken || props.VERDRONKEN || props.jaar || props.JAAR}</span>`
              }
              if (props.gemeente || props.GEMEENTE) {
                html += `<br/><span class="text-xs text-gray-500">${props.gemeente || props.GEMEENTE}</span>`
              }
              if (props.bron || props.BRON) {
                html += `<br/><span class="text-xs text-gray-400">${props.bron || props.BRON}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Verdronken Dorpen WMS query failed:', error)
          }
          continue
        }

        const url = source.getFeatureInfoUrl(
          coordinate,
          viewResolution,
          'EPSG:3857',
          { 'INFO_FORMAT': 'application/json' }
        )

        if (!url) continue

        try {
          const response = await fetch(url)
          const data = await response.json()

          if (data.features && data.features.length > 0) {
            const props = data.features[0].properties

            // AHN 0.5m specific handling - show height in meters NAP
            if (title === 'AHN 0.5m') {
              let html = `<strong class="text-blue-800">AHN Hoogtekaart</strong>`

              // Try various property name patterns for height value (value_list is most common)
              const heightRaw = props.value_list ?? props.GRAY_INDEX ?? props.value ?? props.gray_index ??
                             props.dtm_05m ?? props.DTM_05M ?? props.hoogte ?? props.HOOGTE ??
                             props.elevation ?? props.ELEVATION

              if (heightRaw !== undefined && heightRaw !== null && !isNaN(Number(heightRaw))) {
                const heightValue = typeof heightRaw === 'number' ? heightRaw.toFixed(2) : Number(heightRaw).toFixed(2)
                html += `<br/><span class="text-sm text-blue-700">Hoogte: ${heightValue} m NAP</span>`
                results.push(html)
              } else {
                // Fallback: show all properties
                let hasContent = false
                const skipKeys = ['geometry', 'id', 'fid', 'gml_id', 'bbox']
                for (const [key, value] of Object.entries(props)) {
                  if (!skipKeys.includes(key.toLowerCase()) && value !== null && value !== '') {
                    html += `<br/><span class="text-xs text-gray-600">${key}: ${value}</span>`
                    hasContent = true
                  }
                }
                if (hasContent) {
                  results.push(html)
                }
              }
              continue
            }

            // Geomorfologie specific handling - clean output
            if (title === 'Geomorfologie') {
              let html = `<strong class="text-green-800">Geomorfologie</strong>`
              let hasContent = false

              // Actual property names from PDOK BRO Geomorfologie WMS
              const landformType = props.landform_subgroup_description
              const reliefKlasse = props.relief_klasse
              const reliefSubklasse = props.relief_subklasse
              const genese = props.genese_description
              const activeProcess = props.active_process

              // Main landform type (e.g. "Dekzandruggen en -koppen")
              if (landformType) {
                html += `<br/><span class="text-sm text-green-700">${landformType}</span>`
                hasContent = true
              }
              // Relief info
              if (reliefKlasse) {
                const reliefText = reliefSubklasse && reliefSubklasse !== reliefKlasse
                  ? `${reliefKlasse} (${reliefSubklasse})`
                  : reliefKlasse
                html += `<br/><span class="text-xs text-gray-600">Relief: ${reliefText}</span>`
                hasContent = true
              }
              // Genesis (origin, e.g. "eolisch")
              if (genese) {
                html += `<br/><span class="text-xs text-gray-500">Ontstaan: ${genese}</span>`
                hasContent = true
              }
              // Active process
              if (activeProcess && activeProcess !== 'onbekend') {
                html += `<br/><span class="text-xs text-gray-500">Actief proces: ${activeProcess}</span>`
                hasContent = true
              }

              // Fallback: show all properties if no specific ones found
              if (!hasContent) {
                const skipKeys = ['geometry', 'id', 'fid', 'gml_id', 'bbox', 'fuuid', 'geom', 'collection_id']
                for (const [key, value] of Object.entries(props)) {
                  if (!skipKeys.includes(key.toLowerCase()) && value !== null && value !== '' && !key.includes('validfrom') && !key.includes('validto')) {
                    html += `<br/><span class="text-xs text-gray-600">${key}: ${value}</span>`
                  }
                }
              }

              // Link naar WUR legenda
              html += `<br/><a href="https://legendageomorfologie.wur.nl/" target="_blank" rel="noopener" class="text-xs text-blue-600 hover:underline">Meer over geomorfologie</a>`

              results.push(html)
              continue
            }

            let html = `<strong>${title}</strong>`

            // Bodemkaart specific fields
            const soilName = props.first_soilname || props.soilname
            const soilCode = props.soilcode || props.first_soilcode
            if (soilName) {
              html += `<br/><span class="text-sm text-amber-700">${soilName}</span>`
              // Praktische uitleg toevoegen (geen externe links meer nodig)
              if (title === 'Bodemkaart') {
                const tips = getSoilExplanation(soilName, soilCode)
                if (tips.length > 0) {
                  html += `<br/><span class="text-xs text-gray-500 italic">${tips.join(' · ')}</span>`
                }
              }
            }
            if (props.soilslope && props.soilslope !== 'Niet opgenomen') {
              html += `<br/><span class="text-xs text-gray-500">Helling: ${props.soilslope}</span>`
            }

            // Generic fallback for other properties
            if (!soilName) {
              const skipKeys = ['geometry', 'id', 'fid', 'gml_id', 'GRAY_INDEX', 'gray_index', 'value']
              for (const [key, value] of Object.entries(props)) {
                if (!skipKeys.includes(key) && value && value !== 'Niet opgenomen') {
                  html += `<br/><span class="text-xs text-gray-600">${key}: ${value}</span>`
                }
              }
            }

            results.push(html)
          }
        } catch (error) {
          console.warn('WMS GetFeatureInfo failed:', error)
        }
      }
      return results
    }

    // Handle map clicks
    const handleClick = async (evt: MapBrowserEvent<any>) => {
      // Collect all popup contents from all sources
      const collectedContents: string[] = []

      // Query AHN height in parallel with feature lookup
      const heightPromise = queryAHNHeight(evt.coordinate)

      // Collect ALL vector features at click location
      const features: any[] = []
      map.forEachFeatureAtPixel(evt.pixel, f => {
        features.push(f)
      })

      // Process each vector feature
      for (const feature of features) {
        const properties = feature.getProperties()

        // Skip geometry property
        const { geometry, ...dataProps } = properties

        // Check if this is a vondst marker
        if (dataProps.vondst) {
          const v = dataProps.vondst as LocalVondst
          const vondstHtml = `<strong>${v.objectType}</strong>
            <div data-vondst-id="${v.id}"></div>
            <br/><span class="text-sm text-gray-600"><strong>Materiaal:</strong> ${v.material}</span>
            <br/><span class="text-sm text-gray-600"><strong>Periode:</strong> ${v.period}</span>
            ${v.depth ? `<br/><span class="text-sm text-gray-600"><strong>Diepte:</strong> ${v.depth} cm</span>` : ''}
            ${v.condition && v.condition !== 'Onbekend' ? `<br/><span class="text-sm text-gray-600"><strong>Conditie:</strong> ${v.condition}</span>` : ''}
            ${v.weight ? `<br/><span class="text-sm text-gray-600"><strong>Gewicht:</strong> ${v.weight} gram</span>` : ''}
            ${v.notes ? `<br/><span class="text-sm text-gray-600"><strong>Notities:</strong> ${v.notes}</span>` : ''}
            ${v.photoUrl ? `<br/><a href="${v.photoUrl}" target="_blank" rel="noopener" class="text-blue-600 hover:underline text-sm">📷 Bekijk foto</a>` : ''}
            <br/><span class="text-xs text-gray-400">${new Date(v.timestamp).toLocaleDateString('nl-NL')}</span>`
          collectedContents.push(vondstHtml)
          setCurrentVondstId(v.id)
          continue
        }

        // Custom Point (Mijn Lagen)
        if (dataProps.layerType === 'customPoint' && dataProps.customPoint) {
          const point = dataProps.customPoint
          const layerName = dataProps.customLayerName || 'Mijn Laag'
          let pointHtml = `<strong>${point.name}</strong>`
          pointHtml += `<br/><span class="text-xs text-gray-500">${layerName}</span>`
          if (point.category) {
            pointHtml += `<br/><span class="text-sm text-gray-600"><strong>Categorie:</strong> ${point.category}</span>`
          }
          // Photos display
          if (point.photos && point.photos.length > 0) {
            pointHtml += `<div class="flex flex-wrap gap-1 my-2">`
            for (const photo of point.photos.slice(0, 3)) {
              const src = photo.thumbnailUrl || photo.thumbnailBase64
              if (src) {
                pointHtml += `<img src="${src}" alt="Foto" class="w-16 h-16 object-cover rounded border border-gray-200" />`
              }
            }
            if (point.photos.length > 3) {
              pointHtml += `<span class="text-xs text-gray-400 self-end">+${point.photos.length - 3} meer</span>`
            }
            pointHtml += `</div>`
          }
          if (point.notes) {
            pointHtml += `<br/><span class="text-sm text-gray-600 mt-1">${point.notes}</span>`
          }
          if (point.url) {
            pointHtml += `<br/><a href="${point.url}" target="_blank" rel="noopener" class="text-blue-600 hover:underline text-sm">Meer info</a>`
          }
          pointHtml += `<br/><span class="text-xs text-gray-400">${new Date(point.createdAt).toLocaleDateString('nl-NL')}</span>`
          collectedContents.push(pointHtml)
          continue
        }

        // Check if this is an AMK feature - use local data (no WMS needed)
        if (dataProps.kwaliteitswaarde && dataProps.kwaliteitswaarde.includes('archeologische waarde')) {
          const amkHtml = formatAMKPopup(dataProps)
          collectedContents.push(amkHtml)
          continue
        }

        // Try to find a title/name - with better fallbacks for OSM data
        let name = dataProps.name || dataProps.naam || dataProps.title ||
                   dataProps.NAAM || dataProps.NAME || dataProps.label ||
                   dataProps.route_name || dataProps.road_name

        // Better fallback for OSM recreation data (Parken, Speeltuinen, Musea, Strandjes)
        if (!name) {
          if (dataProps.leisure === 'playground') {
            name = 'Speeltuin'
          } else if (dataProps.leisure === 'park') {
            name = 'Park'
          } else if (dataProps.leisure === 'swimming_area' || dataProps.sport === 'swimming') {
            name = 'Zwemplek'
          } else if (dataProps.tourism === 'museum') {
            name = 'Museum'
          } else if (dataProps.amenity === 'cafe' || dataProps.amenity === 'restaurant') {
            name = dataProps.amenity === 'cafe' ? 'Café' : 'Restaurant'
          } else if (dataProps.historic === 'castle') {
            name = 'Kasteel'
          } else {
            name = 'Info'
          }
        }

        // Override name for specific layer types to have consistent headers
        // Bunkers: always "Bunker" as header, specific name as subtitle
        if (dataProps.bunker_type || (dataProps.name && (dataProps.name.toLowerCase().includes('bunker') || dataProps.name.toLowerCase().includes('kazemat') || dataProps.name.toLowerCase().includes('schuilplaats')))) {
          name = 'Bunker'
        }
        // Slagvelden: always "Historisch slagveld" as header, battle name as subtitle
        if (dataProps.historic === 'battlefield') {
          name = 'Historisch slagveld'
        }

        let html = `<strong>${name}</strong>`

        // Archis / Kromme Rijn Aardewerk: Show category
        if (dataProps.category) {
          html += `<br/><span class="text-sm text-gray-600">Categorie: ${dataProps.category}</span>`
        }

        // Romeinse wegen: Show from-to info if different from name
        if (dataProps.from_to && dataProps.from_to !== name) {
          html += `<br/><span class="text-sm text-gray-600">${dataProps.from_to}</span>`
        }
        if (dataProps.route && dataProps.route !== name) {
          html += `<br/><span class="text-sm text-gray-600">${dataProps.route}</span>`
        }

        // UIKAV Archeo Punten: Show archaeological details
        if (dataProps.TOPONIEM) {
          html += `<br/><span class="text-sm font-semibold text-gray-800">${dataProps.TOPONIEM}</span>`
          if (dataProps.PLAATS) {
            html += `<br/><span class="text-xs text-gray-500">${dataProps.PLAATS}</span>`
          }
        }
        if (dataProps.AARD_VINDP || dataProps.Aard_vindp) {
          html += `<br/><span class="text-sm text-gray-700">Aard: ${dataProps.AARD_VINDP || dataProps.Aard_vindp}</span>`
        }
        if (dataProps.BEGIN_PER && dataProps.EIND_PER) {
          html += `<br/><span class="text-sm text-purple-700">Periode: ${dataProps.BEGIN_PER} - ${dataProps.EIND_PER}</span>`
        }
        if (dataProps.AARD_OPM || dataProps.Aard_opmer) {
          html += `<br/><span class="text-xs text-gray-600 italic">${dataProps.AARD_OPM || dataProps.Aard_opmer}</span>`
        }

        // UIKAV Vlakken: Show polygon details
        if (dataProps.Gemeente) {
          html += `<br/><span class="text-sm text-gray-600">Gemeente: ${dataProps.Gemeente}</span>`
        }
        if (dataProps.Bron) {
          html += `<br/><span class="text-xs text-gray-500">Bron: ${dataProps.Bron}</span>`
        }
        if (dataProps.Bron_besch) {
          html += `<br/><span class="text-xs text-gray-500">${dataProps.Bron_besch}</span>`
        }
        if (dataProps.Dat_st_z && dataProps.Dat_ei_z) {
          html += `<br/><span class="text-sm text-purple-700">Datering: ${dataProps.Dat_st_z} - ${dataProps.Dat_ei_z}</span>`
        }
        if (dataProps.Begin && dataProps.Einde) {
          html += `<br/><span class="text-sm text-purple-700">Periode: ${dataProps.Begin} - ${dataProps.Einde}</span>`
        }

        // UIKAV Uiterwaarden: Show river info
        if (dataProps.Uiterwaard) {
          html += `<br/><span class="text-sm font-semibold">${dataProps.Uiterwaard}</span>`
        }
        if (dataProps.rivier) {
          html += `<br/><span class="text-sm text-blue-600">Rivier: ${dataProps.rivier}</span>`
        }

        // Beschrijving veld
        if (dataProps.Beschrijvi) {
          html += `<br/><span class="text-sm text-gray-700">${dataProps.Beschrijvi}</span>`
        }

        // Speeltuinen/Parken (OSM data) - only show type if we have a real name
        if (dataProps.leisure && dataProps.name) {
          const typeLabel = dataProps.leisure === 'playground' ? 'Speeltuin' :
                           dataProps.leisure === 'park' ? 'Park' :
                           dataProps.leisure === 'swimming_area' ? 'Zwemplek' : null
          if (typeLabel) {
            html += `<br/><span class="text-xs text-green-600">${typeLabel}</span>`
          }
        }
        // Musea (OSM data) - only show type if we have a real name
        if ((dataProps.tourism === 'museum' || dataProps.museum) && dataProps.name) {
          html += `<br/><span class="text-xs text-purple-600">Museum</span>`
        }
        // Strandjes/Zwemplekken (OSM data) - only show type if we have a real name
        if ((dataProps.leisure === 'swimming_area' || dataProps.sport === 'swimming') && dataProps.name) {
          html += `<br/><span class="text-xs text-cyan-600">Zwemplek</span>`
        }
        // Kringloopwinkels (OSM data)
        if (dataProps.osm_id && dataProps.address !== undefined) {
          html += `<br/><span class="text-xs text-lime-600">Kringloopwinkel</span>`
          if (dataProps.address) {
            html += `<br/><span class="text-xs text-gray-500">${dataProps.address}</span>`
          }
          if (dataProps.phone) {
            html += `<br/><span class="text-xs text-gray-600">${dataProps.phone}</span>`
          }
        }

        // Grafheuvels (tumuli) - B1 stijl informatief
        if (dataProps.site_type === 'tumulus') {
          // Bepaal regio op basis van coördinaten (Web Mercator -> WGS84)
          const coords = feature.getGeometry()?.getCoordinates()
          let regio = ''
          let regioInfo = ''

          if (coords) {
            // Convert Web Mercator to WGS84
            const lonLat = toLonLat(coords)
            const lon = lonLat[0]
            const lat = lonLat[1]

            // Veluwe: roughly 5.5-6.2 lon, 52.0-52.4 lat
            if (lon > 5.5 && lon < 6.3 && lat > 52.0 && lat < 52.5) {
              regio = 'Veluwe'
              regioInfo = 'De Veluwe heeft de grootste concentratie grafheuvels van Nederland. Veel heuvels liggen in grafvelden met tientallen heuvels bij elkaar.'
            }
            // Drenthe: roughly 6.2-7.0 lon, 52.6-53.2 lat
            else if (lon > 6.2 && lon < 7.1 && lat > 52.6 && lat < 53.3) {
              regio = 'Drenthe'
              regioInfo = 'Drenthe is beroemd om zijn prehistorische monumenten. Naast hunebedden liggen hier honderden grafheuvels uit de Bronstijd.'
            }
            // Noord-Brabant: roughly 4.5-6.0 lon, 51.3-51.8 lat
            else if (lon > 4.5 && lon < 6.0 && lat > 51.3 && lat < 51.9) {
              regio = 'Noord-Brabant'
              regioInfo = 'Op de Brabantse zandgronden liggen veel grafheuvels, vaak in kleine groepjes op hogere gronden.'
            }
            // Limburg: roughly 5.5-6.2 lon, 50.7-51.5 lat
            else if (lon > 5.5 && lon < 6.3 && lat > 50.7 && lat < 51.6) {
              regio = 'Limburg'
              regioInfo = 'De Limburgse heuvels en plateaus herbergen grafheuvels uit verschillende periodes, van Bronstijd tot Romeinse tijd.'
            }
            // Utrecht/Gooi: roughly 5.0-5.5 lon, 52.0-52.4 lat
            else if (lon > 5.0 && lon < 5.6 && lat > 52.0 && lat < 52.4) {
              regio = 'Utrechtse Heuvelrug'
              regioInfo = 'De stuwwallen van de Utrechtse Heuvelrug en het Gooi waren al in de prehistorie bewoond. Grafheuvels markeren de laatste rustplaats van de vroege bewoners.'
            }
          }

          html += `<br/><span class="text-sm text-amber-700">Grafheuvel uit de Bronstijd of IJzertijd</span>`
          if (regio) {
            html += `<br/><span class="text-sm text-gray-500">${regio}</span>`
          }

          // Wat zie je hier
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat zie je hier?</span></div>`
          html += `<div class="text-sm text-gray-700 mt-1">Een grafheuvel is een kunstmatige heuvel over een of meerdere graven. De meeste Nederlandse grafheuvels zijn 3000 tot 4000 jaar oud, uit de Bronstijd (2000-800 v.Chr.) of vroege IJzertijd.</div>`

          // Regionale context
          if (regioInfo) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Over deze regio</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">${regioInfo}</div>`
          }

          // Hoe herken je een grafheuvel
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Hoe herken je een grafheuvel?</span></div>`
          html += `<div class="text-sm text-gray-700 mt-1">Grafheuvels zijn vaak ronde, lage heuvels van 10-30 meter doorsnee en 1-3 meter hoog. Ze liggen meestal op zandgronden, vaak in groepjes (grafvelden). Let op de kenmerkende ronde vorm in het landschap.</div>`

          // Wikipedia link via wikidata
          if (dataProps.wikidata) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Meer informatie</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1"><a href="https://www.wikidata.org/wiki/${dataProps.wikidata}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Bekijk op Wikidata</a></div>`
          } else {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Meer informatie</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1"><a href="https://nl.wikipedia.org/wiki/Grafheuvel" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Lees meer over grafheuvels op Wikipedia</a></div>`
          }
        }

        // Kastelen (OSM data) - B1 stijl
        if (dataProps.historic === 'castle' || dataProps.castle_type) {
          // Type vertalingen en uitleg
          const castleTypes: Record<string, { label: string; uitleg: string; vondsten: string }> = {
            'manor': {
              label: 'Landhuis',
              uitleg: 'Een landhuis of havezate was het woonhuis van een adellijke familie. Vaak met een landgoed eromheen.',
              vondsten: 'Sieraden, gespen, munten, aardewerk van rijke bewoners'
            },
            'stately': {
              label: 'Statig huis',
              uitleg: 'Een groot en deftig woonhuis, vaak van welgestelde families. Soms met kasteelachtige kenmerken.',
              vondsten: 'Huishoudelijke voorwerpen, munten, knopen, aardewerk'
            },
            'fortress': {
              label: 'Fort/Vesting',
              uitleg: 'Een versterkte militaire bouwwerk, gebouwd om een gebied te verdedigen.',
              vondsten: 'Militaire voorwerpen, kogels, gespen, uniformonderdelen'
            },
            'defensive': {
              label: 'Verdedigingskasteel',
              uitleg: 'Een kasteel gebouwd voor verdediging, met dikke muren, een gracht en torens.',
              vondsten: 'Wapens, harnasonderdelen, pijlpunten, middeleeuwse munten'
            },
            'palace': {
              label: 'Paleis',
              uitleg: 'Een groot en luxueus gebouw voor koningen, prinsen of zeer rijke families.',
              vondsten: 'Luxe voorwerpen, sieraden, zegels, zeldzame munten'
            },
            'castrum': {
              label: 'Romeins fort',
              uitleg: 'Een Romeins legerkamp of fort. Deze zijn bijna 2000 jaar oud!',
              vondsten: 'Romeinse munten, fibulae, militaria, aardewerk'
            },
            'citadel': {
              label: 'Citadel',
              uitleg: 'Een sterk versterkte kern binnen een stad, als laatste verdedigingslinie.',
              vondsten: 'Militaire voorwerpen uit verschillende periodes'
            }
          }

          const typeInfo = dataProps.castle_type ? castleTypes[dataProps.castle_type] : null
          const typeLabel = typeInfo?.label || 'Kasteel'

          // Type onder naam
          html += `<br/><span class="text-sm text-purple-600">${typeLabel}</span>`

          if (dataProps.start_date) {
            html += `<br/><span class="text-sm text-gray-500">Bouwjaar: ${dataProps.start_date}</span>`
          }

          if (dataProps.heritage) {
            html += `<br/><span class="text-sm text-amber-600">Rijksmonument</span>`
          }

          // Wat zie je hier
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat zie je hier?</span></div>`
          if (typeInfo) {
            html += `<div class="text-sm text-gray-700 mt-1">${typeInfo.uitleg}</div>`
          } else {
            html += `<div class="text-sm text-gray-700 mt-1">Een historisch kasteel of adellijk huis. Kastelen waren vaak het middelpunt van macht en rijkdom in een gebied.</div>`
          }

          // Wat kun je hier vinden
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kun je hier vinden?</span></div>`
          if (typeInfo) {
            html += `<div class="text-sm text-gray-700 mt-1">${typeInfo.vondsten}</div>`
          } else {
            html += `<div class="text-sm text-gray-700 mt-1">Munten, sieraden, gespen, aardewerk en andere voorwerpen van de vroegere bewoners.</div>`
          }

          // Meer weten - Wikipedia en website links
          if (dataProps.wikipedia || dataProps.website) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Meer weten?</span></div>`
            if (dataProps.wikipedia) {
              const wikiUrl = dataProps.wikipedia.startsWith('http')
                ? dataProps.wikipedia
                : `https://nl.wikipedia.org/wiki/${dataProps.wikipedia.replace(/^nl:/, '')}`
              html += `<div class="text-sm text-gray-700 mt-1"><a href="${wikiUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Wikipedia</a></div>`
            }
            if (dataProps.website) {
              html += `<div class="text-sm text-gray-700 mt-1"><a href="${dataProps.website}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Website bezoeken</a></div>`
            }
          }
        }

        // Ruïnes (OSM data) - B1 stijl
        if (dataProps.historic === 'ruins') {
          // Type tonen
          const ruinsType = dataProps.ruins_type || ''
          let typeLabel = 'Ruïne'
          let typeUitleg = 'Een ruïne is wat overblijft van een oud gebouw. Het kan een kerk, kasteel, molen of ander bouwwerk zijn geweest.'
          let typeVondsten = 'Baksteenfragmenten, aardewerk, metalen voorwerpen van vroegere bewoners of gebruikers'

          if (ruinsType.toLowerCase().includes('church') || ruinsType.toLowerCase().includes('kerk')) {
            typeLabel = 'Kerkruïne'
            typeUitleg = 'De overblijfselen van een oude kerk. Vaak nog te herkennen aan de fundering of een paar muren.'
            typeVondsten = 'Religieuze voorwerpen, munten van kerkgangers, knopen, gespen'
          } else if (ruinsType.toLowerCase().includes('castle') || ruinsType.toLowerCase().includes('kasteel')) {
            typeLabel = 'Kasteelruïne'
            typeUitleg = 'De resten van een middeleeuws kasteel. Soms is alleen de gracht of fundering nog zichtbaar.'
            typeVondsten = 'Middeleeuwse munten, sieraden, harnasonderdelen, pijlpunten'
          } else if (ruinsType.toLowerCase().includes('mill') || ruinsType.toLowerCase().includes('molen')) {
            typeLabel = 'Molenruïne'
            typeUitleg = 'Wat rest van een oude molen. Vaak nog te zien aan de stenen fundering of de molenberg.'
            typeVondsten = 'Gereedschap, munten, huishoudelijke voorwerpen'
          } else if (ruinsType.toLowerCase().includes('fort')) {
            typeLabel = 'Fortruïne'
            typeUitleg = 'De overblijfselen van een militair fort of verdedigingswerk.'
            typeVondsten = 'Militaire voorwerpen, kogels, gespen, uniformonderdelen'
          }

          html += `<br/><span class="text-sm text-gray-600">${typeLabel}</span>`

          // Wat zie je hier
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat zie je hier?</span></div>`
          html += `<div class="text-sm text-gray-700 mt-1">${typeUitleg}</div>`

          // Wat kun je hier vinden
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kun je hier vinden?</span></div>`
          html += `<div class="text-sm text-gray-700 mt-1">${typeVondsten}</div>`

          // Extra info als beschikbaar
          if (dataProps.description) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Beschrijving</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">${dataProps.description}</div>`
          }

          // Meer weten - Wikipedia link
          if (dataProps.wikipedia) {
            const wikiUrl = dataProps.wikipedia.startsWith('http')
              ? dataProps.wikipedia
              : `https://${dataProps.wikipedia.split(':')[0] || 'nl'}.wikipedia.org/wiki/${dataProps.wikipedia.replace(/^[a-z]{2}:/, '')}`
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Meer weten?</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">Lees meer op <a href="${wikiUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Wikipedia</a></div>`
          }
        }

        // Bunkers (WOII) - B1 stijl met regio-specifieke info
        if (dataProps.bunker_type || (dataProps.name && (dataProps.name.toLowerCase().includes('bunker') || dataProps.name.toLowerCase().includes('kazemat') || dataProps.name.toLowerCase().includes('schuilplaats')))) {
          // Bunker type vertalingen
          const bunkerTypeLabels: Record<string, string> = {
            'munitions': 'Munitiebunker',
            'personnel_shelter': 'Personeelsschuilplaats',
            'personell_shelter': 'Personeelsschuilplaats',
            'command': 'Commandobunker',
            'gun_emplacement': 'Geschutsbunker',
            'mg_nest': 'Mitrailleursnest',
            'technical': 'Technische bunker',
            'storage': 'Opslagbunker',
            'tobruk': 'Tobruk',
            'kazemat': 'Kazemat',
            'Flak': 'Luchtafweerstelling',
            'hardened_aircraft_shelter': 'Vliegtuigshelter',
            'shelter': 'Schuilkelder',
            'observation': 'Observatiebunker',
            'anti_aircraft': 'Luchtafweerstelling'
          }

          // Toon bunkernaam als subtitle (niet als header - header is nu altijd "Bunker")
          const bunkerNaam = dataProps.name || ''
          const bunkerType = dataProps.bunker_type ? (bunkerTypeLabels[dataProps.bunker_type] || dataProps.bunker_type) : ''

          if (bunkerNaam && bunkerNaam !== 'Bunker') {
            html += `<br/><span class="text-sm font-semibold text-gray-700">${bunkerNaam}</span>`
          }
          if (bunkerType && bunkerType !== bunkerNaam) {
            html += `<br/><span class="text-xs text-gray-500">${bunkerType}</span>`
          }

          // Detecteer regio op basis van coördinaten voor context
          const coords = feature.getGeometry()?.getCoordinates()
          let regioContext = ''
          let regioLink = ''
          let regioLinkLabel = ''

          if (coords) {
            const lonLat = toLonLat(coords)
            const lon = lonLat[0]
            const lat = lonLat[1]

            // Kustgebied = Atlantikwall (west van 5.0 of dicht bij kust)
            const isKust = lon < 4.8 || (lon < 5.2 && lat > 51.8 && lat < 53.5)
            // Scheveningen/Den Haag gebied
            const isScheveningen = lon > 4.2 && lon < 4.4 && lat > 52.0 && lat < 52.15
            // IJmuiden gebied
            const isIJmuiden = lon > 4.5 && lon < 4.7 && lat > 52.4 && lat < 52.5
            // Hoek van Holland
            const isHoekVanHolland = lon > 4.0 && lon < 4.2 && lat > 51.95 && lat < 52.05
            // Zeeland kust
            const isZeeland = lon < 4.2 && lat < 51.6
            // Grebbelinie (Utrecht/Gelderland)
            const isGrebbelinie = lon > 5.2 && lon < 5.8 && lat > 51.9 && lat < 52.3

            if (isScheveningen) {
              regioContext = `Deze bunker maakt deel uit van de Atlantikwall bij Scheveningen. De Duitsers bouwden hier tijdens WOII zo'n 80 bunkers in de duinen. De muren zijn soms 3 meter dik beton. Voor deze bunkers moesten 138.000 mensen uit Den Haag en Scheveningen hun huis verlaten.`
              regioLink = 'https://nl.wikipedia.org/wiki/Atlantikwall_Museum_Scheveningen'
              regioLinkLabel = 'Atlantikwall Museum Scheveningen'
            } else if (isIJmuiden) {
              regioContext = `Deze bunker hoort bij Festung IJmuiden, een van de zwaarst verdedigde punten van de Atlantikwall. De Duitsers bouwden hier bunkers om de haventoegang te beschermen. Er zijn nu rondleidingen door het Bunkermuseum.`
              regioLink = 'https://www.bunkermuseum.nl/'
              regioLinkLabel = 'Bunkermuseum IJmuiden'
            } else if (isHoekVanHolland) {
              regioContext = `Deze bunker maakt deel uit van de Atlantikwall bij Hoek van Holland. Dit was een strategisch punt voor de Duitsers vanwege de Nieuwe Waterweg. Veel bunkers zijn nog te bezoeken.`
              regioLink = 'https://www.atlantikwallhoekvanholland.nl/'
              regioLinkLabel = 'Atlantikwall Hoek van Holland'
            } else if (isZeeland) {
              regioContext = `Deze bunker hoort bij de Atlantikwall in Zeeland. De Duitsers verdedigden hier de Westerschelde en de kust. Bij Zoutelande en Westkapelle zijn veel bunkers bewaard gebleven.`
              regioLink = 'https://www.bunkermuseumzoutelande.nl/'
              regioLinkLabel = 'Bunkermuseum Zoutelande'
            } else if (isKust) {
              regioContext = `Deze bunker maakt deel uit van de Atlantikwall: de Duitse verdedigingslinie langs de hele kust van Europa. In Nederland bouwden de Duitsers duizenden bunkers tussen 1942 en 1944.`
              regioLink = 'https://nl.wikipedia.org/wiki/Atlantikwall'
              regioLinkLabel = 'Atlantikwall (Wikipedia)'
            } else if (isGrebbelinie) {
              regioContext = `Deze bunker hoort mogelijk bij de Grebbelinie of de Nieuwe Hollandse Waterlinie. Dit waren Nederlandse verdedigingslinies die de Duitsers na 1940 versterkten met bunkers.`
              regioLink = 'https://nl.wikipedia.org/wiki/Grebbelinie'
              regioLinkLabel = 'Grebbelinie (Wikipedia)'
            } else {
              regioContext = `Een bunker uit de Tweede Wereldoorlog. De meeste bunkers in Nederland zijn gebouwd tussen 1940 en 1944, als onderdeel van de Duitse verdediging of langs bestaande Nederlandse linies.`
              regioLink = 'https://nl.wikipedia.org/wiki/Atlantikwall'
              regioLinkLabel = 'WOII bunkers (Wikipedia)'
            }
          } else {
            regioContext = `Een bunker uit de Tweede Wereldoorlog.`
            regioLink = 'https://nl.wikipedia.org/wiki/Atlantikwall'
            regioLinkLabel = 'WOII bunkers (Wikipedia)'
          }

          // Wat zie je hier?
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat zie je hier?</span></div>`
          html += `<div class="text-sm text-gray-700 mt-1">${regioContext}</div>`

          // Wat kun je vinden?
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kun je vinden?</span></div>`
          html += `<div class="text-sm text-gray-700 mt-1">Bij bunkers worden soms voorwerpen gevonden zoals patronen, uniformknopen, gespen en persoonlijke spullen van soldaten.</div>`

          // Let op - subtiel, klein, italic
          html += `<div class="mt-2 text-xs text-gray-500 italic">Let op: betreed nooit een bunker zonder toestemming. Raak munitieresten niet aan.</div>`

          // Bronnen
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Bronnen</span></div>`
          html += `<div class="text-sm text-gray-700 mt-1">`
          html += `<a href="${regioLink}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">${regioLinkLabel}</a>`
          if (dataProps.website) {
            html += `<br/><a href="${dataProps.website}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">TracesOfWar</a>`
          } else {
            html += `<br/><a href="https://www.tracesofwar.nl/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">TracesOfWar</a>`
          }
          html += `</div>`
        }

        // Slagvelden (battlefields) - B1 stijl met specifieke slag-info
        if (dataProps.historic === 'battlefield') {
          // Specifieke info per slag (header is al "Historisch slagveld", naam als subtitle)
          const slagNaam = dataProps.name || 'Onbekend slagveld'

          // Database van bekende slagen met B1 info
          const slagInfo: Record<string, { periode: string; samenvatting: string; watZieJe: string; uitkomst: string; wikiUrl: string }> = {
            'Slag om Arnhem': {
              periode: 'September 1944',
              samenvatting: 'De Slag om Arnhem was onderdeel van Operatie Market Garden. Geallieerde parachutisten probeerden de brug over de Rijn te veroveren. Na negen dagen hevige gevechten moesten ze zich terugtrekken. Van de 10.000 Britse soldaten werden er 1.500 gedood en 6.500 krijgsgevangen gemaakt.',
              watZieJe: 'Er zijn veel monumenten en infoborden. Het Airborne Museum in Oosterbeek vertelt het hele verhaal. Elk jaar in september is er een herdenking.',
              uitkomst: 'De geallieerden verloren de slag. Nederland bleef nog tot mei 1945 bezet.',
              wikiUrl: 'https://nl.wikipedia.org/wiki/Slag_om_Arnhem'
            },
            'Slag om de Sloedam': {
              periode: '1-2 november 1944',
              samenvatting: 'Canadese soldaten vielen de Sloedam aan om Walcheren te bevrijden. De dam was smal en de Duitsers verdedigden fel. Veel soldaten sneuvelden bij deze bloedige aanval.',
              watZieJe: 'Bij de dam staat een monument voor de gevallen Canadezen. Er zijn infoborden die de slag uitleggen.',
              uitkomst: 'De Canadezen wonnen na zware verliezen. Dit opende de weg naar de bevrijding van Walcheren.',
              wikiUrl: 'https://nl.wikipedia.org/wiki/Slag_om_de_Sloedam'
            },
            'Slag bij Heiligerlee (1568)': {
              periode: '23 mei 1568',
              samenvatting: 'De eerste veldslag van de Tachtigjarige Oorlog. Lodewijk van Nassau versloeg het Spaanse leger. Zijn broer Adolf sneuvelde tijdens de strijd.',
              watZieJe: 'In Heiligerlee staat het Slag bij Heiligerlee monument. Het klooster waar Adolf van Nassau begraven ligt is nog te bezoeken.',
              uitkomst: 'De opstandelingen wonnen, maar dit was pas het begin van 80 jaar oorlog.',
              wikiUrl: 'https://nl.wikipedia.org/wiki/Slag_bij_Heiligerlee_(1568)'
            },
            'Overloon': {
              periode: 'Oktober 1944',
              samenvatting: 'Bij Overloon vochten Britten en Amerikanen tegen de Duitsers. Het was een van de zwaarste tankgevechten op Nederlandse bodem. Het dorp werd volledig verwoest.',
              watZieJe: 'Het Oorlogsmuseum Overloon staat op het voormalige slagveld. Je kunt tanks, vliegtuigen en andere voertuigen zien.',
              uitkomst: 'De geallieerden wonnen na wekenlange gevechten.',
              wikiUrl: 'https://nl.wikipedia.org/wiki/Slag_om_Overloon'
            },
            'Slagveld Lanakerveld': {
              periode: '1568',
              samenvatting: 'Onderdeel van de Nederlandse opstand tegen Spanje. Hier vonden gevechten plaats tijdens de beginjaren van de Tachtigjarige Oorlog.',
              watZieJe: 'Het gebied is nu grotendeels landbouwgrond. Lokaal zijn er soms infoborden.',
              uitkomst: 'Onderdeel van de lange strijd tegen de Spaanse overheersing.',
              wikiUrl: 'https://nl.wikipedia.org/wiki/Tachtigjarige_Oorlog'
            },
            'Blessebrugschans': {
              periode: 'Diverse periodes',
              samenvatting: 'Een historische schans die meerdere keren werd gebruikt in militaire conflicten.',
              watZieJe: 'De resten van de schans zijn nog zichtbaar in het landschap.',
              uitkomst: 'De schans speelde een rol in verschillende conflicten.',
              wikiUrl: 'https://nl.wikipedia.org/wiki/Schans_(vestingwerk)'
            }
          }

          // Zoek specifieke info voor deze slag
          const info = slagInfo[slagNaam]

          // Toon slagnaam als subtitle (header is al "Historisch slagveld")
          if (slagNaam !== 'Onbekend slagveld' && slagNaam !== 'Historisch slagveld') {
            html += `<br/><span class="text-sm font-semibold text-red-700">${slagNaam}</span>`
          }

          if (info) {
            // Periode
            html += `<br/><span class="text-xs text-gray-500">${info.periode}</span>`

            // Wat gebeurde hier?
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat gebeurde hier?</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">${info.samenvatting}</div>`

            // Uitkomst
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Hoe liep het af?</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">${info.uitkomst}</div>`

            // Wat kun je zien?
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kun je zien?</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">${info.watZieJe}</div>`

            // Bronnen
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Bronnen</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">`
            html += `<a href="${info.wikiUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Wikipedia</a>`
            if (slagNaam.includes('Arnhem')) {
              html += `<br/><a href="https://www.airbornemuseum.nl/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Airborne Museum Oosterbeek</a>`
            }
            if (slagNaam.includes('Overloon')) {
              html += `<br/><a href="https://www.oorlogsmuseum.nl/" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Oorlogsmuseum Overloon</a>`
            }
            html += `</div>`
          } else {
            // Fallback voor onbekende slagvelden
            if (dataProps.date) {
              html += `<br/><span class="text-xs text-gray-500">${dataProps.date}</span>`
            }
            if (dataProps.description) {
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat gebeurde hier?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">${dataProps.description}</div>`
            } else {
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat gebeurde hier?</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1">Op deze plek vonden historische gevechten plaats. Zoek lokaal naar infoborden of monumenten.</div>`
            }

            // Wikipedia link als beschikbaar
            if (dataProps.wikipedia) {
              const wikiUrl = dataProps.wikipedia.startsWith('http')
                ? dataProps.wikipedia
                : `https://nl.wikipedia.org/wiki/${dataProps.wikipedia.replace('nl:', '')}`
              html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Bronnen</span></div>`
              html += `<div class="text-sm text-gray-700 mt-1"><a href="${wikiUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Wikipedia</a></div>`
            }
          }
        }

        // Fossielen (PBDB data) - B1 stijl
        if (dataProps.bron === 'Paleobiology Database') {
          // Helper functie voor Nederlandse taxonomie uitleg
          const getTaxonomieUitleg = (taxonomie: string): string => {
            const uitleg: Record<string, string> = {
              'Mollusca': 'weekdieren zoals schelpen en slakken',
              'Brachiopoda': 'armpotigen, schelp-achtige dieren',
              'Echinodermata': 'stekelhuidigen zoals zee-egels en zeesterren',
              'Chordata': 'gewervelde dieren',
              'Arthropoda': 'geleedpotigen zoals kreeften en trilobieten',
              'Cnidaria': 'neteldieren zoals koralen en kwallen',
              'Bryozoa': 'mosdiertjes',
              'Foraminifera': 'eencellige schelpdieren',
              'Plantae': 'planten',
              'Crinoidea': 'zeelelies',
              'Gastropoda': 'slakken',
              'Bivalvia': 'tweekleppigen zoals mossels en oesters',
              'Cephalopoda': 'koppotigen zoals inktvissen en ammonieten',
              'Trilobita': 'trilobieten, uitgestorven kreeftachtigen',
              'Mammalia': 'zoogdieren',
              'Reptilia': 'reptielen',
              'Pisces': 'vissen',
              'Amphibia': 'amfibieën'
            }
            for (const [term, uitlegTekst] of Object.entries(uitleg)) {
              if (taxonomie.toLowerCase().includes(term.toLowerCase())) {
                return uitlegTekst
              }
            }
            return ''
          }

          // Helper voor periode uitleg
          const getPeriodeUitleg = (periode: string): string => {
            const periodeInfo: Record<string, string> = {
              'Cambrium': '541-485 miljoen jaar geleden',
              'Ordovicium': '485-444 miljoen jaar geleden',
              'Siluur': '444-419 miljoen jaar geleden',
              'Devoon': '419-359 miljoen jaar geleden',
              'Carboon': '359-299 miljoen jaar geleden',
              'Perm': '299-252 miljoen jaar geleden',
              'Trias': '252-201 miljoen jaar geleden',
              'Jura': '201-145 miljoen jaar geleden',
              'Krijt': '145-66 miljoen jaar geleden',
              'Paleogeen': '66-23 miljoen jaar geleden',
              'Neogeen': '23-2,6 miljoen jaar geleden',
              'Kwartair': '2,6 miljoen jaar - nu',
              'Pleistoceen': '2,6 miljoen - 11.700 jaar geleden',
              'Holoceen': '11.700 jaar geleden - nu'
            }
            for (const [term, info] of Object.entries(periodeInfo)) {
              if (periode.toLowerCase().includes(term.toLowerCase())) {
                return info
              }
            }
            return ''
          }

          // Helper voor gesteente vertaling
          const vertaalGesteente = (gesteente: string): string => {
            const vertalingen: Record<string, string> = {
              'limestone': 'kalksteen', 'sandstone': 'zandsteen', 'shale': 'schalie',
              'clay': 'klei', 'sand': 'zand', 'gravel': 'grind', 'marl': 'mergel',
              'chalk': 'krijt', 'mudstone': 'moddersteen', 'siltstone': 'siltsteen'
            }
            let result = gesteente
            for (const [eng, nl] of Object.entries(vertalingen)) {
              result = result.replace(new RegExp(eng, 'gi'), nl)
            }
            return result
          }

          // Helper voor milieu vertaling
          const vertaalMilieu = (milieu: string): string => {
            const vertalingen: Record<string, string> = {
              'marine': 'zee', 'coastal': 'kust', 'terrestrial': 'land',
              'fluvial': 'rivier', 'lacustrine': 'meer', 'reef': 'rif',
              'deltaic': 'delta', 'shallow': 'ondiep water', 'deep': 'diep water'
            }
            let result = milieu
            for (const [eng, nl] of Object.entries(vertalingen)) {
              result = result.replace(new RegExp(eng, 'gi'), nl)
            }
            return result
          }

          // Vindplaats onder titel
          if (dataProps.vindplaats) {
            html += `<br/><span class="text-xs text-gray-600">${dataProps.vindplaats}</span>`
          }

          // Wat is hier gevonden?
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat is hier gevonden?</span></div>`

          if (dataProps.taxonomie && dataProps.taxonomie !== 'Onbekend') {
            const uitleg = getTaxonomieUitleg(dataProps.taxonomie)
            if (uitleg) {
              html += `<div class="text-sm text-gray-700 mt-1">${uitleg}</div>`
              html += `<div class="text-xs text-gray-500 italic">(${dataProps.taxonomie})</div>`
            } else {
              html += `<div class="text-sm text-gray-700 mt-1">${dataProps.taxonomie}</div>`
            }
          }

          if (dataProps.aantal_fossielen) {
            const aantal = parseInt(dataProps.aantal_fossielen)
            const aantalTekst = aantal > 100 ? 'Veel fossielen gevonden op deze locatie.' :
                               aantal > 10 ? 'Meerdere fossielen gevonden op deze locatie.' :
                               `${dataProps.aantal_fossielen} fossiel${aantal > 1 ? 'en' : ''} gevonden op deze locatie.`
            html += `<div class="text-sm text-gray-600 mt-1">${aantalTekst}</div>`
          }

          // Wanneer leefden deze dieren?
          if (dataProps.periode && dataProps.periode !== 'Onbekend') {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wanneer leefden deze dieren?</span></div>`
            const periodeUitleg = getPeriodeUitleg(dataProps.periode)
            html += `<div class="text-sm text-gray-700 mt-1">${dataProps.periode}</div>`
            if (periodeUitleg) {
              html += `<div class="text-sm text-gray-600">${periodeUitleg}</div>`
            }
            if (dataProps.ouderdom && dataProps.ouderdom !== 'Onbekend') {
              html += `<div class="text-sm text-gray-600">Ouderdom: ${dataProps.ouderdom}</div>`
            }
          }

          // In wat voor gesteente?
          if (dataProps.gesteente || dataProps.formatie || dataProps.milieu) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">In wat voor gesteente?</span></div>`
            if (dataProps.gesteente) {
              html += `<div class="text-sm text-gray-700 mt-1">${vertaalGesteente(dataProps.gesteente)}</div>`
            }
            if (dataProps.formatie) {
              html += `<div class="text-sm text-gray-600">Formatie: ${dataProps.formatie}</div>`
              if (dataProps.lid) {
                html += `<div class="text-sm text-gray-600 ml-3">Lid: ${dataProps.lid}</div>`
              }
            }
            if (dataProps.milieu) {
              html += `<div class="text-sm text-gray-600">Leefomgeving: ${vertaalMilieu(dataProps.milieu)}</div>`
            }
          }
        }

        // Fossiel Hotspots (populaire zoeklocaties) - B1 stijl
        if (dataProps.layerType === 'fossielHotspot') {
          // Type en regio onder titel
          const locationParts: string[] = []
          if (dataProps.type) locationParts.push(dataProps.type)
          if (dataProps.region) locationParts.push(dataProps.region)
          if (dataProps.country) {
            const countryNames: Record<string, string> = { 'NL': 'Nederland', 'BE': 'België', 'DE': 'Duitsland', 'FR': 'Frankrijk' }
            locationParts.push(countryNames[dataProps.country] || dataProps.country)
          }
          if (locationParts.length > 0) {
            html += `<br/><span class="text-xs text-gray-600">${locationParts.join(' · ')}</span>`
          }

          // Wat kan ik er vinden?
          if (dataProps.finds || dataProps.period) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kan ik er vinden?</span></div>`
            if (dataProps.finds) {
              html += `<div class="text-sm text-gray-700 mt-1">${dataProps.finds}</div>`
            }
            if (dataProps.period) {
              html += `<div class="text-sm text-gray-600 mt-1">Periode: ${dataProps.period}</div>`
            }
            if (dataProps.geology) {
              html += `<div class="text-sm text-gray-600 mt-1">Geologie: ${dataProps.geology}</div>`
            }
          }

          // Hoe kom ik er?
          if (dataProps.access || dataProps.tips) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Hoe kom ik er?</span></div>`
            if (dataProps.access) {
              const isVerboden = dataProps.access.toLowerCase().includes('verboden') ||
                                dataProps.access.toLowerCase().includes('niet toegankelijk')
              const accessColor = isVerboden ? 'text-red-600' : 'text-gray-700'
              html += `<div class="text-sm ${accessColor} mt-1">${dataProps.access}</div>`
            }
            if (dataProps.tips) {
              html += `<div class="text-sm text-gray-600 mt-1 italic">Tip: ${dataProps.tips}</div>`
            }
          }
        }

        // Mineralen Hotspots (NL/FR/BE/DE) - B1 stijl
        if (dataProps.layerType === 'mineralenHotspot') {
          // Regio en land onder titel
          const locationParts: string[] = []
          if (dataProps.region) locationParts.push(dataProps.region)
          if (dataProps.country) {
            const countryNames: Record<string, string> = { 'NL': 'Nederland', 'BE': 'België', 'DE': 'Duitsland', 'FR': 'Frankrijk' }
            locationParts.push(countryNames[dataProps.country] || dataProps.country)
          }
          if (locationParts.length > 0) {
            html += `<br/><span class="text-xs text-gray-600">${locationParts.join(' · ')}</span>`
          }

          // Wat kan ik er vinden?
          if (dataProps.minerals) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kan ik er vinden?</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">${dataProps.minerals}</div>`
            if (dataProps.geology) {
              html += `<div class="text-sm text-gray-600 mt-1">Geologie: ${dataProps.geology}</div>`
            }
          }

          // Hoe kom ik er?
          if (dataProps.access || dataProps.tips) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Hoe kom ik er?</span></div>`
            if (dataProps.access) {
              const isVerboden = dataProps.access.toLowerCase().includes('verboden') ||
                                dataProps.access.toLowerCase().includes('niet toegankelijk') ||
                                dataProps.access.toLowerCase().includes('gesloten')
              const accessColor = isVerboden ? 'text-red-600' : 'text-gray-700'
              html += `<div class="text-sm ${accessColor} mt-1">${dataProps.access}</div>`
            }
            if (dataProps.tips) {
              html += `<div class="text-sm text-gray-600 mt-1 italic">Tip: ${dataProps.tips}</div>`
            }
          }
        }

        // Goudrivieren (NL/BE/DE/FR) - B1 stijl
        if (dataProps.layerType === 'goudrivier') {
          // Rivier, regio en land onder titel
          const locationParts: string[] = []
          if (dataProps.river) locationParts.push(dataProps.river)
          if (dataProps.region) locationParts.push(dataProps.region)
          if (dataProps.country) {
            const countryNames: Record<string, string> = { 'NL': 'Nederland', 'BE': 'België', 'DE': 'Duitsland', 'FR': 'Frankrijk' }
            locationParts.push(countryNames[dataProps.country] || dataProps.country)
          }
          if (locationParts.length > 0) {
            html += `<br/><span class="text-xs text-gray-600">${locationParts.join(' · ')}</span>`
          }

          // Wat kan ik er vinden?
          if (dataProps.goldType || dataProps.origin) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat kan ik er vinden?</span></div>`
            if (dataProps.goldType) {
              html += `<div class="text-sm text-gray-700 mt-1">${dataProps.goldType}</div>`
            }
            if (dataProps.origin) {
              html += `<div class="text-sm text-gray-600 mt-1">Herkomst: ${dataProps.origin}</div>`
            }
          }

          // Mag ik hier zoeken?
          if (dataProps.legal || dataProps.tips) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Mag ik hier zoeken?</span></div>`
            if (dataProps.legal) {
              const isProhibited = dataProps.legal.includes('VERBODEN')
              const colorClass = isProhibited ? 'text-red-600 font-semibold' : 'text-gray-700'
              html += `<div class="text-sm ${colorClass} mt-1">${dataProps.legal}</div>`
            }
            if (dataProps.tips) {
              html += `<div class="text-sm text-gray-600 mt-1 italic">Tip: ${dataProps.tips}</div>`
            }
          }
        }

        // Wandelroutes - startpunten populaire wandelingen - B1 stijl
        if (dataProps.layerType === 'wandelroute') {
          // Regio en land onder titel
          const locationParts: string[] = []
          if (dataProps.region) locationParts.push(dataProps.region)
          if (dataProps.country) {
            const countryNames: Record<string, string> = { 'NL': 'Nederland', 'BE': 'België' }
            locationParts.push(countryNames[dataProps.country] || dataProps.country)
          }
          if (locationParts.length > 0) {
            html += `<br/><span class="text-xs text-gray-600">${locationParts.join(' · ')}</span>`
          }

          // Afstand en duur
          if (dataProps.distance || dataProps.duration) {
            const distanceText = dataProps.distance ? `${dataProps.distance} km` : ''
            const durationText = dataProps.duration ? `${dataProps.duration}` : ''
            const combined = [distanceText, durationText].filter(Boolean).join(' · ')
            if (combined) {
              html += `<br/><span class="text-sm text-green-700 font-medium">${combined}</span>`
            }
          }

          // Wat ga je zien?
          if (dataProps.description || dataProps.highlights) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat ga je zien?</span></div>`
            if (dataProps.description) {
              html += `<div class="text-sm text-gray-700 mt-1">${dataProps.description}</div>`
            }
            if (dataProps.highlights) {
              html += `<div class="text-sm text-gray-600 mt-1">Hoogtepunten: ${dataProps.highlights}</div>`
            }
          }

          // Waar begin ik?
          if (dataProps.startAddress) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Waar begin ik?</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">${dataProps.startAddress}</div>`
          }

          // Meer info link
          if (dataProps.url) {
            html += `<div class="mt-3"><a href="${dataProps.url}" target="_blank" class="text-sm text-blue-600 hover:underline">Bekijk route en download GPX</a></div>`
          }
        }

        // Hunebedden (megalithische grafmonumenten) - B1 stijl
        if (dataProps.layerType === 'hunebed') {
          // Periode direct onder titel
          if (dataProps.period) {
            html += `<br/><span class="text-sm text-purple-700">Periode: ${dataProps.period}</span>`
          }

          // "Wat zie je hier?" sectie
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat zie je hier?</span></div>`

          // Intro tekst
          if (dataProps.description) {
            html += `<div class="text-sm text-gray-700 mt-1">${dataProps.description}</div>`
          }

          // Bullet points voor stenen en afmetingen
          const bulletPoints: string[] = []
          if (dataProps.stones) {
            // Parse stones string into separate items
            const stonesLower = dataProps.stones.toLowerCase()
            const dekMatch = stonesLower.match(/(\d+)\s*dekst[^\s,]*/i)
            const draagMatch = stonesLower.match(/(\d+)\s*draagst[^\s,]*/i)
            const sluitMatch = stonesLower.match(/(\d+)\s*sluitst[^\s,]*/i)
            const poortMatch = stonesLower.match(/(\d+)\s*poortst[^\s,]*/i)
            const gangdekMatch = stonesLower.match(/(\d+)\s*gangdekst[^\s,]*/i)
            const gangzijMatch = stonesLower.match(/(\d+)\s*gangzijst[^\s,]*/i)

            if (dekMatch) bulletPoints.push(`${dekMatch[1]} deksteen${parseInt(dekMatch[1]) > 1 ? 'en' : ''} (de grote steen${parseInt(dekMatch[1]) > 1 ? 'en' : ''} bovenop)`)
            if (draagMatch) bulletPoints.push(`${draagMatch[1]} draagstenen (de stenen die de dekstenen dragen)`)
            if (sluitMatch) bulletPoints.push(`${sluitMatch[1]} sluitsteen${parseInt(sluitMatch[1]) > 1 ? 'en' : ''} (afsluiting aan de korte zijden)`)
            if (poortMatch) bulletPoints.push(`${poortMatch[1]} poortsteen${parseInt(poortMatch[1]) > 1 ? 'en' : ''} (bij de ingang)`)
            if (gangdekMatch) bulletPoints.push(`${gangdekMatch[1]} gangdeksteen${parseInt(gangdekMatch[1]) > 1 ? 'en' : ''} (boven de toegangsgang)`)
            if (gangzijMatch) bulletPoints.push(`${gangzijMatch[1]} gangzijstenen (langs de toegangsgang)`)
          }
          if (dataProps.length) {
            bulletPoints.push(`Een grafkamer van ${dataProps.length} lang`)
          }
          if (dataProps.width) {
            bulletPoints.push(`${dataProps.width}`)
          }

          if (bulletPoints.length > 0) {
            html += `<div class="text-sm text-gray-700 mt-1">Het hunebed heeft:</div>`
            html += `<ul class="list-disc list-inside text-sm text-gray-700 mt-1 space-y-0.5">`
            bulletPoints.forEach(point => {
              html += `<li>${point}</li>`
            })
            html += `</ul>`
          }

          // "Waarom is dit hunebed bijzonder?" of andere notable info
          if (dataProps.notable) {
            // Bepaal een passende vraag op basis van de notable tekst
            const notableLower = dataProps.notable.toLowerCase()
            let questionTitle = 'Wat is hier bijzonder?'
            if (notableLower.includes('grootste')) {
              questionTitle = 'Waarom is dit het grootste hunebed?'
            } else if (notableLower.includes('klein') || notableLower.includes('kindhunebed')) {
              questionTitle = 'Waarom is dit hunebed zo klein?'
            } else if (notableLower.includes('cluster') || notableLower.includes('naast elkaar')) {
              questionTitle = 'Waarom liggen hier meerdere hunebedden?'
            } else if (notableLower.includes('enige') || notableLower.includes('westelijk') || notableLower.includes('noordelijk')) {
              questionTitle = 'Wat maakt deze locatie bijzonder?'
            }

            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">${questionTitle}</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">${dataProps.notable}</div>`
          }

          // "Wat is de Trechterbeker cultuur?" - standaard uitleg
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat is de Trechterbeker cultuur?</span></div>`
          html += `<div class="text-sm text-gray-700 mt-1">De Trechterbeker cultuur is de naam voor de mensen die 5.000 jaar geleden in Nederland woonden. Ze maakten potten met een trechter-vorm. Daarom heten ze zo. Deze mensen bouwden de hunebedden als graven voor hun doden.</div>`

          // Vondsten (als er zijn)
          if (dataProps.finds) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Wat is hier gevonden?</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">${dataProps.finds}</div>`
          }

          // Museum info
          if (dataProps.museum) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Museum in de buurt</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">${dataProps.museum}</div>`
          }

          // "Bezoeken" sectie
          html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Bezoeken</span></div>`
          if (dataProps.access) {
            html += `<div class="text-sm text-gray-700 mt-1">${dataProps.access}</div>`
          } else {
            html += `<div class="text-sm text-gray-700 mt-1">Je kunt dit hunebed gratis bezoeken.</div>`
          }

          // "Meer weten?" sectie
          if (dataProps.wikipedia) {
            html += `<div class="mt-3"><span class="text-sm font-semibold text-gray-800">Meer weten?</span></div>`
            html += `<div class="text-sm text-gray-700 mt-1">Lees meer op <a href="${dataProps.wikipedia}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:underline">Wikipedia</a></div>`
          }
        }

        // CAI Vlaanderen
        if (dataProps.inventarisnummer || dataProps.locatie_naam) {
          if (dataProps.locatie_naam) {
            html += `<br/><span class="text-sm font-semibold">${dataProps.locatie_naam}</span>`
          }
          if (dataProps.inventarisnummer) {
            html += `<br/><span class="text-xs text-gray-500">CAI: ${dataProps.inventarisnummer}</span>`
          }
          if (dataProps.datering_tekst) {
            html += `<br/><span class="text-sm text-purple-700">${dataProps.datering_tekst}</span>`
          }
        }

        // Veengebieden
        if (dataProps.veensoort || dataProps.dikte) {
          if (dataProps.veensoort) {
            html += `<br/><span class="text-sm text-amber-700">${dataProps.veensoort}</span>`
          }
          if (dataProps.dikte) {
            html += `<br/><span class="text-xs text-gray-600">Dikte: ${dataProps.dikte}</span>`
          }
        }

        // Bretagne Archaeological Sites (Carte Archeologique Nationale)
        if (dataProps.nature && dataProps.debut) {
          html += `<br/><span class="text-sm text-purple-700">${dataProps.nature}</span>`
          const periode = dataProps.debut === dataProps.fin ? dataProps.debut : `${dataProps.debut} - ${dataProps.fin}`
          if (periode) {
            html += `<br/><span class="text-sm text-gray-700">Periode: ${periode}</span>`
          }
          if (dataProps.structure) {
            html += `<br/><span class="text-xs text-gray-600">${dataProps.structure}</span>`
          }
          if (dataProps.commune) {
            html += `<br/><span class="text-xs text-gray-500">${dataProps.commune}</span>`
          }
          if (dataProps.decouvert) {
            html += `<br/><span class="text-xs text-gray-400">Ontdekt: ${dataProps.decouvert}</span>`
          }
          if (dataProps.numero) {
            html += `<br/><span class="text-xs text-gray-400">${dataProps.numero}</span>`
          }
        }

        // Bretagne Operations (excavations/diagnostics)
        if (dataProps.NATURE_OPE || dataProps.CODE_OPERA) {
          if (dataProps.TITRE) {
            html += `<br/><span class="text-sm font-semibold">${dataProps.TITRE}</span>`
          }
          if (dataProps.NATURE_OPE) {
            html += `<br/><span class="text-sm text-amber-700">${dataProps.NATURE_OPE}</span>`
          }
          if (dataProps.AUTEUR) {
            html += `<br/><span class="text-xs text-gray-600">Auteur: ${dataProps.AUTEUR}</span>`
          }
          if (dataProps.DATE) {
            html += `<br/><span class="text-xs text-gray-500">Datum: ${dataProps.DATE}</span>`
          }
          if (dataProps.COMMUNE) {
            html += `<br/><span class="text-xs text-gray-500">${dataProps.COMMUNE}</span>`
          }
        }

        // Occitanie Heritage Sites (Sites Classes & Inscrits)
        if (dataProps.type_protection && (dataProps.n_site || dataProps.t_site)) {
          const protColor = dataProps.type_protection === 'Classe' ? 'text-red-700' : 'text-amber-700'
          html += `<br/><span class="text-sm ${protColor}">${dataProps.type_protection}</span>`
          if (dataProps.n_site) {
            html += `<br/><span class="text-sm font-semibold">${dataProps.n_site}</span>`
          }
          if (dataProps.t_site) {
            html += `<br/><span class="text-xs text-gray-600">${dataProps.t_site}</span>`
          }
          if (dataProps.c_site) {
            html += `<br/><span class="text-xs text-gray-500">Code: ${dataProps.c_site}</span>`
          }
          if (dataProps.d_creation) {
            html += `<br/><span class="text-xs text-gray-400">Beschermd sinds: ${dataProps.d_creation}</span>`
          }
        }

        // PACA Heritage Sites (Sites Classes & Inscrits)
        if (dataProps.type_protection && dataProps.cod_diren) {
          const protColor = dataProps.type_protection === 'Classe' ? 'text-red-700' : 'text-amber-700'
          html += `<br/><span class="text-sm ${protColor}">${dataProps.type_protection}</span>`
          if (dataProps.proced) {
            html += `<br/><span class="text-xs text-gray-600">${dataProps.proced}</span>`
          }
          if (dataProps.d_proced) {
            html += `<br/><span class="text-xs text-gray-500">Date: ${dataProps.d_proced}</span>`
          }
          if (dataProps.comment) {
            const comment = String(dataProps.comment).slice(0, 150)
            html += `<br/><span class="text-xs text-gray-600 italic">${comment}${String(dataProps.comment).length > 150 ? '...' : ''}</span>`
          }
        }

        // Normandie Heritage Sites (Sites Classes & Inscrits)
        if (dataProps.type_protection && dataProps.nomsite) {
          const protColor = dataProps.type_protection === 'Classe' ? 'text-red-700' : 'text-amber-700'
          html += `<br/><span class="text-sm ${protColor}">${dataProps.type_protection}</span>`
          if (dataProps.caractere) {
            html += `<br/><span class="text-xs text-gray-600">${dataProps.caractere}</span>`
          }
          if (dataProps.datedecis) {
            html += `<br/><span class="text-xs text-gray-500">Date: ${dataProps.datedecis}</span>`
          }
          if (dataProps.descriptio) {
            const desc = String(dataProps.descriptio).slice(0, 150)
            html += `<br/><span class="text-xs text-gray-600 italic">${desc}${String(dataProps.descriptio).length > 150 ? '...' : ''}</span>`
          }
        }

        // Wikimaginot - Maginot Line fortifications
        if (dataProps.secteur && dataProps.style) {
          html += `<br/><span class="text-sm text-gray-700">${dataProps.secteur}</span>`
          if (dataProps['sous-secteur']) {
            html += `<br/><span class="text-xs text-gray-600">${dataProps['sous-secteur']}</span>`
          }
          if (dataProps.description) {
            const desc = String(dataProps.description).slice(0, 150)
            html += `<br/><span class="text-xs text-gray-600 italic">${desc}${String(dataProps.description).length > 150 ? '...' : ''}</span>`
          }
          if (dataProps.url) {
            html += `<br/><a href="${dataProps.url}" target="_blank" class="text-xs text-blue-600 hover:underline">Meer info</a>`
          }
        }

        // Paris Archaeological Reference (R&CAP project)
        if (dataProps.nature_operation || dataProps.synthese) {
          if (dataProps.nature_operation) {
            html += `<br/><span class="text-sm text-red-700">${dataProps.nature_operation}</span>`
          }
          if (dataProps.responsable_operation) {
            html += `<br/><span class="text-xs text-gray-600">Responsable: ${dataProps.responsable_operation}</span>`
          }
          if (dataProps.date_operation) {
            html += `<br/><span class="text-xs text-gray-500">Datum: ${dataProps.date_operation}</span>`
          }
          // Show periods found
          const periods = []
          if (dataProps.prehistoire === 'Oui') periods.push('Prehistorie')
          if (dataProps.protohistoire === 'Oui') periods.push('Protohistorie')
          if (dataProps.antiquite === 'Oui') periods.push('Romeins')
          if (dataProps.moyen_age === 'Oui') periods.push('Middeleeuwen')
          if (dataProps.temps_modernes === 'Oui') periods.push('Moderne tijd')
          if (periods.length > 0) {
            html += `<br/><span class="text-sm text-purple-700">${periods.join(', ')}</span>`
          }
          if (dataProps.adresse) {
            html += `<br/><span class="text-xs text-gray-500">${dataProps.adresse}</span>`
          }
          if (dataProps.synthese) {
            // Truncate long text
            const synthese = String(dataProps.synthese).slice(0, 200)
            html += `<br/><span class="text-xs text-gray-600 italic">${synthese}${String(dataProps.synthese).length > 200 ? '...' : ''}</span>`
          }
        }
        if (dataProps.operator) {
          html += `<br/><span class="text-sm text-gray-600">${dataProps.operator}</span>`
        }
        if (dataProps.opening_hours) {
          const dutchHours = translateOpeningHours(String(dataProps.opening_hours))
          html += `<br/><span class="text-xs text-green-600">Open: ${dutchHours}</span>`
        }
        if (dataProps.website) {
          html += `<br/><a href="${dataProps.website}" target="_blank" class="text-xs text-blue-600 underline">Website</a>`
        }
        if (dataProps.addr_street) {
          const addr = [dataProps.addr_street, dataProps.addr_housenumber, dataProps.addr_postcode].filter(Boolean).join(' ')
          html += `<br/><span class="text-xs text-gray-500">${addr}</span>`
        }

        // Generic description fields
        const description = dataProps.description || dataProps.omschrijving ||
                           dataProps.descr || dataProps.info
        if (description && description !== name) {
          html += `<br/><span class="text-sm text-gray-600">${description}</span>`
        }

        collectedContents.push(html)
      }

      // Also query WMS layers (they may have info even with vector features)
      const viewResolution = map.getView().getResolution() || 1
      const wmsResults = await queryWMSLayers(evt.coordinate, viewResolution)
      collectedContents.push(...wmsResults)

      // If no features found anywhere, check for just height info
      const height = await heightPromise
      if (collectedContents.length === 0 && height !== null) {
        const heightHtml = `<strong class="text-blue-800">Terrein</strong>
          <br/><div class="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1">
            <span class="text-xs text-gray-400">Hoogte:</span>
            <span class="text-sm font-medium text-blue-600">${height.toFixed(2)} m NAP</span>
          </div>`
        collectedContents.push(heightHtml)
      }

      // Add height info to first popup if we have features
      if (collectedContents.length > 0 && height !== null) {
        collectedContents[0] += `<br/><div class="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1">
          <span class="text-xs text-gray-400">Hoogte:</span>
          <span class="text-sm font-medium text-blue-600">${height.toFixed(2)} m NAP</span>
        </div>`
      }

      // Show popup if we found any content
      if (collectedContents.length > 0) {
        setAllContents(collectedContents)
        setCurrentIndex(0)
        console.log(`📌 KLIK OPGESLAGEN: [${evt.coordinate[0].toFixed(0)}, ${evt.coordinate[1].toFixed(0)}]`)
        setParcelCoordinate(evt.coordinate) // Store coordinate for height map
        setShowingHeightMap(false) // Reset height map state
        setShowLayerPicker(false) // Reset layer picker
        setAddedToLayer(null) // Reset added to layer confirmation
        // Generate Google Maps URL for navigation
        const lonLat = toLonLat(evt.coordinate)
        setPopupCoordinate(lonLat) // Store lon/lat for adding to layer
        setMapsUrl(`https://www.google.com/maps/dir/?api=1&destination=${lonLat[1]},${lonLat[0]}`)
        setVisible(true)
      }
    }

    map.on('click', handleClick)

    return () => {
      map.un('click', handleClick)
    }
  }, [map])

  const handleClose = () => {
    setVisible(false)
    // Clear height map when closing popup
    if (map && showingHeightMap) {
      clearParcelHighlight(map)
      setShowingHeightMap(false)
    }
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Close if dragged down more than 100px
    if (info.offset.y > 100) {
      handleClose()
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop - tap to close */}
          <motion.div
            className="fixed inset-0 z-[1500]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Bottom Sheet */}
          <motion.div
            className="fixed bottom-0 left-0 right-0 z-[1501] bg-white rounded-t-2xl shadow-2xl"
            style={{ fontSize: `${14 * textScale / 100}px` }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header row: navigation + title + close */}
            <div className="flex items-center gap-2 px-3 pb-2 border-b border-gray-100">
              {/* Navigation buttons (only if multiple) */}
              {hasMultiple && (
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  <button
                    onClick={goToPrevious}
                    className="p-1 text-blue-500 hover:text-blue-600 transition-colors border-0 outline-none bg-transparent"
                    aria-label="Vorige laag"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-gray-500 font-medium min-w-[32px] text-center" style={{ fontSize: '0.857em' }}>
                    {currentIndex + 1}/{allContents.length}
                  </span>
                  <button
                    onClick={goToNext}
                    className="p-1 text-blue-500 hover:text-blue-600 transition-colors border-0 outline-none bg-transparent"
                    aria-label="Volgende laag"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* Title - takes remaining space */}
              <span className="flex-1 font-semibold text-gray-800 truncate" style={{ fontSize: '1em' }}>
                {extractedTitle || 'Info'}
              </span>

              {/* Add to layer button - oranje voor eigen lagen */}
              {popupCoordinate && customLayers.filter(l => !l.archived).length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowLayerPicker(!showLayerPicker)}
                    className={`p-1.5 transition-colors flex-shrink-0 border-0 outline-none bg-transparent ${
                      addedToLayer
                        ? 'text-green-500'
                        : 'text-orange-500 hover:text-orange-600'
                    }`}
                    title="Toevoegen aan mijn laag"
                    aria-label="Toevoegen aan mijn laag"
                  >
                    {addedToLayer ? <Check size={18} /> : <Plus size={18} />}
                  </button>

                  {/* Layer picker dropdown */}
                  {showLayerPicker && (
                    <div className="absolute right-0 top-8 z-50 bg-white rounded-lg shadow-md py-1 min-w-[160px] max-w-[200px]">
                      <div className="px-3 py-1 text-xs text-gray-400 font-medium">Toevoegen aan:</div>
                      {customLayers.filter(l => !l.archived).map(layer => (
                        <button
                          key={layer.id}
                          onClick={() => {
                            // Add point to layer
                            addPointToLayer(layer.id, {
                              name: extractedTitle || 'Punt',
                              category: 'Overig',
                              notes: '',
                              url: undefined,
                              coordinates: [popupCoordinate[0], popupCoordinate[1]],
                              sourceLayer: extractedTitle,
                            })
                            setShowLayerPicker(false)
                            setAddedToLayer(layer.name)
                            // Auto-hide confirmation after 2 seconds
                            setTimeout(() => setAddedToLayer(null), 2000)
                          }}
                          className="w-full px-3 py-1.5 text-left text-sm text-gray-700 hover:bg-blue-50 border-0 outline-none bg-transparent"
                        >
                          <span className="truncate">{layer.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Open in Google Maps button */}
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 text-blue-500 hover:text-blue-600 transition-colors flex-shrink-0"
                  title="Open in Google Maps"
                  aria-label="Open in Google Maps"
                >
                  <ExternalLink size={18} />
                </a>
              )}

              {/* Close button */}
              <button
                onClick={handleClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 border-0 outline-none bg-transparent"
                aria-label="Sluiten"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content - scrollable, without title */}
            <div
              className="px-4 py-3 max-h-[45vh] overflow-y-auto select-text"
              style={{ userSelect: 'text', WebkitUserSelect: 'text' }}
              dangerouslySetInnerHTML={{ __html: contentWithoutTitle }}
            />

            {/* Font size slider */}
            <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-2">
              <Type size={14} className="text-gray-400 flex-shrink-0" />
              <input
                type="range"
                min="80"
                max="150"
                value={textScale}
                onChange={(e) => handleTextScaleChange(parseInt(e.target.value))}
                className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-gray-400 w-8 text-right" style={{ fontSize: '0.857em' }}>{textScale}%</span>
            </div>

            {/* Edit/Delete buttons for vondsten */}
            {isVondst && currentVondstId && !editingVondst && (
              <div className="px-4 pb-4 flex gap-2">
                <button
                  onClick={() => {
                    const vondst = vondsten.find(v => v.id === currentVondstId)
                    if (vondst) setEditingVondst(vondst)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors border-0 outline-none"
                >
                  <Pencil size={16} />
                  <span>Bewerken</span>
                </button>
                <button
                  onClick={() => {
                    removeVondst(currentVondstId)
                    setVisible(false)
                    setCurrentVondstId(null)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors border-0 outline-none"
                >
                  <Trash2 size={16} />
                  <span>Verwijderen</span>
                </button>
              </div>
            )}

            {/* Inline edit form for vondsten */}
            {editingVondst && (
              <div className="px-4 pb-4 space-y-3 border-t border-gray-100 pt-3">
                <div className="text-sm font-medium text-blue-600">Vondst bewerken</div>
                <div>
                  <label className="text-xs text-gray-500">Objecttype</label>
                  <input
                    type="text"
                    value={editingVondst.objectType}
                    onChange={(e) => setEditingVondst({ ...editingVondst, objectType: e.target.value })}
                    className="w-full px-2 py-1 text-sm bg-gray-50 rounded border-0 outline-none focus:bg-blue-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Materiaal</label>
                  <input
                    type="text"
                    value={editingVondst.material}
                    onChange={(e) => setEditingVondst({ ...editingVondst, material: e.target.value })}
                    className="w-full px-2 py-1 text-sm bg-gray-50 rounded border-0 outline-none focus:bg-blue-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Periode</label>
                  <input
                    type="text"
                    value={editingVondst.period}
                    onChange={(e) => setEditingVondst({ ...editingVondst, period: e.target.value })}
                    className="w-full px-2 py-1 text-sm bg-gray-50 rounded border-0 outline-none focus:bg-blue-50"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Notities</label>
                  <textarea
                    value={editingVondst.notes}
                    onChange={(e) => setEditingVondst({ ...editingVondst, notes: e.target.value })}
                    className="w-full px-2 py-1 text-sm bg-gray-50 rounded border-0 outline-none focus:bg-blue-50 resize-none h-16"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingVondst(null)}
                    className="flex-1 px-3 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-0 outline-none text-sm"
                  >
                    Annuleren
                  </button>
                  <button
                    onClick={() => {
                      updateVondst(editingVondst.id, {
                        objectType: editingVondst.objectType,
                        material: editingVondst.material,
                        period: editingVondst.period,
                        notes: editingVondst.notes
                      })
                      setEditingVondst(null)
                      setVisible(false)
                    }}
                    className="flex-1 px-3 py-2 text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors border-0 outline-none text-sm"
                  >
                    Opslaan
                  </button>
                </div>
              </div>
            )}

            {/* Height map button for parcels */}
            {isParcel && parcelCoordinate && (
              <div className="px-4 pb-4 border-t border-gray-100">
                {showingHeightMap ? (
                  <button
                    onClick={handleHideHeightMap}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-0 outline-none"
                  >
                    <Mountain size={16} />
                    <span>Hoogtekaart verbergen</span>
                  </button>
                ) : (
                  <button
                    onClick={handleShowHeightMap}
                    disabled={loadingHeightMap}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 mt-3 text-white rounded-lg transition-colors border-0 outline-none ${
                      loadingHeightMap ? 'bg-blue-400 cursor-wait' : 'bg-blue-500 hover:bg-blue-600'
                    }`}
                  >
                    {loadingHeightMap ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Laden...</span>
                      </>
                    ) : (
                      <>
                        <Mountain size={16} />
                        <span>Hoogtekaart tonen</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

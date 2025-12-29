import { useEffect, useState } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import TileWMS from 'ol/source/TileWMS'
import TileLayer from 'ol/layer/Tile'
import { toLonLat } from 'ol/proj'
import proj4 from 'proj4'
import { X, ChevronLeft, ChevronRight, Mountain, Loader2, Trash2 } from 'lucide-react'
import { useMapStore } from '../../store'
import { useSettingsStore } from '../../store/settingsStore'
import { showParcelHeightMap, clearParcelHighlight } from '../../layers/parcelHighlight'
import { useLocalVondstenStore, type LocalVondst } from '../../store/localVondstenStore'
import type { MapBrowserEvent } from 'ol'

// Register RD New projection
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')

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

export function Popup() {
  const map = useMapStore(state => state.map)
  const removeVondst = useLocalVondstenStore(state => state.removeVondst)
  const fontSize = useSettingsStore(state => state.fontSize)
  const [allContents, setAllContents] = useState<string[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [visible, setVisible] = useState(false)
  const [parcelCoordinate, setParcelCoordinate] = useState<number[] | null>(null)
  const [showingHeightMap, setShowingHeightMap] = useState(false)
  const [loadingHeightMap, setLoadingHeightMap] = useState(false)
  const [currentVondstId, setCurrentVondstId] = useState<string | null>(null)

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

  const { title: extractedTitle, contentWithoutTitle } = extractTitleAndContent(content)

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

        // Special handling for RCE/Flemish WMS layers
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
              let html = `<strong class="text-green-800">Archeologisch Landschap</strong>`
              if (props.landschapsnaam || props.naam) {
                html += `<br/><span class="text-sm font-semibold">${props.landschapsnaam || props.naam}</span>`
              }
              if (props.omschrijving) {
                html += `<br/><span class="text-xs text-gray-600">${props.omschrijving}</span>`
              }
              results.push(html)
            }
          } catch (error) {
            console.warn('Archeo Landschappen WMS query failed:', error)
          }
          continue
        }

        // FAMKE Steentijd
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
              if (props.advies || props.Advies) {
                html += `<br/><span class="text-sm text-amber-700">${props.advies || props.Advies}</span>`
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

              if (props.type_onderzoek) {
                html += `<br/><span class="text-sm font-semibold">${props.type_onderzoek}</span>`
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

              // Convert type_uri to clickable hyperlink
              if (props.type_uri) {
                const linkUrl = props.type_uri.replace('type_uri:', '').trim()
                if (linkUrl.startsWith('http')) {
                  html += `<br/><a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:underline">Meer informatie →</a>`
                }
              }

              // Also check for other URI fields
              for (const [key, value] of Object.entries(props)) {
                if (key.toLowerCase().includes('uri') && typeof value === 'string' && key !== 'type_uri') {
                  const linkUrl = value.replace(/^[a-z_]+:/i, '').trim()
                  if (linkUrl.startsWith('http')) {
                    html += `<br/><a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:underline">${key.replace('_uri', '')} →</a>`
                  }
                }
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Archeo Onderzoeken WMS query failed:', error)
          }
          continue
        }

        // Special handling for IKAW (needs STYLES parameter and larger bbox for coarse raster)
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

              let html = `<strong class="text-orange-800">IKAW (2008)</strong>`
              html += `<br/><span class="text-sm text-orange-700">${label}</span>`

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

        // Militaire Objecten (RCE Linies en Stellingen)
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
              let html = `<strong class="text-stone-800">Militair Object</strong>`

              if (props.obj_soort) {
                html += `<br/><span class="text-sm font-semibold text-stone-700">${props.obj_soort}</span>`
              }
              if (props.obj_naam) {
                html += `<br/><span class="text-sm text-gray-700">${props.obj_naam}</span>`
              }
              if (props.lin_period) {
                html += `<br/><span class="text-xs text-gray-500">${props.lin_period}</span>`
              }

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

              if (props.naam || props.lin_naam) {
                html += `<br/><span class="text-sm font-semibold text-amber-700">${props.naam || props.lin_naam}</span>`
              }
              if (props.lin_period) {
                html += `<br/><span class="text-xs text-gray-500">${props.lin_period}</span>`
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

        // Terpen (Friesland)
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
              let html = `<strong class="text-orange-800">Terp</strong>`

              if (props.naam || props.NAAM) {
                html += `<br/><span class="text-sm font-semibold text-orange-700">${props.naam || props.NAAM}</span>`
              }
              if (props.plaats || props.PLAATS) {
                html += `<br/><span class="text-xs text-gray-600">${props.plaats || props.PLAATS}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Terpen WMS query failed:', error)
          }
          continue
        }

        // Religieus Erfgoed (RCE Landschapsatlas)
        if (title === 'Religieus Erfgoed') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 50
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            // Correct WMS URL matching the layer definition
            const url = `https://services.rce.geovoorziening.nl/landschapsatlas_view/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=religieuserfgoed&QUERY_LAYERS=religieuserfgoed&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
              let html = `<strong class="text-purple-800">Religieus Erfgoed</strong>`

              // Handle various field name variations
              const naam = props.naam || props.NAAM || props.name || props.NAME
              if (naam) {
                html += `<br/><span class="text-sm font-semibold text-purple-700">${naam}</span>`
              }
              const denominatie = props.denominatie || props.DENOMINATIE || props.religie
              if (denominatie) {
                html += `<br/><span class="text-sm text-gray-700">${denominatie}</span>`
              }
              const type = props.type || props.TYPE || props.functie
              if (type) {
                html += `<br/><span class="text-xs text-gray-600">${type}</span>`
              }
              const bouwjaar = props.bouwjaar || props.BOUWJAAR || props.jaar
              if (bouwjaar) {
                html += `<br/><span class="text-xs text-gray-500">Bouwjaar: ${bouwjaar}</span>`
              }
              const gemeente = props.gemeente || props.GEMEENTE || props.plaats
              if (gemeente) {
                html += `<br/><span class="text-xs text-gray-400">${gemeente}</span>`
              }

              results.push(html)
            }
          } catch (error) {
            console.warn('Religieus Erfgoed WMS query failed:', error)
          }
          continue
        }

        // Gewaspercelen (BRP)
        if (title === 'Gewaspercelen') {
          try {
            const lonLat = toLonLat(coordinate)
            const rd = proj4('EPSG:4326', 'EPSG:28992', lonLat)
            const buffer = 50
            const bbox = `${rd[0]-buffer},${rd[1]-buffer},${rd[0]+buffer},${rd[1]+buffer}`

            const url = `https://service.pdok.nl/rvo/brpgewaspercelen/wms/v1_0?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo&LAYERS=BrpGewas&QUERY_LAYERS=BrpGewas&STYLES=&INFO_FORMAT=application/json&I=50&J=50&WIDTH=100&HEIGHT=100&CRS=EPSG:28992&BBOX=${bbox}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.features && data.features.length > 0) {
              const props = data.features[0].properties
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
              let html = `<strong class="text-indigo-800">Kadastraal Perceel</strong>`

              if (props.perceelNummer || props.perceelnummer) {
                html += `<br/><span class="text-sm font-semibold text-indigo-700">${props.perceelNummer || props.perceelnummer}</span>`
              }
              if (props.kadastraleGemeenteCode || props.gemeentecode) {
                const code = String(props.kadastraleGemeenteCode || props.gemeentecode)
                const naam = KADASTRALE_GEMEENTEN[code] || code
                html += `<br/><span class="text-xs text-gray-600">Gemeente: ${naam}</span>`
              }
              if (props.sectie) {
                html += `<br/><span class="text-xs text-gray-500">Sectie: ${props.sectie}</span>`
              }
              if (props.oppervlakte) {
                html += `<br/><span class="text-xs text-gray-500">${props.oppervlakte} m²</span>`
              }

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

              results.push(html)
              continue
            }

            let html = `<strong>${title}</strong>`

            // Bodemkaart specific fields
            if (props.first_soilname || props.soilname) {
              html += `<br/><span class="text-sm text-amber-700">${props.first_soilname || props.soilname}</span>`
            }
            if (props.soilcode || props.first_soilcode) {
              html += `<br/><span class="text-xs text-gray-500">Code: ${props.soilcode || props.first_soilcode}</span>`
            }
            if (props.soilslope && props.soilslope !== 'Niet opgenomen') {
              html += `<br/><span class="text-xs text-gray-500">Helling: ${props.soilslope}</span>`
            }

            // Generic fallback for other properties
            if (!props.first_soilname && !props.soilname) {
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
        // Kastelen (OSM data) - only show "Kasteel" type if we have a real name
        if (dataProps.historic === 'castle' || dataProps.castle_type) {
          if (dataProps.name) {
            html += `<br/><span class="text-xs text-purple-600">Kasteel</span>`
          }
          if (dataProps.castle_type) {
            html += `<br/><span class="text-xs text-gray-500">Type: ${dataProps.castle_type}</span>`
          }
          if (dataProps.start_date) {
            html += `<br/><span class="text-xs text-gray-500">Bouwjaar: ${dataProps.start_date}</span>`
          }
          if (dataProps.heritage) {
            html += `<br/><span class="text-xs text-amber-600">Rijksmonument</span>`
          }
        }

        // Fossielen (PBDB data)
        if (dataProps.bron === 'Paleobiology Database') {
          if (dataProps.taxonomie && dataProps.taxonomie !== 'Onbekend') {
            html += `<br/><span class="text-xs text-amber-700">${dataProps.taxonomie}</span>`
          }
          if (dataProps.periode && dataProps.periode !== 'Onbekend') {
            html += `<br/><span class="text-sm text-purple-700">${dataProps.periode}</span>`
          }
          if (dataProps.ouderdom && dataProps.ouderdom !== 'Onbekend') {
            html += `<br/><span class="text-xs text-gray-600">Ouderdom: ${dataProps.ouderdom}</span>`
          }
          if (dataProps.aantal_fossielen) {
            html += `<br/><span class="text-xs text-green-700">Aantal fossielen: ${dataProps.aantal_fossielen}</span>`
          }
          if (dataProps.formatie) {
            html += `<br/><span class="text-xs text-gray-500">Formatie: ${dataProps.formatie}</span>`
          }
          if (dataProps.lid) {
            html += `<br/><span class="text-xs text-gray-500">Lid: ${dataProps.lid}</span>`
          }
          if (dataProps.gesteente) {
            html += `<br/><span class="text-xs text-gray-500">Gesteente: ${dataProps.gesteente}</span>`
          }
          if (dataProps.milieu) {
            html += `<br/><span class="text-xs text-blue-600">Milieu: ${dataProps.milieu}</span>`
          }
          if (dataProps.vindplaats) {
            html += `<br/><span class="text-xs text-gray-500 italic">${dataProps.vindplaats}</span>`
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
          html += `<br/><span class="text-xs text-green-600">Open: ${dataProps.opening_hours}</span>`
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
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={goToPrevious}
                    className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-full transition-colors border-0 outline-none"
                    aria-label="Vorige laag"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-xs text-gray-500 font-medium min-w-[32px] text-center">
                    {currentIndex + 1}/{allContents.length}
                  </span>
                  <button
                    onClick={goToNext}
                    className="w-7 h-7 flex items-center justify-center text-blue-600 hover:bg-blue-50 rounded-full transition-colors border-0 outline-none"
                    aria-label="Volgende laag"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* Title - takes remaining space */}
              <span className="flex-1 font-semibold text-gray-800 truncate text-sm">
                {extractedTitle || 'Info'}
              </span>

              {/* Close button */}
              <button
                onClick={handleClose}
                className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                aria-label="Sluiten"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content - scrollable, without title */}
            <div
              className={`px-4 py-3 max-h-[50vh] overflow-y-auto ${
                fontSize === 'xs' ? 'text-xs' :
                fontSize === 'small' ? 'text-sm' :
                fontSize === 'medium' ? 'text-base' :
                fontSize === 'large' ? 'text-lg' : 'text-xl'
              }`}
              dangerouslySetInnerHTML={{ __html: contentWithoutTitle }}
            />

            {/* Delete button for vondsten */}
            {isVondst && currentVondstId && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => {
                    removeVondst(currentVondstId)
                    setVisible(false)
                    setCurrentVondstId(null)
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors border-0 outline-none"
                >
                  <Trash2 size={16} />
                  <span>Vondst verwijderen</span>
                </button>
              </div>
            )}

            {/* Height map button for parcels */}
            {isParcel && parcelCoordinate && (
              <div className="px-4 pb-4 border-t border-gray-100">
                {showingHeightMap ? (
                  <button
                    onClick={handleHideHeightMap}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 mt-3 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-0 outline-none"
                  >
                    <Mountain size={16} />
                    <span>Hoogtekaart verbergen</span>
                  </button>
                ) : (
                  <button
                    onClick={handleShowHeightMap}
                    disabled={loadingHeightMap}
                    className={`w-full flex items-center justify-center gap-2 px-3 py-2 mt-3 text-sm text-white rounded-lg transition-colors border-0 outline-none ${
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

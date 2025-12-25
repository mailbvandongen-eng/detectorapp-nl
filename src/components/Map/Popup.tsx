import { useEffect, useState } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import TileWMS from 'ol/source/TileWMS'
import TileLayer from 'ol/layer/Tile'
import { toLonLat } from 'ol/proj'
import proj4 from 'proj4'
import { X } from 'lucide-react'
import { useMapStore } from '../../store'
import type { MapBrowserEvent } from 'ol'

// Register RD New projection
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')

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
  const [content, setContent] = useState<string>('')
  const [visible, setVisible] = useState(false)

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

    // Query WMS layers for feature info
    const queryWMSLayers = async (coordinate: number[], viewResolution: number) => {
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
              return html
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
              return html
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

              return html
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

              return html
            }
          } catch (error) {
            console.warn('IKAW WMS query failed:', error)
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

            // Geomorfologie specific fields
            if (props.geomorphological_area_name) {
              html += `<br/><span class="text-sm text-green-700">${props.geomorphological_area_name}</span>`
            }
            if (props.relief) {
              html += `<br/><span class="text-xs text-gray-500">Relief: ${props.relief}</span>`
            }

            // Generic fallback for other properties
            if (!props.first_soilname && !props.soilname && !props.geomorphological_area_name) {
              const skipKeys = ['geometry', 'id', 'fid', 'gml_id']
              for (const [key, value] of Object.entries(props)) {
                if (!skipKeys.includes(key) && value && value !== 'Niet opgenomen') {
                  html += `<br/><span class="text-xs text-gray-600">${key}: ${value}</span>`
                }
              }
            }

            return html
          }
        } catch (error) {
          console.warn('WMS GetFeatureInfo failed:', error)
        }
      }
      return null
    }

    // Handle map clicks
    const handleClick = async (evt: MapBrowserEvent<any>) => {
      const feature = map.forEachFeatureAtPixel(evt.pixel, f => f)

      if (feature) {
        const properties = feature.getProperties()

        // Skip geometry property
        const { geometry, ...dataProps } = properties

        // Check if this is an AMK feature - use local data (no WMS needed)
        if (dataProps.kwaliteitswaarde && dataProps.kwaliteitswaarde.includes('archeologische waarde')) {
          const amkHtml = formatAMKPopup(dataProps)
          setContent(amkHtml)
          setVisible(true)
          return
        }

        // Try to find a title/name
        const name = dataProps.name || dataProps.naam || dataProps.title ||
                     dataProps.NAAM || dataProps.NAME || dataProps.label ||
                     dataProps.route_name || dataProps.road_name || 'Info'

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

        // Speeltuinen/Parken (OSM data)
        if (dataProps.leisure) {
          const typeLabel = dataProps.leisure === 'playground' ? 'Speeltuin' : 'Park'
          html += `<br/><span class="text-xs text-gray-500">${typeLabel}</span>`
        }
        // Musea (OSM data)
        if (dataProps.tourism === 'museum' || dataProps.museum) {
          html += `<br/><span class="text-xs text-purple-600">Museum</span>`
        }
        // Strandjes/Zwemplekken (OSM data)
        if (dataProps.leisure === 'swimming_area' || dataProps.sport === 'swimming') {
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
        // Kastelen (OSM data)
        if (dataProps.historic === 'castle' || dataProps.castle_type) {
          html += `<br/><span class="text-xs text-purple-600">Kasteel</span>`
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

        // EUROEVOL Neolithic Sites
        if (dataProps.id && dataProps.id.startsWith('S') && (dataProps.country === 'Nederland' || dataProps.country === 'België')) {
          html += `<br/><span class="text-xs text-amber-800">EUROEVOL ${dataProps.id}</span>`
          if (dataProps.culture) {
            html += `<br/><span class="text-sm text-purple-700">${dataProps.culture}</span>`
          }
          if (dataProps.period) {
            html += `<br/><span class="text-sm text-gray-700">${dataProps.period}</span>`
          }
          if (dataProps.type) {
            html += `<br/><span class="text-xs text-gray-600">Type: ${dataProps.type}</span>`
          }
          html += `<br/><span class="text-xs text-gray-500">${dataProps.country}</span>`
          html += `<br/><a href="https://discovery.ucl.ac.uk/id/eprint/1469811/" target="_blank" rel="noopener noreferrer" class="text-xs text-blue-600 hover:underline">EUROEVOL Database →</a>`
        }

        // Oppida / Castella
        if (dataProps.type_site || dataProps.dating) {
          if (dataProps.type_site) {
            html += `<br/><span class="text-sm text-red-700">${dataProps.type_site}</span>`
          }
          if (dataProps.dating) {
            html += `<br/><span class="text-xs text-purple-600">${dataProps.dating}</span>`
          }
          if (dataProps.culture) {
            html += `<br/><span class="text-xs text-gray-500">${dataProps.culture}</span>`
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

        setContent(html)
        setVisible(true)
      } else {
        // No vector feature found - try WMS GetFeatureInfo
        const viewResolution = map.getView().getResolution() || 1
        const wmsHtml = await queryWMSLayers(evt.coordinate, viewResolution)

        if (wmsHtml) {
          setContent(wmsHtml)
          setVisible(true)
        }
      }
    }

    map.on('click', handleClick)

    return () => {
      map.un('click', handleClick)
    }
  }, [map])

  const handleClose = () => {
    setVisible(false)
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    // Close if dragged down more than 100px
    if (info.offset.y > 100) {
      setVisible(false)
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
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Sluiten"
            >
              <X size={20} />
            </button>

            {/* Content - scrollable */}
            <div
              className="px-4 pb-6 max-h-[50vh] overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

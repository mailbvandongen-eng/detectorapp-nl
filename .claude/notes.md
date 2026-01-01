# Detectorapp-NL - Sessienotities

## Huidige versie: 2.8.7

---

## v2.8.7 - Kompas button & slider fixes

### Wijzigingen:
1. **CompassButton** - Nieuwe component (`src/components/UI/CompassButton.tsx`)
   - Verschijnt rechtsboven onder info-knop bij rotatie >5°
   - Google Maps stijl: rood-wit kompasnaald
   - Klik om noorden te herstellen (smooth animatie)
   - Luistert naar OpenLayers `change:rotation` event

2. **Tekstgrootte sliders gefixed**
   - CSS styling voor range input thumb toegevoegd (`src/style.css`)
   - Webkit en Firefox ondersteuning
   - Sliders staan nu NAAST de titel (niet eronder)
   - T/t iconen verwijderd voor cleaner look

3. **ThemesPanel** - Slider inline naast "Kaartlagen"
4. **PresetButtons** - Slider inline naast "Presets"

---

## v2.8.6 - Font scaling & panel UI

---

## v2.7.3 - UI verbeteringen & bugfixes

### Wijzigingen:
1. **Long press menu** - Blauwe header, geen borders, consistente styling
2. **Vondst formulier** - Alle borders verwijderd, lichte achtergronden
3. **Lengte veld** toegevoegd (mm) naast gewicht
4. **Privé checkbox** verwijderd → mededeling "lokaal opgeslagen"
5. **Zoek iconen** verwijderd uit navigatie zoekresultaten
6. **Vondsten markers** schalen mee met zoom niveau (kleiner bij uitzoomen)
7. **Thema's** standaard uitgeklapt in kaartlagen panel
8. **Zoom fix** - Niet meer geblokkeerd bij open kaartlagen panel

---

## v2.7.0 - AMK Periode Filtering

### Nieuwe features:
1. **AMK per periode** - Filter monumenten op tijdperk:
   - AMK Romeins (rood): Romeinse tijd
   - AMK Steentijd (amber): Paleolithicum, Mesolithicum, Neolithicum
   - AMK Vroege ME (groen): Vroege middeleeuwen
   - AMK Late ME (blauw): Late middeleeuwen (excl. vroege)
   - AMK Overig (paars): Overige perioden

2. **Detectie preset update** - Nu standaard met AMK Monumenten + Gewaspercelen

3. **UI verbeteringen (v2.6.5-2.6.7)**:
   - Font size slider nu IN de popup zelf
   - Grotere bottom buttons (44px)
   - Consistente spacing (8px gaps)
   - BuildLabel verplaatst naar rechts

---

## v2.6.0 - Vondsten Killer App Update

### Nieuwe features:
1. **Verbeterd vondstenformulier**
   - Foto-link veld (Google Photos, iCloud, Dropbox, etc.)
   - Conditie (Uitstekend/Goed/Matig/Slecht/Onbekend)
   - Gewicht in gram

2. **Long-press = Vondst toevoegen**
   - Long-press op de kaart toont menu met "Vondst toevoegen"
   - Locatie wordt automatisch ingevuld

3. **Meerdere export formaten**
   - Excel (.xlsx) - Spreadsheet
   - CSV - Comma-separated
   - GeoJSON - GIS software
   - GPX - GPS apparaten (Garmin, etc.)
   - KML - Google Earth

4. **Dashboard met statistieken**
   - Totaal aantal vondsten
   - Gemiddelde diepte
   - Totaal gewicht
   - Grafieken per type, periode, materiaal, conditie
   - Recente vondsten overzicht

5. **Bugfix "Kies op kaart"**
   - Modal minimaliseert nu naar oranje balk onderaan
   - Gebruiker kan kaart zien en locatie kiezen

---

## Wat kan deze app?

### Kaartlagen
- **Basiskaarten:** CartoDB (licht), OpenStreetMap, PDOK Luchtfoto
- **Historische kaarten:** TMK 1850, Bonnebladen 1900 (Map5.nl)
- **Hoogtekaarten:** AHN4 Hillshade, AHN4 Hoogtekaart Kleur
- **Bodem & Geologie:** Bodemkaart, Geomorfologische kaart, Veengebieden

### Archeologische lagen
- **Monumenten:** AMK (Archeologische Monumentenkaart), Rijksmonumenten, Werelderfgoed
- **Prehistorie:** Hunebedden, Grafheuvels, Terpen, Paleokaarten (Steentijd t/m IJzertijd)
- **Romeins:** Romeinse wegen (Itiner-E), Romeinse vindplaatsen
- **Middeleeuwen:** Kastelen, Religieus erfgoed, Verdedigingswerken
- **Modern:** Bunkers, Slagvelden, Vliegvelden WO2

### Verwachtingskaarten
- **IKAW:** Indicatieve Kaart Archeologische Waarden
- **FAMKE:** Friese verwachtingskaarten (Steentijd, IJzertijd-Middeleeuwen)
- **UIKAV:** Uiterwaarden archeologische data (vlakken, expertkaart, bufferlagen)

### Perceelinfo
- Klik op kaart → perceelinfo via Kadaster
- Hoogtekaart per perceel (AHN4 geclipped naar perceelvorm)
- Eigenaar lookup

### GPS & Navigatie
- Live GPS tracking met nauwkeurigheidscirkel
- Heading-up mode (kaart draait mee met looprichting)
- Route navigatie naar geselecteerde locatie
- Adres zoeken (PDOK Locatieserver)

### Vondsten
- Vondsten toevoegen met GPS locatie of handmatig op kaart
- Lokale opslag (geen account nodig)
- Export als GeoJSON
- Markers per type (munt, fibula, gesp, etc.)

### Presets
- Voorgedefinieerde laagcombinaties (Detectie, Uiterwaarden, etc.)
- Eigen presets opslaan
- Snel wisselen tussen configuraties

### UI Features
- Opacity sliders per laag
- Zoom knoppen
- Schaalbalk (instelbaar)
- Tekstgrootte aanpasbaar (klein/normaal/groot)
- Haptic feedback (trillen)

### Beveiliging
- Wachtwoordbeveiliging voor testversies
- Uitloggen via Instellingen

---

## Versie regels

**ELKE code wijziging = versie ophogen**

Update ALLE 4 plekken:
1. `npm version patch` (package.json)
2. `src/main.tsx` - VERSION constant
3. `src/components/UI/BuildLabel.tsx` - linksboven label
4. `src/components/UI/InfoButton.tsx` - in info modal onderaan

---

## Data licenties

| Bron | Licentie |
|------|----------|
| RCE/Cultureelerfgoed | CC0/CC-BY |
| PDOK/Kadaster | CC0/CC-BY |
| OpenStreetMap | ODbL |
| Itiner-E | CC BY 4.0 |
| CARTO | CC BY 3.0 |
| Map5.nl | Kadaster |

---

## Technische notities

- Vite base path: `/detectorapp-nl/`
- StrictMode uitgeschakeld (OpenLayers compatibiliteit)
- Dutch RD projectie (EPSG:28992) via proj4
- Zustand voor state management
- Framer Motion voor animaties

---

## Commercieel gebruik - Licentie checklist

### ✅ VEILIG voor commercieel gebruik:

| Bron | Licentie | Actie |
|------|----------|-------|
| PDOK/Kadaster | CC0/CC-BY | OK |
| RCE/Cultureelerfgoed | CC0/CC-BY | OK |
| OpenStreetMap | ODbL | OK (met attributie) |
| CARTO | CC BY 3.0 | OK (met attributie) |
| Itiner-E | CC BY 4.0 | OK (met attributie) |
| Provinciale data | Open Data | OK |

### ⚠️ MOET VERVANGEN WORDEN:

| Bron | Probleem | Oplossing |
|------|----------|-----------|
| **Esri World Imagery** | Commercieel, vereist subscription | Vervang door PDOK Luchtfoto |
| **Esri World Hillshade** | Commercieel, vereist subscription | Verwijderen |

**Bestanden om aan te passen:**
- `src/components/Map/MapContainer.tsx` regel 52-60: satelliteLayer → PDOK
- `src/layers/hillshadeLayers.ts` regel 95-109: World Hillshade verwijderen
- `src/layers/layerRegistry.ts`: World Hillshade entry verwijderen

### ⚠️ PROBLEMATISCH - ahn.arcgisonline.nl

**Gebruikt voor:**
- AHN4 Hoogtekaart Kleur (belangrijkste laag!)
- AHN4 Hillshade NL
- AHN4 Multi-Hillshade
- Perceel hoogtekaart

**Onderzoek (28 dec 2024):**

| Aspect | Bevinding |
|--------|-----------|
| **AHN data zelf** | CC-0 (publiek domein) - vrij te gebruiken |
| **Esri visualisatie-service** | Gebonden aan Esri voorwaarden |
| **OSM Community** | "Geen bewijs van expliciete schriftelijke toestemming van Esri Nederland" |
| **Esri Personal Use** | Expliciet NIET voor commercieel gebruik |

**Bronnen:**
- https://www.ahn.nl/open-data → "AHN is Open Data, gratis en zonder beperkingen"
- https://community.openstreetmap.org/t/ahn-gebruiken-als-achtergrondlaag-voor-bewerken/73056
- https://www.esri.nl/nl-nl/producten/arcgis-for-personal-use

**Conclusie:** De AHN DATA is vrij, maar de Esri RENDERING SERVICE (hillshade, color ramp)
vereist waarschijnlijk een Esri licentie voor commercieel gebruik.

**Opties voor commercieel gebruik:**
1. **Vraag schriftelijke toestemming** aan Esri Nederland (content@esri.nl)
2. **Self-hosted tiles** - Genereer eigen hillshade van PDOK AHN data (arbeidsintensief)
3. **Client-side WebGL** - Render hillshade in browser van PDOK DTM tiles
4. **Alleen PDOK WMS** - Gebruik `service.pdok.nl/rws/ahn/wms` (grayscale, minder mooi)

### ✅ AL CORRECT - Map5.nl historische kaarten

`maxZoom: 14` is gezet in MapContainer.tsx (regel 83-84, 94-95).
Gebruiker kan niet verder inzoomen, ziet nooit paywall-tiles.

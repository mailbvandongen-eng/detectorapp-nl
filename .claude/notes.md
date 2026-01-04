# Detectorapp-NL - Sessienotities

## Huidige versie: 2.16.5

---

## v2.16.2 - FAMKE & IKAW popup B1 redesign

### Wijzigingen:

1. **FAMKE Steentijd popup verbeterd (B1 stijl)**
   - "Wat betekent dit?" sectie met uitleg per adviestype
   - "Wat kun je hier vinden?" sectie met vondstverwachtingen
   - "Wat is FAMKE?" algemene uitleg
   - Kleurcodering per adviestype

2. **IKAW popup verbeterd (B1 stijl)**
   - "Wat betekent dit?" sectie met trefkansuitleg
   - "Wat kun je hier vinden?" per categorie
   - "Wat is de IKAW?" algemene uitleg
   - Uitgebreide info voor alle 7 trefkanscategorieën
   - Waterbodem categorieën toegevoegd

---

## v2.16.1 - Hunebedden popup B1 redesign

### Wijzigingen:

1. **Hunebedden popup volledig herschreven in B1 taal**
   - "Wat zie je hier?" sectie met intro tekst
   - Bullet points met stenen uitleg (dekstenen, draagstenen, etc.)
   - Dynamische vraag ("Waarom is dit hunebed zo klein?", "Waarom liggen hier meerdere?", etc.)
   - "Wat is de Trechterbeker cultuur?" - standaard uitleg voor iedereen
   - "Wat is hier gevonden?" - vondsten sectie
   - "Museum in de buurt" - indien aanwezig
   - "Bezoeken" - toegankelijkheidsinfo
   - "Meer weten?" - Wikipedia link

2. **Google Maps navigatie-icoon (blauw)**
   - Automatisch beschikbaar voor alle hunebedden via header
   - Zelfde icoon als in long-press menu en adreszoekvenster

---

## v2.16.0 - Professionele popup redesign

### Wijzigingen:

1. **Google Maps navigatie-icoon in popup header**
   - Herkenbaar navigatie-icoon (Navigation2) rechts naast titel
   - Opent Google Maps met routebeschrijving naar locatie
   - Hover tooltip: "Navigeer met Google Maps"

2. **Hunebedden popup herstructureerd (B1 stijl)**
   - Professionele tekst zonder emoji's
   - Beschrijving als lopende, leesbare tekst
   - "Aanvullende informatie" sectie voor vondsten, museum, toegang
   - "Links" sectie voor Wikipedia

3. **Emoji's en pijltjes verwijderd uit alle popups**
   - Geen emoji's meer in content
   - Pijltjes (→) vervangen door duidelijke tekst
   - "Dit betekent:" voor uitleg (FAMKE)
   - "Tip:" voor aanbevelingen (IKAW)
   - "Adres:" voor locaties (bunkers)

4. **Algemene popup verbeteringen**
   - Links zonder pijltjes: "Wikipedia" i.p.v. "📖 Wikipedia →"
   - "Meer informatie" i.p.v. "Meer informatie →"
   - Consistente, professionele uitstraling

---

## v2.15.0 - Popup verbeteringen & Backlog afwerking

### Wijzigingen:

1. **World Hillshade** - minZoom: 8 toegevoegd om "Map data not yet available" te voorkomen

2. **WOII & Militair popup verbeteringen:**
   - Bunkers: Type vertaling (Munitiebunker, Schuilbunker, etc.), operator, periode, adres, website
   - Slagvelden: Historisch label, datum, Wikipedia link
   - Verdedigingslinies: Uitleg per bekende linie (Hollandse Waterlinie, Grebbelinie, etc.)

3. **FAMKE Steentijd popup:**
   - Volledige naam: "Friese Archeologische Monumentenkaart Extra"
   - Uitleg per adviestype (karterend, waarderend, quickscan, etc.)

4. **IKAW popup:**
   - Volledige naam: "Indicatieve Kaart Archeologische Waarden"
   - Extra tips per trefkans categorie

---

## v2.14.0 - Thema reorganisatie & Hunebedden verrijking

### Wijzigingen:

1. **Hunebedden verrijkt** (`public/data/steentijd/hunebedden.geojson`)
   - Alle 52 hunebedden met gedetailleerde info
   - Nieuw: period, description, stones, length, width, finds, notable, access, wikipedia, museum
   - D27 Borger gemarkeerd als GROOTSTE (22.5m, 47 stenen)
   - `layerType: "hunebed"` voor popup handling

2. **Popup voor hunebedden** (`src/components/Map/Popup.tsx`)
   - Handler voor `layerType: "hunebed"`
   - Toont alle nieuwe velden met iconen
   - Wikipedia link + Google Maps navigatie

3. **Thema reorganisatie** (`src/components/LayerControl/ThemesPanel.tsx`)
   - Paleokaarten verplaatst naar "Steentijd & Prehistorie" als subgroep
   - Sortering omgedraaid: oud → nieuw (9000 v.Chr. → 800 n.Chr.)
   - "Provinciale Kaarten" hernoemd naar "Provinciale Thema's"
   - UIKAV verplaatst naar "Archeologische lagen" als "Verwachtingen uiterwaarden"
   - "Essen" verplaatst van Erfgoed naar "Terrein & Bodem"

4. **Laagnaam gewijzigd**
   - "Romeinse wegen" hernoemd naar "Romeinse wegen (regio)"
   - Alle referenties bijgewerkt (layerRegistry, layerStore, presetStore, etc.)

---

## v2.13.1 - Subscription/Monetisatie Infrastructuur

### Nieuwe features:
1. **SubscriptionStore** (`src/store/subscriptionStore.ts`)
   - Tier systeem: `free` | `premium` | `pro`
   - Regio's: `nl` | `be` | `de` | `fr`
   - DevMode flag (nu aan voor development)
   - `isLayerUnlocked()` check per laag
   - `canAccessPremiumFeatures()` helper

2. **LayerRegistry uitgebreid** (`src/layers/layerRegistry.ts`)
   - `tier?: LayerTier` veld toegevoegd aan interface
   - `regions?: Region[]` veld toegevoegd aan interface
   - Backwards compatible (defaultt naar 'free' en ['nl'])

3. **Feature Gating in LayerItem** (`src/components/LayerControl/LayerItem.tsx`)
   - Lock icoon (amber) voor premium lagen
   - Disabled state met grijze styling
   - Tooltip "Premium laag - upgrade om te ontgrendelen"
   - Voorkomt toggle als laag gelocked is

### Tier Toewijzingen (geïmplementeerd):

**PREMIUM lagen (22):**
- TMK 1850, Bonnebladen 1900 (historische kaarten)
- Terpen
- AMK Monumenten, AMK Romeins, AMK Steentijd, AMK Vroege ME, AMK Late ME, AMK Overig
- Romeinse wegen (Wereld)
- UIKAV Punten
- AHN4 Hoogtekaart Kleur, AHN4 Hillshade NL, AHN4 Multi-Hillshade NL
- Gewaspercelen
- Fossielen Nederland, België, Duitsland, Frankrijk
- Fossiel Hotspots, Mineralen Hotspots, Goudrivieren

**FREE lagen (~44):**
- Alle andere lagen (Erfgoed, WOII, Paleokaarten, Provinciale, Recreatie, etc.)

---

## 📋 BACKLOG - Verbeteringen per thema

### 1. Steentijd & Prehistorie
- [x] **Hunebedden** - Meer popup info (grootste bij Borger, vondsten, ouderdom) + Google Maps navigatie icoon ✅ v2.14.0
- [x] **Grafheuvels** - B1 popup met regionale context (Veluwe, Drenthe, Brabant, Limburg, Utrecht) + Wikidata links ✅ v2.16.5
- [x] **FAMKE Steentijd** - B1 popup met uitleg per adviestype en vondstverwachtingen ✅ v2.16.2
- [x] **Terpen** - B1 popup met naam, uitleg, vondsten en archeologisch belang ✅ v2.16.x
- [x] **Paleokaarten** - Verplaatsen naar dit thema, sortering oud→jong ✅ v2.14.0

### 2. Archeologische lagen
- [x] **Romeinse wegen** - Hernoemen naar "Romeinse wegen (regio)" ✅ v2.14.0
- [x] **UIKAV** - Verplaatsen naar dit thema, hernoemen naar "Verwachtingen uiterwaarden" ✅ v2.14.0
- [x] **Archeo Landschappen** - B1 popup met landschapstype uitleg ✅ v2.16.4
- [x] **IKAW** - B1 popup met uitleg per trefkanscategorie en vondstverwachtingen ✅ v2.16.2
- [ ] **Alle thema's** - Legenda + uitleg toevoegen aan InfoButton (zoals Geomorfologie/Bodem)

### 3. Erfgoed & Monumenten
- [ ] **Werelderfgoed** - Toevoegen aan transparency slider, checken overlap met Rijksmonumenten
- [x] **Religieus Erfgoed** - B1 popup per type (kerk, kapel, synagoge, klooster) met geschiedenis ✅ v2.16.4
- [x] **Kastelen** - B1 popup met geschiedenis en Wikipedia links ✅ v2.16.4
- [x] **Ruïnes** - Nieuwe laag van OSM (392 items) + B1 popup ✅ v2.16.3
- [x] **Essen** - Verplaatsen naar thema "Terrein & Bodem" ✅ v2.14.0

### 4. WOII & Militair
- [x] **WWII Bunkers/Kazematten** - B1 popup met 12 bunkertypen + info ✅ v2.16.4
- [x] **Militaire Objecten** - B1 popup met type-specifieke uitleg (fort, schans, batterij, bunker, sluis, kazerne) ✅ v2.16.6
- [x] **Slagvelden** - B1 popup met historisch label en Wikipedia links ✅ v2.15.0
- [x] **Verdedigingslinies** - B1 popup met uitleg per linie ✅ v2.15.0

### 5. Hillshade & LiDAR
- [x] **World Hillshade** - minZoom: 8 ingesteld ✅ v2.15.0
- [ ] **Esri licentie** - Later uitzoeken voor commercieel gebruik

### 6. Provinciale Thema's
- [x] Hernoemen van "Provinciale Kaarten" naar "Provinciale Thema's" ✅ v2.14.0
- [ ] Voorbereiden op uitbreiding andere provincies
- [ ] Popup info aanvullen waar nodig (scheepswrakken, verdronken dorpen etc.)

### 7. Fossielen, Mineralen & Goud
- [ ] **Veel meer detail toevoegen** aan alle punten/locaties
- [ ] Per locatie: welke fossielen/mineralen, periode, geologie, toegankelijkheid, tips
- [ ] PBDB lagen: vertalen van wetenschappelijke namen, context toevoegen
- [ ] Mogelijk meer locaties toevoegen

---

### Later te doen:
- i18n setup
- PWA setup
- Betaalinfrastructuur (Stripe/Play Store)

---

## v2.13.0 - Goudrivieren laag

### Nieuwe features:
1. **Goudrivieren laag** (`src/layers/goudrivierenOL.ts`)
   - 22 locaties: 3 NL, 2 BE, 8 DE, 9 FR
   - Goud marker voor toegestaan, rood voor verboden (BE)
   - Legal status in popup (toegestaan/verboden)

---

## v2.12.0 - Mineralen Hotspots laag

### Nieuwe features:
1. **Mineralen Hotspots laag** (`src/layers/mineralenHotspotsOL.ts`)
   - 20 locaties: 8 FR, 4 BE, 8 DE
   - Kleurcode per land (blauw=FR, geel=BE, rood=DE)
   - Popup met mineralen, geologie, toegang, tips

---

## v2.11.2 - Fossiel Hotspots popup

### Wijzigingen:
1. **Popup handling** voor Fossiel Hotspots toegevoegd in Popup.tsx

---

---

## v2.10.2 - Tekstgrootte sliders verbeterd

### Wijzigingen:
1. **SettingsPanel** - Slider verplaatst naar header naast "Instellingen"
2. **ThemesPanel** - Slider breder (w-20), T/T iconen, stopPropagation
3. **PresetButtons** - Slider breder (w-16), T/T iconen, stopPropagation

---

## v2.10.1 - Bug report formulier

### Wijzigingen:
1. **"Meld een bug" knop** gekoppeld aan Google Form
   - URL: `https://forms.gle/R5LCk11Bzu5XrkBj8`
   - Toegevoegd in InfoButton (info modal)
   - Toegevoegd in SettingsPanel (footer)

---

## v2.10.0 - Kringloopwinkels & UI fixes

### Nieuwe features:
1. **Kringloopwinkels laag** (`src/layers/kringloopwinkelsOL.ts`)
   - Live data uit OpenStreetMap via Overpass API
   - ~840+ locaties in Nederland
   - 24-uur cache in localStorage (winkels die erbij komen/afgaan worden automatisch bijgewerkt)
   - Tags: `shop=second_hand`, `shop=charity`, `second_hand=yes`
   - Popup toont: naam, adres, website, openingstijden (indien beschikbaar in OSM)
   - Groen recycle-icoon

2. **Kompasknop verbeterd**
   - Nu vierkant met afgeronde hoeken (consistent met InfoButton)
   - Zelfde afmetingen als InfoButton (w-8 h-8)
   - Gepositioneerd onder InfoButton met juiste spacing
   - Blijft verschijnen bij kaartrotatie >5°

### Bestanden gewijzigd:
- `src/layers/kringloopwinkelsOL.ts` - NIEUW
- `src/layers/layerRegistry.ts` - Kringloopwinkels toegevoegd
- `src/components/LayerControl/ThemesPanel.tsx` - Toegevoegd onder Recreatie
- `src/components/UI/SettingsPanel.tsx` - Toegevoegd aan ALL_OVERLAYS (reset-knop)
- `src/components/UI/CompassButton.tsx` - Vierkante stijl, nieuwe positie

---

# 🧭 NAVIGATIE ANALYSE & VOORSTEL

## Huidige Problemen

### 1. Wiebelig gedrag (jitter)
**Oorzaak:** Meerdere conflicterende systemen:
- `useMapRotation.ts` - animatie van 250ms met easing
- `GpsMarker.tsx` - eigen rotatie logica met 5° dead-zone
- `useDeviceOrientation.ts` - 100ms throttle op compass events
- Exponential smoothing (20% new, 80% old) is te traag
- Dead-zone van 8° is te groot - zorgt voor plotselinge sprongen

### 2. GPS marker in centrum
Google Maps plaatst de marker **onderaan** het scherm (25%) zodat je vooruit kijkt.
Wij hebben marker in het **centrum**.

### 3. Conflicterende heading bronnen
- **Compass** (deviceorientation) - 60Hz, ruis, magnetische interferentie
- **GPS bearing** (coords.heading) - alleen bij beweging >0.5 m/s
- Geen goede transitie tussen bronnen

---

## Google Maps Aanpak

1. **View offset** - GPS positie zit niet in centrum, maar op 25% van onderkant
2. **Smooth rotation** - Geen discrete animaties, maar requestAnimationFrame
3. **Heading filtering** - Circular buffer met gewogen gemiddelde (laatste 5-10 samples)
4. **GPS-priority** - Bij beweging altijd GPS bearing, compass alleen bij stilstand
5. **Animatie-vrij** - Directe setRotation, geen overlappende animaties

---

## Voorgestelde Oplossing

### Fase 1: Unified Heading System
**Nieuwe `useHeading.ts` hook:**
```typescript
- Circular buffer van laatste 8 headings
- Weighted moving average (recente samples zwaarder)
- Smooth transitie GPS ↔ compass
- Geen discrete thresholds, continue updates
```

### Fase 2: View Offset bij Navigatie
**`GpsMarker.tsx` aanpassen:**
```typescript
- Bereken offset: GPS positie + 35% schermhoogte naar boven
- Bij tracking: map centreert op offset punt, niet GPS
- Marker blijft op werkelijke GPS locatie
```

### Fase 3: Animatie-vrije Rotatie
**`useMapRotation.ts` aanpassen:**
```typescript
- Geen animate() calls meer
- Direct view.setRotation() via requestAnimationFrame
- Rotation rate limiting (max 45°/sec)
- Geen conflicten tussen animaties
```

### Fase 4: Marker altijd naar boven
**`GpsMarker.tsx` aanpassen:**
- In heading-up mode: marker wijst ALTIJD omhoog (0°)
- Kaart draait, marker niet
- Geen counter-rotatie logica nodig

---

## Implementatie Impact

| Bestand | Wijziging |
|---------|-----------|
| `src/hooks/useHeading.ts` | NIEUW - Unified heading met circular buffer |
| `src/hooks/useMapRotation.ts` | Herschrijven - animatie-vrij, direct rotation |
| `src/components/GPS/GpsMarker.tsx` | View offset + vaste marker rotatie |
| `src/store/gpsStore.ts` | Vereenvoudigen heading state |
| `src/hooks/useDeviceOrientation.ts` | Koppelen aan nieuwe useHeading |

---

## Alternatief: Simpelere Quick-Fix

Als volledige herstructurering te groot is:
1. **Hogere smoothingFactor** (0.4 ipv 0.2) - snellere response
2. **Kleinere dead-zone** (3° ipv 8°) - minder sprongen
3. **Langere animatie** (400ms ipv 250ms) - soepeler
4. **Disable compass indoor** - alleen GPS bearing

---

**Wil je dat ik de volledige herstructurering (Fase 1-4) implementeer, of eerst de quick-fix proberen?**

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

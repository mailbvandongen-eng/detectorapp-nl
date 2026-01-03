# Detectorapp-NL - Sessienotities

## Huidige versie: 2.10.2

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

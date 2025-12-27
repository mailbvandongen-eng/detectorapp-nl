# Detectorapp-NL - Sessienotities

## 🚨 VERSIE REGEL (27 dec 2024) - LOCKED!
**HUIDIGE VERSIE: 2.5.30** ✅ Gepusht naar GitHub

### DE REGEL (ALTIJD VOLGEN):
1. **ELKE code wijziging = versie ophogen**
2. Volgende versie wordt: **2.5.31**
3. **UPDATE ALLE 4 PLEKKEN:**
   - `npm pkg set version=X.X.X` (package.json)
   - `src/main.tsx` → VERSION const
   - `src/components/UI/BuildLabel.tsx` → "bvd vX.X.X"
   - `src/components/UI/InfoButton.tsx` → "Detectorapp NL vX.X.X"
4. Gebruiker moet ALTIJD kunnen zien welke versie ze testen!

### NIET DOEN:
- NOOIT 2.6.x gebruiken
- NOOIT versie VERLAGEN
- NOOIT code wijzigen zonder versie bump

---

## ✅ v2.5.17 - Lokale Vondsten (27 dec 2024)

### Nieuwe features:
1. **Lokale vondsten opslag** - Vondsten worden nu lokaal opgeslagen (localStorage)
2. **Geen login nodig** - Direct vondsten toevoegen zonder Firebase account
3. **Vondst markers op kaart** - Gekleurde markers per type (munt=amber, fibula=paars, etc.)
4. **Toggle in instellingen** - Keuze tussen lokaal of cloud opslag
5. **Vondst knop** - Oranje + knop rechtsonder om vondsten toe te voegen

### Nieuwe bestanden:
- `src/store/localVondstenStore.ts` - Zustand store met localStorage persist
- `src/components/Vondst/LocalVondstMarkers.tsx` - Markers op de kaart

---

## ✅ v2.5.16 - UI Verbeteringen (27 dec 2024)

### Wat is gefixt:
1. **Perceel hoogtekaart** - Nu 50cm resolutie + dynamische Color Ramp D (als AHN4 laag)
2. **AHN4 Hoogtekaart Kleur** - Nieuwe laag toegevoegd (50cm + Color Ramp D)
3. **Reset knop** - Nieuwe laag toegevoegd aan ALL_OVERLAYS
4. **Opacity slider** - Nieuwe laag toegevoegd aan slider lijst
5. **Zoom knoppen** - Hoger geplaatst (top-2.5 i.p.v. top-14)
6. **Info knop** - Kleur veranderd van blauw naar grijs
7. **Visuele indicator** - LayerGroups tonen nu aantal actieve lagen als ingeklapt

### Nog te doen:
- Polygon clipping voor perceel hoogtekaart (werkt nog niet perfect)

---

## 🚨 URGENTE BUG - Perceel Hoogtekaart (27 dec 2024)
**Versie:** v2.5.3

### Probleem:
De "Hoogtekaart" knop bij landbouwpercelen werkt NIET correct:
1. **Altijd hetzelfde perceel** - ongeacht waar gebruiker klikt, toont steeds hetzelfde perceel
2. **Verkeerde visualisatie** - was grayscale hillshade, moet GEKLEURDE hoogtekaart zijn (blauw=laag → groen → oranje=hoog)
3. **Geen polygon clipping** - toont rechthoek i.p.v. perceelvorm

### Wat al gedaan is:
- Debug logging toegevoegd in `src/layers/parcelHighlight.ts`
- Rendering rule gewijzigd naar `AHN - Color Ramp C` (gekleurd)
- proj4 geregistreerd met OpenLayers via `register(proj4)`
- Versie logging in `src/main.tsx` (console toont `🚀 DetectorApp v2.6.1`)

### Screenshots ter referentie:
- `C:\VSCode\_Screenshots\hoogtekaart.png` - ZO MOET HET (van boerenbunder.nl)
- `C:\VSCode\_Screenshots\fout.png` - ZO IS HET NU (fout)
- `C:\VSCode\_Screenshots\knipsel.png` - Ook fout, zelfde probleem

### Hoe boerenbunder.nl het doet:
- ArcGIS ImageServer: `https://ahn.arcgisonline.nl/arcgis/rest/services/Hoogtebestand/AHN4_DTM_5m/ImageServer`
- Rendering rules voor kleur: `AHN - Color Ramp A/B/C/D` (blauw→groen→geel→bruin)
- Ze clippen de hoogtekaart naar de EXACTE perceelvorm (polygon), niet bbox

### Nog te debuggen:
1. Check console output wanneer gebruiker klikt - veranderen de RD coördinaten?
2. Als RD coords niet veranderen → proj4 transformatie faalt
3. Als RD coords WEL veranderen → WFS bug of cache issue
4. Implementeer echte polygon clipping (canvas clip of server-side)

### Relevante bestanden:
- `src/layers/parcelHighlight.ts` - Hoofd logica
- `src/components/Map/Popup.tsx` - Roept showParcelHeightMap aan (regel ~101)

---

## 🚨 BELANGRIJKE REGEL - VERSIE BUMPEN!
**Bij ELKE nieuwe feature of bugfix:**
1. `npm version patch` (of minor/major)
2. Update VERSION in `src/main.tsx`
3. Gebruiker ziet `🚀 DetectorApp vX.X.X` in console
4. Zonder dit kan gebruiker niet zien of nieuwe code geladen is!

---

## Vorige sessie voltooide taken (25 dec):
1. AMK data volledig lokaal opgeslagen (13.010 monumenten)
2. Google Hybrid vervangen door PDOK Luchtfoto (CC0)
3. EUROEVOL verwijderd
4. Info & Attributies pagina toegevoegd
5. Privacy policy toegevoegd

## Data licenties (veilig voor commercieel gebruik):
- RCE/Cultureelerfgoed: CC0/CC-BY
- PDOK/Kadaster: CC0/CC-BY
- AHN via ArcGIS: Esri Nederland
- OpenStreetMap: ODbL (met attributie)

## Technische notities:
- Vite base path: `/detectorapp-nl/`
- StrictMode uitgeschakeld (OpenLayers compatibiliteit)
- Dutch RD projectie (EPSG:28992) geregistreerd via proj4

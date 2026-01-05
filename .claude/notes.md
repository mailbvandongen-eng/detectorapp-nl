# Detectorapp-NL - Sessienotities

## Huidige versie: 2.26.3

---

## ⚠️ VERSIE BUMP CHECKLIST - ALTIJD VOLGEN! ⚠️

Bij elke code wijziging **ALTIJD** deze 3 plekken updaten:

| # | Bestand | Wat updaten |
|---|---------|-------------|
| 1 | Terminal | `npm version patch` (of minor/major) |
| 2 | `src/main.tsx` | `const VERSION = 'X.X.X'` |
| 3 | `src/components/UI/HamburgerMenu.tsx` | `DetectorApp NL v{X.X.X}` |

**Test na bump:** `npm run build` moet slagen!

---

## ⚠️ UI STYLING REGELS - STRICT VOLGEN! ⚠️

### Icon Buttons (ONZICHTBAAR - alleen icoon)
Gebruik voor popup iconen, toolbar iconen, etc. die GEEN zichtbare achtergrond moeten hebben:
```tsx
className="p-1.5 border-0 outline-none bg-transparent text-{color}-500 hover:text-{color}-600 transition-colors"
```

**NOOIT toevoegen aan icon buttons:**
- `bg-white` of `bg-white/80`
- `shadow-*`
- `rounded-*` met achtergrond
- `backdrop-blur-*`

### Zichtbare Knoppen (met achtergrond)
Alleen voor hoofdknoppen zoals GPS, Info, Zoom buttons:
```tsx
className="bg-white/80 hover:bg-white/90 rounded-xl shadow-sm backdrop-blur-sm"
```

### Voorbeeld: Popup Header Iconen
```tsx
// GOED - subtiel, alleen icoon
<button className="p-1.5 border-0 outline-none bg-transparent text-orange-500 hover:text-orange-600">
  <Plus size={18} />
</button>

// FOUT - vierkant met rand
<button className="w-7 h-7 bg-white/80 rounded-lg shadow-sm">
  <Plus size={18} />
</button>
```

---

## v2.22.0 - Google Sign-In & Cloud Sync

### Nieuwe features:
1. **Google Sign-In** - Inloggen met Google account
   - `src/store/authStore.ts` - Auth state management
   - `src/components/Auth/GoogleSignInButton.tsx` - Login knop
   - Account sectie in SettingsPanel

2. **Cloud Sync** - Automatische synchronisatie naar Firestore
   - `src/hooks/useCloudSync.ts` - Sync hook met debouncing
   - Synct: Mijn Lagen (CustomPointLayers) + Vondsten
   - Merge strategie bij eerste login (local + cloud)
   - 2 seconden debounce om API calls te beperken

3. **Firebase Setup**
   - Project: `detectorapp-nl`
   - Auth: Google Sign-In provider
   - Database: Firestore (nam5 region)
   - Credentials in `.env`

---

## v2.20.0 - Commercieel gebruik voorbereid

### Esri lagen vervangen/verwijderd:
- **Luchtfoto** → PDOK Luchtfoto RGB 8cm (gratis, CC-BY)
- **World Hillshade** → Verwijderd (Esri commercieel)
- **AHN Esri lagen** → Blijven (wachten op Esri antwoord)

### Technisch:
- MapContainer.tsx: PDOK WMTS i.p.v. Esri World Imagery
- layerRegistry.ts: World Hillshade entry verwijderd
- ThemesPanel, LayerStore, PresetStore: World Hillshade verwijderd

---

## v2.19.1 - Wandelroutes als lijn-routes op de kaart

### Nieuwe laag: Wandelroutes (met GPX lijnen!)
- **8 wandelroutes** getekend als lijnen op de kaart (7 NL + 1 BE)
- **GPX bestanden** geladen en geparsed naar LineString geometrie
- Bron: routezoeker.com GPX downloads
- Groene lijnen voor NL, oranje voor BE
- Startpunt markers met routenaam

### Routes met lijn op kaart:
- Sint-Pietersberg (10.8 km) - Maastricht, Limburg
- Utrechtse Heuvelrug (15 km) - Driebergen-Zeist
- Noord-Hollands Duinreservaat (15 km) - Castricum
- Kennemerduinen (16 km) - Santpoort-Noord
- Duinwandeling Zoutelande (5.8 km) - Zeeland
- Duinen van Renesse (12.2 km) - Zeeland
- Schiedam Jeneverstad (19 km) - Delft
- Vloethemveld (8.7 km) - Zedelgem, België

### Technisch:
- GPX parsing met DOMParser
- `<trkpt lat="" lon="">` coordinaten naar LineString
- VectorLayer met zIndex 850
- Witte outline voor contrast

---

## v2.19.0 - Wandelroutes laag (startpunten)

### Popup verbeteringen (B1 stijl fix):
- Alle emoji's verwijderd uit fossiel/mineralen/goud popups
- Duidelijke secties: "Wat kan ik er vinden?", "Hoe kom ik er?"
- Toegang/regels nu in gewone tekst (rood voor verboden)

---

## v2.18.0 - Fossielen, Mineralen & Goud uitbreiding

### Nieuwe locaties toegevoegd:

1. **Fossiel Hotspots** (10 → 43 locaties)
   - Nieuwe NL locaties: Winterswijk, Maastricht, Kunrade, Noordzeestrand, IJsselmeerbodem
   - Nieuwe BE locaties: Kesselt, Lanaye, Blegny, Raeren, Voeren
   - Nieuwe DE locaties: Neandertal, Solnhofen, Eichstätt, Rüdersdorf, Rügen, Harzrand
   - Nieuwe FR locaties: Calais, Wimereux, Boulogne, Charleville-Mézières

2. **Mineralen Hotspots** (16 → 41 locaties)
   - **7 nieuwe NL locaties:** Sint Pietersberg, ENCI-groeve, Kunrade, Winterswijk, Maas/Rijngrind, IJsselmeerbodem, Noordzeestrand
   - Meer DE locaties: Siegerland, Sauerland, Harz, Vogelsberg, Kaiserstuhl
   - Meer FR locaties: Auvergne vulkaangebied, Le Puy, Haute-Loire
   - LayerRegistry geüpdatet: nu ook 'nl' regio

3. **Goudrivieren** (21 → 44 locaties)
   - Meer NL locaties: Rijn bij Lobith, Waal bij Nijmegen, Maas bij Maastricht/Venlo, IJssel bij Zutphen
   - Meer DE locaties: Rhein bei Neuenburg, Grümpen, Isar, Salzach, Elz, Nagold
   - Meer FR locaties: Gardon, Chassezac, Garonne, Orb, Giffre, Ain, Tech, Dordogne, Allier

### Popup verbeteringen (B1-stijl):

1. **PBDB Fossielen popup** - Verbeterd met Nederlandse vertalingen:
   - Taxonomie uitleg: "Mollusca" → "weekdieren (schelpen, slakken)"
   - Periode uitleg: "Krijt" → "145-66 miljoen jaar geleden"
   - Gesteente vertaling: "limestone" → "kalksteen"
   - Milieu vertaling: "marine" → "zee"
   - Emoji iconen voor betere leesbaarheid

2. **Fossiel Hotspots popup** - Verrijkt:
   - Landvlag (🇳🇱🇧🇪🇩🇪🇫🇷) met landnaam
   - Type locatie met icoon (⛏️ groeve, 🏖️ strand, etc.)
   - Geologie veld toegevoegd (🪨)
   - Toegang/regels met kleurcodering (✅ groen / 🚫 rood)
   - Tips met 💡 icoon

3. **Mineralen Hotspots popup** - Verrijkt:
   - Landvlag met landnaam
   - Mineralen met 💎 icoon
   - Geologie, toegang en tips velden

4. **Goudrivieren popup** - Verrijkt:
   - Landvlag met landnaam
   - Rivier met 🏞️ icoon
   - Goudtype met ✨ icoon
   - Herkomst met 🏔️ icoon

### Kleurcodering per land:
- 🇳🇱 Nederland: Oranje
- 🇧🇪 België: Geel
- 🇩🇪 Duitsland: Zwart/Rood
- 🇫🇷 Frankrijk: Blauw

---

## v2.16.8 - Nieuwe iconen voor kaartlagen

### Wijzigingen:

1. **Nieuwe custom 24x24 SVG iconen toegevoegd aan iconStyles.ts:**
   - `dolmen` (hunebedden): drie stenen met deksteen
   - `church` (religieus erfgoed): kerk met toren
   - `crossedSwords` (slagvelden): gekruiste zwaarden
   - `ammonite` (fossielen): spiraalschelp
   - `sharkTooth` (haaientanden): haaientand driehoek
   - `crystal` (mineralen): kristalvorm

2. **Iconen bijgewerkt in LAYER_STYLES:**
   - Hunebedden: dolmen icoon (was: landmark)
   - Fossielen: ammonite icoon (was: bone)
   - Slagvelden: crossedSwords icoon + LAYER_STYLES (was: inline star SVG)

3. **Nieuwe layer styles toegevoegd:**
   - `church()` - paars voor religieus erfgoed
   - `slagveld()` - rood voor slagvelden
   - `ammonite()` - amber voor fossielen
   - `sharkTooth()` - grijs voor haaientanden
   - `mineral()` - paars voor mineralen

---

## 🎯 PRODUCT VISIE - ONTHOUDEN!

**Dit is geen gewone app. Dit wordt DE killer app voor AMATEURS en LIEFHEBBERS.**
(Professionals hebben hun eigen specialistische tools - wij richten ons op de hobbyisten!)

### Voor wie is de DetectorApp interessant?

🔍 **Metaaldetectoristen** (primaire doelgroep)
Zoeken naar munten, sieraden, militaria. Gebruiken de app om kansrijke locaties te vinden via historische kaarten, AHN-hoogtedata en archeologische lagen.

🏛️ **Amateur-archeologen**
Geïnteresseerd in de geschiedenis onder hun voeten. Willen weten waar nederzettingen, grafheuvels, hunebedden of Romeinse wegen lagen.

🦈 **Fossielen- en mineraalzoekers**
Zoeken naar haaientanden, schelpen, ammonieten en bijzondere stenen. Actief in riviergebieden, groeves en aan de kust.

🎖️ **Militaria-verzamelaars & WOII-onderzoekers**
Onderzoeken bunkers, slagvelden, vliegveldlocaties en verdedigingslinies uit de Tweede Wereldoorlog.

🚶 **Wandelaars & natuurliefhebbers**
Willen het landschap beter begrijpen tijdens een wandeling. Wat zijn die bulten in het bos? Waarom ligt hier een dijk?

📚 **Historici & heemkundigen**
Lokale geschiedenisvorsers die oude kaarten, verdwenen dorpen, kloosters en historische infrastructuur onderzoeken.

🎓 **Studenten**
Archeologie-, geschiedenis- en aardrijkskundestudenten die de app als leerinstrument gebruiken.

👨‍👩‍👧 **Gezinnen & educatie**
Ouders die met kinderen op ontdekking gaan. De app maakt geschiedenis tastbaar en leuk.

**Kort gezegd:** Iedereen die nieuwsgierig is naar wat er onder en op de Nederlandse bodem te vinden is – van amateur-onderzoeker tot zondagse schatzoeker.

---

## 📝 POPUP KWALITEITSSTANDAARD - KRITISCH!

### Wat NIET mag:
- Generieke tekst die overal hetzelfde is
- Alleen "Wikipedia" als link zonder context
- Oppervlakkige info zonder echte feiten
- Tekst die geen waarde toevoegt

### Wat WEL moet:
1. **Locatie-specifieke info** - Zoek op wat er ECHT op die plek is
2. **Concrete feiten** - Aantallen, afmetingen, jaartallen, namen
3. **Historische context** - Waarom is dit hier? Wat gebeurde er?
4. **Menselijk verhaal** - Wat betekende dit voor mensen?
5. **Wat kun je zien/doen** - Praktische info voor bezoekers
6. **BRONNEN** - Altijd met klikbare links zodat mensen verder kunnen leren

### Voorbeeld goede popup (Bunkers Scheveningen):
```
Wat zijn dit voor bunkers?
In de Tweede Wereldoorlog bouwden de Duitsers hier veel bunkers.
Dit was onderdeel van de Atlantikwall: een lange verdedigingsmuur
langs de hele kust van Europa.

Wat kun je zien?
• Ongeveer 80 bunkers liggen in de duinen bij Scheveningen
• De muren zijn soms 3 meter dik beton
• Er zijn ondergrondse gangen tussen de bunkers
• Sommige bunkers kun je bezoeken

Waarom hier?
Scheveningen was belangrijk voor de Duitsers. Ze waren bang dat
de geallieerden hier zouden landen. Daarom bouwden ze een
commandocentrum met 13 bunkers in de Scheveningse Bosjes.

Wat gebeurde er met de mensen?
De Duitsers sloopten hele wijken voor de bunkers. 138.000 mensen
uit Den Haag en Scheveningen moesten hun huis verlaten.

Bronnen
• Atlantikwall Museum Scheveningen (Wikipedia)
• TracesOfWar
```

### Bronnen altijd meenemen:
- Wikipedia (Nederlandse versie waar mogelijk)
- TracesOfWar (voor WOII)
- Rijksmonumenten database
- Lokale musea/erfgoed sites
- Officiële overheidsdata

**Het mag tijd kosten om info op te zoeken. Kwaliteit > snelheid.**

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
- [x] **Veel meer detail toevoegen** aan alle punten/locaties ✅ v2.18.0
- [x] Per locatie: welke fossielen/mineralen, periode, geologie, toegankelijkheid, tips ✅ v2.18.0
- [x] PBDB lagen: vertalen van wetenschappelijke namen, context toevoegen ✅ v2.18.0
- [x] Mogelijk meer locaties toevoegen (43 fossiel, 41 mineraal, 44 goud) ✅ v2.18.0

---

### 8. Wandelroutes verbetering
- [ ] **Wandelnet.nl integratie** - Bron: wandelnet.nl/wandelroute-zoeken
  - Markers met clustering (zoals wandelnet.nl)
  - Hover over marker → route lijn verschijnt
  - Veel meer routes beschikbaar dan routezoeker.com
  - Clustering tot bepaald zoomniveau

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

### ✅ OPGELOST (v2.20.0):

| Bron | Probleem | Status |
|------|----------|--------|
| **Esri World Imagery** | Commercieel | ✅ Vervangen door PDOK Luchtfoto 8cm |
| **Esri World Hillshade** | Commercieel global | ✅ Verwijderd |

### ⏳ WACHTEN OP ESRI - ahn.arcgisonline.nl

**Status:** Email gestuurd naar Esri Nederland, wachten op antwoord.

**Gebruikt voor:**
- AHN4 Hoogtekaart Kleur (belangrijkste laag!)
- AHN4 Hillshade NL
- AHN4 Multi-Hillshade
- Perceel hoogtekaart

**Achtergrond:**
- AHN DATA zelf is CC-0 (publiek domein) - vrij te gebruiken
- Esri visualisatie-service (hillshade, color ramp) vereist mogelijk licentie
- Deze lagen zijn premium-only, dus alleen voor betalende gebruikers

**Als Esri NEE zegt:**
1. Self-hosted tiles genereren van PDOK AHN data
2. Client-side WebGL hillshade rendering
3. Alleen PDOK WMS grayscale gebruiken

### ✅ AL CORRECT - Map5.nl historische kaarten

`maxZoom: 14` is gezet in MapContainer.tsx (regel 83-84, 94-95).
Gebruiker kan niet verder inzoomen, ziet nooit paywall-tiles.

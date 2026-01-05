# Project Notes voor Claude

## ⚠️ PROJECT IDENTIFICATIE
**Dit is: DETECTORAPP-NL** - Alleen Nederlandse lagen
- GitHub repo: `detectorapp-nl`
- Vite base path: `/detectorapp-nl/`
- Directory: `C:\VSCode\detectorapp-nl`

**Let op:** Er bestaat ook `webapp` (detectorapp-v3) - internationale versie met NL/BE/DE/FR!

## EERSTE ACTIE BIJ NIEUWE SESSIE
**Lees ALTIJD eerst `.claude/notes.md` voor lopende taken, plannen en context uit vorige sessies!**

## 🚨 VERSIE BUMPEN - ALTIJD ALLE 4 PLEKKEN!
**Bij ELKE wijziging, update ALLE 4 plekken:**
1. `npm version patch` (of minor/major) → `package.json`
2. `src/main.tsx` → `const VERSION = 'X.X.X'`
3. `src/components/UI/BuildLabel.tsx` → `v2.X.X` (linksboven op scherm)
4. `src/components/UI/InfoButton.tsx` → `DetectorApp NL vX.X.X` (in info modal)

**Check met:** `grep -rn "2\.[0-9]" package.json src/main.tsx src/components/UI/BuildLabel.tsx src/components/UI/InfoButton.tsx`

## Belangrijke Regels
- **ALTIJD pushen naar GitHub na elke wijziging + versie bump**
- Screenshots staan in: `C:\VSCode\_Screenshots`
- Vite base path is `/detectorapp-nl/` - alle data paden moeten `/detectorapp-nl/data/...` zijn

## Dutch RD Shapefiles (EPSG:28992)

Nederlandse overheidsdata komt vaak in Rijksdriehoek (RD) coördinaten. Herken dit aan:
- Coördinaten zoals `[155000, 463000]` of `[207260, 474100]`
- X tussen ~7000-300000, Y tussen ~289000-629000

### Oplossing voor OpenLayers:

```typescript
import { register } from 'ol/proj/proj4'
import proj4 from 'proj4'

// Register Dutch RD projection (EPSG:28992)
proj4.defs('EPSG:28992', '+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs')
register(proj4)

// Bij het laden van GeoJSON:
const source = new VectorSource({
  features: new GeoJSON().readFeatures(geojson, {
    dataProjection: 'EPSG:28992',      // Bron is RD
    featureProjection: 'EPSG:3857'     // Doel is Web Mercator
  })
})
```

## React StrictMode
StrictMode is UITGESCHAKELD in `main.tsx` omdat het OpenLayers breekt (double-render van effects).

## Layer Paden
Alle layer files moeten `/detectorapp-nl/data/...` gebruiken, NIET `/data/...`

## 🎨 MODAL TEMPLATE - ALTIJD GEBRUIKEN!

**Elke modal/venster MOET dit template volgen (zoals Instellingen):**

### Container:
```tsx
className="fixed inset-4 z-[1701] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-w-sm mx-auto my-auto max-h-[85vh]"
```

### Header (met font slider!):
```tsx
<div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
  <div className="flex items-center gap-2">
    <Icon size={18} />
    <span className="font-medium">Titel</span>
  </div>
  <div className="flex items-center gap-2">
    {/* Font size slider - ALTIJD TOEVOEGEN */}
    <span className="text-[10px] opacity-70">T</span>
    <input
      type="range" min="80" max="150" step="10"
      value={settings.fontScale}
      onChange={(e) => settings.setFontScale(parseInt(e.target.value))}
      className="header-slider w-16 opacity-70 hover:opacity-100 transition-opacity"
    />
    <span className="text-xs opacity-70">T</span>
    <button onClick={onClose} className="p-1 rounded hover:bg-white/20 transition-colors border-0 outline-none ml-1">
      <X size={18} />
    </button>
  </div>
</div>
```

### Content (met font scaling):
```tsx
const baseFontSize = 14 * settings.fontScale / 100

<div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ fontSize: `${baseFontSize}px` }}>
```

### Input velden - GEEN BORDERS!
```tsx
// ❌ FOUT - geeft zwarte lijnen:
className="border border-gray-300"

// ✅ GOED - clean look:
className="w-full px-3 py-2 bg-gray-100 rounded-lg border-0 outline-none focus:ring-2 focus:ring-blue-500"
style={{ fontSize: '1em' }}
```

### Labels:
```tsx
<label className="block font-medium text-gray-700 mb-1" style={{ fontSize: '0.9em' }}>
```

### Footer buttons:
```tsx
<div className="p-4 flex gap-3" style={{ fontSize: `${baseFontSize}px` }}>
  <button className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border-0 outline-none">
  <button className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors border-0 outline-none">
```

### Checklist nieuwe modal:
- [ ] `useSettingsStore` importeren
- [ ] `baseFontSize` berekenen
- [ ] Font slider in header
- [ ] GEEN `border border-gray-300` op inputs
- [ ] WEL `bg-gray-100 border-0 outline-none` op inputs
- [ ] Em-based font sizes (0.9em, 1em, 0.75em)

# Project Notes voor Claude

## ⚠️ PROJECT IDENTIFICATIE
**Dit is: DETECTORAPP-NL** - Alleen Nederlandse lagen
- GitHub repo: `detectorapp-nl`
- Vite base path: `/detectorapp-nl/`
- Directory: `C:\VSCode\detectorapp-nl`

**Let op:** Er bestaat ook `webapp` (detectorapp-v3) - internationale versie met NL/BE/DE/FR!

## EERSTE ACTIE BIJ NIEUWE SESSIE
**Lees ALTIJD eerst `.claude/notes.md` voor lopende taken, plannen en context uit vorige sessies!**

## Belangrijke Regels
- **NOOIT pushen naar GitHub zonder expliciete toestemming**
- Screenshots staan in: `C:\VSCode\_Screenshots`
- Vite base path is `/webapp/` - alle data paden moeten `/webapp/data/...` zijn

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

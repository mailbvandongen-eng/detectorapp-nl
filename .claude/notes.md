# Detectorapp-NL - Sessienotities

## Huidige Status (25 dec 2024)
**Versie:** v2.0.1

## Voltooide taken deze sessie:
1. AMK data volledig lokaal opgeslagen (13.010 monumenten met alle tekst)
2. Google Hybrid vervangen door PDOK Luchtfoto (CC0)
3. EUROEVOL verwijderd (onduidelijke academische licentie)
4. Vici.org data verwijderd (Castella, Oppida - CC BY-SA ShareAlike)
5. Info & Attributies pagina toegevoegd
6. Privacy policy toegevoegd
7. GPS standaard uit bij opstarten
8. UI layout: preset/reset knoppen links, info knop rechtsboven

## Verwijderd uit UI maar DATA BEWAARD voor later:
- **Archeo Onderzoeken** - Layer file blijft bestaan in `src/layers/pdokWMSLayers.ts`
  - WMS: `https://data.geo.cultureelerfgoed.nl/openbaar/wms`
  - Layer: `archeologische_onderzoeksmeldingen_openbaar_rd`
  - Reden: Nog niet nodig, mogelijk later toevoegen

## Nog te doen (uit oorspronkelijk plan):
Zie: `C:\Users\bobva\.claude\plans\glistening-sniffing-cerf.md`

### Volgende stappen:
1. [ ] Verdere UI polish indien nodig
2. [ ] Build voor productie testen
3. [ ] PWA manifest en icons checken voor app store

## Data licenties (veilig voor commercieel gebruik):
- RCE/Cultureelerfgoed: CC0/CC-BY
- PDOK/Kadaster: CC0/CC-BY
- OpenStreetMap: ODbL (met attributie)
- Itiner-E Romeinse wegen: CC BY 4.0
- CARTO: CC BY 3.0
- Map5.nl: Kadaster

## Technische notities:
- Vite base path: `/detectorapp-nl/`
- StrictMode uitgeschakeld (OpenLayers compatibiliteit)
- Dutch RD projectie (EPSG:28992) geregistreerd via proj4

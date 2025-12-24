# Detectorkaart V4

Modern rebuild of the archaeological detector map application using Vite.

## Status: In Development

V4 is a complete rewrite of V3 using modern build tools and modular architecture.

### Completed
- ✅ Vite project setup with configuration
- ✅ Basic Leaflet map initialization
- ✅ Data files copied from V3 (43MB archaeological data)
- ✅ Modular layer system architecture
- ✅ AMK Monumenten layer module (TopoJSON support)
- ✅ Romeinse wegen (Itiner-E) layer module
- ✅ Layer loader utilities
- ✅ Dev server working on http://localhost:3001/webapp/

### Project Structure
```
webapp/
├── public/
│   └── data/           # Archaeological GeoJSON/TopoJSON files (43MB)
├── src/
│   ├── config/         # Layer metadata configuration
│   ├── layers/         # Individual layer modules
│   │   ├── amk.js     # AMK Monumenten
│   │   └── romeins.js # Romeinse wegen
│   ├── utils/          # Utilities
│   │   └── layerLoader.js
│   ├── main.js         # Application entry point
│   └── style.css       # Global styles
├── index.html
├── vite.config.js
└── package.json
```

### Technology Stack
- **Build Tool**: Vite 7.3.0
- **Mapping**: Leaflet 1.9.4
- **Clustering**: leaflet.markercluster 1.5.3
- **Data**: TopoJSON Client 3.1.0

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Next Steps
1. Add remaining layer modules (Archis-punten, Toestemmingen, Uiterwaarden, etc.)
2. Implement GPS tracking functionality
3. Create RCE-style legend component
4. Add PDOK WMS layers (AHN, Geomorphology)
5. Set up GitHub Actions deployment
6. Configure GitHub Pages for dist/ output

### V3 Reference
V3 is stable at build 3.3.5 in `detectorapp-v3` repository with:
- Romeinse wegen (15,196 segments)
- RCE-style collapsible legend
- Mobile responsive design
- GPS tracking with direction cone

V4 aims to maintain all V3 features while adding:
- Modular architecture for easier maintenance
- Better code organization
- Modern build pipeline
- Improved performance

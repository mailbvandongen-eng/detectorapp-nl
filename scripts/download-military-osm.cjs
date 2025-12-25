const https = require('https');
const fs = require('fs');
const path = require('path');

const queries = {
  slagvelden: `[out:json][timeout:120];
    area["name"="Nederland"]["admin_level"="3"]->.nl;
    (
      node["historic"="battlefield"](area.nl);
      way["historic"="battlefield"](area.nl);
    );
    out center;`,

  vliegvelden: `[out:json][timeout:120];
    area["name"="Nederland"]["admin_level"="3"]->.nl;
    (
      node["military"="airfield"](area.nl);
      way["military"="airfield"](area.nl);
      node["aeroway"="aerodrome"]["disused"="yes"](area.nl);
      way["aeroway"="aerodrome"]["disused"="yes"](area.nl);
    );
    out center;`,

  oorlogsmonumenten: `[out:json][timeout:120];
    area["name"="Nederland"]["admin_level"="3"]->.nl;
    (
      node["memorial"="war_memorial"](area.nl);
      node["memorial:type"="war_memorial"](area.nl);
      way["memorial"="war_memorial"](area.nl);
    );
    out center;`,

  kazematten: `[out:json][timeout:120];
    area["name"="Nederland"]["admin_level"="3"]->.nl;
    (
      node["bunker_type"="pillbox"](area.nl);
      way["bunker_type"="pillbox"](area.nl);
      node["historic"="bunker"](area.nl);
      way["historic"="bunker"](area.nl);
    );
    out center;`
};

async function queryOverpass(name, query) {
  return new Promise((resolve, reject) => {
    const data = 'data=' + encodeURIComponent(query);

    const options = {
      hostname: 'overpass-api.de',
      port: 443,
      path: '/api/interpreter',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    console.log('Querying ' + name + '...');

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve(json);
        } catch (e) {
          console.error('Error parsing ' + name + ':', body.substring(0, 200));
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function osmToGeoJSON(osmData, name) {
  const features = osmData.elements.map(el => {
    let coords;
    if (el.type === 'node') {
      coords = [el.lon, el.lat];
    } else if (el.center) {
      coords = [el.center.lon, el.center.lat];
    } else {
      return null;
    }

    return {
      type: 'Feature',
      geometry: { type: 'Point', coordinates: coords },
      properties: {
        id: el.id,
        type: el.type,
        name: (el.tags && el.tags.name) || (el.tags && el.tags['name:nl']) || 'Onbekend',
        description: (el.tags && el.tags.description) || '',
        wikidata: (el.tags && el.tags.wikidata) || '',
        wikipedia: (el.tags && el.tags.wikipedia) || '',
        date: (el.tags && el.tags.date) || (el.tags && el.tags.start_date) || '',
        ...el.tags
      }
    };
  }).filter(Boolean);

  console.log(name + ': ' + features.length + ' features');

  return {
    type: 'FeatureCollection',
    features
  };
}

async function main() {
  const outputDir = path.join(__dirname, '..', 'public', 'data', 'military');
  fs.mkdirSync(outputDir, { recursive: true });

  for (const [name, query] of Object.entries(queries)) {
    try {
      console.log('\nDownloading ' + name + '...');
      await new Promise(r => setTimeout(r, 3000)); // Rate limit

      const osmData = await queryOverpass(name, query);
      const geojson = osmToGeoJSON(osmData, name);

      const outFile = path.join(outputDir, name + '.geojson');
      fs.writeFileSync(outFile, JSON.stringify(geojson, null, 2));
      console.log('Saved to ' + outFile);
    } catch (err) {
      console.error('Failed ' + name + ':', err.message);
    }
  }
}

main();

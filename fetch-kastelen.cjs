const https = require('https');
const fs = require('fs');

// Overpass query for castles in Netherlands
const query = `
[out:json][timeout:60];
area["ISO3166-1"="NL"]->.nl;
(
  nwr["historic"="castle"](area.nl);
  nwr["castle_type"](area.nl);
);
out center;
`;

const url = 'https://overpass-api.de/api/interpreter';
const postData = 'data=' + encodeURIComponent(query);

const options = {
  hostname: 'overpass-api.de',
  path: '/api/interpreter',
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Fetching castles from Overpass API...');

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log('Got', json.elements.length, 'elements');
      
      // Convert to GeoJSON
      const features = json.elements
        .filter(el => el.lat || el.center)
        .map(el => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [
              el.lon || el.center.lon,
              el.lat || el.center.lat
            ]
          },
          properties: {
            osm_id: el.id,
            osm_type: el.type,
            name: el.tags?.name || el.tags?.['name:nl'] || 'Kasteel',
            historic: el.tags?.historic,
            castle_type: el.tags?.castle_type,
            wikipedia: el.tags?.wikipedia,
            wikidata: el.tags?.wikidata,
            website: el.tags?.website,
            heritage: el.tags?.heritage,
            start_date: el.tags?.start_date
          }
        }));
      
      const geojson = {
        type: 'FeatureCollection',
        features: features
      };
      
      fs.writeFileSync('./public/data/kastelen_osm.geojson', JSON.stringify(geojson, null, 2));
      console.log('Saved', features.length, 'castles to public/data/kastelen_osm.geojson');
    } catch (e) {
      console.error('Parse error:', e.message);
      console.log('Response:', data.substring(0, 500));
    }
  });
});

req.on('error', e => console.error('Request error:', e.message));
req.write(postData);
req.end();

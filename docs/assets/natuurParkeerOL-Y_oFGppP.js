import{V as p,c as f,f as g,P as d,g as h,S as y,h as m}from"./index-C2RGx643.js";const i="natuurparkeer_cache",w=1440*60*1e3;async function k(){try{const t=localStorage.getItem(i);if(t){const{timestamp:o,data:e}=JSON.parse(t);if(Date.now()-o<w)return console.log(`✓ Natuurparkeerplaatsen loaded from cache (${e.length} locations)`),e}}catch{}const s=`
    [out:json][timeout:60];
    area["ISO3166-1"="NL"]->.nl;
    (
      // Parking explicitly tagged for hiking or nature
      nwr["amenity"="parking"]["hiking"="yes"](area.nl);
      nwr["amenity"="parking"]["leisure"~"nature_reserve|park"](area.nl);
      nwr["amenity"="parking"]["tourism"="trailhead"](area.nl);
      nwr["amenity"="parking"]["access"="customers"]["operator"~"Staatsbosbeheer|Natuurmonumenten|Landschap"](area.nl);
      // Parking with nature-related names
      nwr["amenity"="parking"]["name"~"bos|natuur|heide|duin|wandel|Staatsbosbeheer|Natuurmonumenten",i](area.nl);
    );
    out center;
  `;try{const t=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(s)}`});if(!t.ok)throw new Error(`Overpass API error: ${t.status}`);const e=(await t.json()).elements.filter(r=>{const a=r.lon??r.center?.lon,n=r.lat??r.center?.lat;return a&&n}).map(r=>{const a=r.tags||{},n=r.lon??r.center?.lon,l=r.lat??r.center?.lat;let c=a.fee;return c==="yes"?c="Betaald":c==="no"&&(c="Gratis"),{lon:n,lat:l,name:a.name||"Parkeerplaats",fee:c,capacity:a.capacity,access:a.access,surface:a.surface,operator:a.operator,opening_hours:a.opening_hours,natuurgebied:a.is_in||a.description}});try{const r={timestamp:Date.now(),data:e};localStorage.setItem(i,JSON.stringify(r))}catch{}return console.log(`✓ Natuurparkeerplaatsen fetched from OSM (${e.length} locations)`),e}catch(t){console.warn("⚠ Failed to fetch natuurparkeer from Overpass:",t);try{const o=localStorage.getItem(i);if(o){const{data:e}=JSON.parse(o);return console.log(`✓ Using stale cache (${e.length} locations)`),e}}catch{}return[]}}function b(s){return"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="${s==="Betaald"?"#f59e0b":"#22c55e"}" stroke="white" stroke-width="2"/>
    <text x="16" y="21" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">P</text>
  </svg>`)}const u=new Map;function S(s,t){const o=s.get("fee")||"unknown";let e=1;t>150?e=.5:t>75?e=.6:t>40?e=.7:t>20?e=.85:t>10?e=1:e=1.2;const r=`parkeer-${o}-${e.toFixed(2)}`;let a=u.get(r);return a||(a=new y({image:new m({src:b(o),scale:e,anchor:[.5,.5]})}),u.set(r,a)),a}async function x(){const s=new p;let t=!1,o=!1;const e=new f({source:s,properties:{title:"Natuurparkeren",type:"overlay"},visible:!1,style:(r,a)=>S(r,a),zIndex:26});return e.on("change:visible",async()=>{if(e.getVisible()&&!t&&!o){o=!0,console.log("🔄 Natuurparkeren: laden...");const a=(await k()).map(n=>new g({geometry:new d(h([n.lon,n.lat])),name:n.name,fee:n.fee,capacity:n.capacity,access:n.access,surface:n.surface,operator:n.operator,opening_hours:n.opening_hours,natuurgebied:n.natuurgebied}));s.addFeatures(a),t=!0,o=!1,console.log(`✓ Natuurparkeren geladen (${a.length} locaties)`)}}),e}export{x as createNatuurParkeerLayerOL};
//# sourceMappingURL=natuurParkeerOL-Y_oFGppP.js.map

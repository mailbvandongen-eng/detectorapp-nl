import{f as p,P as f,g,V as h,c as d,S as y,h as m}from"./index-CPQ8Ylbs.js";const i="natuurparkeer_cache",w=1440*60*1e3;async function k(){try{const r=localStorage.getItem(i);if(r){const{timestamp:n,data:a}=JSON.parse(r);if(Date.now()-n<w)return console.log(`✓ Natuurparkeerplaatsen loaded from cache (${a.length} locations)`),a}}catch{}const o=`
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
  `;try{const r=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(o)}`});if(!r.ok)throw new Error(`Overpass API error: ${r.status}`);const a=(await r.json()).elements.filter(e=>{const t=e.lon??e.center?.lon,c=e.lat??e.center?.lat;return t&&c}).map(e=>{const t=e.tags||{},c=e.lon??e.center?.lon,u=e.lat??e.center?.lat;let s=t.fee;return s==="yes"?s="Betaald":s==="no"&&(s="Gratis"),{lon:c,lat:u,name:t.name||"Parkeerplaats",fee:s,capacity:t.capacity,access:t.access,surface:t.surface,operator:t.operator,opening_hours:t.opening_hours,natuurgebied:t.is_in||t.description}});try{const e={timestamp:Date.now(),data:a};localStorage.setItem(i,JSON.stringify(e))}catch{}return console.log(`✓ Natuurparkeerplaatsen fetched from OSM (${a.length} locations)`),a}catch(r){console.warn("⚠ Failed to fetch natuurparkeer from Overpass:",r);try{const n=localStorage.getItem(i);if(n){const{data:a}=JSON.parse(n);return console.log(`✓ Using stale cache (${a.length} locations)`),a}}catch{}return[]}}function S(o){return"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="${o==="Betaald"?"#f59e0b":"#22c55e"}" stroke="white" stroke-width="2"/>
    <text x="16" y="21" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">P</text>
  </svg>`)}const l=new Map;function b(o,r){const n=o.get("fee")||"unknown";let a=1;r>150?a=.5:r>75?a=.6:r>40?a=.7:r>20?a=.85:r>10?a=1:a=1.2;const e=`parkeer-${n}-${a.toFixed(2)}`;let t=l.get(e);return t||(t=new y({image:new m({src:S(n),scale:a,anchor:[.5,.5]})}),l.set(e,t)),t}async function v(){const r=(await k()).map(e=>new p({geometry:new f(g([e.lon,e.lat])),name:e.name,fee:e.fee,capacity:e.capacity,access:e.access,surface:e.surface,operator:e.operator,opening_hours:e.opening_hours,natuurgebied:e.natuurgebied})),n=new h({features:r});return new d({source:n,properties:{title:"Natuurparkeren",type:"overlay"},visible:!1,style:(e,t)=>b(e,t),zIndex:26})}export{v as createNatuurParkeerLayerOL};
//# sourceMappingURL=natuurParkeerOL-ihW9IIRI.js.map

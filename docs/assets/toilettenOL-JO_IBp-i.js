import{f as i,P as h,g as f,V as p,c as g,S as w,h as u}from"./index-CPQ8Ylbs.js";const s="toiletten_cache",d=1440*60*1e3;async function m(){try{const t=localStorage.getItem(s);if(t){const{timestamp:r,data:o}=JSON.parse(t);if(Date.now()-r<d)return console.log(`✓ Toiletten loaded from cache (${o.length} locations)`),o}}catch{}const n=`
    [out:json][timeout:30];
    area["ISO3166-1"="NL"]->.nl;
    (
      nwr["amenity"="toilets"](area.nl);
    );
    out center;
  `;try{const t=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(n)}`});if(!t.ok)throw new Error(`Overpass API error: ${t.status}`);const o=(await t.json()).elements.filter(e=>{const a=e.lon??e.center?.lon,c=e.lat??e.center?.lat;return a&&c}).map(e=>{const a=e.tags||{},c=e.lon??e.center?.lon,l=e.lat??e.center?.lat;return{lon:c,lat:l,name:a.name||"Openbaar toilet",fee:a.fee,access:a.access,wheelchair:a.wheelchair,opening_hours:a.opening_hours,operator:a.operator}});try{const e={timestamp:Date.now(),data:o};localStorage.setItem(s,JSON.stringify(e))}catch{}return console.log(`✓ Toiletten fetched from OSM (${o.length} locations)`),o}catch(t){console.warn("⚠ Failed to fetch toiletten from Overpass:",t);try{const r=localStorage.getItem(s);if(r){const{data:o}=JSON.parse(r);return console.log(`✓ Using stale cache (${o.length} locations)`),o}}catch{}return[]}}function y(){return"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="#0ea5e9" stroke="white" stroke-width="2"/>
    <g transform="translate(7, 6)" fill="white">
      <circle cx="5" cy="3" r="2.5"/>
      <path d="M2 7h6v8H2z"/>
      <circle cx="13" cy="3" r="2.5"/>
      <path d="M10 7h6l-1 8h-4z"/>
    </g>
  </svg>`)}function v(n){let t=1;return n>150?t=.5:n>75?t=.6:n>40?t=.7:n>20?t=.85:n>10?t=1:t=1.2,new w({image:new u({src:y(),scale:t,anchor:[.5,.5]})})}async function O(){const t=(await m()).map(e=>new i({geometry:new h(f([e.lon,e.lat])),name:e.name,fee:e.fee,access:e.access,wheelchair:e.wheelchair,opening_hours:e.opening_hours,operator:e.operator})),r=new p({features:t});return new g({source:r,properties:{title:"Openbare Toiletten",type:"overlay"},visible:!1,style:(e,a)=>v(a),zIndex:28})}export{O as createToilettenLayerOL};
//# sourceMappingURL=toilettenOL-JO_IBp-i.js.map

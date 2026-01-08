import{V as i,c as h,f,P as g,g as p,S as d,h as u}from"./index-C2RGx643.js";const s="toiletten_cache",w=1440*60*1e3;async function m(){try{const e=localStorage.getItem(s);if(e){const{timestamp:c,data:a}=JSON.parse(e);if(Date.now()-c<w)return console.log(`✓ Toiletten loaded from cache (${a.length} locations)`),a}}catch{}const r=`
    [out:json][timeout:30];
    area["ISO3166-1"="NL"]->.nl;
    (
      nwr["amenity"="toilets"](area.nl);
    );
    out center;
  `;try{const e=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(r)}`});if(!e.ok)throw new Error(`Overpass API error: ${e.status}`);const a=(await e.json()).elements.filter(t=>{const o=t.lon??t.center?.lon,n=t.lat??t.center?.lat;return o&&n}).map(t=>{const o=t.tags||{},n=t.lon??t.center?.lon,l=t.lat??t.center?.lat;return{lon:n,lat:l,name:o.name||"Openbaar toilet",fee:o.fee,access:o.access,wheelchair:o.wheelchair,opening_hours:o.opening_hours,operator:o.operator}});try{const t={timestamp:Date.now(),data:a};localStorage.setItem(s,JSON.stringify(t))}catch{}return console.log(`✓ Toiletten fetched from OSM (${a.length} locations)`),a}catch(e){console.warn("⚠ Failed to fetch toiletten from Overpass:",e);try{const c=localStorage.getItem(s);if(c){const{data:a}=JSON.parse(c);return console.log(`✓ Using stale cache (${a.length} locations)`),a}}catch{}return[]}}function y(){return"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="#0ea5e9" stroke="white" stroke-width="2"/>
    <g transform="translate(7, 6)" fill="white">
      <circle cx="5" cy="3" r="2.5"/>
      <path d="M2 7h6v8H2z"/>
      <circle cx="13" cy="3" r="2.5"/>
      <path d="M10 7h6l-1 8h-4z"/>
    </g>
  </svg>`)}function v(r){let e=1;return r>150?e=.5:r>75?e=.6:r>40?e=.7:r>20?e=.85:r>10?e=1:e=1.2,new d({image:new u({src:y(),scale:e,anchor:[.5,.5]})})}async function O(){const r=new i;let e=!1,c=!1;const a=new h({source:r,properties:{title:"Openbare Toiletten",type:"overlay"},visible:!1,style:(t,o)=>v(o),zIndex:28});return a.on("change:visible",async()=>{if(a.getVisible()&&!e&&!c){c=!0,console.log("🔄 Toiletten: laden...");const o=(await m()).map(n=>new f({geometry:new g(p([n.lon,n.lat])),name:n.name,fee:n.fee,access:n.access,wheelchair:n.wheelchair,opening_hours:n.opening_hours,operator:n.operator}));r.addFeatures(o),e=!0,c=!1,console.log(`✓ Toiletten geladen (${o.length} locaties)`)}}),a}export{O as createToilettenLayerOL};
//# sourceMappingURL=toilettenOL-DpjTdd4l.js.map

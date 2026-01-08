import{V as h,c as d,f as p,P as w,g as f,S as g,h as u}from"./index-C2RGx643.js";const i="winkelcentra_cache",m=10080*60*1e3;async function y(){try{const t=localStorage.getItem(i);if(t){const{timestamp:s,data:a}=JSON.parse(t);if(Date.now()-s<m)return console.log(`✓ Winkelcentra loaded from cache (${a.length} locations)`),a}}catch{}const o=`
    [out:json][timeout:60];
    area["ISO3166-1"="NL"]->.nl;
    (
      // Shopping malls and centers
      nwr["shop"="mall"](area.nl);
      nwr["landuse"="retail"]["name"](area.nl);
      // Shopping streets/areas with name
      nwr["shop"="department_store"](area.nl);
    );
    out center;
  `;try{const t=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(o)}`});if(!t.ok)throw new Error(`Overpass API error: ${t.status}`);const a=(await t.json()).elements.filter(n=>{const e=n.lon??n.center?.lon,r=n.lat??n.center?.lat,c=n.tags||{};return e&&r&&c.name}).map(n=>{const e=n.tags||{},r=n.lon??n.center?.lon,c=n.lat??n.center?.lat;let l="";return e["addr:street"]&&(l=e["addr:street"],e["addr:housenumber"]&&(l+=" "+e["addr:housenumber"]),e["addr:city"]&&(l+=", "+e["addr:city"])),{lon:r,lat:c,name:e.name,opening_hours:e.opening_hours,website:e.website||e["contact:website"],phone:e.phone||e["contact:phone"],address:l||void 0,wheelchair:e.wheelchair,shops:e.shops?parseInt(e.shops):void 0}});try{const n={timestamp:Date.now(),data:a};localStorage.setItem(i,JSON.stringify(n))}catch{}return console.log(`✓ Winkelcentra fetched from OSM (${a.length} locations)`),a}catch(t){console.warn("⚠ Failed to fetch winkelcentra from Overpass:",t);try{const s=localStorage.getItem(i);if(s){const{data:a}=JSON.parse(s);return console.log(`✓ Using stale cache (${a.length} locations)`),a}}catch{}return[]}}function k(){return"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="#8b5cf6" stroke="white" stroke-width="2"/>
    <g transform="translate(8, 8)" fill="white">
      <rect x="1" y="6" width="14" height="9" rx="1" fill="none" stroke="white" stroke-width="1.5"/>
      <path d="M4 6V4a4 4 0 0 1 8 0v2" fill="none" stroke="white" stroke-width="1.5"/>
    </g>
  </svg>`)}function v(o){let t=1;return o>150?t=.5:o>75?t=.6:o>40?t=.7:o>20?t=.85:o>10?t=1:t=1.2,new g({image:new u({src:k(),scale:t,anchor:[.5,.5]})})}async function b(){const o=new h;let t=!1,s=!1;const a=new d({source:o,properties:{title:"Winkelcentra",type:"overlay"},visible:!1,style:(n,e)=>v(e),zIndex:28});return a.on("change:visible",async()=>{if(a.getVisible()&&!t&&!s){s=!0,console.log("🔄 Winkelcentra: laden...");const e=(await y()).map(r=>new p({geometry:new w(f([r.lon,r.lat])),name:r.name,opening_hours:r.opening_hours,website:r.website,phone:r.phone,address:r.address,wheelchair:r.wheelchair,shops:r.shops}));o.addFeatures(e),t=!0,s=!1,console.log(`✓ Winkelcentra geladen (${e.length} locaties)`)}}),a}export{b as createWinkelcentraLayerOL};
//# sourceMappingURL=winkelcentraOL-ByWfEDi2.js.map

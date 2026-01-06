import{f as h,P as d,g as p,V as w,c as f,S as g,h as u}from"./index-CPQ8Ylbs.js";const i="winkelcentra_cache",m=10080*60*1e3;async function y(){try{const n=localStorage.getItem(i);if(n){const{timestamp:o,data:a}=JSON.parse(n);if(Date.now()-o<m)return console.log(`✓ Winkelcentra loaded from cache (${a.length} locations)`),a}}catch{}const r=`
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
  `;try{const n=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(r)}`});if(!n.ok)throw new Error(`Overpass API error: ${n.status}`);const a=(await n.json()).elements.filter(e=>{const t=e.lon??e.center?.lon,c=e.lat??e.center?.lat,l=e.tags||{};return t&&c&&l.name}).map(e=>{const t=e.tags||{},c=e.lon??e.center?.lon,l=e.lat??e.center?.lat;let s="";return t["addr:street"]&&(s=t["addr:street"],t["addr:housenumber"]&&(s+=" "+t["addr:housenumber"]),t["addr:city"]&&(s+=", "+t["addr:city"])),{lon:c,lat:l,name:t.name,opening_hours:t.opening_hours,website:t.website||t["contact:website"],phone:t.phone||t["contact:phone"],address:s||void 0,wheelchair:t.wheelchair,shops:t.shops?parseInt(t.shops):void 0}});try{const e={timestamp:Date.now(),data:a};localStorage.setItem(i,JSON.stringify(e))}catch{}return console.log(`✓ Winkelcentra fetched from OSM (${a.length} locations)`),a}catch(n){console.warn("⚠ Failed to fetch winkelcentra from Overpass:",n);try{const o=localStorage.getItem(i);if(o){const{data:a}=JSON.parse(o);return console.log(`✓ Using stale cache (${a.length} locations)`),a}}catch{}return[]}}function k(){return"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="#8b5cf6" stroke="white" stroke-width="2"/>
    <g transform="translate(8, 8)" fill="white">
      <rect x="1" y="6" width="14" height="9" rx="1" fill="none" stroke="white" stroke-width="1.5"/>
      <path d="M4 6V4a4 4 0 0 1 8 0v2" fill="none" stroke="white" stroke-width="1.5"/>
    </g>
  </svg>`)}function v(r){let n=1;return r>150?n=.5:r>75?n=.6:r>40?n=.7:r>20?n=.85:r>10?n=1:n=1.2,new g({image:new u({src:k(),scale:n,anchor:[.5,.5]})})}async function I(){const n=(await y()).map(e=>new h({geometry:new d(p([e.lon,e.lat])),name:e.name,opening_hours:e.opening_hours,website:e.website,phone:e.phone,address:e.address,wheelchair:e.wheelchair,shops:e.shops})),o=new w({features:n});return new f({source:o,properties:{title:"Winkelcentra",type:"overlay"},visible:!1,style:(e,t)=>v(t),zIndex:28})}export{I as createWinkelcentraLayerOL};
//# sourceMappingURL=winkelcentraOL-D8EJJ2yU.js.map

import{f as p,P as d,g as h,d as g,V as w}from"./index-BzC49V2s.js";import{L as u}from"./iconStyles-C0ewjQXc.js";const s="kringloopwinkels_cache",f=1440*60*1e3;async function m(){try{const t=localStorage.getItem(s);if(t){const{timestamp:a,data:n}=JSON.parse(t);if(Date.now()-a<f)return console.log(`✓ Kringloopwinkels loaded from cache (${n.length} locations)`),n}}catch{}const c=`
    [out:json][timeout:30];
    area["ISO3166-1"="NL"]->.nl;
    (
      nwr["shop"="second_hand"](area.nl);
      nwr["shop"="charity"](area.nl);
      nwr["second_hand"="yes"](area.nl);
    );
    out center;
  `;try{const t=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(c)}`});if(!t.ok)throw new Error(`Overpass API error: ${t.status}`);const n=(await t.json()).elements.filter(e=>{const o=e.lon??e.center?.lon,r=e.lat??e.center?.lat;return o&&r}).map(e=>{const o=e.tags||{},r=e.lon??e.center?.lon,i=e.lat??e.center?.lat,l=[o["addr:street"],o["addr:housenumber"],o["addr:postcode"],o["addr:city"]].filter(Boolean);return{lon:r,lat:i,name:o.name||o.operator||"Kringloopwinkel",website:o.website||o["contact:website"],phone:o.phone||o["contact:phone"],address:l.length>0?l.join(" "):void 0,opening_hours:o.opening_hours}});try{const e={timestamp:Date.now(),data:n};localStorage.setItem(s,JSON.stringify(e))}catch{}return console.log(`✓ Kringloopwinkels fetched from OSM (${n.length} locations)`),n}catch(t){console.warn("⚠ Failed to fetch kringloopwinkels from Overpass:",t);try{const a=localStorage.getItem(s);if(a){const{data:n}=JSON.parse(a);return console.log(`✓ Using stale cache (${n.length} locations)`),n}}catch{}return[]}}async function S(){const t=(await m()).map(e=>new p({geometry:new d(h([e.lon,e.lat])),name:e.name,website:e.website,phone:e.phone,address:e.address,opening_hours:e.opening_hours})),a=new g({features:t});return new w({source:a,properties:{title:"Kringloopwinkels",type:"overlay"},visible:!1,style:u.recycle(),zIndex:27})}export{S as createKringloopwinkelsLayerOL};
//# sourceMappingURL=kringloopwinkelsOL-D4rP1xL9.js.map

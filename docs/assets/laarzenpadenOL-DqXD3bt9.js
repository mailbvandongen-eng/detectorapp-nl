import{V as d,c as h,g as p,f as y,L as f,S as g,d as u}from"./index-C2RGx643.js";const i="laarzenpaden_cache",m=10080*60*1e3;async function w(){try{const a=localStorage.getItem(i);if(a){const{timestamp:s,data:e}=JSON.parse(a);if(Date.now()-s<m)return console.log(`✓ Laarzenpaden loaded from cache (${e.length} trails)`),e}}catch{}const n=`
    [out:json][timeout:90];
    area["ISO3166-1"="NL"]->.nl;
    (
      // Paths with muddy surfaces
      way["highway"~"path|track|footway"]["surface"="mud"](area.nl);
      way["highway"~"path|track"]["surface"="ground"]["smoothness"~"very_bad|horrible|very_horrible"](area.nl);
      // Paths explicitly tagged for hiking with bad smoothness
      way["highway"~"path|track"]["sac_scale"~"hiking|mountain_hiking"]["smoothness"~"bad|very_bad|horrible"](area.nl);
      // Paths in wetlands/marshes
      way["highway"~"path|track"]["wetland"](area.nl);
      // Difficult trails with poor visibility
      way["highway"="path"]["trail_visibility"~"bad|horrible|no"](area.nl);
    );
    out geom;
  `;try{const a=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(n)}`});if(!a.ok)throw new Error(`Overpass API error: ${a.status}`);const e=(await a.json()).elements.filter(t=>t.type==="way"&&t.geometry&&t.geometry.length>1).map(t=>{const r=t.tags||{};return{coords:t.geometry.map(c=>[c.lon,c.lat]),name:r.name||void 0,surface:r.surface,smoothness:r.smoothness,trail_visibility:r.trail_visibility,access:r.access}});try{const t={timestamp:Date.now(),data:e};localStorage.setItem(i,JSON.stringify(t))}catch{console.warn("⚠ Could not cache laarzenpaden (too large)")}return console.log(`✓ Laarzenpaden fetched from OSM (${e.length} trails)`),e}catch(a){console.warn("⚠ Failed to fetch laarzenpaden from Overpass:",a);try{const s=localStorage.getItem(i);if(s){const{data:e}=JSON.parse(s);return console.log(`✓ Using stale cache (${e.length} trails)`),e}}catch{}return[]}}function b(n){let a=3;return n>100?a=1.5:n>50?a=2:n>20?a=2.5:n>10?a=3:a=4,new g({stroke:new u({color:"#78350f",width:a,lineDash:[4,4],lineCap:"round",lineJoin:"round"})})}async function z(){const n=new d;let a=!1,s=!1;const e=new h({source:n,properties:{title:"Laarzenpaden",type:"overlay"},visible:!1,style:(t,r)=>b(r),zIndex:14});return e.on("change:visible",async()=>{if(e.getVisible()&&!a&&!s){s=!0,console.log("🔄 Laarzenpaden: laden...");const r=(await w()).map(o=>{const c=o.coords.map(l=>p(l));return new y({geometry:new f(c),name:o.name||"Laarzenpad",surface:o.surface,smoothness:o.smoothness,trail_visibility:o.trail_visibility,access:o.access})});n.addFeatures(r),a=!0,s=!1,console.log(`✓ Laarzenpaden geladen (${r.length} paden)`)}}),e}export{z as createLaarzenpadenLayerOL};
//# sourceMappingURL=laarzenpadenOL-DqXD3bt9.js.map

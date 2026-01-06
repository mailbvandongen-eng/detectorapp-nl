import{g as l,f as h,L as d,V as y,c as p,S as f,d as m}from"./index-CPQ8Ylbs.js";const c="laarzenpaden_cache",u=10080*60*1e3;async function w(){try{const a=localStorage.getItem(c);if(a){const{timestamp:o,data:t}=JSON.parse(a);if(Date.now()-o<u)return console.log(`✓ Laarzenpaden loaded from cache (${t.length} trails)`),t}}catch{}const s=`
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
  `;try{const a=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(s)}`});if(!a.ok)throw new Error(`Overpass API error: ${a.status}`);const t=(await a.json()).elements.filter(e=>e.type==="way"&&e.geometry&&e.geometry.length>1).map(e=>{const r=e.tags||{};return{coords:e.geometry.map(n=>[n.lon,n.lat]),name:r.name||void 0,surface:r.surface,smoothness:r.smoothness,trail_visibility:r.trail_visibility,access:r.access}});try{const e={timestamp:Date.now(),data:t};localStorage.setItem(c,JSON.stringify(e))}catch{console.warn("⚠ Could not cache laarzenpaden (too large)")}return console.log(`✓ Laarzenpaden fetched from OSM (${t.length} trails)`),t}catch(a){console.warn("⚠ Failed to fetch laarzenpaden from Overpass:",a);try{const o=localStorage.getItem(c);if(o){const{data:t}=JSON.parse(o);return console.log(`✓ Using stale cache (${t.length} trails)`),t}}catch{}return[]}}function g(s){let a=3;return s>100?a=1.5:s>50?a=2:s>20?a=2.5:s>10?a=3:a=4,new f({stroke:new m({color:"#78350f",width:a,lineDash:[4,4],lineCap:"round",lineJoin:"round"})})}async function v(){const a=(await w()).map(e=>{const r=e.coords.map(n=>l(n));return new h({geometry:new d(r),name:e.name||"Laarzenpad",surface:e.surface,smoothness:e.smoothness,trail_visibility:e.trail_visibility,access:e.access})}),o=new y({features:a});return new p({source:o,properties:{title:"Laarzenpaden",type:"overlay"},visible:!1,style:(e,r)=>g(r),zIndex:14})}export{v as createLaarzenpadenLayerOL};
//# sourceMappingURL=laarzenpadenOL-IbQm-cNQ.js.map

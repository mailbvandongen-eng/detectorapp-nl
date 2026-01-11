import{V as d,c as u,k as p,F as f,l as h,S as g,d as y}from"./index-DibImxIs.js";const i="ruiterpaden_cache",m=10080*60*1e3;async function w(){try{const e=localStorage.getItem(i);if(e){const{timestamp:o,data:a}=JSON.parse(e);if(Date.now()-o<m)return console.log(`✓ Ruiterpaden loaded from cache (${a.length} trails)`),a}}catch{}const r=`
    [out:json][timeout:90];
    area["ISO3166-1"="NL"]->.nl;
    (
      way["highway"="bridleway"](area.nl);
      way["horse"="designated"](area.nl);
      way["horse"="yes"]["highway"~"path|track"](area.nl);
      way["name"~"[Rr]uiter|[Pp]aard",i](area.nl);
    );
    out geom;
  `;try{const e=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(r)}`});if(!e.ok)throw new Error(`Overpass API error: ${e.status}`);const a=(await e.json()).elements.filter(t=>t.type==="way"&&t.geometry&&t.geometry.length>1).map(t=>{const n=t.tags||{};return{coords:t.geometry.map(c=>[c.lon,c.lat]),name:n.name||void 0,surface:n.surface,access:n.access}});try{const t={timestamp:Date.now(),data:a};localStorage.setItem(i,JSON.stringify(t))}catch{console.warn("⚠ Could not cache ruiterpaden (too large)")}return console.log(`✓ Ruiterpaden fetched from OSM (${a.length} trails)`),a}catch(e){console.warn("⚠ Failed to fetch ruiterpaden from Overpass:",e);try{const o=localStorage.getItem(i);if(o){const{data:a}=JSON.parse(o);return console.log(`✓ Using stale cache (${a.length} trails)`),a}}catch{}return[]}}function S(r){let e=3;return r>100?e=1.5:r>50?e=2:r>20?e=2.5:r>10?e=3:e=4,new g({stroke:new y({color:"#92400e",width:e,lineDash:[8,4],lineCap:"round",lineJoin:"round"})})}async function L(){const r=new d;let e=!1,o=!1;const a=new u({source:r,properties:{title:"Ruiterpaden",type:"overlay"},visible:!1,style:(t,n)=>S(n),zIndex:15,maxResolution:40});return a.on("change:visible",async()=>{if(a.getVisible()&&!e&&!o){o=!0,console.log("🔄 Ruiterpaden: laden...");const n=(await w()).map(s=>{const c=s.coords.map(l=>p(l));return new f({geometry:new h(c),name:s.name||"Ruiterpad",surface:s.surface,access:s.access})});r.addFeatures(n),e=!0,o=!1,console.log(`✓ Ruiterpaden geladen (${n.length} paden)`)}}),a}export{L as createRuiterpadenLayerOL};
//# sourceMappingURL=ruiterpadenOL-DqfrepVv.js.map

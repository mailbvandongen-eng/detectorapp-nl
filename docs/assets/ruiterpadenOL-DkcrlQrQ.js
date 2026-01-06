import{g as l,f as d,L as u,V as p,c as f,S as h,d as y}from"./index-CPQ8Ylbs.js";const c="ruiterpaden_cache",m=10080*60*1e3;async function g(){try{const e=localStorage.getItem(c);if(e){const{timestamp:o,data:a}=JSON.parse(e);if(Date.now()-o<m)return console.log(`✓ Ruiterpaden loaded from cache (${a.length} trails)`),a}}catch{}const r=`
    [out:json][timeout:60];
    area["ISO3166-1"="NL"]->.nl;
    (
      way["highway"="bridleway"](area.nl);
      way["horse"="designated"](area.nl);
      way["horse"="yes"]["highway"~"path|track"](area.nl);
    );
    out geom;
  `;try{const e=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(r)}`});if(!e.ok)throw new Error(`Overpass API error: ${e.status}`);const a=(await e.json()).elements.filter(t=>t.type==="way"&&t.geometry&&t.geometry.length>1).map(t=>{const n=t.tags||{};return{coords:t.geometry.map(s=>[s.lon,s.lat]),name:n.name||void 0,surface:n.surface,access:n.access}});try{const t={timestamp:Date.now(),data:a};localStorage.setItem(c,JSON.stringify(t))}catch{console.warn("⚠ Could not cache ruiterpaden (too large)")}return console.log(`✓ Ruiterpaden fetched from OSM (${a.length} trails)`),a}catch(e){console.warn("⚠ Failed to fetch ruiterpaden from Overpass:",e);try{const o=localStorage.getItem(c);if(o){const{data:a}=JSON.parse(o);return console.log(`✓ Using stale cache (${a.length} trails)`),a}}catch{}return[]}}function w(r){let e=3;return r>100?e=1.5:r>50?e=2:r>20?e=2.5:r>10?e=3:e=4,new h({stroke:new y({color:"#92400e",width:e,lineDash:[8,4],lineCap:"round",lineJoin:"round"})})}async function O(){const e=(await g()).map(t=>{const n=t.coords.map(s=>l(s));return new d({geometry:new u(n),name:t.name||"Ruiterpad",surface:t.surface,access:t.access})}),o=new p({features:e});return new f({source:o,properties:{title:"Ruiterpaden",type:"overlay"},visible:!1,style:(t,n)=>w(n),zIndex:15})}export{O as createRuiterpadenLayerOL};
//# sourceMappingURL=ruiterpadenOL-DkcrlQrQ.js.map

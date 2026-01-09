import{V as d,c as p,g as h,f,L as g,S as m,d as u}from"./index-CRglREwm.js";const l="laarzenpaden_cache_v3",y=10080*60*1e3;async function w(){try{const e=localStorage.getItem(l);if(e){const{timestamp:n,data:a}=JSON.parse(e);if(Date.now()-n<y)return console.log(`✓ Laarzenpaden loaded from cache (${a.length} trails)`),a}}catch{}const o=`
    [out:json][timeout:120];
    area["ISO3166-1"="NL"]->.nl;
    (
      // Klompenpaden op naam
      way["name"~"klompen|Klompen"](area.nl);
      // Paden met modder of slechte begaanbaarheid
      way["surface"="mud"](area.nl);
      way["smoothness"~"horrible|very_horrible|impassable"](area.nl);
      // Onverharde wandelpaden (beperkt tot path, niet track)
      way["highway"="path"]["surface"~"ground|earth|dirt"](area.nl);
    );
    out geom;
  `;try{const e=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(o)}`});if(!e.ok)throw new Error(`Overpass API error: ${e.status}`);const a=(await e.json()).elements.filter(t=>t.type==="way"&&t.geometry&&t.geometry.length>1).map(t=>{const r=t.tags||{};return{coords:t.geometry.map(c=>[c.lon,c.lat]),name:r.name||void 0,surface:r.surface,smoothness:r.smoothness,trail_visibility:r.trail_visibility,access:r.access}});try{const t={timestamp:Date.now(),data:a};localStorage.setItem(l,JSON.stringify(t))}catch{console.warn("⚠ Could not cache laarzenpaden (too large)")}return console.log(`✓ Laarzenpaden fetched from OSM (${a.length} trails)`),a}catch(e){console.error("❌ Laarzenpaden fetch failed:",e);try{const n=localStorage.getItem(l);if(n){const{data:a}=JSON.parse(n);return console.log(`✓ Using stale cache (${a.length} trails)`),a}}catch{console.warn("⚠ No laarzenpaden cache available")}return[]}}function L(o){let e=3;return o>100?e=1.5:o>50?e=2:o>20?e=2.5:o>10?e=3:e=4,new m({stroke:new u({color:"#78350f",width:e,lineDash:[4,4],lineCap:"round",lineJoin:"round"})})}async function z(){const o=new d;let e=!1,n=!1;const a=new p({source:o,properties:{title:"Laarzenpaden",type:"overlay"},visible:!1,style:(t,r)=>L(r),zIndex:14});return a.on("change:visible",async()=>{if(console.log("Laarzenpaden visibility changed:",a.getVisible(),"loaded:",e,"loading:",n),a.getVisible()&&!e&&!n){n=!0,console.log("🔄 Laarzenpaden: laden van Overpass API...");const t=await w();console.log("Laarzenpaden data received:",t.length,"items");const r=t.map(s=>{const c=s.coords.map(i=>h(i));return new f({geometry:new g(c),name:s.name||"Laarzenpad",surface:s.surface,smoothness:s.smoothness,trail_visibility:s.trail_visibility,access:s.access})});o.addFeatures(r),e=!0,n=!1,console.log(`✓ Laarzenpaden geladen (${r.length} paden)`)}}),a}export{z as createLaarzenpadenLayerOL};
//# sourceMappingURL=laarzenpadenOL-B3volmdk.js.map

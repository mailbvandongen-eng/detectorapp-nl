import{V as i,c as g,f as h,P as f,g as d,S as w,h as p}from"./index-DeS5tBlY.js";const c="strandopgangen_cache",u=10080*60*1e3;async function m(){try{const e=localStorage.getItem(c);if(e){const{timestamp:s,data:t}=JSON.parse(e);if(Date.now()-s<u)return console.log(`✓ Strandopgangen loaded from cache (${t.length} locations)`),t}}catch{}const r=`
    [out:json][timeout:30];
    area["ISO3166-1"="NL"]->.nl;
    (
      // Beach access points
      nwr["highway"="footway"]["beach"="yes"](area.nl);
      nwr["highway"="path"]["beach"="yes"](area.nl);
      nwr["natural"="beach"]["access"~"yes|public"](area.nl);
      nwr["leisure"="beach_resort"](area.nl);
      // Strandpalen (beach poles) - common in NL
      nwr["man_made"="monitoring_station"]["beach"="yes"](area.nl);
      nwr["tourism"="information"]["information"="guidepost"]["beach"="yes"](area.nl);
      // Beach entrances
      nwr["entrance"="yes"]["beach"="yes"](area.nl);
      nwr["barrier"="gate"]["beach"="yes"](area.nl);
    );
    out center;
  `;try{const e=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(r)}`});if(!e.ok)throw new Error(`Overpass API error: ${e.status}`);const t=(await e.json()).elements.filter(a=>{const n=a.lon??a.center?.lon,o=a.lat??a.center?.lat;return n&&o}).map(a=>{const n=a.tags||{},o=a.lon??a.center?.lon,l=a.lat??a.center?.lat;return{lon:o,lat:l,name:n.name||n.ref||"Strandopgang",ref:n.ref,access:n.access,wheelchair:n.wheelchair,surface:n.surface}});try{const a={timestamp:Date.now(),data:t};localStorage.setItem(c,JSON.stringify(a))}catch{}return console.log(`✓ Strandopgangen fetched from OSM (${t.length} locations)`),t}catch(e){console.warn("⚠ Failed to fetch strandopgangen from Overpass:",e);try{const s=localStorage.getItem(c);if(s){const{data:t}=JSON.parse(s);return console.log(`✓ Using stale cache (${t.length} locations)`),t}}catch{}return[]}}function y(){return"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="#0891b2" stroke="white" stroke-width="2"/>
    <g transform="translate(6, 8)" fill="white">
      <path d="M2 8c2-2 4-2 6 0s4 2 6 0s4-2 6 0" stroke="white" stroke-width="2" fill="none"/>
      <path d="M2 12c2-2 4-2 6 0s4 2 6 0s4-2 6 0" stroke="white" stroke-width="2" fill="none"/>
      <circle cx="10" cy="4" r="3" fill="white"/>
    </g>
  </svg>`)}function S(r){let e=1;return r>150?e=.5:r>75?e=.6:r>40?e=.7:r>20?e=.85:r>10?e=1:e=1.2,new w({image:new p({src:y(),scale:e,anchor:[.5,.5]})})}async function v(){const r=new i;let e=!1,s=!1;const t=new g({source:r,properties:{title:"Strandopgangen",type:"overlay"},visible:!1,style:(a,n)=>S(n),zIndex:27});return t.on("change:visible",async()=>{if(t.getVisible()&&!e&&!s){s=!0,console.log("🔄 Strandopgangen: laden...");const n=(await m()).map(o=>new h({geometry:new f(d([o.lon,o.lat])),name:o.name,ref:o.ref,access:o.access,wheelchair:o.wheelchair,surface:o.surface}));r.addFeatures(n),e=!0,s=!1,console.log(`✓ Strandopgangen geladen (${n.length} locaties)`)}}),t}export{v as createStrandopgangenLayerOL};
//# sourceMappingURL=strandopgangenOL-Bl3FRDW7.js.map

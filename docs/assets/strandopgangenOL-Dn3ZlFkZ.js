import{V as i,c as g,f as d,P as f,g as h,S as p,h as m}from"./index-FRskwP0A.js";const c="strandopgangen_cache",w=10080*60*1e3;async function u(){try{const e=localStorage.getItem(c);if(e){const{timestamp:s,data:t}=JSON.parse(e);if(Date.now()-s<w)return console.log(`✓ Strandopgangen loaded from cache (${t.length} locations)`),t}}catch{}const r=`
    [out:json][timeout:45];
    area["ISO3166-1"="NL"]->.nl;
    (
      // Strandpalen - de meest voorkomende manier om strandopgangen te markeren in NL
      nwr["tourism"="information"]["ref"~"^[0-9]"](area.nl);
      // Standaard strandpalen/markers
      nwr["man_made"="marker"]["natural"="beach"](area.nl);
      nwr["tourism"="information"]["information"="guidepost"](area.nl);
      // Strandpaviljoens en resorts (vaak bij opgang)
      nwr["leisure"="beach_resort"](area.nl);
      nwr["amenity"="restaurant"]["beach"](area.nl);
      // Parkeerplaatsen bij strand (goede indicator voor opgang)
      nwr["amenity"="parking"]["name"~"[Ss]trand|[Bb]each|[Dd]uin",i](area.nl);
    );
    out center;
  `;try{const e=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(r)}`});if(!e.ok)throw new Error(`Overpass API error: ${e.status}`);const t=(await e.json()).elements.filter(a=>{const n=a.lon??a.center?.lon,o=a.lat??a.center?.lat;return n&&o}).map(a=>{const n=a.tags||{},o=a.lon??a.center?.lon,l=a.lat??a.center?.lat;return{lon:o,lat:l,name:n.name||n.ref||"Strandopgang",ref:n.ref,access:n.access,wheelchair:n.wheelchair,surface:n.surface}});try{const a={timestamp:Date.now(),data:t};localStorage.setItem(c,JSON.stringify(a))}catch{}return console.log(`✓ Strandopgangen fetched from OSM (${t.length} locations)`),t}catch(e){console.warn("⚠ Failed to fetch strandopgangen from Overpass:",e);try{const s=localStorage.getItem(c);if(s){const{data:t}=JSON.parse(s);return console.log(`✓ Using stale cache (${t.length} locations)`),t}}catch{}return[]}}function S(){return"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="#0891b2" stroke="white" stroke-width="2"/>
    <g transform="translate(6, 8)" fill="white">
      <path d="M2 8c2-2 4-2 6 0s4 2 6 0s4-2 6 0" stroke="white" stroke-width="2" fill="none"/>
      <path d="M2 12c2-2 4-2 6 0s4 2 6 0s4-2 6 0" stroke="white" stroke-width="2" fill="none"/>
      <circle cx="10" cy="4" r="3" fill="white"/>
    </g>
  </svg>`)}function y(r){let e=1;return r>150?e=.5:r>75?e=.6:r>40?e=.7:r>20?e=.85:r>10?e=1:e=1.2,new p({image:new m({src:S(),scale:e,anchor:[.5,.5]})})}async function k(){const r=new i;let e=!1,s=!1;const t=new g({source:r,properties:{title:"Strandopgangen",type:"overlay"},visible:!1,style:(a,n)=>y(n),zIndex:27});return t.on("change:visible",async()=>{if(t.getVisible()&&!e&&!s){s=!0,console.log("🔄 Strandopgangen: laden...");const n=(await u()).map(o=>new d({geometry:new f(h([o.lon,o.lat])),name:o.name,ref:o.ref,access:o.access,wheelchair:o.wheelchair,surface:o.surface}));r.addFeatures(n),e=!0,s=!1,console.log(`✓ Strandopgangen geladen (${n.length} locaties)`)}}),t}export{k as createStrandopgangenLayerOL};
//# sourceMappingURL=strandopgangenOL-Dn3ZlFkZ.js.map

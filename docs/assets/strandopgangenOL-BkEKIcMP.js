import{f as i,P as h,g,V as f,c as w,S as d,h as p}from"./index-CPQ8Ylbs.js";const s="strandopgangen_cache",u=10080*60*1e3;async function m(){try{const a=localStorage.getItem(s);if(a){const{timestamp:o,data:n}=JSON.parse(a);if(Date.now()-o<u)return console.log(`✓ Strandopgangen loaded from cache (${n.length} locations)`),n}}catch{}const r=`
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
  `;try{const a=await fetch("https://overpass-api.de/api/interpreter",{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:`data=${encodeURIComponent(r)}`});if(!a.ok)throw new Error(`Overpass API error: ${a.status}`);const n=(await a.json()).elements.filter(e=>{const t=e.lon??e.center?.lon,c=e.lat??e.center?.lat;return t&&c}).map(e=>{const t=e.tags||{},c=e.lon??e.center?.lon,l=e.lat??e.center?.lat;return{lon:c,lat:l,name:t.name||t.ref||"Strandopgang",ref:t.ref,access:t.access,wheelchair:t.wheelchair,surface:t.surface}});try{const e={timestamp:Date.now(),data:n};localStorage.setItem(s,JSON.stringify(e))}catch{}return console.log(`✓ Strandopgangen fetched from OSM (${n.length} locations)`),n}catch(a){console.warn("⚠ Failed to fetch strandopgangen from Overpass:",a);try{const o=localStorage.getItem(s);if(o){const{data:n}=JSON.parse(o);return console.log(`✓ Using stale cache (${n.length} locations)`),n}}catch{}return[]}}function y(){return"data:image/svg+xml;charset=utf-8,"+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 32 32">
    <circle cx="16" cy="16" r="13" fill="#0891b2" stroke="white" stroke-width="2"/>
    <g transform="translate(6, 8)" fill="white">
      <path d="M2 8c2-2 4-2 6 0s4 2 6 0s4-2 6 0" stroke="white" stroke-width="2" fill="none"/>
      <path d="M2 12c2-2 4-2 6 0s4 2 6 0s4-2 6 0" stroke="white" stroke-width="2" fill="none"/>
      <circle cx="10" cy="4" r="3" fill="white"/>
    </g>
  </svg>`)}function S(r){let a=1;return r>150?a=.5:r>75?a=.6:r>40?a=.7:r>20?a=.85:r>10?a=1:a=1.2,new d({image:new p({src:y(),scale:a,anchor:[.5,.5]})})}async function v(){const a=(await m()).map(e=>new i({geometry:new h(g([e.lon,e.lat])),name:e.name,ref:e.ref,access:e.access,wheelchair:e.wheelchair,surface:e.surface})),o=new f({features:a});return new w({source:o,properties:{title:"Strandopgangen",type:"overlay"},visible:!1,style:(e,t)=>S(t),zIndex:27})}export{v as createStrandopgangenLayerOL};
//# sourceMappingURL=strandopgangenOL-BkEKIcMP.js.map

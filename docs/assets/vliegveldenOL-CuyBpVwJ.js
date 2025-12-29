import{d as o,G as i,V as r,S as n,h as s}from"./index-CA8hkokG.js";async function d(){try{const e=await fetch("/detectorapp-nl/data/military/vliegvelden.geojson");if(!e.ok)throw new Error("Failed to load vliegvelden data");const t=await e.json(),l=new o({features:new i().readFeatures(t,{dataProjection:"EPSG:4326",featureProjection:"EPSG:3857"})}),a=new r({source:l,properties:{title:"Militaire Vliegvelden"},visible:!1,zIndex:34,style:new n({image:new s({src:"data:image/svg+xml,"+encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="11" fill="#0369a1" stroke="white" stroke-width="2"/>
              <path d="M12 4l-1 5H5l2 3-2 3h6l1 5 1-5h6l-2-3 2-3h-6z" fill="white"/>
            </svg>
          `),scale:1,anchor:[.5,.5]})})});return console.log(`✈️ Militaire Vliegvelden loaded (${t.features.length} locations)`),a}catch(e){return console.error("Failed to load vliegvelden:",e),new r({source:new o,properties:{title:"Militaire Vliegvelden"},visible:!1,zIndex:34})}}export{d as createVliegveldenLayerOL};
//# sourceMappingURL=vliegveldenOL-CuyBpVwJ.js.map

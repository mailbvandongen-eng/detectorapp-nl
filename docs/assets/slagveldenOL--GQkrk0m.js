import{d as o,G as n,V as a,S as s,h as c}from"./index-DlBeXyqw.js";async function d(){try{const e=await fetch("/detectorapp-nl/data/military/slagvelden.geojson");if(!e.ok)throw new Error("Failed to load slagvelden data");const t=await e.json(),r=new o({features:new n().readFeatures(t,{dataProjection:"EPSG:4326",featureProjection:"EPSG:3857"})}),l=new a({source:r,properties:{title:"Slagvelden"},visible:!1,zIndex:35,style:new s({image:new c({src:"data:image/svg+xml,"+encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="11" fill="#dc2626" stroke="white" stroke-width="2"/>
              <path d="M12 6l2 4h4l-3 3 1 5-4-2-4 2 1-5-3-3h4z" fill="white"/>
            </svg>
          `),scale:1,anchor:[.5,.5]})})});return console.log(`⚔️ Slagvelden loaded (${t.features.length} locations)`),l}catch(e){return console.error("Failed to load slagvelden:",e),new a({source:new o,properties:{title:"Slagvelden"},visible:!1,zIndex:35})}}export{d as createSlagveldenLayerOL};
//# sourceMappingURL=slagveldenOL--GQkrk0m.js.map

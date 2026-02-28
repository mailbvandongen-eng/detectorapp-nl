import{U as a,ca as i}from"./index-DNMHyoOR.js";function s(e){const t="metric";if(e==null)return t;const r=e.map,n=(r&&"portalItem"in r?r.portalItem?.portal:null)??a.getDefault();switch(n.user?.units??n.units){case t:return t;case"english":return"imperial"}return i(e.spatialReference)??t}export{s as e};
//# sourceMappingURL=getDefaultUnitForView-C6UNTEmX.js.map

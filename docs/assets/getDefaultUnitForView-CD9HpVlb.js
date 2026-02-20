import{M as i,du as l}from"./index-DpRbc06E.js";function a(e){const t="metric";if(e==null)return t;const r=e.map,n=(r&&"portalItem"in r?r.portalItem?.portal:null)??i.getDefault();switch(n.user?.units??n.units){case t:return t;case"english":return"imperial"}return l(e.spatialReference)??t}export{a as e};
//# sourceMappingURL=getDefaultUnitForView-CD9HpVlb.js.map

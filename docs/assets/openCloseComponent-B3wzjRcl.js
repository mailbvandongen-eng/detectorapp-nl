import{w as a}from"./dom-BukrOESi.js";function e(i){return i[i.openProp||"open"]}async function s(i){await i.updateComplete,e(i)?i.onBeforeOpen():i.onBeforeClose(),await i.updateComplete,i.transitionEl&&await a(i.transitionEl,i.transitionProp),e(i)?i.onOpen():i.onClose()}export{s as t};
//# sourceMappingURL=openCloseComponent-B3wzjRcl.js.map

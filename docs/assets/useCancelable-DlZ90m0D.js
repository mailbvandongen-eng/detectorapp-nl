import{a as o}from"./index-amqnoDti.js";const s=()=>o((c,a)=>{const e=new Set;return a.onDisconnected(()=>{e.forEach(r=>r.cancel())}),{add:r=>{[r].flat().forEach(n=>e.add(n))},resources:e}});export{s as u};
//# sourceMappingURL=useCancelable-DlZ90m0D.js.map

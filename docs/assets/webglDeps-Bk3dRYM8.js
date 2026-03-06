import{o as h}from"./BufferObject-CdoRi3PB.js";import{m as y,s as _}from"./FramebufferObject-BkmYOEut.js";import{s as c}from"./ProgramTemplate-SHP4zYy-.js";import{e as F,a as j}from"./ProgramTemplate-SHP4zYy-.js";import{fF as v}from"./index-Baa6cpJ9.js";import{h as w}from"./VertexArrayObject-Cz74Hq_t.js";import"./VertexAttributeLocations-BfZbt_DV.js";class l{constructor(e){this._rctx=e,this._store=new Map}dispose(){this._store.forEach(e=>e.dispose()),this._store.clear()}acquire(e,r,t,s){const n=e+r+JSON.stringify(Array.from(t.entries())),o=this._store.get(n);if(o!=null)return o.ref(),o;const i=new c(this._rctx,e,r,t,s);return i.ref(),this._store.set(n,i),i}get test(){}}function p(f){const{options:e,value:r}=f;return typeof e[r]=="number"}function d(f){let e="";for(const r in f){const t=f[r];if(typeof t=="boolean")t&&(e+=`#define ${r}
`);else if(typeof t=="number")e+=`#define ${r} ${t.toFixed()}
`;else if(typeof t=="object")if(p(t)){const{value:s,options:n,namespace:o}=t,i=o?`${o}_`:"";for(const a in n)e+=`#define ${i}${a} ${n[a].toFixed()}
`;e+=`#define ${r} ${i}${s}
`}else{const s=t.options;let n=0;for(const o in s)e+=`#define ${s[o]} ${(n++).toFixed()}
`;e+=`#define ${r} ${s[t.value]}
`}}return e}export{h as BufferObject,y as FramebufferObject,c as Program,l as ProgramCache,_ as Renderbuffer,F as ShaderCompiler,v as Texture,w as VertexArrayObject,j as createProgram,d as glslifyDefineMap};
//# sourceMappingURL=webglDeps-Bk3dRYM8.js.map

import{tf as kt,Ar as Nt,e1 as Yt,ep as Wt,vG as Xt,aX as bt,dU as Zt,As as Qt,At as Jt,xb as Kt,fm as Ye,qJ as eo,er as wt,da as to,Au as oo,Av as no,Aw as so,zS as io,zT as ao,zU as ro,jG as lo,eS as co,f5 as oe,dZ as _,f2 as Y,d$ as L,eh as k,e$ as G,f0 as q,uQ as uo,f9 as fo,fJ as po,dX as ne,eY as re,eq as Ke,dY as yt,dV as We,eL as Xe,nv as ho,m0 as Ze,vE as vo,kg as go,jP as mo,_ as xo,lu as et,at as E,kl as tt,jL as Pt,e8 as $t,mh as Ve,nu as St,et as zt,eU as we,f8 as At,cO as bo,hA as wo,fU as ot,jH as yo,fF as Po,ej as $o}from"./index-D0Ykj03m.js";import{u as So}from"./meshVertexSpaceUtils-CUKpr1Tx.js";import{o as zo,x as Ao}from"./hydratedFeatures-Y-9o37a0.js";import{r as I,t as nt,n as W}from"./vec3f32-WCVSSNPR.js";import{aW as Oo,n as X,m as Z,aX as st,aH as Ot,D as Co,ax as Mo,aq as Qe,r as Be,a6 as Me,aY as Do,af as Vo,aL as Ct,aZ as Mt,as as jo,K as To,ap as Dt,i as _o,a_ as Fo,G as Ro,H as Eo,M as Uo,al as it,L as _e,b as at,aI as Ho,a2 as te,ai as Io,a as Bo,j as Go,k as Lo,W as qo,V as ko,X as Vt,Y as No,x as U,A as Yo,a$ as Fe,t as Wo,b0 as Xo,b1 as Zo,b2 as Qo,aB as Jo,b3 as Ko,b4 as en,b5 as tn,b6 as rt,b7 as on,b8 as lt,b9 as ct,ba as nn,aD as sn}from"./OutputColorHighlightOID.glsl-qfqhOQSk.js";import{A as an,U as jt}from"./Indices-DY5dT5sI.js";import{t as M}from"./orientedBoundingBox-Bohmpz14.js";import{s as Tt,g as rn}from"./BufferView-BGVdA1u3.js";import{Q as _t,t as ln}from"./InterleavedLayout-DuFMKCwE.js";import{T as cn,d as un,c as fn}from"./renderState-CKc66y4x.js";import{t as pn}from"./VertexAttributeLocations-BfZbt_DV.js";import{t as $,n as H}from"./glsl-B5bJgrnA.js";import{s as dn}from"./ShaderBuilder-DfzhOPB4.js";function hs(o,e){if(o.type==="point")return ee(o,e,!1);if(zo(o))switch(o.type){case"extent":return ee(o.center,e,!1);case"polygon":return ee(ft(o),e,!1);case"polyline":return ee(ut(o),e,!0);case"mesh":return ee(So(o.vertexSpace,o.spatialReference)??o.extent.center,e,!1);case"multipoint":return}else switch(o.type){case"extent":return ee(hn(o),e,!0);case"polygon":return ee(ft(o),e,!0);case"polyline":return ee(ut(o),e,!0);case"multipoint":return}}function ut(o){const e=o.paths[0];if(!e||e.length===0)return null;const n=Jt(e,Kt(e)/2);return Ye(n[0],n[1],n[2],o.spatialReference)}function hn(o){return Ye(.5*(o.xmax+o.xmin),.5*(o.ymax+o.ymin),o.zmin!=null&&o.zmax!=null&&isFinite(o.zmin)&&isFinite(o.zmax)?.5*(o.zmax+o.zmin):void 0,o.spatialReference)}function ft(o){const e=o.rings[0];if(!e||e.length===0)return null;const n=eo(o.rings,!!o.hasZ);return Ye(n[0],n[1],n[2],o.spatialReference)}function ee(o,e,n){const t=n?o:Ao(o);return e&&o?Qt(o,t,e)?t:null:t}function vs(o,e,n,t=0){if(o){e||(e=bt());const s=o;let a=.5*s.width*(n-1),i=.5*s.height*(n-1);return s.width<1e-7*s.height?a+=i/20:s.height<1e-7*s.width&&(i+=a/20),Zt(e,s.xmin-a-t,s.ymin-i-t,s.xmax+a+t,s.ymax+i+t),e}return null}function gs(o,e,n=null){const t=Nt(Xt);return o!=null&&(t[0]=o[0],t[1]=o[1],t[2]=o[2],o.length>3&&(t[3]=o[3])),e!=null&&(t[3]=e),n&&Yt(t,t,n),t}function ms(o=kt,e,n,t=1){const s=new Array(3);if(e==null||n==null)s[0]=1,s[1]=1,s[2]=1;else{let a,i=0;for(let r=2;r>=0;r--){const l=o[r],c=l!=null,u=r===0&&!a&&!c,p=n[r];let h;l==="symbol-value"||u?h=p!==0?e[r]/p:1:c&&l!=="proportional"&&isFinite(l)&&(h=p!==0?l/p:1),h!=null&&(s[r]=h,a=h,i=Math.max(i,Math.abs(h)))}for(let r=2;r>=0;r--)s[r]==null?s[r]=a:s[r]===0&&(s[r]=.001*i)}for(let a=2;a>=0;a--)s[a]/=t;return Wt(s)}function vn(o){return o.isPrimitive!=null}function xs(o){return gn(vn(o)?[o.width,o.depth,o.height]:o)?null:"Symbol sizes may not be negative values"}function gn(o){const e=n=>n==null||n>=0;return Array.isArray(o)?o.every(e):e(o)}function bs(o,e,n,t=wt()){return o&&io(t,t,-o/180*Math.PI),e&&ao(t,t,e/180*Math.PI),n&&ro(t,t,n/180*Math.PI),t}function ws(o,e,n){if(n.minDemResolution!=null)return n.minDemResolution;const t=to(e),s=oo(o)*t,a=no(o)*t,i=so(o)*(e.isGeographic?1:t);return s===0&&a===0&&i===0?n.minDemResolutionForPoints:.01*Math.max(s,a,i)}function pt(o,e){const n=o[e],t=o[e+1],s=o[e+2];return Math.sqrt(n*n+t*t+s*s)}function mn(o,e){const n=o[e],t=o[e+1],s=o[e+2],a=1/Math.sqrt(n*n+t*t+s*s);o[e]*=a,o[e+1]*=a,o[e+2]*=a}function dt(o,e,n){o[e]*=n,o[e+1]*=n,o[e+2]*=n}function xn(o,e,n,t,s,a=e){(s=s||o)[a]=o[e]+n[t],s[a+1]=o[e+1]+n[t+1],s[a+2]=o[e+2]+n[t+2]}function bn(){return ht??=wn(),ht}function wn(){const n=new M([0,0,0,255,255,0,255,255],[0,1,2,3],2,!0);return new Oo([["uv0",n]])}let ht=null;const Re=[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5]],yn=[0,0,1,-1,0,0,1,0,0,0,-1,0,0,1,0,0,0,-1],Pn=[0,0,1,0,1,1,0,1],$n=[0,1,2,2,3,0,4,0,3,3,7,4,1,5,6,6,2,1,1,0,4,4,5,1,3,2,6,6,7,3,5,4,7,7,6,5],Ft=new Array(36);for(let o=0;o<6;o++)for(let e=0;e<6;e++)Ft[6*o+e]=o;const ie=new Array(36);for(let o=0;o<6;o++)ie[6*o]=0,ie[6*o+1]=1,ie[6*o+2]=2,ie[6*o+3]=2,ie[6*o+4]=3,ie[6*o+5]=0;function ys(o,e){Array.isArray(e)||(e=[e,e,e]);const n=new Array(24);for(let t=0;t<8;t++)n[3*t]=Re[t][0]*e[0],n[3*t+1]=Re[t][1]*e[1],n[3*t+2]=Re[t][2]*e[2];return new Z(o,[["position",new M(n,$n,3,!0)],["normal",new M(yn,Ft,3)],["uv0",new M(Pn,ie,2)]])}const Ee=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[0,-.5,0],[0,.5,0]],Sn=[0,1,-1,1,1,0,0,1,1,-1,1,0,0,-1,-1,1,-1,0,0,-1,1,-1,-1,0],zn=[5,1,0,5,2,1,5,3,2,5,0,3,4,0,1,4,1,2,4,2,3,4,3,0],An=[0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7];function Ps(o,e){Array.isArray(e)||(e=[e,e,e]);const n=new Array(18);for(let t=0;t<6;t++)n[3*t]=Ee[t][0]*e[0],n[3*t+1]=Ee[t][1]*e[1],n[3*t+2]=Ee[t][2]*e[2];return new Z(o,[["position",new M(n,zn,3,!0)],["normal",new M(Sn,An,3)]])}const $e=I(-.5,0,-.5),Se=I(.5,0,-.5),ze=I(0,0,.5),Ae=I(0,.5,0),ce=W(),ue=W(),pe=W(),de=W(),he=W();Y(ce,$e,Ae),Y(ue,$e,Se),ne(pe,ce,ue),L(pe,pe),Y(ce,Se,Ae),Y(ue,Se,ze),ne(de,ce,ue),L(de,de),Y(ce,ze,Ae),Y(ue,ze,$e),ne(he,ce,ue),L(he,he);const Ue=[$e,Se,ze,Ae],On=[0,-1,0,pe[0],pe[1],pe[2],de[0],de[1],de[2],he[0],he[1],he[2]],Cn=[0,1,2,3,1,0,3,2,1,3,0,2],Mn=[0,0,0,1,1,1,2,2,2,3,3,3];function $s(o,e){Array.isArray(e)||(e=[e,e,e]);const n=new Array(12);for(let t=0;t<4;t++)n[3*t]=Ue[t][0]*e[0],n[3*t+1]=Ue[t][1]*e[1],n[3*t+2]=Ue[t][2]*e[2];return new Z(o,[["position",new M(n,Cn,3,!0)],["normal",new M(On,Mn,3)]])}function Ss(o,e,n,t,s={uv:!0}){const a=-Math.PI,i=2*Math.PI,r=-Math.PI/2,l=Math.PI,c=Math.max(3,Math.floor(n)),u=Math.max(2,Math.floor(t)),p=(c+1)*(u+1),h=X(3*p),w=X(3*p),y=X(2*p),m=[];let d=0;for(let x=0;x<=u;x++){const O=[],f=x/u,z=r+f*l,A=Math.cos(z);for(let P=0;P<=c;P++){const B=P/c,b=a+B*i,j=Math.cos(b)*A,V=Math.sin(z),Q=-Math.sin(b)*A;h[3*d]=j*e,h[3*d+1]=V*e,h[3*d+2]=Q*e,w[3*d]=j,w[3*d+1]=V,w[3*d+2]=Q,y[2*d]=B,y[2*d+1]=f,O.push(d),++d}m.push(O)}const v=new Array;for(let x=0;x<u;x++)for(let O=0;O<c;O++){const f=m[x][O],z=m[x][O+1],A=m[x+1][O+1],P=m[x+1][O];x===0?(v.push(f),v.push(A),v.push(P)):x===u-1?(v.push(f),v.push(z),v.push(A)):(v.push(f),v.push(z),v.push(A),v.push(A),v.push(P),v.push(f))}const g=[["position",new M(h,v,3,!0)],["normal",new M(w,v,3,!0)]];return s.uv&&g.push(["uv0",new M(y,v,2,!0)]),s.offset&&(g[0][0]="offset",g.push(["position",new M(Float64Array.from(s.offset),jt(v.length),3,!0)])),new Z(o,g)}function zs(o,e,n,t){const s=Dn(e,n);return new Z(o,s)}function Dn(o,e,n){let t,s;t=[0,-1,0,1,0,0,0,0,1,-1,0,0,0,0,-1,0,1,0],s=[0,1,2,0,2,3,0,3,4,0,4,1,1,5,2,2,5,3,3,5,4,4,5,1];for(let l=0;l<t.length;l+=3)dt(t,l,o/pt(t,l));let a={};function i(l,c){l>c&&([l,c]=[c,l]);const u=l.toString()+"."+c.toString();if(a[u])return a[u];let p=t.length;return t.length+=3,xn(t,3*l,t,3*c,t,p),dt(t,p,o/pt(t,p)),p/=3,a[u]=p,p}for(let l=0;l<e;l++){const c=s.length,u=new Array(4*c);for(let p=0;p<c;p+=3){const h=s[p],w=s[p+1],y=s[p+2],m=i(h,w),d=i(w,y),v=i(y,h),g=4*p;u[g]=h,u[g+1]=m,u[g+2]=v,u[g+3]=w,u[g+4]=d,u[g+5]=m,u[g+6]=y,u[g+7]=v,u[g+8]=d,u[g+9]=m,u[g+10]=d,u[g+11]=v}s=u,a={}}const r=st(t);for(let l=0;l<r.length;l+=3)mn(r,l);return[["position",new M(st(t),s,3,!0)],["normal",new M(r,s,3,!0)]]}function As(o,{normal:e,position:n,color:t,rotation:s,size:a,centerOffsetAndDistance:i,uvi:r,featureAttribute:l,olidColor:c=null}={}){const u=n?Ke(n):_(),p=e?Ke(e):yt(0,0,1),h=t?[t[0],t[1],t[2],t.length>3?t[3]:255]:[255,255,255,255],w=a!=null&&a.length===2?a:[1,1],y=s!=null?[s]:[0],m=jt(1),d=[["position",new M(u,m,3,!0)],["normal",new M(p,m,3,!0)],["color",new M(h,m,4,!0)],["size",new M(w,m,2)],["rotation",new M(y,m,1,!0)]];if(r&&d.push(["uvi",new M(r,m,r.length)]),i!=null){const v=[i[0],i[1],i[2],i[3]];d.push(["centerOffsetAndDistance",new M(v,m,4)])}if(l){const v=[l[0],l[1],l[2],l[3]];d.push(["featureAttribute",new M(v,m,4)])}return new Z(o,d,null,1,c,void 0,bn())}function Vn(o,e,n,t,s=!0,a=!0){let i=0;const r=e,l=o;let c=I(0,i,0),u=I(0,i+l,0),p=I(0,-1,0),h=I(0,1,0);t&&(i=l,u=I(0,0,0),c=I(0,i,0),p=I(0,1,0),h=I(0,-1,0));const w=[u,c],y=[p,h],m=n+2,d=Math.sqrt(l*l+r*r);if(t)for(let f=n-1;f>=0;f--){const z=f*(2*Math.PI/n),A=I(Math.cos(z)*r,i,Math.sin(z)*r);w.push(A);const P=I(l*Math.cos(z)/d,-r/d,l*Math.sin(z)/d);y.push(P)}else for(let f=0;f<n;f++){const z=f*(2*Math.PI/n),A=I(Math.cos(z)*r,i,Math.sin(z)*r);w.push(A);const P=I(l*Math.cos(z)/d,r/d,l*Math.sin(z)/d);y.push(P)}const v=new Array,g=new Array;if(s){for(let f=3;f<w.length;f++)v.push(1),v.push(f-1),v.push(f),g.push(0),g.push(0),g.push(0);v.push(w.length-1),v.push(2),v.push(1),g.push(0),g.push(0),g.push(0)}if(a){for(let f=3;f<w.length;f++)v.push(f),v.push(f-1),v.push(0),g.push(f),g.push(f-1),g.push(1);v.push(0),v.push(2),v.push(w.length-1),g.push(1),g.push(2),g.push(y.length-1)}const x=X(3*m);for(let f=0;f<m;f++)x[3*f]=w[f][0],x[3*f+1]=w[f][1],x[3*f+2]=w[f][2];const O=X(3*m);for(let f=0;f<m;f++)O[3*f]=y[f][0],O[3*f+1]=y[f][1],O[3*f+2]=y[f][2];return[["position",new M(x,v,3,!0)],["normal",new M(O,g,3,!0)]]}function Os(o,e,n,t,s,a=!0,i=!0){return new Z(o,Vn(e,n,t,s,a,i))}function Cs(o,e,n,t,s,a,i){const r=s?nt(s):I(1,0,0),l=a?nt(a):I(0,0,0);i??=!0;const c=W();L(c,r);const u=W();G(u,c,Math.abs(e));const p=W();G(p,u,-.5),q(p,p,l);const h=I(0,1,0);Math.abs(1-We(c,h))<.2&&oe(h,0,0,1);const w=W();ne(w,c,h),L(w,w),ne(h,w,c);const y=2*t+(i?2:0),m=t+(i?2:0),d=X(3*y),v=X(3*m),g=X(2*y),x=new Array(3*t*(i?4:2)),O=new Array(3*t*(i?4:2));i&&(d[3*(y-2)]=p[0],d[3*(y-2)+1]=p[1],d[3*(y-2)+2]=p[2],g[2*(y-2)]=0,g[2*(y-2)+1]=0,d[3*(y-1)]=d[3*(y-2)]+u[0],d[3*(y-1)+1]=d[3*(y-2)+1]+u[1],d[3*(y-1)+2]=d[3*(y-2)+2]+u[2],g[2*(y-1)]=1,g[2*(y-1)+1]=1,v[3*(m-2)]=-c[0],v[3*(m-2)+1]=-c[1],v[3*(m-2)+2]=-c[2],v[3*(m-1)]=c[0],v[3*(m-1)+1]=c[1],v[3*(m-1)+2]=c[2]);const f=(b,j,V)=>{x[b]=j,O[b]=V};let z=0;const A=W(),P=W();for(let b=0;b<t;b++){const j=b*(2*Math.PI/t);G(A,h,Math.sin(j)),G(P,w,Math.cos(j)),q(A,A,P),v[3*b]=A[0],v[3*b+1]=A[1],v[3*b+2]=A[2],G(A,A,n),q(A,A,p),d[3*b]=A[0],d[3*b+1]=A[1],d[3*b+2]=A[2],g[2*b]=b/t,g[2*b+1]=0,d[3*(b+t)]=d[3*b]+u[0],d[3*(b+t)+1]=d[3*b+1]+u[1],d[3*(b+t)+2]=d[3*b+2]+u[2],g[2*(b+t)]=b/t,g[2*b+1]=1;const V=(b+1)%t;f(z++,b,b),f(z++,b+t,b),f(z++,V,V),f(z++,V,V),f(z++,b+t,b),f(z++,V+t,V)}if(i){for(let b=0;b<t;b++){const j=(b+1)%t;f(z++,y-2,m-2),f(z++,b,m-2),f(z++,j,m-2)}for(let b=0;b<t;b++){const j=(b+1)%t;f(z++,b+t,m-1),f(z++,y-1,m-1),f(z++,j+t,m-1)}}const B=[["position",new M(d,x,3,!0)],["normal",new M(v,O,3,!0)],["uv0",new M(g,x,2,!0)]];return new Z(o,B)}function Ms(o,e,n,t,s,a){t=t||10,s=s==null||s,Tt(e.length>1);const i=[[0,0,0]],r=[],l=[];for(let c=0;c<t;c++){r.push([0,-c-1,-(c+1)%t-1]);const u=c/t*2*Math.PI;l.push([Math.cos(u)*n,Math.sin(u)*n])}return jn(o,l,e,i,r,s,a)}function jn(o,e,n,t,s,a,i=I(0,0,0)){const r=e.length,l=X(n.length*r*3+(6*t.length||0)),c=X(n.length*r*3+(t?6:0)),u=new Array,p=new Array;let h=0,w=0;const y=_(),m=_(),d=_(),v=_(),g=_(),x=_(),O=_(),f=_(),z=_(),A=_(),P=_(),B=_(),b=_(),j=co();oe(z,0,1,0),Y(m,n[1],n[0]),L(m,m),a?(q(f,n[0],i),L(d,f)):oe(d,0,0,1),vt(m,d,z,z,g,d,gt),k(v,d),k(B,g);for(let S=0;S<t.length;S++)G(x,g,t[S][0]),G(f,d,t[S][2]),q(x,x,f),q(x,x,n[0]),l[h++]=x[0],l[h++]=x[1],l[h++]=x[2];c[w++]=-m[0],c[w++]=-m[1],c[w++]=-m[2];for(let S=0;S<s.length;S++)u.push(s[S][0]>0?s[S][0]:-s[S][0]-1+t.length),u.push(s[S][1]>0?s[S][1]:-s[S][1]-1+t.length),u.push(s[S][2]>0?s[S][2]:-s[S][2]-1+t.length),p.push(0),p.push(0),p.push(0);let V=t.length;const Q=t.length-1;for(let S=0;S<n.length;S++){let me=!1;S>0&&(k(y,m),S<n.length-1?(Y(m,n[S+1],n[S]),L(m,m)):me=!0,q(A,y,m),L(A,A),q(P,n[S-1],v),uo(n[S],A,j),fo(j,po(P,y),f)?(Y(f,f,n[S]),L(d,f),ne(g,A,d),L(g,g)):vt(A,v,B,z,g,d,gt),k(v,d),k(B,g)),a&&(q(f,n[S],i),L(b,f));for(let K=0;K<r;K++)if(G(x,g,e[K][0]),G(f,d,e[K][1]),q(x,x,f),L(O,x),c[w++]=O[0],c[w++]=O[1],c[w++]=O[2],q(x,x,n[S]),l[h++]=x[0],l[h++]=x[1],l[h++]=x[2],!me){const je=(K+1)%r;u.push(V+K),u.push(V+r+K),u.push(V+je),u.push(V+je),u.push(V+r+K),u.push(V+r+je);for(let Te=0;Te<6;Te++){const qt=u.length-6;p.push(u[qt+Te]-Q)}}V+=r}const le=n[n.length-1];for(let S=0;S<t.length;S++)G(x,g,t[S][0]),G(f,d,t[S][1]),q(x,x,f),q(x,x,le),l[h++]=x[0],l[h++]=x[1],l[h++]=x[2];const J=w/3;c[w++]=m[0],c[w++]=m[1],c[w++]=m[2];const N=V-r;for(let S=0;S<s.length;S++)u.push(s[S][0]>=0?V+s[S][0]:-s[S][0]-1+N),u.push(s[S][2]>=0?V+s[S][2]:-s[S][2]-1+N),u.push(s[S][1]>=0?V+s[S][1]:-s[S][1]-1+N),p.push(J),p.push(J),p.push(J);const se=[["position",new M(l,u,3,!0)],["normal",new M(c,p,3,!0)]];return new Z(o,se)}function Ds(o,e,n,t,s){const a=lo(3*e.length),i=new Array(2*(e.length-1));let r=0,l=0;for(let u=0;u<e.length;u++){for(let p=0;p<3;p++)a[r++]=e[u][p];u>0&&(i[l++]=u-1,i[l++]=u)}const c=[["position",new M(a,i,3,!0)]];if(n&&n.length===e.length&&n[0].length===3){const u=X(3*n.length);let p=0;for(let h=0;h<e.length;h++)for(let w=0;w<3;w++)u[p++]=n[h][w];c.push(["normal",new M(u,i,3,!0)])}return t&&c.push(["color",new M(t,an(t.length/4),4)]),new Z(o,c,null,2)}function Vs(o,e,n,t,s,a=0){const i=new Array(18),r=[[-n,a,s/2],[t,a,s/2],[0,e+a,s/2],[-n,a,-s/2],[t,a,-s/2],[0,e+a,-s/2]],l=[0,1,2,3,0,2,2,5,3,1,4,5,5,2,1,1,0,3,3,4,1,4,3,5];for(let c=0;c<6;c++)i[3*c]=r[c][0],i[3*c+1]=r[c][1],i[3*c+2]=r[c][2];return new Z(o,[["position",new M(i,l,3,!0)]])}function js(o,e){const n=o.getMutableAttribute("position").data;for(let t=0;t<n.length;t+=3){const s=n[t],a=n[t+1],i=n[t+2];oe(fe,s,a,i),re(fe,fe,e),n[t]=fe[0],n[t+1]=fe[1],n[t+2]=fe[2]}}function Ts(o,e=o){const n=o.attributes,t=n.get("position").data,s=n.get("normal").data;if(s){const a=e.getMutableAttribute("normal").data;for(let i=0;i<s.length;i+=3){const r=s[i+1];a[i+1]=-s[i+2],a[i+2]=r}}if(t){const a=e.getMutableAttribute("position").data;for(let i=0;i<t.length;i+=3){const r=t[i+1];a[i+1]=-t[i+2],a[i+2]=r}}}function He(o,e,n,t,s){return!(Math.abs(We(e,o))>s)&&(ne(n,o,e),L(n,n),ne(t,n,o),L(t,t),!0)}function vt(o,e,n,t,s,a,i){return He(o,e,s,a,i)||He(o,n,s,a,i)||He(o,t,s,a,i)}const gt=.99619469809,fe=_();function Tn(o){return o instanceof Float32Array&&o.length>=16}function _n(o){return Array.isArray(o)&&o.length>=16}function Fn(o){return Tn(o)||_n(o)}const Rt=.5;function Rn(o,e){o.include(Ot),o.attributes.add("position","vec3"),o.attributes.add("normal","vec3"),o.attributes.add("centerOffsetAndDistance","vec4");const n=o.vertex;Co(n,e),Mo(n,e),n.uniforms.add(new Qe("viewport",t=>t.camera.fullViewport),new Be("polygonOffset",t=>t.shaderPolygonOffset),new Me("cameraGroundRelative",t=>t.camera.aboveGround?1:-1)),e.hasVerticalOffset&&Do(n),n.code.add($`struct ProjectHUDAux {
vec3 posModel;
vec3 posView;
vec3 vnormal;
float distanceToCamera;
float absCosAngle;
};`),n.code.add($`
    float applyHUDViewDependentPolygonOffset(float pointGroundDistance, float absCosAngle, inout vec3 posView) {
      float pointGroundSign = ${e.terrainDepthTest?$.float(0):$`sign(pointGroundDistance)`};
      if (pointGroundSign == 0.0) {
        pointGroundSign = cameraGroundRelative;
      }

      // cameraGroundRelative is -1 if camera is below ground, 1 if above ground
      // groundRelative is 1 if both camera and symbol are on the same side of the ground, -1 otherwise
      float groundRelative = cameraGroundRelative * pointGroundSign;

      // view angle dependent part of polygon offset emulation: we take the absolute value because the sign that is
      // dropped is instead introduced using the ground-relative position of the symbol and the camera
      if (polygonOffset > .0) {
        float cosAlpha = clamp(absCosAngle, 0.01, 1.0);
        float tanAlpha = sqrt(1.0 - cosAlpha * cosAlpha) / cosAlpha;
        float factor = (1.0 - tanAlpha / viewport[2]);

        // same side of the terrain
        if (groundRelative > 0.0) {
          posView *= factor;
        }
        // opposite sides of the terrain
        else {
          posView /= factor;
        }
      }

      return groundRelative;
    }
  `),e.draped&&!e.hasVerticalOffset||Vo(n),e.draped||(n.uniforms.add(new Me("perDistancePixelRatio",t=>Math.tan(t.camera.fovY/2)/(t.camera.fullViewport[2]/2))),n.code.add($`
    void applyHUDVerticalGroundOffset(vec3 normalModel, inout vec3 posModel, inout vec3 posView) {
      float distanceToCamera = length(posView);

      // Compute offset in world units for a half pixel shift
      float pixelOffset = distanceToCamera * perDistancePixelRatio * ${$.float(Rt)};

      // Apply offset along normal in the direction away from the ground surface
      vec3 modelOffset = normalModel * cameraGroundRelative * pixelOffset;

      // Apply the same offset also on the view space position
      vec3 viewOffset = (viewNormal * vec4(modelOffset, 1.0)).xyz;

      posModel += modelOffset;
      posView += viewOffset;
    }
  `)),e.screenCenterOffsetUnitsEnabled&&Ct(n),e.hasScreenSizePerspective&&Mt(n),n.code.add($`
    vec4 projectPositionHUD(out ProjectHUDAux aux) {
      vec3 centerOffset = centerOffsetAndDistance.xyz;
      float pointGroundDistance = centerOffsetAndDistance.w;

      aux.posModel = position;
      aux.posView = (view * vec4(aux.posModel, 1.0)).xyz;
      aux.vnormal = normal;
      ${e.draped?"":"applyHUDVerticalGroundOffset(aux.vnormal, aux.posModel, aux.posView);"}

      // Screen sized offset in world space, used for example for line callouts
      // Note: keep this implementation in sync with the CPU implementation, see
      //   - MaterialUtil.verticalOffsetAtDistance
      //   - HUDMaterial.applyVerticalOffsetTransformation

      aux.distanceToCamera = length(aux.posView);

      vec3 viewDirObjSpace = normalize(cameraPosition - aux.posModel);
      float cosAngle = dot(aux.vnormal, viewDirObjSpace);

      aux.absCosAngle = abs(cosAngle);

      ${e.hasScreenSizePerspective&&(e.hasVerticalOffset||e.screenCenterOffsetUnitsEnabled)?"vec3 perspectiveFactor = screenSizePerspectiveScaleFactor(aux.absCosAngle, aux.distanceToCamera, screenSizePerspectiveAlignment);":""}

      ${e.hasVerticalOffset?e.hasScreenSizePerspective?"float verticalOffsetScreenHeight = applyScreenSizePerspectiveScaleFactorFloat(verticalOffset.x, perspectiveFactor);":"float verticalOffsetScreenHeight = verticalOffset.x;":""}

      ${e.hasVerticalOffset?$`
            float worldOffset = clamp(verticalOffsetScreenHeight * verticalOffset.y * aux.distanceToCamera, verticalOffset.z, verticalOffset.w);
            vec3 modelOffset = aux.vnormal * worldOffset;
            aux.posModel += modelOffset;
            vec3 viewOffset = (viewNormal * vec4(modelOffset, 1.0)).xyz;
            aux.posView += viewOffset;
            // Since we elevate the object, we need to take that into account
            // in the distance to ground
            pointGroundDistance += worldOffset;`:""}

      float groundRelative = applyHUDViewDependentPolygonOffset(pointGroundDistance, aux.absCosAngle, aux.posView);

      ${e.screenCenterOffsetUnitsEnabled?"":$`
            // Apply x/y in view space, but z in screen space (i.e. along posView direction)
            aux.posView += vec3(centerOffset.x, centerOffset.y, 0.0);

            // Same material all have same z != 0.0 condition so should not lead to
            // branch fragmentation and will save a normalization if it's not needed
            if (centerOffset.z != 0.0) {
              aux.posView -= normalize(aux.posView) * centerOffset.z;
            }
          `}

      vec4 posProj = proj * vec4(aux.posView, 1.0);

      ${e.screenCenterOffsetUnitsEnabled?e.hasScreenSizePerspective?"float centerOffsetY = applyScreenSizePerspectiveScaleFactorFloat(centerOffset.y, perspectiveFactor);":"float centerOffsetY = centerOffset.y;":""}

      ${e.screenCenterOffsetUnitsEnabled?"posProj.xy += vec2(centerOffset.x, centerOffsetY) * pixelRatio * 2.0 / viewport.zw * posProj.w;":""}

      // constant part of polygon offset emulation
      posProj.z -= groundRelative * polygonOffset * posProj.w;
      return posProj;
    }
  `)}function Je(o){o.uniforms.add(new jo("alignPixelEnabled",e=>e.alignPixelEnabled)),o.code.add($`vec4 alignToPixelCenter(vec4 clipCoord, vec2 widthHeight) {
if (!alignPixelEnabled)
return clipCoord;
vec2 xy = vec2(0.500123) + 0.5 * clipCoord.xy / clipCoord.w;
vec2 pixelSz = vec2(1.0) / widthHeight;
vec2 ij = (floor(xy * widthHeight) + vec2(0.5)) * pixelSz;
vec2 result = (ij * 2.0 - vec2(1.0)) * clipCoord.w;
return vec4(result, clipCoord.zw);
}`),o.code.add($`vec4 alignToPixelOrigin(vec4 clipCoord, vec2 widthHeight) {
if (!alignPixelEnabled)
return clipCoord;
vec2 xy = vec2(0.5) + 0.5 * clipCoord.xy / clipCoord.w;
vec2 pixelSz = vec2(1.0) / widthHeight;
vec2 ij = floor((xy + 0.5 * pixelSz) * widthHeight) * pixelSz;
vec2 result = (ij * 2.0 - vec2(1.0)) * clipCoord.w;
return vec4(result, clipCoord.zw);
}`)}function En(o,e){const{vertex:n,fragment:t}=o;o.include(To,e),n.include(Je),n.main.add($`vec4 posProjCenter;
if (dot(position, position) > 0.0) {
ProjectHUDAux projectAux;
vec4 posProj = projectPositionHUD(projectAux);
posProjCenter = alignToPixelCenter(posProj, viewport.zw);
forwardViewPosDepth(projectAux.posView);
vec3 vpos = projectAux.posModel;
if (rejectBySlice(vpos)) {
posProjCenter = vec4(1e038, 1e038, 1e038, 1.0);
}
} else {
posProjCenter = vec4(1e038, 1e038, 1e038, 1.0);
}
gl_Position = posProjCenter;
gl_PointSize = 1.0;`),t.main.add($`fragColor = vec4(1);
if(discardByTerrainDepth()) {
fragColor.g = 0.5;
}`)}function Un(o){o.vertex.uniforms.add(new Me("renderTransparentlyOccludedHUD",e=>e.hudRenderStyle===0?1:e.hudRenderStyle===1?0:.75),new Qe("viewport",e=>e.camera.fullViewport),new Dt("hudVisibilityTexture",e=>e.hudVisibility?.getTexture())),o.vertex.include(Je),o.vertex.code.add($`bool testHUDVisibility(vec4 posProj) {
vec4 posProjCenter = alignToPixelCenter(posProj, viewport.zw);
vec4 occlusionPixel = texture(hudVisibilityTexture, .5 + .5 * posProjCenter.xy / posProjCenter.w);
if (renderTransparentlyOccludedHUD > 0.5) {
return occlusionPixel.r * occlusionPixel.g > 0.0 && occlusionPixel.g * renderTransparentlyOccludedHUD < 1.0;
}
return occlusionPixel.r * occlusionPixel.g > 0.0 && occlusionPixel.g == 1.0;
}`)}class Hn extends _o{constructor(e,n,t){super(e,"vec4",2,(s,a,i)=>s.setUniform4fv(e,n(a,i),t))}}function Et(o){const e=new dn,{signedDistanceFieldEnabled:n,occlusionTestEnabled:t,horizonCullingEnabled:s,pixelSnappingEnabled:a,hasScreenSizePerspective:i,debugDrawLabelBorder:r,hasVVSize:l,hasVVColor:c,hasRotation:u,occludedFragmentFade:p,sampleSignedDistanceFieldTexelCenter:h}=o;e.include(Rn,o),e.vertex.include(Fo,o);const{occlusionPass:w,output:y,oitPass:m}=o;if(w)return e.include(En,o),e;const{vertex:d,fragment:v}=e;e.include(Ot),e.include(Ro,o),e.include(Eo,o),t&&e.include(Un),v.include(Uo),e.varyings.add("vcolor","vec4"),e.varyings.add("vtc","vec2"),e.varyings.add("vsize","vec2");const g=y===9,x=g&&t;x&&e.varyings.add("voccluded","float"),d.uniforms.add(new Qe("viewport",P=>P.camera.fullViewport),new it("screenOffset",(P,B)=>Ze(Oe,2*P.screenOffset[0]*B.camera.pixelRatio,2*P.screenOffset[1]*B.camera.pixelRatio)),new it("anchorPosition",P=>ge(P)),new _e("materialColor",P=>P.color),new Be("materialRotation",P=>P.rotation),new at("tex",P=>P.texture)),Ct(d),n&&(d.uniforms.add(new _e("outlineColor",P=>P.outlineColor)),v.uniforms.add(new _e("outlineColor",P=>mt(P)?P.outlineColor:vo),new Be("outlineSize",P=>mt(P)?P.outlineSize:0))),s&&d.uniforms.add(new Hn("pointDistanceSphere",(P,B)=>{const b=B.camera.eye,j=P.origin;return go(j[0]-b[0],j[1]-b[1],j[2]-b[2],mo.radius)})),a&&d.include(Je),i&&(Ho(d),Mt(d)),r&&e.varyings.add("debugBorderCoords","vec4"),e.attributes.add("uv0","vec2"),e.attributes.add("uvi","vec4"),e.attributes.add("color","vec4"),e.attributes.add("size","vec2"),e.attributes.add("rotation","float"),(l||c)&&e.attributes.add("featureAttribute","vec4"),d.code.add(s?$`bool behindHorizon(vec3 posModel) {
vec3 camToEarthCenter = pointDistanceSphere.xyz - localOrigin;
vec3 camToPos = pointDistanceSphere.xyz + posModel;
float earthRadius = pointDistanceSphere.w;
float a = dot(camToPos, camToPos);
float b = dot(camToPos, camToEarthCenter);
float c = dot(camToEarthCenter, camToEarthCenter) - earthRadius * earthRadius;
return b > 0.0 && b < a && b * b  > a * c;
}`:$`bool behindHorizon(vec3 posModel) { return false; }`),d.main.add($`
    ProjectHUDAux projectAux;
    vec4 posProj = projectPositionHUD(projectAux);
    forwardObjectAndLayerIdColor();

    if (rejectBySlice(projectAux.posModel)) {
      // Project outside of clip plane
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
      return;
    }

    if (behindHorizon(projectAux.posModel)) {
      // Project outside of clip plane
      gl_Position = vec4(1e038, 1e038, 1e038, 1.0);
      return;
    }

    vec2 inputSize;
    ${H(i,$`
        inputSize = screenSizePerspectiveScaleVec2(size, projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspective);
        vec2 screenOffsetScaled = screenSizePerspectiveScaleVec2(screenOffset, projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspectiveAlignment);`,$`
        inputSize = size;
        vec2 screenOffsetScaled = screenOffset;`)}
    ${H(l,$`inputSize *= vvScale(featureAttribute).xx;`)}

    vec2 combinedSize = inputSize * pixelRatio;
    vec4 quadOffset = vec4(0.0);

    ${H(t,$`
    bool visible = testHUDVisibility(posProj);
    if (!visible) {
      vtc = vec2(0.0);
      ${H(r,"debugBorderCoords = vec4(0.5, 0.5, 1.5 / combinedSize);")}
      return;
    }`)}
    ${H(x,$`voccluded = visible ? 0.0 : 1.0;`)}
  `);const O=$`
      vec2 uv = mix(uvi.xy, uvi.zw, bvec2(uv0));
      vec2 texSize = vec2(textureSize(tex, 0));
      uv = mix(vec2(1.0), uv / texSize, lessThan(uv, vec2(${Bn})));
      quadOffset.xy = (uv0 - anchorPosition) * 2.0 * combinedSize;

      ${H(u,$`
          float angle = radians(materialRotation + rotation);
          float cosAngle = cos(angle);
          float sinAngle = sin(angle);
          mat2 rotate = mat2(cosAngle, -sinAngle, sinAngle,  cosAngle);

          quadOffset.xy = rotate * quadOffset.xy;
        `)}

      quadOffset.xy = (quadOffset.xy + screenOffsetScaled) / viewport.zw * posProj.w;
  `,f=a?n?$`posProj = alignToPixelOrigin(posProj, viewport.zw) + quadOffset;`:$`posProj += quadOffset;
if (inputSize.x == size.x) {
posProj = alignToPixelOrigin(posProj, viewport.zw);
}`:$`posProj += quadOffset;`;d.main.add($`
    ${O}
    ${c?"vcolor = interpolateVVColor(featureAttribute.y) * materialColor;":"vcolor = color / 255.0 * materialColor;"}

    ${H(y===10,$`vcolor.a = 1.0;`)}

    bool alphaDiscard = vcolor.a < ${$.float(te)};
    ${H(n,`alphaDiscard = alphaDiscard && outlineColor.a < ${$.float(te)};`)}
    if (alphaDiscard) {
      // "early discard" if both symbol color (= fill) and outline color (if applicable) are transparent
      gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
      return;
    } else {
      ${f}
      gl_Position = posProj;
    }

    vtc = uv;

    ${H(r,$`debugBorderCoords = vec4(uv01, 1.5 / combinedSize);`)}
    vsize = inputSize;
  `),v.uniforms.add(new at("tex",P=>P.texture)),p&&!g&&v.uniforms.add(new Dt("depthMap",P=>P.mainDepth),new Me("occludedOpacity",P=>P.hudOccludedFragmentOpacity));const z=r?$`(isBorder > 0.0 ? 0.0 : ${$.float(te)})`:$.float(te),A=$`
    ${H(r,$`float isBorder = float(any(lessThan(debugBorderCoords.xy, debugBorderCoords.zw)) || any(greaterThan(debugBorderCoords.xy, 1.0 - debugBorderCoords.zw)));`)}

    vec2 samplePos = vtc;

    ${H(h,$`
      float txSize = float(textureSize(tex, 0).x);
      float texelSize = 1.0 / txSize;

      // Calculate how much we have to add/subtract to/from each texel to reach the size of an onscreen pixel
      vec2 scaleFactor = (vsize - txSize) * texelSize;
      samplePos += (vec2(1.0, -1.0) * texelSize) * scaleFactor;`)}

    ${n?$`
      vec4 fillPixelColor = vcolor;

      // Get distance in output units (i.e. pixels)

      float sdf = texture(tex, samplePos).r;
      float pixelDistance = sdf * vsize.x;

      // Create smooth transition from the icon into its outline
      float fillAlphaFactor = clamp(0.5 - pixelDistance, 0.0, 1.0);
      fillPixelColor.a *= fillAlphaFactor;

      if (outlineSize > 0.25) {
        vec4 outlinePixelColor = outlineColor;
        float clampedOutlineSize = min(outlineSize, 0.5*vsize.x);

        // Create smooth transition around outline
        float outlineAlphaFactor = clamp(0.5 - (abs(pixelDistance) - 0.5*clampedOutlineSize), 0.0, 1.0);
        outlinePixelColor.a *= outlineAlphaFactor;

        if (
          outlineAlphaFactor + fillAlphaFactor < ${z} ||
          fillPixelColor.a + outlinePixelColor.a < ${$.float(te)}
        ) {
          discard;
        }

        // perform un-premultiplied over operator (see https://en.wikipedia.org/wiki/Alpha_compositing#Description)
        float compositeAlpha = outlinePixelColor.a + fillPixelColor.a * (1.0 - outlinePixelColor.a);
        vec3 compositeColor = vec3(outlinePixelColor) * outlinePixelColor.a +
          vec3(fillPixelColor) * fillPixelColor.a * (1.0 - outlinePixelColor.a);

        ${H(!g,$`fragColor = vec4(compositeColor, compositeAlpha);`)}
      } else {
        if (fillAlphaFactor < ${z}) {
          discard;
        }

        ${H(!g,$`fragColor = premultiplyAlpha(fillPixelColor);`)}
      }

      // visualize SDF:
      // fragColor = vec4(clamp(-pixelDistance/vsize.x*2.0, 0.0, 1.0), clamp(pixelDistance/vsize.x*2.0, 0.0, 1.0), 0.0, 1.0);
      `:$`
          vec4 texColor = texture(tex, samplePos, -0.5);
          if (texColor.a < ${z}) {
            discard;
          }
          ${H(!g,$`fragColor = texColor * premultiplyAlpha(vcolor);`)}
          `}

    ${H(p&&!g,$`
        float zSample = texelFetch(depthMap, ivec2(gl_FragCoord.xy), 0).x;
        if (zSample < gl_FragCoord.z) {
          fragColor *= occludedOpacity;
        }
        `)}

    ${H(!g&&r,$`fragColor = mix(fragColor, vec4(1.0, 0.0, 1.0, 1.0), isBorder * 0.5);`)}
  `;switch(y){case 0:case 1:e.outputs.add("fragColor","vec4",0),y===1&&e.outputs.add("fragEmission","vec4",1),m===1&&e.outputs.add("fragAlpha","float",y===1?2:1),v.main.add($`
        ${A}
        ${H(m===2,$`fragColor.rgb /= fragColor.a;`)}
        ${H(y===1,$`fragEmission = vec4(0.0);`)}
        ${H(m===1,$`fragAlpha = fragColor.a;`)}`);break;case 10:v.main.add($`
        ${A}
        outputObjectAndLayerIdColor();`);break;case 9:e.include(Io,o),v.main.add($`
        ${A}
        outputHighlight(${H(x,$`voccluded == 1.0`,$`false`)});`)}return e}function mt(o){return o.outlineColor[3]>0&&o.outlineSize>0}function ge(o){return o.textureIsSignedDistanceField?In(o.anchorPosition,o.distanceFieldBoundingBox,Oe):ho(Oe,o.anchorPosition),Oe}function In(o,e,n){Ze(n,o[0]*(e[2]-e[0])+e[0],o[1]*(e[3]-e[1])+e[1])}const Oe=Xe(),ye=32e3,Bn=$.float(ye),Gn=Object.freeze(Object.defineProperty({__proto__:null,build:Et,calculateAnchorPosition:ge,fullUV:ye},Symbol.toStringTag,{value:"Module"}));class Ln extends Go{constructor(e,n){super(e,n,new Lo(Gn,()=>xo(()=>Promise.resolve().then(()=>es),void 0)),pn([Ut,It()].map(ln))),this.primitiveType=n.occlusionPass?et.POINTS:et.TRIANGLE_STRIP}initializePipeline(e){const{oitPass:n,hasPolygonOffset:t,draped:s,output:a,depthTestEnabled:i,occlusionPass:r}=e,l=i&&!s&&n!==1&&!r&&a!==9;return cn({blending:Vt(a)?ko(n,!0):null,depthTest:i&&!s?{func:515}:null,depthWrite:l?fn:null,drawBuffers:qo(n,a),colorWrite:un,polygonOffset:t?qn:null})}}const qn={factor:0,units:-4},Ut=_t().vec2u8("uv0",{glNormalized:!0}),Ht=_t().vec3f("position").vec3f("normal").vec4i16("uvi").vec4u8("color").vec2f("size").f32("rotation").vec4f("centerOffsetAndDistance").vec4f("featureAttribute"),kn=Ht.clone().vec4u8("olidColor");function It(){return Bo()?kn:Ht}class F extends No{constructor(e){super(),this.spherical=e,this.screenCenterOffsetUnitsEnabled=!1,this.occlusionTestEnabled=!0,this.signedDistanceFieldEnabled=!1,this.sampleSignedDistanceFieldTexelCenter=!1,this.hasVVSize=!1,this.hasVVColor=!1,this.hasVerticalOffset=!1,this.hasScreenSizePerspective=!1,this.hasRotation=!1,this.debugDrawLabelBorder=!1,this.hasPolygonOffset=!1,this.depthTestEnabled=!0,this.pixelSnappingEnabled=!0,this.draped=!1,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.occlusionPass=!1,this.occludedFragmentFade=!1,this.horizonCullingEnabled=!0,this.isFocused=!0,this.olidColorInstanced=!1,this.textureCoordinateType=0,this.emissionSource=0,this.discardInvisibleFragments=!0,this.hasVVInstancing=!1,this.snowCover=!1}}E([U()],F.prototype,"screenCenterOffsetUnitsEnabled",void 0),E([U()],F.prototype,"occlusionTestEnabled",void 0),E([U()],F.prototype,"signedDistanceFieldEnabled",void 0),E([U()],F.prototype,"sampleSignedDistanceFieldTexelCenter",void 0),E([U()],F.prototype,"hasVVSize",void 0),E([U()],F.prototype,"hasVVColor",void 0),E([U()],F.prototype,"hasVerticalOffset",void 0),E([U()],F.prototype,"hasScreenSizePerspective",void 0),E([U()],F.prototype,"hasRotation",void 0),E([U()],F.prototype,"debugDrawLabelBorder",void 0),E([U()],F.prototype,"hasPolygonOffset",void 0),E([U()],F.prototype,"depthTestEnabled",void 0),E([U()],F.prototype,"pixelSnappingEnabled",void 0),E([U()],F.prototype,"draped",void 0),E([U()],F.prototype,"terrainDepthTest",void 0),E([U()],F.prototype,"cullAboveTerrain",void 0),E([U()],F.prototype,"occlusionPass",void 0),E([U()],F.prototype,"occludedFragmentFade",void 0),E([U()],F.prototype,"horizonCullingEnabled",void 0),E([U()],F.prototype,"isFocused",void 0);class _s extends Yo{constructor(e,n){super(e,Jn),this.produces=new Map([[13,t=>Fe(t)&&!this.parameters.drawAsLabel],[14,t=>Fe(t)&&this.parameters.drawAsLabel],[12,()=>this.parameters.occlusionTest],[18,t=>this.parameters.draped&&Fe(t)]]),this._visible=!0,this._configuration=new F(n)}getConfiguration(e,n){const t=this.parameters.draped;return super.getConfiguration(e,n,this._configuration),this._configuration.hasSlicePlane=this.parameters.hasSlicePlane,this._configuration.hasVerticalOffset=!!this.parameters.verticalOffset,this._configuration.hasScreenSizePerspective=!!this.parameters.screenSizePerspective,this._configuration.screenCenterOffsetUnitsEnabled=this.parameters.centerOffsetUnits==="screen",this._configuration.hasPolygonOffset=this.parameters.polygonOffset,this._configuration.draped=t,this._configuration.occlusionTestEnabled=this.parameters.occlusionTest,this._configuration.pixelSnappingEnabled=this.parameters.pixelSnappingEnabled,this._configuration.signedDistanceFieldEnabled=this.parameters.textureIsSignedDistanceField,this._configuration.sampleSignedDistanceFieldTexelCenter=this.parameters.sampleSignedDistanceFieldTexelCenter,this._configuration.hasRotation=this.parameters.hasRotation,this._configuration.hasVVSize=!!this.parameters.vvSize,this._configuration.hasVVColor=!!this.parameters.vvColor,this._configuration.occlusionPass=n.slot===12,this._configuration.occludedFragmentFade=!t&&this.parameters.occludedFragmentFade,this._configuration.horizonCullingEnabled=this.parameters.horizonCullingEnabled,this._configuration.isFocused=this.parameters.isFocused,this._configuration.depthTestEnabled=this.parameters.depthEnabled||n.slot===12,Vt(e)&&(this._configuration.debugDrawLabelBorder=!!Wo.LABELS_SHOW_BORDER),this._configuration.oitPass=n.oitPass,this._configuration.terrainDepthTest=n.terrainDepthTest,this._configuration.cullAboveTerrain=n.cullAboveTerrain,this._configuration}intersect(e,n,t,s,a,i){const{options:{selectionMode:r,hud:l,excludeLabels:c},point:u,camera:p}=t,{parameters:h}=this;if(!r||!l||c&&h.isLabel||!e.visible||!u||!p)return;const w=e.attributes.get("featureAttribute"),y=w==null?null:tt(w.data,qe),{scaleX:m,scaleY:d}=ke(y,h,p.pixelRatio);Pt(Ce,n),e.attributes.has("featureAttribute")&&Wn(Ce);const v=e.attributes.get("position"),g=e.attributes.get("size"),x=e.attributes.get("normal"),O=e.attributes.get("rotation"),f=e.attributes.get("centerOffsetAndDistance");Tt(v.size>=3);const z=ge(h),A=this.parameters.centerOffsetUnits==="screen";for(let P=0;P<v.data.length/v.size;P++){const B=P*v.size;oe(C,v.data[B],v.data[B+1],v.data[B+2]),re(C,C,n),re(C,C,p.viewMatrix);const b=P*f.size;if(oe(T,f.data[b],f.data[b+1],f.data[b+2]),!A&&(C[0]+=T[0],C[1]+=T[1],T[2]!==0)){const V=T[2];L(T,C),Y(C,C,G(T,T,V))}const j=P*x.size;if(oe(ae,x.data[j],x.data[j+1],x.data[j+2]),Ge(ae,Ce,p,be),Ne(this.parameters,C,be,p,ve),p.applyProjection(C,D),D[0]>-1){A&&(T[0]||T[1])&&(D[0]+=T[0]*p.pixelRatio,T[1]!==0&&(D[1]+=ve.alignmentEvaluator.apply(T[1])*p.pixelRatio),p.unapplyProjection(D,C)),D[0]+=this.parameters.screenOffset[0]*p.pixelRatio,D[1]+=this.parameters.screenOffset[1]*p.pixelRatio,D[0]=Math.floor(D[0]),D[1]=Math.floor(D[1]);const V=P*g.size;R[0]=g.data[V],R[1]=g.data[V+1],ve.evaluator.applyVec2(R,R);const Q=Lt*p.pixelRatio;let le=0;h.textureIsSignedDistanceField&&(le=Math.min(h.outlineSize,.5*R[0])*p.pixelRatio/2),R[0]*=m,R[1]*=d;const J=P*O.size,N=h.rotation+O.data[J];if(Le(u,D[0],D[1],R,Q,le,N,h,z)){const se=t.ray;if(re(De,C,zt(Gt,p.viewMatrix)),D[0]=u[0],D[1]=u[1],p.unprojectFromRenderScreen(D,C)){const S=_();k(S,se.direction);const me=1/we(S);G(S,S,me),i(At(se.origin,C)*me,S,-1,De)}}}}}intersectDraped(e,n,t,s,a){const i=e.attributes.get("position"),r=e.attributes.get("size"),l=e.attributes.get("rotation"),c=this.parameters,u=ge(c),p=e.attributes.get("featureAttribute"),h=p==null?null:tt(p.data,qe),{scaleX:w,scaleY:y}=ke(h,c,e.screenToWorldRatio),m=Zn*e.screenToWorldRatio;for(let d=0;d<i.data.length/i.size;d++){const v=d*i.size,g=i.data[v],x=i.data[v+1],O=d*r.size;R[0]=r.data[O],R[1]=r.data[O+1];let f=0;c.textureIsSignedDistanceField&&(f=Math.min(c.outlineSize,.5*R[0])*e.screenToWorldRatio/2),R[0]*=w,R[1]*=y;const z=d*l.size,A=c.rotation+l.data[z];Le(t,g,x,R,m,f,A,c,u)&&s(a.distance,a.normal,-1)}}createBufferWriter(){return new Kn}applyShaderOffsetsView(e,n,t,s,a,i,r){const l=Ge(n,t,a,be);return this._applyVerticalGroundOffsetView(e,l,a,r),Ne(this.parameters,r,l,a,i),this._applyPolygonOffsetView(r,l,s[3],a,r),this._applyCenterOffsetView(r,s,r),r}applyShaderOffsetsNDC(e,n,t,s,a){return this._applyCenterOffsetNDC(e,n,t,s),a!=null&&k(a,s),this._applyPolygonOffsetNDC(s,n,t,s),s}_applyPolygonOffsetView(e,n,t,s,a){const i=s.aboveGround?1:-1;let r=Math.sign(t);r===0&&(r=i);const l=i*r;if(this.parameters.shaderPolygonOffset<=0)return k(a,e);const c=bo(Math.abs(n.cosAngle),.01,1),u=1-Math.sqrt(1-c*c)/c/s.viewport[2];return G(a,e,l>0?u:1/u),a}_applyVerticalGroundOffsetView(e,n,t,s){const a=we(e),i=t.aboveGround?1:-1,r=t.computeRenderPixelSizeAtDist(a)*Rt,l=G(C,n.normal,i*r);return q(s,e,l),s}_applyCenterOffsetView(e,n,t){const s=this.parameters.centerOffsetUnits!=="screen";return t!==e&&k(t,e),s&&(t[0]+=n[0],t[1]+=n[1],n[2]&&(L(ae,t),wo(t,t,G(ae,ae,n[2])))),t}_applyCenterOffsetNDC(e,n,t,s){const a=this.parameters.centerOffsetUnits!=="screen";return s!==e&&k(s,e),a||(s[0]+=n[0]/t.fullWidth*2,s[1]+=n[1]/t.fullHeight*2),s}_applyPolygonOffsetNDC(e,n,t,s){const a=this.parameters.shaderPolygonOffset;if(e!==s&&k(s,e),a){const i=t.aboveGround?1:-1,r=i*Math.sign(n[3]);s[2]-=(r||i)*a}return s}set visible(e){this._visible=e}get visible(){const{color:e,outlineSize:n,outlineColor:t}=this.parameters,s=e[3]>=te||n>=te&&t[3]>=te;return this._visible&&s}createGLMaterial(e){return new Nn(e)}calculateRelativeScreenBounds(e,n,t=bt()){return Yn(this.parameters,e,n,t),t[2]=t[0]+e[0],t[3]=t[1]+e[1],t}}class Nn extends sn{constructor(e){super({...e,...e.material.parameters})}beginSlot(e){return this.updateTexture(this._material.parameters.textureId),this._material.setParameters(this.textureBindParameters),this.getTechnique(Ln,e)}}function Yn(o,e,n,t){t[0]=o.anchorPosition[0]*-e[0]+o.screenOffset[0]*n,t[1]=o.anchorPosition[1]*-e[1]+o.screenOffset[1]*n}function Ge(o,e,n,t){return Fn(e)&&(e=Pt(Xn,e)),yo(t.normal,o,e),re(t.normal,t.normal,n.viewInverseTransposeMatrix),t.cosAngle=We(Bt,Qn),t}function Wn(o){const e=o[0],n=o[1],t=o[2],s=o[3],a=o[4],i=o[5],r=o[6],l=o[7],c=o[8],u=1/Math.sqrt(e*e+n*n+t*t),p=1/Math.sqrt(s*s+a*a+i*i),h=1/Math.sqrt(r*r+l*l+c*c);return o[0]=e*u,o[1]=n*u,o[2]=t*u,o[3]=s*p,o[4]=a*p,o[5]=i*p,o[6]=r*h,o[7]=l*h,o[8]=c*h,o}function Le(o,e,n,t,s,a,i,r,l){let c=e-s-t[0]*l[0],u=c+t[0]+2*s,p=n-s-t[1]*l[1],h=p+t[1]+2*s;const w=r.distanceFieldBoundingBox;return r.textureIsSignedDistanceField&&w!=null&&(c+=t[0]*w[0],p+=t[1]*w[1],u-=t[0]*(1-w[2]),h-=t[1]*(1-w[3]),c-=a,u+=a,p-=a,h+=a),Ze(xt,e,n),Po(xe,o,xt,$o(i)),xe[0]>c&&xe[0]<u&&xe[1]>p&&xe[1]<h}const ve=new Xo,C=_(),ae=_(),D=Ve(),Bt=_(),De=_(),xe=Xe(),xt=Xe(),Ce=$t(),Xn=$t(),Gt=wt(),Pe=Ve(),T=_(),Ie=_(),qe=Ve(),be={normal:Bt,cosAngle:0},Lt=1,Zn=2,R=St(0,0),Qn=yt(0,0,1);class Jn extends Zo{constructor(){super(...arguments),this.renderOccluded=1,this.isDecoration=!1,this.color=ot(1,1,1,1),this.polygonOffset=!1,this.anchorPosition=St(.5,.5),this.screenOffset=[0,0],this.shaderPolygonOffset=1e-5,this.textureIsSignedDistanceField=!1,this.sampleSignedDistanceFieldTexelCenter=!1,this.outlineColor=ot(1,1,1,1),this.outlineSize=0,this.distanceFieldBoundingBox=Ve(),this.rotation=0,this.hasRotation=!1,this.vvSizeEnabled=!1,this.vvSize=null,this.vvColor=null,this.vvOpacity=null,this.vvSymbolAnchor=null,this.vvSymbolRotationMatrix=null,this.hasSlicePlane=!1,this.pixelSnappingEnabled=!0,this.occlusionTest=!0,this.occludedFragmentFade=!1,this.horizonCullingEnabled=!1,this.centerOffsetUnits="world",this.drawAsLabel=!1,this.depthEnabled=!0,this.isFocused=!0,this.focusStyle="bright",this.draped=!1,this.isLabel=!1}get hasVVSize(){return!!this.vvSize}get hasVVColor(){return!!this.vvColor}get hasVVOpacity(){return!!this.vvOpacity}}class Kn{constructor(){this.layout=Ut,this.instanceLayout=It()}elementCount(e){return e.get("position").indices.length}elementCountBaseInstance(e){return e.get("uv0").indices.length}write(e,n,t,s,a,i){const{position:r,normal:l,color:c,size:u,rotation:p,centerOffsetAndDistance:h,featureAttribute:w,uvi:y}=a;Ko(t.get("position"),e,r,i),en(t.get("normal"),n,l,i);const m=t.get("position").indices.length;let d=0,v=0,g=ye,x=ye;const O=t.get("uvi")?.data;O&&O.length>=4&&(d=O[0],v=O[1],g=O[2],x=O[3]);for(let f=0;f<m;++f){const z=i+f;y.setValues(z,d,v,g,x)}if(tn(t.get("color"),4,c,i),rt(t.get("size"),u,i),on(t.get("rotation"),p,i),t.get("centerOffsetAndDistance")?lt(t.get("centerOffsetAndDistance"),h,i):ct(h,i,m),t.get("featureAttribute")?lt(t.get("featureAttribute"),w,i):ct(w,i,m),s!=null){const f=t.get("position")?.indices;if(f){const z=f.length,A=a.getField("olidColor",rn);nn(s,A,z,i)}}return{numVerticesPerItem:1,numItems:m}}writeBaseInstance(e,n){const{uv0:t}=n;rt(e.get("uv0"),t,0)}intersect(e,n,t,s,a,i,r){const{options:{selectionMode:l,hud:c,excludeLabels:u},point:p,camera:h}=s;if(!l||!c||u&&n.isLabel||!p)return;const w=this.instanceLayout.createView(e),{position:y,normal:m,rotation:d,size:v,featureAttribute:g,centerOffsetAndDistance:x}=w,O=n.centerOffsetUnits==="screen",f=ge(n);if(y==null||m==null||d==null||v==null||x==null||h==null)return;const z=g==null?null:g.getVec(0,qe),{scaleX:A,scaleY:P}=ke(z,n,h.pixelRatio),B=y.count;for(let b=0;b<B;b++){if(y.getVec(b,C),t!=null&&q(C,C,t),re(C,C,h.viewMatrix),x.getVec(b,Pe),oe(T,Pe[0],Pe[1],Pe[2]),!O&&(C[0]+=T[0],C[1]+=T[1],T[2]!==0)){const j=T[2];L(T,C),Y(C,C,G(T,T,j))}if(m.getVec(b,ae),Ge(ae,Ce,h,be),Ne(n,C,be,h,ve),h.applyProjection(C,D),D[0]>-1){O&&(T[0]||T[1])&&(D[0]+=T[0]*h.pixelRatio,T[1]!==0&&(D[1]+=ve.alignmentEvaluator.apply(T[1])*h.pixelRatio),h.unapplyProjection(D,C)),D[0]+=n.screenOffset[0]*h.pixelRatio,D[1]+=n.screenOffset[1]*h.pixelRatio,D[0]=Math.floor(D[0]),D[1]=Math.floor(D[1]),v.getVec(b,R),ve.evaluator.applyVec2(R,R);const j=Lt*h.pixelRatio;let V=0;n.textureIsSignedDistanceField&&(V=Math.min(n.outlineSize,.5*R[0])*h.pixelRatio/2),R[0]*=A,R[1]*=P;const Q=d.get(b),le=n.rotation+Q;if(Le(p,D[0],D[1],R,j,V,le,n,f)){const J=s.ray;if(re(De,C,zt(Gt,h.viewMatrix)),D[0]=p[0],D[1]=p[1],h.unprojectFromRenderScreen(D,C)){const N=_();k(N,J.direction);const se=1/we(N);G(N,N,se),r(At(J.origin,C)*se,N,b,De)}}}}}}function ke(o,e,n){return o==null||e.vvSize==null?{scaleX:n,scaleY:n}:(Qo(Ie,e,o),{scaleX:Ie[0]*n,scaleY:Ie[1]*n})}function Ne(o,e,n,t,s){if(!o.verticalOffset?.screenLength){const l=we(e);return s.update(n.cosAngle,l,o.screenSizePerspective,o.screenSizePerspectiveMinPixelReferenceSize,o.screenSizePerspectiveAlignment,null),e}const a=we(e),i=o.screenSizePerspectiveAlignment??o.screenSizePerspective,r=Jo(t,a,o.verticalOffset,n.cosAngle,i,o.screenSizePerspectiveMinPixelReferenceSize);return s.update(n.cosAngle,a,o.screenSizePerspective,o.screenSizePerspectiveMinPixelReferenceSize,o.screenSizePerspectiveAlignment,null),G(n.normal,n.normal,r),q(e,e,n.normal)}function Fs(o){return o.type==="point"}const es=Object.freeze(Object.defineProperty({__proto__:null,build:Et,calculateAnchorPosition:ge,fullUV:ye},Symbol.toStringTag,{value:"Module"}));export{gs as A,ms as D,ys as E,ws as G,Ds as M,Ps as Q,vs as U,xs as Z,Cs as a,Ts as b,As as c,Rn as d,bs as e,Os as f,vt as g,zs as h,_s as i,Ss as j,gn as k,Je as l,Vs as m,Un as n,Ms as o,Vn as p,jn as q,$s as r,Fs as t,Dn as u,hs as w,js as y};
//# sourceMappingURL=HUDMaterial.glsl-CCMYkC-W.js.map

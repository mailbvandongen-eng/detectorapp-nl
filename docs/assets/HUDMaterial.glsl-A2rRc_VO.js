import{tg as kt,A$ as Nt,bk as Wt,bI as Yt,vH as Xt,b0 as bt,bf as Zt,B0 as Kt,B1 as Qt,xW as Jt,aW as We,qK as eo,aq as wt,fw as to,B2 as oo,B3 as ao,B4 as no,AB as io,AC as so,AD as ro,jr as lo,ag as co,aB as oe,a7 as F,ay as W,aT as L,ah as k,av as G,aw as q,uR as uo,aF as fo,ce as po,bh as ae,as as re,ai as Je,af as yt,ak as Ye,a5 as Xe,nw as ho,mj as Ze,vF as vo,je as go,km as mo,_ as xo,lZ as et,bM as E,jy as tt,ki as Pt,br as $t,lG as Ve,nv as St,ap as zt,al as we,aE as Ot,c9 as bo,hz as wo,cr as ot,ke as yo,bQ as Po,bX as $o}from"./index-XTVTwoXf.js";import{u as So}from"./meshVertexSpaceUtils-DImKsNfr.js";import{o as zo,x as Oo}from"./hydratedFeatures-DQR3Dom8.js";import{r as I,t as at,n as Y}from"./vec3f32-WCVSSNPR.js";import{aW as Ao,n as X,m as Z,aX as nt,aH as At,D as Co,ax as Mo,aq as Ke,r as He,a6 as Me,aY as Do,af as Vo,aL as Ct,aZ as Mt,as as jo,K as To,ap as Dt,i as Fo,a_ as _o,G as Ro,H as Eo,M as Uo,al as it,L as Fe,b as st,aI as Bo,a2 as te,ai as Io,a as Ho,j as Go,k as Lo,W as qo,V as ko,X as Vt,Y as No,x as U,A as Wo,a$ as _e,t as Yo,b0 as Xo,b1 as Zo,b2 as Ko,aB as Qo,b3 as Jo,b4 as ea,b5 as ta,b6 as rt,b7 as oa,b8 as lt,b9 as ct,ba as aa,aD as na}from"./OutputColorHighlightOID.glsl-Cpn_RoXl.js";import{A as ia,U as jt}from"./Indices-D1a_jN5R.js";import{t as M}from"./orientedBoundingBox-FVVhmkIb.js";import{s as Tt,g as sa}from"./BufferView-DoXAwMVq.js";import{Q as Ft,t as ra}from"./InterleavedLayout-DKiLl-G7.js";import{T as la,d as ca,c as ua}from"./renderState-CKc66y4x.js";import{t as fa}from"./VertexAttributeLocations-BfZbt_DV.js";import{t as $,n as B}from"./glsl-B5bJgrnA.js";import{s as pa}from"./ShaderBuilder-JLQ5yd7A.js";function hn(o,e){if(o.type==="point")return ee(o,e,!1);if(zo(o))switch(o.type){case"extent":return ee(o.center,e,!1);case"polygon":return ee(ft(o),e,!1);case"polyline":return ee(ut(o),e,!0);case"mesh":return ee(So(o.vertexSpace,o.spatialReference)??o.extent.center,e,!1);case"multipoint":return}else switch(o.type){case"extent":return ee(da(o),e,!0);case"polygon":return ee(ft(o),e,!0);case"polyline":return ee(ut(o),e,!0);case"multipoint":return}}function ut(o){const e=o.paths[0];if(!e||e.length===0)return null;const a=Qt(e,Jt(e)/2);return We(a[0],a[1],a[2],o.spatialReference)}function da(o){return We(.5*(o.xmax+o.xmin),.5*(o.ymax+o.ymin),o.zmin!=null&&o.zmax!=null&&isFinite(o.zmin)&&isFinite(o.zmax)?.5*(o.zmax+o.zmin):void 0,o.spatialReference)}function ft(o){const e=o.rings[0];if(!e||e.length===0)return null;const a=eo(o.rings,!!o.hasZ);return We(a[0],a[1],a[2],o.spatialReference)}function ee(o,e,a){const t=a?o:Oo(o);return e&&o?Kt(o,t,e)?t:null:t}function vn(o,e,a,t=0){if(o){e||(e=bt());const n=o;let s=.5*n.width*(a-1),i=.5*n.height*(a-1);return n.width<1e-7*n.height?s+=i/20:n.height<1e-7*n.width&&(i+=s/20),Zt(e,n.xmin-s-t,n.ymin-i-t,n.xmax+s+t,n.ymax+i+t),e}return null}function gn(o,e,a=null){const t=Nt(Xt);return o!=null&&(t[0]=o[0],t[1]=o[1],t[2]=o[2],o.length>3&&(t[3]=o[3])),e!=null&&(t[3]=e),a&&Wt(t,t,a),t}function mn(o=kt,e,a,t=1){const n=new Array(3);if(e==null||a==null)n[0]=1,n[1]=1,n[2]=1;else{let s,i=0;for(let r=2;r>=0;r--){const l=o[r],c=l!=null,u=r===0&&!s&&!c,p=a[r];let h;l==="symbol-value"||u?h=p!==0?e[r]/p:1:c&&l!=="proportional"&&isFinite(l)&&(h=p!==0?l/p:1),h!=null&&(n[r]=h,s=h,i=Math.max(i,Math.abs(h)))}for(let r=2;r>=0;r--)n[r]==null?n[r]=s:n[r]===0&&(n[r]=.001*i)}for(let s=2;s>=0;s--)n[s]/=t;return Yt(n)}function ha(o){return o.isPrimitive!=null}function xn(o){return va(ha(o)?[o.width,o.depth,o.height]:o)?null:"Symbol sizes may not be negative values"}function va(o){const e=a=>a==null||a>=0;return Array.isArray(o)?o.every(e):e(o)}function bn(o,e,a,t=wt()){return o&&io(t,t,-o/180*Math.PI),e&&so(t,t,e/180*Math.PI),a&&ro(t,t,a/180*Math.PI),t}function wn(o,e,a){if(a.minDemResolution!=null)return a.minDemResolution;const t=to(e),n=oo(o)*t,s=ao(o)*t,i=no(o)*(e.isGeographic?1:t);return n===0&&s===0&&i===0?a.minDemResolutionForPoints:.01*Math.max(n,s,i)}function pt(o,e){const a=o[e],t=o[e+1],n=o[e+2];return Math.sqrt(a*a+t*t+n*n)}function ga(o,e){const a=o[e],t=o[e+1],n=o[e+2],s=1/Math.sqrt(a*a+t*t+n*n);o[e]*=s,o[e+1]*=s,o[e+2]*=s}function dt(o,e,a){o[e]*=a,o[e+1]*=a,o[e+2]*=a}function ma(o,e,a,t,n,s=e){(n=n||o)[s]=o[e]+a[t],n[s+1]=o[e+1]+a[t+1],n[s+2]=o[e+2]+a[t+2]}function xa(){return ht??=ba(),ht}function ba(){const a=new M([0,0,0,255,255,0,255,255],[0,1,2,3],2,!0);return new Ao([["uv0",a]])}let ht=null;const Re=[[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5],[-.5,-.5,-.5],[.5,-.5,-.5],[.5,.5,-.5],[-.5,.5,-.5]],wa=[0,0,1,-1,0,0,1,0,0,0,-1,0,0,1,0,0,0,-1],ya=[0,0,1,0,1,1,0,1],Pa=[0,1,2,2,3,0,4,0,3,3,7,4,1,5,6,6,2,1,1,0,4,4,5,1,3,2,6,6,7,3,5,4,7,7,6,5],_t=new Array(36);for(let o=0;o<6;o++)for(let e=0;e<6;e++)_t[6*o+e]=o;const ie=new Array(36);for(let o=0;o<6;o++)ie[6*o]=0,ie[6*o+1]=1,ie[6*o+2]=2,ie[6*o+3]=2,ie[6*o+4]=3,ie[6*o+5]=0;function yn(o,e){Array.isArray(e)||(e=[e,e,e]);const a=new Array(24);for(let t=0;t<8;t++)a[3*t]=Re[t][0]*e[0],a[3*t+1]=Re[t][1]*e[1],a[3*t+2]=Re[t][2]*e[2];return new Z(o,[["position",new M(a,Pa,3,!0)],["normal",new M(wa,_t,3)],["uv0",new M(ya,ie,2)]])}const Ee=[[-.5,0,-.5],[.5,0,-.5],[.5,0,.5],[-.5,0,.5],[0,-.5,0],[0,.5,0]],$a=[0,1,-1,1,1,0,0,1,1,-1,1,0,0,-1,-1,1,-1,0,0,-1,1,-1,-1,0],Sa=[5,1,0,5,2,1,5,3,2,5,0,3,4,0,1,4,1,2,4,2,3,4,3,0],za=[0,0,0,1,1,1,2,2,2,3,3,3,4,4,4,5,5,5,6,6,6,7,7,7];function Pn(o,e){Array.isArray(e)||(e=[e,e,e]);const a=new Array(18);for(let t=0;t<6;t++)a[3*t]=Ee[t][0]*e[0],a[3*t+1]=Ee[t][1]*e[1],a[3*t+2]=Ee[t][2]*e[2];return new Z(o,[["position",new M(a,Sa,3,!0)],["normal",new M($a,za,3)]])}const $e=I(-.5,0,-.5),Se=I(.5,0,-.5),ze=I(0,0,.5),Oe=I(0,.5,0),ce=Y(),ue=Y(),pe=Y(),de=Y(),he=Y();W(ce,$e,Oe),W(ue,$e,Se),ae(pe,ce,ue),L(pe,pe),W(ce,Se,Oe),W(ue,Se,ze),ae(de,ce,ue),L(de,de),W(ce,ze,Oe),W(ue,ze,$e),ae(he,ce,ue),L(he,he);const Ue=[$e,Se,ze,Oe],Oa=[0,-1,0,pe[0],pe[1],pe[2],de[0],de[1],de[2],he[0],he[1],he[2]],Aa=[0,1,2,3,1,0,3,2,1,3,0,2],Ca=[0,0,0,1,1,1,2,2,2,3,3,3];function $n(o,e){Array.isArray(e)||(e=[e,e,e]);const a=new Array(12);for(let t=0;t<4;t++)a[3*t]=Ue[t][0]*e[0],a[3*t+1]=Ue[t][1]*e[1],a[3*t+2]=Ue[t][2]*e[2];return new Z(o,[["position",new M(a,Aa,3,!0)],["normal",new M(Oa,Ca,3)]])}function Sn(o,e,a,t,n={uv:!0}){const s=-Math.PI,i=2*Math.PI,r=-Math.PI/2,l=Math.PI,c=Math.max(3,Math.floor(a)),u=Math.max(2,Math.floor(t)),p=(c+1)*(u+1),h=X(3*p),w=X(3*p),y=X(2*p),m=[];let d=0;for(let x=0;x<=u;x++){const A=[],f=x/u,z=r+f*l,O=Math.cos(z);for(let P=0;P<=c;P++){const H=P/c,b=s+H*i,j=Math.cos(b)*O,V=Math.sin(z),K=-Math.sin(b)*O;h[3*d]=j*e,h[3*d+1]=V*e,h[3*d+2]=K*e,w[3*d]=j,w[3*d+1]=V,w[3*d+2]=K,y[2*d]=H,y[2*d+1]=f,A.push(d),++d}m.push(A)}const v=new Array;for(let x=0;x<u;x++)for(let A=0;A<c;A++){const f=m[x][A],z=m[x][A+1],O=m[x+1][A+1],P=m[x+1][A];x===0?(v.push(f),v.push(O),v.push(P)):x===u-1?(v.push(f),v.push(z),v.push(O)):(v.push(f),v.push(z),v.push(O),v.push(O),v.push(P),v.push(f))}const g=[["position",new M(h,v,3,!0)],["normal",new M(w,v,3,!0)]];return n.uv&&g.push(["uv0",new M(y,v,2,!0)]),n.offset&&(g[0][0]="offset",g.push(["position",new M(Float64Array.from(n.offset),jt(v.length),3,!0)])),new Z(o,g)}function zn(o,e,a,t){const n=Ma(e,a);return new Z(o,n)}function Ma(o,e,a){let t,n;t=[0,-1,0,1,0,0,0,0,1,-1,0,0,0,0,-1,0,1,0],n=[0,1,2,0,2,3,0,3,4,0,4,1,1,5,2,2,5,3,3,5,4,4,5,1];for(let l=0;l<t.length;l+=3)dt(t,l,o/pt(t,l));let s={};function i(l,c){l>c&&([l,c]=[c,l]);const u=l.toString()+"."+c.toString();if(s[u])return s[u];let p=t.length;return t.length+=3,ma(t,3*l,t,3*c,t,p),dt(t,p,o/pt(t,p)),p/=3,s[u]=p,p}for(let l=0;l<e;l++){const c=n.length,u=new Array(4*c);for(let p=0;p<c;p+=3){const h=n[p],w=n[p+1],y=n[p+2],m=i(h,w),d=i(w,y),v=i(y,h),g=4*p;u[g]=h,u[g+1]=m,u[g+2]=v,u[g+3]=w,u[g+4]=d,u[g+5]=m,u[g+6]=y,u[g+7]=v,u[g+8]=d,u[g+9]=m,u[g+10]=d,u[g+11]=v}n=u,s={}}const r=nt(t);for(let l=0;l<r.length;l+=3)ga(r,l);return[["position",new M(nt(t),n,3,!0)],["normal",new M(r,n,3,!0)]]}function On(o,{normal:e,position:a,color:t,rotation:n,size:s,centerOffsetAndDistance:i,uvi:r,featureAttribute:l,olidColor:c=null}={}){const u=a?Je(a):F(),p=e?Je(e):yt(0,0,1),h=t?[t[0],t[1],t[2],t.length>3?t[3]:255]:[255,255,255,255],w=s!=null&&s.length===2?s:[1,1],y=n!=null?[n]:[0],m=jt(1),d=[["position",new M(u,m,3,!0)],["normal",new M(p,m,3,!0)],["color",new M(h,m,4,!0)],["size",new M(w,m,2)],["rotation",new M(y,m,1,!0)]];if(r&&d.push(["uvi",new M(r,m,r.length)]),i!=null){const v=[i[0],i[1],i[2],i[3]];d.push(["centerOffsetAndDistance",new M(v,m,4)])}if(l){const v=[l[0],l[1],l[2],l[3]];d.push(["featureAttribute",new M(v,m,4)])}return new Z(o,d,null,1,c,void 0,xa())}function Da(o,e,a,t,n=!0,s=!0){let i=0;const r=e,l=o;let c=I(0,i,0),u=I(0,i+l,0),p=I(0,-1,0),h=I(0,1,0);t&&(i=l,u=I(0,0,0),c=I(0,i,0),p=I(0,1,0),h=I(0,-1,0));const w=[u,c],y=[p,h],m=a+2,d=Math.sqrt(l*l+r*r);if(t)for(let f=a-1;f>=0;f--){const z=f*(2*Math.PI/a),O=I(Math.cos(z)*r,i,Math.sin(z)*r);w.push(O);const P=I(l*Math.cos(z)/d,-r/d,l*Math.sin(z)/d);y.push(P)}else for(let f=0;f<a;f++){const z=f*(2*Math.PI/a),O=I(Math.cos(z)*r,i,Math.sin(z)*r);w.push(O);const P=I(l*Math.cos(z)/d,r/d,l*Math.sin(z)/d);y.push(P)}const v=new Array,g=new Array;if(n){for(let f=3;f<w.length;f++)v.push(1),v.push(f-1),v.push(f),g.push(0),g.push(0),g.push(0);v.push(w.length-1),v.push(2),v.push(1),g.push(0),g.push(0),g.push(0)}if(s){for(let f=3;f<w.length;f++)v.push(f),v.push(f-1),v.push(0),g.push(f),g.push(f-1),g.push(1);v.push(0),v.push(2),v.push(w.length-1),g.push(1),g.push(2),g.push(y.length-1)}const x=X(3*m);for(let f=0;f<m;f++)x[3*f]=w[f][0],x[3*f+1]=w[f][1],x[3*f+2]=w[f][2];const A=X(3*m);for(let f=0;f<m;f++)A[3*f]=y[f][0],A[3*f+1]=y[f][1],A[3*f+2]=y[f][2];return[["position",new M(x,v,3,!0)],["normal",new M(A,g,3,!0)]]}function An(o,e,a,t,n,s=!0,i=!0){return new Z(o,Da(e,a,t,n,s,i))}function Cn(o,e,a,t,n,s,i){const r=n?at(n):I(1,0,0),l=s?at(s):I(0,0,0);i??=!0;const c=Y();L(c,r);const u=Y();G(u,c,Math.abs(e));const p=Y();G(p,u,-.5),q(p,p,l);const h=I(0,1,0);Math.abs(1-Ye(c,h))<.2&&oe(h,0,0,1);const w=Y();ae(w,c,h),L(w,w),ae(h,w,c);const y=2*t+(i?2:0),m=t+(i?2:0),d=X(3*y),v=X(3*m),g=X(2*y),x=new Array(3*t*(i?4:2)),A=new Array(3*t*(i?4:2));i&&(d[3*(y-2)]=p[0],d[3*(y-2)+1]=p[1],d[3*(y-2)+2]=p[2],g[2*(y-2)]=0,g[2*(y-2)+1]=0,d[3*(y-1)]=d[3*(y-2)]+u[0],d[3*(y-1)+1]=d[3*(y-2)+1]+u[1],d[3*(y-1)+2]=d[3*(y-2)+2]+u[2],g[2*(y-1)]=1,g[2*(y-1)+1]=1,v[3*(m-2)]=-c[0],v[3*(m-2)+1]=-c[1],v[3*(m-2)+2]=-c[2],v[3*(m-1)]=c[0],v[3*(m-1)+1]=c[1],v[3*(m-1)+2]=c[2]);const f=(b,j,V)=>{x[b]=j,A[b]=V};let z=0;const O=Y(),P=Y();for(let b=0;b<t;b++){const j=b*(2*Math.PI/t);G(O,h,Math.sin(j)),G(P,w,Math.cos(j)),q(O,O,P),v[3*b]=O[0],v[3*b+1]=O[1],v[3*b+2]=O[2],G(O,O,a),q(O,O,p),d[3*b]=O[0],d[3*b+1]=O[1],d[3*b+2]=O[2],g[2*b]=b/t,g[2*b+1]=0,d[3*(b+t)]=d[3*b]+u[0],d[3*(b+t)+1]=d[3*b+1]+u[1],d[3*(b+t)+2]=d[3*b+2]+u[2],g[2*(b+t)]=b/t,g[2*b+1]=1;const V=(b+1)%t;f(z++,b,b),f(z++,b+t,b),f(z++,V,V),f(z++,V,V),f(z++,b+t,b),f(z++,V+t,V)}if(i){for(let b=0;b<t;b++){const j=(b+1)%t;f(z++,y-2,m-2),f(z++,b,m-2),f(z++,j,m-2)}for(let b=0;b<t;b++){const j=(b+1)%t;f(z++,b+t,m-1),f(z++,y-1,m-1),f(z++,j+t,m-1)}}const H=[["position",new M(d,x,3,!0)],["normal",new M(v,A,3,!0)],["uv0",new M(g,x,2,!0)]];return new Z(o,H)}function Mn(o,e,a,t,n,s){t=t||10,n=n==null||n,Tt(e.length>1);const i=[[0,0,0]],r=[],l=[];for(let c=0;c<t;c++){r.push([0,-c-1,-(c+1)%t-1]);const u=c/t*2*Math.PI;l.push([Math.cos(u)*a,Math.sin(u)*a])}return Va(o,l,e,i,r,n,s)}function Va(o,e,a,t,n,s,i=I(0,0,0)){const r=e.length,l=X(a.length*r*3+(6*t.length||0)),c=X(a.length*r*3+(t?6:0)),u=new Array,p=new Array;let h=0,w=0;const y=F(),m=F(),d=F(),v=F(),g=F(),x=F(),A=F(),f=F(),z=F(),O=F(),P=F(),H=F(),b=F(),j=co();oe(z,0,1,0),W(m,a[1],a[0]),L(m,m),s?(q(f,a[0],i),L(d,f)):oe(d,0,0,1),vt(m,d,z,z,g,d,gt),k(v,d),k(H,g);for(let S=0;S<t.length;S++)G(x,g,t[S][0]),G(f,d,t[S][2]),q(x,x,f),q(x,x,a[0]),l[h++]=x[0],l[h++]=x[1],l[h++]=x[2];c[w++]=-m[0],c[w++]=-m[1],c[w++]=-m[2];for(let S=0;S<n.length;S++)u.push(n[S][0]>0?n[S][0]:-n[S][0]-1+t.length),u.push(n[S][1]>0?n[S][1]:-n[S][1]-1+t.length),u.push(n[S][2]>0?n[S][2]:-n[S][2]-1+t.length),p.push(0),p.push(0),p.push(0);let V=t.length;const K=t.length-1;for(let S=0;S<a.length;S++){let me=!1;S>0&&(k(y,m),S<a.length-1?(W(m,a[S+1],a[S]),L(m,m)):me=!0,q(O,y,m),L(O,O),q(P,a[S-1],v),uo(a[S],O,j),fo(j,po(P,y),f)?(W(f,f,a[S]),L(d,f),ae(g,O,d),L(g,g)):vt(O,v,H,z,g,d,gt),k(v,d),k(H,g)),s&&(q(f,a[S],i),L(b,f));for(let J=0;J<r;J++)if(G(x,g,e[J][0]),G(f,d,e[J][1]),q(x,x,f),L(A,x),c[w++]=A[0],c[w++]=A[1],c[w++]=A[2],q(x,x,a[S]),l[h++]=x[0],l[h++]=x[1],l[h++]=x[2],!me){const je=(J+1)%r;u.push(V+J),u.push(V+r+J),u.push(V+je),u.push(V+je),u.push(V+r+J),u.push(V+r+je);for(let Te=0;Te<6;Te++){const qt=u.length-6;p.push(u[qt+Te]-K)}}V+=r}const le=a[a.length-1];for(let S=0;S<t.length;S++)G(x,g,t[S][0]),G(f,d,t[S][1]),q(x,x,f),q(x,x,le),l[h++]=x[0],l[h++]=x[1],l[h++]=x[2];const Q=w/3;c[w++]=m[0],c[w++]=m[1],c[w++]=m[2];const N=V-r;for(let S=0;S<n.length;S++)u.push(n[S][0]>=0?V+n[S][0]:-n[S][0]-1+N),u.push(n[S][2]>=0?V+n[S][2]:-n[S][2]-1+N),u.push(n[S][1]>=0?V+n[S][1]:-n[S][1]-1+N),p.push(Q),p.push(Q),p.push(Q);const ne=[["position",new M(l,u,3,!0)],["normal",new M(c,p,3,!0)]];return new Z(o,ne)}function Dn(o,e,a,t,n){const s=lo(3*e.length),i=new Array(2*(e.length-1));let r=0,l=0;for(let u=0;u<e.length;u++){for(let p=0;p<3;p++)s[r++]=e[u][p];u>0&&(i[l++]=u-1,i[l++]=u)}const c=[["position",new M(s,i,3,!0)]];if(a&&a.length===e.length&&a[0].length===3){const u=X(3*a.length);let p=0;for(let h=0;h<e.length;h++)for(let w=0;w<3;w++)u[p++]=a[h][w];c.push(["normal",new M(u,i,3,!0)])}return t&&c.push(["color",new M(t,ia(t.length/4),4)]),new Z(o,c,null,2)}function Vn(o,e,a,t,n,s=0){const i=new Array(18),r=[[-a,s,n/2],[t,s,n/2],[0,e+s,n/2],[-a,s,-n/2],[t,s,-n/2],[0,e+s,-n/2]],l=[0,1,2,3,0,2,2,5,3,1,4,5,5,2,1,1,0,3,3,4,1,4,3,5];for(let c=0;c<6;c++)i[3*c]=r[c][0],i[3*c+1]=r[c][1],i[3*c+2]=r[c][2];return new Z(o,[["position",new M(i,l,3,!0)]])}function jn(o,e){const a=o.getMutableAttribute("position").data;for(let t=0;t<a.length;t+=3){const n=a[t],s=a[t+1],i=a[t+2];oe(fe,n,s,i),re(fe,fe,e),a[t]=fe[0],a[t+1]=fe[1],a[t+2]=fe[2]}}function Tn(o,e=o){const a=o.attributes,t=a.get("position").data,n=a.get("normal").data;if(n){const s=e.getMutableAttribute("normal").data;for(let i=0;i<n.length;i+=3){const r=n[i+1];s[i+1]=-n[i+2],s[i+2]=r}}if(t){const s=e.getMutableAttribute("position").data;for(let i=0;i<t.length;i+=3){const r=t[i+1];s[i+1]=-t[i+2],s[i+2]=r}}}function Be(o,e,a,t,n){return!(Math.abs(Ye(e,o))>n)&&(ae(a,o,e),L(a,a),ae(t,a,o),L(t,t),!0)}function vt(o,e,a,t,n,s,i){return Be(o,e,n,s,i)||Be(o,a,n,s,i)||Be(o,t,n,s,i)}const gt=.99619469809,fe=F();function ja(o){return o instanceof Float32Array&&o.length>=16}function Ta(o){return Array.isArray(o)&&o.length>=16}function Fa(o){return ja(o)||Ta(o)}const Rt=.5;function _a(o,e){o.include(At),o.attributes.add("position","vec3"),o.attributes.add("normal","vec3"),o.attributes.add("centerOffsetAndDistance","vec4");const a=o.vertex;Co(a,e),Mo(a,e),a.uniforms.add(new Ke("viewport",t=>t.camera.fullViewport),new He("polygonOffset",t=>t.shaderPolygonOffset),new Me("cameraGroundRelative",t=>t.camera.aboveGround?1:-1)),e.hasVerticalOffset&&Do(a),a.code.add($`struct ProjectHUDAux {
vec3 posModel;
vec3 posView;
vec3 vnormal;
float distanceToCamera;
float absCosAngle;
};`),a.code.add($`
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
  `),e.draped&&!e.hasVerticalOffset||Vo(a),e.draped||(a.uniforms.add(new Me("perDistancePixelRatio",t=>Math.tan(t.camera.fovY/2)/(t.camera.fullViewport[2]/2))),a.code.add($`
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
  `)),e.screenCenterOffsetUnitsEnabled&&Ct(a),e.hasScreenSizePerspective&&Mt(a),a.code.add($`
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
  `)}function Qe(o){o.uniforms.add(new jo("alignPixelEnabled",e=>e.alignPixelEnabled)),o.code.add($`vec4 alignToPixelCenter(vec4 clipCoord, vec2 widthHeight) {
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
}`)}function Ra(o,e){const{vertex:a,fragment:t}=o;o.include(To,e),a.include(Qe),a.main.add($`vec4 posProjCenter;
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
}`)}function Ea(o){o.vertex.uniforms.add(new Me("renderTransparentlyOccludedHUD",e=>e.hudRenderStyle===0?1:e.hudRenderStyle===1?0:.75),new Ke("viewport",e=>e.camera.fullViewport),new Dt("hudVisibilityTexture",e=>e.hudVisibility?.getTexture())),o.vertex.include(Qe),o.vertex.code.add($`bool testHUDVisibility(vec4 posProj) {
vec4 posProjCenter = alignToPixelCenter(posProj, viewport.zw);
vec4 occlusionPixel = texture(hudVisibilityTexture, .5 + .5 * posProjCenter.xy / posProjCenter.w);
if (renderTransparentlyOccludedHUD > 0.5) {
return occlusionPixel.r * occlusionPixel.g > 0.0 && occlusionPixel.g * renderTransparentlyOccludedHUD < 1.0;
}
return occlusionPixel.r * occlusionPixel.g > 0.0 && occlusionPixel.g == 1.0;
}`)}class Ua extends Fo{constructor(e,a,t){super(e,"vec4",2,(n,s,i)=>n.setUniform4fv(e,a(s,i),t))}}function Et(o){const e=new pa,{signedDistanceFieldEnabled:a,occlusionTestEnabled:t,horizonCullingEnabled:n,pixelSnappingEnabled:s,hasScreenSizePerspective:i,debugDrawLabelBorder:r,hasVVSize:l,hasVVColor:c,hasRotation:u,occludedFragmentFade:p,sampleSignedDistanceFieldTexelCenter:h}=o;e.include(_a,o),e.vertex.include(_o,o);const{occlusionPass:w,output:y,oitPass:m}=o;if(w)return e.include(Ra,o),e;const{vertex:d,fragment:v}=e;e.include(At),e.include(Ro,o),e.include(Eo,o),t&&e.include(Ea),v.include(Uo),e.varyings.add("vcolor","vec4"),e.varyings.add("vtc","vec2"),e.varyings.add("vsize","vec2");const g=y===9,x=g&&t;x&&e.varyings.add("voccluded","float"),d.uniforms.add(new Ke("viewport",P=>P.camera.fullViewport),new it("screenOffset",(P,H)=>Ze(Ae,2*P.screenOffset[0]*H.camera.pixelRatio,2*P.screenOffset[1]*H.camera.pixelRatio)),new it("anchorPosition",P=>ge(P)),new Fe("materialColor",P=>P.color),new He("materialRotation",P=>P.rotation),new st("tex",P=>P.texture)),Ct(d),a&&(d.uniforms.add(new Fe("outlineColor",P=>P.outlineColor)),v.uniforms.add(new Fe("outlineColor",P=>mt(P)?P.outlineColor:vo),new He("outlineSize",P=>mt(P)?P.outlineSize:0))),n&&d.uniforms.add(new Ua("pointDistanceSphere",(P,H)=>{const b=H.camera.eye,j=P.origin;return go(j[0]-b[0],j[1]-b[1],j[2]-b[2],mo.radius)})),s&&d.include(Qe),i&&(Bo(d),Mt(d)),r&&e.varyings.add("debugBorderCoords","vec4"),e.attributes.add("uv0","vec2"),e.attributes.add("uvi","vec4"),e.attributes.add("color","vec4"),e.attributes.add("size","vec2"),e.attributes.add("rotation","float"),(l||c)&&e.attributes.add("featureAttribute","vec4"),d.code.add(n?$`bool behindHorizon(vec3 posModel) {
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
    ${B(i,$`
        inputSize = screenSizePerspectiveScaleVec2(size, projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspective);
        vec2 screenOffsetScaled = screenSizePerspectiveScaleVec2(screenOffset, projectAux.absCosAngle, projectAux.distanceToCamera, screenSizePerspectiveAlignment);`,$`
        inputSize = size;
        vec2 screenOffsetScaled = screenOffset;`)}
    ${B(l,$`inputSize *= vvScale(featureAttribute).xx;`)}

    vec2 combinedSize = inputSize * pixelRatio;
    vec4 quadOffset = vec4(0.0);

    ${B(t,$`
    bool visible = testHUDVisibility(posProj);
    if (!visible) {
      vtc = vec2(0.0);
      ${B(r,"debugBorderCoords = vec4(0.5, 0.5, 1.5 / combinedSize);")}
      return;
    }`)}
    ${B(x,$`voccluded = visible ? 0.0 : 1.0;`)}
  `);const A=$`
      vec2 uv = mix(uvi.xy, uvi.zw, bvec2(uv0));
      vec2 texSize = vec2(textureSize(tex, 0));
      uv = mix(vec2(1.0), uv / texSize, lessThan(uv, vec2(${Ia})));
      quadOffset.xy = (uv0 - anchorPosition) * 2.0 * combinedSize;

      ${B(u,$`
          float angle = radians(materialRotation + rotation);
          float cosAngle = cos(angle);
          float sinAngle = sin(angle);
          mat2 rotate = mat2(cosAngle, -sinAngle, sinAngle,  cosAngle);

          quadOffset.xy = rotate * quadOffset.xy;
        `)}

      quadOffset.xy = (quadOffset.xy + screenOffsetScaled) / viewport.zw * posProj.w;
  `,f=s?a?$`posProj = alignToPixelOrigin(posProj, viewport.zw) + quadOffset;`:$`posProj += quadOffset;
if (inputSize.x == size.x) {
posProj = alignToPixelOrigin(posProj, viewport.zw);
}`:$`posProj += quadOffset;`;d.main.add($`
    ${A}
    ${c?"vcolor = interpolateVVColor(featureAttribute.y) * materialColor;":"vcolor = color / 255.0 * materialColor;"}

    ${B(y===10,$`vcolor.a = 1.0;`)}

    bool alphaDiscard = vcolor.a < ${$.float(te)};
    ${B(a,`alphaDiscard = alphaDiscard && outlineColor.a < ${$.float(te)};`)}
    if (alphaDiscard) {
      // "early discard" if both symbol color (= fill) and outline color (if applicable) are transparent
      gl_Position = vec4(1e38, 1e38, 1e38, 1.0);
      return;
    } else {
      ${f}
      gl_Position = posProj;
    }

    vtc = uv;

    ${B(r,$`debugBorderCoords = vec4(uv01, 1.5 / combinedSize);`)}
    vsize = inputSize;
  `),v.uniforms.add(new st("tex",P=>P.texture)),p&&!g&&v.uniforms.add(new Dt("depthMap",P=>P.mainDepth),new Me("occludedOpacity",P=>P.hudOccludedFragmentOpacity));const z=r?$`(isBorder > 0.0 ? 0.0 : ${$.float(te)})`:$.float(te),O=$`
    ${B(r,$`float isBorder = float(any(lessThan(debugBorderCoords.xy, debugBorderCoords.zw)) || any(greaterThan(debugBorderCoords.xy, 1.0 - debugBorderCoords.zw)));`)}

    vec2 samplePos = vtc;

    ${B(h,$`
      float txSize = float(textureSize(tex, 0).x);
      float texelSize = 1.0 / txSize;

      // Calculate how much we have to add/subtract to/from each texel to reach the size of an onscreen pixel
      vec2 scaleFactor = (vsize - txSize) * texelSize;
      samplePos += (vec2(1.0, -1.0) * texelSize) * scaleFactor;`)}

    ${a?$`
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

        ${B(!g,$`fragColor = vec4(compositeColor, compositeAlpha);`)}
      } else {
        if (fillAlphaFactor < ${z}) {
          discard;
        }

        ${B(!g,$`fragColor = premultiplyAlpha(fillPixelColor);`)}
      }

      // visualize SDF:
      // fragColor = vec4(clamp(-pixelDistance/vsize.x*2.0, 0.0, 1.0), clamp(pixelDistance/vsize.x*2.0, 0.0, 1.0), 0.0, 1.0);
      `:$`
          vec4 texColor = texture(tex, samplePos, -0.5);
          if (texColor.a < ${z}) {
            discard;
          }
          ${B(!g,$`fragColor = texColor * premultiplyAlpha(vcolor);`)}
          `}

    ${B(p&&!g,$`
        float zSample = texelFetch(depthMap, ivec2(gl_FragCoord.xy), 0).x;
        if (zSample < gl_FragCoord.z) {
          fragColor *= occludedOpacity;
        }
        `)}

    ${B(!g&&r,$`fragColor = mix(fragColor, vec4(1.0, 0.0, 1.0, 1.0), isBorder * 0.5);`)}
  `;switch(y){case 0:case 1:e.outputs.add("fragColor","vec4",0),y===1&&e.outputs.add("fragEmission","vec4",1),m===1&&e.outputs.add("fragAlpha","float",y===1?2:1),v.main.add($`
        ${O}
        ${B(m===2,$`fragColor.rgb /= fragColor.a;`)}
        ${B(y===1,$`fragEmission = vec4(0.0);`)}
        ${B(m===1,$`fragAlpha = fragColor.a;`)}`);break;case 10:v.main.add($`
        ${O}
        outputObjectAndLayerIdColor();`);break;case 9:e.include(Io,o),v.main.add($`
        ${O}
        outputHighlight(${B(x,$`voccluded == 1.0`,$`false`)});`)}return e}function mt(o){return o.outlineColor[3]>0&&o.outlineSize>0}function ge(o){return o.textureIsSignedDistanceField?Ba(o.anchorPosition,o.distanceFieldBoundingBox,Ae):ho(Ae,o.anchorPosition),Ae}function Ba(o,e,a){Ze(a,o[0]*(e[2]-e[0])+e[0],o[1]*(e[3]-e[1])+e[1])}const Ae=Xe(),ye=32e3,Ia=$.float(ye),Ha=Object.freeze(Object.defineProperty({__proto__:null,build:Et,calculateAnchorPosition:ge,fullUV:ye},Symbol.toStringTag,{value:"Module"}));class Ga extends Go{constructor(e,a){super(e,a,new Lo(Ha,()=>xo(()=>Promise.resolve().then(()=>Ja),void 0)),fa([Ut,It()].map(ra))),this.primitiveType=a.occlusionPass?et.POINTS:et.TRIANGLE_STRIP}initializePipeline(e){const{oitPass:a,hasPolygonOffset:t,draped:n,output:s,depthTestEnabled:i,occlusionPass:r}=e,l=i&&!n&&a!==1&&!r&&s!==9;return la({blending:Vt(s)?ko(a,!0):null,depthTest:i&&!n?{func:515}:null,depthWrite:l?ua:null,drawBuffers:qo(a,s),colorWrite:ca,polygonOffset:t?La:null})}}const La={factor:0,units:-4},Ut=Ft().vec2u8("uv0",{glNormalized:!0}),Bt=Ft().vec3f("position").vec3f("normal").vec4i16("uvi").vec4u8("color").vec2f("size").f32("rotation").vec4f("centerOffsetAndDistance").vec4f("featureAttribute"),qa=Bt.clone().vec4u8("olidColor");function It(){return Ho()?qa:Bt}class _ extends No{constructor(e){super(),this.spherical=e,this.screenCenterOffsetUnitsEnabled=!1,this.occlusionTestEnabled=!0,this.signedDistanceFieldEnabled=!1,this.sampleSignedDistanceFieldTexelCenter=!1,this.hasVVSize=!1,this.hasVVColor=!1,this.hasVerticalOffset=!1,this.hasScreenSizePerspective=!1,this.hasRotation=!1,this.debugDrawLabelBorder=!1,this.hasPolygonOffset=!1,this.depthTestEnabled=!0,this.pixelSnappingEnabled=!0,this.draped=!1,this.terrainDepthTest=!1,this.cullAboveTerrain=!1,this.occlusionPass=!1,this.occludedFragmentFade=!1,this.horizonCullingEnabled=!0,this.isFocused=!0,this.olidColorInstanced=!1,this.textureCoordinateType=0,this.emissionSource=0,this.discardInvisibleFragments=!0,this.hasVVInstancing=!1,this.snowCover=!1}}E([U()],_.prototype,"screenCenterOffsetUnitsEnabled",void 0),E([U()],_.prototype,"occlusionTestEnabled",void 0),E([U()],_.prototype,"signedDistanceFieldEnabled",void 0),E([U()],_.prototype,"sampleSignedDistanceFieldTexelCenter",void 0),E([U()],_.prototype,"hasVVSize",void 0),E([U()],_.prototype,"hasVVColor",void 0),E([U()],_.prototype,"hasVerticalOffset",void 0),E([U()],_.prototype,"hasScreenSizePerspective",void 0),E([U()],_.prototype,"hasRotation",void 0),E([U()],_.prototype,"debugDrawLabelBorder",void 0),E([U()],_.prototype,"hasPolygonOffset",void 0),E([U()],_.prototype,"depthTestEnabled",void 0),E([U()],_.prototype,"pixelSnappingEnabled",void 0),E([U()],_.prototype,"draped",void 0),E([U()],_.prototype,"terrainDepthTest",void 0),E([U()],_.prototype,"cullAboveTerrain",void 0),E([U()],_.prototype,"occlusionPass",void 0),E([U()],_.prototype,"occludedFragmentFade",void 0),E([U()],_.prototype,"horizonCullingEnabled",void 0),E([U()],_.prototype,"isFocused",void 0);class Fn extends Wo{constructor(e,a){super(e,Ka),this.produces=new Map([[13,t=>_e(t)&&!this.parameters.drawAsLabel],[14,t=>_e(t)&&this.parameters.drawAsLabel],[12,()=>this.parameters.occlusionTest],[18,t=>this.parameters.draped&&_e(t)]]),this._visible=!0,this._configuration=new _(a)}getConfiguration(e,a){const t=this.parameters.draped;return super.getConfiguration(e,a,this._configuration),this._configuration.hasSlicePlane=this.parameters.hasSlicePlane,this._configuration.hasVerticalOffset=!!this.parameters.verticalOffset,this._configuration.hasScreenSizePerspective=!!this.parameters.screenSizePerspective,this._configuration.screenCenterOffsetUnitsEnabled=this.parameters.centerOffsetUnits==="screen",this._configuration.hasPolygonOffset=this.parameters.polygonOffset,this._configuration.draped=t,this._configuration.occlusionTestEnabled=this.parameters.occlusionTest,this._configuration.pixelSnappingEnabled=this.parameters.pixelSnappingEnabled,this._configuration.signedDistanceFieldEnabled=this.parameters.textureIsSignedDistanceField,this._configuration.sampleSignedDistanceFieldTexelCenter=this.parameters.sampleSignedDistanceFieldTexelCenter,this._configuration.hasRotation=this.parameters.hasRotation,this._configuration.hasVVSize=!!this.parameters.vvSize,this._configuration.hasVVColor=!!this.parameters.vvColor,this._configuration.occlusionPass=a.slot===12,this._configuration.occludedFragmentFade=!t&&this.parameters.occludedFragmentFade,this._configuration.horizonCullingEnabled=this.parameters.horizonCullingEnabled,this._configuration.isFocused=this.parameters.isFocused,this._configuration.depthTestEnabled=this.parameters.depthEnabled||a.slot===12,Vt(e)&&(this._configuration.debugDrawLabelBorder=!!Yo.LABELS_SHOW_BORDER),this._configuration.oitPass=a.oitPass,this._configuration.terrainDepthTest=a.terrainDepthTest,this._configuration.cullAboveTerrain=a.cullAboveTerrain,this._configuration}intersect(e,a,t,n,s,i){const{options:{selectionMode:r,hud:l,excludeLabels:c},point:u,camera:p}=t,{parameters:h}=this;if(!r||!l||c&&h.isLabel||!e.visible||!u||!p)return;const w=e.attributes.get("featureAttribute"),y=w==null?null:tt(w.data,qe),{scaleX:m,scaleY:d}=ke(y,h,p.pixelRatio);Pt(Ce,a),e.attributes.has("featureAttribute")&&Wa(Ce);const v=e.attributes.get("position"),g=e.attributes.get("size"),x=e.attributes.get("normal"),A=e.attributes.get("rotation"),f=e.attributes.get("centerOffsetAndDistance");Tt(v.size>=3);const z=ge(h),O=this.parameters.centerOffsetUnits==="screen";for(let P=0;P<v.data.length/v.size;P++){const H=P*v.size;oe(C,v.data[H],v.data[H+1],v.data[H+2]),re(C,C,a),re(C,C,p.viewMatrix);const b=P*f.size;if(oe(T,f.data[b],f.data[b+1],f.data[b+2]),!O&&(C[0]+=T[0],C[1]+=T[1],T[2]!==0)){const V=T[2];L(T,C),W(C,C,G(T,T,V))}const j=P*x.size;if(oe(se,x.data[j],x.data[j+1],x.data[j+2]),Ge(se,Ce,p,be),Ne(this.parameters,C,be,p,ve),p.applyProjection(C,D),D[0]>-1){O&&(T[0]||T[1])&&(D[0]+=T[0]*p.pixelRatio,T[1]!==0&&(D[1]+=ve.alignmentEvaluator.apply(T[1])*p.pixelRatio),p.unapplyProjection(D,C)),D[0]+=this.parameters.screenOffset[0]*p.pixelRatio,D[1]+=this.parameters.screenOffset[1]*p.pixelRatio,D[0]=Math.floor(D[0]),D[1]=Math.floor(D[1]);const V=P*g.size;R[0]=g.data[V],R[1]=g.data[V+1],ve.evaluator.applyVec2(R,R);const K=Lt*p.pixelRatio;let le=0;h.textureIsSignedDistanceField&&(le=Math.min(h.outlineSize,.5*R[0])*p.pixelRatio/2),R[0]*=m,R[1]*=d;const Q=P*A.size,N=h.rotation+A.data[Q];if(Le(u,D[0],D[1],R,K,le,N,h,z)){const ne=t.ray;if(re(De,C,zt(Gt,p.viewMatrix)),D[0]=u[0],D[1]=u[1],p.unprojectFromRenderScreen(D,C)){const S=F();k(S,ne.direction);const me=1/we(S);G(S,S,me),i(Ot(ne.origin,C)*me,S,-1,De)}}}}}intersectDraped(e,a,t,n,s){const i=e.attributes.get("position"),r=e.attributes.get("size"),l=e.attributes.get("rotation"),c=this.parameters,u=ge(c),p=e.attributes.get("featureAttribute"),h=p==null?null:tt(p.data,qe),{scaleX:w,scaleY:y}=ke(h,c,e.screenToWorldRatio),m=Xa*e.screenToWorldRatio;for(let d=0;d<i.data.length/i.size;d++){const v=d*i.size,g=i.data[v],x=i.data[v+1],A=d*r.size;R[0]=r.data[A],R[1]=r.data[A+1];let f=0;c.textureIsSignedDistanceField&&(f=Math.min(c.outlineSize,.5*R[0])*e.screenToWorldRatio/2),R[0]*=w,R[1]*=y;const z=d*l.size,O=c.rotation+l.data[z];Le(t,g,x,R,m,f,O,c,u)&&n(s.distance,s.normal,-1)}}createBufferWriter(){return new Qa}applyShaderOffsetsView(e,a,t,n,s,i,r){const l=Ge(a,t,s,be);return this._applyVerticalGroundOffsetView(e,l,s,r),Ne(this.parameters,r,l,s,i),this._applyPolygonOffsetView(r,l,n[3],s,r),this._applyCenterOffsetView(r,n,r),r}applyShaderOffsetsNDC(e,a,t,n,s){return this._applyCenterOffsetNDC(e,a,t,n),s!=null&&k(s,n),this._applyPolygonOffsetNDC(n,a,t,n),n}_applyPolygonOffsetView(e,a,t,n,s){const i=n.aboveGround?1:-1;let r=Math.sign(t);r===0&&(r=i);const l=i*r;if(this.parameters.shaderPolygonOffset<=0)return k(s,e);const c=bo(Math.abs(a.cosAngle),.01,1),u=1-Math.sqrt(1-c*c)/c/n.viewport[2];return G(s,e,l>0?u:1/u),s}_applyVerticalGroundOffsetView(e,a,t,n){const s=we(e),i=t.aboveGround?1:-1,r=t.computeRenderPixelSizeAtDist(s)*Rt,l=G(C,a.normal,i*r);return q(n,e,l),n}_applyCenterOffsetView(e,a,t){const n=this.parameters.centerOffsetUnits!=="screen";return t!==e&&k(t,e),n&&(t[0]+=a[0],t[1]+=a[1],a[2]&&(L(se,t),wo(t,t,G(se,se,a[2])))),t}_applyCenterOffsetNDC(e,a,t,n){const s=this.parameters.centerOffsetUnits!=="screen";return n!==e&&k(n,e),s||(n[0]+=a[0]/t.fullWidth*2,n[1]+=a[1]/t.fullHeight*2),n}_applyPolygonOffsetNDC(e,a,t,n){const s=this.parameters.shaderPolygonOffset;if(e!==n&&k(n,e),s){const i=t.aboveGround?1:-1,r=i*Math.sign(a[3]);n[2]-=(r||i)*s}return n}set visible(e){this._visible=e}get visible(){const{color:e,outlineSize:a,outlineColor:t}=this.parameters,n=e[3]>=te||a>=te&&t[3]>=te;return this._visible&&n}createGLMaterial(e){return new ka(e)}calculateRelativeScreenBounds(e,a,t=bt()){return Na(this.parameters,e,a,t),t[2]=t[0]+e[0],t[3]=t[1]+e[1],t}}class ka extends na{constructor(e){super({...e,...e.material.parameters})}beginSlot(e){return this.updateTexture(this._material.parameters.textureId),this._material.setParameters(this.textureBindParameters),this.getTechnique(Ga,e)}}function Na(o,e,a,t){t[0]=o.anchorPosition[0]*-e[0]+o.screenOffset[0]*a,t[1]=o.anchorPosition[1]*-e[1]+o.screenOffset[1]*a}function Ge(o,e,a,t){return Fa(e)&&(e=Pt(Ya,e)),yo(t.normal,o,e),re(t.normal,t.normal,a.viewInverseTransposeMatrix),t.cosAngle=Ye(Ht,Za),t}function Wa(o){const e=o[0],a=o[1],t=o[2],n=o[3],s=o[4],i=o[5],r=o[6],l=o[7],c=o[8],u=1/Math.sqrt(e*e+a*a+t*t),p=1/Math.sqrt(n*n+s*s+i*i),h=1/Math.sqrt(r*r+l*l+c*c);return o[0]=e*u,o[1]=a*u,o[2]=t*u,o[3]=n*p,o[4]=s*p,o[5]=i*p,o[6]=r*h,o[7]=l*h,o[8]=c*h,o}function Le(o,e,a,t,n,s,i,r,l){let c=e-n-t[0]*l[0],u=c+t[0]+2*n,p=a-n-t[1]*l[1],h=p+t[1]+2*n;const w=r.distanceFieldBoundingBox;return r.textureIsSignedDistanceField&&w!=null&&(c+=t[0]*w[0],p+=t[1]*w[1],u-=t[0]*(1-w[2]),h-=t[1]*(1-w[3]),c-=s,u+=s,p-=s,h+=s),Ze(xt,e,a),Po(xe,o,xt,$o(i)),xe[0]>c&&xe[0]<u&&xe[1]>p&&xe[1]<h}const ve=new Xo,C=F(),se=F(),D=Ve(),Ht=F(),De=F(),xe=Xe(),xt=Xe(),Ce=$t(),Ya=$t(),Gt=wt(),Pe=Ve(),T=F(),Ie=F(),qe=Ve(),be={normal:Ht,cosAngle:0},Lt=1,Xa=2,R=St(0,0),Za=yt(0,0,1);class Ka extends Zo{constructor(){super(...arguments),this.renderOccluded=1,this.isDecoration=!1,this.color=ot(1,1,1,1),this.polygonOffset=!1,this.anchorPosition=St(.5,.5),this.screenOffset=[0,0],this.shaderPolygonOffset=1e-5,this.textureIsSignedDistanceField=!1,this.sampleSignedDistanceFieldTexelCenter=!1,this.outlineColor=ot(1,1,1,1),this.outlineSize=0,this.distanceFieldBoundingBox=Ve(),this.rotation=0,this.hasRotation=!1,this.vvSizeEnabled=!1,this.vvSize=null,this.vvColor=null,this.vvOpacity=null,this.vvSymbolAnchor=null,this.vvSymbolRotationMatrix=null,this.hasSlicePlane=!1,this.pixelSnappingEnabled=!0,this.occlusionTest=!0,this.occludedFragmentFade=!1,this.horizonCullingEnabled=!1,this.centerOffsetUnits="world",this.drawAsLabel=!1,this.depthEnabled=!0,this.isFocused=!0,this.focusStyle="bright",this.draped=!1,this.isLabel=!1}get hasVVSize(){return!!this.vvSize}get hasVVColor(){return!!this.vvColor}get hasVVOpacity(){return!!this.vvOpacity}}class Qa{constructor(){this.layout=Ut,this.instanceLayout=It()}elementCount(e){return e.get("position").indices.length}elementCountBaseInstance(e){return e.get("uv0").indices.length}write(e,a,t,n,s,i){const{position:r,normal:l,color:c,size:u,rotation:p,centerOffsetAndDistance:h,featureAttribute:w,uvi:y}=s;Jo(t.get("position"),e,r,i),ea(t.get("normal"),a,l,i);const m=t.get("position").indices.length;let d=0,v=0,g=ye,x=ye;const A=t.get("uvi")?.data;A&&A.length>=4&&(d=A[0],v=A[1],g=A[2],x=A[3]);for(let f=0;f<m;++f){const z=i+f;y.setValues(z,d,v,g,x)}if(ta(t.get("color"),4,c,i),rt(t.get("size"),u,i),oa(t.get("rotation"),p,i),t.get("centerOffsetAndDistance")?lt(t.get("centerOffsetAndDistance"),h,i):ct(h,i,m),t.get("featureAttribute")?lt(t.get("featureAttribute"),w,i):ct(w,i,m),n!=null){const f=t.get("position")?.indices;if(f){const z=f.length,O=s.getField("olidColor",sa);aa(n,O,z,i)}}return{numVerticesPerItem:1,numItems:m}}writeBaseInstance(e,a){const{uv0:t}=a;rt(e.get("uv0"),t,0)}intersect(e,a,t,n,s,i,r){const{options:{selectionMode:l,hud:c,excludeLabels:u},point:p,camera:h}=n;if(!l||!c||u&&a.isLabel||!p)return;const w=this.instanceLayout.createView(e),{position:y,normal:m,rotation:d,size:v,featureAttribute:g,centerOffsetAndDistance:x}=w,A=a.centerOffsetUnits==="screen",f=ge(a);if(y==null||m==null||d==null||v==null||x==null||h==null)return;const z=g==null?null:g.getVec(0,qe),{scaleX:O,scaleY:P}=ke(z,a,h.pixelRatio),H=y.count;for(let b=0;b<H;b++){if(y.getVec(b,C),t!=null&&q(C,C,t),re(C,C,h.viewMatrix),x.getVec(b,Pe),oe(T,Pe[0],Pe[1],Pe[2]),!A&&(C[0]+=T[0],C[1]+=T[1],T[2]!==0)){const j=T[2];L(T,C),W(C,C,G(T,T,j))}if(m.getVec(b,se),Ge(se,Ce,h,be),Ne(a,C,be,h,ve),h.applyProjection(C,D),D[0]>-1){A&&(T[0]||T[1])&&(D[0]+=T[0]*h.pixelRatio,T[1]!==0&&(D[1]+=ve.alignmentEvaluator.apply(T[1])*h.pixelRatio),h.unapplyProjection(D,C)),D[0]+=a.screenOffset[0]*h.pixelRatio,D[1]+=a.screenOffset[1]*h.pixelRatio,D[0]=Math.floor(D[0]),D[1]=Math.floor(D[1]),v.getVec(b,R),ve.evaluator.applyVec2(R,R);const j=Lt*h.pixelRatio;let V=0;a.textureIsSignedDistanceField&&(V=Math.min(a.outlineSize,.5*R[0])*h.pixelRatio/2),R[0]*=O,R[1]*=P;const K=d.get(b),le=a.rotation+K;if(Le(p,D[0],D[1],R,j,V,le,a,f)){const Q=n.ray;if(re(De,C,zt(Gt,h.viewMatrix)),D[0]=p[0],D[1]=p[1],h.unprojectFromRenderScreen(D,C)){const N=F();k(N,Q.direction);const ne=1/we(N);G(N,N,ne),r(Ot(Q.origin,C)*ne,N,b,De)}}}}}}function ke(o,e,a){return o==null||e.vvSize==null?{scaleX:a,scaleY:a}:(Ko(Ie,e,o),{scaleX:Ie[0]*a,scaleY:Ie[1]*a})}function Ne(o,e,a,t,n){if(!o.verticalOffset?.screenLength){const l=we(e);return n.update(a.cosAngle,l,o.screenSizePerspective,o.screenSizePerspectiveMinPixelReferenceSize,o.screenSizePerspectiveAlignment,null),e}const s=we(e),i=o.screenSizePerspectiveAlignment??o.screenSizePerspective,r=Qo(t,s,o.verticalOffset,a.cosAngle,i,o.screenSizePerspectiveMinPixelReferenceSize);return n.update(a.cosAngle,s,o.screenSizePerspective,o.screenSizePerspectiveMinPixelReferenceSize,o.screenSizePerspectiveAlignment,null),G(a.normal,a.normal,r),q(e,e,a.normal)}function _n(o){return o.type==="point"}const Ja=Object.freeze(Object.defineProperty({__proto__:null,build:Et,calculateAnchorPosition:ge,fullUV:ye},Symbol.toStringTag,{value:"Module"}));export{gn as A,mn as D,yn as E,wn as G,Dn as M,Pn as Q,vn as U,xn as Z,Cn as a,Tn as b,On as c,_a as d,bn as e,An as f,vt as g,zn as h,Fn as i,Sn as j,va as k,Qe as l,Vn as m,Ea as n,Mn as o,Da as p,Va as q,$n as r,_n as t,Ma as u,hn as w,jn as y};
//# sourceMappingURL=HUDMaterial.glsl-A2rRc_VO.js.map

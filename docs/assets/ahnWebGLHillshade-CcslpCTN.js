import{B as M,L as w,W as D,e as f,n as H,u as P,U as a,P as W,A as L,C as G,N as R,g as F,c as T,X as N}from"./index-BON4pXc5.js";function O(t,e){const r=`
    attribute vec2 ${L.TEXTURE_COORD};
    uniform mat4 ${a.TILE_TRANSFORM};
    uniform float ${a.TEXTURE_PIXEL_WIDTH};
    uniform float ${a.TEXTURE_PIXEL_HEIGHT};
    uniform float ${a.TEXTURE_RESOLUTION};
    uniform float ${a.TEXTURE_ORIGIN_X};
    uniform float ${a.TEXTURE_ORIGIN_Y};
    uniform float ${a.DEPTH};

    varying vec2 v_textureCoord;
    varying vec2 v_mapCoord;

    void main() {
      v_textureCoord = ${L.TEXTURE_COORD};
      v_mapCoord = vec2(
        ${a.TEXTURE_ORIGIN_X} + ${a.TEXTURE_RESOLUTION} * ${a.TEXTURE_PIXEL_WIDTH} * v_textureCoord[0],
        ${a.TEXTURE_ORIGIN_Y} - ${a.TEXTURE_RESOLUTION} * ${a.TEXTURE_PIXEL_HEIGHT} * v_textureCoord[1]
      );
      gl_Position = ${a.TILE_TRANSFORM} * vec4(${L.TEXTURE_COORD}, ${a.DEPTH}, 1.0);
    }
  `,n={...H(),bandCount:e},s=[];if(t.color!==void 0){const o=f(n,t.color,G);s.push(`color = ${o};`)}if(t.contrast!==void 0){const o=f(n,t.contrast,R);s.push(`color.rgb = clamp((${o} + 1.0) * color.rgb - (${o} / 2.0), vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));`)}if(t.exposure!==void 0){const o=f(n,t.exposure,R);s.push(`color.rgb = clamp((${o} + 1.0) * color.rgb, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));`)}if(t.saturation!==void 0){const o=f(n,t.saturation,R);s.push(`
      float saturation = ${o} + 1.0;
      float sr = (1.0 - saturation) * 0.2126;
      float sg = (1.0 - saturation) * 0.7152;
      float sb = (1.0 - saturation) * 0.0722;
      mat3 saturationMatrix = mat3(
        sr + saturation, sr, sr,
        sg, sg + saturation, sg,
        sb, sb, sb + saturation
      );
      color.rgb = clamp(saturationMatrix * color.rgb, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));
    `)}if(t.gamma!==void 0){const o=f(n,t.gamma,R);s.push(`color.rgb = pow(color.rgb, vec3(1.0 / ${o}));`)}if(t.brightness!==void 0){const o=f(n,t.brightness,R);s.push(`color.rgb = clamp(color.rgb + ${o}, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));`)}const l={},u=Object.keys(n.variables).length;if(u>1&&!t.variables)throw new Error(`Missing variables in style (expected ${n.variables})`);for(let o=0;o<u;++o){const m=n.variables[Object.keys(n.variables)[o]];if(!(m.name in t.variables))throw new Error(`Missing '${m.name}' in style variables`);const g=P(m.name);l[g]=function(){let h=t.variables[m.name];return typeof h=="string"&&(h=F(h)),h!==void 0?h:-9999999}}const i=Object.keys(l).map(function(o){return`uniform float ${o};`}),v=Math.ceil(e/4);i.push(`uniform sampler2D ${a.TILE_TEXTURE_ARRAY}[${v}];`),n.paletteTextures&&i.push(`uniform sampler2D ${W}[${n.paletteTextures.length}];`);const E=Object.keys(n.functions).map(function(o){return n.functions[o]}),d=`
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif

    varying vec2 v_textureCoord;
    varying vec2 v_mapCoord;
    uniform vec4 ${a.RENDER_EXTENT};
    uniform float ${a.TRANSITION_ALPHA};
    uniform float ${a.TEXTURE_PIXEL_WIDTH};
    uniform float ${a.TEXTURE_PIXEL_HEIGHT};
    uniform float ${a.RESOLUTION};
    uniform float ${a.ZOOM};

    ${i.join(`
`)}

    ${E.join(`
`)}

    void main() {
      if (
        v_mapCoord[0] < ${a.RENDER_EXTENT}[0] ||
        v_mapCoord[1] < ${a.RENDER_EXTENT}[1] ||
        v_mapCoord[0] > ${a.RENDER_EXTENT}[2] ||
        v_mapCoord[1] > ${a.RENDER_EXTENT}[3]
      ) {
        discard;
      }

      vec4 color = texture2D(${a.TILE_TEXTURE_ARRAY}[0],  v_textureCoord);

      ${s.join(`
`)}

      gl_FragColor = color;
      gl_FragColor.rgb *= gl_FragColor.a;
      gl_FragColor *= ${a.TRANSITION_ALPHA};
    }`;return{vertexShader:r,fragmentShader:d,uniforms:l,paletteTextures:n.paletteTextures}}class y extends M{constructor(e){e=e?Object.assign({},e):{};const r=e.style||{};delete e.style,super(e),this.sources_=e.sources,this.renderedSource_=null,this.renderedResolution_=NaN,this.style_=r,this.styleVariables_=this.style_.variables||{},this.handleSourceUpdate_(),this.addChangeListener(w.SOURCE,this.handleSourceUpdate_)}getSources(e,r){const n=this.getSource();return this.sources_?typeof this.sources_=="function"?this.sources_(e,r):this.sources_:n?[n]:[]}getRenderSource(){return this.renderedSource_||this.getSource()}getSourceState(){const e=this.getRenderSource();return e?e.getState():"undefined"}handleSourceUpdate_(){this.hasRenderer()&&this.getRenderer().clearCache();const e=this.getSource();if(e)if(e.getState()==="loading"){const r=()=>{e.getState()==="ready"&&(e.removeEventListener("change",r),this.setStyle(this.style_))};e.addEventListener("change",r)}else this.setStyle(this.style_)}getSourceBandCount_(){const e=Number.MAX_SAFE_INTEGER,r=this.getSources([-e,-e,e,e],e);return r&&r.length&&"bandCount"in r[0]?r[0].bandCount:4}createRenderer(){const e=O(this.style_,this.getSourceBandCount_());return new D(this,{vertexShader:e.vertexShader,fragmentShader:e.fragmentShader,uniforms:e.uniforms,cacheSize:this.getCacheSize(),paletteTextures:e.paletteTextures})}renderSources(e,r){const n=this.getRenderer();let s;for(let l=0,u=r.length;l<u;++l)this.renderedSource_=r[l],n.prepareFrame(e)&&(s=n.renderFrame(e));return s}render(e,r){this.rendered=!0;const n=e.viewState,s=this.getSources(e.extent,n.resolution);let l=!0;for(let i=0,v=s.length;i<v;++i){const E=s[i],d=E.getState();if(d=="loading"){const o=()=>{E.getState()=="ready"&&(E.removeEventListener("change",o),this.changed())};E.addEventListener("change",o)}l=l&&d=="ready"}const u=this.renderSources(e,s);if(this.getRenderer().renderComplete&&l)return this.renderedResolution_=n.resolution,u;if(this.renderedResolution_>.5*n.resolution){const i=this.getSources(e.extent,this.renderedResolution_).filter(v=>!s.includes(v));if(i.length>0)return this.renderSources(e,i)}return u}setStyle(e){if(this.styleVariables_=e.variables||{},this.style_=e,this.hasRenderer()){const r=O(this.style_,this.getSourceBandCount_());this.getRenderer().reset({vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,uniforms:r.uniforms,paletteTextures:r.paletteTextures}),this.changed()}}updateStyleVariables(e){Object.assign(this.styleVariables_,e),this.changed()}}y.prototype.dispose;const A="https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png";function c(t=0,e=0){const r=["band",1,t,e],n=["band",2,t,e],s=["band",3,t,e];return["+",["*",255*256,r],["*",255,n],["*",255/256,s],-32768]}function U(t,e,r){const l=["clamp",["/",["-",c(),e],["-",r,e]],0,1];switch(t){case"terrain":return["interpolate",["linear"],l,0,[68,1,84,255],.1,[59,82,139,255],.25,[33,145,140,255],.4,[94,201,98,255],.55,[189,223,38,255],.7,[253,231,37,255],.85,[254,173,84,255],1,[189,99,38,255]];case"viridis":return["interpolate",["linear"],l,0,[68,1,84,255],.25,[59,82,139,255],.5,[33,145,140,255],.75,[94,201,98,255],1,[253,231,37,255]];case"magma":return["interpolate",["linear"],l,0,[0,0,4,255],.25,[81,18,124,255],.5,[183,55,121,255],.75,[252,136,97,255],1,[252,253,191,255]];case"spectral":return["interpolate",["linear"],l,0,[94,79,162,255],.2,[50,136,189,255],.4,[102,194,165,255],.5,[254,224,139,255],.6,[253,174,97,255],.8,[244,109,67,255],1,[158,1,66,255]];case"grayscale":default:return["interpolate",["linear"],l,0,[0,0,0,255],1,[255,255,255,255]]}}function B(){const t=T.getState(),e={sunAzimuth:t.sunAzimuth,sunElevation:t.sunElevation,verticalExaggeration:t.verticalExaggeration},r=c(-1,-1),n=c(0,-1),s=c(1,-1),l=c(-1,0),u=c(1,0),i=c(-1,1),v=c(0,1),E=c(1,1),d=["*",["var","verticalExaggeration"],["/",["-",["+",s,["*",2,u],E],["+",r,["*",2,l],i]],8]],o=["*",["var","verticalExaggeration"],["/",["-",["+",i,["*",2,v],E],["+",r,["*",2,n],s]],8]],m=["atan",["^",["+",["^",d,2],["^",o,2]],.5]],g=["atan",d,o],h=["*",["var","sunAzimuth"],Math.PI/180],C=["*",["var","sunElevation"],Math.PI/180],b=["-",Math.PI/2,C],S=["*",255,["clamp",["+",["*",["cos",b],["cos",m]],["*",["*",["sin",b],["sin",m]],["cos",["-",h,g]]]],0,1]],p=new y({properties:{title:"Hillshade (WebGL)",type:"webgl",isDynamic:!0},visible:!1,opacity:.7,source:new N({url:A,crossOrigin:"anonymous",maxZoom:15,attributions:"© Mapzen, AWS Terrain Tiles"}),style:{variables:e,color:["color",S,S,S,255]}});return T.subscribe(x=>{p.updateStyleVariables({sunAzimuth:x.sunAzimuth,sunElevation:x.sunElevation,verticalExaggeration:x.verticalExaggeration})}),p}function Z(){const t=T.getState(),e={minElevation:t.minElevation,maxElevation:t.maxElevation};let r=U(t.colorRamp,t.minElevation,t.maxElevation);const n=new y({properties:{title:"Hoogtekaart Kleur (WebGL)",type:"webgl",isDynamic:!0},visible:!1,opacity:.8,source:new N({url:A,crossOrigin:"anonymous",maxZoom:15,attributions:"© Mapzen, AWS Terrain Tiles"}),style:{variables:e,color:r}});let s=t.colorRamp,l=t.minElevation,u=t.maxElevation;return T.subscribe(i=>{if(i.colorRamp!==s||i.minElevation!==l||i.maxElevation!==u){s=i.colorRamp,l=i.minElevation,u=i.maxElevation;const v=U(i.colorRamp,i.minElevation,i.maxElevation);n.setStyle({variables:{minElevation:i.minElevation,maxElevation:i.maxElevation},color:v})}}),n}function q(){const t=T.getState(),e={sunAzimuth:t.sunAzimuth,sunElevation:t.sunElevation,verticalExaggeration:t.verticalExaggeration,minElevation:t.minElevation,maxElevation:t.maxElevation},r=c(0,0),n=c(-1,-1),s=c(0,-1),l=c(1,-1),u=c(-1,0),i=c(1,0),v=c(-1,1),E=c(0,1),d=c(1,1),o=["*",["var","verticalExaggeration"],["/",["-",["+",l,["*",2,i],d],["+",n,["*",2,u],v]],8]],m=["*",["var","verticalExaggeration"],["/",["-",["+",v,["*",2,E],d],["+",n,["*",2,s],l]],8]],g=["atan",["^",["+",["^",o,2],["^",m,2]],.5]],h=["atan",o,m],C=["*",["var","sunAzimuth"],Math.PI/180],b=["*",["var","sunElevation"],Math.PI/180],I=["-",Math.PI/2,b],p=["+",.5,["*",.5,["clamp",["+",["*",["cos",I],["cos",g]],["*",["*",["sin",I],["sin",g]],["cos",["-",C,h]]]],0,1]]],$=["clamp",["/",["-",r,["var","minElevation"]],["-",["var","maxElevation"],["var","minElevation"]]],0,1],z=["color",["*",["interpolate",["linear"],$,0,68,.1,59,.25,33,.4,94,.55,189,.7,253,.85,254,1,189],p],["*",["interpolate",["linear"],$,0,1,.1,82,.25,145,.4,201,.55,223,.7,231,.85,173,1,99],p],["*",["interpolate",["linear"],$,0,84,.1,139,.25,140,.4,98,.55,38,.7,37,.85,84,1,38],p],255],X=new y({properties:{title:"Reliëfkaart (WebGL)",type:"webgl",isDynamic:!0},visible:!1,opacity:.8,source:new N({url:A,crossOrigin:"anonymous",maxZoom:15,attributions:"© Mapzen, AWS Terrain Tiles"}),style:{variables:e,color:z}});return T.subscribe(_=>{X.updateStyleVariables({sunAzimuth:_.sunAzimuth,sunElevation:_.sunElevation,verticalExaggeration:_.verticalExaggeration,minElevation:_.minElevation,maxElevation:_.maxElevation})}),X}export{Z as createWebGLColorHeightLayerOL,q as createWebGLCombinedHillshadeLayerOL,B as createWebGLHillshadeLayerOL};
//# sourceMappingURL=ahnWebGLHillshade-CcslpCTN.js.map

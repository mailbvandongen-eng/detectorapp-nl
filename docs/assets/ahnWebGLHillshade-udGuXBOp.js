import{B as S,L as b,W as $,e as d,n as x,u as C,U as r,P as I,A as T,C as L,N as g,g as N,X as y}from"./index-DxNOLHnx.js";function m(s,e){const o=`
    attribute vec2 ${T.TEXTURE_COORD};
    uniform mat4 ${r.TILE_TRANSFORM};
    uniform float ${r.TEXTURE_PIXEL_WIDTH};
    uniform float ${r.TEXTURE_PIXEL_HEIGHT};
    uniform float ${r.TEXTURE_RESOLUTION};
    uniform float ${r.TEXTURE_ORIGIN_X};
    uniform float ${r.TEXTURE_ORIGIN_Y};
    uniform float ${r.DEPTH};

    varying vec2 v_textureCoord;
    varying vec2 v_mapCoord;

    void main() {
      v_textureCoord = ${T.TEXTURE_COORD};
      v_mapCoord = vec2(
        ${r.TEXTURE_ORIGIN_X} + ${r.TEXTURE_RESOLUTION} * ${r.TEXTURE_PIXEL_WIDTH} * v_textureCoord[0],
        ${r.TEXTURE_ORIGIN_Y} - ${r.TEXTURE_RESOLUTION} * ${r.TEXTURE_PIXEL_HEIGHT} * v_textureCoord[1]
      );
      gl_Position = ${r.TILE_TRANSFORM} * vec4(${T.TEXTURE_COORD}, ${r.DEPTH}, 1.0);
    }
  `,t={...x(),bandCount:e},a=[];if(s.color!==void 0){const n=d(t,s.color,L);a.push(`color = ${n};`)}if(s.contrast!==void 0){const n=d(t,s.contrast,g);a.push(`color.rgb = clamp((${n} + 1.0) * color.rgb - (${n} / 2.0), vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));`)}if(s.exposure!==void 0){const n=d(t,s.exposure,g);a.push(`color.rgb = clamp((${n} + 1.0) * color.rgb, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));`)}if(s.saturation!==void 0){const n=d(t,s.saturation,g);a.push(`
      float saturation = ${n} + 1.0;
      float sr = (1.0 - saturation) * 0.2126;
      float sg = (1.0 - saturation) * 0.7152;
      float sb = (1.0 - saturation) * 0.0722;
      mat3 saturationMatrix = mat3(
        sr + saturation, sr, sr,
        sg, sg + saturation, sg,
        sb, sb, sb + saturation
      );
      color.rgb = clamp(saturationMatrix * color.rgb, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));
    `)}if(s.gamma!==void 0){const n=d(t,s.gamma,g);a.push(`color.rgb = pow(color.rgb, vec3(1.0 / ${n}));`)}if(s.brightness!==void 0){const n=d(t,s.brightness,g);a.push(`color.rgb = clamp(color.rgb + ${n}, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));`)}const i={},u=Object.keys(t.variables).length;if(u>1&&!s.variables)throw new Error(`Missing variables in style (expected ${t.variables})`);for(let n=0;n<u;++n){const _=t.variables[Object.keys(t.variables)[n]];if(!(_.name in s.variables))throw new Error(`Missing '${_.name}' in style variables`);const v=C(_.name);i[v]=function(){let E=s.variables[_.name];return typeof E=="string"&&(E=N(E)),E!==void 0?E:-9999999}}const c=Object.keys(i).map(function(n){return`uniform float ${n};`}),h=Math.ceil(e/4);c.push(`uniform sampler2D ${r.TILE_TEXTURE_ARRAY}[${h}];`),t.paletteTextures&&c.push(`uniform sampler2D ${I}[${t.paletteTextures.length}];`);const l=Object.keys(t.functions).map(function(n){return t.functions[n]}),f=`
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif

    varying vec2 v_textureCoord;
    varying vec2 v_mapCoord;
    uniform vec4 ${r.RENDER_EXTENT};
    uniform float ${r.TRANSITION_ALPHA};
    uniform float ${r.TEXTURE_PIXEL_WIDTH};
    uniform float ${r.TEXTURE_PIXEL_HEIGHT};
    uniform float ${r.RESOLUTION};
    uniform float ${r.ZOOM};

    ${c.join(`
`)}

    ${l.join(`
`)}

    void main() {
      if (
        v_mapCoord[0] < ${r.RENDER_EXTENT}[0] ||
        v_mapCoord[1] < ${r.RENDER_EXTENT}[1] ||
        v_mapCoord[0] > ${r.RENDER_EXTENT}[2] ||
        v_mapCoord[1] > ${r.RENDER_EXTENT}[3]
      ) {
        discard;
      }

      vec4 color = texture2D(${r.TILE_TEXTURE_ARRAY}[0],  v_textureCoord);

      ${a.join(`
`)}

      gl_FragColor = color;
      gl_FragColor.rgb *= gl_FragColor.a;
      gl_FragColor *= ${r.TRANSITION_ALPHA};
    }`;return{vertexShader:o,fragmentShader:f,uniforms:i,paletteTextures:t.paletteTextures}}class p extends S{constructor(e){e=e?Object.assign({},e):{};const o=e.style||{};delete e.style,super(e),this.sources_=e.sources,this.renderedSource_=null,this.renderedResolution_=NaN,this.style_=o,this.styleVariables_=this.style_.variables||{},this.handleSourceUpdate_(),this.addChangeListener(b.SOURCE,this.handleSourceUpdate_)}getSources(e,o){const t=this.getSource();return this.sources_?typeof this.sources_=="function"?this.sources_(e,o):this.sources_:t?[t]:[]}getRenderSource(){return this.renderedSource_||this.getSource()}getSourceState(){const e=this.getRenderSource();return e?e.getState():"undefined"}handleSourceUpdate_(){this.hasRenderer()&&this.getRenderer().clearCache();const e=this.getSource();if(e)if(e.getState()==="loading"){const o=()=>{e.getState()==="ready"&&(e.removeEventListener("change",o),this.setStyle(this.style_))};e.addEventListener("change",o)}else this.setStyle(this.style_)}getSourceBandCount_(){const e=Number.MAX_SAFE_INTEGER,o=this.getSources([-e,-e,e,e],e);return o&&o.length&&"bandCount"in o[0]?o[0].bandCount:4}createRenderer(){const e=m(this.style_,this.getSourceBandCount_());return new $(this,{vertexShader:e.vertexShader,fragmentShader:e.fragmentShader,uniforms:e.uniforms,cacheSize:this.getCacheSize(),paletteTextures:e.paletteTextures})}renderSources(e,o){const t=this.getRenderer();let a;for(let i=0,u=o.length;i<u;++i)this.renderedSource_=o[i],t.prepareFrame(e)&&(a=t.renderFrame(e));return a}render(e,o){this.rendered=!0;const t=e.viewState,a=this.getSources(e.extent,t.resolution);let i=!0;for(let c=0,h=a.length;c<h;++c){const l=a[c],f=l.getState();if(f=="loading"){const n=()=>{l.getState()=="ready"&&(l.removeEventListener("change",n),this.changed())};l.addEventListener("change",n)}i=i&&f=="ready"}const u=this.renderSources(e,a);if(this.getRenderer().renderComplete&&i)return this.renderedResolution_=t.resolution,u;if(this.renderedResolution_>.5*t.resolution){const c=this.getSources(e.extent,this.renderedResolution_).filter(h=>!a.includes(h));if(c.length>0)return this.renderSources(e,c)}return u}setStyle(e){if(this.styleVariables_=e.variables||{},this.style_=e,this.hasRenderer()){const o=m(this.style_,this.getSourceBandCount_());this.getRenderer().reset({vertexShader:o.vertexShader,fragmentShader:o.fragmentShader,uniforms:o.uniforms,paletteTextures:o.paletteTextures}),this.changed()}}updateStyleVariables(e){Object.assign(this.styleVariables_,e),this.changed()}}p.prototype.dispose;const X="https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",O=[37e4,658e4,81e4,713e4],R=-10,U=300;function D(){const s=["band",1],e=["band",2],o=["band",3],t=["+",["*",255*256,s],["*",255,e],["/",["*",255,o],256],-32768],u=["*",255,["clamp",["/",["-",t,R],["-",U,R]],0,1]],c=["case",[">",t,-1],255,0];return new p({properties:{title:"Hoogtekaart (WebGL)",type:"webgl"},extent:O,visible:!1,opacity:.8,source:new y({url:X,crossOrigin:"anonymous",maxZoom:15,attributions:"© Mapzen, AWS Terrain Tiles"}),style:{color:["color",u,u,u,c]}})}export{D as createWebGLHillshadeLayerOL};
//# sourceMappingURL=ahnWebGLHillshade-udGuXBOp.js.map

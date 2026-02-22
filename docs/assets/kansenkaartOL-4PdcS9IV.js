import{vS as Ye,vT as ee,vU as v,vV as Je,vW as $,vX as Ie,vY as Qe,vZ as et,v_ as Ae,v$ as I,w0 as re,w1 as j,w2 as tt,w3 as rt,w4 as _,w5 as G,w6 as M,w7 as T,w8 as D,w9 as B,wa as nt,wb as g,wc as Ce,wd as it,we as st,wf as ot,wg as at,wh as Oe,wi as fe,wj as lt,wk as de,wl as ct,wm as ut,wn as ht,wo as W,wp as H,wq as ft,wr as dt,ws as Fe,wt as gt,wu as Ue,wv as pt,ww as _t,wx as xt,wy as mt,wz as Et,g as vt,n as Tt,o as yt,G as Pt,F as Rt,P as St}from"./index-FlchOTnY.js";function ke(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}function ge(n,e){return n[0]=e[0],n[1]=e[1],n[4]=e[2],n[5]=e[3],n[12]=e[4],n[13]=e[5],n}const K=34962,xe=34963,bt=35044,ne=35048,At=5121,Ct=5123,Ft=5125,Ge=5126,$e=["experimental-webgl","webgl","webkit-3d","moz-webgl"];function $t(n,e){e=Object.assign({preserveDrawingBuffer:!0,antialias:!Ye},e);const t=$e.length;for(let r=0;r<t;++r)try{const s=n.getContext($e[r],e);if(s)return s}catch{}return null}const Lt={STATIC_DRAW:bt};class ie{constructor(e,t){this.array_=null,this.type_=e,ee(e===K||e===xe,"A `WebGLArrayBuffer` must either be of type `ELEMENT_ARRAY_BUFFER` or `ARRAY_BUFFER`"),this.usage_=t!==void 0?t:Lt.STATIC_DRAW}ofSize(e){return this.array_=new(X(this.type_))(e),this}fromArray(e){return this.array_=X(this.type_).from(e),this}fromArrayBuffer(e){return this.array_=new(X(this.type_))(e),this}getType(){return this.type_}getArray(){return this.array_}setArray(e){const t=X(this.type_);if(!(e instanceof t))throw new Error(`Expected ${t}`);this.array_=e}getUsage(){return this.usage_}getSize(){return this.array_?this.array_.length:0}}function X(n){switch(n){case K:return Float32Array;case xe:return Uint32Array;default:return Float32Array}}const V={LOST:"webglcontextlost",RESTORED:"webglcontextrestored"},wt=`
  precision mediump float;

  attribute vec2 a_position;
  varying vec2 v_texCoord;
  varying vec2 v_screenCoord;

  uniform vec2 u_screenSize;

  void main() {
    v_texCoord = a_position * 0.5 + 0.5;
    v_screenCoord = v_texCoord * u_screenSize;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`,Dt=`
  precision mediump float;

  uniform sampler2D u_image;
  uniform float u_opacity;

  varying vec2 v_texCoord;

  void main() {
    gl_FragColor = texture2D(u_image, v_texCoord) * u_opacity;
  }
`;class Le{constructor(e){this.gl_=e.webGlContext;const t=this.gl_;this.scaleRatio_=e.scaleRatio||1,this.renderTargetTexture_=t.createTexture(),this.renderTargetTextureSize_=null,this.frameBuffer_=t.createFramebuffer(),this.depthBuffer_=t.createRenderbuffer();const r=t.createShader(t.VERTEX_SHADER);t.shaderSource(r,e.vertexShader||wt),t.compileShader(r);const s=t.createShader(t.FRAGMENT_SHADER);t.shaderSource(s,e.fragmentShader||Dt),t.compileShader(s),this.renderTargetProgram_=t.createProgram(),t.attachShader(this.renderTargetProgram_,r),t.attachShader(this.renderTargetProgram_,s),t.linkProgram(this.renderTargetProgram_),this.renderTargetVerticesBuffer_=t.createBuffer();const i=[-1,-1,1,-1,-1,1,1,-1,1,1,-1,1];t.bindBuffer(t.ARRAY_BUFFER,this.renderTargetVerticesBuffer_),t.bufferData(t.ARRAY_BUFFER,new Float32Array(i),t.STATIC_DRAW),this.renderTargetAttribLocation_=t.getAttribLocation(this.renderTargetProgram_,"a_position"),this.renderTargetUniformLocation_=t.getUniformLocation(this.renderTargetProgram_,"u_screenSize"),this.renderTargetOpacityLocation_=t.getUniformLocation(this.renderTargetProgram_,"u_opacity"),this.renderTargetTextureLocation_=t.getUniformLocation(this.renderTargetProgram_,"u_image"),this.uniforms_=[],e.uniforms&&Object.keys(e.uniforms).forEach(o=>{this.uniforms_.push({value:e.uniforms[o],location:t.getUniformLocation(this.renderTargetProgram_,o)})})}getRenderTargetTexture(){return this.renderTargetTexture_}getGL(){return this.gl_}init(e){const t=this.getGL(),r=[t.drawingBufferWidth*this.scaleRatio_,t.drawingBufferHeight*this.scaleRatio_];if(t.bindFramebuffer(t.FRAMEBUFFER,this.getFrameBuffer()),t.bindRenderbuffer(t.RENDERBUFFER,this.getDepthBuffer()),t.viewport(0,0,r[0],r[1]),!this.renderTargetTextureSize_||this.renderTargetTextureSize_[0]!==r[0]||this.renderTargetTextureSize_[1]!==r[1]){this.renderTargetTextureSize_=r;const s=0,i=t.RGBA,o=0,a=t.RGBA,c=t.UNSIGNED_BYTE,l=null;t.bindTexture(t.TEXTURE_2D,this.renderTargetTexture_),t.texImage2D(t.TEXTURE_2D,s,i,r[0],r[1],o,a,c,l),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,this.renderTargetTexture_,0),t.renderbufferStorage(t.RENDERBUFFER,t.DEPTH_COMPONENT16,r[0],r[1]),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.RENDERBUFFER,this.depthBuffer_)}}apply(e,t,r,s){const i=this.getGL(),o=e.size;if(i.bindFramebuffer(i.FRAMEBUFFER,t?t.getFrameBuffer():null),i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,this.renderTargetTexture_),!t){const c=v(i.canvas);if(!e.renderTargets[c]){const l=i.getContextAttributes();l&&l.preserveDrawingBuffer&&(i.clearColor(0,0,0,0),i.clearDepth(1),i.clear(i.COLOR_BUFFER_BIT|i.DEPTH_BUFFER_BIT)),e.renderTargets[c]=!0}}i.disable(i.DEPTH_TEST),i.enable(i.BLEND),i.blendFunc(i.ONE,i.ONE_MINUS_SRC_ALPHA),i.viewport(0,0,i.drawingBufferWidth,i.drawingBufferHeight),i.bindBuffer(i.ARRAY_BUFFER,this.renderTargetVerticesBuffer_),i.useProgram(this.renderTargetProgram_),i.enableVertexAttribArray(this.renderTargetAttribLocation_),i.vertexAttribPointer(this.renderTargetAttribLocation_,2,i.FLOAT,!1,0,0),i.uniform2f(this.renderTargetUniformLocation_,o[0],o[1]),i.uniform1i(this.renderTargetTextureLocation_,0);const a=e.layerStatesArray[e.layerIndex].opacity;i.uniform1f(this.renderTargetOpacityLocation_,a),this.applyUniforms(e),r&&r(i,e),i.drawArrays(i.TRIANGLES,0,6),s&&s(i,e)}getFrameBuffer(){return this.frameBuffer_}getDepthBuffer(){return this.depthBuffer_}applyUniforms(e){const t=this.getGL();let r,s=1;this.uniforms_.forEach(function(i){if(r=typeof i.value=="function"?i.value(e):i.value,r instanceof HTMLCanvasElement||r instanceof ImageData)i.texture||(i.texture=t.createTexture()),t.activeTexture(t[`TEXTURE${s}`]),t.bindTexture(t.TEXTURE_2D,i.texture),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE),r instanceof ImageData?t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,r.width,r.height,0,t.UNSIGNED_BYTE,new Uint8Array(r.data)):t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,r),t.uniform1i(i.location,s++);else if(Array.isArray(r))switch(r.length){case 2:t.uniform2f(i.location,r[0],r[1]);return;case 3:t.uniform3f(i.location,r[0],r[1],r[2]);return;case 4:t.uniform4f(i.location,r[0],r[1],r[2],r[3]);return;default:return}else typeof r=="number"&&t.uniform1f(i.location,r)})}}const b={PROJECTION_MATRIX:"u_projectionMatrix",SCREEN_TO_WORLD_MATRIX:"u_screenToWorldMatrix",TIME:"u_time",ZOOM:"u_zoom",RESOLUTION:"u_resolution",ROTATION:"u_rotation",VIEWPORT_SIZE_PX:"u_viewportSizePx",PIXEL_RATIO:"u_pixelRatio",HIT_DETECTION:"u_hitDetection"},E={UNSIGNED_BYTE:At,UNSIGNED_SHORT:Ct,UNSIGNED_INT:Ft,FLOAT:Ge},Y={};function we(n){return"shared/"+n}let De=0;function Bt(){const n="unique/"+De;return De+=1,n}function Nt(n){let e=Y[n];if(!e){const t=document.createElement("canvas");t.width=1,t.height=1,t.style.position="absolute",t.style.left="0",e={users:0,context:$t(t)},Y[n]=e}return e.users+=1,e.context}function It(n){const e=Y[n];if(!e||(e.users-=1,e.users>0))return;const t=e.context,r=t.getExtension("WEBGL_lose_context");r&&r.loseContext();const s=t.canvas;s.width=1,s.height=1,delete Y[n]}class Ot extends Je{constructor(e){super(),e=e||{},this.boundHandleWebGLContextLost_=this.handleWebGLContextLost.bind(this),this.boundHandleWebGLContextRestored_=this.handleWebGLContextRestored.bind(this),this.canvasCacheKey_=e.canvasCacheKey?we(e.canvasCacheKey):Bt(),this.gl_=Nt(this.canvasCacheKey_),this.bufferCache_={},this.extensionCache_={},this.currentProgram_=null,this.needsToBeRecreated_=!1;const t=this.gl_.canvas;t.addEventListener(V.LOST,this.boundHandleWebGLContextLost_),t.addEventListener(V.RESTORED,this.boundHandleWebGLContextRestored_),this.offsetRotateMatrix_=$(),this.offsetScaleMatrix_=$(),this.tmpMat4_=ke(),this.uniformLocationsByProgram_={},this.attribLocationsByProgram_={},this.uniforms_=[],e.uniforms&&this.setUniforms(e.uniforms),this.postProcessPasses_=e.postProcesses?e.postProcesses.map(r=>new Le({webGlContext:this.gl_,scaleRatio:r.scaleRatio,vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,uniforms:r.uniforms})):[new Le({webGlContext:this.gl_})],this.shaderCompileErrors_=null,this.startTime_=Date.now(),this.maxAttributeCount_=this.gl_.getParameter(this.gl_.MAX_VERTEX_ATTRIBS)}setUniforms(e){this.uniforms_=[],this.addUniforms(e)}addUniforms(e){for(const t in e)this.uniforms_.push({name:t,value:e[t]})}canvasCacheKeyMatches(e){return this.canvasCacheKey_===we(e)}getExtension(e){if(e in this.extensionCache_)return this.extensionCache_[e];const t=this.gl_.getExtension(e);return this.extensionCache_[e]=t,t}getInstancedRenderingExtension_(){const e=this.getExtension("ANGLE_instanced_arrays");return ee(!!e,"WebGL extension 'ANGLE_instanced_arrays' is required for vector rendering"),e}bindBuffer(e){const t=this.gl_,r=v(e);let s=this.bufferCache_[r];if(!s){const i=t.createBuffer();s={buffer:e,webGlBuffer:i},this.bufferCache_[r]=s}t.bindBuffer(e.getType(),s.webGlBuffer)}flushBufferData(e){const t=this.gl_;this.bindBuffer(e),t.bufferData(e.getType(),e.getArray(),e.getUsage())}deleteBuffer(e){const t=v(e);delete this.bufferCache_[t]}disposeInternal(){const e=this.gl_.canvas;e.removeEventListener(V.LOST,this.boundHandleWebGLContextLost_),e.removeEventListener(V.RESTORED,this.boundHandleWebGLContextRestored_),It(this.canvasCacheKey_),delete this.gl_}prepareDraw(e,t,r){const s=this.gl_,i=this.getCanvas(),o=e.size,a=e.pixelRatio;(i.width!==o[0]*a||i.height!==o[1]*a)&&(i.width=o[0]*a,i.height=o[1]*a,i.style.width=o[0]+"px",i.style.height=o[1]+"px");for(let c=this.postProcessPasses_.length-1;c>=0;c--)this.postProcessPasses_[c].init(e);s.bindTexture(s.TEXTURE_2D,null),s.clearColor(0,0,0,0),s.depthRange(0,1),s.clearDepth(1),s.clear(s.COLOR_BUFFER_BIT|s.DEPTH_BUFFER_BIT),s.enable(s.BLEND),s.blendFunc(s.ONE,t?s.ZERO:s.ONE_MINUS_SRC_ALPHA),r?(s.enable(s.DEPTH_TEST),s.depthFunc(s.LEQUAL)):s.disable(s.DEPTH_TEST)}bindFrameBuffer(e,t){const r=this.getGL();r.bindFramebuffer(r.FRAMEBUFFER,e),t&&r.framebufferTexture2D(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,t,0)}bindInitialFrameBuffer(){const e=this.getGL(),t=this.postProcessPasses_[0].getFrameBuffer();e.bindFramebuffer(e.FRAMEBUFFER,t);const r=this.postProcessPasses_[0].getRenderTargetTexture();e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,r,0)}bindTexture(e,t,r){const s=this.gl_;s.activeTexture(s.TEXTURE0+t),s.bindTexture(s.TEXTURE_2D,e),s.uniform1i(this.getUniformLocation(r),t)}bindAttribute(e,t,r){const s=this.getGL();this.bindBuffer(e);const i=this.getAttributeLocation(t);s.enableVertexAttribArray(i),s.vertexAttribPointer(i,r,s.FLOAT,!1,0,0)}prepareDrawToRenderTarget(e,t,r,s){const i=this.gl_,o=t.getSize();i.bindFramebuffer(i.FRAMEBUFFER,t.getFramebuffer()),i.bindRenderbuffer(i.RENDERBUFFER,t.getDepthbuffer()),i.viewport(0,0,o[0],o[1]),i.bindTexture(i.TEXTURE_2D,t.getTexture()),i.clearColor(0,0,0,0),i.depthRange(0,1),i.clearDepth(1),i.clear(i.COLOR_BUFFER_BIT|i.DEPTH_BUFFER_BIT),i.enable(i.BLEND),i.blendFunc(i.ONE,r?i.ZERO:i.ONE_MINUS_SRC_ALPHA),s?(i.enable(i.DEPTH_TEST),i.depthFunc(i.LEQUAL)):i.disable(i.DEPTH_TEST)}drawElements(e,t){const r=this.gl_;this.getExtension("OES_element_index_uint");const s=r.UNSIGNED_INT,i=4,o=t-e,a=e*i;r.drawElements(r.TRIANGLES,o,s,a)}drawElementsInstanced(e,t,r){const s=this.gl_;this.getExtension("OES_element_index_uint");const i=this.getInstancedRenderingExtension_(),o=s.UNSIGNED_INT,a=4,c=t-e,l=e*a;i.drawElementsInstancedANGLE(s.TRIANGLES,c,o,l,r);for(let u=0;u<this.maxAttributeCount_;u++)i.vertexAttribDivisorANGLE(u,0)}finalizeDraw(e,t,r){for(let s=0,i=this.postProcessPasses_.length;s<i;s++)s===i-1?this.postProcessPasses_[s].apply(e,null,t,r):this.postProcessPasses_[s].apply(e,this.postProcessPasses_[s+1])}getCanvas(){return this.gl_.canvas}getGL(){return this.gl_}applyFrameState(e){const t=e.size,r=e.viewState.rotation,s=e.pixelRatio;this.setUniformFloatValue(b.TIME,(Date.now()-this.startTime_)*.001),this.setUniformFloatValue(b.ZOOM,e.viewState.zoom),this.setUniformFloatValue(b.RESOLUTION,e.viewState.resolution),this.setUniformFloatValue(b.PIXEL_RATIO,s),this.setUniformFloatVec2(b.VIEWPORT_SIZE_PX,[t[0],t[1]]),this.setUniformFloatValue(b.ROTATION,r)}applyHitDetectionUniform(e){const t=this.getUniformLocation(b.HIT_DETECTION);this.getGL().uniform1i(t,e?1:0),e&&this.setUniformFloatValue(b.PIXEL_RATIO,.5)}applyUniforms(e){const t=this.gl_;let r,s=0;this.uniforms_.forEach(i=>{if(r=typeof i.value=="function"?i.value(e):i.value,r instanceof HTMLCanvasElement||r instanceof HTMLImageElement||r instanceof ImageData||r instanceof WebGLTexture){r instanceof WebGLTexture&&!i.texture?(i.prevValue=void 0,i.texture=r):i.texture||(i.prevValue=void 0,i.texture=t.createTexture()),this.bindTexture(i.texture,s,i.name),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE);const o=!(r instanceof HTMLImageElement)||r.complete;!(r instanceof WebGLTexture)&&o&&i.prevValue!==r&&(i.prevValue=r,t.texImage2D(t.TEXTURE_2D,0,t.RGBA,t.RGBA,t.UNSIGNED_BYTE,r)),s++}else if(Array.isArray(r)&&r.length===6)this.setUniformMatrixValue(i.name,ge(this.tmpMat4_,r));else if(Array.isArray(r)&&r.length<=4)switch(r.length){case 2:t.uniform2f(this.getUniformLocation(i.name),r[0],r[1]);return;case 3:t.uniform3f(this.getUniformLocation(i.name),r[0],r[1],r[2]);return;case 4:t.uniform4f(this.getUniformLocation(i.name),r[0],r[1],r[2],r[3]);return;default:return}else typeof r=="number"&&t.uniform1f(this.getUniformLocation(i.name),r)})}useProgram(e,t){this.disableAllAttributes_(),this.gl_.useProgram(e),this.currentProgram_=e,t&&(this.applyFrameState(t),this.applyUniforms(t))}compileShader(e,t){const r=this.gl_,s=r.createShader(t);return r.shaderSource(s,e),r.compileShader(s),s}getProgram(e,t){const r=this.gl_,s=this.compileShader(e,r.FRAGMENT_SHADER),i=this.compileShader(t,r.VERTEX_SHADER),o=r.createProgram();if(r.attachShader(o,s),r.attachShader(o,i),r.linkProgram(o),!r.getShaderParameter(s,r.COMPILE_STATUS)){const a=`Fragment shader compilation failed: ${r.getShaderInfoLog(s)}`;throw new Error(a)}if(r.deleteShader(s),!r.getShaderParameter(i,r.COMPILE_STATUS)){const a=`Vertex shader compilation failed: ${r.getShaderInfoLog(i)}`;throw new Error(a)}if(r.deleteShader(i),!r.getProgramParameter(o,r.LINK_STATUS)){const a=`GL program linking failed: ${r.getProgramInfoLog(o)}`;throw new Error(a)}return o}getUniformLocation(e){const t=v(this.currentProgram_);return this.uniformLocationsByProgram_[t]===void 0&&(this.uniformLocationsByProgram_[t]={}),this.uniformLocationsByProgram_[t][e]===void 0&&(this.uniformLocationsByProgram_[t][e]=this.gl_.getUniformLocation(this.currentProgram_,e)),this.uniformLocationsByProgram_[t][e]}getAttributeLocation(e){const t=v(this.currentProgram_);return this.attribLocationsByProgram_[t]===void 0&&(this.attribLocationsByProgram_[t]={}),this.attribLocationsByProgram_[t][e]===void 0&&(this.attribLocationsByProgram_[t][e]=this.gl_.getAttribLocation(this.currentProgram_,e)),this.attribLocationsByProgram_[t][e]}makeProjectionTransform(e,t){const r=e.size,s=e.viewState.rotation,i=e.viewState.resolution,o=e.viewState.center;return Ie(t,0,0,2/(i*r[0]),2/(i*r[1]),-s,-o[0],-o[1]),t}setUniformFloatValue(e,t){this.gl_.uniform1f(this.getUniformLocation(e),t)}setUniformFloatVec2(e,t){this.gl_.uniform2fv(this.getUniformLocation(e),t)}setUniformFloatVec4(e,t){this.gl_.uniform4fv(this.getUniformLocation(e),t)}setUniformMatrixValue(e,t){this.gl_.uniformMatrix4fv(this.getUniformLocation(e),!1,t)}disableAllAttributes_(){for(let e=0;e<this.maxAttributeCount_;e++)this.gl_.disableVertexAttribArray(e)}enableAttributeArray_(e,t,r,s,i,o){const a=this.getAttributeLocation(e);a<0||(this.gl_.enableVertexAttribArray(a),this.gl_.vertexAttribPointer(a,t,r,!1,s,i),o&&this.getInstancedRenderingExtension_().vertexAttribDivisorANGLE(a,1))}enableAttributes_(e,t){const r=Ut(e);let s=0;for(let i=0;i<e.length;i++){const o=e[i];o.name&&this.enableAttributeArray_(o.name,o.size,o.type||Ge,r,s,t),s+=o.size*Me(o.type)}}enableAttributes(e){this.enableAttributes_(e,!1)}enableAttributesInstanced(e){this.enableAttributes_(e,!0)}handleWebGLContextLost(e){Qe(this.bufferCache_),this.currentProgram_=null,e.preventDefault()}handleWebGLContextRestored(){this.needsToBeRecreated_=!0}needsToBeRecreated(){return this.needsToBeRecreated_}createTexture(e,t,r,s){const i=this.gl_;r=r||i.createTexture();const o=s?i.NEAREST:i.LINEAR;i.bindTexture(i.TEXTURE_2D,r),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,o),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MAG_FILTER,o),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE);const a=0,c=i.RGBA,l=0,u=i.RGBA,h=i.UNSIGNED_BYTE;return t instanceof Uint8Array?i.texImage2D(i.TEXTURE_2D,a,c,e[0],e[1],l,u,h,t):t?i.texImage2D(i.TEXTURE_2D,a,c,u,h,t):i.texImage2D(i.TEXTURE_2D,a,c,e[0],e[1],l,u,h,null),r}}function Ut(n){let e=0;for(let t=0;t<n.length;t++){const r=n[t];e+=r.size*Me(r.type)}return e}function Me(n){switch(n){case E.UNSIGNED_BYTE:return Uint8Array.BYTES_PER_ELEMENT;case E.UNSIGNED_SHORT:return Uint16Array.BYTES_PER_ELEMENT;case E.UNSIGNED_INT:return Uint32Array.BYTES_PER_ELEMENT;case E.FLOAT:default:return Float32Array.BYTES_PER_ELEMENT}}class me extends et{constructor(e,t){super(e),t=t||{},this.inversePixelTransform_=$(),this.postProcesses_=t.postProcesses,this.uniforms_=t.uniforms,this.helper,this.onMapChanged_=()=>{this.clearCache(),this.removeHelper()},e.addChangeListener(Ae.MAP,this.onMapChanged_),this.dispatchPreComposeEvent=this.dispatchPreComposeEvent.bind(this),this.dispatchPostComposeEvent=this.dispatchPostComposeEvent.bind(this)}dispatchPreComposeEvent(e,t){const r=this.getLayer();if(r.hasListener(I.PRECOMPOSE)){const s=new re(I.PRECOMPOSE,void 0,t,e);r.dispatchEvent(s)}}dispatchPostComposeEvent(e,t){const r=this.getLayer();if(r.hasListener(I.POSTCOMPOSE)){const s=new re(I.POSTCOMPOSE,void 0,t,e);r.dispatchEvent(s)}}reset(e){this.uniforms_=e.uniforms,this.helper&&this.helper.setUniforms(this.uniforms_)}removeHelper(){this.helper&&(this.helper.dispose(),delete this.helper)}prepareFrame(e){if(this.getLayer().getRenderSource()){let t=!0,r=-1,s;for(let o=0,a=e.layerStatesArray.length;o<a;o++){const c=e.layerStatesArray[o].layer,l=c.getRenderer();if(!(l instanceof me)){t=!0;continue}const u=c.getClassName();if((t||u!==s)&&(r+=1,t=!1),s=u,l===this)break}const i="map/"+e.mapId+"/group/"+r;(!this.helper||!this.helper.canvasCacheKeyMatches(i)||this.helper.needsToBeRecreated())&&(this.removeHelper(),this.helper=new Ot({postProcesses:this.postProcesses_,uniforms:this.uniforms_,canvasCacheKey:i}),s&&(this.helper.getCanvas().className=s),this.afterHelperCreated())}return this.prepareFrameInternal(e)}afterHelperCreated(){}prepareFrameInternal(e){return!0}clearCache(){}disposeInternal(){this.clearCache(),this.removeHelper(),this.getLayer()?.removeChangeListener(Ae.MAP,this.onMapChanged_),super.disposeInternal()}dispatchRenderEvent_(e,t,r){const s=this.getLayer();if(s.hasListener(e)){Ie(this.inversePixelTransform_,0,0,r.pixelRatio,-r.pixelRatio,0,0,-r.size[1]);const i=new re(e,this.inversePixelTransform_,r,t);s.dispatchEvent(i)}}preRender(e,t){this.dispatchRenderEvent_(I.PRERENDER,e,t)}postRender(e,t){this.dispatchRenderEvent_(I.POSTRENDER,e,t)}}const se={TILE_TEXTURE_ARRAY:"u_tileTextures",TEXTURE_PIXEL_WIDTH:"u_texturePixelWidth",TEXTURE_PIXEL_HEIGHT:"u_texturePixelHeight"};class kt{constructor(e,t){this.name=e,this.data=t,this.texture_=null}getTexture(e){if(!this.texture_){const t=e.createTexture();e.bindTexture(e.TEXTURE_2D,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,this.data.length/4,1,0,e.RGBA,e.UNSIGNED_BYTE,this.data),this.texture_=t}return this.texture_}delete(e){this.texture_&&e.deleteTexture(this.texture_),this.texture_=null}}function Gt(n,e){return`operator_${n}_${Object.keys(e.functions).length}`}function L(n){const e=n.toString();return e.includes(".")?e:e+".0"}function Ee(n){if(n.length<2||n.length>4)throw new Error("`formatArray` can only output `vec2`, `vec3` or `vec4` arrays.");return`vec${n.length}(${n.map(L).join(", ")})`}function q(n){const e=j(n),t=e.length>3?e[3]:1;return Ee([e[0]/255,e[1]/255,e[2]/255,t])}function Mt(n){const e=it(n);return Ee(e)}const oe={};let zt=0;function z(n){return n in oe||(oe[n]=zt++),oe[n]}function A(n){return L(z(n))}function ve(n){return"u_var_"+n}function ze(){return{variables:{},properties:{},functions:{},bandCount:0,featureId:!1,geometryType:!1}}const ae="getBandValue",jt="u_paletteTextures",je="featureId",We="geometryType",pe=-9999999;function Wt(n,e,t,r){const s=tt(n,e,t);return Te(s,e,r)}function p(n){return(e,t,r)=>{const s=t.args.length,i=new Array(s);for(let o=0;o<s;++o)i[o]=Te(t.args[o],r,e);return n(i,e)}}const Ht={[g.Get]:(n,e)=>{const r=e.args[0].value;r in n.properties||(n.properties[r]={name:r,type:e.type});let i="a_prop_"+r;return Ce(e.type,G)&&(i=`(${i} > 0.0)`),i},[g.Id]:n=>(n.featureId=!0,"a_"+je),[g.GeometryType]:n=>(n.geometryType=!0,"a_"+We),[g.LineMetric]:()=>"currentLineMetric",[g.Var]:(n,e)=>{const r=e.args[0].value;r in n.variables||(n.variables[r]={name:r,type:e.type});let i=ve(r);return Ce(e.type,G)&&(i=`(${i} > 0.0)`),i},[g.Has]:(n,e)=>{const r=e.args[0].value;return r in n.properties||(n.properties[r]={name:r,type:e.type}),`(a_prop_${r} != ${L(pe)})`},[g.Resolution]:()=>"u_resolution",[g.Zoom]:()=>"u_zoom",[g.Time]:()=>"u_time",[g.Any]:p(n=>`(${n.join(" || ")})`),[g.All]:p(n=>`(${n.join(" && ")})`),[g.Not]:p(([n])=>`(!${n})`),[g.Equal]:p(([n,e])=>`(${n} == ${e})`),[g.NotEqual]:p(([n,e])=>`(${n} != ${e})`),[g.GreaterThan]:p(([n,e])=>`(${n} > ${e})`),[g.GreaterThanOrEqualTo]:p(([n,e])=>`(${n} >= ${e})`),[g.LessThan]:p(([n,e])=>`(${n} < ${e})`),[g.LessThanOrEqualTo]:p(([n,e])=>`(${n} <= ${e})`),[g.Multiply]:p(n=>`(${n.join(" * ")})`),[g.Divide]:p(([n,e])=>`(${n} / ${e})`),[g.Add]:p(n=>`(${n.join(" + ")})`),[g.Subtract]:p(([n,e])=>`(${n} - ${e})`),[g.Clamp]:p(([n,e,t])=>`clamp(${n}, ${e}, ${t})`),[g.Mod]:p(([n,e])=>`mod(${n}, ${e})`),[g.Pow]:p(([n,e])=>`pow(${n}, ${e})`),[g.Abs]:p(([n])=>`abs(${n})`),[g.Floor]:p(([n])=>`floor(${n})`),[g.Ceil]:p(([n])=>`ceil(${n})`),[g.Round]:p(([n])=>`floor(${n} + 0.5)`),[g.Sin]:p(([n])=>`sin(${n})`),[g.Cos]:p(([n])=>`cos(${n})`),[g.Atan]:p(([n,e])=>e!==void 0?`atan(${n}, ${e})`:`atan(${n})`),[g.Sqrt]:p(([n])=>`sqrt(${n})`),[g.Match]:p(n=>{const e=n[0],t=n[n.length-1];let r=null;for(let s=n.length-3;s>=1;s-=2){const i=n[s],o=n[s+1];r=`(${e} == ${i} ? ${o} : ${r||t})`}return r}),[g.Between]:p(([n,e,t])=>`(${n} >= ${e} && ${n} <= ${t})`),[g.Interpolate]:p(([n,e,...t])=>{let r="";for(let s=0;s<t.length-2;s+=2){const i=t[s],o=r||t[s+1],a=t[s+2],c=t[s+3];let l;n===L(1)?l=`(${e} - ${i}) / (${a} - ${i})`:l=`(pow(${n}, (${e} - ${i})) - 1.0) / (pow(${n}, (${a} - ${i})) - 1.0)`,r=`mix(${o}, ${c}, clamp(${l}, 0.0, 1.0))`}return r}),[g.Case]:p(n=>{const e=n[n.length-1];let t=null;for(let r=n.length-3;r>=0;r-=2){const s=n[r],i=n[r+1];t=`(${s} ? ${i} : ${t||e})`}return t}),[g.In]:p(([n,...e],t)=>{const r=Gt("in",t),s=[];for(let i=0;i<e.length;i+=1)s.push(`  if (inputValue == ${e[i]}) { return true; }`);return t.functions[r]=`bool ${r}(float inputValue) {
${s.join(`
`)}
  return false;
}`,`${r}(${n})`}),[g.Array]:p(n=>`vec${n.length}(${n.join(", ")})`),[g.Color]:p(n=>{if(n.length===1)return`vec4(vec3(${n[0]} / 255.0), 1.0)`;if(n.length===2)return`vec4(vec3(${n[0]} / 255.0), ${n[1]})`;const e=n.slice(0,3).map(r=>`${r} / 255.0`);if(n.length===3)return`vec4(${e.join(", ")}, 1.0)`;const t=n[3];return`vec4(${e.join(", ")}, ${t})`}),[g.Band]:p(([n,e,t],r)=>{if(!(ae in r.functions)){let s="";const i=r.bandCount||1;for(let o=0;o<i;o++){const a=Math.floor(o/4);let c=o%4;o===i-1&&c===1&&(c=3);const l=`${se.TILE_TEXTURE_ARRAY}[${a}]`;s+=`  if (band == ${o+1}.0) {
    return texture2D(${l}, v_textureCoord + vec2(dx, dy))[${c}];
  }
`}r.functions[ae]=`float getBandValue(float band, float xOffset, float yOffset) {
  float dx = xOffset / ${se.TEXTURE_PIXEL_WIDTH};
  float dy = yOffset / ${se.TEXTURE_PIXEL_HEIGHT};
${s}
}`}return`${ae}(${n}, ${e??"0.0"}, ${t??"0.0"})`}),[g.Palette]:(n,e)=>{const[t,...r]=e.args,s=r.length,i=new Uint8Array(s*4);for(let l=0;l<r.length;l++){const u=r[l].value,h=j(u),f=l*4;i[f]=h[0],i[f+1]=h[1],i[f+2]=h[2],i[f+3]=h[3]*255}n.paletteTextures||(n.paletteTextures=[]);const o=`${jt}[${n.paletteTextures.length}]`,a=new kt(o,i);n.paletteTextures.push(a);const c=Te(t,_,n);return`texture2D(${o}, vec2((${c} + 0.5) / ${s}.0, 0.5))`}};function Te(n,e,t){if(n instanceof rt){const r=Ht[n.operator];if(r===void 0)throw new Error(`No compiler defined for this operator: ${JSON.stringify(n.operator)}`);return r(t,n,e)}if((n.type&_)>0)return L(n.value);if((n.type&G)>0)return n.value.toString();if((n.type&M)>0)return A(n.value.toString());if((n.type&T)>0)return q(n.value);if((n.type&D)>0)return Ee(n.value);if((n.type&B)>0)return Mt(n.value);throw new Error(`Unexpected expression ${n.value} (expected type ${nt(e)})`)}function Xt(){return{"fill-color":"rgba(255,255,255,0.4)","stroke-color":"#3399CC","stroke-width":1.25,"circle-radius":5,"circle-fill-color":"rgba(255,255,255,0.4)","circle-stroke-width":1.25,"circle-stroke-color":"#3399CC"}}const Be=.985;function d(n,e,t){const r=st();return Wt(e,t,r,n)}function Vt(n){const e=j(n),t=e[0]*256,r=e[1],s=e[2]*256,i=Math.round(e[3]*255);return[t+r,s+i]}const Zt=`vec4 unpackColor(vec2 packedColor) {
  return vec4(
    min(floor(packedColor[0] / 256.0) / 255.0, 1.0),
    min(mod(packedColor[0], 256.0) / 255.0, 1.0),
    min(floor(packedColor[1] / 256.0) / 255.0, 1.0),
    min(mod(packedColor[1], 256.0) / 255.0, 1.0)
  );
}`;function ye(n){return n===T||n===B?2:n===D?4:1}function _e(n){const e=ye(n);return e>1?`vec${e}`:"float"}function He(n,e){for(const t in e.variables){const r=e.variables[t],s=ve(r.name);let i=_e(r.type);r.type===T&&(i="vec4"),n.addUniform(s,i)}for(const t in e.properties){const r=e.properties[t],s=_e(r.type),i=`a_prop_${r.name}`;r.type===T?n.addAttribute(i,s,`unpackColor(${i})`,"vec4"):n.addAttribute(i,s)}for(const t in e.functions)n.addVertexShaderFunction(e.functions[t]),n.addFragmentShaderFunction(e.functions[t])}function Xe(n,e){const t={};for(const r in n.variables){const s=n.variables[r],i=ve(s.name);t[i]=()=>{const o=e[s.name];if(typeof o=="number")return o;if(typeof o=="boolean")return o?1:0;if(s.type===T){const a=[...j(o||"#eee")];return a[0]/=255,a[1]/=255,a[2]/=255,a[3]??=1,a}return typeof o=="string"?z(o):o}}return t}function Ve(n){const e={};for(const t in n.properties){const r=n.properties[t],s=i=>{const o=i.get(r.name);return r.type===T?Vt([...j(o||"#eee")]):typeof o=="string"?z(o):typeof o=="boolean"?o?1:0:o};e[`prop_${r.name}`]={size:ye(r.type),callback:s}}return e}const O=`#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform mat4 u_projectionMatrix;
uniform mat4 u_screenToWorldMatrix;
uniform vec2 u_viewportSizePx;
uniform float u_pixelRatio;
uniform float u_globalAlpha;
uniform float u_time;
uniform float u_zoom;
uniform float u_resolution;
uniform float u_rotation;
uniform vec4 u_renderExtent;
uniform vec2 u_patternOrigin;
uniform float u_depth;
uniform mediump int u_hitDetection;

const float PI = 3.141592653589793238;
const float TWO_PI = 2.0 * PI;
float currentLineMetric = 0.; // an actual value will be used in the stroke shaders

${Zt}
`,U=Xt();class Ze{constructor(){this.uniforms_=[],this.attributes_=[],this.hasSymbol_=!1,this.symbolSizeExpression_=`vec2(${L(U["circle-radius"])} + ${L(U["circle-stroke-width"]*.5)})`,this.symbolRotationExpression_="0.0",this.symbolOffsetExpression_="vec2(0.0)",this.symbolColorExpression_=q(U["circle-fill-color"]),this.texCoordExpression_="vec4(0.0, 0.0, 1.0, 1.0)",this.discardExpression_="false",this.symbolRotateWithView_=!1,this.hasStroke_=!1,this.strokeWidthExpression_=L(U["stroke-width"]),this.strokeColorExpression_=q(U["stroke-color"]),this.strokeOffsetExpression_="0.",this.strokeCapExpression_=A("round"),this.strokeJoinExpression_=A("round"),this.strokeMiterLimitExpression_="10.",this.strokeDistanceFieldExpression_="-1000.",this.strokePatternLengthExpression_=null,this.hasFill_=!1,this.fillColorExpression_=q(U["fill-color"]),this.vertexShaderFunctions_=[],this.fragmentShaderFunctions_=[]}addUniform(e,t){return this.uniforms_.push({name:e,type:t}),this}addAttribute(e,t,r,s){return this.attributes_.push({name:e,type:t,varyingName:e.replace(/^a_/,"v_"),varyingType:s??t,varyingExpression:r??e}),this}setSymbolSizeExpression(e){return this.hasSymbol_=!0,this.symbolSizeExpression_=e,this}getSymbolSizeExpression(){return this.symbolSizeExpression_}setSymbolRotationExpression(e){return this.symbolRotationExpression_=e,this}setSymbolOffsetExpression(e){return this.symbolOffsetExpression_=e,this}getSymbolOffsetExpression(){return this.symbolOffsetExpression_}setSymbolColorExpression(e){return this.hasSymbol_=!0,this.symbolColorExpression_=e,this}getSymbolColorExpression(){return this.symbolColorExpression_}setTextureCoordinateExpression(e){return this.texCoordExpression_=e,this}setFragmentDiscardExpression(e){return this.discardExpression_=e,this}getFragmentDiscardExpression(){return this.discardExpression_}setSymbolRotateWithView(e){return this.symbolRotateWithView_=e,this}setStrokeWidthExpression(e){return this.hasStroke_=!0,this.strokeWidthExpression_=e,this}setStrokeColorExpression(e){return this.hasStroke_=!0,this.strokeColorExpression_=e,this}getStrokeColorExpression(){return this.strokeColorExpression_}setStrokeOffsetExpression(e){return this.strokeOffsetExpression_=e,this}setStrokeCapExpression(e){return this.strokeCapExpression_=e,this}setStrokeJoinExpression(e){return this.strokeJoinExpression_=e,this}setStrokeMiterLimitExpression(e){return this.strokeMiterLimitExpression_=e,this}setStrokeDistanceFieldExpression(e){return this.strokeDistanceFieldExpression_=e,this}setStrokePatternLengthExpression(e){return this.strokePatternLengthExpression_=e,this}getStrokePatternLengthExpression(){return this.strokePatternLengthExpression_}setFillColorExpression(e){return this.hasFill_=!0,this.fillColorExpression_=e,this}getFillColorExpression(){return this.fillColorExpression_}addVertexShaderFunction(e){return this.vertexShaderFunctions_.includes(e)?this:(this.vertexShaderFunctions_.push(e),this)}addFragmentShaderFunction(e){return this.fragmentShaderFunctions_.includes(e)?this:(this.fragmentShaderFunctions_.push(e),this)}getSymbolVertexShader(){return this.hasSymbol_?`${O}
${this.uniforms_.map(e=>`uniform ${e.type} ${e.name};`).join(`
`)}
attribute vec2 a_position;
attribute vec2 a_localPosition;
attribute vec2 a_hitColor;

varying vec2 v_texCoord;
varying vec2 v_quadCoord;
varying vec4 v_hitColor;
varying vec2 v_centerPx;
varying float v_angle;
varying vec2 v_quadSizePx;

${this.attributes_.map(e=>`attribute ${e.type} ${e.name};
varying ${e.varyingType} ${e.varyingName};`).join(`
`)}
${this.vertexShaderFunctions_.join(`
`)}
vec2 pxToScreen(vec2 coordPx) {
  vec2 scaled = coordPx / u_viewportSizePx / 0.5;
  return scaled;
}

vec2 screenToPx(vec2 coordScreen) {
  return (coordScreen * 0.5 + 0.5) * u_viewportSizePx;
}

void main(void) {
  v_quadSizePx = ${this.symbolSizeExpression_};
  vec2 halfSizePx = v_quadSizePx * 0.5;
  vec2 centerOffsetPx = ${this.symbolOffsetExpression_};
  vec2 offsetPx = centerOffsetPx + a_localPosition * halfSizePx * vec2(1., -1.);
  float angle = ${this.symbolRotationExpression_}${this.symbolRotateWithView_?" + u_rotation":""};
  float c = cos(-angle);
  float s = sin(-angle);
  offsetPx = vec2(c * offsetPx.x - s * offsetPx.y, s * offsetPx.x + c * offsetPx.y);
  vec4 center = u_projectionMatrix * vec4(a_position, 0.0, 1.0);
  gl_Position = center + vec4(pxToScreen(offsetPx), u_depth, 0.);
  vec4 texCoord = ${this.texCoordExpression_};
  float u = mix(texCoord.s, texCoord.p, a_localPosition.x * 0.5 + 0.5);
  float v = mix(texCoord.t, texCoord.q, a_localPosition.y * 0.5 + 0.5);
  v_texCoord = vec2(u, v);
  v_hitColor = unpackColor(a_hitColor);
  v_angle = angle;
  c = cos(-v_angle);
  s = sin(-v_angle);
  centerOffsetPx = vec2(c * centerOffsetPx.x - s * centerOffsetPx.y, s * centerOffsetPx.x + c * centerOffsetPx.y);
  v_centerPx = screenToPx(center.xy) + centerOffsetPx;
${this.attributes_.map(e=>`  ${e.varyingName} = ${e.varyingExpression};`).join(`
`)}
}`:null}getSymbolFragmentShader(){return this.hasSymbol_?`${O}
${this.uniforms_.map(e=>`uniform ${e.type} ${e.name};`).join(`
`)}
varying vec2 v_texCoord;
varying vec4 v_hitColor;
varying vec2 v_centerPx;
varying float v_angle;
varying vec2 v_quadSizePx;
${this.attributes_.map(e=>`varying ${e.varyingType} ${e.varyingName};`).join(`
`)}
${this.fragmentShaderFunctions_.join(`
`)}

void main(void) {
${this.attributes_.map(e=>`  ${e.varyingType} ${e.name} = ${e.varyingName}; // assign to original attribute name`).join(`
`)}
  if (${this.discardExpression_}) { discard; }
  vec2 coordsPx = gl_FragCoord.xy / u_pixelRatio - v_centerPx; // relative to center
  float c = cos(v_angle);
  float s = sin(v_angle);
  coordsPx = vec2(c * coordsPx.x - s * coordsPx.y, s * coordsPx.x + c * coordsPx.y);
  gl_FragColor = ${this.symbolColorExpression_};
  gl_FragColor.rgb *= gl_FragColor.a;
  if (u_hitDetection > 0) {
    if (gl_FragColor.a < 0.05) { discard; };
    gl_FragColor = v_hitColor;
  }
}`:null}getStrokeVertexShader(){return this.hasStroke_?`${O}
${this.uniforms_.map(e=>`uniform ${e.type} ${e.name};`).join(`
`)}
attribute vec2 a_segmentStart;
attribute vec2 a_segmentEnd;
attribute vec2 a_localPosition;
attribute float a_measureStart;
attribute float a_measureEnd;
attribute float a_angleTangentSum;
attribute float a_distanceLow;
attribute float a_distanceHigh;
attribute vec2 a_joinAngles;
attribute vec2 a_hitColor;

varying vec2 v_segmentStartPx;
varying vec2 v_segmentEndPx;
varying float v_angleStart;
varying float v_angleEnd;
varying float v_width;
varying vec4 v_hitColor;
varying float v_distancePx;
varying float v_measureStart;
varying float v_measureEnd;

${this.attributes_.map(e=>`attribute ${e.type} ${e.name};
varying ${e.varyingType} ${e.varyingName};`).join(`
`)}
${this.vertexShaderFunctions_.join(`
`)}
vec2 worldToPx(vec2 worldPos) {
  vec4 screenPos = u_projectionMatrix * vec4(worldPos, 0.0, 1.0);
  return (0.5 * screenPos.xy + 0.5) * u_viewportSizePx;
}

vec4 pxToScreen(vec2 pxPos) {
  vec2 screenPos = 2.0 * pxPos / u_viewportSizePx - 1.0;
  return vec4(screenPos, u_depth, 1.0);
}

bool isCap(float joinAngle) {
  return joinAngle < -0.1;
}

vec2 getJoinOffsetDirection(vec2 normalPx, float joinAngle) {
  float halfAngle = joinAngle / 2.0;
  float c = cos(halfAngle);
  float s = sin(halfAngle);
  vec2 angleBisectorNormal = vec2(s * normalPx.x + c * normalPx.y, -c * normalPx.x + s * normalPx.y);
  float length = 1.0 / s;
  return angleBisectorNormal * length;
}

vec2 getOffsetPoint(vec2 point, vec2 normal, float joinAngle, float offsetPx) {
  // if on a cap or the join angle is too high, offset the line along the segment normal
  if (cos(joinAngle) > 0.998 || isCap(joinAngle)) {
    return point - normal * offsetPx;
  }
  // offset is applied along the inverted normal (positive offset goes "right" relative to line direction)
  return point - getJoinOffsetDirection(normal, joinAngle) * offsetPx;
}

void main(void) {
  v_angleStart = a_joinAngles.x;
  v_angleEnd = a_joinAngles.y;
  float startEndRatio = a_localPosition.x * 0.5 + 0.5;
  currentLineMetric = mix(a_measureStart, a_measureEnd, startEndRatio);
  // we're reading the fractional part while keeping the sign (so -4.12 gives -0.12, 3.45 gives 0.45)

  float lineWidth = ${this.strokeWidthExpression_};
  float lineOffsetPx = ${this.strokeOffsetExpression_};

  // compute segment start/end in px with offset
  vec2 segmentStartPx = worldToPx(a_segmentStart);
  vec2 segmentEndPx = worldToPx(a_segmentEnd);
  vec2 tangentPx = normalize(segmentEndPx - segmentStartPx);
  vec2 normalPx = vec2(-tangentPx.y, tangentPx.x);
  segmentStartPx = getOffsetPoint(segmentStartPx, normalPx, v_angleStart, lineOffsetPx),
  segmentEndPx = getOffsetPoint(segmentEndPx, normalPx, v_angleEnd, lineOffsetPx);

  // compute current vertex position
  float normalDir = -1. * a_localPosition.y;
  float tangentDir = -1. * a_localPosition.x;
  float angle = mix(v_angleStart, v_angleEnd, startEndRatio);
  vec2 joinDirection;
  vec2 positionPx = mix(segmentStartPx, segmentEndPx, startEndRatio);
  // if angle is too high, do not make a proper join
  if (cos(angle) > ${Be} || isCap(angle)) {
    joinDirection = normalPx * normalDir - tangentPx * tangentDir;
  } else {
    joinDirection = getJoinOffsetDirection(normalPx * normalDir, angle);
  }
  positionPx = positionPx + joinDirection * (lineWidth * 0.5 + 1.); // adding 1 pixel for antialiasing
  gl_Position = pxToScreen(positionPx);

  v_segmentStartPx = segmentStartPx;
  v_segmentEndPx = segmentEndPx;
  v_width = lineWidth;
  v_hitColor = unpackColor(a_hitColor);

  v_distancePx = a_distanceLow / u_resolution - (lineOffsetPx * a_angleTangentSum);
  float distanceHighPx = a_distanceHigh / u_resolution;
  ${this.strokePatternLengthExpression_!==null?`v_distancePx = mod(v_distancePx, ${this.strokePatternLengthExpression_});
  distanceHighPx = mod(distanceHighPx, ${this.strokePatternLengthExpression_});
  `:""}v_distancePx += distanceHighPx;

  v_measureStart = a_measureStart;
  v_measureEnd = a_measureEnd;
${this.attributes_.map(e=>`  ${e.varyingName} = ${e.varyingExpression};`).join(`
`)}
}`:null}getStrokeFragmentShader(){return this.hasStroke_?`${O}
${this.uniforms_.map(e=>`uniform ${e.type} ${e.name};`).join(`
`)}
varying vec2 v_segmentStartPx;
varying vec2 v_segmentEndPx;
varying float v_angleStart;
varying float v_angleEnd;
varying float v_width;
varying vec4 v_hitColor;
varying float v_distancePx;
varying float v_measureStart;
varying float v_measureEnd;
${this.attributes_.map(e=>`varying ${e.varyingType} ${e.varyingName};`).join(`
`)}
${this.fragmentShaderFunctions_.join(`
`)}

vec2 pxToWorld(vec2 pxPos) {
  vec2 screenPos = 2.0 * pxPos / u_viewportSizePx - 1.0;
  return (u_screenToWorldMatrix * vec4(screenPos, 0.0, 1.0)).xy;
}

bool isCap(float joinAngle) {
  return joinAngle < -0.1;
}

float segmentDistanceField(vec2 point, vec2 start, vec2 end, float width) {
  vec2 tangent = normalize(end - start);
  vec2 normal = vec2(-tangent.y, tangent.x);
  vec2 startToPoint = point - start;
  return abs(dot(startToPoint, normal)) - width * 0.5;
}

float buttCapDistanceField(vec2 point, vec2 start, vec2 end) {
  vec2 startToPoint = point - start;
  vec2 tangent = normalize(end - start);
  return dot(startToPoint, -tangent);
}

float squareCapDistanceField(vec2 point, vec2 start, vec2 end, float width) {
  return buttCapDistanceField(point, start, end) - width * 0.5;
}

float roundCapDistanceField(vec2 point, vec2 start, vec2 end, float width) {
  float onSegment = max(0., 1000. * dot(point - start, end - start)); // this is very high when inside the segment
  return length(point - start) - width * 0.5 - onSegment;
}

float roundJoinDistanceField(vec2 point, vec2 start, vec2 end, float width) {
  return roundCapDistanceField(point, start, end, width);
}

float bevelJoinField(vec2 point, vec2 start, vec2 end, float width, float joinAngle) {
  vec2 startToPoint = point - start;
  vec2 tangent = normalize(end - start);
  float c = cos(joinAngle * 0.5);
  float s = sin(joinAngle * 0.5);
  float direction = -sign(sin(joinAngle));
  vec2 bisector = vec2(c * tangent.x - s * tangent.y, s * tangent.x + c * tangent.y);
  float radius = width * 0.5 * s;
  return dot(startToPoint, bisector * direction) - radius;
}

float miterJoinDistanceField(vec2 point, vec2 start, vec2 end, float width, float joinAngle) {
  if (cos(joinAngle) > ${Be}) { // avoid risking a division by zero
    return bevelJoinField(point, start, end, width, joinAngle);
  }
  float miterLength = 1. / sin(joinAngle * 0.5);
  float miterLimit = ${this.strokeMiterLimitExpression_};
  if (miterLength > miterLimit) {
    return bevelJoinField(point, start, end, width, joinAngle);
  }
  return -1000.;
}

float capDistanceField(vec2 point, vec2 start, vec2 end, float width, float capType) {
   if (capType == ${A("butt")}) {
    return buttCapDistanceField(point, start, end);
  } else if (capType == ${A("square")}) {
    return squareCapDistanceField(point, start, end, width);
  }
  return roundCapDistanceField(point, start, end, width);
}

float joinDistanceField(vec2 point, vec2 start, vec2 end, float width, float joinAngle, float joinType) {
  if (joinType == ${A("bevel")}) {
    return bevelJoinField(point, start, end, width, joinAngle);
  } else if (joinType == ${A("miter")}) {
    return miterJoinDistanceField(point, start, end, width, joinAngle);
  }
  return roundJoinDistanceField(point, start, end, width);
}

float computeSegmentPointDistance(vec2 point, vec2 start, vec2 end, float width, float joinAngle, float capType, float joinType) {
  if (isCap(joinAngle)) {
    return capDistanceField(point, start, end, width, capType);
  }
  return joinDistanceField(point, start, end, width, joinAngle, joinType);
}

float distanceFromSegment(vec2 point, vec2 start, vec2 end) {
  vec2 tangent = end - start;
  vec2 startToPoint = point - start;
  // inspire by capsule fn in https://iquilezles.org/articles/distfunctions/
  float h = clamp(dot(startToPoint, tangent) / dot(tangent, tangent), 0.0, 1.0);
  return length(startToPoint - tangent * h);
}

void main(void) {
${this.attributes_.map(e=>`  ${e.varyingType} ${e.name} = ${e.varyingName}; // assign to original attribute name`).join(`
`)}

  vec2 currentPointPx = gl_FragCoord.xy / u_pixelRatio;
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  vec2 worldPos = pxToWorld(currentPointPx);
  if (
    abs(u_renderExtent[0] - u_renderExtent[2]) > 0.0 && (
      worldPos[0] < u_renderExtent[0] ||
      worldPos[1] < u_renderExtent[1] ||
      worldPos[0] > u_renderExtent[2] ||
      worldPos[1] > u_renderExtent[3]
    )
  ) {
    discard;
  }
  #endif

  float segmentLengthPx = length(v_segmentEndPx - v_segmentStartPx);
  segmentLengthPx = max(segmentLengthPx, 1.17549429e-38); // avoid divide by zero
  vec2 segmentTangent = (v_segmentEndPx - v_segmentStartPx) / segmentLengthPx;
  vec2 segmentNormal = vec2(-segmentTangent.y, segmentTangent.x);
  vec2 startToPointPx = currentPointPx - v_segmentStartPx;
  float lengthToPointPx = max(0., min(dot(segmentTangent, startToPointPx), segmentLengthPx));
  float currentLengthPx = lengthToPointPx + v_distancePx;
  float currentRadiusPx = distanceFromSegment(currentPointPx, v_segmentStartPx, v_segmentEndPx);
  float currentRadiusRatio = dot(segmentNormal, startToPointPx) * 2. / v_width;
  currentLineMetric = mix(v_measureStart, v_measureEnd, lengthToPointPx / segmentLengthPx);

  if (${this.discardExpression_}) { discard; }

  float capType = ${this.strokeCapExpression_};
  float joinType = ${this.strokeJoinExpression_};
  float segmentStartDistance = computeSegmentPointDistance(currentPointPx, v_segmentStartPx, v_segmentEndPx, v_width, v_angleStart, capType, joinType);
  float segmentEndDistance = computeSegmentPointDistance(currentPointPx, v_segmentEndPx, v_segmentStartPx, v_width, v_angleEnd, capType, joinType);
  float distanceField = max(
    segmentDistanceField(currentPointPx, v_segmentStartPx, v_segmentEndPx, v_width),
    max(segmentStartDistance, segmentEndDistance)
  );
  distanceField = max(distanceField, ${this.strokeDistanceFieldExpression_});

  vec4 color = ${this.strokeColorExpression_};
  color.a *= smoothstep(0.5, -0.5, distanceField);
  gl_FragColor = color;
  gl_FragColor.a *= u_globalAlpha;
  gl_FragColor.rgb *= gl_FragColor.a;
  if (u_hitDetection > 0) {
    if (gl_FragColor.a < 0.1) { discard; };
    gl_FragColor = v_hitColor;
  }
}`:null}getFillVertexShader(){return this.hasFill_?`${O}
${this.uniforms_.map(e=>`uniform ${e.type} ${e.name};`).join(`
`)}
attribute vec2 a_position;
attribute vec2 a_hitColor;

varying vec4 v_hitColor;

${this.attributes_.map(e=>`attribute ${e.type} ${e.name};
varying ${e.varyingType} ${e.varyingName};`).join(`
`)}
${this.vertexShaderFunctions_.join(`
`)}
void main(void) {
  gl_Position = u_projectionMatrix * vec4(a_position, u_depth, 1.0);
  v_hitColor = unpackColor(a_hitColor);
${this.attributes_.map(e=>`  ${e.varyingName} = ${e.varyingExpression};`).join(`
`)}
}`:null}getFillFragmentShader(){return this.hasFill_?`${O}
${this.uniforms_.map(e=>`uniform ${e.type} ${e.name};`).join(`
`)}
varying vec4 v_hitColor;
${this.attributes_.map(e=>`varying ${e.varyingType} ${e.varyingName};`).join(`
`)}
${this.fragmentShaderFunctions_.join(`
`)}
vec2 pxToWorld(vec2 pxPos) {
  vec2 screenPos = 2.0 * pxPos / u_viewportSizePx - 1.0;
  return (u_screenToWorldMatrix * vec4(screenPos, 0.0, 1.0)).xy;
}

vec2 worldToPx(vec2 worldPos) {
  vec4 screenPos = u_projectionMatrix * vec4(worldPos, 0.0, 1.0);
  return (0.5 * screenPos.xy + 0.5) * u_viewportSizePx;
}

void main(void) {
${this.attributes_.map(e=>`  ${e.varyingType} ${e.name} = ${e.varyingName}; // assign to original attribute name`).join(`
`)}
  vec2 pxPos = gl_FragCoord.xy / u_pixelRatio;
  vec2 pxOrigin = worldToPx(u_patternOrigin);
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  vec2 worldPos = pxToWorld(pxPos);
  if (
    abs(u_renderExtent[0] - u_renderExtent[2]) > 0.0 && (
      worldPos[0] < u_renderExtent[0] ||
      worldPos[1] < u_renderExtent[1] ||
      worldPos[0] > u_renderExtent[2] ||
      worldPos[1] > u_renderExtent[3]
    )
  ) {
    discard;
  }
  #endif
  if (${this.discardExpression_}) { discard; }
  gl_FragColor = ${this.fillColorExpression_};
  gl_FragColor.a *= u_globalAlpha;
  gl_FragColor.rgb *= gl_FragColor.a;
  if (u_hitDetection > 0) {
    if (gl_FragColor.a < 0.1) { discard; };
    gl_FragColor = v_hitColor;
  }
}`:null}}class J{constructor(){this.globalCounter_=0,this.refToFeature_=new Map,this.uidToRef_=new Map,this.freeGlobalRef_=[],this.polygonBatch={entries:{},geometriesCount:0,verticesCount:0,ringsCount:0},this.pointBatch={entries:{},geometriesCount:0},this.lineStringBatch={entries:{},geometriesCount:0,verticesCount:0}}addFeatures(e,t){for(let r=0;r<e.length;r++)this.addFeature(e[r],t)}addFeature(e,t){let r=e.getGeometry();r&&(t&&(r=r.clone(),r.applyTransform(t)),this.addGeometry_(r,e))}clearFeatureEntryInPointBatch_(e){const t=v(e),r=this.pointBatch.entries[t];if(r)return this.pointBatch.geometriesCount-=r.flatCoordss.length,delete this.pointBatch.entries[t],r}clearFeatureEntryInLineStringBatch_(e){const t=v(e),r=this.lineStringBatch.entries[t];if(r)return this.lineStringBatch.verticesCount-=r.verticesCount,this.lineStringBatch.geometriesCount-=r.flatCoordss.length,delete this.lineStringBatch.entries[t],r}clearFeatureEntryInPolygonBatch_(e){const t=v(e),r=this.polygonBatch.entries[t];if(r)return this.polygonBatch.verticesCount-=r.verticesCount,this.polygonBatch.ringsCount-=r.ringsCount,this.polygonBatch.geometriesCount-=r.flatCoordss.length,delete this.polygonBatch.entries[t],r}addGeometry_(e,t){const r=e.getType();switch(r){case"GeometryCollection":{const s=e.getGeometriesArray();for(const i of s)this.addGeometry_(i,t);break}case"MultiPolygon":{const s=e;this.addCoordinates_(r,s.getFlatCoordinates(),s.getEndss(),t,v(t),s.getStride());break}case"MultiLineString":{const s=e;this.addCoordinates_(r,s.getFlatCoordinates(),s.getEnds(),t,v(t),s.getStride());break}case"MultiPoint":{const s=e;this.addCoordinates_(r,s.getFlatCoordinates(),null,t,v(t),s.getStride());break}case"Polygon":{const s=e;this.addCoordinates_(r,s.getFlatCoordinates(),s.getEnds(),t,v(t),s.getStride());break}case"Point":{const s=e;this.addCoordinates_(r,s.getFlatCoordinates(),null,t,v(t),s.getStride());break}case"LineString":case"LinearRing":{const s=e,i=s.getStride();this.addCoordinates_(r,s.getFlatCoordinates(),null,t,v(t),i,s.getLayout?.());break}}}addCoordinates_(e,t,r,s,i,o,a){let c;switch(e){case"MultiPolygon":{const l=r;for(let u=0,h=l.length;u<h;u++){let f=l[u];const x=u>0?l[u-1]:null,m=x?x[x.length-1]:0,N=f[f.length-1];f=m>0?f.map(Ke=>Ke-m):f,this.addCoordinates_("Polygon",t.slice(m,N),f,s,i,o,a)}break}case"MultiLineString":{const l=r;for(let u=0,h=l.length;u<h;u++){const f=u>0?l[u-1]:0;this.addCoordinates_("LineString",t.slice(f,l[u]),null,s,i,o,a)}break}case"MultiPoint":for(let l=0,u=t.length;l<u;l+=o)this.addCoordinates_("Point",t.slice(l,l+2),null,s,i,null,null);break;case"Polygon":{const l=r;if(s instanceof ot){const f=at(t,l);if(f.length>1){this.addCoordinates_("MultiPolygon",t,f,s,i,o,a);return}}this.polygonBatch.entries[i]||(this.polygonBatch.entries[i]=this.addRefToEntry_(i,{feature:s,flatCoordss:[],verticesCount:0,ringsCount:0,ringsVerticesCounts:[]})),c=t.length/o;const u=r.length,h=r.map((f,x,m)=>x>0?(f-m[x-1])/o:f/o);this.polygonBatch.verticesCount+=c,this.polygonBatch.ringsCount+=u,this.polygonBatch.geometriesCount++,this.polygonBatch.entries[i].flatCoordss.push(qt(t,o)),this.polygonBatch.entries[i].ringsVerticesCounts.push(h),this.polygonBatch.entries[i].verticesCount+=c,this.polygonBatch.entries[i].ringsCount+=u;for(let f=0,x=l.length;f<x;f++){const m=f>0?l[f-1]:0;this.addCoordinates_("LinearRing",t.slice(m,l[f]),null,s,i,o,a)}break}case"Point":this.pointBatch.entries[i]||(this.pointBatch.entries[i]=this.addRefToEntry_(i,{feature:s,flatCoordss:[]})),this.pointBatch.geometriesCount++,this.pointBatch.entries[i].flatCoordss.push(t);break;case"LineString":case"LinearRing":this.lineStringBatch.entries[i]||(this.lineStringBatch.entries[i]=this.addRefToEntry_(i,{feature:s,flatCoordss:[],verticesCount:0})),c=t.length/o,this.lineStringBatch.verticesCount+=c,this.lineStringBatch.geometriesCount++,this.lineStringBatch.entries[i].flatCoordss.push(Kt(t,o,a)),this.lineStringBatch.entries[i].verticesCount+=c;break}}addRefToEntry_(e,t){const r=this.uidToRef_.get(e),s=r||this.freeGlobalRef_.pop()||++this.globalCounter_;return t.ref=s,r||(this.refToFeature_.set(s,t.feature),this.uidToRef_.set(e,s)),t}removeRef_(e,t){if(!e)throw new Error("This feature has no ref: "+t);this.refToFeature_.delete(e),this.uidToRef_.delete(t),this.freeGlobalRef_.push(e)}changeFeature(e,t){if(!this.uidToRef_.get(v(e)))return;this.removeFeature(e);let r=e.getGeometry();r&&(t&&(r=r.clone(),r.applyTransform(t)),this.addGeometry_(r,e))}removeFeature(e){let t=this.clearFeatureEntryInPointBatch_(e);t=this.clearFeatureEntryInPolygonBatch_(e)||t,t=this.clearFeatureEntryInLineStringBatch_(e)||t,t&&this.removeRef_(t.ref,v(t.feature))}clear(){this.polygonBatch.entries={},this.polygonBatch.geometriesCount=0,this.polygonBatch.verticesCount=0,this.polygonBatch.ringsCount=0,this.lineStringBatch.entries={},this.lineStringBatch.geometriesCount=0,this.lineStringBatch.verticesCount=0,this.pointBatch.entries={},this.pointBatch.geometriesCount=0,this.globalCounter_=0,this.freeGlobalRef_=[],this.refToFeature_.clear(),this.uidToRef_.clear()}getFeatureFromRef(e){return this.refToFeature_.get(e)}isEmpty(){return this.globalCounter_===0}filter(e){const t=new J;t.globalCounter_=this.globalCounter_,t.uidToRef_=this.uidToRef_,t.refToFeature_=this.refToFeature_;let r=!0;for(const s of this.refToFeature_.values())e(s)&&(t.addFeature(s),r=!1);return r?new J:t}}function qt(n,e){return e===2?n:n.filter((t,r)=>r%e<2)}function Kt(n,e,t){return e===3&&t==="XYM"?n:e===4?n.filter((r,s)=>s%e!==2):e===3?n.map((r,s)=>s%e!==2?r:0):new Array(n.length*1.5).fill(0).map((r,s)=>s%3===2?0:n[Math.round(s/1.5)])}function Yt(){const n='function t(t,n,x=2){const o=n&&n.length,i=o?n[0]*x:t.length;let f=e(t,0,i,x,!0);const l=[];if(!f||f.next===f.prev)return l;let c,y,h;if(o&&(f=function(t,n,r,x){const o=[];for(let r=0,i=n.length;r<i;r++){const f=e(t,n[r]*x,r<i-1?n[r+1]*x:t.length,x,!1);f===f.next&&(f.steiner=!0),o.push(a(f))}o.sort(u);for(let t=0;t<o.length;t++)r=s(o[t],r);return r}(t,n,f,x)),t.length>80*x){c=t[0],y=t[1];let e=c,n=y;for(let r=x;r<i;r+=x){const x=t[r],o=t[r+1];x<c&&(c=x),o<y&&(y=o),x>e&&(e=x),o>n&&(n=o)}h=Math.max(e-c,n-y),h=0!==h?32767/h:0}return r(f,l,x,c,y,h,0),l}function e(t,e,n,r,x){let o;if(x===function(t,e,n,r){let x=0;for(let o=e,i=n-r;o<n;o+=r)x+=(t[i]-t[o])*(t[o+1]+t[i+1]),i=o;return x}(t,e,n,r)>0)for(let x=e;x<n;x+=r)o=d(x/r|0,t[x],t[x+1],o);else for(let x=n-r;x>=e;x-=r)o=d(x/r|0,t[x],t[x+1],o);return o&&b(o,o.next)&&(w(o),o=o.next),o}function n(t,e){if(!t)return t;e||(e=t);let n,r=t;do{if(n=!1,r.steiner||!b(r,r.next)&&0!==v(r.prev,r,r.next))r=r.next;else{if(w(r),r=e=r.prev,r===r.next)break;n=!0}}while(n||r!==e);return e}function r(t,e,u,s,l,a,y){if(!t)return;!y&&a&&function(t,e,n,r){let x=t;do{0===x.z&&(x.z=c(x.x,x.y,e,n,r)),x.prevZ=x.prev,x.nextZ=x.next,x=x.next}while(x!==t);x.prevZ.nextZ=null,x.prevZ=null,function(t){let e,n=1;do{let r,x=t;t=null;let o=null;for(e=0;x;){e++;let i=x,f=0;for(let t=0;t<n&&(f++,i=i.nextZ,i);t++);let u=n;for(;f>0||u>0&&i;)0!==f&&(0===u||!i||x.z<=i.z)?(r=x,x=x.nextZ,f--):(r=i,i=i.nextZ,u--),o?o.nextZ=r:t=r,r.prevZ=o,o=r;x=i}o.nextZ=null,n*=2}while(e>1)}(x)}(t,s,l,a);let h=t;for(;t.prev!==t.next;){const c=t.prev,p=t.next;if(a?o(t,s,l,a):x(t))e.push(c.i,t.i,p.i),w(t),t=p.next,h=p.next;else if((t=p)===h){y?1===y?r(t=i(n(t),e),e,u,s,l,a,2):2===y&&f(t,e,u,s,l,a):r(n(t),e,u,s,l,a,1);break}}}function x(t){const e=t.prev,n=t,r=t.next;if(v(e,n,r)>=0)return!1;const x=e.x,o=n.x,i=r.x,f=e.y,u=n.y,s=r.y,l=Math.min(x,o,i),c=Math.min(f,u,s),a=Math.max(x,o,i),y=Math.max(f,u,s);let p=r.next;for(;p!==e;){if(p.x>=l&&p.x<=a&&p.y>=c&&p.y<=y&&h(x,f,o,u,i,s,p.x,p.y)&&v(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function o(t,e,n,r){const x=t.prev,o=t,i=t.next;if(v(x,o,i)>=0)return!1;const f=x.x,u=o.x,s=i.x,l=x.y,a=o.y,y=i.y,p=Math.min(f,u,s),b=Math.min(l,a,y),M=Math.max(f,u,s),m=Math.max(l,a,y),A=c(p,b,e,n,r),g=c(M,m,e,n,r);let Z=t.prevZ,d=t.nextZ;for(;Z&&Z.z>=A&&d&&d.z<=g;){if(Z.x>=p&&Z.x<=M&&Z.y>=b&&Z.y<=m&&Z!==x&&Z!==i&&h(f,l,u,a,s,y,Z.x,Z.y)&&v(Z.prev,Z,Z.next)>=0)return!1;if(Z=Z.prevZ,d.x>=p&&d.x<=M&&d.y>=b&&d.y<=m&&d!==x&&d!==i&&h(f,l,u,a,s,y,d.x,d.y)&&v(d.prev,d,d.next)>=0)return!1;d=d.nextZ}for(;Z&&Z.z>=A;){if(Z.x>=p&&Z.x<=M&&Z.y>=b&&Z.y<=m&&Z!==x&&Z!==i&&h(f,l,u,a,s,y,Z.x,Z.y)&&v(Z.prev,Z,Z.next)>=0)return!1;Z=Z.prevZ}for(;d&&d.z<=g;){if(d.x>=p&&d.x<=M&&d.y>=b&&d.y<=m&&d!==x&&d!==i&&h(f,l,u,a,s,y,d.x,d.y)&&v(d.prev,d,d.next)>=0)return!1;d=d.nextZ}return!0}function i(t,e){let r=t;do{const n=r.prev,x=r.next.next;!b(n,x)&&M(n,r,r.next,x)&&g(n,x)&&g(x,n)&&(e.push(n.i,r.i,x.i),w(r),w(r.next),r=t=x),r=r.next}while(r!==t);return n(r)}function f(t,e,x,o,i,f){let u=t;do{let t=u.next.next;for(;t!==u.prev;){if(u.i!==t.i&&p(u,t)){let s=Z(u,t);return u=n(u,u.next),s=n(s,s.next),r(u,e,x,o,i,f,0),void r(s,e,x,o,i,f,0)}t=t.next}u=u.next}while(u!==t)}function u(t,e){let n=t.x-e.x;if(0===n&&(n=t.y-e.y,0===n)){n=(t.next.y-t.y)/(t.next.x-t.x)-(e.next.y-e.y)/(e.next.x-e.x)}return n}function s(t,e){const r=function(t,e){let n=e;const r=t.x,x=t.y;let o,i=-1/0;if(b(t,n))return n;do{if(b(t,n.next))return n.next;if(x<=n.y&&x>=n.next.y&&n.next.y!==n.y){const t=n.x+(x-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(t<=r&&t>i&&(i=t,o=n.x<n.next.x?n:n.next,t===r))return o}n=n.next}while(n!==e);if(!o)return null;const f=o,u=o.x,s=o.y;let c=1/0;n=o;do{if(r>=n.x&&n.x>=u&&r!==n.x&&y(x<s?r:i,x,u,s,x<s?i:r,x,n.x,n.y)){const e=Math.abs(x-n.y)/(r-n.x);g(n,t)&&(e<c||e===c&&(n.x>o.x||n.x===o.x&&l(o,n)))&&(o=n,c=e)}n=n.next}while(n!==f);return o}(t,e);if(!r)return e;const x=Z(r,t);return n(x,x.next),n(r,r.next)}function l(t,e){return v(t.prev,t,e.prev)<0&&v(e.next,t,t.next)<0}function c(t,e,n,r,x){return(t=1431655765&((t=858993459&((t=252645135&((t=16711935&((t=(t-n)*x|0)|t<<8))|t<<4))|t<<2))|t<<1))|(e=1431655765&((e=858993459&((e=252645135&((e=16711935&((e=(e-r)*x|0)|e<<8))|e<<4))|e<<2))|e<<1))<<1}function a(t){let e=t,n=t;do{(e.x<n.x||e.x===n.x&&e.y<n.y)&&(n=e),e=e.next}while(e!==t);return n}function y(t,e,n,r,x,o,i,f){return(x-i)*(e-f)>=(t-i)*(o-f)&&(t-i)*(r-f)>=(n-i)*(e-f)&&(n-i)*(o-f)>=(x-i)*(r-f)}function h(t,e,n,r,x,o,i,f){return!(t===i&&e===f)&&y(t,e,n,r,x,o,i,f)}function p(t,e){return t.next.i!==e.i&&t.prev.i!==e.i&&!function(t,e){let n=t;do{if(n.i!==t.i&&n.next.i!==t.i&&n.i!==e.i&&n.next.i!==e.i&&M(n,n.next,t,e))return!0;n=n.next}while(n!==t);return!1}(t,e)&&(g(t,e)&&g(e,t)&&function(t,e){let n=t,r=!1;const x=(t.x+e.x)/2,o=(t.y+e.y)/2;do{n.y>o!=n.next.y>o&&n.next.y!==n.y&&x<(n.next.x-n.x)*(o-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next}while(n!==t);return r}(t,e)&&(v(t.prev,t,e.prev)||v(t,e.prev,e))||b(t,e)&&v(t.prev,t,t.next)>0&&v(e.prev,e,e.next)>0)}function v(t,e,n){return(e.y-t.y)*(n.x-e.x)-(e.x-t.x)*(n.y-e.y)}function b(t,e){return t.x===e.x&&t.y===e.y}function M(t,e,n,r){const x=A(v(t,e,n)),o=A(v(t,e,r)),i=A(v(n,r,t)),f=A(v(n,r,e));return x!==o&&i!==f||(!(0!==x||!m(t,n,e))||(!(0!==o||!m(t,r,e))||(!(0!==i||!m(n,t,r))||!(0!==f||!m(n,e,r)))))}function m(t,e,n){return e.x<=Math.max(t.x,n.x)&&e.x>=Math.min(t.x,n.x)&&e.y<=Math.max(t.y,n.y)&&e.y>=Math.min(t.y,n.y)}function A(t){return t>0?1:t<0?-1:0}function g(t,e){return v(t.prev,t,t.next)<0?v(t,e,t.next)>=0&&v(t,t.prev,e)>=0:v(t,e,t.prev)<0||v(t,t.next,e)<0}function Z(t,e){const n=F(t.i,t.x,t.y),r=F(e.i,e.x,e.y),x=t.next,o=e.prev;return t.next=e,e.prev=t,n.next=x,x.prev=n,r.next=n,n.prev=r,o.next=r,r.prev=o,r}function d(t,e,n,r){const x=F(t,e,n);return r?(x.next=r.next,x.prev=r,r.next.prev=x,r.next=x):(x.prev=x,x.next=x),x}function w(t){t.next.prev=t.prev,t.prev.next=t.next,t.prevZ&&(t.prevZ.nextZ=t.nextZ),t.nextZ&&(t.nextZ.prevZ=t.prevZ)}function F(t,e,n){return{i:t,x:e,y:n,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function E(t,e){const n=e[0],r=e[1];return e[0]=t[0]*n+t[2]*r+t[4],e[1]=t[1]*n+t[3]*r+t[5],e}function I(t,e){const n=(r=e)[0]*r[3]-r[1]*r[2];var r;!function(t,e){if(!t)throw new Error(e)}(0!==n,"Transformation matrix cannot be inverted");const x=e[0],o=e[1],i=e[2],f=e[3],u=e[4],s=e[5];return t[0]=f/n,t[1]=-o/n,t[2]=-i/n,t[3]=x/n,t[4]=(i*s-f*u)/n,t[5]=-(x*s-o*u)/n,t}new Array(6);const z=[],B={vertexAttributesPosition:0,instanceAttributesPosition:0,indicesPosition:0};function P(t,e,n,r,x){const o=t[e++],i=t[e++],f=z;f.length=r;for(let n=0;n<f.length;n++)f[n]=t[e+n];let u=x?x.instanceAttributesPosition:0;return n[u++]=o,n[u++]=i,f.length&&(n.set(f,u),u+=f.length),B.instanceAttributesPosition=u,B}function N(t,e,n,r,x,o,i,f,u,s){const l=[t[e],t[e+1]],c=[t[n],t[n+1]],a=t[e+2],y=t[n+2],h=E(f,[...l]),p=E(f,[...c]);function v(t,e,n){const r=Math.sqrt((e[0]-t[0])*(e[0]-t[0])+(e[1]-t[1])*(e[1]-t[1])),x=[(e[0]-t[0])/r,(e[1]-t[1])/r],o=[-x[1],x[0]],i=Math.sqrt((n[0]-t[0])*(n[0]-t[0])+(n[1]-t[1])*(n[1]-t[1])),f=[(n[0]-t[0])/i,(n[1]-t[1])/i];let u=0===r||0===i?0:Math.acos((s=f[0]*x[0]+f[1]*x[1],l=-1,c=1,Math.min(Math.max(s,l),c)));var s,l,c;u=Math.max(u,1e-5);return f[0]*o[0]+f[1]*o[1]>0?u:2*Math.PI-u}let b=-1,M=-1,m=s;const A=null!==x;if(null!==r){b=v(h,p,E(f,[...[t[r],t[r+1]]])),Math.cos(b)<=.985&&(m+=Math.tan((b-Math.PI)/2))}if(A){M=v(p,h,E(f,[...[t[x],t[x+1]]])),Math.cos(M)<=.985&&(m+=Math.tan((Math.PI-M)/2))}const g=Math.pow(2,24),Z=u%g,d=Math.floor(u/g)*g;return o.push(l[0],l[1],a,c[0],c[1],y,b,M,Z,d,s),o.push(...i),{length:u+Math.sqrt((p[0]-h[0])*(p[0]-h[0])+(p[1]-h[1])*(p[1]-h[1])),angle:m}}function R(e,n,r,x,o){const i=2+o;let f=n;const u=e.slice(f,f+o);f+=o;const s=e[f++];let l=0;const c=new Array(s-1);for(let t=0;t<s;t++)l+=e[f++],t<s-1&&(c[t]=l);const a=e.slice(f,f+2*l),y=t(a,c,2);for(let t=0;t<y.length;t++)x.push(y[t]+r.length/i);for(let t=0;t<a.length;t+=2)r.push(a[t],a[t+1],...u);return f+2*l}const S="GENERATE_POLYGON_BUFFERS",T="GENERATE_POINT_BUFFERS",_="GENERATE_LINE_STRING_BUFFERS",O=self;O.onmessage=t=>{const e=t.data;switch(e.type){case T:{const t=2,n=2,r=e.customAttributesSize,x=n+r,o=new Float32Array(e.renderInstructions),i=o.length/x*(t+r),f=Uint32Array.from([0,1,3,1,2,3]),u=Float32Array.from([-1,-1,1,-1,1,1,-1,1]),s=new Float32Array(i);let l;for(let t=0;t<o.length;t+=x)l=P(o,t,s,r,l);const c=Object.assign({indicesBuffer:f.buffer,vertexAttributesBuffer:u.buffer,instanceAttributesBuffer:s.buffer,renderInstructions:o.buffer},e);O.postMessage(c,[u.buffer,s.buffer,f.buffer,o.buffer]);break}case _:{const t=[],n=e.customAttributesSize,r=3,x=new Float32Array(e.renderInstructions);let o=0;const i=[1,0,0,1,0,0];let f,u;for(I(i,e.renderInstructionsTransform);o<x.length;){u=Array.from(x.slice(o,o+n)),o+=n,f=x[o++];const e=o,s=o+(f-1)*r,l=x[e]===x[s]&&x[e+1]===x[s+1];let c=0,a=0;for(let n=0;n<f-1;n++){let y=null;n>0?y=o+(n-1)*r:l&&(y=s-r);let h=null;n<f-2?h=o+(n+2)*r:l&&(h=e+r);const p=N(x,o+n*r,o+(n+1)*r,y,h,t,u,i,c,a);c=p.length,a=p.angle}o+=f*r}const s=Uint32Array.from([0,1,3,1,2,3]),l=Float32Array.from([-1,-1,1,-1,1,1,-1,1]),c=Float32Array.from(t),a=Object.assign({indicesBuffer:s.buffer,vertexAttributesBuffer:l.buffer,instanceAttributesBuffer:c.buffer,renderInstructions:x.buffer},e);O.postMessage(a,[l.buffer,c.buffer,s.buffer,x.buffer]);break}case S:{const t=[],n=[],r=e.customAttributesSize,x=new Float32Array(e.renderInstructions);let o=0;for(;o<x.length;)o=R(x,o,t,n,r);const i=Uint32Array.from(n),f=Float32Array.from(t),u=Float32Array.from([]),s=Object.assign({indicesBuffer:i.buffer,vertexAttributesBuffer:f.buffer,instanceAttributesBuffer:u.buffer,renderInstructions:x.buffer},e);O.postMessage(s,[f.buffer,u.buffer,i.buffer,x.buffer]);break}}};';return new Worker(typeof Blob>"u"?"data:application/javascript;base64,"+Buffer.from(n,"binary").toString("base64"):URL.createObjectURL(new Blob([n],{type:"application/javascript"})))}const le={GENERATE_POLYGON_BUFFERS:"GENERATE_POLYGON_BUFFERS",GENERATE_POINT_BUFFERS:"GENERATE_POINT_BUFFERS",GENERATE_LINE_STRING_BUFFERS:"GENERATE_LINE_STRING_BUFFERS"};function Jt(n,e){e=e||[];const t=256,r=t-1,s=Math.floor(n/t/t/t)/r,i=Math.floor(n/t/t)%t/r,o=Math.floor(n/t)%t/r,a=n%t/r;return e[0]=s*256*255+i*255,e[1]=o*256*255+a*255,e}function Qt(n){let e=0;const t=256,r=t-1;return e+=Math.round(n[0]*t*t*t*r),e+=Math.round(n[1]*t*t*r),e+=Math.round(n[2]*t*r),e+=Math.round(n[3]*r),e}function Pe(n,e,t,r){let s=0;for(const i in e){const o=e[i],a=o.callback.call(t,t.feature);let c=a?.[0]??a;c===pe&&console.warn('The "has" operator might return false positives.'),c===void 0?c=pe:c===null&&(c=0),n[r+s++]=c,!(!o.size||o.size===1)&&(n[r+s++]=a[1],!(o.size<3)&&(n[r+s++]=a[2],!(o.size<4)&&(n[r+s++]=a[3])))}return s}function te(n){return Object.keys(n).reduce((e,t)=>e+(n[t].size||1),0)}function er(n,e,t,r){const s=(2+te(t))*n.geometriesCount;(!e||e.length!==s)&&(e=new Float32Array(s));const i=[];let o=0;for(const a in n.entries){const c=n.entries[a];for(let l=0,u=c.flatCoordss.length;l<u;l++)i[0]=c.flatCoordss[l][0],i[1]=c.flatCoordss[l][1],fe(r,i),e[o++]=i[0],e[o++]=i[1],o+=Pe(e,t,c,o)}return e}function tr(n,e,t,r){const s=3*n.verticesCount+(1+te(t))*n.geometriesCount;(!e||e.length!==s)&&(e=new Float32Array(s));const i=[];let o=0;for(const a in n.entries){const c=n.entries[a];for(let l=0,u=c.flatCoordss.length;l<u;l++){i.length=c.flatCoordss[l].length,Oe(c.flatCoordss[l],0,i.length,3,r,i,3),o+=Pe(e,t,c,o),e[o++]=i.length/3;for(let h=0,f=i.length;h<f;h+=3)e[o++]=i[h],e[o++]=i[h+1],e[o++]=i[h+2]}}return e}function rr(n,e,t,r){const s=2*n.verticesCount+(1+te(t))*n.geometriesCount+n.ringsCount;(!e||e.length!==s)&&(e=new Float32Array(s));const i=[];let o=0;for(const a in n.entries){const c=n.entries[a];for(let l=0,u=c.flatCoordss.length;l<u;l++){i.length=c.flatCoordss[l].length,Oe(c.flatCoordss[l],0,i.length,2,r,i),o+=Pe(e,t,c,o),e[o++]=c.ringsVerticesCounts[l].length;for(let h=0,f=c.ringsVerticesCounts[l].length;h<f;h++)e[o++]=c.ringsVerticesCounts[l][h];for(let h=0,f=i.length;h<f;h+=2)e[o++]=i[h],e[o++]=i[h+1]}}return e}function Q(n){return(JSON.stringify(n).split("").reduce((t,r)=>(t<<5)-t+r.charCodeAt(0),0)>>>0).toString()}function Re(n,e,t,r){if(`${r}radius`in n&&r!=="icon-"){let s=d(t,n[`${r}radius`],_);if(`${r}radius2`in n){const i=d(t,n[`${r}radius2`],_);s=`max(${s}, ${i})`}`${r}stroke-width`in n&&(s=`(${s} + ${d(t,n[`${r}stroke-width`],_)} * 0.5)`),e.setSymbolSizeExpression(`vec2(${s} * 2. + 0.5)`)}if(`${r}scale`in n){const s=d(t,n[`${r}scale`],B);e.setSymbolSizeExpression(`${e.getSymbolSizeExpression()} * ${s}`)}`${r}displacement`in n&&e.setSymbolOffsetExpression(d(t,n[`${r}displacement`],D)),`${r}rotation`in n&&e.setSymbolRotationExpression(d(t,n[`${r}rotation`],_)),`${r}rotate-with-view`in n&&e.setSymbolRotateWithView(!!n[`${r}rotate-with-view`])}function qe(n,e,t,r,s){let i="vec4(0.)";if(e!==null&&(i=e),t!==null&&r!==null){const c=`smoothstep(-${r} + 0.63, -${r} - 0.58, ${n})`;i=`mix(${t}, ${i}, ${c})`}const o=`(1.0 - smoothstep(-0.63, 0.58, ${n}))`;let a=`${i} * vec4(1.0, 1.0, 1.0, ${o})`;return s!==null&&(a=`${a} * vec4(1.0, 1.0, 1.0, ${s})`),a}function Se(n,e,t,r,s){const i=new Image;i.crossOrigin=n[`${r}cross-origin`]===void 0?"anonymous":n[`${r}cross-origin`],ee(typeof n[`${r}src`]=="string",`WebGL layers do not support expressions for the ${r}src style property`),i.src=n[`${r}src`],t[`u_texture${s}_size`]=()=>i.complete?[i.width,i.height]:[0,0],e.addUniform(`u_texture${s}_size`,"vec2");const o=`u_texture${s}_size`;return t[`u_texture${s}`]=i,e.addUniform(`u_texture${s}`,"sampler2D"),o}function be(n,e,t,r,s){let i=d(t,n[`${e}offset`],B);if(`${e}offset-origin`in n)switch(n[`${e}offset-origin`]){case"top-right":i=`vec2(${r}.x, 0.) + ${s} * vec2(-1., 0.) + ${i} * vec2(-1., 1.)`;break;case"bottom-left":i=`vec2(0., ${r}.y) + ${s} * vec2(0., -1.) + ${i} * vec2(1., -1.)`;break;case"bottom-right":i=`${r} - ${s} - ${i}`;break}return i}function nr(n,e,t,r){r.functions.circleDistanceField=`float circleDistanceField(vec2 point, float radius) {
  return length(point) - radius;
}`,Re(n,e,r,"circle-");let s=null;"circle-opacity"in n&&(s=d(r,n["circle-opacity"],_));let i="coordsPx";"circle-scale"in n&&(i=`coordsPx / ${d(r,n["circle-scale"],B)}`);let o=null;"circle-fill-color"in n&&(o=d(r,n["circle-fill-color"],T));let a=null;"circle-stroke-color"in n&&(a=d(r,n["circle-stroke-color"],T));let c=d(r,n["circle-radius"],_),l=null;"circle-stroke-width"in n&&(l=d(r,n["circle-stroke-width"],_),c=`(${c} + ${l} * 0.5)`);const u=`circleDistanceField(${i}, ${c})`,h=qe(u,o,a,l,s);e.setSymbolColorExpression(h)}function ir(n,e,t,r){r.functions.round=`float round(float v) {
  return sign(v) * floor(abs(v) + 0.5);
}`,r.functions.starDistanceField=`float starDistanceField(vec2 point, float numPoints, float radius, float radius2, float angle) {
  float startAngle = -PI * 0.5 + angle; // tip starts upwards and rotates clockwise with angle
  float c = cos(startAngle);
  float s = sin(startAngle);
  vec2 pointRotated = vec2(c * point.x - s * point.y, s * point.x + c * point.y);
  float alpha = TWO_PI / numPoints; // the angle of one sector
  float beta = atan(pointRotated.y, pointRotated.x);
  float gamma = round(beta / alpha) * alpha; // angle in sector
  c = cos(-gamma);
  s = sin(-gamma);
  vec2 inSector = vec2(c * pointRotated.x - s * pointRotated.y, abs(s * pointRotated.x + c * pointRotated.y));
  vec2 tipToPoint = inSector + vec2(-radius, 0.);
  vec2 edgeNormal = vec2(radius2 * sin(alpha * 0.5), -radius2 * cos(alpha * 0.5) + radius);
  return dot(normalize(edgeNormal), tipToPoint);
}`,r.functions.regularDistanceField=`float regularDistanceField(vec2 point, float numPoints, float radius, float angle) {
  float startAngle = -PI * 0.5 + angle; // tip starts upwards and rotates clockwise with angle
  float c = cos(startAngle);
  float s = sin(startAngle);
  vec2 pointRotated = vec2(c * point.x - s * point.y, s * point.x + c * point.y);
  float alpha = TWO_PI / numPoints; // the angle of one sector
  float radiusIn = radius * cos(PI / numPoints);
  float beta = atan(pointRotated.y, pointRotated.x);
  float gamma = round((beta - alpha * 0.5) / alpha) * alpha + alpha * 0.5; // angle in sector from mid
  c = cos(-gamma);
  s = sin(-gamma);
  vec2 inSector = vec2(c * pointRotated.x - s * pointRotated.y, abs(s * pointRotated.x + c * pointRotated.y));
  return inSector.x - radiusIn;
}`,Re(n,e,r,"shape-");let s=null;"shape-opacity"in n&&(s=d(r,n["shape-opacity"],_));let i="coordsPx";"shape-scale"in n&&(i=`coordsPx / ${d(r,n["shape-scale"],B)}`);let o=null;"shape-fill-color"in n&&(o=d(r,n["shape-fill-color"],T));let a=null;"shape-stroke-color"in n&&(a=d(r,n["shape-stroke-color"],T));let c=null;"shape-stroke-width"in n&&(c=d(r,n["shape-stroke-width"],_));const l=d(r,n["shape-points"],_);let u="0.";"shape-angle"in n&&(u=d(r,n["shape-angle"],_));let h,f=d(r,n["shape-radius"],_);if(c!==null&&(f=`${f} + ${c} * 0.5`),"shape-radius2"in n){let m=d(r,n["shape-radius2"],_);c!==null&&(m=`${m} + ${c} * 0.5`),h=`starDistanceField(${i}, ${l}, ${f}, ${m}, ${u})`}else h=`regularDistanceField(${i}, ${l}, ${f}, ${u})`;const x=qe(h,o,a,c,s);e.setSymbolColorExpression(x)}function sr(n,e,t,r){let s="vec4(1.0)";"icon-color"in n&&(s=d(r,n["icon-color"],T)),"icon-opacity"in n&&(s=`${s} * vec4(1.0, 1.0, 1.0, ${d(r,n["icon-opacity"],_)})`);const i=Q(n["icon-src"]),o=Se(n,e,t,"icon-",i);if(e.setSymbolColorExpression(`${s} * texture2D(u_texture${i}, v_texCoord)`).setSymbolSizeExpression(o),"icon-width"in n&&"icon-height"in n&&e.setSymbolSizeExpression(`vec2(${d(r,n["icon-width"],_)}, ${d(r,n["icon-height"],_)})`),"icon-offset"in n&&"icon-size"in n){const a=d(r,n["icon-size"],D),c=e.getSymbolSizeExpression();e.setSymbolSizeExpression(a);const l=be(n,"icon-",r,"v_quadSizePx",a);e.setTextureCoordinateExpression(`(vec4((${l}).xyxy) + vec4(0., 0., ${a})) / (${c}).xyxy`)}if(Re(n,e,r,"icon-"),"icon-anchor"in n){const a=d(r,n["icon-anchor"],D);let c="1.0";"icon-scale"in n&&(c=d(r,n["icon-scale"],B));let l;n["icon-anchor-x-units"]==="pixels"&&n["icon-anchor-y-units"]==="pixels"?l=`${a} * ${c}`:n["icon-anchor-x-units"]==="pixels"?l=`${a} * vec2(vec2(${c}).x, v_quadSizePx.y)`:n["icon-anchor-y-units"]==="pixels"?l=`${a} * vec2(v_quadSizePx.x, vec2(${c}).x)`:l=`${a} * v_quadSizePx`;let u=`v_quadSizePx * vec2(0.5, -0.5) + ${l} * vec2(-1., 1.)`;if("icon-anchor-origin"in n)switch(n["icon-anchor-origin"]){case"top-right":u=`v_quadSizePx * -0.5 + ${l}`;break;case"bottom-left":u=`v_quadSizePx * 0.5 - ${l}`;break;case"bottom-right":u=`v_quadSizePx * vec2(-0.5, 0.5) + ${l} * vec2(1., -1.)`;break}e.setSymbolOffsetExpression(`${e.getSymbolOffsetExpression()} + ${u}`)}}function or(n,e,t,r){if("stroke-color"in n&&e.setStrokeColorExpression(d(r,n["stroke-color"],T)),"stroke-pattern-src"in n){const s=Q(n["stroke-pattern-src"]),i=Se(n,e,t,"stroke-pattern-",s);let o=i,a="vec2(0.)";"stroke-pattern-offset"in n&&"stroke-pattern-size"in n&&(o=d(r,n["stroke-pattern-size"],D),a=be(n,"stroke-pattern-",r,i,o));let c="0.";"stroke-pattern-spacing"in n&&(c=d(r,n["stroke-pattern-spacing"],_));let l="0.";"stroke-pattern-start-offset"in n&&(l=d(r,n["stroke-pattern-start-offset"],_)),r.functions.sampleStrokePattern=`vec4 sampleStrokePattern(sampler2D texture, vec2 textureSize, vec2 textureOffset, vec2 sampleSize, float spacingPx, float startOffsetPx, float currentLengthPx, float currentRadiusRatio, float lineWidth) {
  float currentLengthScaled = (currentLengthPx - startOffsetPx) * sampleSize.y / lineWidth;
  float spacingScaled = spacingPx * sampleSize.y / lineWidth;
  float uCoordPx = mod(currentLengthScaled, (sampleSize.x + spacingScaled));
  float isInsideOfPattern = step(uCoordPx, sampleSize.x);
  float vCoordPx = (-currentRadiusRatio * 0.5 + 0.5) * sampleSize.y;
  // make sure that we're not sampling too close to the borders to avoid interpolation with outside pixels
  uCoordPx = clamp(uCoordPx, 0.5, sampleSize.x - 0.5);
  vCoordPx = clamp(vCoordPx, 0.5, sampleSize.y - 0.5);
  vec2 texCoord = (vec2(uCoordPx, vCoordPx) + textureOffset) / textureSize;
  return texture2D(texture, texCoord) * vec4(1.0, 1.0, 1.0, isInsideOfPattern);
}`;const u=`u_texture${s}`;let h="1.";"stroke-color"in n&&(h=e.getStrokeColorExpression()),e.setStrokeColorExpression(`${h} * sampleStrokePattern(${u}, ${i}, ${a}, ${o}, ${c}, ${l}, currentLengthPx, currentRadiusRatio, v_width)`),r.functions.computeStrokePatternLength=`float computeStrokePatternLength(vec2 sampleSize, float spacingPx, float lineWidth) {
  float patternLengthPx = sampleSize.x / sampleSize.y * lineWidth;
  return patternLengthPx + spacingPx;
}`,e.setStrokePatternLengthExpression(`computeStrokePatternLength(${o}, ${c}, v_width)`)}if("stroke-width"in n&&e.setStrokeWidthExpression(d(r,n["stroke-width"],_)),"stroke-offset"in n&&e.setStrokeOffsetExpression(d(r,n["stroke-offset"],_)),"stroke-line-cap"in n&&e.setStrokeCapExpression(d(r,n["stroke-line-cap"],M)),"stroke-line-join"in n&&e.setStrokeJoinExpression(d(r,n["stroke-line-join"],M)),"stroke-miter-limit"in n&&e.setStrokeMiterLimitExpression(d(r,n["stroke-miter-limit"],_)),"stroke-line-dash"in n){r.functions.getSingleDashDistance=`float getSingleDashDistance(float distance, float radius, float dashOffset, float dashLength, float dashLengthTotal, float capType, float lineWidth) {
  float localDistance = mod(distance, dashLengthTotal);
  float distanceSegment = abs(localDistance - dashOffset - dashLength * 0.5) - dashLength * 0.5;
  distanceSegment = min(distanceSegment, dashLengthTotal - localDistance);
  if (capType == ${A("square")}) {
    distanceSegment -= lineWidth * 0.5;
  } else if (capType == ${A("round")}) {
    distanceSegment = min(distanceSegment, sqrt(distanceSegment * distanceSegment + radius * radius) - lineWidth * 0.5);
  }
  return distanceSegment;
}`;let s=n["stroke-line-dash"].map(m=>d(r,m,_));s.length%2===1&&(s=[...s,...s]);let i="0.";"stroke-line-dash-offset"in n&&(i=d(r,n["stroke-line-dash-offset"],_));const a=`dashDistanceField_${Q(n["stroke-line-dash"])}`,c=s.map((m,N)=>`float dashLength${N}`).join(", "),l=s.map((m,N)=>`dashLength${N}`).join(" + ");let u="0.",h=`getSingleDashDistance(distance, radius, ${u}, dashLength0, totalDashLength, capType, lineWidth)`;for(let m=2;m<s.length;m+=2)u=`${u} + dashLength${m-2} + dashLength${m-1}`,h=`min(${h}, getSingleDashDistance(distance, radius, ${u}, dashLength${m}, totalDashLength, capType, lineWidth))`;r.functions[a]=`float ${a}(float distance, float radius, float capType, float lineWidth, ${c}) {
  float totalDashLength = ${l};
  return ${h};
}`;const f=s.map((m,N)=>`${m}`).join(", ");e.setStrokeDistanceFieldExpression(`${a}(currentLengthPx + ${i}, currentRadiusPx, capType, v_width, ${f})`);let x=s.join(" + ");e.getStrokePatternLengthExpression()&&(r.functions.combinePatternLengths=`float combinePatternLengths(float patternLength1, float patternLength2) {
  return patternLength1 * patternLength2;
}`,x=`combinePatternLengths(${e.getStrokePatternLengthExpression()}, ${x})`),e.setStrokePatternLengthExpression(x)}}function ar(n,e,t,r){if("fill-color"in n&&e.setFillColorExpression(d(r,n["fill-color"],T)),"fill-pattern-src"in n){const s=Q(n["fill-pattern-src"]),i=Se(n,e,t,"fill-pattern-",s);let o=i,a="vec2(0.)";"fill-pattern-offset"in n&&"fill-pattern-size"in n&&(o=d(r,n["fill-pattern-size"],D),a=be(n,"fill-pattern-",r,i,o)),r.functions.sampleFillPattern=`vec4 sampleFillPattern(sampler2D texture, vec2 textureSize, vec2 textureOffset, vec2 sampleSize, vec2 pxOrigin, vec2 pxPosition) {
  float scaleRatio = pow(2., mod(u_zoom + 0.5, 1.) - 0.5);
  vec2 pxRelativePos = pxPosition - pxOrigin;
  // rotate the relative position from origin by the current view rotation
  pxRelativePos = vec2(pxRelativePos.x * cos(u_rotation) - pxRelativePos.y * sin(u_rotation), pxRelativePos.x * sin(u_rotation) + pxRelativePos.y * cos(u_rotation));
  // sample position is computed according to the sample offset & size
  vec2 samplePos = mod(pxRelativePos / scaleRatio, sampleSize);
  // also make sure that we're not sampling too close to the borders to avoid interpolation with outside pixels
  samplePos = clamp(samplePos, vec2(0.5), sampleSize - vec2(0.5));
  samplePos.y = sampleSize.y - samplePos.y; // invert y axis so that images appear upright
  return texture2D(texture, (samplePos + textureOffset) / textureSize);
}`;const c=`u_texture${s}`;let l="1.";"fill-color"in n&&(l=e.getFillColorExpression()),e.setFillColorExpression(`${l} * sampleFillPattern(${c}, ${i}, ${a}, ${o}, pxOrigin, pxPos)`)}}function Ne(n,e,t){const r=ze(),s=new Ze,i={};if("icon-src"in n?sr(n,s,i,r):"shape-points"in n?ir(n,s,i,r):"circle-radius"in n&&nr(n,s,i,r),or(n,s,i,r),ar(n,s,i,r),t){const c=d(r,t,G);s.setFragmentDiscardExpression(`!${c}`)}const o={};function a(c,l,u,h){if(!r[c])return;const f=_e(u),x=ye(u);s.addAttribute(`a_${l}`,f),o[l]={size:x,callback:h}}return a("geometryType",We,M,c=>z(lt(c.getGeometry()))),a("featureId",je,M|_,c=>{const l=c.getId()??null;return typeof l=="string"?z(l):l}),He(s,r),{builder:s,attributes:{...o,...Ve(r)},uniforms:{...i,...Xe(r,e)}}}const lr=[];let ce;function cr(){return ce||(ce=Yt()),ce}let ur=0;const y={POSITION:"a_position",LOCAL_POSITION:"a_localPosition",SEGMENT_START:"a_segmentStart",SEGMENT_END:"a_segmentEnd",MEASURE_START:"a_measureStart",MEASURE_END:"a_measureEnd",ANGLE_TANGENT_SUM:"a_angleTangentSum",JOIN_ANGLES:"a_joinAngles",DISTANCE_LOW:"a_distanceLow",DISTANCE_HIGH:"a_distanceHigh"};class hr{constructor(e,t,r,s){this.helper_,this.hitDetectionEnabled_=!!s,this.styleShaders=fr(e,t),this.customAttributes_={},this.uniforms_={},this.hitDetectionEnabled_&&(this.customAttributes_.hitColor={callback(){return Jt(this.ref,lr)},size:2});for(const i of this.styleShaders){for(const o in i.attributes)o in this.customAttributes_||(this.customAttributes_[o]=i.attributes[o]);for(const o in i.uniforms)o in this.uniforms_||(this.uniforms_[o]=i.uniforms[o])}this.renderPasses_=this.styleShaders.map(i=>{const o={},a=Object.entries(this.customAttributes_).map(([c,l])=>({name:c in i.attributes||c==="hitColor"?`a_${c}`:null,size:l.size||1,type:E.FLOAT}));return i.builder.getFillVertexShader()&&(o.fillRenderPass={vertexShader:i.builder.getFillVertexShader(),fragmentShader:i.builder.getFillFragmentShader(),attributesDesc:[{name:y.POSITION,size:2,type:E.FLOAT},...a],instancedAttributesDesc:[],instancePrimitiveVertexCount:3}),i.builder.getStrokeVertexShader()&&(o.strokeRenderPass={vertexShader:i.builder.getStrokeVertexShader(),fragmentShader:i.builder.getStrokeFragmentShader(),attributesDesc:[{name:y.LOCAL_POSITION,size:2,type:E.FLOAT}],instancedAttributesDesc:[{name:y.SEGMENT_START,size:2,type:E.FLOAT},{name:y.MEASURE_START,size:1,type:E.FLOAT},{name:y.SEGMENT_END,size:2,type:E.FLOAT},{name:y.MEASURE_END,size:1,type:E.FLOAT},{name:y.JOIN_ANGLES,size:2,type:E.FLOAT},{name:y.DISTANCE_LOW,size:1,type:E.FLOAT},{name:y.DISTANCE_HIGH,size:1,type:E.FLOAT},{name:y.ANGLE_TANGENT_SUM,size:1,type:E.FLOAT},...a],instancePrimitiveVertexCount:6}),i.builder.getSymbolVertexShader()&&(o.symbolRenderPass={vertexShader:i.builder.getSymbolVertexShader(),fragmentShader:i.builder.getSymbolFragmentShader(),attributesDesc:[{name:y.LOCAL_POSITION,size:2,type:E.FLOAT}],instancedAttributesDesc:[{name:y.POSITION,size:2,type:E.FLOAT},...a],instancePrimitiveVertexCount:6}),o}),this.hasFill_=this.renderPasses_.some(i=>i.fillRenderPass),this.hasStroke_=this.renderPasses_.some(i=>i.strokeRenderPass),this.hasSymbol_=this.renderPasses_.some(i=>i.symbolRenderPass),this.setHelper(r)}async generateBuffers(e,t){if(e.isEmpty())return null;const r=this.generateRenderInstructions_(e,t),[s,i,o]=await Promise.all([this.generateBuffersForType_(r.polygonInstructions,"Polygon",t),this.generateBuffersForType_(r.lineStringInstructions,"LineString",t),this.generateBuffersForType_(r.pointInstructions,"Point",t)]),a=de($(),t);return{polygonBuffers:s,lineStringBuffers:i,pointBuffers:o,invertVerticesTransform:a}}generateRenderInstructions_(e,t){const r=this.hasFill_?rr(e.polygonBatch,new Float32Array(0),this.customAttributes_,t):null,s=this.hasStroke_?tr(e.lineStringBatch,new Float32Array(0),this.customAttributes_,t):null,i=this.hasSymbol_?er(e.pointBatch,new Float32Array(0),this.customAttributes_,t):null;return{polygonInstructions:r,lineStringInstructions:s,pointInstructions:i}}generateBuffersForType_(e,t,r){if(e===null)return null;const s=ur++;let i;switch(t){case"Polygon":i=le.GENERATE_POLYGON_BUFFERS;break;case"LineString":i=le.GENERATE_LINE_STRING_BUFFERS;break;case"Point":i=le.GENERATE_POINT_BUFFERS;break}const o={id:s,type:i,renderInstructions:e.buffer,renderInstructionsTransform:r,customAttributesSize:te(this.customAttributes_)},a=cr();return a.postMessage(o,[e.buffer]),e=null,new Promise(c=>{const l=u=>{const h=u.data;if(h.id!==s||(a.removeEventListener("message",l),!this.helper_.getGL()))return;const f=new ie(xe,ne).fromArrayBuffer(h.indicesBuffer),x=new ie(K,ne).fromArrayBuffer(h.vertexAttributesBuffer),m=new ie(K,ne).fromArrayBuffer(h.instanceAttributesBuffer);this.helper_.flushBufferData(f),this.helper_.flushBufferData(x),this.helper_.flushBufferData(m),c([f,x,m])};a.addEventListener("message",l)})}render(e,t,r){for(const s of this.renderPasses_)s.fillRenderPass&&this.renderInternal_(e.polygonBuffers[0],e.polygonBuffers[1],e.polygonBuffers[2],s.fillRenderPass,t,r),s.strokeRenderPass&&this.renderInternal_(e.lineStringBuffers[0],e.lineStringBuffers[1],e.lineStringBuffers[2],s.strokeRenderPass,t,r),s.symbolRenderPass&&this.renderInternal_(e.pointBuffers[0],e.pointBuffers[1],e.pointBuffers[2],s.symbolRenderPass,t,r)}renderInternal_(e,t,r,s,i,o){const a=e.getSize();if(a===0)return;const c=s.instancedAttributesDesc.length;if(this.helper_.useProgram(s.program,i),this.helper_.bindBuffer(t),this.helper_.bindBuffer(e),this.helper_.enableAttributes(s.attributesDesc),this.helper_.bindBuffer(r),this.helper_.enableAttributesInstanced(s.instancedAttributesDesc),o(),c){const l=s.instancedAttributesDesc.reduce((h,f)=>h+(f.size||1),0),u=r.getSize()/l;this.helper_.drawElementsInstanced(0,a,u)}else this.helper_.drawElements(0,a)}setHelper(e,t=null){this.helper_=e;for(const r of this.renderPasses_)r.fillRenderPass&&(r.fillRenderPass.program=this.helper_.getProgram(r.fillRenderPass.fragmentShader,r.fillRenderPass.vertexShader)),r.strokeRenderPass&&(r.strokeRenderPass.program=this.helper_.getProgram(r.strokeRenderPass.fragmentShader,r.strokeRenderPass.vertexShader)),r.symbolRenderPass&&(r.symbolRenderPass.program=this.helper_.getProgram(r.symbolRenderPass.fragmentShader,r.symbolRenderPass.vertexShader));this.helper_.addUniforms(this.uniforms_),t&&(t.polygonBuffers&&(this.helper_.flushBufferData(t.polygonBuffers[0]),this.helper_.flushBufferData(t.polygonBuffers[1]),this.helper_.flushBufferData(t.polygonBuffers[2])),t.lineStringBuffers&&(this.helper_.flushBufferData(t.lineStringBuffers[0]),this.helper_.flushBufferData(t.lineStringBuffers[1]),this.helper_.flushBufferData(t.lineStringBuffers[2])),t.pointBuffers&&(this.helper_.flushBufferData(t.pointBuffers[0]),this.helper_.flushBufferData(t.pointBuffers[1]),this.helper_.flushBufferData(t.pointBuffers[2])))}}function fr(n,e){const t=Array.isArray(n)?n:[n];if("style"in t[0]){const r=[],s=t,i=[];for(const o of s){const a=Array.isArray(o.style)?o.style:[o.style];let c=o.filter;o.else&&i.length&&(c=["all",...i.map(u=>["!",u])],o.filter&&c.push(o.filter),c.length<3&&(c=c[1])),o.filter&&i.push(o.filter);const l=a.map(u=>Ne(u,e,c));r.push(...l)}return r}return"builder"in t[0]?t:t.map(r=>Ne(r,e,null))}const P=new Uint8Array(4);class dr{constructor(e,t){this.helper_=e;const r=e.getGL();this.texture_=r.createTexture(),this.framebuffer_=r.createFramebuffer(),this.depthbuffer_=r.createRenderbuffer(),this.size_=t||[1,1],this.data_=new Uint8Array(0),this.dataCacheDirty_=!0,this.updateSize_()}setSize(e){ct(e,this.size_)||(this.size_[0]=e[0],this.size_[1]=e[1],this.updateSize_())}getSize(){return this.size_}clearCachedData(){this.dataCacheDirty_=!0}readAll(){if(this.dataCacheDirty_){const e=this.size_,t=this.helper_.getGL();t.bindFramebuffer(t.FRAMEBUFFER,this.framebuffer_),t.readPixels(0,0,e[0],e[1],t.RGBA,t.UNSIGNED_BYTE,this.data_),this.dataCacheDirty_=!1}return this.data_}readPixel(e,t){if(e<0||t<0||e>this.size_[0]||t>=this.size_[1])return P[0]=0,P[1]=0,P[2]=0,P[3]=0,P;this.readAll();const r=Math.floor(e)+(this.size_[1]-Math.floor(t)-1)*this.size_[0];return P[0]=this.data_[r*4],P[1]=this.data_[r*4+1],P[2]=this.data_[r*4+2],P[3]=this.data_[r*4+3],P}getTexture(){return this.texture_}getFramebuffer(){return this.framebuffer_}getDepthbuffer(){return this.depthbuffer_}updateSize_(){const e=this.size_,t=this.helper_.getGL();this.texture_=this.helper_.createTexture(e,null,this.texture_),t.bindFramebuffer(t.FRAMEBUFFER,this.framebuffer_),t.viewport(0,0,e[0],e[1]),t.framebufferTexture2D(t.FRAMEBUFFER,t.COLOR_ATTACHMENT0,t.TEXTURE_2D,this.texture_,0),t.bindRenderbuffer(t.RENDERBUFFER,this.depthbuffer_),t.renderbufferStorage(t.RENDERBUFFER,t.DEPTH_COMPONENT16,e[0],e[1]),t.framebufferRenderbuffer(t.FRAMEBUFFER,t.DEPTH_ATTACHMENT,t.RENDERBUFFER,this.depthbuffer_),this.data_=new Uint8Array(e[0]*e[1]*4)}}function gr(n,e){const t=n.viewState.projection,s=e.getSource().getWrapX()&&t.canWrapX(),i=t.getExtent(),o=n.extent,a=s?ut(i):null,c=s?Math.ceil((o[2]-i[2])/a)+1:1;return[s?Math.floor((o[0]-i[0])/a):0,c,a]}const k={...b,RENDER_EXTENT:"u_renderExtent",PATTERN_ORIGIN:"u_patternOrigin",GLOBAL_ALPHA:"u_globalAlpha"};class pr extends me{constructor(e,t){const r={[k.RENDER_EXTENT]:[0,0,0,0],[k.PATTERN_ORIGIN]:[0,0],[k.GLOBAL_ALPHA]:1};super(e,{uniforms:r,postProcesses:t.postProcesses}),this.hitDetectionEnabled_=!t.disableHitDetection,this.hitRenderTarget_,this.sourceRevision_=-1,this.previousExtent_=ht(),this.currentTransform_=$(),this.tmpCoords_=[0,0],this.tmpTransform_=$(),this.tmpMat4_=ke(),this.currentFrameStateTransform_=$(),this.styleVariables_={},this.style_=[],this.styleRenderer_=null,this.buffers_=null,this.applyOptions_(t),this.batch_=new J,this.initialFeaturesAdded_=!1,this.sourceListenKeys_=null}addInitialFeatures_(e){const t=this.getLayer().getSource();let r;this.batch_.addFeatures(t.getFeatures(),r),this.sourceListenKeys_=[W(t,H.ADDFEATURE,this.handleSourceFeatureAdded_.bind(this,r)),W(t,H.CHANGEFEATURE,this.handleSourceFeatureChanged_.bind(this,r),this),W(t,H.REMOVEFEATURE,this.handleSourceFeatureDelete_,this),W(t,H.CLEAR,this.handleSourceFeatureClear_,this)]}applyOptions_(e){this.styleVariables_=e.variables,this.style_=e.style}createRenderers_(){this.buffers_=null,this.styleRenderer_=new hr(this.style_,this.styleVariables_,this.helper,this.hitDetectionEnabled_)}reset(e){this.applyOptions_(e),this.helper&&this.createRenderers_(),super.reset(e)}afterHelperCreated(){this.styleRenderer_?this.styleRenderer_.setHelper(this.helper,this.buffers_):this.createRenderers_(),this.hitDetectionEnabled_&&(this.hitRenderTarget_=new dr(this.helper))}handleSourceFeatureAdded_(e,t){const r=t.feature;this.batch_.addFeature(r,e)}handleSourceFeatureChanged_(e,t){const r=t.feature;this.batch_.changeFeature(r,e)}handleSourceFeatureDelete_(e){const t=e.feature;this.batch_.removeFeature(t)}handleSourceFeatureClear_(){this.batch_.clear()}applyUniforms_(e){ft(this.tmpTransform_,this.currentFrameStateTransform_),dt(this.tmpTransform_,e),this.helper.setUniformMatrixValue(k.PROJECTION_MATRIX,ge(this.tmpMat4_,this.tmpTransform_)),de(this.tmpTransform_,this.tmpTransform_),this.helper.setUniformMatrixValue(k.SCREEN_TO_WORLD_MATRIX,ge(this.tmpMat4_,this.tmpTransform_)),this.tmpCoords_[0]=0,this.tmpCoords_[1]=0,de(this.tmpTransform_,e),fe(this.tmpTransform_,this.tmpCoords_),this.helper.setUniformFloatVec2(k.PATTERN_ORIGIN,this.tmpCoords_)}renderFrame(e){const t=this.helper.getGL();this.preRender(t,e);const[r,s,i]=gr(e,this.getLayer());this.helper.prepareDraw(e),this.renderWorlds(e,!1,r,s,i),this.helper.finalizeDraw(e,this.dispatchPreComposeEvent,this.dispatchPostComposeEvent);const o=this.helper.getCanvas();return this.hitDetectionEnabled_&&(this.renderWorlds(e,!0,r,s,i),this.hitRenderTarget_.clearCachedData()),this.postRender(t,e),o}prepareFrameInternal(e){this.initialFeaturesAdded_||(this.addInitialFeatures_(e),this.initialFeaturesAdded_=!0);const t=this.getLayer(),r=t.getSource(),s=e.viewState,i=!e.viewHints[Fe.ANIMATING]&&!e.viewHints[Fe.INTERACTING],o=!gt(this.previousExtent_,e.extent),a=this.sourceRevision_<r.getRevision();if(a&&(this.sourceRevision_=r.getRevision()),i&&(o||a)){const c=s.projection,l=s.resolution,u=t instanceof Ue?t.getRenderBuffer():0,h=pt(e.extent,u*l);r.loadFeatures(h,l,c),this.ready=!1;const f=this.helper.makeProjectionTransform(e,$());this.styleRenderer_.generateBuffers(this.batch_,f).then(x=>{this.buffers_&&this.disposeBuffers(this.buffers_),this.buffers_=x,this.ready=!0,this.getLayer().changed()}),this.previousExtent_=e.extent.slice()}return!0}renderWorlds(e,t,r,s,i){let o=r;t&&(this.hitRenderTarget_.setSize([Math.floor(e.size[0]/2),Math.floor(e.size[1]/2)]),this.helper.prepareDrawToRenderTarget(e,this.hitRenderTarget_,!0));do this.helper.makeProjectionTransform(e,this.currentFrameStateTransform_),_t(this.currentFrameStateTransform_,o*i,0),this.buffers_&&this.styleRenderer_.render(this.buffers_,e,()=>{this.applyUniforms_(this.buffers_.invertVerticesTransform),this.helper.applyHitDetectionUniform(t)});while(++o<s)}forEachFeatureAtCoordinate(e,t,r,s,i){if(ee(this.hitDetectionEnabled_,"`forEachFeatureAtCoordinate` cannot be used on a WebGL layer if the hit detection logic has been disabled using the `disableHitDetection: true` option."),!this.styleRenderer_||!this.hitDetectionEnabled_)return;const o=fe(t.coordinateToPixelTransform,e.slice()),a=this.hitRenderTarget_.readPixel(o[0]/2,o[1]/2),c=[a[0]/255,a[1]/255,a[2]/255,a[3]/255],l=Qt(c),u=this.batch_.getFeatureFromRef(l);if(u)return s(u,this.getLayer(),null)}disposeBuffers(e){const t=r=>{for(const s of r)s&&this.helper.deleteBuffer(s)};e.pointBuffers&&t(e.pointBuffers),e.lineStringBuffers&&t(e.lineStringBuffers),e.polygonBuffers&&t(e.polygonBuffers)}disposeInternal(){this.buffers_&&this.disposeBuffers(this.buffers_),this.sourceListenKeys_&&(this.sourceListenKeys_.forEach(function(e){xt(e)}),this.sourceListenKeys_=null),super.disposeInternal()}renderDeclutter(){}}const R={BLUR:"blur",GRADIENT:"gradient",RADIUS:"radius"},_r=["#00f","#0ff","#0f0","#ff0","#f00"];class xr extends Ue{constructor(e){e=e||{};const t=Object.assign({},e);delete t.gradient,delete t.radius,delete t.blur,delete t.weight,super(t),this.filter_=e.filter??!0,this.styleVariables_=e.variables||{},this.gradient_=null,this.addChangeListener(R.GRADIENT,this.handleGradientChanged_),this.setGradient(e.gradient?e.gradient:_r),this.setBlur(e.blur!==void 0?e.blur:15),this.setRadius(e.radius!==void 0?e.radius:8);const r=e.weight?e.weight:"weight";this.weight_=r,this.setRenderOrder(null)}getBlur(){return this.get(R.BLUR)}getGradient(){return this.get(R.GRADIENT)}getRadius(){return this.get(R.RADIUS)}handleGradientChanged_(){this.gradient_=mr(this.getGradient())}setBlur(e){const t=this.get(R.BLUR);if(this.set(R.BLUR,e),typeof e=="number"&&typeof t=="number"){this.changed();return}this.clearRenderer()}setGradient(e){this.set(R.GRADIENT,e)}setRadius(e){const t=this.get(R.RADIUS);if(this.set(R.RADIUS,e),typeof e=="number"&&typeof t=="number"){this.changed();return}this.clearRenderer()}setFilter(e){this.filter_=e,this.changed(),this.clearRenderer()}setWeight(e){this.weight_=e,this.changed(),this.clearRenderer()}createRenderer(){const e=new Ze,t=ze(),r=d(t,this.filter_,G);let s=d(t,this.getRadius(),_),i=d(t,this.getBlur(),_);const o={};typeof this.getBlur()=="number"&&(i="a_blur",o.a_blur=()=>this.getBlur(),e.addUniform("a_blur","float")),typeof this.getRadius()=="number"&&(s="a_radius",o.a_radius=()=>this.getRadius(),e.addUniform("a_radius","float"));const a={};let c=null;if(typeof this.weight_=="string"||typeof this.weight_=="function"){const h=typeof this.weight_=="string"?f=>f.get(this.weight_):this.weight_;a.prop_weight={size:1,callback:f=>{const x=h(f);return x!==void 0?mt(x,0,1):1}},c="a_prop_weight",e.addAttribute("a_prop_weight","float")}else{const h=["clamp",this.weight_,0,1];c=d(t,h,_)}e.addFragmentShaderFunction(`float getBlurSlope() {
  float blur = max(1., ${i});
  float radius = ${s};
  return radius / blur;
}`).setSymbolSizeExpression(`vec2(${s} + ${i}) * 2.`).setSymbolColorExpression(`vec4(smoothstep(0., 1., (1. - length(coordsPx * 2. / v_quadSizePx)) * getBlurSlope()) * ${c})`).setStrokeColorExpression(`vec4(smoothstep(0., 1., (1. - length(currentRadiusPx * 2. / v_width)) * getBlurSlope()) * ${c})`).setStrokeWidthExpression(`(${s} + ${i}) * 2.`).setFillColorExpression(`vec4(${c})`).setFragmentDiscardExpression(`!${r}`),He(e,t);const l=Ve(t),u=Xe(t,this.styleVariables_);return new pr(this,{className:this.getClassName(),variables:this.styleVariables_,style:{builder:e,attributes:{...l,...a},uniforms:{...u,...o}},disableHitDetection:!1,postProcesses:[{fragmentShader:`
            precision mediump float;

            uniform sampler2D u_image;
            uniform sampler2D u_gradientTexture;
            uniform float u_opacity;

            varying vec2 v_texCoord;

            void main() {
              vec4 color = texture2D(u_image, v_texCoord);
              gl_FragColor.a = color.a * u_opacity;
              gl_FragColor.rgb = texture2D(u_gradientTexture, vec2(0.5, color.a)).rgb;
              gl_FragColor.rgb *= gl_FragColor.a;
            }`,uniforms:{u_gradientTexture:()=>this.gradient_,u_opacity:()=>this.getOpacity()}}]})}updateStyleVariables(e){Object.assign(this.styleVariables_,e),this.changed()}renderDeclutter(){}}function mr(n){const r=Et(1,256),s=r.createLinearGradient(0,0,1,256),i=1/(n.length-1);for(let o=0,a=n.length;o<a;++o)s.addColorStop(o*i,n[o]);return r.fillStyle=s,r.fillRect(0,0,1,256),r.canvas}const S={amk_zeer_hoog:1,amk_hoog:.8,amk_basis:.6,grafheuvel:.8,hunebed:.8,steentijd:.6,uikav:.6,kasteel:.4,ruine:.4};let ue=null,he=!1,Z=null;async function w(n){try{const e=await fetch(n);if(!e.ok)return console.warn(`Kansenkaart: Could not load ${n}`),[];const t=await e.json();return new Pt().readFeatures(t,{dataProjection:"EPSG:4326",featureProjection:"EPSG:3857"})}catch(e){return console.warn(`Kansenkaart: Error loading ${n}:`,e),[]}}function C(n){const e=n.getGeometry();if(!e)return null;if(e.getType()==="Point")return e.getCoordinates();const t=e.getExtent();return[(t[0]+t[2])/2,(t[1]+t[3])/2]}function F(n,e){return new Rt({geometry:new St(n),weight:e})}async function Er(){return ue||(he&&Z||(he=!0,Z=(async()=>{const n=[];console.log("🗺️ Kansenkaart: Loading archaeological data sources...");const[e,t,r,s,i,o,a,c]=await Promise.all([Tt("/detectorapp-nl/data/amk_monumenten_full.topojson").catch(()=>null),w("/detectorapp-nl/data/grafheuvels.geojson"),w("/detectorapp-nl/data/steentijd/hunebedden.geojson"),w("/detectorapp-nl/data/steentijd/euroevol_nl_be.geojson"),w("/detectorapp-nl/data/uikav/uikav_archeo_punten.geojson"),w("/detectorapp-nl/data/kastelen.geojson"),w("/detectorapp-nl/data/ruines_osm.geojson"),w("/detectorapp-nl/data/geomorfologie_hotspots.geojson")]);if(e){const l=yt(e);for(const u of l){const h=C(u);if(!h)continue;const f=(u.get("kwaliteitswaarde")||"").toLowerCase();let x=S.amk_basis;f.includes("zeer hoge")?x=S.amk_zeer_hoog:f.includes("hoge")&&(x=S.amk_hoog),n.push(F(h,x))}console.log(`  ✓ AMK: ${l.length} monumenten`)}for(const l of t){const u=C(l);u&&n.push(F(u,S.grafheuvel))}console.log(`  ✓ Grafheuvels: ${t.length}`);for(const l of r){const u=C(l);u&&n.push(F(u,S.hunebed))}console.log(`  ✓ Hunebedden: ${r.length}`);for(const l of s){const u=C(l);u&&n.push(F(u,S.steentijd))}console.log(`  ✓ Steentijd sites: ${s.length}`);for(const l of i){const u=C(l);u&&n.push(F(u,S.uikav))}console.log(`  ✓ UIKAV punten: ${i.length}`);for(const l of o){const u=C(l);u&&n.push(F(u,S.kasteel))}console.log(`  ✓ Kastelen: ${o.length}`);for(const l of a){const u=C(l);u&&n.push(F(u,S.ruine))}console.log(`  ✓ Ruïnes: ${a.length}`);for(const l of c){const u=C(l);if(u){const h=l.get("weight")||.5;n.push(F(u,h))}}return console.log(`  ✓ Geomorfologie hotspots: ${c.length}`),console.log(`🗺️ Kansenkaart: ${n.length} total weighted points loaded`),ue=n,he=!1,n})()),Z)}async function Tr(){try{console.log("🗺️ Kansenkaart: Starting layer creation...");const n=await Er();console.log(`🗺️ Kansenkaart: Got ${n.length} weighted points`);const e=new vt({features:n}),t=new xr({source:e,properties:{title:"Kansenkaart",type:"heatmap",queryable:!1},visible:!1,opacity:.6,zIndex:5,blur:15,radius:8,weight:r=>r.get("weight")||.5,gradient:["rgba(0,0,255,0)","rgba(0,0,255,0.5)","#00ffff","#00ff00","#ffff00","#ff8800","#ff0000"]});return console.log("✓ Kansenkaart heatmap layer created"),t}catch(n){return console.error("Failed to create Kansenkaart layer:",n),null}}export{Tr as createKansenkaartLayerOL};
//# sourceMappingURL=kansenkaartOL-4PdcS9IV.js.map

var se=Object.defineProperty;var ae=($,g,x)=>g in $?se($,g,{enumerable:!0,configurable:!0,writable:!0,value:x}):$[g]=x;var at=($,g,x)=>ae($,typeof g!="symbol"?g+"":g,x);(function(){"use strict";/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */var At;const $=globalThis,g=$.ShadowRoot&&($.ShadyCSS===void 0||$.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,x=Symbol(),rt=new WeakMap;let ot=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==x)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(g&&t===void 0){const i=e!==void 0&&e.length===1;i&&(t=rt.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&rt.set(e,t))}return t}toString(){return this.cssText}};const Et=a=>new ot(typeof a=="string"?a:a+"",void 0,x),qt=(a,...t)=>{const e=a.length===1?a[0]:t.reduce((i,s,r)=>i+(o=>{if(o._$cssResult$===!0)return o.cssText;if(typeof o=="number")return o;throw Error("Value passed to 'css' function must be a 'css' function result: "+o+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(s)+a[r+1],a[0]);return new ot(e,a,x)},Dt=(a,t)=>{if(g)a.adoptedStyleSheets=t.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const e of t){const i=document.createElement("style"),s=$.litNonce;s!==void 0&&i.setAttribute("nonce",s),i.textContent=e.cssText,a.appendChild(i)}},nt=g?a=>a:a=>a instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return Et(e)})(a):a;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:Lt,defineProperty:kt,getOwnPropertyDescriptor:Pt,getOwnPropertyNames:jt,getOwnPropertySymbols:Ht,getPrototypeOf:Tt}=Object,v=globalThis,ht=v.trustedTypes,Ut=ht?ht.emptyScript:"",J=v.reactiveElementPolyfillSupport,j=(a,t)=>a,Z={toAttribute(a,t){switch(t){case Boolean:a=a?Ut:null;break;case Object:case Array:a=a==null?a:JSON.stringify(a)}return a},fromAttribute(a,t){let e=a;switch(t){case Boolean:e=a!==null;break;case Number:e=a===null?null:Number(a);break;case Object:case Array:try{e=JSON.parse(a)}catch{e=null}}return e}},lt=(a,t)=>!Lt(a,t),dt={attribute:!0,type:String,converter:Z,reflect:!1,useDefault:!1,hasChanged:lt};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),v.litPropertyMetadata??(v.litPropertyMetadata=new WeakMap);let q=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??(this.l=[])).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=dt){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);s!==void 0&&kt(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:r}=Pt(this.prototype,t)??{get(){return this[e]},set(o){this[e]=o}};return{get:s,set(o){const h=s==null?void 0:s.call(this);r==null||r.call(this,o),this.requestUpdate(t,h,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??dt}static _$Ei(){if(this.hasOwnProperty(j("elementProperties")))return;const t=Tt(this);t.finalize(),t.l!==void 0&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(j("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(j("properties"))){const e=this.properties,i=[...jt(e),...Ht(e)];for(const s of i)this.createProperty(s,e[s])}const t=this[Symbol.metadata];if(t!==null){const e=litPropertyMetadata.get(t);if(e!==void 0)for(const[i,s]of e)this.elementProperties.set(i,s)}this._$Eh=new Map;for(const[e,i]of this.elementProperties){const s=this._$Eu(e,i);s!==void 0&&this._$Eh.set(s,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const s of i)e.unshift(nt(s))}else t!==void 0&&e.push(nt(t));return e}static _$Eu(t,e){const i=e.attribute;return i===!1?void 0:typeof i=="string"?i:typeof t=="string"?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var t;this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),(t=this.constructor.l)==null||t.forEach(e=>e(this))}addController(t){var e;(this._$EO??(this._$EO=new Set)).add(t),this.renderRoot!==void 0&&this.isConnected&&((e=t.hostConnected)==null||e.call(t))}removeController(t){var e;(e=this._$EO)==null||e.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return Dt(t,this.constructor.elementStyles),t}connectedCallback(){var t;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(t=this._$EO)==null||t.forEach(e=>{var i;return(i=e.hostConnected)==null?void 0:i.call(e)})}enableUpdating(t){}disconnectedCallback(){var t;(t=this._$EO)==null||t.forEach(e=>{var i;return(i=e.hostDisconnected)==null?void 0:i.call(e)})}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){var r;const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(s!==void 0&&i.reflect===!0){const o=(((r=i.converter)==null?void 0:r.toAttribute)!==void 0?i.converter:Z).toAttribute(e,i.type);this._$Em=t,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){var r,o;const i=this.constructor,s=i._$Eh.get(t);if(s!==void 0&&this._$Em!==s){const h=i.getPropertyOptions(s),l=typeof h.converter=="function"?{fromAttribute:h.converter}:((r=h.converter)==null?void 0:r.fromAttribute)!==void 0?h.converter:Z;this._$Em=s;const p=l.fromAttribute(e,h.type);this[s]=p??((o=this._$Ej)==null?void 0:o.get(s))??p,this._$Em=null}}requestUpdate(t,e,i,s=!1,r){var o;if(t!==void 0){const h=this.constructor;if(s===!1&&(r=this[t]),i??(i=h.getPropertyOptions(t)),!((i.hasChanged??lt)(r,e)||i.useDefault&&i.reflect&&r===((o=this._$Ej)==null?void 0:o.get(t))&&!this.hasAttribute(h._$Eu(t,i))))return;this.C(t,e,i)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:r},o){i&&!(this._$Ej??(this._$Ej=new Map)).has(t)&&(this._$Ej.set(t,o??e??this[t]),r!==!0||o!==void 0)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),s===!0&&this._$Em!==t&&(this._$Eq??(this._$Eq=new Set)).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const t=this.scheduleUpdate();return t!=null&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var i;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[r,o]of this._$Ep)this[r]=o;this._$Ep=void 0}const s=this.constructor.elementProperties;if(s.size>0)for(const[r,o]of s){const{wrapped:h}=o,l=this[r];h!==!0||this._$AL.has(r)||l===void 0||this.C(r,void 0,o,l)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),(i=this._$EO)==null||i.forEach(s=>{var r;return(r=s.hostUpdate)==null?void 0:r.call(s)}),this.update(e)):this._$EM()}catch(s){throw t=!1,this._$EM(),s}t&&this._$AE(e)}willUpdate(t){}_$AE(t){var e;(e=this._$EO)==null||e.forEach(i=>{var s;return(s=i.hostUpdated)==null?void 0:s.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&(this._$Eq=this._$Eq.forEach(e=>this._$ET(e,this[e]))),this._$EM()}updated(t){}firstUpdated(t){}};q.elementStyles=[],q.shadowRootOptions={mode:"open"},q[j("elementProperties")]=new Map,q[j("finalized")]=new Map,J==null||J({ReactiveElement:q}),(v.reactiveElementVersions??(v.reactiveElementVersions=[])).push("2.1.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const H=globalThis,ct=a=>a,Y=H.trustedTypes,pt=Y?Y.createPolicy("lit-html",{createHTML:a=>a}):void 0,mt="$lit$",w=`lit$${Math.random().toFixed(9).slice(2)}$`,ut="?"+w,It=`<${ut}>`,S=document,T=()=>S.createComment(""),U=a=>a===null||typeof a!="object"&&typeof a!="function",G=Array.isArray,Nt=a=>G(a)||typeof(a==null?void 0:a[Symbol.iterator])=="function",Q=`[ 	
\f\r]`,I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,ft=/-->/g,gt=/>/g,M=RegExp(`>|${Q}(?:([^\\s"'>=/]+)(${Q}*=${Q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),yt=/'/g,$t=/"/g,bt=/^(?:script|style|textarea|title)$/i,Ot=a=>(t,...e)=>({_$litType$:a,strings:t,values:e}),n=Ot(1),C=Symbol.for("lit-noChange"),d=Symbol.for("lit-nothing"),_t=new WeakMap,z=S.createTreeWalker(S,129);function xt(a,t){if(!G(a)||!a.hasOwnProperty("raw"))throw Error("invalid template strings array");return pt!==void 0?pt.createHTML(t):t}const Rt=(a,t)=>{const e=a.length-1,i=[];let s,r=t===2?"<svg>":t===3?"<math>":"",o=I;for(let h=0;h<e;h++){const l=a[h];let p,c,m=-1,y=0;for(;y<l.length&&(o.lastIndex=y,c=o.exec(l),c!==null);)y=o.lastIndex,o===I?c[1]==="!--"?o=ft:c[1]!==void 0?o=gt:c[2]!==void 0?(bt.test(c[2])&&(s=RegExp("</"+c[2],"g")),o=M):c[3]!==void 0&&(o=M):o===M?c[0]===">"?(o=s??I,m=-1):c[1]===void 0?m=-2:(m=o.lastIndex-c[2].length,p=c[1],o=c[3]===void 0?M:c[3]==='"'?$t:yt):o===$t||o===yt?o=M:o===ft||o===gt?o=I:(o=M,s=void 0);const _=o===M&&a[h+1].startsWith("/>")?" ":"";r+=o===I?l+It:m>=0?(i.push(p),l.slice(0,m)+mt+l.slice(m)+w+_):l+w+(m===-2?h:_)}return[xt(a,r+(a[e]||"<?>")+(t===2?"</svg>":t===3?"</math>":"")),i]};class N{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let r=0,o=0;const h=t.length-1,l=this.parts,[p,c]=Rt(t,e);if(this.el=N.createElement(p,i),z.currentNode=this.el.content,e===2||e===3){const m=this.el.content.firstChild;m.replaceWith(...m.childNodes)}for(;(s=z.nextNode())!==null&&l.length<h;){if(s.nodeType===1){if(s.hasAttributes())for(const m of s.getAttributeNames())if(m.endsWith(mt)){const y=c[o++],_=s.getAttribute(m).split(w),P=/([.?@])?(.*)/.exec(y);l.push({type:1,index:r,name:P[2],strings:_,ctor:P[1]==="."?Bt:P[1]==="?"?Vt:P[1]==="@"?Yt:W}),s.removeAttribute(m)}else m.startsWith(w)&&(l.push({type:6,index:r}),s.removeAttribute(m));if(bt.test(s.tagName)){const m=s.textContent.split(w),y=m.length-1;if(y>0){s.textContent=Y?Y.emptyScript:"";for(let _=0;_<y;_++)s.append(m[_],T()),z.nextNode(),l.push({type:2,index:++r});s.append(m[y],T())}}}else if(s.nodeType===8)if(s.data===ut)l.push({type:2,index:r});else{let m=-1;for(;(m=s.data.indexOf(w,m+1))!==-1;)l.push({type:7,index:r}),m+=w.length-1}r++}}static createElement(t,e){const i=S.createElement("template");return i.innerHTML=t,i}}function D(a,t,e=a,i){var o,h;if(t===C)return t;let s=i!==void 0?(o=e._$Co)==null?void 0:o[i]:e._$Cl;const r=U(t)?void 0:t._$litDirective$;return(s==null?void 0:s.constructor)!==r&&((h=s==null?void 0:s._$AO)==null||h.call(s,!1),r===void 0?s=void 0:(s=new r(a),s._$AT(a,e,i)),i!==void 0?(e._$Co??(e._$Co=[]))[i]=s:e._$Cl=s),s!==void 0&&(t=D(a,s._$AS(a,t.values),s,i)),t}class Ft{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=((t==null?void 0:t.creationScope)??S).importNode(e,!0);z.currentNode=s;let r=z.nextNode(),o=0,h=0,l=i[0];for(;l!==void 0;){if(o===l.index){let p;l.type===2?p=new O(r,r.nextSibling,this,t):l.type===1?p=new l.ctor(r,l.name,l.strings,this,t):l.type===6&&(p=new Wt(r,this,t)),this._$AV.push(p),l=i[++h]}o!==(l==null?void 0:l.index)&&(r=z.nextNode(),o++)}return z.currentNode=S,s}p(t){let e=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class O{get _$AU(){var t;return((t=this._$AM)==null?void 0:t._$AU)??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=d,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=(s==null?void 0:s.isConnected)??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return e!==void 0&&(t==null?void 0:t.nodeType)===11&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=D(this,t,e),U(t)?t===d||t==null||t===""?(this._$AH!==d&&this._$AR(),this._$AH=d):t!==this._$AH&&t!==C&&this._(t):t._$litType$!==void 0?this.$(t):t.nodeType!==void 0?this.T(t):Nt(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==d&&U(this._$AH)?this._$AA.nextSibling.data=t:this.T(S.createTextNode(t)),this._$AH=t}$(t){var r;const{values:e,_$litType$:i}=t,s=typeof i=="number"?this._$AC(t):(i.el===void 0&&(i.el=N.createElement(xt(i.h,i.h[0]),this.options)),i);if(((r=this._$AH)==null?void 0:r._$AD)===s)this._$AH.p(e);else{const o=new Ft(s,this),h=o.u(this.options);o.p(e),this.T(h),this._$AH=o}}_$AC(t){let e=_t.get(t.strings);return e===void 0&&_t.set(t.strings,e=new N(t)),e}k(t){G(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const r of t)s===e.length?e.push(i=new O(this.O(T()),this.O(T()),this,this.options)):i=e[s],i._$AI(r),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,e);t!==this._$AB;){const s=ct(t).nextSibling;ct(t).remove(),t=s}}setConnected(t){var e;this._$AM===void 0&&(this._$Cv=t,(e=this._$AP)==null||e.call(this,t))}}class W{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,r){this.type=1,this._$AH=d,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=d}_$AI(t,e=this,i,s){const r=this.strings;let o=!1;if(r===void 0)t=D(this,t,e,0),o=!U(t)||t!==this._$AH&&t!==C,o&&(this._$AH=t);else{const h=t;let l,p;for(t=r[0],l=0;l<r.length-1;l++)p=D(this,h[i+l],e,l),p===C&&(p=this._$AH[l]),o||(o=!U(p)||p!==this._$AH[l]),p===d?t=d:t!==d&&(t+=(p??"")+r[l+1]),this._$AH[l]=p}o&&!s&&this.j(t)}j(t){t===d?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class Bt extends W{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===d?void 0:t}}class Vt extends W{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==d)}}class Yt extends W{constructor(t,e,i,s,r){super(t,e,i,s,r),this.type=5}_$AI(t,e=this){if((t=D(this,t,e,0)??d)===C)return;const i=this._$AH,s=t===d&&i!==d||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,r=t!==d&&(i===d||s);s&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){var e;typeof this._$AH=="function"?this._$AH.call(((e=this.options)==null?void 0:e.host)??this.element,t):this._$AH.handleEvent(t)}}class Wt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){D(this,t)}}const X=H.litHtmlPolyfillSupport;X==null||X(N,O),(H.litHtmlVersions??(H.litHtmlVersions=[])).push("3.3.2");const Kt=(a,t,e)=>{const i=(e==null?void 0:e.renderBefore)??t;let s=i._$litPart$;if(s===void 0){const r=(e==null?void 0:e.renderBefore)??null;i._$litPart$=s=new O(t.insertBefore(T(),r),r,void 0,e??{})}return s._$AI(a),s};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const E=globalThis;let R=class extends q{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var e;const t=super.createRenderRoot();return(e=this.renderOptions).renderBefore??(e.renderBefore=t.firstChild),t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=Kt(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return C}};R._$litElement$=!0,R.finalized=!0,(At=E.litElementHydrateSupport)==null||At.call(E,{LitElement:R});const tt=E.litElementPolyfillSupport;tt==null||tt({LitElement:R}),(E.litElementVersions??(E.litElementVersions=[])).push("4.2.2");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Jt={CHILD:2},Zt=a=>(...t)=>({_$litDirective$:a,values:t});class Gt{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class et extends Gt{constructor(t){if(super(t),this.it=d,t.type!==Jt.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===d||t==null)return this._t=void 0,this.it=t;if(t===C)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const e=[t];return e.raw=e,this._t={_$litType$:this.constructor.resultType,strings:e,values:[]}}}et.directiveName="unsafeHTML",et.resultType=1;const F=Zt(et),L={en:{prayers:{fajr:"Fajr",dhuhr:"Dhuhr",asr:"Asr",maghrib:"Maghrib",isha:"Isha",sunrise:"Sunrise"},azaan:"Adhan",iqamah:"Iqamah",months:["January","February","March","April","May","June","July","August","September","October","November","December"],days:["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],daysShort:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],dayCol:"Day",hijriMonths:["Muharram","Safar","Rabi' al-Awwal","Rabi' al-Thani","Jumada al-Awwal","Jumada al-Thani","Rajab","Sha'ban","Ramadan","Shawwal","Dhul-Qa'dah","Dhul-Hijjah"],hijriCol:"Hijri",loading:"Loading prayer times…",error:"Unable to load prayer times."},ar:{prayers:{fajr:"الفجر",dhuhr:"الظهر",asr:"العصر",maghrib:"المغرب",isha:"العشاء",sunrise:"الشروق"},azaan:"الأذان",iqamah:"الإقامة",months:["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"],days:["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],daysShort:["أحد","اثن","ثلا","أرب","خمي","جمع","سبت"],dayCol:"يوم",hijriMonths:["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الثانية","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة"],hijriCol:"هجري",loading:"جار تحميل أوقات الصلاة…",error:"تعذّر تحميل أوقات الصلاة."}},k=a=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${a}</svg>`,b={fajr:k('<path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 6 4-4 4 4"/><path d="M16 18a4 4 0 0 0-8 0"/>'),dhuhr:k('<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>'),asr:k('<circle cx="12" cy="12" r="4"/><path d="M12 3v1.5"/><path d="M12 19.5V21"/><path d="m5.64 5.64 1.06 1.06"/><path d="m17.3 17.3 1.06 1.06"/><path d="M3 12h1.5"/><path d="M19.5 12H21"/><path d="m5.64 18.36 1.06-1.06"/><path d="m17.3 6.7 1.06-1.06"/><path d="M4 21h16"/>'),maghrib:k('<path d="M12 10V2"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m16 6-4 4-4-4"/><path d="M16 18a4 4 0 0 0-8 0"/>'),isha:k('<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/><path d="M20 3v4"/><path d="M22 5h-4"/>'),sunrise:k('<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 4.93-1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><circle cx="12" cy="12" r="4"/><path d="M2 18h20"/>')},vt={light:{"--mt-bg":"#ffffff","--mt-bg-card":"#f8f9fa","--mt-bg-highlight":"#e8f4fd","--mt-text":"#1a1a2e","--mt-text-muted":"#6c757d","--mt-accent":"#1a5276","--mt-accent-text":"#ffffff","--mt-border":"#dee2e6","--mt-shadow":"0 2px 12px rgba(0,0,0,0.08)","--mt-radius":"12px"},dark:{"--mt-bg":"#1a1a2e","--mt-bg-card":"#16213e","--mt-bg-highlight":"#0f3460","--mt-text":"#e8e8e8","--mt-text-muted":"#a0a0b0","--mt-accent":"#4fc3f7","--mt-accent-text":"#1a1a2e","--mt-border":"#2d2d4e","--mt-shadow":"0 2px 12px rgba(0,0,0,0.4)","--mt-radius":"12px"},emerald:{"--mt-bg":"#f0faf4","--mt-bg-card":"#ffffff","--mt-bg-highlight":"#c8efd8","--mt-text":"#1b3a2d","--mt-text-muted":"#4a7c59","--mt-accent":"#2d6a4f","--mt-accent-text":"#ffffff","--mt-border":"#b7dfca","--mt-shadow":"0 2px 12px rgba(45,106,79,0.12)","--mt-radius":"12px"},navy:{"--mt-bg":"#0d1b2a","--mt-bg-card":"#1b2d45","--mt-bg-highlight":"#243b55","--mt-text":"#f0e6d3","--mt-text-muted":"#b0a090","--mt-accent":"#c9a84c","--mt-accent-text":"#0d1b2a","--mt-border":"#2a3f5c","--mt-shadow":"0 2px 12px rgba(0,0,0,0.5)","--mt-radius":"12px"},gold:{"--mt-bg":"#fdfaf3","--mt-bg-card":"#fffef9","--mt-bg-highlight":"#fef3c7","--mt-text":"#3d2b00","--mt-text-muted":"#7c6030","--mt-accent":"#b7791f","--mt-accent-text":"#ffffff","--mt-border":"#e9d87e","--mt-shadow":"0 2px 12px rgba(183,121,31,0.12)","--mt-radius":"12px"},minimal:{"--mt-bg":"transparent","--mt-bg-card":"transparent","--mt-bg-highlight":"rgba(0,0,0,0.04)","--mt-text":"inherit","--mt-text-muted":"#888888","--mt-accent":"#2d6a4f","--mt-accent-text":"#ffffff","--mt-border":"rgba(0,0,0,0.1)","--mt-shadow":"none","--mt-radius":"4px"}};function wt(a){const t=a.getFullYear(),e=a.getMonth()+1,i=a.getDate();let r=Math.floor(1461*(t+4800+Math.floor((e-14)/12))/4)+Math.floor(367*(e-2-12*Math.floor((e-14)/12))/12)-Math.floor(3*Math.floor((t+4900+Math.floor((e-14)/12))/100)/4)+i-32075-1948440+10632,o=Math.floor((r-1)/10631);r=r-10631*o+354;let h=Math.floor((10985-r)/5316)*Math.floor(50*r/17719)+Math.floor(r/5670)*Math.floor(43*r/15238);r=r-Math.floor((30-h)/15)*Math.floor(17719*h/50)-Math.floor(h/16)*Math.floor(15238*h/43)+29;const l=Math.floor(24*r/709),p=r-Math.floor(709*l/24);return{year:30*o+h-30,month:l,day:p}}function Qt(a){if(!a)return"";const t=a.match(/(\d+):(\d+)\s*(AM|PM)/i);if(!t)return a;let e=parseInt(t[1],10);const i=t[2],s=t[3].toUpperCase();return s==="AM"&&e===12&&(e=0),s==="PM"&&e!==12&&(e+=12),`${String(e).padStart(2,"0")}:${i}`}function u(a,t,e){return a?t==="24h"?Qt(a):e==="ar"?a.replace(/AM/i,"ص").replace(/PM/i,"م"):a:"—"}function Xt(a,t,e){const s=(L[e]||L.en).months[a.getMonth()],r=a.getDate(),o=a.getFullYear(),h=String(a.getMonth()+1).padStart(2,"0"),l=String(r).padStart(2,"0");return t.replace("MMMM",s).replace("MMM",s.slice(0,3)).replace("MM",h).replace("YYYY",o).replace("DD",l).replace("D",r)}function te(a,t){const e=wt(a),i=L[t]||L.en;return`${e.day} ${i.hijriMonths[e.month-1]} ${e.year}`}function ee(a){if(!a)return-1;const t=a.match(/(\d+):(\d+)\s*(AM|PM)/i);if(!t)return-1;let e=parseInt(t[1],10);const i=parseInt(t[2],10),s=t[3].toUpperCase();return s==="AM"&&e===12&&(e=0),s==="PM"&&e!==12&&(e+=12),e*60+i}function K(a,t){const e=new Date().getHours()*60+new Date().getMinutes();for(const i of t){const s=a[`${i}_iqamah`]||a[`${i}_azaan`];if(ee(s)>e)return i}return t[0]}class it extends R{constructor(){super(),this.mosqueId="",this.view="daily",this.theme="light",this.lang="en",this.timeFormat="12h",this.showAzaan="true",this.showIqamah="true",this.showSunrise="true",this.showDate="true",this.showHijri="true",this.dateFormat="MMMM D, YYYY",this.prayers="fajr,dhuhr,asr,maghrib,isha",this.logoUrl="",this.accentColor="",this.bgColor="",this.textColor="",this.apiUrl="http://localhost:3000",this.monthlyLayout="split",this.highlightTime="both",this.width="responsive",this.showHijriCol="false",this.showIcons="true",this.dayName="short",this.dailyLayout="list",this.fontSize="",this.prayerNames="",this.sunriseLabel="",this.adhanLabel="",this.iqamahLabel="",this._data=null,this._loading=!1,this._error=null,this._isNextDay=!1,this._fetchKey=""}get _t(){return L[this.lang]||L.en}get _showAzaan(){return this.showAzaan!=="false"}get _showIqamah(){return this.showIqamah!=="false"}get _showSunrise(){return this.showSunrise==="true"}get _showDate(){return this.showDate!=="false"}get _showHijri(){return this.showHijri!=="false"}get _showBoth(){return this._showAzaan&&this._showIqamah}get _showHijriCol(){return this.showHijriCol==="true"}get _showIcons(){return this.showIcons!=="false"}get _useSplit(){return this.monthlyLayout==="split"&&this._showBoth}get _apiUrl(){return(this.apiUrl||"http://localhost:3000").replace(/\/$/,"")}get _adhanLabel(){return this.adhanLabel||this._t.azaan}get _iqamahLabel(){return this.iqamahLabel||this._t.iqamah}_prayerLabel(t){if(t==="sunrise")return this.sunriseLabel||this._t.prayers.sunrise;if(this.prayerNames){const e=this.prayerNames.split(",").map(s=>s.trim()),i=this._prayerList.indexOf(t);if(i>=0&&e[i])return e[i]}return this._t.prayers[t]||t}get _prayerList(){return this.prayers.split(",").map(t=>t.trim()).filter(Boolean)}get _displayPrayers(){const t=[...this._prayerList];return this._showSunrise&&t.splice(1,0,"sunrise"),t}willUpdate(t){(t.has("mosqueId")||t.has("view")||t.has("apiUrl"))&&`${this._apiUrl}|${this.mosqueId}|${this.view}`!==this._fetchKey&&(this._data=null,this._loading=!0)}updated(t){this._applyCssVars(),(t.has("mosqueId")||t.has("view")||t.has("apiUrl"))&&this._fetchData()}_applyCssVars(){const e={...vt[this.theme]||vt.light};this.accentColor&&(e["--mt-accent"]=this.accentColor),this.bgColor&&(e["--mt-bg"]=this.bgColor),this.textColor&&(e["--mt-text"]=this.textColor),this.width&&this.width!=="responsive"?e["--mt-width"]=this.width:this.style.removeProperty("--mt-width"),this.fontSize?this.style.setProperty("--mt-font-size",this.fontSize):this.style.removeProperty("--mt-font-size");for(const[i,s]of Object.entries(e))this.style.setProperty(i,s)}async _fetchData(){const{mosqueId:t,_apiUrl:e,view:i}=this;if(!t){this._error="mosque-id required",this._data=null;return}const s=`${e}|${t}|${i}`;if(!(this._fetchKey===s&&this._data)){this._loading=!0,this._error=null,this._isNextDay=!1;try{const r=new Date().getMonth()+1,o=i==="monthly"?`${e}/api/mosques/${t}/month/${r}`:`${e}/api/mosques/${t}/today`,h=await fetch(o);if(!h.ok)throw new Error(`HTTP ${h.status}`);const l=await h.json();if(i!=="monthly"&&l.times&&this._allPrayersDone(l.times)){const p=await this._fetchTomorrowTimes(e,t);p?(this._data={...l,times:p},this._isNextDay=!0):this._data=l}else this._data=l;this._fetchKey=s}catch(r){this._error=r.message,this._data=null}finally{this._loading=!1}}}_allPrayersDone(t){const e=this._prayerList[this._prayerList.length-1],i=t[`${e}_iqamah`]||t[`${e}_azaan`];if(!i)return!1;const s=i.match(/(\d+):(\d+)\s*(AM|PM)/i);if(!s)return!1;let r=parseInt(s[1],10);const o=parseInt(s[2],10),h=s[3].toUpperCase();h==="AM"&&r===12&&(r=0),h==="PM"&&r!==12&&(r+=12);const l=new Date().getHours()*60+new Date().getMinutes();return r*60+o<=l}async _fetchTomorrowTimes(t,e){var o;const i=new Date;i.setDate(i.getDate()+1);const s=i.getMonth()+1,r=i.getDate();try{const h=await fetch(`${t}/api/mosques/${e}/month/${s}`);return h.ok&&((o=(await h.json()).days)==null?void 0:o[r])||null}catch{return null}}render(){const t=this.lang==="ar";return n`
      <div class="widget ${t?"rtl":""}">
        ${this._loading?n`<div class="state-msg"><div class="spinner"></div><br>${this._t.loading}</div>`:this._error||!this._data?n`<div class="state-msg">${this._t.error}</div>`:n`
                ${this._showDate?this._renderHeader():d}
                ${this.view==="monthly"?this._renderMonthly():this._renderDaily()}
              `}
      </div>
    `}_renderHeader(){var s;const t=this._isNextDay?new Date(Date.now()+864e5):new Date,e=Xt(t,this.dateFormat,this.lang),i=te(t,this.lang);return n`
      <div class="header">
        ${this.logoUrl?n`<img class="header-logo" src="${this.logoUrl}" alt="" loading="lazy">`:d}
        <div class="header-text">
          ${(s=this._data)!=null&&s.name?n`<div class="mosque-name">${this._data.name}</div>`:d}
          ${this._isNextDay?n`<div class="tomorrow-label">Tomorrow</div>`:d}
          <div class="date-gregorian">${e}</div>
          ${this._showHijri?n`<div class="date-hijri">${i}</div>`:d}
        </div>
      </div>
    `}_renderDaily(){switch(this.dailyLayout){case"row":return this._renderDailyRow();case"compact":return this._renderDailyCompact();case"focused":return this._renderDailyFocused();default:return this._renderDailyList()}}_renderDailyList(){const{times:t}=this._data,e=K(t,this._prayerList),i=this.highlightTime,s=i==="adhan"?"time-value hl-primary":i==="iqamah"?"time-value hl-dim":"time-value",r=i==="iqamah"?"time-value hl-primary":i==="adhan"?"time-value hl-dim":"time-value";return n`
      <div class="prayers-list">
        ${this._displayPrayers.map(o=>n`
          <div class="prayer-row ${o===e?"next":""}">
            ${this._showIcons?n`<div class="prayer-icon">${F(b[o]||b.dhuhr)}</div>`:d}
            <div class="prayer-name">${this._prayerLabel(o)}</div>
            ${o==="sunrise"?n`
                  <div class="times-group">
                    <div class="time-block">
                      <div class="time-value">${u(t.sunrise,this.timeFormat,this.lang)}</div>
                    </div>
                  </div>`:n`
                  <div class="times-group">
                    ${this._showAzaan?n`
                      <div class="time-block">
                        <div class="time-label">${this._adhanLabel}</div>
                        <div class="${s}">${u(t[`${o}_azaan`],this.timeFormat,this.lang)}</div>
                      </div>`:d}
                    ${this._showIqamah?n`
                      <div class="time-block">
                        <div class="time-label">${this._iqamahLabel}</div>
                        <div class="${r}">${u(t[`${o}_iqamah`],this.timeFormat,this.lang)}</div>
                      </div>`:d}
                  </div>`}
          </div>
        `)}
      </div>
    `}_renderDailyRow(){const{times:t}=this._data,e=K(t,this._prayerList),i=this.highlightTime,s=`card-adhan${i==="iqamah"?" hl-dim":""}`,r=`card-iqamah${i==="iqamah"||i==="both"?" hl-primary":i==="adhan"?" hl-dim":""}`;return n`
      <div class="prayers-row">
        ${this._displayPrayers.map(o=>n`
          <div class="prayer-card ${o===e?"next":""}">
            ${this._showIcons?n`<div class="prayer-icon">${F(b[o]||b.dhuhr)}</div>`:d}
            <div class="prayer-name">${this._prayerLabel(o)}</div>
            <div class="card-times">
              ${o==="sunrise"?n`
                    <div class="${s}">${u(t.sunrise,this.timeFormat,this.lang)}</div>
                    ${this._showIqamah?n`<div class="${r}" style="visibility:hidden" aria-hidden="true">-</div>`:d}
                  `:n`
                    ${this._showAzaan?n`<div class="${s}">${u(t[`${o}_azaan`],this.timeFormat,this.lang)}</div>`:d}
                    ${this._showIqamah?n`<div class="${r}">${u(t[`${o}_iqamah`],this.timeFormat,this.lang)}</div>`:d}
                  `}
            </div>
          </div>
        `)}
      </div>
    `}_renderDailyCompact(){const{times:t}=this._data,e=K(t,this._prayerList),i=this.highlightTime,s=i==="iqamah"?"ct-time hl-dim":i==="adhan"||i==="both"?"ct-time hl-primary":"ct-time",r=i==="adhan"?"ct-time hl-dim":i==="iqamah"||i==="both"?"ct-time hl-primary":"ct-time",o=this._showIcons?"1.6em ":"",h=this._showAzaan?"1fr ":"",l=this._showIqamah?"1fr":"",p=`${o}1fr ${h}${l}`.trim();return n`
      <div class="ct-table" style="grid-template-columns:${p}">
        <div class="ct-head-row">
          ${this._showIcons?n`<span></span>`:d}
          <span></span>
          ${this._showAzaan?n`<span class="ct-col-head">${this._adhanLabel}</span>`:d}
          ${this._showIqamah?n`<span class="ct-col-head">${this._iqamahLabel}</span>`:d}
        </div>
        ${this._displayPrayers.map(c=>n`
          <div class="ct-row ${c===e?"next":""}">
            ${this._showIcons?n`<div class="ct-icon" aria-hidden="true">${F(b[c]||b.dhuhr)}</div>`:d}
            <div class="ct-name">${this._prayerLabel(c)}</div>
            ${c==="sunrise"?n`
                  <div class="ct-time">${u(t.sunrise,this.timeFormat,this.lang)}</div>
                  ${this._showIqamah?n`<div aria-hidden="true"></div>`:d}
                `:n`
                  ${this._showAzaan?n`<div class="${s}">${u(t[`${c}_azaan`],this.timeFormat,this.lang)}</div>`:d}
                  ${this._showIqamah?n`<div class="${r}">${u(t[`${c}_iqamah`],this.timeFormat,this.lang)}</div>`:d}
                `}
          </div>
        `)}
      </div>
    `}_renderDailyFocused(){const{times:t}=this._data,e=K(t,this._prayerList),i=this.highlightTime,s=this._showAzaan&&this._showIqamah,r=i==="iqamah"?`${e}_iqamah`:`${e}_azaan`,o=u(t[r],this.timeFormat,this.lang),h=i==="iqamah"?`${e}_azaan`:`${e}_iqamah`,l=u(t[h],this.timeFormat,this.lang),p=i==="iqamah"?this._adhanLabel:this._iqamahLabel;return n`
      <div class="fc-wrap">
        <div class="fc-hero">
          ${this._showIcons?n`<div class="fc-hero-icon" aria-hidden="true">${F(b[e]||b.dhuhr)}</div>`:d}
          <div class="fc-hero-name">${this._prayerLabel(e)}</div>
          <div class="fc-hero-time">${o}</div>
          ${s?n`<div class="fc-hero-secondary"><span class="fc-sec-label">${p}</span><span class="fc-sec-time">${l}</span></div>`:d}
        </div>
        <div class="fc-strip">
          ${this._displayPrayers.map(c=>n`
            <div class="fc-chip ${c===e?"next":""}">
              ${this._showIcons?n`<div class="fc-chip-icon" aria-hidden="true">${F(b[c]||b.dhuhr)}</div>`:d}
              <div class="fc-chip-name">${this._prayerLabel(c)}</div>
              ${c==="sunrise"?n`<div class="fc-chip-time">${u(t.sunrise,this.timeFormat,this.lang)}</div>`:n`
                    ${this._showAzaan?n`<div class="fc-chip-time ${i==="adhan"||i==="both"?"hl-primary":""}">${u(t[`${c}_azaan`],this.timeFormat,this.lang)}</div>`:d}
                    ${this._showIqamah?n`<div class="fc-chip-iqamah ${i==="iqamah"||i==="both"?"hl-primary":"hl-dim"}">${u(t[`${c}_iqamah`],this.timeFormat,this.lang)}</div>`:d}
                  `}
            </div>
          `)}
        </div>
      </div>
    `}_renderMonthly(){const{days:t}=this._data,e=new Date().getDate(),i=this._t,s=this._displayPrayers,r=this._useSplit,o=this._showBoth,h=this.highlightTime,l=this._showHijriCol,p=this.dayName,c=p!=="none",m=new Date,y=m.getFullYear(),_=m.getMonth(),P=Object.entries(t).sort((f,B)=>parseInt(f[0])-parseInt(B[0]));let St=-1;return n`
      <div class="monthly-wrap">
        <table class="monthly">
          <thead>
            <tr>
              <th rowspan="${r?2:1}" class="day-num">#</th>
              ${c?n`<th rowspan="${r?2:1}" class="day-name-col">${i.dayCol}</th>`:d}
              ${l?n`<th rowspan="${r?2:1}" class="hijri-col">${i.hijriCol}</th>`:d}
              ${s.map(f=>f==="sunrise"?n`<th rowspan="${r?2:1}" class="th-prayer">${this._prayerLabel(f)}</th>`:r?n`<th colspan="2" class="th-prayer">${this._prayerLabel(f)}</th>`:n`<th>${this._prayerLabel(f)}${o?n`<span class="sub">${this._adhanLabel}</span><span class="sub">${this._iqamahLabel}</span>`:d}</th>`)}
            </tr>
            ${r?n`
              <tr>
                ${s.filter(f=>f!=="sunrise").map(()=>n`
                  <th class="th-sub">${this._adhanLabel}</th>
                  <th class="th-sub td-split-last">${this._iqamahLabel}</th>
                `)}
              </tr>`:d}
          </thead>
          <tbody>
            ${P.map(([f,B])=>{const Mt=new Date(y,_,parseInt(f)),Ct=Mt.getDay(),ie=c?n`
                <td class="day-name-col">
                  ${p==="long"?i.days[Ct]:i.daysShort[Ct]}
                </td>`:d;let zt=d;if(l){const A=wt(Mt),V=A.month!==St;St=A.month,zt=n`
                  <td class="hijri-col">
                    ${A.day}${V?n`<span class="sub">${i.hijriMonths[A.month-1]}</span>`:d}
                  </td>`}return n`
              <tr class="${parseInt(f)===e?"today":""}">
                <td class="day-num">${f}</td>
                ${ie}
                ${zt}
                ${s.map(A=>{if(A==="sunrise")return n`<td>${u(B.sunrise,this.timeFormat,this.lang)}</td>`;const V=u(B[`${A}_azaan`],this.timeFormat,this.lang),st=u(B[`${A}_iqamah`],this.timeFormat,this.lang);return r?[n`<td class="${h==="adhan"||h==="both"?"td-hl":""}">${V}</td>`,n`<td class="td-split-last ${h==="iqamah"||h==="both"?"td-hl":""}">${st}</td>`]:o?n`<td><span class="${h==="adhan"?"t-primary":h==="iqamah"?"t-secondary":h==="both"?"t-equal":"t-muted"}">${V}</span><span class="${h==="adhan"?"t-secondary":h==="iqamah"?"t-primary":h==="both"?"t-equal":"t-muted"}">${st}</span></td>`:n`<td>${this._showAzaan?V:st}</td>`})}
              </tr>
            `})}
          </tbody>
        </table>
      </div>
    `}}at(it,"properties",{mosqueId:{type:String,attribute:"mosque-id"},view:{type:String},theme:{type:String},lang:{type:String},timeFormat:{type:String,attribute:"time-format"},showAzaan:{type:String,attribute:"show-azaan"},showIqamah:{type:String,attribute:"show-iqamah"},showSunrise:{type:String,attribute:"show-sunrise"},showDate:{type:String,attribute:"show-date"},showHijri:{type:String,attribute:"show-hijri"},dateFormat:{type:String,attribute:"date-format"},prayers:{type:String},logoUrl:{type:String,attribute:"logo-url"},accentColor:{type:String,attribute:"accent-color"},bgColor:{type:String,attribute:"bg-color"},textColor:{type:String,attribute:"text-color"},apiUrl:{type:String,attribute:"api-url"},monthlyLayout:{type:String,attribute:"monthly-layout"},highlightTime:{type:String,attribute:"highlight-time"},width:{type:String},showHijriCol:{type:String,attribute:"show-hijri-col"},showIcons:{type:String,attribute:"show-icons"},dayName:{type:String,attribute:"day-name"},fontSize:{type:String,attribute:"font-size"},dailyLayout:{type:String,attribute:"daily-layout"},prayerNames:{type:String,attribute:"prayer-names"},sunriseLabel:{type:String,attribute:"sunrise-label"},adhanLabel:{type:String,attribute:"adhan-label"},iqamahLabel:{type:String,attribute:"iqamah-label"},_data:{state:!0},_loading:{state:!0},_error:{state:!0},_isNextDay:{state:!0}}),at(it,"styles",qt`
    :host {
      display: block;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: var(--mt-font-size, 1rem);
      box-sizing: border-box;
      width: var(--mt-width, 100%);
      container-type: inline-size;
    }
    *, *::before, *::after { box-sizing: inherit; }

    .widget { background: var(--mt-bg); border-radius: var(--mt-radius); box-shadow: var(--mt-shadow); overflow: clip; color: var(--mt-text); }

    /* Header */
    .header { display: flex; align-items: center; gap: 12px; padding: 16px 20px 12px; border-bottom: 1px solid var(--mt-border); }
    .header-logo { width: 48px; height: 48px; object-fit: contain; border-radius: 8px; flex-shrink: 0; }
    .header-text { flex: 1; min-width: 0; }
    .mosque-name { font-weight: 700; font-size: 1em; margin: 0 0 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .date-gregorian { font-size: 0.82em; color: var(--mt-text-muted); }
    .date-hijri { font-size: 0.78em; color: var(--mt-accent); margin-top: 1px; }

    .tomorrow-label { display: inline-block; font-size: 0.68em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: var(--mt-accent); background: color-mix(in srgb, var(--mt-accent) 12%, transparent); border-radius: 4px; padding: 1px 6px; margin-bottom: 2px; }

    /* Daily view */
    .prayers-list { padding: 12px 16px; display: flex; flex-direction: column; gap: 8px; }
    .prayer-row { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: calc(var(--mt-radius) - 4px); background: var(--mt-bg-card); border: 1px solid var(--mt-border); transition: background 0.2s; }
    .prayer-row.next { background: var(--mt-accent); border-color: var(--mt-accent); color: var(--mt-accent-text); }
    .prayer-row.next .time-label { color: var(--mt-accent-text); opacity: 0.75; }
    .prayer-icon { width: 26px; height: 26px; flex-shrink: 0; opacity: 0.85; }
    .prayer-name { font-weight: 600; font-size: 0.95em; flex: 1; }
    .times-group { display: flex; gap: 20px; }
    .time-block { text-align: center; }
    .time-label { font-size: 0.67em; text-transform: uppercase; letter-spacing: 0.5px; color: var(--mt-text-muted); margin-bottom: 1px; }
    .time-value { font-size: 0.9em; font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }

    /* Daily row (horizontal) layout */
    .prayers-row { display: flex; gap: 8px; padding: 12px 16px; overflow-x: auto; }
    .prayer-card { flex: 1; min-width: 80px; display: flex; flex-direction: column; align-items: center; padding: 14px 8px 12px; border-radius: calc(var(--mt-radius) - 4px); background: var(--mt-bg-card); border: 1px solid var(--mt-border); text-align: center; gap: 0; }
    .prayer-card.next { background: var(--mt-accent); border-color: var(--mt-accent); color: var(--mt-accent-text); }
    .prayer-card .prayer-icon { width: 24px; height: 24px; flex-shrink: 0; opacity: 0.85; margin-bottom: 7px; }
    .prayer-card .prayer-name { font-weight: 600; font-size: 0.8em; margin-bottom: 10px; }
    .card-times { width: 100%; border-top: 1px solid var(--mt-border); padding-top: 8px; display: flex; flex-direction: column; align-items: center; gap: 3px; }
    .prayer-card.next .card-times { border-top-color: rgba(255,255,255,0.25); }
    .card-adhan  { font-size: 0.95em; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .card-iqamah { font-size: 0.78em; font-variant-numeric: tabular-nums; white-space: nowrap; color: var(--mt-text-muted); }
    .prayer-card.next .card-iqamah { color: var(--mt-accent-text); opacity: 0.75; }

    /* Monthly view */
    .monthly-wrap { overflow-x: auto; }
    table.monthly { width: 100%; border-collapse: collapse; font-size: 0.8em; }
    table.monthly th { background: var(--mt-bg-card); color: var(--mt-text-muted); font-weight: 600; padding: 10px 6px; text-align: center; border-bottom: 2px solid var(--mt-border); white-space: nowrap; }
    table.monthly th.th-prayer { border-right: 1px solid var(--mt-border); border-left: 1px solid var(--mt-border); border-bottom: 1px solid var(--mt-border); }
    table.monthly th.th-sub { font-size: 0.85em; font-weight: 500; padding: 4px 6px; border-bottom: 2px solid var(--mt-border); }
    table.monthly td { padding: 6px; text-align: center; border-bottom: 1px solid var(--mt-border); font-variant-numeric: tabular-nums; white-space: nowrap; }
    table.monthly .td-split-last { border-right: 1px solid var(--mt-border); }
    table.monthly tr.today td { background: var(--mt-bg-highlight); }
    table.monthly tr.today td.day-num { color: var(--mt-accent); font-weight: 700; }
    .day-num { font-weight: 700; min-width: 22px; }
    .sub { font-size: 0.875em; color: var(--mt-text-muted); display: block; white-space: nowrap; }
    .t-primary   { font-size: 1.025em; font-weight: 700; display: block; }
    .t-secondary { font-size: 0.9em; color: var(--mt-text-muted); display: block; margin-top: 1px; }
    .t-equal     { font-size: 0.975em; font-weight: 600; display: block; }
    .t-muted     { font-size: 0.9375em; color: var(--mt-text-muted); display: block; }
    td.td-hl { font-weight: 700; }
    .hl-primary { font-weight: 700; }
    .hl-dim     { font-weight: 400; opacity: 0.5; }
    .card-adhan.hl-dim      { font-size: 0.78em; }
    .card-iqamah.hl-primary { font-size: 0.95em; color: inherit; }
    .day-name-col { color: var(--mt-text-muted); font-size: 0.9375em; white-space: nowrap; border-right: 1px solid var(--mt-border); }
    .hijri-col { color: var(--mt-accent); font-size: 0.975em; min-width: 30px; border-right: 1px solid var(--mt-border); }

    /* States */
    .state-msg { padding: 32px 16px; text-align: center; color: var(--mt-text-muted); font-size: 0.9em; }
    .spinner { display: inline-block; width: 22px; height: 22px; border: 3px solid var(--mt-border); border-top-color: var(--mt-accent); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 8px; }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Sticky day-number column */
    table.monthly thead th:first-child,
    table.monthly tbody td.day-num {
      position: sticky; left: 0; z-index: 1;
      background: var(--mt-bg-card);
      border-right: 1px solid var(--mt-border);
    }
    table.monthly tbody td.day-num { background: var(--mt-bg); }
    table.monthly tr.today td.day-num { background: var(--mt-bg-highlight); }

    /* Container query breakpoints */
    @container (max-width: 500px) {
      .prayers-row { flex-direction: column; overflow-x: visible; gap: 6px; padding: 10px 14px; }
      .prayer-card { flex-direction: row; align-items: center; text-align: start; min-width: unset; padding: 10px 12px; gap: 10px; }
      .prayer-card .prayer-icon { margin-bottom: 0; }
      .prayer-card .prayer-name { flex: 1; margin-bottom: 0; font-size: 0.95em; text-align: start; }
      .card-times { border-top: none; border-inline-start: 1px solid var(--mt-border); padding-top: 0; padding-inline-start: 12px; width: auto; flex-direction: row; gap: 16px; align-items: center; }
      .prayer-card.next .card-times { border-inline-start-color: rgba(255,255,255,0.25); }
    }
    @container (max-width: 400px) {
      .header { padding: 12px 14px 10px; gap: 10px; }
      .header-logo { width: 38px; height: 38px; }
      .mosque-name { font-size: 0.92em; }
      .date-gregorian { font-size: 0.76em; }
      .date-hijri { font-size: 0.72em; }
      .prayers-list { padding: 8px 10px; gap: 6px; }
      .prayer-row { padding: 8px 10px; gap: 10px; }
      .prayer-name { font-size: 0.88em; }
      .time-value { font-size: 0.84em; }
      .time-label { font-size: 0.62em; }
      .times-group { gap: 12px; }
      table.monthly { font-size: 0.74em; }
      table.monthly th { padding: 8px 4px; }
      table.monthly td { padding: 5px 4px; }
    }
    @container (max-width: 300px) {
      .prayer-icon { display: none; }
      .prayer-row { padding: 7px 10px; }
      .times-group { flex-direction: column; gap: 4px; align-items: flex-end; }
      .time-block { display: flex; align-items: center; gap: 6px; }
      .time-label { margin-bottom: 0; }
    }

    /* ── Compact layout ─────────────────────────────────────────────────────── */
    .ct-table { display: grid; padding: 8px 12px 10px; row-gap: 0; }
    .ct-head-row { display: contents; }
    .ct-head-row > * { padding: 4px 6px 6px; font-size: 0.65em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.6px; color: var(--mt-text-muted); border-bottom: 2px solid var(--mt-border); }
    .ct-row { display: contents; }
    .ct-row > * { display: flex; align-items: center; padding: 8px 6px; border-bottom: 1px solid var(--mt-border); font-size: 0.88em; }
    .ct-row.next > * { background: color-mix(in srgb, var(--mt-accent) 10%, transparent); }
    .ct-row.next > *:first-child { border-inline-start: 3px solid var(--mt-accent); padding-inline-start: 3px; }
    .ct-icon { width: 1.1em; height: 1.1em; flex-shrink: 0; color: var(--mt-text-muted); }
    .ct-row.next .ct-icon { color: var(--mt-accent); }
    .ct-name { font-weight: 600; font-size: 0.92em; white-space: nowrap; padding-inline-end: 8px; flex: 1; }
    .ct-col-head:not(:first-child), .ct-time { justify-content: flex-end; text-align: end; font-variant-numeric: tabular-nums; white-space: nowrap; }
    @container (max-width: 300px) { .ct-table { padding: 6px 8px; } .ct-row > * { padding: 6px 4px; } }

    /* ── Focused layout ──────────────────────────────────────────────────────── */
    .fc-wrap { display: flex; flex-direction: column; }
    .fc-hero { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 28px 24px 22px; background: var(--mt-accent); color: var(--mt-accent-text); gap: 4px; min-height: 8em; }
    .fc-hero-icon { width: 2.4em; height: 2.4em; opacity: 0.9; margin-bottom: 4px; }
    .fc-hero-name { font-size: 0.8em; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
    .fc-hero-time { font-size: 3.2em; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.05; letter-spacing: -0.5px; }
    .fc-hero-secondary { display: flex; align-items: center; gap: 6px; font-size: 0.78em; opacity: 0.72; margin-top: 4px; }
    .fc-sec-label { font-size: 0.85em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; }
    .fc-sec-time { font-variant-numeric: tabular-nums; }
    .fc-strip { display: flex; overflow-x: auto; border-top: 2px solid var(--mt-border); scrollbar-width: thin; scrollbar-color: var(--mt-border) transparent; }
    .fc-chip { flex: 1; min-width: 4.5em; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 10px 6px; gap: 3px; background: var(--mt-bg-card); border-inline-end: 1px solid var(--mt-border); }
    .fc-chip:last-child { border-inline-end: none; }
    .fc-chip.next { background: var(--mt-bg-highlight); }
    .fc-chip-icon { width: 1.1em; height: 1.1em; color: var(--mt-text-muted); margin-bottom: 1px; }
    .fc-chip.next .fc-chip-icon { color: var(--mt-accent); }
    .fc-chip-name { font-size: 0.68em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.4px; color: var(--mt-text-muted); white-space: nowrap; }
    .fc-chip.next .fc-chip-name { color: var(--mt-accent); }
    .fc-chip-time { font-size: 0.78em; font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
    .fc-chip.next .fc-chip-time { color: var(--mt-accent); }
    .fc-chip-iqamah { font-size: 0.68em; font-variant-numeric: tabular-nums; white-space: nowrap; color: var(--mt-text-muted); }
    @container (max-width: 340px) { .fc-hero { padding: 20px 16px 18px; min-height: 6.5em; } .fc-hero-time { font-size: 2.4em; } .fc-hero-icon { width: 1.8em; height: 1.8em; } .fc-chip { min-width: 3.6em; padding: 8px 4px; } }
    @container (min-width: 500px) { .fc-hero-time { font-size: 4em; } }
    .rtl .fc-strip { flex-direction: row-reverse; }

    /* RTL */
    .rtl { direction: rtl; }
    .rtl .header { flex-direction: row-reverse; }
    .rtl .prayer-row { flex-direction: row-reverse; }
    .rtl .times-group { flex-direction: row-reverse; }
    .rtl table.monthly th, .rtl table.monthly td { direction: rtl; }
    .rtl table.monthly thead th:first-child,
    .rtl table.monthly tbody td.day-num { left: auto; right: 0; }
  `),customElements.define("masjid-prayer-times",it)})();

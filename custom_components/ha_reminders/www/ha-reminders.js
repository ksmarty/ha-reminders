/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const I = globalThis, Z = I.ShadowRoot && (I.ShadyCSS === void 0 || I.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, K = Symbol(), G = /* @__PURE__ */ new WeakMap();
let he = class {
  constructor(e, i, s) {
    if (this._$cssResult$ = !0, s !== K) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = i;
  }
  get styleSheet() {
    let e = this.o;
    const i = this.t;
    if (Z && e === void 0) {
      const s = i !== void 0 && i.length === 1;
      s && (e = G.get(i)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && G.set(i, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ge = (t) => new he(typeof t == "string" ? t : t + "", void 0, K), de = (t, ...e) => {
  const i = t.length === 1 ? t[0] : e.reduce((s, o, n) => s + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + t[n + 1], t[0]);
  return new he(i, t, K);
}, ye = (t, e) => {
  if (Z) t.adoptedStyleSheets = e.map((i) => i instanceof CSSStyleSheet ? i : i.styleSheet);
  else for (const i of e) {
    const s = document.createElement("style"), o = I.litNonce;
    o !== void 0 && s.setAttribute("nonce", o), s.textContent = i.cssText, t.appendChild(s);
  }
}, Q = Z ? (t) => t : (t) => t instanceof CSSStyleSheet ? ((e) => {
  let i = "";
  for (const s of e.cssRules) i += s.cssText;
  return ge(i);
})(t) : t;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: $e, defineProperty: ve, getOwnPropertyDescriptor: we, getOwnPropertyNames: be, getOwnPropertySymbols: Ae, getPrototypeOf: Se } = Object, v = globalThis, X = v.trustedTypes, xe = X ? X.emptyScript : "", Ee = v.reactiveElementPolyfillSupport, U = (t, e) => t, W = { toAttribute(t, e) {
  switch (e) {
    case Boolean:
      t = t ? xe : null;
      break;
    case Object:
    case Array:
      t = t == null ? t : JSON.stringify(t);
  }
  return t;
}, fromAttribute(t, e) {
  let i = t;
  switch (e) {
    case Boolean:
      i = t !== null;
      break;
    case Number:
      i = t === null ? null : Number(t);
      break;
    case Object:
    case Array:
      try {
        i = JSON.parse(t);
      } catch {
        i = null;
      }
  }
  return i;
} }, J = (t, e) => !$e(t, e), ee = { attribute: !0, type: String, converter: W, reflect: !1, useDefault: !1, hasChanged: J };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), v.litPropertyMetadata ?? (v.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let E = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, i = ee) {
    if (i.state && (i.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((i = Object.create(i)).wrapped = !0), this.elementProperties.set(e, i), !i.noAccessor) {
      const s = Symbol(), o = this.getPropertyDescriptor(e, s, i);
      o !== void 0 && ve(this.prototype, e, o);
    }
  }
  static getPropertyDescriptor(e, i, s) {
    const { get: o, set: n } = we(this.prototype, e) ?? { get() {
      return this[i];
    }, set(r) {
      this[i] = r;
    } };
    return { get: o, set(r) {
      const l = o?.call(this);
      n?.call(this, r), this.requestUpdate(e, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ee;
  }
  static _$Ei() {
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const e = Se(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(U("properties"))) {
      const i = this.properties, s = [...be(i), ...Ae(i)];
      for (const o of s) this.createProperty(o, i[o]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const i = litPropertyMetadata.get(e);
      if (i !== void 0) for (const [s, o] of i) this.elementProperties.set(s, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [i, s] of this.elementProperties) {
      const o = this._$Eu(i, s);
      o !== void 0 && this._$Eh.set(o, i);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const i = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const o of s) i.unshift(Q(o));
    } else e !== void 0 && i.push(Q(e));
    return i;
  }
  static _$Eu(e, i) {
    const s = i.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof e == "string" ? e.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((e) => this.enableUpdating = e), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((e) => e(this));
  }
  addController(e) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(e), this.renderRoot !== void 0 && this.isConnected && e.hostConnected?.();
  }
  removeController(e) {
    this._$EO?.delete(e);
  }
  _$E_() {
    const e = /* @__PURE__ */ new Map(), i = this.constructor.elementProperties;
    for (const s of i.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ye(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, i, s) {
    this._$AK(e, s);
  }
  _$ET(e, i) {
    const s = this.constructor.elementProperties.get(e), o = this.constructor._$Eu(e, s);
    if (o !== void 0 && s.reflect === !0) {
      const n = (s.converter?.toAttribute !== void 0 ? s.converter : W).toAttribute(i, s.type);
      this._$Em = e, n == null ? this.removeAttribute(o) : this.setAttribute(o, n), this._$Em = null;
    }
  }
  _$AK(e, i) {
    const s = this.constructor, o = s._$Eh.get(e);
    if (o !== void 0 && this._$Em !== o) {
      const n = s.getPropertyOptions(o), r = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : W;
      this._$Em = o;
      const l = r.fromAttribute(i, n.type);
      this[o] = l ?? this._$Ej?.get(o) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, i, s, o = !1, n) {
    if (e !== void 0) {
      const r = this.constructor;
      if (o === !1 && (n = this[e]), s ?? (s = r.getPropertyOptions(e)), !((s.hasChanged ?? J)(n, i) || s.useDefault && s.reflect && n === this._$Ej?.get(e) && !this.hasAttribute(r._$Eu(e, s)))) return;
      this.C(e, i, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, i, { useDefault: s, reflect: o, wrapped: n }, r) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, r ?? i ?? this[e]), n !== !0 || r !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (i = void 0), this._$AL.set(e, i)), o === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (i) {
      Promise.reject(i);
    }
    const e = this.scheduleUpdate();
    return e != null && await e, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [o, n] of this._$Ep) this[o] = n;
        this._$Ep = void 0;
      }
      const s = this.constructor.elementProperties;
      if (s.size > 0) for (const [o, n] of s) {
        const { wrapped: r } = n, l = this[o];
        r !== !0 || this._$AL.has(o) || l === void 0 || this.C(o, void 0, n, l);
      }
    }
    let e = !1;
    const i = this._$AL;
    try {
      e = this.shouldUpdate(i), e ? (this.willUpdate(i), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(i)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(i);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((i) => i.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = !1;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(e) {
    return !0;
  }
  update(e) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((i) => this._$ET(i, this[i]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
E.elementStyles = [], E.shadowRootOptions = { mode: "open" }, E[U("elementProperties")] = /* @__PURE__ */ new Map(), E[U("finalized")] = /* @__PURE__ */ new Map(), Ee?.({ ReactiveElement: E }), (v.reactiveElementVersions ?? (v.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const O = globalThis, te = (t) => t, q = O.trustedTypes, ie = q ? q.createPolicy("lit-html", { createHTML: (t) => t }) : void 0, _e = "$lit$", $ = `lit$${Math.random().toFixed(9).slice(2)}$`, pe = "?" + $, ze = `<${pe}>`, x = document, N = () => x.createComment(""), R = (t) => t === null || typeof t != "object" && typeof t != "function", Y = Array.isArray, Ce = (t) => Y(t) || typeof t?.[Symbol.iterator] == "function", V = `[ 	
\f\r]`, T = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, se = /-->/g, oe = />/g, A = RegExp(`>|${V}(?:([^\\s"'>=/]+)(${V}*=${V}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ne = /'/g, re = /"/g, ue = /^(?:script|style|textarea|title)$/i, ke = (t) => (e, ...i) => ({ _$litType$: t, strings: e, values: i }), g = ke(1), C = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), ae = /* @__PURE__ */ new WeakMap(), S = x.createTreeWalker(x, 129);
function fe(t, e) {
  if (!Y(t) || !t.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ie !== void 0 ? ie.createHTML(e) : e;
}
const Pe = (t, e) => {
  const i = t.length - 1, s = [];
  let o, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = T;
  for (let l = 0; l < i; l++) {
    const a = t[l];
    let d, _, c = -1, m = 0;
    for (; m < a.length && (r.lastIndex = m, _ = r.exec(a), _ !== null); ) m = r.lastIndex, r === T ? _[1] === "!--" ? r = se : _[1] !== void 0 ? r = oe : _[2] !== void 0 ? (ue.test(_[2]) && (o = RegExp("</" + _[2], "g")), r = A) : _[3] !== void 0 && (r = A) : r === A ? _[0] === ">" ? (r = o ?? T, c = -1) : _[1] === void 0 ? c = -2 : (c = r.lastIndex - _[2].length, d = _[1], r = _[3] === void 0 ? A : _[3] === '"' ? re : ne) : r === re || r === ne ? r = A : r === se || r === oe ? r = T : (r = A, o = void 0);
    const y = r === A && t[l + 1].startsWith("/>") ? " " : "";
    n += r === T ? a + ze : c >= 0 ? (s.push(d), a.slice(0, c) + _e + a.slice(c) + $ + y) : a + $ + (c === -2 ? l : y);
  }
  return [fe(t, n + (t[i] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class H {
  constructor({ strings: e, _$litType$: i }, s) {
    let o;
    this.parts = [];
    let n = 0, r = 0;
    const l = e.length - 1, a = this.parts, [d, _] = Pe(e, i);
    if (this.el = H.createElement(d, s), S.currentNode = this.el.content, i === 2 || i === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (o = S.nextNode()) !== null && a.length < l; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const c of o.getAttributeNames()) if (c.endsWith(_e)) {
          const m = _[r++], y = o.getAttribute(c).split($), L = /([.?@])?(.*)/.exec(m);
          a.push({ type: 1, index: n, name: L[2], strings: y, ctor: L[1] === "." ? Ue : L[1] === "?" ? Oe : L[1] === "@" ? Me : F }), o.removeAttribute(c);
        } else c.startsWith($) && (a.push({ type: 6, index: n }), o.removeAttribute(c));
        if (ue.test(o.tagName)) {
          const c = o.textContent.split($), m = c.length - 1;
          if (m > 0) {
            o.textContent = q ? q.emptyScript : "";
            for (let y = 0; y < m; y++) o.append(c[y], N()), S.nextNode(), a.push({ type: 2, index: ++n });
            o.append(c[m], N());
          }
        }
      } else if (o.nodeType === 8) if (o.data === pe) a.push({ type: 2, index: n });
      else {
        let c = -1;
        for (; (c = o.data.indexOf($, c + 1)) !== -1; ) a.push({ type: 7, index: n }), c += $.length - 1;
      }
      n++;
    }
  }
  static createElement(e, i) {
    const s = x.createElement("template");
    return s.innerHTML = e, s;
  }
}
function k(t, e, i = t, s) {
  if (e === C) return e;
  let o = s !== void 0 ? i._$Co?.[s] : i._$Cl;
  const n = R(e) ? void 0 : e._$litDirective$;
  return o?.constructor !== n && (o?._$AO?.(!1), n === void 0 ? o = void 0 : (o = new n(t), o._$AT(t, i, s)), s !== void 0 ? (i._$Co ?? (i._$Co = []))[s] = o : i._$Cl = o), o !== void 0 && (e = k(t, o._$AS(t, e.values), o, s)), e;
}
class Te {
  constructor(e, i) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = i;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: i }, parts: s } = this._$AD, o = (e?.creationScope ?? x).importNode(i, !0);
    S.currentNode = o;
    let n = S.nextNode(), r = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (r === a.index) {
        let d;
        a.type === 2 ? d = new D(n, n.nextSibling, this, e) : a.type === 1 ? d = new a.ctor(n, a.name, a.strings, this, e) : a.type === 6 && (d = new Ne(n, this, e)), this._$AV.push(d), a = s[++l];
      }
      r !== a?.index && (n = S.nextNode(), r++);
    }
    return S.currentNode = x, o;
  }
  p(e) {
    let i = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, i), i += s.strings.length - 2) : s._$AI(e[i])), i++;
  }
}
class D {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, i, s, o) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = i, this._$AM = s, this.options = o, this._$Cv = o?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const i = this._$AM;
    return i !== void 0 && e?.nodeType === 11 && (e = i.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, i = this) {
    e = k(this, e, i), R(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== C && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ce(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && R(this._$AH) ? this._$AA.nextSibling.data = e : this.T(x.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: i, _$litType$: s } = e, o = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = H.createElement(fe(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === o) this._$AH.p(i);
    else {
      const n = new Te(o, this), r = n.u(this.options);
      n.p(i), this.T(r), this._$AH = n;
    }
  }
  _$AC(e) {
    let i = ae.get(e.strings);
    return i === void 0 && ae.set(e.strings, i = new H(e)), i;
  }
  k(e) {
    Y(this._$AH) || (this._$AH = [], this._$AR());
    const i = this._$AH;
    let s, o = 0;
    for (const n of e) o === i.length ? i.push(s = new D(this.O(N()), this.O(N()), this, this.options)) : s = i[o], s._$AI(n), o++;
    o < i.length && (this._$AR(s && s._$AB.nextSibling, o), i.length = o);
  }
  _$AR(e = this._$AA.nextSibling, i) {
    for (this._$AP?.(!1, !0, i); e !== this._$AB; ) {
      const s = te(e).nextSibling;
      te(e).remove(), e = s;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class F {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, i, s, o, n) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = i, this._$AM = o, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(e, i = this, s, o) {
    const n = this.strings;
    let r = !1;
    if (n === void 0) e = k(this, e, i, 0), r = !R(e) || e !== this._$AH && e !== C, r && (this._$AH = e);
    else {
      const l = e;
      let a, d;
      for (e = n[0], a = 0; a < n.length - 1; a++) d = k(this, l[s + a], i, a), d === C && (d = this._$AH[a]), r || (r = !R(d) || d !== this._$AH[a]), d === h ? e = h : e !== h && (e += (d ?? "") + n[a + 1]), this._$AH[a] = d;
    }
    r && !o && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ue extends F {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class Oe extends F {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class Me extends F {
  constructor(e, i, s, o, n) {
    super(e, i, s, o, n), this.type = 5;
  }
  _$AI(e, i = this) {
    if ((e = k(this, e, i, 0) ?? h) === C) return;
    const s = this._$AH, o = e === h && s !== h || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, n = e !== h && (s === h || o);
    o && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Ne {
  constructor(e, i, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = i, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    k(this, e);
  }
}
const Re = O.litHtmlPolyfillSupport;
Re?.(H, D), (O.litHtmlVersions ?? (O.litHtmlVersions = [])).push("3.3.3");
const He = (t, e, i) => {
  const s = i?.renderBefore ?? e;
  let o = s._$litPart$;
  if (o === void 0) {
    const n = i?.renderBefore ?? null;
    s._$litPart$ = o = new D(e.insertBefore(N(), n), n, void 0, i ?? {});
  }
  return o._$AI(t), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const M = globalThis;
class z extends E {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var i;
    const e = super.createRenderRoot();
    return (i = this.renderOptions).renderBefore ?? (i.renderBefore = e.firstChild), e;
  }
  update(e) {
    const i = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = He(i, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return C;
  }
}
z._$litElement$ = !0, z.finalized = !0, M.litElementHydrateSupport?.({ LitElement: z });
const De = M.litElementPolyfillSupport;
De?.({ LitElement: z });
(M.litElementVersions ?? (M.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const me = (t) => (e, i) => {
  i !== void 0 ? i.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const je = { attribute: !0, type: String, converter: W, reflect: !1, hasChanged: J }, Le = (t = je, e, i) => {
  const { kind: s, metadata: o } = i;
  let n = globalThis.litPropertyMetadata.get(o);
  if (n === void 0 && globalThis.litPropertyMetadata.set(o, n = /* @__PURE__ */ new Map()), s === "setter" && ((t = Object.create(t)).wrapped = !0), n.set(i.name, t), s === "accessor") {
    const { name: r } = i;
    return { set(l) {
      const a = e.get.call(this);
      e.set.call(this, l), this.requestUpdate(r, a, t, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(r, void 0, t, l), l;
    } };
  }
  if (s === "setter") {
    const { name: r } = i;
    return function(l) {
      const a = this[r];
      e.call(this, l), this.requestUpdate(r, a, t, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function j(t) {
  return (e, i) => typeof i == "object" ? Le(t, e, i) : ((s, o, n) => {
    const r = o.hasOwnProperty(n);
    return o.constructor.createProperty(n, s), r ? Object.getOwnPropertyDescriptor(o, n) : void 0;
  })(t, e, i);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function f(t) {
  return j({ ...t, state: !0, attribute: !1 });
}
const P = "ha_reminders";
async function Be(t, e) {
  const i = await t.callService(P, "create", e);
  return String(i?.reminder_id ?? "");
}
async function Ie(t, e, i) {
  await t.callService(P, "update", {
    reminder_id: e,
    ...i
  });
}
async function We(t, e) {
  await t.callService(P, "delete", { reminder_id: e });
}
async function qe(t, e, i) {
  await t.callService(P, "snooze", {
    reminder_id: e,
    minutes: i
  });
}
async function Fe(t, e) {
  await t.callService(P, "complete", { reminder_id: e });
}
async function Ve(t, e, i) {
  await t.callService(P, "set_enabled", {
    reminder_id: e,
    enabled: i
  });
}
var Ze = Object.defineProperty, Ke = Object.getOwnPropertyDescriptor, w = (t, e, i, s) => {
  for (var o = s > 1 ? void 0 : s ? Ke(e, i) : e, n = t.length - 1, r; n >= 0; n--)
    (r = t[n]) && (o = (s ? r(e, i, o) : r(o)) || o);
  return s && o && Ze(e, i, o), o;
};
const le = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" }
], Je = {
  title: "Title",
  subtitle: "Subtitle",
  message: "Message",
  notify_service: "Notification service",
  user_name: "User name (who the reminder is for)",
  trigger_type: "Trigger",
  one_shot: "Only once",
  time: "Time",
  every_x_days: "Repeat every N days",
  start_date: "Start date",
  stop_date: "Stop date",
  exclude_days_of_week: "Exclude these days",
  zone_entity_id: "Zone",
  person_entity_ids: "Watch these persons",
  time_window_start: "Only fire from",
  time_window_end: "Only fire until",
  acknowledge_action_title: "Acknowledge action title",
  snooze_delays: "Snooze delays (minutes, comma separated)",
  snooze_text: "Snooze action text",
  wait_time_if_no_action: "Resend after (minutes)",
  notification_count: "Maximum notifications",
  color: "Color (Android)",
  channel: "Channel (Android)",
  channel_importance: "Channel importance",
  notification_group: "Notification group",
  acknowledge_notification_title: "Completion title (group)",
  acknowledge_notification_body: "Completion message (group)"
};
let p = class extends z {
  constructor() {
    super(...arguments), this.reminder = null, this.open = !1, this._data = {}, this._saving = !1, this._error = "", this._notifyServices = [];
  }
  willUpdate(t) {
    t.has("open") && this.open && (this._data = this._dataFrom(this.reminder), this._error = "", this._saving = !1, this._loadNotifyServices());
  }
  _time(t) {
    return t ? t.length === 5 ? `${t}:00` : t : "";
  }
  _dataFrom(t) {
    return {
      title: t?.title ?? "",
      subtitle: t?.subtitle ?? "",
      message: t?.message ?? "",
      notify_service: t?.notify_service ?? "",
      user_name: t?.user_name ?? "",
      trigger_type: t?.trigger_type ?? "time",
      one_shot: t?.one_shot ?? !1,
      time: this._time(t?.time),
      every_x_days: t?.every_x_days ?? 1,
      start_date: t?.start_date ?? "",
      stop_date: t?.stop_date ?? "",
      exclude_days_of_week: (t?.exclude_days_of_week ?? []).map(String),
      zone_entity_id: t?.zone_entity_id ?? "",
      person_entity_ids: t?.person_entity_ids ?? [],
      time_window_start: this._time(t?.time_window_start),
      time_window_end: this._time(t?.time_window_end),
      acknowledge_action_title: t?.acknowledge_action_title ?? "Mark as done",
      snooze_delays: (t?.snooze_delays ?? [5, 15, 30, 45, 60]).join(","),
      snooze_text: t?.snooze_text ?? "Snooze for ${time}",
      wait_time_if_no_action: t?.wait_time_if_no_action ?? 15,
      notification_count: t?.notification_count ?? 100,
      color: t?.color ?? "",
      channel: t?.channel ?? "",
      channel_importance: t?.channel_importance ?? "",
      notification_group: t?.notification_group ?? "",
      acknowledge_notification_title: t?.acknowledge_notification_title ?? "Someone acknowledged the notification",
      acknowledge_notification_body: t?.acknowledge_notification_body ?? ""
    };
  }
  async _loadNotifyServices() {
    try {
      const t = await this.hass.callWS({ type: "get_services" }), e = /* @__PURE__ */ new Set(["notify", "persistent_notification", "send_message"]), i = /* @__PURE__ */ new Set();
      Object.keys(t).forEach((s) => {
        s === "notify" ? Object.keys(t[s] ?? {}).forEach((o) => {
          e.has(o) || i.add(`notify.${o}`);
        }) : t[s]?.notify && i.add(s);
      }), this._notifyServices = [...i].sort();
    } catch {
      this._notifyServices = [];
    }
  }
  _notifyField() {
    const t = String(this._data.notify_service ?? "");
    return {
      name: "notify_service",
      selector: { select: { mode: "dropdown", custom_value: !0, options: [.../* @__PURE__ */ new Set([...this._notifyServices, t])].filter(Boolean).map((i) => ({ value: i, label: i })) } }
    };
  }
  _schema() {
    const e = (this._data.trigger_type ?? "time") !== "time", i = [
      { name: "title", selector: { text: {} }, required: !0 },
      { name: "message", selector: { text: { multiline: !0 } }, required: !0 },
      { name: "subtitle", selector: { text: {} } },
      this._notifyField(),
      { name: "user_name", selector: { text: {} } },
      {
        name: "trigger_type",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "time", label: "At a fixed time" },
              { value: "zone_enter", label: "When I enter a zone" },
              { value: "zone_leave", label: "When I leave a zone" }
            ]
          }
        }
      },
      { name: "one_shot", selector: { boolean: {} } }
    ], s = e ? [
      { name: "zone_entity_id", selector: { entity: { domain: "zone" } } },
      {
        name: "person_entity_ids",
        selector: { entity: { domain: "person", multiple: !0 } }
      },
      { name: "time_window_start", selector: { time: {} } },
      { name: "time_window_end", selector: { time: {} } },
      { name: "start_date", selector: { date: {} } },
      { name: "stop_date", selector: { date: {} } },
      { name: "exclude_days_of_week", selector: { select: { multiple: !0, options: le } } }
    ] : [
      { name: "time", selector: { time: {} } },
      { name: "every_x_days", selector: { number: { min: 1, mode: "box" } } },
      { name: "start_date", selector: { date: {} } },
      { name: "stop_date", selector: { date: {} } },
      { name: "exclude_days_of_week", selector: { select: { multiple: !0, options: le } } }
    ], o = [
      { name: "acknowledge_action_title", selector: { text: {} } },
      { name: "snooze_delays", selector: { text: {} } },
      { name: "snooze_text", selector: { text: {} } },
      { name: "wait_time_if_no_action", selector: { number: { min: 1, mode: "box" } } },
      { name: "notification_count", selector: { number: { min: 1, mode: "box" } } },
      {
        name: "channel_importance",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "", label: "Default" },
              { value: "min", label: "Min" },
              { value: "low", label: "Low" },
              { value: "high", label: "High" },
              { value: "max", label: "Max" }
            ]
          }
        }
      },
      { name: "channel", selector: { text: {} } },
      { name: "color", selector: { text: {} } },
      { name: "notification_group", selector: { text: {} } },
      { name: "acknowledge_notification_title", selector: { text: {} } },
      { name: "acknowledge_notification_body", selector: { text: { multiline: !0 } } }
    ];
    return [...i, ...s, ...o];
  }
  _valueChanged(t) {
    t.stopPropagation(), this._data = { ...t.detail.value };
  }
  _validationError() {
    const t = this._data;
    if (!String(t.title ?? "").trim()) return "A title is required.";
    if (!String(t.message ?? "").trim()) return "A message is required.";
    if (t.trigger_type === "time") {
      if (!t.time) return "Pick a time for the reminder.";
    } else {
      if (!t.zone_entity_id) return "Pick a zone to watch.";
      if (!t.person_entity_ids?.length)
        return "Pick at least one person to watch.";
    }
    return "";
  }
  _orUndefined(t) {
    if (!(t === "" || t === null) && !(Array.isArray(t) && t.length === 0))
      return t;
  }
  async _save() {
    if (this._saving) return;
    const t = this._validationError();
    if (t) {
      this._error = t;
      return;
    }
    this._saving = !0, this._error = "";
    const e = this._data, i = {
      title: String(e.title).trim(),
      message: String(e.message).trim(),
      subtitle: this._orUndefined(e.subtitle),
      notify_service: this._orUndefined(e.notify_service),
      user_name: this._orUndefined(e.user_name),
      trigger_type: e.trigger_type ?? "time",
      one_shot: !!e.one_shot,
      time: this._orUndefined(e.time),
      every_x_days: e.every_x_days ?? 1,
      start_date: this._orUndefined(e.start_date),
      stop_date: this._orUndefined(e.stop_date),
      exclude_days_of_week: e.exclude_days_of_week ?? [],
      zone_entity_id: this._orUndefined(e.zone_entity_id),
      person_entity_ids: e.person_entity_ids ?? [],
      time_window_start: this._orUndefined(e.time_window_start),
      time_window_end: this._orUndefined(e.time_window_end),
      acknowledge_action_title: this._orUndefined(e.acknowledge_action_title),
      snooze_delays: String(e.snooze_delays ?? "").split(",").map((s) => parseInt(s.trim(), 10)).filter((s) => !Number.isNaN(s) && s > 0),
      snooze_text: this._orUndefined(e.snooze_text),
      wait_time_if_no_action: e.wait_time_if_no_action,
      notification_count: e.notification_count,
      color: this._orUndefined(e.color),
      channel: this._orUndefined(e.channel),
      channel_importance: this._orUndefined(e.channel_importance),
      notification_group: this._orUndefined(e.notification_group),
      acknowledge_notification_title: this._orUndefined(
        e.acknowledge_notification_title
      ),
      acknowledge_notification_body: this._orUndefined(
        e.acknowledge_notification_body
      )
    };
    try {
      this.reminder ? await Ie(this.hass, this.reminder.id, i) : await Be(this.hass, i), this.dispatchEvent(new CustomEvent("saved")), this.open = !1;
    } catch (s) {
      this._error = s instanceof Error ? s.message : "Failed to save the reminder.";
    } finally {
      this._saving = !1;
    }
  }
  render() {
    return g`
      <ha-dialog
        open="${this.open}"
        .heading=${this.reminder ? "Edit reminder" : "New reminder"}
        @closed=${() => {
      this.open = !1, this.dispatchEvent(new CustomEvent("closed"));
    }}
      >
        <div class="editor">
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${this._schema()}
            .computeLabel=${(t) => Je[t.name] ?? t.name}
            @value-changed=${this._valueChanged}
          ></ha-form>
          ${this._error ? g`<div class="error">${this._error}</div>` : h}
        </div>

        <ha-button
          slot="primaryAction"
          .disabled=${this._saving}
          @click=${this._save}
        >
          ${this.reminder ? "Save" : "Create"}
        </ha-button>
        <ha-button slot="secondaryAction" @click=${() => this.open = !1}>
          Cancel
        </ha-button>
      </ha-dialog>
    `;
  }
};
p.styles = de`
    .editor {
      display: block;
      min-width: min(560px, 80vw);
    }
    .error {
      color: var(--error-color, #db4437);
      padding: 8px 0 0;
    }
  `;
w([
  j({ attribute: !1 })
], p.prototype, "hass", 2);
w([
  j({ attribute: !1 })
], p.prototype, "reminder", 2);
w([
  j({ type: Boolean })
], p.prototype, "open", 2);
w([
  f()
], p.prototype, "_data", 2);
w([
  f()
], p.prototype, "_saving", 2);
w([
  f()
], p.prototype, "_error", 2);
w([
  f()
], p.prototype, "_notifyServices", 2);
p = w([
  me("ha-reminders-editor")
], p);
var Ye = Object.defineProperty, Ge = Object.getOwnPropertyDescriptor, b = (t, e, i, s) => {
  for (var o = s > 1 ? void 0 : s ? Ge(e, i) : e, n = t.length - 1, r; n >= 0; n--)
    (r = t[n]) && (o = (s ? r(e, i, o) : r(o)) || o);
  return s && o && Ye(e, i, o), o;
};
const Qe = {
  scheduled: "Scheduled",
  active: "Active",
  snoozed: "Snoozed",
  completed: "Completed",
  disabled: "Disabled"
};
function B(t) {
  return t.status ?? "scheduled";
}
function ce(t) {
  return t ? t.replace("zone.", "").replace(/_/g, " ") : "";
}
function Xe(t) {
  if (!t) return "";
  const e = new Date(t);
  if (Number.isNaN(e.getTime())) return t;
  const i = e.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
  return e.toLocaleString(void 0, {
    month: "short",
    day: "numeric",
    ...i ? {} : { weekday: "short" },
    hour: "2-digit",
    minute: "2-digit"
  });
}
let u = class extends z {
  constructor() {
    super(...arguments), this._config = {}, this._editorOpen = !1, this._editing = null, this._snoozeTarget = null, this._snoozeMinutes = 15, this._deleteArmed = null;
  }
  setConfig(t) {
    const e = String(t.type ?? "").replace(/^custom:/, "");
    if (e && e !== "ha-reminders-card")
      throw new Error("Invalid card type");
    this._config = { ...t };
  }
  getCardSize() {
    return 3;
  }
  static getStubConfig() {
    return {};
  }
  _reminders() {
    return this.hass ? Object.values(this.hass.states).filter(
      (t) => t.entity_id.startsWith("sensor.ha_reminder_") && typeof t.attributes.reminder_id == "string"
    ).map((t) => t.attributes).sort((t, e) => {
      const i = {
        active: 0,
        snoozed: 1,
        scheduled: 2,
        completed: 3,
        disabled: 4
      };
      return (i[B(t)] ?? 9) - (i[B(e)] ?? 9);
    }) : [];
  }
  _openNew() {
    this._editing = null, this._editorOpen = !0;
  }
  _openEdit(t) {
    this._editing = t, this._editorOpen = !0;
  }
  _openSnooze(t) {
    this._snoozeTarget = t, this._snoozeMinutes = 15;
  }
  async _snooze() {
    this._snoozeTarget && (await qe(
      this.hass,
      this._snoozeTarget.id,
      this._snoozeMinutes
    ), this._snoozeTarget = null);
  }
  async _complete(t) {
    await Fe(this.hass, t.id);
  }
  async _toggleEnabled(t, e) {
    await Ve(this.hass, t.id, e);
  }
  _armDelete(t) {
    if (this._deleteArmed === t.id) {
      this._deleteArmed = null, this._deleteTimer !== void 0 && (window.clearTimeout(this._deleteTimer), this._deleteTimer = void 0), We(this.hass, t.id);
      return;
    }
    this._deleteArmed = t.id, this._deleteTimer !== void 0 && window.clearTimeout(this._deleteTimer), this._deleteTimer = window.setTimeout(() => {
      this._deleteArmed = null, this._deleteTimer = void 0;
    }, 3e3);
  }
  _triggerText(t) {
    return t.trigger_type === "zone_enter" ? `When you enter ${ce(t.zone_entity_id)}` : t.trigger_type === "zone_leave" ? `When you leave ${ce(t.zone_entity_id)}` : Xe(t.next_fire) || "Scheduled";
  }
  _statusChip(t) {
    const e = B(t);
    return e === "disabled" ? h : g`<span class="chip ${e}">${Qe[e]}</span>`;
  }
  render() {
    if (!this.hass) return h;
    const t = this._reminders(), e = this._config.title ?? "Reminders";
    return g`
      <ha-card class="card">
        <div class="header">
          <span class="title">${e}</span>
          <ha-icon-button
            label="New reminder"
            @click=${this._openNew}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </ha-icon-button>
        </div>

        ${t.length === 0 ? g`<div class="empty">No reminders yet — add one with +</div>` : t.map(
      (i) => g`
                <div class="row">
                  <ha-icon
                    icon=${i.trigger_type === "time" ? "mdi:clock-outline" : i.trigger_type === "zone_enter" ? "mdi:home-import-outline" : "mdi:home-export-outline"}
                  ></ha-icon>
                  <div class="row-text">
                    <div class="row-title">${i.title}</div>
                    <div class="row-sub">
                      ${this._triggerText(i)}
                      ${i.notified_count ? g` · notified ${i.notified_count}
                            ×` : ""}
                    </div>
                  </div>
                  ${this._statusChip(i)}
                  <div class="actions">
                    ${B(i) === "disabled" ? h : g`
                          <ha-icon-button
                            label="Complete"
                            @click=${() => this._complete(i)}
                          >
                            <ha-icon icon="mdi:check"></ha-icon>
                          </ha-icon-button>
                          <ha-icon-button
                            label="Snooze"
                            @click=${() => this._openSnooze(i)}
                          >
                            <ha-icon icon="mdi:clock-outline"></ha-icon>
                          </ha-icon-button>
                        `}
                    <ha-icon-button
                      label="Edit"
                      @click=${() => this._openEdit(i)}
                    >
                      <ha-icon icon="mdi:pencil"></ha-icon>
                    </ha-icon-button>
                    <ha-icon-button
                      class="danger"
                      label=${this._deleteArmed === i.id ? "Confirm delete" : "Delete"}
                      @click=${() => this._armDelete(i)}
                    >
                      <ha-icon
                        icon=${this._deleteArmed === i.id ? "mdi:check" : "mdi:delete"}
                      ></ha-icon>
                    </ha-icon-button>
                  </div>
                  <ha-switch
                    .checked=${i.enabled}
                    @change=${(s) => this._toggleEnabled(
        i,
        s.target.checked
      )}
                  ></ha-switch>
                </div>
              `
    )}
      </ha-card>

      <ha-reminders-editor
        .hass=${this.hass}
        .reminder=${this._editing}
        .open=${this._editorOpen}
        @saved=${() => this._editorOpen = !1}
        @closed=${() => this._editorOpen = !1}
      ></ha-reminders-editor>

      <ha-dialog
        open=${this._snoozeTarget !== null}
        .heading=${this._snoozeTarget ? `Snooze "${this._snoozeTarget.title}"` : ""}
        @closed=${() => this._snoozeTarget = null}
      >
        <ha-selector
          .hass=${this.hass}
          .selector=${{ number: { min: 1, mode: "box" } }}
          .label=${"Minutes"}
          .value=${this._snoozeMinutes}
          @value-changed=${(i) => {
      i.stopPropagation(), this._snoozeMinutes = Number(i.detail.value) || 15;
    }}
        ></ha-selector>
        <div class="snooze-quick">
          ${[5, 15, 30, 60].map(
      (i) => g`
              <ha-button
                @click=${() => this._snoozeMinutes = i}
                >${i} min</ha-button
              >
            `
    )}
        </div>
        <ha-button slot="primaryAction" @click=${this._snooze}
          >Snooze</ha-button
        >
        <ha-button
          slot="secondaryAction"
          @click=${() => this._snoozeTarget = null}
          >Cancel</ha-button
        >
      </ha-dialog>
    `;
  }
};
u.styles = de`
    .card {
      font-family: var(--primary-font-family, inherit);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 8px;
    }
    .title {
      font-size: 18px;
      font-weight: 500;
    }
    .empty {
      color: var(--secondary-text-color);
      padding: 24px 0;
      text-align: center;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 4px;
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }
    .row-text {
      flex: 1;
      min-width: 0;
    }
    .row-title {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .row-sub {
      color: var(--secondary-text-color);
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chip {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: 10px;
      white-space: nowrap;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
    }
    .chip.active {
      background: var(--warning-color, #ffa726);
      color: #fff;
    }
    .chip.snoozed {
      background: var(--info-color, #42a5f5);
      color: #fff;
    }
    .chip.completed {
      background: var(--success-color, #4caf50);
      color: #fff;
    }
    .chip.disabled {
      opacity: 0.6;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: 2px;
      flex-shrink: 0;
    }
    .actions .danger {
      color: var(--error-color, #db4437);
    }
    .new-btn {
      margin-top: 12px;
      width: 100%;
    }
    .snooze-quick {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
  `;
b([
  j({ attribute: !1 })
], u.prototype, "hass", 2);
b([
  f()
], u.prototype, "_config", 2);
b([
  f()
], u.prototype, "_editorOpen", 2);
b([
  f()
], u.prototype, "_editing", 2);
b([
  f()
], u.prototype, "_snoozeTarget", 2);
b([
  f()
], u.prototype, "_snoozeMinutes", 2);
b([
  f()
], u.prototype, "_deleteArmed", 2);
u = b([
  me("ha-reminders-card")
], u);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "ha-reminders-card",
  name: "HA Reminders",
  description: "View, edit, snooze and complete your reminders."
});
export {
  u as HaRemindersCard
};

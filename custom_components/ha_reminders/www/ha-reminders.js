/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const I = globalThis, Z = I.ShadowRoot && (I.ShadyCSS === void 0 || I.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, K = Symbol(), G = /* @__PURE__ */ new WeakMap();
let he = class {
  constructor(e, t, s) {
    if (this._$cssResult$ = !0, s !== K) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Z && e === void 0) {
      const s = t !== void 0 && t.length === 1;
      s && (e = G.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && G.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const $e = (i) => new he(typeof i == "string" ? i : i + "", void 0, K), ce = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((s, o, n) => s + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + i[n + 1], i[0]);
  return new he(t, i, K);
}, me = (i, e) => {
  if (Z) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const s = document.createElement("style"), o = I.litNonce;
    o !== void 0 && s.setAttribute("nonce", o), s.textContent = t.cssText, i.appendChild(s);
  }
}, Q = Z ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const s of e.cssRules) t += s.cssText;
  return $e(t);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: ve, defineProperty: ge, getOwnPropertyDescriptor: ye, getOwnPropertyNames: we, getOwnPropertySymbols: be, getPrototypeOf: xe } = Object, y = globalThis, X = y.trustedTypes, Ae = X ? X.emptyScript : "", Se = y.reactiveElementPolyfillSupport, k = (i, e) => i, B = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? Ae : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, e) {
  let t = i;
  switch (e) {
    case Boolean:
      t = i !== null;
      break;
    case Number:
      t = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(i);
      } catch {
        t = null;
      }
  }
  return t;
} }, J = (i, e) => !ve(i, e), ee = { attribute: !0, type: String, converter: B, reflect: !1, useDefault: !1, hasChanged: J };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), y.litPropertyMetadata ?? (y.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let E = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = ee) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const s = Symbol(), o = this.getPropertyDescriptor(e, s, t);
      o !== void 0 && ge(this.prototype, e, o);
    }
  }
  static getPropertyDescriptor(e, t, s) {
    const { get: o, set: n } = ye(this.prototype, e) ?? { get() {
      return this[t];
    }, set(r) {
      this[t] = r;
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
    if (this.hasOwnProperty(k("elementProperties"))) return;
    const e = xe(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(k("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(k("properties"))) {
      const t = this.properties, s = [...we(t), ...be(t)];
      for (const o of s) this.createProperty(o, t[o]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [s, o] of t) this.elementProperties.set(s, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, s] of this.elementProperties) {
      const o = this._$Eu(t, s);
      o !== void 0 && this._$Eh.set(o, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const s = new Set(e.flat(1 / 0).reverse());
      for (const o of s) t.unshift(Q(o));
    } else e !== void 0 && t.push(Q(e));
    return t;
  }
  static _$Eu(e, t) {
    const s = t.attribute;
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
    const e = /* @__PURE__ */ new Map(), t = this.constructor.elementProperties;
    for (const s of t.keys()) this.hasOwnProperty(s) && (e.set(s, this[s]), delete this[s]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return me(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, s) {
    this._$AK(e, s);
  }
  _$ET(e, t) {
    const s = this.constructor.elementProperties.get(e), o = this.constructor._$Eu(e, s);
    if (o !== void 0 && s.reflect === !0) {
      const n = (s.converter?.toAttribute !== void 0 ? s.converter : B).toAttribute(t, s.type);
      this._$Em = e, n == null ? this.removeAttribute(o) : this.setAttribute(o, n), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const s = this.constructor, o = s._$Eh.get(e);
    if (o !== void 0 && this._$Em !== o) {
      const n = s.getPropertyOptions(o), r = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : B;
      this._$Em = o;
      const l = r.fromAttribute(t, n.type);
      this[o] = l ?? this._$Ej?.get(o) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, t, s, o = !1, n) {
    if (e !== void 0) {
      const r = this.constructor;
      if (o === !1 && (n = this[e]), s ?? (s = r.getPropertyOptions(e)), !((s.hasChanged ?? J)(n, t) || s.useDefault && s.reflect && n === this._$Ej?.get(e) && !this.hasAttribute(r._$Eu(e, s)))) return;
      this.C(e, t, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: s, reflect: o, wrapped: n }, r) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, r ?? t ?? this[e]), n !== !0 || r !== void 0) || (this._$AL.has(e) || (this.hasUpdated || s || (t = void 0), this._$AL.set(e, t)), o === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (t) {
      Promise.reject(t);
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
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (s) {
      throw e = !1, this._$EM(), s;
    }
    e && this._$AE(t);
  }
  willUpdate(e) {
  }
  _$AE(e) {
    this._$EO?.forEach((t) => t.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(e)), this.updated(e);
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
    this._$Eq && (this._$Eq = this._$Eq.forEach((t) => this._$ET(t, this[t]))), this._$EM();
  }
  updated(e) {
  }
  firstUpdated(e) {
  }
};
E.elementStyles = [], E.shadowRootOptions = { mode: "open" }, E[k("elementProperties")] = /* @__PURE__ */ new Map(), E[k("finalized")] = /* @__PURE__ */ new Map(), Se?.({ ReactiveElement: E }), (y.reactiveElementVersions ?? (y.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const N = globalThis, te = (i) => i, q = N.trustedTypes, ie = q ? q.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, de = "$lit$", g = `lit$${Math.random().toFixed(9).slice(2)}$`, _e = "?" + g, Ee = `<${_e}>`, S = document, U = () => S.createComment(""), R = (i) => i === null || typeof i != "object" && typeof i != "function", Y = Array.isArray, ze = (i) => Y(i) || typeof i?.[Symbol.iterator] == "function", F = `[ 	
\f\r]`, O = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, se = /-->/g, oe = />/g, x = RegExp(`>|${F}(?:([^\\s"'>=/]+)(${F}*=${F}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ne = /'/g, re = /"/g, pe = /^(?:script|style|textarea|title)$/i, Ce = (i) => (e, ...t) => ({ _$litType$: i, strings: e, values: t }), _ = Ce(1), C = Symbol.for("lit-noChange"), c = Symbol.for("lit-nothing"), ae = /* @__PURE__ */ new WeakMap(), A = S.createTreeWalker(S, 129);
function ue(i, e) {
  if (!Y(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ie !== void 0 ? ie.createHTML(e) : e;
}
const Pe = (i, e) => {
  const t = i.length - 1, s = [];
  let o, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = O;
  for (let l = 0; l < t; l++) {
    const a = i[l];
    let d, p, h = -1, m = 0;
    for (; m < a.length && (r.lastIndex = m, p = r.exec(a), p !== null); ) m = r.lastIndex, r === O ? p[1] === "!--" ? r = se : p[1] !== void 0 ? r = oe : p[2] !== void 0 ? (pe.test(p[2]) && (o = RegExp("</" + p[2], "g")), r = x) : p[3] !== void 0 && (r = x) : r === x ? p[0] === ">" ? (r = o ?? O, h = -1) : p[1] === void 0 ? h = -2 : (h = r.lastIndex - p[2].length, d = p[1], r = p[3] === void 0 ? x : p[3] === '"' ? re : ne) : r === re || r === ne ? r = x : r === se || r === oe ? r = O : (r = x, o = void 0);
    const v = r === x && i[l + 1].startsWith("/>") ? " " : "";
    n += r === O ? a + Ee : h >= 0 ? (s.push(d), a.slice(0, h) + de + a.slice(h) + g + v) : a + g + (h === -2 ? l : v);
  }
  return [ue(i, n + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class H {
  constructor({ strings: e, _$litType$: t }, s) {
    let o;
    this.parts = [];
    let n = 0, r = 0;
    const l = e.length - 1, a = this.parts, [d, p] = Pe(e, t);
    if (this.el = H.createElement(d, s), A.currentNode = this.el.content, t === 2 || t === 3) {
      const h = this.el.content.firstChild;
      h.replaceWith(...h.childNodes);
    }
    for (; (o = A.nextNode()) !== null && a.length < l; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const h of o.getAttributeNames()) if (h.endsWith(de)) {
          const m = p[r++], v = o.getAttribute(h).split(g), W = /([.?@])?(.*)/.exec(m);
          a.push({ type: 1, index: n, name: W[2], strings: v, ctor: W[1] === "." ? Oe : W[1] === "?" ? ke : W[1] === "@" ? Ne : V }), o.removeAttribute(h);
        } else h.startsWith(g) && (a.push({ type: 6, index: n }), o.removeAttribute(h));
        if (pe.test(o.tagName)) {
          const h = o.textContent.split(g), m = h.length - 1;
          if (m > 0) {
            o.textContent = q ? q.emptyScript : "";
            for (let v = 0; v < m; v++) o.append(h[v], U()), A.nextNode(), a.push({ type: 2, index: ++n });
            o.append(h[m], U());
          }
        }
      } else if (o.nodeType === 8) if (o.data === _e) a.push({ type: 2, index: n });
      else {
        let h = -1;
        for (; (h = o.data.indexOf(g, h + 1)) !== -1; ) a.push({ type: 7, index: n }), h += g.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const s = S.createElement("template");
    return s.innerHTML = e, s;
  }
}
function P(i, e, t = i, s) {
  if (e === C) return e;
  let o = s !== void 0 ? t._$Co?.[s] : t._$Cl;
  const n = R(e) ? void 0 : e._$litDirective$;
  return o?.constructor !== n && (o?._$AO?.(!1), n === void 0 ? o = void 0 : (o = new n(i), o._$AT(i, t, s)), s !== void 0 ? (t._$Co ?? (t._$Co = []))[s] = o : t._$Cl = o), o !== void 0 && (e = P(i, o._$AS(i, e.values), o, s)), e;
}
class Te {
  constructor(e, t) {
    this._$AV = [], this._$AN = void 0, this._$AD = e, this._$AM = t;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(e) {
    const { el: { content: t }, parts: s } = this._$AD, o = (e?.creationScope ?? S).importNode(t, !0);
    A.currentNode = o;
    let n = A.nextNode(), r = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (r === a.index) {
        let d;
        a.type === 2 ? d = new D(n, n.nextSibling, this, e) : a.type === 1 ? d = new a.ctor(n, a.name, a.strings, this, e) : a.type === 6 && (d = new Me(n, this, e)), this._$AV.push(d), a = s[++l];
      }
      r !== a?.index && (n = A.nextNode(), r++);
    }
    return A.currentNode = S, o;
  }
  p(e) {
    let t = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(e, s, t), t += s.strings.length - 2) : s._$AI(e[t])), t++;
  }
}
class D {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, s, o) {
    this.type = 2, this._$AH = c, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = s, this.options = o, this._$Cv = o?.isConnected ?? !0;
  }
  get parentNode() {
    let e = this._$AA.parentNode;
    const t = this._$AM;
    return t !== void 0 && e?.nodeType === 11 && (e = t.parentNode), e;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(e, t = this) {
    e = P(this, e, t), R(e) ? e === c || e == null || e === "" ? (this._$AH !== c && this._$AR(), this._$AH = c) : e !== this._$AH && e !== C && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : ze(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== c && R(this._$AH) ? this._$AA.nextSibling.data = e : this.T(S.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: s } = e, o = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = H.createElement(ue(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === o) this._$AH.p(t);
    else {
      const n = new Te(o, this), r = n.u(this.options);
      n.p(t), this.T(r), this._$AH = n;
    }
  }
  _$AC(e) {
    let t = ae.get(e.strings);
    return t === void 0 && ae.set(e.strings, t = new H(e)), t;
  }
  k(e) {
    Y(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let s, o = 0;
    for (const n of e) o === t.length ? t.push(s = new D(this.O(U()), this.O(U()), this, this.options)) : s = t[o], s._$AI(n), o++;
    o < t.length && (this._$AR(s && s._$AB.nextSibling, o), t.length = o);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const s = te(e).nextSibling;
      te(e).remove(), e = s;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class V {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, s, o, n) {
    this.type = 1, this._$AH = c, this._$AN = void 0, this.element = e, this.name = t, this._$AM = o, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = c;
  }
  _$AI(e, t = this, s, o) {
    const n = this.strings;
    let r = !1;
    if (n === void 0) e = P(this, e, t, 0), r = !R(e) || e !== this._$AH && e !== C, r && (this._$AH = e);
    else {
      const l = e;
      let a, d;
      for (e = n[0], a = 0; a < n.length - 1; a++) d = P(this, l[s + a], t, a), d === C && (d = this._$AH[a]), r || (r = !R(d) || d !== this._$AH[a]), d === c ? e = c : e !== c && (e += (d ?? "") + n[a + 1]), this._$AH[a] = d;
    }
    r && !o && this.j(e);
  }
  j(e) {
    e === c ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Oe extends V {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === c ? void 0 : e;
  }
}
class ke extends V {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== c);
  }
}
class Ne extends V {
  constructor(e, t, s, o, n) {
    super(e, t, s, o, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = P(this, e, t, 0) ?? c) === C) return;
    const s = this._$AH, o = e === c && s !== c || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, n = e !== c && (s === c || o);
    o && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Me {
  constructor(e, t, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    P(this, e);
  }
}
const Ue = N.litHtmlPolyfillSupport;
Ue?.(H, D), (N.litHtmlVersions ?? (N.litHtmlVersions = [])).push("3.3.3");
const Re = (i, e, t) => {
  const s = t?.renderBefore ?? e;
  let o = s._$litPart$;
  if (o === void 0) {
    const n = t?.renderBefore ?? null;
    s._$litPart$ = o = new D(e.insertBefore(U(), n), n, void 0, t ?? {});
  }
  return o._$AI(i), o;
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
    var t;
    const e = super.createRenderRoot();
    return (t = this.renderOptions).renderBefore ?? (t.renderBefore = e.firstChild), e;
  }
  update(e) {
    const t = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Re(t, this.renderRoot, this.renderOptions);
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
const He = M.litElementPolyfillSupport;
He?.({ LitElement: z });
(M.litElementVersions ?? (M.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const fe = (i) => (e, t) => {
  t !== void 0 ? t.addInitializer(() => {
    customElements.define(i, e);
  }) : customElements.define(i, e);
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const De = { attribute: !0, type: String, converter: B, reflect: !1, hasChanged: J }, je = (i = De, e, t) => {
  const { kind: s, metadata: o } = t;
  let n = globalThis.litPropertyMetadata.get(o);
  if (n === void 0 && globalThis.litPropertyMetadata.set(o, n = /* @__PURE__ */ new Map()), s === "setter" && ((i = Object.create(i)).wrapped = !0), n.set(t.name, i), s === "accessor") {
    const { name: r } = t;
    return { set(l) {
      const a = e.get.call(this);
      e.set.call(this, l), this.requestUpdate(r, a, i, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(r, void 0, i, l), l;
    } };
  }
  if (s === "setter") {
    const { name: r } = t;
    return function(l) {
      const a = this[r];
      e.call(this, l), this.requestUpdate(r, a, i, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function j(i) {
  return (e, t) => typeof t == "object" ? je(i, e, t) : ((s, o, n) => {
    const r = o.hasOwnProperty(n);
    return o.constructor.createProperty(n, s), r ? Object.getOwnPropertyDescriptor(o, n) : void 0;
  })(i, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function $(i) {
  return j({ ...i, state: !0, attribute: !1 });
}
const T = "ha_reminders";
async function We(i, e) {
  const t = await i.callService(T, "create", e);
  return String(t?.reminder_id ?? "");
}
async function Le(i, e, t) {
  await i.callService(T, "update", {
    reminder_id: e,
    ...t
  });
}
async function Ie(i, e) {
  await i.callService(T, "delete", { reminder_id: e });
}
async function Be(i, e, t) {
  await i.callService(T, "snooze", {
    reminder_id: e,
    minutes: t
  });
}
async function qe(i, e) {
  await i.callService(T, "complete", { reminder_id: e });
}
async function Ve(i, e, t) {
  await i.callService(T, "set_enabled", {
    reminder_id: e,
    enabled: t
  });
}
var Fe = Object.defineProperty, Ze = Object.getOwnPropertyDescriptor, w = (i, e, t, s) => {
  for (var o = s > 1 ? void 0 : s ? Ze(e, t) : e, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (o = (s ? r(e, t, o) : r(o)) || o);
  return s && o && Fe(e, t, o), o;
};
const Ke = [
  { value: 0, label: "Mon" },
  { value: 1, label: "Tue" },
  { value: 2, label: "Wed" },
  { value: 3, label: "Thu" },
  { value: 4, label: "Fri" },
  { value: 5, label: "Sat" },
  { value: 6, label: "Sun" }
];
let u = class extends z {
  constructor() {
    super(...arguments), this.reminder = null, this.open = !1, this._draft = null, this._saving = !1, this._error = "", this._notifyServices = [];
  }
  willUpdate(i) {
    i.has("open") && this.open && (this._draft = this._draftFrom(this.reminder), this._error = "", this._saving = !1, this._loadNotifyServices());
  }
  async _loadNotifyServices() {
    try {
      const i = await this.hass.callWS({ type: "get_services" }), e = Object.keys(i).filter(
        (t) => i[t]?.notify
      );
      this._notifyServices = e.sort();
    } catch {
      this._notifyServices = [];
    }
  }
  _draftFrom(i) {
    return {
      title: i?.title ?? "",
      subtitle: i?.subtitle ?? "",
      message: i?.message ?? "",
      notify_service: i?.notify_service ?? "",
      user_name: i?.user_name ?? "",
      trigger_type: i?.trigger_type ?? "time",
      start_date: i?.start_date ?? "",
      stop_date: i?.stop_date ?? "",
      time: i?.time ?? "",
      every_x_days: i?.every_x_days ?? 1,
      exclude_days_of_week: i?.exclude_days_of_week ?? [],
      zone_entity_id: i?.zone_entity_id ?? "",
      person_entity_ids: i?.person_entity_ids ?? [],
      time_window_start: i?.time_window_start ?? "",
      time_window_end: i?.time_window_end ?? "",
      acknowledge_action_title: i?.acknowledge_action_title ?? "Mark as done",
      snooze_delays: (i?.snooze_delays ?? [5, 15, 30, 45, 60]).join(","),
      snooze_text: i?.snooze_text ?? "Snooze for ${time}",
      wait_time_if_no_action: i?.wait_time_if_no_action ?? 15,
      notification_count: i?.notification_count ?? 100,
      color: i?.color ?? "",
      channel: i?.channel ?? "",
      channel_importance: i?.channel_importance ?? "",
      notification_group: i?.notification_group ?? "",
      one_shot: i?.one_shot ?? !1
    };
  }
  _set(i, e) {
    this._draft && (this._draft = { ...this._draft, [i]: e });
  }
  _toggleWeekday(i) {
    const e = new Set(this._draft?.exclude_days_of_week ?? []);
    e.has(i) ? e.delete(i) : e.add(i), this._set("exclude_days_of_week", [...e].sort());
  }
  _togglePerson(i) {
    const e = new Set(this._draft?.person_entity_ids ?? []);
    e.has(i) ? e.delete(i) : e.add(i), this._set("person_entity_ids", [...e].sort());
  }
  async _save() {
    if (!this._draft || this._saving) return;
    this._saving = !0, this._error = "";
    const i = this._draft, e = {
      title: i.title,
      subtitle: i.subtitle || void 0,
      message: i.message,
      notify_service: i.notify_service || void 0,
      user_name: i.user_name || void 0,
      trigger_type: i.trigger_type,
      start_date: i.start_date || void 0,
      stop_date: i.stop_date || void 0,
      time: i.time || void 0,
      every_x_days: i.every_x_days,
      exclude_days_of_week: i.exclude_days_of_week,
      zone_entity_id: i.zone_entity_id || void 0,
      person_entity_ids: i.person_entity_ids,
      time_window_start: i.time_window_start || void 0,
      time_window_end: i.time_window_end || void 0,
      acknowledge_action_title: i.acknowledge_action_title || void 0,
      snooze_delays: i.snooze_delays.split(",").map((t) => parseInt(t, 10)).filter((t) => !Number.isNaN(t) && t > 0),
      snooze_text: i.snooze_text || void 0,
      wait_time_if_no_action: i.wait_time_if_no_action,
      notification_count: i.notification_count,
      color: i.color || void 0,
      channel: i.channel || void 0,
      channel_importance: i.channel_importance || void 0,
      notification_group: i.notification_group || void 0,
      one_shot: i.one_shot
    };
    try {
      this.reminder ? await Le(this.hass, this.reminder.id, e) : await We(this.hass, e), this.dispatchEvent(new CustomEvent("saved")), this.open = !1;
    } catch (t) {
      this._error = t instanceof Error ? t.message : "Failed to save the reminder.";
    } finally {
      this._saving = !1;
    }
  }
  _zones() {
    return Object.values(this.hass.states).filter((i) => i.entity_id.startsWith("zone.")).sort((i, e) => i.entity_id.localeCompare(e.entity_id));
  }
  _persons() {
    return Object.values(this.hass.states).filter((i) => i.entity_id.startsWith("person.")).sort((i, e) => i.entity_id.localeCompare(e.entity_id));
  }
  _zoneLabel(i) {
    return this.hass.states[i]?.attributes.friendly_name ?? i.replace("zone.", "");
  }
  render() {
    if (!this._draft) return c;
    const i = this._draft, e = i.trigger_type !== "time";
    return _`
      <ha-dialog
        open="${this.open}"
        .heading=${this.reminder ? "Edit reminder" : "New reminder"}
        @closed=${() => this.open = !1}
      >
        <div class="editor">
          <div class="row">
            <ha-textfield
              class="full"
              label="Title *"
              .value=${i.title}
              @input=${(t) => this._set("title", t.target.value)}
            ></ha-textfield>
          </div>
          <div class="row">
            <ha-textfield
              label="Subtitle"
              .value=${i.subtitle}
              @input=${(t) => this._set("subtitle", t.target.value)}
            ></ha-textfield>
            <ha-textfield
              label="Message *"
              .value=${i.message}
              @input=${(t) => this._set("message", t.target.value)}
            ></ha-textfield>
          </div>
          <div class="row">
            <ha-select
              label="Notification service"
              .value=${i.notify_service}
              @selected=${(t) => this._set(
      "notify_service",
      t.target.value || ""
    )}
              @closed=${(t) => t.stopPropagation()}
            >
              <mwc-list-item value=""></mwc-list-item>
              ${[.../* @__PURE__ */ new Set([...this._notifyServices, i.notify_service])].filter((t) => t).map(
      (t) => _`
                    <mwc-list-item value=${t}>${t}</mwc-list-item>
                  `
    )}
            </ha-select>
            <ha-textfield
              label="User name"
              helper="Who this reminder is for — shown in group acknowledgement messages"
              .value=${i.user_name}
              @input=${(t) => this._set("user_name", t.target.value)}
            ></ha-textfield>
          </div>
          <div class="row">
            <ha-select
              label="Trigger"
              .value=${i.trigger_type}
              @selected=${(t) => this._set(
      "trigger_type",
      t.target.value || "time"
    )}
              @closed=${(t) => t.stopPropagation()}
            >
              <mwc-list-item value="time">At a fixed time</mwc-list-item>
              <mwc-list-item value="zone_enter">When I enter a zone</mwc-list-item>
              <mwc-list-item value="zone_leave">When I leave a zone</mwc-list-item>
            </ha-select>
            <ha-formfield label="Only once">
              <ha-switch
                .checked=${i.one_shot}
                @change=${(t) => this._set("one_shot", t.target.checked)}
              ></ha-switch>
            </ha-formfield>
          </div>

          ${e ? _`
                <div class="section">Zone trigger</div>
                <div class="row">
                  <ha-select
                    label="Zone"
                    .value=${i.zone_entity_id}
                    @selected=${(t) => this._set(
      "zone_entity_id",
      t.target.value || ""
    )}
                    @closed=${(t) => t.stopPropagation()}
                  >
                    <mwc-list-item value=""></mwc-list-item>
                    ${this._zones().map(
      (t) => _`
                        <mwc-list-item value=${t.entity_id}
                          >${this._zoneLabel(t.entity_id)}</mwc-list-item
                        >
                      `
    )}
                  </ha-select>
                </div>
                <div class="section">Watch these persons</div>
                ${this._persons().length ? _`<div class="days">
                      ${this._persons().map(
      (t) => _`
                          <ha-formfield
                            label=${String(
        t.attributes.friendly_name ?? t.entity_id
      )}
                          >
                            <ha-checkbox
                              .checked=${i.person_entity_ids.includes(
        t.entity_id
      )}
                              @change=${() => this._togglePerson(t.entity_id)}
                            ></ha-checkbox>
                          </ha-formfield>
                        `
    )}
                    </div>` : _`<div>No person entities found.</div>`}
                <div class="row">
                  <ha-textfield
                    label="Only fire between (start)"
                    type="time"
                    .value=${i.time_window_start}
                    @input=${(t) => this._set(
      "time_window_start",
      t.target.value
    )}
                  ></ha-textfield>
                  <ha-textfield
                    label="and (end)"
                    type="time"
                    .value=${i.time_window_end}
                    @input=${(t) => this._set(
      "time_window_end",
      t.target.value
    )}
                  ></ha-textfield>
                </div>
              ` : _`
                <div class="section">Time trigger</div>
                <div class="row">
                  <ha-textfield
                    label="Time *"
                    type="time"
                    .value=${i.time}
                    @input=${(t) => this._set("time", t.target.value)}
                  ></ha-textfield>
                  <ha-textfield
                    label="Every N days *"
                    type="number"
                    min="1"
                    .value=${String(i.every_x_days)}
                    @input=${(t) => this._set(
      "every_x_days",
      parseInt(t.target.value, 10) || 1
    )}
                  ></ha-textfield>
                </div>
                <div class="row">
                  <ha-textfield
                    label="Start date"
                    type="date"
                    .value=${i.start_date}
                    @input=${(t) => this._set(
      "start_date",
      t.target.value
    )}
                  ></ha-textfield>
                  <ha-textfield
                    label="Stop date"
                    type="date"
                    .value=${i.stop_date}
                    @input=${(t) => this._set(
      "stop_date",
      t.target.value
    )}
                  ></ha-textfield>
                </div>
                <div class="section">Exclude days</div>
                <div class="days">
                  ${Ke.map(
      (t) => _`
                      <ha-formfield label=${t.label}>
                        <ha-checkbox
                          .checked=${i.exclude_days_of_week.includes(t.value)}
                          @change=${() => this._toggleWeekday(t.value)}
                        ></ha-checkbox>
                      </ha-formfield>
                    `
    )}
                </div>
              `}

          <div class="section">Notification</div>
          <div class="row">
            <ha-textfield
              label="Acknowledge action title"
              .value=${i.acknowledge_action_title}
              @input=${(t) => this._set(
      "acknowledge_action_title",
      t.target.value
    )}
            ></ha-textfield>
            <ha-textfield
              label="Snooze delays (minutes)"
              helper="Comma separated, e.g. 5,15,30"
              .value=${i.snooze_delays}
              @input=${(t) => this._set("snooze_delays", t.target.value)}
            ></ha-textfield>
          </div>
          <div class="row">
            <ha-textfield
              label="Wait before resend (min)"
              type="number"
              min="1"
              .value=${String(i.wait_time_if_no_action)}
              @input=${(t) => this._set(
      "wait_time_if_no_action",
      parseInt(t.target.value, 10) || 1
    )}
            ></ha-textfield>
            <ha-textfield
              label="Max notifications"
              type="number"
              min="1"
              .value=${String(i.notification_count)}
              @input=${(t) => this._set(
      "notification_count",
      parseInt(t.target.value, 10) || 1
    )}
            ></ha-textfield>
          </div>
          <div class="row">
            <ha-textfield
              label="Snooze text"
              helper="\${time} is replaced by the delay"
              .value=${i.snooze_text}
              @input=${(t) => this._set("snooze_text", t.target.value)}
            ></ha-textfield>
            <ha-textfield
              label="Notification group"
              helper="Shared with other reminders"
              .value=${i.notification_group}
              @input=${(t) => this._set(
      "notification_group",
      t.target.value
    )}
            ></ha-textfield>
          </div>
          <div class="row">
            <ha-textfield
              label="Color (Android)"
              .value=${i.color}
              @input=${(t) => this._set("color", t.target.value)}
            ></ha-textfield>
            <ha-textfield
              label="Channel (Android)"
              .value=${i.channel}
              @input=${(t) => this._set("channel", t.target.value)}
            ></ha-textfield>
            <ha-textfield
              label="Channel importance"
              .value=${i.channel_importance}
              @input=${(t) => this._set(
      "channel_importance",
      t.target.value
    )}
            ></ha-textfield>
          </div>

          ${this._error ? _`<div class="error">${this._error}</div>` : c}
        </div>

        <mwc-button
          slot="primaryAction"
          .disabled=${this._saving || !i.title || !i.message}
          @click=${this._save}
        >
          ${this.reminder ? "Save" : "Create"}
        </mwc-button>
        <mwc-button slot="secondaryAction" @click=${() => this.open = !1}>
          Cancel
        </mwc-button>
      </ha-dialog>
    `;
  }
};
u.styles = ce`
    .editor {
      max-width: 560px;
    }
    .row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .row > * {
      flex: 1 1 160px;
      min-width: 140px;
    }
    .full {
      flex-basis: 100%;
    }
    .days {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
      padding-top: 8px;
    }
    .error {
      color: var(--error-color, #db4437);
      padding: 8px 0;
    }
    .section {
      color: var(--secondary-text-color);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 16px 0 4px;
    }
  `;
w([
  j({ attribute: !1 })
], u.prototype, "hass", 2);
w([
  j({ attribute: !1 })
], u.prototype, "reminder", 2);
w([
  j({ type: Boolean })
], u.prototype, "open", 2);
w([
  $()
], u.prototype, "_draft", 2);
w([
  $()
], u.prototype, "_saving", 2);
w([
  $()
], u.prototype, "_error", 2);
w([
  $()
], u.prototype, "_notifyServices", 2);
u = w([
  fe("ha-reminders-editor")
], u);
var Je = Object.defineProperty, Ye = Object.getOwnPropertyDescriptor, b = (i, e, t, s) => {
  for (var o = s > 1 ? void 0 : s ? Ye(e, t) : e, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (o = (s ? r(e, t, o) : r(o)) || o);
  return s && o && Je(e, t, o), o;
};
const Ge = {
  scheduled: "Scheduled",
  active: "Active",
  snoozed: "Snoozed",
  completed: "Completed",
  disabled: "Disabled"
};
function L(i) {
  return i.status ?? "scheduled";
}
function le(i) {
  return i ? i.replace("zone.", "").replace(/_/g, " ") : "";
}
function Qe(i) {
  if (!i) return "";
  const e = new Date(i);
  if (Number.isNaN(e.getTime())) return i;
  const t = e.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
  return e.toLocaleString(void 0, {
    month: "short",
    day: "numeric",
    ...t ? {} : { weekday: "short" },
    hour: "2-digit",
    minute: "2-digit"
  });
}
let f = class extends z {
  constructor() {
    super(...arguments), this._config = {}, this._editorOpen = !1, this._editing = null, this._snoozeTarget = null, this._snoozeMinutes = 15, this._deleteArmed = null;
  }
  setConfig(i) {
    if (!i.type || i.type !== "ha-reminders-card")
      throw new Error("Invalid card type");
    this._config = { ...i };
  }
  getCardSize() {
    return 3;
  }
  static getStubConfig() {
    return {};
  }
  _reminders() {
    return this.hass ? Object.values(this.hass.states).filter(
      (i) => i.entity_id.startsWith("sensor.ha_reminder_") && typeof i.attributes.reminder_id == "string"
    ).map((i) => i.attributes).sort((i, e) => {
      const t = {
        active: 0,
        snoozed: 1,
        scheduled: 2,
        completed: 3,
        disabled: 4
      };
      return (t[L(i)] ?? 9) - (t[L(e)] ?? 9);
    }) : [];
  }
  _openNew() {
    this._editing = null, this._editorOpen = !0;
  }
  _openEdit(i) {
    this._editing = i, this._editorOpen = !0;
  }
  _openSnooze(i) {
    this._snoozeTarget = i, this._snoozeMinutes = 15;
  }
  async _snooze() {
    this._snoozeTarget && (await Be(
      this.hass,
      this._snoozeTarget.id,
      this._snoozeMinutes
    ), this._snoozeTarget = null);
  }
  async _complete(i) {
    await qe(this.hass, i.id);
  }
  async _toggleEnabled(i, e) {
    await Ve(this.hass, i.id, e);
  }
  _armDelete(i) {
    if (this._deleteArmed === i.id) {
      this._deleteArmed = null, this._deleteTimer !== void 0 && (window.clearTimeout(this._deleteTimer), this._deleteTimer = void 0), Ie(this.hass, i.id);
      return;
    }
    this._deleteArmed = i.id, this._deleteTimer !== void 0 && window.clearTimeout(this._deleteTimer), this._deleteTimer = window.setTimeout(() => {
      this._deleteArmed = null, this._deleteTimer = void 0;
    }, 3e3);
  }
  _triggerText(i) {
    return i.trigger_type === "zone_enter" ? `When you enter ${le(i.zone_entity_id)}` : i.trigger_type === "zone_leave" ? `When you leave ${le(i.zone_entity_id)}` : Qe(i.next_fire) || "Scheduled";
  }
  _statusChip(i) {
    const e = L(i);
    return e === "disabled" ? c : _`<span class="chip ${e}">${Ge[e]}</span>`;
  }
  render() {
    if (!this.hass) return c;
    const i = this._reminders(), e = this._config.title ?? "Reminders";
    return _`
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

        ${i.length === 0 ? _`<div class="empty">No reminders yet — add one with +</div>` : i.map(
      (t) => _`
                <div class="row">
                  <ha-icon
                    icon=${t.trigger_type === "time" ? "mdi:clock-outline" : t.trigger_type === "zone_enter" ? "mdi:home-import-outline" : "mdi:home-export-outline"}
                  ></ha-icon>
                  <div class="row-text">
                    <div class="row-title">${t.title}</div>
                    <div class="row-sub">
                      ${this._triggerText(t)}
                      ${t.notified_count ? _` · notified ${t.notified_count}
                            ×` : ""}
                    </div>
                  </div>
                  ${this._statusChip(t)}
                  <div class="actions">
                    ${L(t) === "disabled" ? c : _`
                          <ha-icon-button
                            label="Complete"
                            @click=${() => this._complete(t)}
                          >
                            <ha-icon icon="mdi:check"></ha-icon>
                          </ha-icon-button>
                          <ha-icon-button
                            label="Snooze"
                            @click=${() => this._openSnooze(t)}
                          >
                            <ha-icon icon="mdi:clock-outline"></ha-icon>
                          </ha-icon-button>
                        `}
                    <ha-icon-button
                      label="Edit"
                      @click=${() => this._openEdit(t)}
                    >
                      <ha-icon icon="mdi:pencil"></ha-icon>
                    </ha-icon-button>
                    <ha-icon-button
                      class="danger"
                      label=${this._deleteArmed === t.id ? "Confirm delete" : "Delete"}
                      @click=${() => this._armDelete(t)}
                    >
                      <ha-icon
                        icon=${this._deleteArmed === t.id ? "mdi:check" : "mdi:delete"}
                      ></ha-icon>
                    </ha-icon-button>
                  </div>
                  <ha-switch
                    .checked=${t.enabled}
                    @change=${(s) => this._toggleEnabled(
        t,
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
        <ha-textfield
          label="Minutes"
          type="number"
          min="1"
          .value=${String(this._snoozeMinutes)}
          @input=${(t) => this._snoozeMinutes = parseInt(
      t.target.value,
      10
    ) || 15}
        ></ha-textfield>
        <div class="snooze-quick">
          ${[5, 15, 30, 60].map(
      (t) => _`
              <mwc-button
                outlined
                @click=${() => this._snoozeMinutes = t}
                >${t} min</mwc-button
              >
            `
    )}
        </div>
        <mwc-button slot="primaryAction" @click=${this._snooze}
          >Snooze</mwc-button
        >
        <mwc-button
          slot="secondaryAction"
          @click=${() => this._snoozeTarget = null}
          >Cancel</mwc-button
        >
      </ha-dialog>
    `;
  }
};
f.styles = ce`
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
], f.prototype, "hass", 2);
b([
  $()
], f.prototype, "_config", 2);
b([
  $()
], f.prototype, "_editorOpen", 2);
b([
  $()
], f.prototype, "_editing", 2);
b([
  $()
], f.prototype, "_snoozeTarget", 2);
b([
  $()
], f.prototype, "_snoozeMinutes", 2);
b([
  $()
], f.prototype, "_deleteArmed", 2);
f = b([
  fe("ha-reminders-card")
], f);
window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "ha-reminders-card",
  name: "HA Reminders",
  description: "View, edit, snooze and complete your reminders."
});
export {
  f as HaRemindersCard
};

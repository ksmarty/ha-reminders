/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const j = globalThis, Q = j.ShadowRoot && (j.ShadyCSS === void 0 || j.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, tt = Symbol(), nt = /* @__PURE__ */ new WeakMap();
let $t = class {
  constructor(t, e, s) {
    if (this._$cssResult$ = !0, s !== tt) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (Q && t === void 0) {
      const s = e !== void 0 && e.length === 1;
      s && (t = nt.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), s && nt.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Ct = (i) => new $t(typeof i == "string" ? i : i + "", void 0, tt), vt = (i, ...t) => {
  const e = i.length === 1 ? i[0] : t.reduce((s, o, n) => s + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + i[n + 1], i[0]);
  return new $t(e, i, tt);
}, zt = (i, t) => {
  if (Q) i.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const s = document.createElement("style"), o = j.litNonce;
    o !== void 0 && s.setAttribute("nonce", o), s.textContent = e.cssText, i.appendChild(s);
  }
}, rt = Q ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const s of t.cssRules) e += s.cssText;
  return Ct(e);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Tt, defineProperty: kt, getOwnPropertyDescriptor: Ot, getOwnPropertyNames: Ut, getOwnPropertySymbols: Mt, getPrototypeOf: Pt } = Object, v = globalThis, at = v.trustedTypes, Nt = at ? at.emptyScript : "", Lt = v.reactiveElementPolyfillSupport, U = (i, t) => i, B = { toAttribute(i, t) {
  switch (t) {
    case Boolean:
      i = i ? Nt : null;
      break;
    case Object:
    case Array:
      i = i == null ? i : JSON.stringify(i);
  }
  return i;
}, fromAttribute(i, t) {
  let e = i;
  switch (t) {
    case Boolean:
      e = i !== null;
      break;
    case Number:
      e = i === null ? null : Number(i);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(i);
      } catch {
        e = null;
      }
  }
  return e;
} }, et = (i, t) => !Tt(i, t), lt = { attribute: !0, type: String, converter: B, reflect: !1, useDefault: !1, hasChanged: et };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), v.litPropertyMetadata ?? (v.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let E = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = lt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const s = Symbol(), o = this.getPropertyDescriptor(t, s, e);
      o !== void 0 && kt(this.prototype, t, o);
    }
  }
  static getPropertyDescriptor(t, e, s) {
    const { get: o, set: n } = Ot(this.prototype, t) ?? { get() {
      return this[e];
    }, set(r) {
      this[e] = r;
    } };
    return { get: o, set(r) {
      const l = o?.call(this);
      n?.call(this, r), this.requestUpdate(t, l, s);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? lt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const t = Pt(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(U("properties"))) {
      const e = this.properties, s = [...Ut(e), ...Mt(e)];
      for (const o of s) this.createProperty(o, e[o]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [s, o] of e) this.elementProperties.set(s, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, s] of this.elementProperties) {
      const o = this._$Eu(e, s);
      o !== void 0 && this._$Eh.set(o, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const s = new Set(t.flat(1 / 0).reverse());
      for (const o of s) e.unshift(rt(o));
    } else t !== void 0 && e.push(rt(t));
    return e;
  }
  static _$Eu(t, e) {
    const s = e.attribute;
    return s === !1 ? void 0 : typeof s == "string" ? s : typeof t == "string" ? t.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = !1, this.hasUpdated = !1, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t) => this.enableUpdating = t), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t) => t(this));
  }
  addController(t) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t), this.renderRoot !== void 0 && this.isConnected && t.hostConnected?.();
  }
  removeController(t) {
    this._$EO?.delete(t);
  }
  _$E_() {
    const t = /* @__PURE__ */ new Map(), e = this.constructor.elementProperties;
    for (const s of e.keys()) this.hasOwnProperty(s) && (t.set(s, this[s]), delete this[s]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return zt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, s) {
    this._$AK(t, s);
  }
  _$ET(t, e) {
    const s = this.constructor.elementProperties.get(t), o = this.constructor._$Eu(t, s);
    if (o !== void 0 && s.reflect === !0) {
      const n = (s.converter?.toAttribute !== void 0 ? s.converter : B).toAttribute(e, s.type);
      this._$Em = t, n == null ? this.removeAttribute(o) : this.setAttribute(o, n), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const s = this.constructor, o = s._$Eh.get(t);
    if (o !== void 0 && this._$Em !== o) {
      const n = s.getPropertyOptions(o), r = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : B;
      this._$Em = o;
      const l = r.fromAttribute(e, n.type);
      this[o] = l ?? this._$Ej?.get(o) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, s, o = !1, n) {
    if (t !== void 0) {
      const r = this.constructor;
      if (o === !1 && (n = this[t]), s ?? (s = r.getPropertyOptions(t)), !((s.hasChanged ?? et)(n, e) || s.useDefault && s.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(r._$Eu(t, s)))) return;
      this.C(t, e, s);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: s, reflect: o, wrapped: n }, r) {
    s && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, r ?? e ?? this[t]), n !== !0 || r !== void 0) || (this._$AL.has(t) || (this.hasUpdated || s || (e = void 0), this._$AL.set(t, e)), o === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
  }
  async _$EP() {
    this.isUpdatePending = !0;
    try {
      await this._$ES;
    } catch (e) {
      Promise.reject(e);
    }
    const t = this.scheduleUpdate();
    return t != null && await t, !this.isUpdatePending;
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
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((s) => s.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (s) {
      throw t = !1, this._$EM(), s;
    }
    t && this._$AE(e);
  }
  willUpdate(t) {
  }
  _$AE(t) {
    this._$EO?.forEach((e) => e.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = !0, this.firstUpdated(t)), this.updated(t);
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
  shouldUpdate(t) {
    return !0;
  }
  update(t) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((e) => this._$ET(e, this[e]))), this._$EM();
  }
  updated(t) {
  }
  firstUpdated(t) {
  }
};
E.elementStyles = [], E.shadowRootOptions = { mode: "open" }, E[U("elementProperties")] = /* @__PURE__ */ new Map(), E[U("finalized")] = /* @__PURE__ */ new Map(), Lt?.({ ReactiveElement: E }), (v.reactiveElementVersions ?? (v.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const M = globalThis, ct = (i) => i, F = M.trustedTypes, ht = F ? F.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, wt = "$lit$", $ = `lit$${Math.random().toFixed(9).slice(2)}$`, bt = "?" + $, Ht = `<${bt}>`, S = document, N = () => S.createComment(""), L = (i) => i === null || typeof i != "object" && typeof i != "function", it = Array.isArray, Dt = (i) => it(i) || typeof i?.[Symbol.iterator] == "function", q = `[ 	
\f\r]`, O = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, dt = /-->/g, _t = />/g, w = RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ut = /'/g, pt = /"/g, At = /^(?:script|style|textarea|title)$/i, Rt = (i) => (t, ...e) => ({ _$litType$: i, strings: t, values: e }), b = Rt(1), C = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), ft = /* @__PURE__ */ new WeakMap(), A = S.createTreeWalker(S, 129);
function St(i, t) {
  if (!it(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return ht !== void 0 ? ht.createHTML(t) : t;
}
const It = (i, t) => {
  const e = i.length - 1, s = [];
  let o, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", r = O;
  for (let l = 0; l < e; l++) {
    const a = i[l];
    let d, _, c = -1, f = 0;
    for (; f < a.length && (r.lastIndex = f, _ = r.exec(a), _ !== null); ) f = r.lastIndex, r === O ? _[1] === "!--" ? r = dt : _[1] !== void 0 ? r = _t : _[2] !== void 0 ? (At.test(_[2]) && (o = RegExp("</" + _[2], "g")), r = w) : _[3] !== void 0 && (r = w) : r === w ? _[0] === ">" ? (r = o ?? O, c = -1) : _[1] === void 0 ? c = -2 : (c = r.lastIndex - _[2].length, d = _[1], r = _[3] === void 0 ? w : _[3] === '"' ? pt : ut) : r === pt || r === ut ? r = w : r === dt || r === _t ? r = O : (r = w, o = void 0);
    const y = r === w && i[l + 1].startsWith("/>") ? " " : "";
    n += r === O ? a + Ht : c >= 0 ? (s.push(d), a.slice(0, c) + wt + a.slice(c) + $ + y) : a + $ + (c === -2 ? l : y);
  }
  return [St(i, n + (i[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), s];
};
class H {
  constructor({ strings: t, _$litType$: e }, s) {
    let o;
    this.parts = [];
    let n = 0, r = 0;
    const l = t.length - 1, a = this.parts, [d, _] = It(t, e);
    if (this.el = H.createElement(d, s), A.currentNode = this.el.content, e === 2 || e === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (o = A.nextNode()) !== null && a.length < l; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const c of o.getAttributeNames()) if (c.endsWith(wt)) {
          const f = _[r++], y = o.getAttribute(c).split($), V = /([.?@])?(.*)/.exec(f);
          a.push({ type: 1, index: n, name: V[2], strings: y, ctor: V[1] === "." ? jt : V[1] === "?" ? Bt : V[1] === "@" ? Ft : W }), o.removeAttribute(c);
        } else c.startsWith($) && (a.push({ type: 6, index: n }), o.removeAttribute(c));
        if (At.test(o.tagName)) {
          const c = o.textContent.split($), f = c.length - 1;
          if (f > 0) {
            o.textContent = F ? F.emptyScript : "";
            for (let y = 0; y < f; y++) o.append(c[y], N()), A.nextNode(), a.push({ type: 2, index: ++n });
            o.append(c[f], N());
          }
        }
      } else if (o.nodeType === 8) if (o.data === bt) a.push({ type: 2, index: n });
      else {
        let c = -1;
        for (; (c = o.data.indexOf($, c + 1)) !== -1; ) a.push({ type: 7, index: n }), c += $.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const s = S.createElement("template");
    return s.innerHTML = t, s;
  }
}
function z(i, t, e = i, s) {
  if (t === C) return t;
  let o = s !== void 0 ? e._$Co?.[s] : e._$Cl;
  const n = L(t) ? void 0 : t._$litDirective$;
  return o?.constructor !== n && (o?._$AO?.(!1), n === void 0 ? o = void 0 : (o = new n(i), o._$AT(i, e, s)), s !== void 0 ? (e._$Co ?? (e._$Co = []))[s] = o : e._$Cl = o), o !== void 0 && (t = z(i, o._$AS(i, t.values), o, s)), t;
}
class Vt {
  constructor(t, e) {
    this._$AV = [], this._$AN = void 0, this._$AD = t, this._$AM = e;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t) {
    const { el: { content: e }, parts: s } = this._$AD, o = (t?.creationScope ?? S).importNode(e, !0);
    A.currentNode = o;
    let n = A.nextNode(), r = 0, l = 0, a = s[0];
    for (; a !== void 0; ) {
      if (r === a.index) {
        let d;
        a.type === 2 ? d = new R(n, n.nextSibling, this, t) : a.type === 1 ? d = new a.ctor(n, a.name, a.strings, this, t) : a.type === 6 && (d = new Wt(n, this, t)), this._$AV.push(d), a = s[++l];
      }
      r !== a?.index && (n = A.nextNode(), r++);
    }
    return A.currentNode = S, o;
  }
  p(t) {
    let e = 0;
    for (const s of this._$AV) s !== void 0 && (s.strings !== void 0 ? (s._$AI(t, s, e), e += s.strings.length - 2) : s._$AI(t[e])), e++;
  }
}
class R {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, s, o) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = s, this.options = o, this._$Cv = o?.isConnected ?? !0;
  }
  get parentNode() {
    let t = this._$AA.parentNode;
    const e = this._$AM;
    return e !== void 0 && t?.nodeType === 11 && (t = e.parentNode), t;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t, e = this) {
    t = z(this, t, e), L(t) ? t === h || t == null || t === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : t !== this._$AH && t !== C && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Dt(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== h && L(this._$AH) ? this._$AA.nextSibling.data = t : this.T(S.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: s } = t, o = typeof s == "number" ? this._$AC(t) : (s.el === void 0 && (s.el = H.createElement(St(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === o) this._$AH.p(e);
    else {
      const n = new Vt(o, this), r = n.u(this.options);
      n.p(e), this.T(r), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = ft.get(t.strings);
    return e === void 0 && ft.set(t.strings, e = new H(t)), e;
  }
  k(t) {
    it(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let s, o = 0;
    for (const n of t) o === e.length ? e.push(s = new R(this.O(N()), this.O(N()), this, this.options)) : s = e[o], s._$AI(n), o++;
    o < e.length && (this._$AR(s && s._$AB.nextSibling, o), e.length = o);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const s = ct(t).nextSibling;
      ct(t).remove(), t = s;
    }
  }
  setConnected(t) {
    this._$AM === void 0 && (this._$Cv = t, this._$AP?.(t));
  }
}
class W {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t, e, s, o, n) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = t, this.name = e, this._$AM = o, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(t, e = this, s, o) {
    const n = this.strings;
    let r = !1;
    if (n === void 0) t = z(this, t, e, 0), r = !L(t) || t !== this._$AH && t !== C, r && (this._$AH = t);
    else {
      const l = t;
      let a, d;
      for (t = n[0], a = 0; a < n.length - 1; a++) d = z(this, l[s + a], e, a), d === C && (d = this._$AH[a]), r || (r = !L(d) || d !== this._$AH[a]), d === h ? t = h : t !== h && (t += (d ?? "") + n[a + 1]), this._$AH[a] = d;
    }
    r && !o && this.j(t);
  }
  j(t) {
    t === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class jt extends W {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === h ? void 0 : t;
  }
}
class Bt extends W {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== h);
  }
}
class Ft extends W {
  constructor(t, e, s, o, n) {
    super(t, e, s, o, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = z(this, t, e, 0) ?? h) === C) return;
    const s = this._$AH, o = t === h && s !== h || t.capture !== s.capture || t.once !== s.once || t.passive !== s.passive, n = t !== h && (s === h || o);
    o && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Wt {
  constructor(t, e, s) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    z(this, t);
  }
}
const qt = M.litHtmlPolyfillSupport;
qt?.(H, R), (M.litHtmlVersions ?? (M.litHtmlVersions = [])).push("3.3.3");
const Zt = (i, t, e) => {
  const s = e?.renderBefore ?? t;
  let o = s._$litPart$;
  if (o === void 0) {
    const n = e?.renderBefore ?? null;
    s._$litPart$ = o = new R(t.insertBefore(N(), n), n, void 0, e ?? {});
  }
  return o._$AI(i), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const P = globalThis;
class x extends E {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Zt(e, this.renderRoot, this.renderOptions);
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
x._$litElement$ = !0, x.finalized = !0, P.litElementHydrateSupport?.({ LitElement: x });
const Kt = P.litElementPolyfillSupport;
Kt?.({ LitElement: x });
(P.litElementVersions ?? (P.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Gt = { attribute: !0, type: String, converter: B, reflect: !1, hasChanged: et }, Jt = (i = Gt, t, e) => {
  const { kind: s, metadata: o } = e;
  let n = globalThis.litPropertyMetadata.get(o);
  if (n === void 0 && globalThis.litPropertyMetadata.set(o, n = /* @__PURE__ */ new Map()), s === "setter" && ((i = Object.create(i)).wrapped = !0), n.set(e.name, i), s === "accessor") {
    const { name: r } = e;
    return { set(l) {
      const a = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(r, a, i, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(r, void 0, i, l), l;
    } };
  }
  if (s === "setter") {
    const { name: r } = e;
    return function(l) {
      const a = this[r];
      t.call(this, l), this.requestUpdate(r, a, i, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + s);
};
function I(i) {
  return (t, e) => typeof e == "object" ? Jt(i, t, e) : ((s, o, n) => {
    const r = o.hasOwnProperty(n);
    return o.constructor.createProperty(n, s), r ? Object.getOwnPropertyDescriptor(o, n) : void 0;
  })(i, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function p(i) {
  return I({ ...i, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Yt = (i, t, e) => (e.configurable = !0, e.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(i, t, e), e);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function xe(i, t) {
  return (e, s, o) => {
    const n = (r) => r.renderRoot?.querySelector(i) ?? null;
    return Yt(e, s, { get() {
      return n(this);
    } });
  };
}
var Xt = "M22.11,21.46L2.39,1.73L1.11,3L5.83,7.72C5.29,8.73 5,9.86 5,11V17L3,19V20H18.11L20.84,22.73L22.11,21.46M7,18V11C7,10.39 7.11,9.79 7.34,9.23L16.11,18H7M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M8.29,5.09C8.82,4.75 9.4,4.5 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V15.8L17,13.8V11A5,5 0 0,0 12,6C11.22,6 10.45,6.2 9.76,6.56L8.29,5.09Z", Qt = "M10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21M21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19M17 11C17 8.2 14.8 6 12 6S7 8.2 7 11V18H17V11Z", te = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z", ee = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", ie = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", se = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z";
const T = "ha_reminders";
async function oe(i, t) {
  const e = await i.callService(T, "create", t);
  return String(e?.reminder_id ?? "");
}
async function ne(i, t, e) {
  await i.callService(T, "update", {
    reminder_id: t,
    ...e
  });
}
async function re(i, t) {
  await i.callService(T, "delete", { reminder_id: t });
}
async function ae(i, t, e) {
  await i.callService(T, "snooze", {
    reminder_id: t,
    minutes: e
  });
}
async function le(i, t) {
  await i.callService(T, "complete", { reminder_id: t });
}
async function ce(i, t, e) {
  await i.callService(T, "set_enabled", {
    reminder_id: t,
    enabled: e
  });
}
function Et(i, t, e = !1) {
  const s = t.trim();
  s && i.dispatchEvent(
    new CustomEvent("hass-notification", {
      detail: { message: s, ...e ? { duration: 8e3 } : {} },
      bubbles: !0,
      composed: !0
    })
  );
}
function xt(i, t) {
  return i instanceof Error && i.message ? i.message : i?.body?.message || t;
}
var he = Object.defineProperty, m = (i, t, e, s) => {
  for (var o = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (o = r(t, e, o) || o);
  return o && he(t, e, o), o;
};
const de = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" }
], gt = {
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
}, _e = [
  { value: "time", label: "At a fixed time" },
  { value: "zone_enter", label: "When I enter a zone" },
  { value: "zone_leave", label: "When I leave a zone" }
];
function ue(i, t) {
  const e = [
    { name: "title", selector: { text: {} }, required: !0 },
    { name: "message", selector: { text: { multiline: !0 } }, required: !0 },
    {
      name: "trigger_type",
      selector: { select: { mode: "dropdown", options: _e } }
    }
  ];
  return i === "time" ? e.push({ name: "time", selector: { time: {} } }) : (e.push({ name: "zone_entity_id", selector: { entity: { domain: "zone" } } }), e.push({
    name: "person_entity_ids",
    selector: { entity: { domain: "person", multiple: !0 } }
  })), e.push(t), e;
}
function pe(i) {
  const t = [
    { name: "subtitle", selector: { text: {} } },
    { name: "user_name", selector: { text: {} } },
    { name: "one_shot", selector: { boolean: {} } }
  ];
  return i === "time" ? t.push({ name: "every_x_days", selector: { number: { min: 1, mode: "box" } } }) : (t.push({ name: "time_window_start", selector: { time: {} } }), t.push({ name: "time_window_end", selector: { time: {} } })), t.push(
    { name: "start_date", selector: { date: {} } },
    { name: "stop_date", selector: { date: {} } },
    {
      name: "exclude_days_of_week",
      selector: { select: { multiple: !0, options: de } }
    },
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
  ), t;
}
const Z = [5, 15, 30, 45, 60], fe = "Someone", K = "Snooze for ${time}", G = "Mark as done", J = "Someone acknowledged the notification", Y = 15, X = 1;
function ge(i) {
  if (!i) return !1;
  const t = i.snooze_delays?.length ? i.snooze_delays : Z, e = (i.user_name ?? "").trim();
  return !!((i.subtitle ?? "").trim() || e && e !== fe || i.one_shot || (i.every_x_days ?? 1) !== 1 || i.start_date || i.stop_date || (i.exclude_days_of_week ?? []).length > 0 || i.time_window_start || i.time_window_end || t.join(",") !== Z.join(",") || (i.snooze_text ?? K) !== K || (i.acknowledge_action_title ?? G) !== G || (i.wait_time_if_no_action ?? Y) !== Y || (i.notification_count ?? X) !== X || (i.channel_importance ?? "") || (i.channel ?? "") || (i.color ?? "") || (i.notification_group ?? "") || (i.acknowledge_notification_title ?? J) !== J || (i.acknowledge_notification_body ?? "").trim());
}
const st = class st extends x {
  constructor() {
    super(...arguments), this.reminder = null, this.open = !1, this._data = {}, this._saving = !1, this._error = "", this._notifyServices = [], this._advancedOpen = !1, this._customised = !1, this._collapseAdvanced = !1, this._targetId = null, this._wasOpen = !1;
  }
  willUpdate() {
    const t = this.open && !this._wasOpen;
    this._wasOpen = this.open, t && (this._targetId = this.reminder?.id ?? null, this._customised = ge(this.reminder), this._data = this._dataFrom(this.reminder), this._error = "", this._saving = !1, this._advancedOpen = !1, this._collapseAdvanced = !0, this._loadNotifyServices());
  }
  updated() {
    if (!this._collapseAdvanced) return;
    this._collapseAdvanced = !1;
    const t = this.renderRoot.querySelector("ha-expansion-panel");
    t && (t.expanded = !1);
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
      acknowledge_action_title: t?.acknowledge_action_title ?? G,
      snooze_delays: (t?.snooze_delays ?? Z).join(","),
      snooze_text: t?.snooze_text ?? K,
      wait_time_if_no_action: t?.wait_time_if_no_action ?? Y,
      notification_count: t?.notification_count ?? X,
      color: t?.color ?? "",
      channel: t?.channel ?? "",
      channel_importance: t?.channel_importance ?? "",
      notification_group: t?.notification_group ?? "",
      acknowledge_notification_title: t?.acknowledge_notification_title ?? J,
      acknowledge_notification_body: t?.acknowledge_notification_body ?? ""
    };
  }
  async _loadNotifyServices() {
    try {
      const t = await this.hass.callWS({ type: "get_services" }), e = /* @__PURE__ */ new Set(["notify", "persistent_notification", "send_message"]), s = /* @__PURE__ */ new Set();
      Object.keys(t).forEach((o) => {
        o === "notify" ? Object.keys(t[o] ?? {}).forEach((n) => {
          e.has(n) || s.add(`notify.${n}`);
        }) : t[o]?.notify && s.add(o);
      }), this._notifyServices = [...s].sort();
    } catch {
      this._notifyServices = [];
    }
  }
  _notifyField() {
    const t = String(this._data.notify_service ?? "");
    return {
      name: "notify_service",
      selector: { select: { mode: "dropdown", custom_value: !0, options: [.../* @__PURE__ */ new Set([...this._notifyServices, t])].filter(Boolean).map((s) => ({ value: s, label: s })) } }
    };
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
    const e = this._data, s = {
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
      snooze_delays: String(e.snooze_delays ?? "").split(",").map((o) => parseInt(o.trim(), 10)).filter((o) => !Number.isNaN(o) && o > 0),
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
      this._targetId ? await ne(this.hass, this._targetId, s) : await oe(this.hass, s), this.dispatchEvent(new CustomEvent("saved")), this.open = !1;
    } catch (o) {
      this._error = xt(
        o,
        this._targetId ? "Could not save the reminder." : "Could not create the reminder."
      ), Et(this, this._error, !0);
    } finally {
      this._saving = !1;
    }
  }
  render() {
    return b`
      <ha-dialog
        .open=${this.open}
        .heading=${this._targetId ? "Edit reminder" : "New reminder"}
        @closed=${() => {
      this.open = !1, this.dispatchEvent(new CustomEvent("closed"));
    }}
      >
        <div class="editor">
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${ue(
      this._data.trigger_type ?? "time",
      this._notifyField()
    )}
            .computeLabel=${(t) => gt[t.name] ?? t.name}
            @value-changed=${this._valueChanged}
          ></ha-form>

          <ha-expansion-panel
            .header=${"Advanced settings"}
            .secondary=${this._customised ? "customised" : h}
            .expanded=${this._advancedOpen}
          >
            <ha-form
              .hass=${this.hass}
              .data=${this._data}
              .schema=${pe(
      this._data.trigger_type ?? "time"
    )}
              .computeLabel=${(t) => gt[t.name] ?? t.name}
              @value-changed=${this._valueChanged}
            ></ha-form>
          </ha-expansion-panel>

          ${this._error ? b`<div class="error">${this._error}</div>` : h}
        </div>

        <ha-dialog-footer slot="footer">
          <ha-button slot="secondaryAction" @click=${() => this.open = !1}>
            Cancel
          </ha-button>
          <ha-button
            slot="primaryAction"
            .disabled=${this._saving}
            @click=${this._save}
          >
            ${this._targetId ? "Save" : "Create"}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `;
  }
};
st.styles = vt`
    .editor {
      display: block;
      min-width: min(560px, 80vw);
    }
    .error {
      color: var(--error-color, #db4437);
      padding: 8px 0 0;
    }
    ha-expansion-panel {
      display: block;
      margin-top: 12px;
      --expansion-panel-content-padding: 4px 0 0 0;
    }
  `;
let u = st;
m([
  I({ attribute: !1 })
], u.prototype, "hass");
m([
  I({ attribute: !1 })
], u.prototype, "reminder");
m([
  I({ type: Boolean })
], u.prototype, "open");
m([
  p()
], u.prototype, "_data");
m([
  p()
], u.prototype, "_saving");
m([
  p()
], u.prototype, "_error");
m([
  p()
], u.prototype, "_notifyServices");
m([
  p()
], u.prototype, "_advancedOpen");
m([
  p()
], u.prototype, "_customised");
customElements.get("ha-reminders-editor") || customElements.define("ha-reminders-editor", u);
var me = Object.defineProperty, k = (i, t, e, s) => {
  for (var o = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (o = r(t, e, o) || o);
  return o && me(t, e, o), o;
};
const ye = {
  scheduled: "Scheduled",
  active: "Active",
  snoozed: "Snoozed",
  completed: "Completed",
  disabled: "Disabled"
}, mt = {
  active: 0,
  snoozed: 1,
  scheduled: 2,
  completed: 3,
  disabled: 4
};
function D(i) {
  return i.status ?? "scheduled";
}
function yt(i) {
  return i ? i.replace("zone.", "").replace(/_/g, " ").replace(/\b\w/g, (t) => t.toUpperCase()) : "";
}
function $e(i) {
  if (!i) return "";
  const t = new Date(i);
  if (Number.isNaN(t.getTime())) return i;
  const e = t.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
  return t.toLocaleString(void 0, {
    ...e ? {} : { weekday: "short", month: "short", day: "numeric" },
    hour: "2-digit",
    minute: "2-digit"
  });
}
function ve(i) {
  const t = (i.message ?? "").trim();
  return t && t !== (i.title ?? "").trim() ? t : (i.subtitle ?? "").trim();
}
function we(i) {
  if (i.trigger_type === "zone_enter")
    return `When you enter ${yt(i.zone_entity_id)}`;
  if (i.trigger_type === "zone_leave")
    return `When you leave ${yt(i.zone_entity_id)}`;
  const t = $e(i.next_fire), e = (i.every_x_days ?? 1) > 1 ? ` · every ${i.every_x_days} days` : "";
  return `${t || "Scheduled"}${e}`;
}
function be(i) {
  return i ? Object.values(i.states).filter((t) => typeof t.attributes.reminder_id == "string").map((t) => t.attributes).sort((t, e) => {
    const s = (mt[D(t)] ?? 9) - (mt[D(e)] ?? 9);
    return s !== 0 ? s : String(t.title ?? "").localeCompare(String(e.title ?? ""));
  }) : [];
}
function Ae(i, t) {
  const e = D(i), s = [];
  return e !== "disabled" && e !== "completed" && (s.push({ label: "Mark done", path: te, action: t.complete }), s.push({ label: "Snooze", path: ee, action: t.snooze })), s.push({
    label: i.enabled ? "Disable" : "Enable",
    path: i.enabled ? Xt : Qt,
    action: t.toggleEnabled
  }), s.push({ label: "Edit", path: se, action: t.edit }), s.push({
    label: "Delete",
    path: ie,
    action: t.remove,
    warning: !0
  }), s;
}
const ot = class ot extends x {
  constructor() {
    super(...arguments), this._editorOpen = !1, this._editing = null, this._snoozeTarget = null, this._snoozeMinutes = 15, this._deleteTarget = null;
  }
  openNew() {
    this._editing = null, this._editorOpen = !0;
  }
  openEdit(t) {
    this._editing = t, this._editorOpen = !0;
  }
  /**
   * Close the editor without clearing the target.
   *
   * The editor latches its own target when it opens, so clearing `_editing`
   * here would only blank the row behind a dialog that is still up (`ha-dialog`
   * does not apply `open` synchronously), leaving the form pointing at a null
   * target mid-save. `_editing` is replaced on the next open.
   */
  _closeEditor() {
    this._editorOpen = !1;
  }
  /**
   * Run a row action, reporting a failure instead of swallowing it.
   *
   * These used to `await` a service call with nothing to catch the rejection:
   * a failed snooze/complete/delete left the row unchanged with no feedback.
   */
  async _run(t, e) {
    try {
      return await t(), !0;
    } catch (s) {
      const o = xt(s, "");
      return Et(this, o ? `${e} ${o}` : e, !0), !1;
    }
  }
  async _complete(t) {
    await this._run(
      () => le(this.hass, t.id),
      `Could not complete “${t.title}”.`
    );
  }
  async _toggleEnabled(t) {
    await this._run(
      () => ce(this.hass, t.id, !t.enabled),
      `Could not ${t.enabled ? "disable" : "enable"} “${t.title}”.`
    );
  }
  async _snooze() {
    if (!this._snoozeTarget) return;
    const t = this._snoozeTarget;
    await this._run(
      () => ae(this.hass, t.id, this._snoozeMinutes),
      `Could not snooze “${t.title}”.`
    ) && (this._snoozeTarget = null);
  }
  async _delete() {
    if (!this._deleteTarget) return;
    const t = this._deleteTarget;
    await this._run(
      () => re(this.hass, t.id),
      `Could not delete “${t.title}”.`
    ) && (this._deleteTarget = null);
  }
  _itemsFor(t) {
    return Ae(t, {
      complete: () => void this._complete(t),
      snooze: () => {
        this._snoozeTarget = t, this._snoozeMinutes = 15;
      },
      toggleEnabled: () => void this._toggleEnabled(t),
      edit: () => this.openEdit(t),
      remove: () => {
        this._deleteTarget = t;
      }
    });
  }
  render() {
    const t = be(this.hass);
    return b`
      ${t.length === 0 ? b`<div class="empty">No reminders yet — use “New reminder”.</div>` : t.map((e) => {
      const s = ve(e);
      return b`
              <div class="row">
                <ha-icon
                  icon=${e.trigger_type === "time" ? "mdi:clock-outline" : e.trigger_type === "zone_enter" ? "mdi:home-import-outline" : "mdi:home-export-outline"}
                ></ha-icon>
                <div class="row-text" @click=${() => this.openEdit(e)}>
                  <div class="row-title">${e.title}</div>
                  ${s ? b`<div class="row-snippet">${s}</div>` : h}
                  <div class="row-meta">
                    <span class="chip ${D(e)}"
                      >${ye[D(e)]}</span
                    >
                    <span class="row-trigger">${we(e)}</span>
                  </div>
                </div>
                <ha-icon-overflow-menu
                  .narrow=${!0}
                  .items=${this._itemsFor(e)}
                ></ha-icon-overflow-menu>
              </div>
            `;
    })}

      <ha-reminders-editor
        .hass=${this.hass}
        .reminder=${this._editing}
        .open=${this._editorOpen}
        @saved=${() => this._closeEditor()}
        @closed=${() => this._closeEditor()}
      ></ha-reminders-editor>

      <ha-dialog
        .open=${this._snoozeTarget !== null}
        .heading=${this._snoozeTarget ? `Snooze "${this._snoozeTarget.title}"` : ""}
        @closed=${() => this._snoozeTarget = null}
      >
        <ha-selector
          .hass=${this.hass}
          .selector=${{ number: { min: 1, mode: "box" } }}
          .label=${"Minutes"}
          .value=${this._snoozeMinutes}
          @value-changed=${(e) => {
      e.stopPropagation(), this._snoozeMinutes = Number(e.detail.value) || 15;
    }}
        ></ha-selector>
        <div class="snooze-quick">
          ${[5, 15, 30, 60].map(
      (e) => b`
              <ha-button @click=${() => this._snoozeMinutes = e}
                >${e} min</ha-button
              >
            `
    )}
        </div>
        <ha-dialog-footer slot="footer">
          <ha-button
            slot="secondaryAction"
            @click=${() => this._snoozeTarget = null}
            >Cancel</ha-button
          >
          <ha-button slot="primaryAction" @click=${this._snooze}>Snooze</ha-button>
        </ha-dialog-footer>
      </ha-dialog>

      <ha-dialog
        .open=${this._deleteTarget !== null}
        .heading=${"Delete reminder"}
        @closed=${() => this._deleteTarget = null}
      >
        Delete “${this._deleteTarget?.title ?? ""}”?
        <ha-dialog-footer slot="footer">
          <ha-button
            slot="secondaryAction"
            @click=${() => this._deleteTarget = null}
            >Cancel</ha-button
          >
          <ha-button slot="primaryAction" @click=${this._delete}>Delete</ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `;
  }
};
ot.styles = vt`
    :host {
      display: block;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }
    .row:last-of-type {
      border-bottom: none;
    }
    .row-text {
      flex: 1;
      min-width: 0;
      cursor: pointer;
    }
    .row-title {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .row-snippet {
      color: var(--secondary-text-color);
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .row-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
      min-width: 0;
    }
    .row-trigger {
      color: var(--secondary-text-color);
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chip {
      font-size: 10px;
      line-height: 1;
      padding: 3px 7px;
      border-radius: 9px;
      white-space: nowrap;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      flex-shrink: 0;
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
      opacity: 0.7;
    }
    .empty {
      color: var(--secondary-text-color);
      padding: 24px 8px;
      text-align: center;
    }
    .snooze-quick {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      padding-top: 8px;
    }
  `;
let g = ot;
k([
  I({ attribute: !1 })
], g.prototype, "hass");
k([
  p()
], g.prototype, "_editorOpen");
k([
  p()
], g.prototype, "_editing");
k([
  p()
], g.prototype, "_snoozeTarget");
k([
  p()
], g.prototype, "_snoozeMinutes");
k([
  p()
], g.prototype, "_deleteTarget");
customElements.get("ha-reminders-list") || customElements.define("ha-reminders-list", g);
export {
  x as a,
  b,
  xe as e,
  vt as i,
  I as n,
  p as r
};

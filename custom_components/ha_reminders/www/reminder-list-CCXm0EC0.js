/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const j = globalThis, te = j.ShadowRoot && (j.ShadyCSS === void 0 || j.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ie = Symbol(), ae = /* @__PURE__ */ new WeakMap();
let we = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== ie) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (te && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = ae.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && ae.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const ze = (s) => new we(typeof s == "string" ? s : s + "", void 0, ie), be = (s, ...e) => {
  const t = s.length === 1 ? s[0] : e.reduce((i, o, n) => i + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + s[n + 1], s[0]);
  return new we(t, s, ie);
}, ke = (s, e) => {
  if (te) s.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), o = j.litNonce;
    o !== void 0 && i.setAttribute("nonce", o), i.textContent = t.cssText, s.appendChild(i);
  }
}, le = te ? (s) => s : (s) => s instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return ze(t);
})(s) : s;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Oe, defineProperty: Ue, getOwnPropertyDescriptor: Me, getOwnPropertyNames: Pe, getOwnPropertySymbols: Le, getPrototypeOf: Ne } = Object, w = globalThis, ce = w.trustedTypes, He = ce ? ce.emptyScript : "", Re = w.reactiveElementPolyfillSupport, M = (s, e) => s, B = { toAttribute(s, e) {
  switch (e) {
    case Boolean:
      s = s ? He : null;
      break;
    case Object:
    case Array:
      s = s == null ? s : JSON.stringify(s);
  }
  return s;
}, fromAttribute(s, e) {
  let t = s;
  switch (e) {
    case Boolean:
      t = s !== null;
      break;
    case Number:
      t = s === null ? null : Number(s);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(s);
      } catch {
        t = null;
      }
  }
  return t;
} }, se = (s, e) => !Oe(s, e), de = { attribute: !0, type: String, converter: B, reflect: !1, useDefault: !1, hasChanged: se };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), w.litPropertyMetadata ?? (w.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let E = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = de) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), o = this.getPropertyDescriptor(e, i, t);
      o !== void 0 && Ue(this.prototype, e, o);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: o, set: n } = Me(this.prototype, e) ?? { get() {
      return this[t];
    }, set(r) {
      this[t] = r;
    } };
    return { get: o, set(r) {
      const l = o?.call(this);
      n?.call(this, r), this.requestUpdate(e, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? de;
  }
  static _$Ei() {
    if (this.hasOwnProperty(M("elementProperties"))) return;
    const e = Ne(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(M("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(M("properties"))) {
      const t = this.properties, i = [...Pe(t), ...Le(t)];
      for (const o of i) this.createProperty(o, t[o]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, o] of t) this.elementProperties.set(i, o);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const o = this._$Eu(t, i);
      o !== void 0 && this._$Eh.set(o, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const o of i) t.unshift(le(o));
    } else e !== void 0 && t.push(le(e));
    return t;
  }
  static _$Eu(e, t) {
    const i = t.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof e == "string" ? e.toLowerCase() : void 0;
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
    for (const i of t.keys()) this.hasOwnProperty(i) && (e.set(i, this[i]), delete this[i]);
    e.size > 0 && (this._$Ep = e);
  }
  createRenderRoot() {
    const e = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return ke(e, this.constructor.elementStyles), e;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), this._$EO?.forEach((e) => e.hostConnected?.());
  }
  enableUpdating(e) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((e) => e.hostDisconnected?.());
  }
  attributeChangedCallback(e, t, i) {
    this._$AK(e, i);
  }
  _$ET(e, t) {
    const i = this.constructor.elementProperties.get(e), o = this.constructor._$Eu(e, i);
    if (o !== void 0 && i.reflect === !0) {
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : B).toAttribute(t, i.type);
      this._$Em = e, n == null ? this.removeAttribute(o) : this.setAttribute(o, n), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const i = this.constructor, o = i._$Eh.get(e);
    if (o !== void 0 && this._$Em !== o) {
      const n = i.getPropertyOptions(o), r = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : B;
      this._$Em = o;
      const l = r.fromAttribute(t, n.type);
      this[o] = l ?? this._$Ej?.get(o) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, o = !1, n) {
    if (e !== void 0) {
      const r = this.constructor;
      if (o === !1 && (n = this[e]), i ?? (i = r.getPropertyOptions(e)), !((i.hasChanged ?? se)(n, t) || i.useDefault && i.reflect && n === this._$Ej?.get(e) && !this.hasAttribute(r._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: o, wrapped: n }, r) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, r ?? t ?? this[e]), n !== !0 || r !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), o === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [o, n] of i) {
        const { wrapped: r } = n, l = this[o];
        r !== !0 || this._$AL.has(o) || l === void 0 || this.C(o, void 0, n, l);
      }
    }
    let e = !1;
    const t = this._$AL;
    try {
      e = this.shouldUpdate(t), e ? (this.willUpdate(t), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(t)) : this._$EM();
    } catch (i) {
      throw e = !1, this._$EM(), i;
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
E.elementStyles = [], E.shadowRootOptions = { mode: "open" }, E[M("elementProperties")] = /* @__PURE__ */ new Map(), E[M("finalized")] = /* @__PURE__ */ new Map(), Re?.({ ReactiveElement: E }), (w.reactiveElementVersions ?? (w.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const P = globalThis, he = (s) => s, F = P.trustedTypes, _e = F ? F.createPolicy("lit-html", { createHTML: (s) => s }) : void 0, Ae = "$lit$", v = `lit$${Math.random().toFixed(9).slice(2)}$`, xe = "?" + v, De = `<${xe}>`, S = document, N = () => S.createComment(""), H = (s) => s === null || typeof s != "object" && typeof s != "function", oe = Array.isArray, Ie = (s) => oe(s) || typeof s?.[Symbol.iterator] == "function", q = `[ 	
\f\r]`, U = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pe = /-->/g, ue = />/g, A = RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), fe = /'/g, me = /"/g, Se = /^(?:script|style|textarea|title)$/i, Ve = (s) => (e, ...t) => ({ _$litType$: s, strings: e, values: t }), g = Ve(1), T = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), ge = /* @__PURE__ */ new WeakMap(), x = S.createTreeWalker(S, 129);
function Ee(s, e) {
  if (!oe(s) || !s.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return _e !== void 0 ? _e.createHTML(e) : e;
}
const je = (s, e) => {
  const t = s.length - 1, i = [];
  let o, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = U;
  for (let l = 0; l < t; l++) {
    const a = s[l];
    let h, _, c = -1, m = 0;
    for (; m < a.length && (r.lastIndex = m, _ = r.exec(a), _ !== null); ) m = r.lastIndex, r === U ? _[1] === "!--" ? r = pe : _[1] !== void 0 ? r = ue : _[2] !== void 0 ? (Se.test(_[2]) && (o = RegExp("</" + _[2], "g")), r = A) : _[3] !== void 0 && (r = A) : r === A ? _[0] === ">" ? (r = o ?? U, c = -1) : _[1] === void 0 ? c = -2 : (c = r.lastIndex - _[2].length, h = _[1], r = _[3] === void 0 ? A : _[3] === '"' ? me : fe) : r === me || r === fe ? r = A : r === pe || r === ue ? r = U : (r = A, o = void 0);
    const $ = r === A && s[l + 1].startsWith("/>") ? " " : "";
    n += r === U ? a + De : c >= 0 ? (i.push(h), a.slice(0, c) + Ae + a.slice(c) + v + $) : a + v + (c === -2 ? l : $);
  }
  return [Ee(s, n + (s[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class R {
  constructor({ strings: e, _$litType$: t }, i) {
    let o;
    this.parts = [];
    let n = 0, r = 0;
    const l = e.length - 1, a = this.parts, [h, _] = je(e, t);
    if (this.el = R.createElement(h, i), x.currentNode = this.el.content, t === 2 || t === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (o = x.nextNode()) !== null && a.length < l; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const c of o.getAttributeNames()) if (c.endsWith(Ae)) {
          const m = _[r++], $ = o.getAttribute(c).split(v), V = /([.?@])?(.*)/.exec(m);
          a.push({ type: 1, index: n, name: V[2], strings: $, ctor: V[1] === "." ? Fe : V[1] === "?" ? We : V[1] === "@" ? qe : W }), o.removeAttribute(c);
        } else c.startsWith(v) && (a.push({ type: 6, index: n }), o.removeAttribute(c));
        if (Se.test(o.tagName)) {
          const c = o.textContent.split(v), m = c.length - 1;
          if (m > 0) {
            o.textContent = F ? F.emptyScript : "";
            for (let $ = 0; $ < m; $++) o.append(c[$], N()), x.nextNode(), a.push({ type: 2, index: ++n });
            o.append(c[m], N());
          }
        }
      } else if (o.nodeType === 8) if (o.data === xe) a.push({ type: 2, index: n });
      else {
        let c = -1;
        for (; (c = o.data.indexOf(v, c + 1)) !== -1; ) a.push({ type: 7, index: n }), c += v.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const i = S.createElement("template");
    return i.innerHTML = e, i;
  }
}
function z(s, e, t = s, i) {
  if (e === T) return e;
  let o = i !== void 0 ? t._$Co?.[i] : t._$Cl;
  const n = H(e) ? void 0 : e._$litDirective$;
  return o?.constructor !== n && (o?._$AO?.(!1), n === void 0 ? o = void 0 : (o = new n(s), o._$AT(s, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = o : t._$Cl = o), o !== void 0 && (e = z(s, o._$AS(s, e.values), o, i)), e;
}
class Be {
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
    const { el: { content: t }, parts: i } = this._$AD, o = (e?.creationScope ?? S).importNode(t, !0);
    x.currentNode = o;
    let n = x.nextNode(), r = 0, l = 0, a = i[0];
    for (; a !== void 0; ) {
      if (r === a.index) {
        let h;
        a.type === 2 ? h = new I(n, n.nextSibling, this, e) : a.type === 1 ? h = new a.ctor(n, a.name, a.strings, this, e) : a.type === 6 && (h = new Ze(n, this, e)), this._$AV.push(h), a = i[++l];
      }
      r !== a?.index && (n = x.nextNode(), r++);
    }
    return x.currentNode = S, o;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class I {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, i, o) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = o, this._$Cv = o?.isConnected ?? !0;
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
    e = z(this, e, t), H(e) ? e === d || e == null || e === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : e !== this._$AH && e !== T && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ie(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== d && H(this._$AH) ? this._$AA.nextSibling.data = e : this.T(S.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: i } = e, o = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = R.createElement(Ee(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === o) this._$AH.p(t);
    else {
      const n = new Be(o, this), r = n.u(this.options);
      n.p(t), this.T(r), this._$AH = n;
    }
  }
  _$AC(e) {
    let t = ge.get(e.strings);
    return t === void 0 && ge.set(e.strings, t = new R(e)), t;
  }
  k(e) {
    oe(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, o = 0;
    for (const n of e) o === t.length ? t.push(i = new I(this.O(N()), this.O(N()), this, this.options)) : i = t[o], i._$AI(n), o++;
    o < t.length && (this._$AR(i && i._$AB.nextSibling, o), t.length = o);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const i = he(e).nextSibling;
      he(e).remove(), e = i;
    }
  }
  setConnected(e) {
    this._$AM === void 0 && (this._$Cv = e, this._$AP?.(e));
  }
}
class W {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(e, t, i, o, n) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = e, this.name = t, this._$AM = o, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = d;
  }
  _$AI(e, t = this, i, o) {
    const n = this.strings;
    let r = !1;
    if (n === void 0) e = z(this, e, t, 0), r = !H(e) || e !== this._$AH && e !== T, r && (this._$AH = e);
    else {
      const l = e;
      let a, h;
      for (e = n[0], a = 0; a < n.length - 1; a++) h = z(this, l[i + a], t, a), h === T && (h = this._$AH[a]), r || (r = !H(h) || h !== this._$AH[a]), h === d ? e = d : e !== d && (e += (h ?? "") + n[a + 1]), this._$AH[a] = h;
    }
    r && !o && this.j(e);
  }
  j(e) {
    e === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Fe extends W {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === d ? void 0 : e;
  }
}
class We extends W {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== d);
  }
}
class qe extends W {
  constructor(e, t, i, o, n) {
    super(e, t, i, o, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = z(this, e, t, 0) ?? d) === T) return;
    const i = this._$AH, o = e === d && i !== d || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, n = e !== d && (i === d || o);
    o && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Ze {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    z(this, e);
  }
}
const Ge = P.litHtmlPolyfillSupport;
Ge?.(R, I), (P.litHtmlVersions ?? (P.litHtmlVersions = [])).push("3.3.3");
const Ke = (s, e, t) => {
  const i = t?.renderBefore ?? e;
  let o = i._$litPart$;
  if (o === void 0) {
    const n = t?.renderBefore ?? null;
    i._$litPart$ = o = new I(e.insertBefore(N(), n), n, void 0, t ?? {});
  }
  return o._$AI(s), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const L = globalThis;
class C extends E {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = Ke(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return T;
  }
}
C._$litElement$ = !0, C.finalized = !0, L.litElementHydrateSupport?.({ LitElement: C });
const Je = L.litElementPolyfillSupport;
Je?.({ LitElement: C });
(L.litElementVersions ?? (L.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ye = { attribute: !0, type: String, converter: B, reflect: !1, hasChanged: se }, Xe = (s = Ye, e, t) => {
  const { kind: i, metadata: o } = t;
  let n = globalThis.litPropertyMetadata.get(o);
  if (n === void 0 && globalThis.litPropertyMetadata.set(o, n = /* @__PURE__ */ new Map()), i === "setter" && ((s = Object.create(s)).wrapped = !0), n.set(t.name, s), i === "accessor") {
    const { name: r } = t;
    return { set(l) {
      const a = e.get.call(this);
      e.set.call(this, l), this.requestUpdate(r, a, s, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(r, void 0, s, l), l;
    } };
  }
  if (i === "setter") {
    const { name: r } = t;
    return function(l) {
      const a = this[r];
      e.call(this, l), this.requestUpdate(r, a, s, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function k(s) {
  return (e, t) => typeof t == "object" ? Xe(s, e, t) : ((i, o, n) => {
    const r = o.hasOwnProperty(n);
    return o.constructor.createProperty(n, i), r ? Object.getOwnPropertyDescriptor(o, n) : void 0;
  })(s, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function u(s) {
  return k({ ...s, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Qe = (s, e, t) => (t.configurable = !0, t.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(s, e, t), t);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function zt(s, e) {
  return (t, i, o) => {
    const n = (r) => r.renderRoot?.querySelector(s) ?? null;
    return Qe(t, i, { get() {
      return n(this);
    } });
  };
}
var et = "M22.11,21.46L2.39,1.73L1.11,3L5.83,7.72C5.29,8.73 5,9.86 5,11V17L3,19V20H18.11L20.84,22.73L22.11,21.46M7,18V11C7,10.39 7.11,9.79 7.34,9.23L16.11,18H7M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M8.29,5.09C8.82,4.75 9.4,4.5 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V15.8L17,13.8V11A5,5 0 0,0 12,6C11.22,6 10.45,6.2 9.76,6.56L8.29,5.09Z", tt = "M10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21M21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19M17 11C17 8.2 14.8 6 12 6S7 8.2 7 11V18H17V11Z", it = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z", st = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", ot = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", nt = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z";
const O = "ha_reminders";
async function rt(s, e) {
  const t = await s.callService(O, "create", e);
  return String(t?.reminder_id ?? "");
}
async function at(s, e, t) {
  await s.callService(O, "update", {
    reminder_id: e,
    ...t
  });
}
async function lt(s, e) {
  await s.callService(O, "delete", { reminder_id: e });
}
async function ct(s, e, t) {
  await s.callService(O, "snooze", {
    reminder_id: e,
    minutes: t
  });
}
async function dt(s, e) {
  await s.callService(O, "complete", { reminder_id: e });
}
async function ht(s, e, t) {
  await s.callService(O, "set_enabled", {
    reminder_id: e,
    enabled: t
  });
}
function Ce(s, e, t = !1) {
  const i = e.trim();
  i && s.dispatchEvent(
    new CustomEvent("hass-notification", {
      detail: { message: i, ...t ? { duration: 8e3 } : {} },
      bubbles: !0,
      composed: !0
    })
  );
}
function Te(s, e) {
  return s instanceof Error && s.message ? s.message : s?.body?.message || e;
}
var _t = Object.defineProperty, y = (s, e, t, i) => {
  for (var o = void 0, n = s.length - 1, r; n >= 0; n--)
    (r = s[n]) && (o = r(e, t, o) || o);
  return o && _t(e, t, o), o;
};
const pt = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" }
], ye = {
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
  icon: "Icon (mdi:name or image URL; empty = default)",
  color: "Color (Android)",
  channel: "Channel (Android)",
  channel_importance: "Channel importance",
  notification_group: "Notification group",
  acknowledge_notification_title: "Completion title (group)",
  acknowledge_notification_body: "Completion message (group)"
}, ut = [
  { value: "time", label: "At a fixed time" },
  { value: "zone_enter", label: "When I enter a zone" },
  { value: "zone_leave", label: "When I leave a zone" }
];
function ft(s, e) {
  const t = [
    { name: "title", selector: { text: {} }, required: !0 },
    { name: "message", selector: { text: { multiline: !0 } }, required: !0 },
    {
      name: "trigger_type",
      selector: { select: { mode: "dropdown", options: ut } }
    }
  ];
  return s === "time" ? t.push({ name: "time", selector: { time: {} } }) : (t.push({ name: "zone_entity_id", selector: { entity: { domain: "zone" } } }), t.push({
    name: "person_entity_ids",
    selector: { entity: { domain: "person", multiple: !0 } }
  })), t.push(e), t;
}
function mt(s) {
  const e = [
    { name: "subtitle", selector: { text: {} } },
    { name: "user_name", selector: { text: {} } },
    { name: "one_shot", selector: { boolean: {} } }
  ];
  return s === "time" ? e.push({ name: "every_x_days", selector: { number: { min: 1, mode: "box" } } }) : (e.push({ name: "time_window_start", selector: { time: {} } }), e.push({ name: "time_window_end", selector: { time: {} } })), e.push(
    { name: "start_date", selector: { date: {} } },
    { name: "stop_date", selector: { date: {} } },
    {
      name: "exclude_days_of_week",
      selector: { select: { multiple: !0, options: pt } }
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
    { name: "icon", selector: { text: {} } },
    { name: "color", selector: { text: {} } },
    { name: "notification_group", selector: { text: {} } },
    { name: "acknowledge_notification_title", selector: { text: {} } },
    { name: "acknowledge_notification_body", selector: { text: { multiline: !0 } } }
  ), e;
}
const K = [5, 15, 30, 45, 60], gt = "Someone", J = "Snooze for ${time}", Y = "Mark as done", X = "Someone acknowledged the notification", Q = 15, ee = 1;
function yt(s) {
  if (!s) return !1;
  const e = s.snooze_delays?.length ? s.snooze_delays : K, t = (s.user_name ?? "").trim();
  return !!((s.subtitle ?? "").trim() || t && t !== gt || s.one_shot || (s.every_x_days ?? 1) !== 1 || s.start_date || s.stop_date || (s.exclude_days_of_week ?? []).length > 0 || s.time_window_start || s.time_window_end || e.join(",") !== K.join(",") || (s.snooze_text ?? J) !== J || (s.acknowledge_action_title ?? Y) !== Y || (s.wait_time_if_no_action ?? Q) !== Q || (s.notification_count ?? ee) !== ee || (s.channel_importance ?? "") || (s.channel ?? "") || (s.icon ?? "") || (s.color ?? "") || (s.notification_group ?? "") || (s.acknowledge_notification_title ?? X) !== X || (s.acknowledge_notification_body ?? "").trim());
}
const ne = class ne extends C {
  constructor() {
    super(...arguments), this.reminder = null, this.open = !1, this._data = {}, this._saving = !1, this._error = "", this._notifyServices = [], this._advancedOpen = !1, this._customised = !1, this._collapseAdvanced = !1, this._targetId = null, this._wasOpen = !1;
  }
  willUpdate() {
    const e = this.open && !this._wasOpen;
    this._wasOpen = this.open, e && (this._targetId = this.reminder?.id ?? null, this._customised = yt(this.reminder), this._data = this._dataFrom(this.reminder), this._error = "", this._saving = !1, this._advancedOpen = !1, this._collapseAdvanced = !0, this._loadNotifyServices());
  }
  updated() {
    if (!this._collapseAdvanced) return;
    this._collapseAdvanced = !1;
    const e = this.renderRoot.querySelector("ha-expansion-panel");
    e && (e.expanded = !1);
  }
  _time(e) {
    return e ? e.length === 5 ? `${e}:00` : e : "";
  }
  _dataFrom(e) {
    return {
      title: e?.title ?? "",
      subtitle: e?.subtitle ?? "",
      message: e?.message ?? "",
      notify_service: e?.notify_service ?? "",
      user_name: e?.user_name ?? "",
      trigger_type: e?.trigger_type ?? "time",
      one_shot: e?.one_shot ?? !1,
      time: this._time(e?.time),
      every_x_days: e?.every_x_days ?? 1,
      start_date: e?.start_date ?? "",
      stop_date: e?.stop_date ?? "",
      exclude_days_of_week: (e?.exclude_days_of_week ?? []).map(String),
      zone_entity_id: e?.zone_entity_id ?? "",
      person_entity_ids: e?.person_entity_ids ?? [],
      time_window_start: this._time(e?.time_window_start),
      time_window_end: this._time(e?.time_window_end),
      acknowledge_action_title: e?.acknowledge_action_title ?? Y,
      snooze_delays: (e?.snooze_delays ?? K).join(","),
      snooze_text: e?.snooze_text ?? J,
      wait_time_if_no_action: e?.wait_time_if_no_action ?? Q,
      notification_count: e?.notification_count ?? ee,
      icon: e?.icon ?? "",
      color: e?.color ?? "",
      channel: e?.channel ?? "",
      channel_importance: e?.channel_importance ?? "",
      notification_group: e?.notification_group ?? "",
      acknowledge_notification_title: e?.acknowledge_notification_title ?? X,
      acknowledge_notification_body: e?.acknowledge_notification_body ?? ""
    };
  }
  async _loadNotifyServices() {
    try {
      const e = await this.hass.callWS({ type: "get_services" }), t = /* @__PURE__ */ new Set(["notify", "persistent_notification", "send_message"]), i = /* @__PURE__ */ new Set();
      Object.keys(e).forEach((o) => {
        o === "notify" ? Object.keys(e[o] ?? {}).forEach((n) => {
          t.has(n) || i.add(`notify.${n}`);
        }) : e[o]?.notify && i.add(o);
      }), this._notifyServices = [...i].sort();
    } catch {
      this._notifyServices = [];
    }
  }
  _notifyField() {
    const e = String(this._data.notify_service ?? "");
    return {
      name: "notify_service",
      selector: { select: { mode: "dropdown", custom_value: !0, options: [.../* @__PURE__ */ new Set([...this._notifyServices, e])].filter(Boolean).map((i) => ({ value: i, label: i })) } }
    };
  }
  _valueChanged(e) {
    e.stopPropagation(), this._data = { ...e.detail.value };
  }
  _validationError() {
    const e = this._data;
    if (!String(e.title ?? "").trim()) return "A title is required.";
    if (!String(e.message ?? "").trim()) return "A message is required.";
    if (e.trigger_type === "time") {
      if (!e.time) return "Pick a time for the reminder.";
    } else {
      if (!e.zone_entity_id) return "Pick a zone to watch.";
      if (!e.person_entity_ids?.length)
        return "Pick at least one person to watch.";
    }
    return "";
  }
  _orUndefined(e) {
    if (!(e === "" || e === null) && !(Array.isArray(e) && e.length === 0))
      return e;
  }
  async _save() {
    if (this._saving) return;
    const e = this._validationError();
    if (e) {
      this._error = e;
      return;
    }
    this._saving = !0, this._error = "";
    const t = this._data, i = {
      title: String(t.title).trim(),
      message: String(t.message).trim(),
      subtitle: this._orUndefined(t.subtitle),
      notify_service: this._orUndefined(t.notify_service),
      user_name: this._orUndefined(t.user_name),
      trigger_type: t.trigger_type ?? "time",
      one_shot: !!t.one_shot,
      time: this._orUndefined(t.time),
      every_x_days: t.every_x_days ?? 1,
      start_date: this._orUndefined(t.start_date),
      stop_date: this._orUndefined(t.stop_date),
      exclude_days_of_week: t.exclude_days_of_week ?? [],
      zone_entity_id: this._orUndefined(t.zone_entity_id),
      person_entity_ids: t.person_entity_ids ?? [],
      time_window_start: this._orUndefined(t.time_window_start),
      time_window_end: this._orUndefined(t.time_window_end),
      acknowledge_action_title: this._orUndefined(t.acknowledge_action_title),
      snooze_delays: String(t.snooze_delays ?? "").split(",").map((o) => parseInt(o.trim(), 10)).filter((o) => !Number.isNaN(o) && o > 0),
      snooze_text: this._orUndefined(t.snooze_text),
      wait_time_if_no_action: t.wait_time_if_no_action,
      notification_count: t.notification_count,
      color: this._orUndefined(t.color),
      icon: this._orUndefined(t.icon),
      channel: this._orUndefined(t.channel),
      channel_importance: this._orUndefined(t.channel_importance),
      notification_group: this._orUndefined(t.notification_group),
      acknowledge_notification_title: this._orUndefined(
        t.acknowledge_notification_title
      ),
      acknowledge_notification_body: this._orUndefined(
        t.acknowledge_notification_body
      )
    };
    try {
      this._targetId ? await at(this.hass, this._targetId, i) : await rt(this.hass, i), this.dispatchEvent(new CustomEvent("saved")), this.open = !1;
    } catch (o) {
      this._error = Te(
        o,
        this._targetId ? "Could not save the reminder." : "Could not create the reminder."
      ), Ce(this, this._error, !0);
    } finally {
      this._saving = !1;
    }
  }
  render() {
    return g`
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
            .schema=${ft(
      this._data.trigger_type ?? "time",
      this._notifyField()
    )}
            .computeLabel=${(e) => ye[e.name] ?? e.name}
            @value-changed=${this._valueChanged}
          ></ha-form>

          <ha-expansion-panel
            .header=${"Advanced settings"}
            .secondary=${this._customised ? "customised" : d}
            .expanded=${this._advancedOpen}
          >
            <ha-form
              .hass=${this.hass}
              .data=${this._data}
              .schema=${mt(
      this._data.trigger_type ?? "time"
    )}
              .computeLabel=${(e) => ye[e.name] ?? e.name}
              @value-changed=${this._valueChanged}
            ></ha-form>
          </ha-expansion-panel>

          ${this._error ? g`<div class="error">${this._error}</div>` : d}
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
ne.styles = be`
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
let p = ne;
y([
  k({ attribute: !1 })
], p.prototype, "hass");
y([
  k({ attribute: !1 })
], p.prototype, "reminder");
y([
  k({ type: Boolean })
], p.prototype, "open");
y([
  u()
], p.prototype, "_data");
y([
  u()
], p.prototype, "_saving");
y([
  u()
], p.prototype, "_error");
y([
  u()
], p.prototype, "_notifyServices");
y([
  u()
], p.prototype, "_advancedOpen");
y([
  u()
], p.prototype, "_customised");
customElements.get("ha-reminders-editor") || customElements.define("ha-reminders-editor", p);
var $t = Object.defineProperty, b = (s, e, t, i) => {
  for (var o = void 0, n = s.length - 1, r; n >= 0; n--)
    (r = s[n]) && (o = r(e, t, o) || o);
  return o && $t(e, t, o), o;
};
const vt = {
  scheduled: "Scheduled",
  active: "Active",
  snoozed: "Snoozed",
  completed: "Completed",
  disabled: "Disabled"
}, $e = {
  active: 0,
  snoozed: 1,
  scheduled: 2,
  completed: 3,
  disabled: 4
};
function D(s) {
  return s.status ?? "scheduled";
}
function ve(s) {
  return s ? s.replace("zone.", "").replace(/_/g, " ").replace(/\b\w/g, (e) => e.toUpperCase()) : "";
}
function wt(s) {
  if (!s) return "";
  const e = new Date(s);
  if (Number.isNaN(e.getTime())) return s;
  const t = e.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
  return e.toLocaleString(void 0, {
    ...t ? {} : { weekday: "short", month: "short", day: "numeric" },
    hour: "2-digit",
    minute: "2-digit"
  });
}
function bt(s) {
  const e = (s.message ?? "").trim();
  return e && e !== (s.title ?? "").trim() ? e : (s.subtitle ?? "").trim();
}
function At(s) {
  if (s.trigger_type === "zone_enter")
    return `When you enter ${ve(s.zone_entity_id)}`;
  if (s.trigger_type === "zone_leave")
    return `When you leave ${ve(s.zone_entity_id)}`;
  const e = wt(s.next_fire), t = (s.every_x_days ?? 1) > 1 ? ` · every ${s.every_x_days} days` : "";
  return `${e || "Scheduled"}${t}`;
}
function xt(s) {
  return s ? Object.values(s.states).filter((e) => typeof e.attributes.reminder_id == "string").map((e) => e.attributes).sort((e, t) => {
    const i = ($e[D(e)] ?? 9) - ($e[D(t)] ?? 9);
    return i !== 0 ? i : String(e.title ?? "").localeCompare(String(t.title ?? ""));
  }) : [];
}
function Z(s, e) {
  return String(s.title ?? "").localeCompare(String(e.title ?? ""));
}
function G(s, e) {
  const t = (s ?? "").trim(), i = (e ?? "").trim();
  return t === i ? null : t ? i ? t < i ? -1 : 1 : -1 : 1;
}
function St(s) {
  const e = { time: [], location: [], completed: [] };
  for (const t of s)
    D(t) === "completed" ? e.completed.push(t) : t.trigger_type === "time" ? e.time.push(t) : e.location.push(t);
  return e.time.sort(
    (t, i) => G(t.time, i.time) ?? Z(t, i)
  ), e.location.sort(
    (t, i) => G(t.created_at, i.created_at) ?? Z(t, i)
  ), e.completed.sort((t, i) => {
    const o = G(t.completed_at, i.completed_at);
    return o === null ? Z(t, i) : -o;
  }), e;
}
function Et(s, e) {
  const t = D(s), i = [];
  return t !== "disabled" && t !== "completed" && (i.push({ label: "Mark done", path: it, action: e.complete }), i.push({ label: "Snooze", path: st, action: e.snooze })), i.push({
    label: s.enabled ? "Disable" : "Enable",
    path: s.enabled ? et : tt,
    action: e.toggleEnabled
  }), i.push({ label: "Edit", path: nt, action: e.edit }), i.push({
    label: "Delete",
    path: ot,
    action: e.remove,
    warning: !0
  }), i;
}
const re = class re extends C {
  constructor() {
    super(...arguments), this.grouped = !1, this._expanded = {
      time: !0,
      location: !0,
      completed: !1
    }, this._editorOpen = !1, this._editing = null, this._snoozeTarget = null, this._snoozeMinutes = 15, this._deleteTarget = null;
  }
  openNew() {
    this._editing = null, this._editorOpen = !0;
  }
  openEdit(e) {
    this._editing = e, this._editorOpen = !0;
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
  async _run(e, t) {
    try {
      return await e(), !0;
    } catch (i) {
      const o = Te(i, "");
      return Ce(this, o ? `${t} ${o}` : t, !0), !1;
    }
  }
  async _complete(e) {
    await this._run(
      () => dt(this.hass, e.id),
      `Could not complete “${e.title}”.`
    );
  }
  async _toggleEnabled(e) {
    await this._run(
      () => ht(this.hass, e.id, !e.enabled),
      `Could not ${e.enabled ? "disable" : "enable"} “${e.title}”.`
    );
  }
  async _snooze() {
    if (!this._snoozeTarget) return;
    const e = this._snoozeTarget;
    await this._run(
      () => ct(this.hass, e.id, this._snoozeMinutes),
      `Could not snooze “${e.title}”.`
    ) && (this._snoozeTarget = null);
  }
  async _delete() {
    if (!this._deleteTarget) return;
    const e = this._deleteTarget;
    await this._run(
      () => lt(this.hass, e.id),
      `Could not delete “${e.title}”.`
    ) && (this._deleteTarget = null);
  }
  _itemsFor(e) {
    return Et(e, {
      complete: () => void this._complete(e),
      snooze: () => {
        this._snoozeTarget = e, this._snoozeMinutes = 15;
      },
      toggleEnabled: () => void this._toggleEnabled(e),
      edit: () => this.openEdit(e),
      remove: () => {
        this._deleteTarget = e;
      }
    });
  }
  /** One row: the text block (which opens the editor) plus the overflow menu. */
  _renderRow(e) {
    const t = bt(e), i = D(e);
    return g`
      <div class="row">
        <ha-icon
          icon=${e.trigger_type === "time" ? "mdi:clock-outline" : e.trigger_type === "zone_enter" ? "mdi:home-import-outline" : "mdi:home-export-outline"}
        ></ha-icon>
        <div class="row-text" @click=${() => this.openEdit(e)}>
          <div class="row-title">${e.title}</div>
          ${t ? g`<div class="row-snippet">${t}</div>` : d}
          <div class="row-meta">
            <span class="chip ${i}">${vt[i]}</span>
            <span class="row-trigger">${At(e)}</span>
          </div>
        </div>
        <ha-icon-overflow-menu
          .narrow=${!0}
          .items=${this._itemsFor(e)}
        ></ha-icon-overflow-menu>
      </div>
    `;
  }
  /** One collapsible section; empty sections are left out entirely. */
  _renderGroup(e, t, i) {
    return i.length === 0 ? d : g`
      <ha-expansion-panel
        .header=${t}
        .secondary=${String(i.length)}
        .expanded=${this._expanded[e]}
        @expanded-changed=${(o) => {
      this._expanded = {
        ...this._expanded,
        [e]: !!o.detail?.expanded
      };
    }}
      >
        ${i.map((o) => this._renderRow(o))}
      </ha-expansion-panel>
    `;
  }
  render() {
    const e = xt(this.hass), t = St(e);
    return g`
      ${e.length === 0 ? g`<div class="empty">No reminders yet — use “New reminder”.</div>` : this.grouped ? g`${this._renderGroup("time", "Time", t.time)}
              ${this._renderGroup("location", "Location", t.location)}
              ${this._renderGroup("completed", "Completed", t.completed)}` : e.map((i) => this._renderRow(i))}

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
          @value-changed=${(i) => {
      i.stopPropagation(), this._snoozeMinutes = Number(i.detail.value) || 15;
    }}
        ></ha-selector>
        <div class="snooze-quick">
          ${[5, 15, 30, 60].map(
      (i) => g`
              <ha-button @click=${() => this._snoozeMinutes = i}
                >${i} min</ha-button
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
re.styles = be`
    :host {
      display: block;
    }
    ha-expansion-panel {
      display: block;
      --expansion-panel-content-padding: 0;
    }
    /* Group headers already read as separators; keep one between sections. */
    ha-expansion-panel + ha-expansion-panel {
      border-top: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
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
let f = re;
b([
  k({ attribute: !1 })
], f.prototype, "hass");
b([
  k({ type: Boolean })
], f.prototype, "grouped");
b([
  u()
], f.prototype, "_expanded");
b([
  u()
], f.prototype, "_editorOpen");
b([
  u()
], f.prototype, "_editing");
b([
  u()
], f.prototype, "_snoozeTarget");
b([
  u()
], f.prototype, "_snoozeMinutes");
b([
  u()
], f.prototype, "_deleteTarget");
customElements.get("ha-reminders-list") || customElements.define("ha-reminders-list", f);
export {
  C as a,
  g as b,
  zt as e,
  be as i,
  k as n,
  u as r
};

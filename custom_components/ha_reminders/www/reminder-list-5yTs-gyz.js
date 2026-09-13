/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const j = globalThis, Q = j.ShadowRoot && (j.ShadyCSS === void 0 || j.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, ee = Symbol(), ne = /* @__PURE__ */ new WeakMap();
let $e = class {
  constructor(e, t, s) {
    if (this._$cssResult$ = !0, s !== ee) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Q && e === void 0) {
      const s = t !== void 0 && t.length === 1;
      s && (e = ne.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), s && ne.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const xe = (i) => new $e(typeof i == "string" ? i : i + "", void 0, ee), ve = (i, ...e) => {
  const t = i.length === 1 ? i[0] : e.reduce((s, o, n) => s + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(o) + i[n + 1], i[0]);
  return new $e(t, i, ee);
}, Ee = (i, e) => {
  if (Q) i.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const s = document.createElement("style"), o = j.litNonce;
    o !== void 0 && s.setAttribute("nonce", o), s.textContent = t.cssText, i.appendChild(s);
  }
}, re = Q ? (i) => i : (i) => i instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const s of e.cssRules) t += s.cssText;
  return xe(t);
})(i) : i;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Ce, defineProperty: ze, getOwnPropertyDescriptor: Te, getOwnPropertyNames: Oe, getOwnPropertySymbols: ke, getPrototypeOf: Ue } = Object, $ = globalThis, ae = $.trustedTypes, Me = ae ? ae.emptyScript : "", Pe = $.reactiveElementPolyfillSupport, U = (i, e) => i, F = { toAttribute(i, e) {
  switch (e) {
    case Boolean:
      i = i ? Me : null;
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
} }, te = (i, e) => !Ce(i, e), le = { attribute: !0, type: String, converter: F, reflect: !1, useDefault: !1, hasChanged: te };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), $.litPropertyMetadata ?? ($.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let x = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = le) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const s = Symbol(), o = this.getPropertyDescriptor(e, s, t);
      o !== void 0 && ze(this.prototype, e, o);
    }
  }
  static getPropertyDescriptor(e, t, s) {
    const { get: o, set: n } = Te(this.prototype, e) ?? { get() {
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
    return this.elementProperties.get(e) ?? le;
  }
  static _$Ei() {
    if (this.hasOwnProperty(U("elementProperties"))) return;
    const e = Ue(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(U("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(U("properties"))) {
      const t = this.properties, s = [...Oe(t), ...ke(t)];
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
      for (const o of s) t.unshift(re(o));
    } else e !== void 0 && t.push(re(e));
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
    return Ee(e, this.constructor.elementStyles), e;
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
      const n = (s.converter?.toAttribute !== void 0 ? s.converter : F).toAttribute(t, s.type);
      this._$Em = e, n == null ? this.removeAttribute(o) : this.setAttribute(o, n), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const s = this.constructor, o = s._$Eh.get(e);
    if (o !== void 0 && this._$Em !== o) {
      const n = s.getPropertyOptions(o), r = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : F;
      this._$Em = o;
      const l = r.fromAttribute(t, n.type);
      this[o] = l ?? this._$Ej?.get(o) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, t, s, o = !1, n) {
    if (e !== void 0) {
      const r = this.constructor;
      if (o === !1 && (n = this[e]), s ?? (s = r.getPropertyOptions(e)), !((s.hasChanged ?? te)(n, t) || s.useDefault && s.reflect && n === this._$Ej?.get(e) && !this.hasAttribute(r._$Eu(e, s)))) return;
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
x.elementStyles = [], x.shadowRootOptions = { mode: "open" }, x[U("elementProperties")] = /* @__PURE__ */ new Map(), x[U("finalized")] = /* @__PURE__ */ new Map(), Pe?.({ ReactiveElement: x }), ($.reactiveElementVersions ?? ($.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const M = globalThis, ce = (i) => i, B = M.trustedTypes, he = B ? B.createPolicy("lit-html", { createHTML: (i) => i }) : void 0, we = "$lit$", y = `lit$${Math.random().toFixed(9).slice(2)}$`, be = "?" + y, Ne = `<${be}>`, S = document, N = () => S.createComment(""), L = (i) => i === null || typeof i != "object" && typeof i != "function", ie = Array.isArray, Le = (i) => ie(i) || typeof i?.[Symbol.iterator] == "function", q = `[ 	
\f\r]`, k = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, de = /-->/g, _e = />/g, w = RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), pe = /'/g, ue = /"/g, Ae = /^(?:script|style|textarea|title)$/i, He = (i) => (e, ...t) => ({ _$litType$: i, strings: e, values: t }), b = He(1), C = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), fe = /* @__PURE__ */ new WeakMap(), A = S.createTreeWalker(S, 129);
function Se(i, e) {
  if (!ie(i) || !i.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return he !== void 0 ? he.createHTML(e) : e;
}
const De = (i, e) => {
  const t = i.length - 1, s = [];
  let o, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = k;
  for (let l = 0; l < t; l++) {
    const a = i[l];
    let d, _, c = -1, f = 0;
    for (; f < a.length && (r.lastIndex = f, _ = r.exec(a), _ !== null); ) f = r.lastIndex, r === k ? _[1] === "!--" ? r = de : _[1] !== void 0 ? r = _e : _[2] !== void 0 ? (Ae.test(_[2]) && (o = RegExp("</" + _[2], "g")), r = w) : _[3] !== void 0 && (r = w) : r === w ? _[0] === ">" ? (r = o ?? k, c = -1) : _[1] === void 0 ? c = -2 : (c = r.lastIndex - _[2].length, d = _[1], r = _[3] === void 0 ? w : _[3] === '"' ? ue : pe) : r === ue || r === pe ? r = w : r === de || r === _e ? r = k : (r = w, o = void 0);
    const m = r === w && i[l + 1].startsWith("/>") ? " " : "";
    n += r === k ? a + Ne : c >= 0 ? (s.push(d), a.slice(0, c) + we + a.slice(c) + y + m) : a + y + (c === -2 ? l : m);
  }
  return [Se(i, n + (i[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), s];
};
class H {
  constructor({ strings: e, _$litType$: t }, s) {
    let o;
    this.parts = [];
    let n = 0, r = 0;
    const l = e.length - 1, a = this.parts, [d, _] = De(e, t);
    if (this.el = H.createElement(d, s), A.currentNode = this.el.content, t === 2 || t === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (o = A.nextNode()) !== null && a.length < l; ) {
      if (o.nodeType === 1) {
        if (o.hasAttributes()) for (const c of o.getAttributeNames()) if (c.endsWith(we)) {
          const f = _[r++], m = o.getAttribute(c).split(y), V = /([.?@])?(.*)/.exec(f);
          a.push({ type: 1, index: n, name: V[2], strings: m, ctor: V[1] === "." ? Ie : V[1] === "?" ? Ve : V[1] === "@" ? je : W }), o.removeAttribute(c);
        } else c.startsWith(y) && (a.push({ type: 6, index: n }), o.removeAttribute(c));
        if (Ae.test(o.tagName)) {
          const c = o.textContent.split(y), f = c.length - 1;
          if (f > 0) {
            o.textContent = B ? B.emptyScript : "";
            for (let m = 0; m < f; m++) o.append(c[m], N()), A.nextNode(), a.push({ type: 2, index: ++n });
            o.append(c[f], N());
          }
        }
      } else if (o.nodeType === 8) if (o.data === be) a.push({ type: 2, index: n });
      else {
        let c = -1;
        for (; (c = o.data.indexOf(y, c + 1)) !== -1; ) a.push({ type: 7, index: n }), c += y.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const s = S.createElement("template");
    return s.innerHTML = e, s;
  }
}
function z(i, e, t = i, s) {
  if (e === C) return e;
  let o = s !== void 0 ? t._$Co?.[s] : t._$Cl;
  const n = L(e) ? void 0 : e._$litDirective$;
  return o?.constructor !== n && (o?._$AO?.(!1), n === void 0 ? o = void 0 : (o = new n(i), o._$AT(i, t, s)), s !== void 0 ? (t._$Co ?? (t._$Co = []))[s] = o : t._$Cl = o), o !== void 0 && (e = z(i, o._$AS(i, e.values), o, s)), e;
}
class Re {
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
        a.type === 2 ? d = new R(n, n.nextSibling, this, e) : a.type === 1 ? d = new a.ctor(n, a.name, a.strings, this, e) : a.type === 6 && (d = new Fe(n, this, e)), this._$AV.push(d), a = s[++l];
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
class R {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, s, o) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = s, this.options = o, this._$Cv = o?.isConnected ?? !0;
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
    e = z(this, e, t), L(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== C && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Le(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && L(this._$AH) ? this._$AA.nextSibling.data = e : this.T(S.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: s } = e, o = typeof s == "number" ? this._$AC(e) : (s.el === void 0 && (s.el = H.createElement(Se(s.h, s.h[0]), this.options)), s);
    if (this._$AH?._$AD === o) this._$AH.p(t);
    else {
      const n = new Re(o, this), r = n.u(this.options);
      n.p(t), this.T(r), this._$AH = n;
    }
  }
  _$AC(e) {
    let t = fe.get(e.strings);
    return t === void 0 && fe.set(e.strings, t = new H(e)), t;
  }
  k(e) {
    ie(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let s, o = 0;
    for (const n of e) o === t.length ? t.push(s = new R(this.O(N()), this.O(N()), this, this.options)) : s = t[o], s._$AI(n), o++;
    o < t.length && (this._$AR(s && s._$AB.nextSibling, o), t.length = o);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const s = ce(e).nextSibling;
      ce(e).remove(), e = s;
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
  constructor(e, t, s, o, n) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = t, this._$AM = o, this.options = n, s.length > 2 || s[0] !== "" || s[1] !== "" ? (this._$AH = Array(s.length - 1).fill(new String()), this.strings = s) : this._$AH = h;
  }
  _$AI(e, t = this, s, o) {
    const n = this.strings;
    let r = !1;
    if (n === void 0) e = z(this, e, t, 0), r = !L(e) || e !== this._$AH && e !== C, r && (this._$AH = e);
    else {
      const l = e;
      let a, d;
      for (e = n[0], a = 0; a < n.length - 1; a++) d = z(this, l[s + a], t, a), d === C && (d = this._$AH[a]), r || (r = !L(d) || d !== this._$AH[a]), d === h ? e = h : e !== h && (e += (d ?? "") + n[a + 1]), this._$AH[a] = d;
    }
    r && !o && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Ie extends W {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class Ve extends W {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class je extends W {
  constructor(e, t, s, o, n) {
    super(e, t, s, o, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = z(this, e, t, 0) ?? h) === C) return;
    const s = this._$AH, o = e === h && s !== h || e.capture !== s.capture || e.once !== s.once || e.passive !== s.passive, n = e !== h && (s === h || o);
    o && this.element.removeEventListener(this.name, this, s), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class Fe {
  constructor(e, t, s) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = s;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    z(this, e);
  }
}
const Be = M.litHtmlPolyfillSupport;
Be?.(H, R), (M.litHtmlVersions ?? (M.litHtmlVersions = [])).push("3.3.3");
const We = (i, e, t) => {
  const s = t?.renderBefore ?? e;
  let o = s._$litPart$;
  if (o === void 0) {
    const n = t?.renderBefore ?? null;
    s._$litPart$ = o = new R(e.insertBefore(N(), n), n, void 0, t ?? {});
  }
  return o._$AI(i), o;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const P = globalThis;
class E extends x {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = We(t, this.renderRoot, this.renderOptions);
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
E._$litElement$ = !0, E.finalized = !0, P.litElementHydrateSupport?.({ LitElement: E });
const qe = P.litElementPolyfillSupport;
qe?.({ LitElement: E });
(P.litElementVersions ?? (P.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ze = { attribute: !0, type: String, converter: F, reflect: !1, hasChanged: te }, Ke = (i = Ze, e, t) => {
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
function I(i) {
  return (e, t) => typeof t == "object" ? Ke(i, e, t) : ((s, o, n) => {
    const r = o.hasOwnProperty(n);
    return o.constructor.createProperty(n, s), r ? Object.getOwnPropertyDescriptor(o, n) : void 0;
  })(i, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function u(i) {
  return I({ ...i, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Ge = (i, e, t) => (t.configurable = !0, t.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(i, e, t), t);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function St(i, e) {
  return (t, s, o) => {
    const n = (r) => r.renderRoot?.querySelector(i) ?? null;
    return Ge(t, s, { get() {
      return n(this);
    } });
  };
}
var Je = "M22.11,21.46L2.39,1.73L1.11,3L5.83,7.72C5.29,8.73 5,9.86 5,11V17L3,19V20H18.11L20.84,22.73L22.11,21.46M7,18V11C7,10.39 7.11,9.79 7.34,9.23L16.11,18H7M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M8.29,5.09C8.82,4.75 9.4,4.5 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V15.8L17,13.8V11A5,5 0 0,0 12,6C11.22,6 10.45,6.2 9.76,6.56L8.29,5.09Z", Ye = "M10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21M21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19M17 11C17 8.2 14.8 6 12 6S7 8.2 7 11V18H17V11Z", Xe = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z", Qe = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", et = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", tt = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z";
const T = "ha_reminders";
async function it(i, e) {
  const t = await i.callService(T, "create", e);
  return String(t?.reminder_id ?? "");
}
async function st(i, e, t) {
  await i.callService(T, "update", {
    reminder_id: e,
    ...t
  });
}
async function ot(i, e) {
  await i.callService(T, "delete", { reminder_id: e });
}
async function nt(i, e, t) {
  await i.callService(T, "snooze", {
    reminder_id: e,
    minutes: t
  });
}
async function rt(i, e) {
  await i.callService(T, "complete", { reminder_id: e });
}
async function at(i, e, t) {
  await i.callService(T, "set_enabled", {
    reminder_id: e,
    enabled: t
  });
}
var lt = Object.defineProperty, v = (i, e, t, s) => {
  for (var o = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (o = r(e, t, o) || o);
  return o && lt(e, t, o), o;
};
const ct = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" }
], ge = {
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
}, ht = [
  { value: "time", label: "At a fixed time" },
  { value: "zone_enter", label: "When I enter a zone" },
  { value: "zone_leave", label: "When I leave a zone" }
];
function dt(i, e) {
  const t = [
    { name: "title", selector: { text: {} }, required: !0 },
    { name: "message", selector: { text: { multiline: !0 } }, required: !0 },
    {
      name: "trigger_type",
      selector: { select: { mode: "dropdown", options: ht } }
    }
  ];
  return i === "time" ? t.push({ name: "time", selector: { time: {} } }) : (t.push({ name: "zone_entity_id", selector: { entity: { domain: "zone" } } }), t.push({
    name: "person_entity_ids",
    selector: { entity: { domain: "person", multiple: !0 } }
  })), t.push(e), t;
}
function _t(i) {
  const e = [
    { name: "subtitle", selector: { text: {} } },
    { name: "user_name", selector: { text: {} } },
    { name: "one_shot", selector: { boolean: {} } }
  ];
  return i === "time" ? e.push({ name: "every_x_days", selector: { number: { min: 1, mode: "box" } } }) : (e.push({ name: "time_window_start", selector: { time: {} } }), e.push({ name: "time_window_end", selector: { time: {} } })), e.push(
    { name: "start_date", selector: { date: {} } },
    { name: "stop_date", selector: { date: {} } },
    {
      name: "exclude_days_of_week",
      selector: { select: { multiple: !0, options: ct } }
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
  ), e;
}
const Z = [5, 15, 30, 45, 60], pt = "Someone", K = "Snooze for ${time}", G = "Mark as done", J = "Someone acknowledged the notification", Y = 15, X = 1;
function ut(i) {
  if (!i) return !1;
  const e = i.snooze_delays?.length ? i.snooze_delays : Z, t = (i.user_name ?? "").trim();
  return !!((i.subtitle ?? "").trim() || t && t !== pt || i.one_shot || (i.every_x_days ?? 1) !== 1 || i.start_date || i.stop_date || (i.exclude_days_of_week ?? []).length > 0 || i.time_window_start || i.time_window_end || e.join(",") !== Z.join(",") || (i.snooze_text ?? K) !== K || (i.acknowledge_action_title ?? G) !== G || (i.wait_time_if_no_action ?? Y) !== Y || (i.notification_count ?? X) !== X || (i.channel_importance ?? "") || (i.channel ?? "") || (i.color ?? "") || (i.notification_group ?? "") || (i.acknowledge_notification_title ?? J) !== J || (i.acknowledge_notification_body ?? "").trim());
}
const se = class se extends E {
  constructor() {
    super(...arguments), this.reminder = null, this.open = !1, this._data = {}, this._saving = !1, this._error = "", this._notifyServices = [], this._advancedOpen = !1;
  }
  willUpdate(e) {
    e.has("open") && this.open && (this._data = this._dataFrom(this.reminder), this._error = "", this._saving = !1, this._advancedOpen = ut(this.reminder), this._loadNotifyServices());
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
      acknowledge_action_title: e?.acknowledge_action_title ?? G,
      snooze_delays: (e?.snooze_delays ?? Z).join(","),
      snooze_text: e?.snooze_text ?? K,
      wait_time_if_no_action: e?.wait_time_if_no_action ?? Y,
      notification_count: e?.notification_count ?? X,
      color: e?.color ?? "",
      channel: e?.channel ?? "",
      channel_importance: e?.channel_importance ?? "",
      notification_group: e?.notification_group ?? "",
      acknowledge_notification_title: e?.acknowledge_notification_title ?? J,
      acknowledge_notification_body: e?.acknowledge_notification_body ?? ""
    };
  }
  async _loadNotifyServices() {
    try {
      const e = await this.hass.callWS({ type: "get_services" }), t = /* @__PURE__ */ new Set(["notify", "persistent_notification", "send_message"]), s = /* @__PURE__ */ new Set();
      Object.keys(e).forEach((o) => {
        o === "notify" ? Object.keys(e[o] ?? {}).forEach((n) => {
          t.has(n) || s.add(`notify.${n}`);
        }) : e[o]?.notify && s.add(o);
      }), this._notifyServices = [...s].sort();
    } catch {
      this._notifyServices = [];
    }
  }
  _notifyField() {
    const e = String(this._data.notify_service ?? "");
    return {
      name: "notify_service",
      selector: { select: { mode: "dropdown", custom_value: !0, options: [.../* @__PURE__ */ new Set([...this._notifyServices, e])].filter(Boolean).map((s) => ({ value: s, label: s })) } }
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
    const t = this._data, s = {
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
      this.reminder ? await st(this.hass, this.reminder.id, s) : await it(this.hass, s), this.dispatchEvent(new CustomEvent("saved")), this.open = !1;
    } catch (o) {
      this._error = o instanceof Error ? o.message : "Failed to save the reminder.";
    } finally {
      this._saving = !1;
    }
  }
  render() {
    return b`
      <ha-dialog
        .open=${this.open}
        .heading=${this.reminder ? "Edit reminder" : "New reminder"}
        @closed=${() => {
      this.open = !1, this.dispatchEvent(new CustomEvent("closed"));
    }}
      >
        <div class="editor">
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${dt(
      this._data.trigger_type ?? "time",
      this._notifyField()
    )}
            .computeLabel=${(e) => ge[e.name] ?? e.name}
            @value-changed=${this._valueChanged}
          ></ha-form>

          <ha-expansion-panel
            .header=${"Advanced settings"}
            .secondary=${this._advancedOpen ? "shown" : "optional"}
            .expanded=${this._advancedOpen}
          >
            <ha-form
              .hass=${this.hass}
              .data=${this._data}
              .schema=${_t(
      this._data.trigger_type ?? "time"
    )}
              .computeLabel=${(e) => ge[e.name] ?? e.name}
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
            ${this.reminder ? "Save" : "Create"}
          </ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `;
  }
};
se.styles = ve`
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
let p = se;
v([
  I({ attribute: !1 })
], p.prototype, "hass");
v([
  I({ attribute: !1 })
], p.prototype, "reminder");
v([
  I({ type: Boolean })
], p.prototype, "open");
v([
  u()
], p.prototype, "_data");
v([
  u()
], p.prototype, "_saving");
v([
  u()
], p.prototype, "_error");
v([
  u()
], p.prototype, "_notifyServices");
v([
  u()
], p.prototype, "_advancedOpen");
customElements.get("ha-reminders-editor") || customElements.define("ha-reminders-editor", p);
var ft = Object.defineProperty, O = (i, e, t, s) => {
  for (var o = void 0, n = i.length - 1, r; n >= 0; n--)
    (r = i[n]) && (o = r(e, t, o) || o);
  return o && ft(e, t, o), o;
};
const gt = {
  scheduled: "Scheduled",
  active: "Active",
  snoozed: "Snoozed",
  completed: "Completed",
  disabled: "Disabled"
}, me = {
  active: 0,
  snoozed: 1,
  scheduled: 2,
  completed: 3,
  disabled: 4
};
function D(i) {
  return i.status ?? "scheduled";
}
function ye(i) {
  return i ? i.replace("zone.", "").replace(/_/g, " ").replace(/\b\w/g, (e) => e.toUpperCase()) : "";
}
function mt(i) {
  if (!i) return "";
  const e = new Date(i);
  if (Number.isNaN(e.getTime())) return i;
  const t = e.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
  return e.toLocaleString(void 0, {
    ...t ? {} : { weekday: "short", month: "short", day: "numeric" },
    hour: "2-digit",
    minute: "2-digit"
  });
}
function yt(i) {
  const e = (i.message ?? "").trim();
  return e && e !== (i.title ?? "").trim() ? e : (i.subtitle ?? "").trim();
}
function $t(i) {
  if (i.trigger_type === "zone_enter")
    return `When you enter ${ye(i.zone_entity_id)}`;
  if (i.trigger_type === "zone_leave")
    return `When you leave ${ye(i.zone_entity_id)}`;
  const e = mt(i.next_fire), t = (i.every_x_days ?? 1) > 1 ? ` · every ${i.every_x_days} days` : "";
  return `${e || "Scheduled"}${t}`;
}
function vt(i) {
  return i ? Object.values(i.states).filter((e) => typeof e.attributes.reminder_id == "string").map((e) => e.attributes).sort((e, t) => {
    const s = (me[D(e)] ?? 9) - (me[D(t)] ?? 9);
    return s !== 0 ? s : String(e.title ?? "").localeCompare(String(t.title ?? ""));
  }) : [];
}
function wt(i, e) {
  const t = D(i), s = [];
  return t !== "disabled" && t !== "completed" && (s.push({ label: "Mark done", path: Xe, action: e.complete }), s.push({ label: "Snooze", path: Qe, action: e.snooze })), s.push({
    label: i.enabled ? "Disable" : "Enable",
    path: i.enabled ? Je : Ye,
    action: e.toggleEnabled
  }), s.push({ label: "Edit", path: tt, action: e.edit }), s.push({
    label: "Delete",
    path: et,
    action: e.remove,
    warning: !0
  }), s;
}
const oe = class oe extends E {
  constructor() {
    super(...arguments), this._editorOpen = !1, this._editing = null, this._snoozeTarget = null, this._snoozeMinutes = 15, this._deleteTarget = null;
  }
  openNew() {
    this._editing = null, this._editorOpen = !0;
  }
  openEdit(e) {
    this._editing = e, this._editorOpen = !0;
  }
  async _complete(e) {
    await rt(this.hass, e.id);
  }
  async _toggleEnabled(e) {
    await at(this.hass, e.id, !e.enabled);
  }
  async _snooze() {
    this._snoozeTarget && (await nt(this.hass, this._snoozeTarget.id, this._snoozeMinutes), this._snoozeTarget = null);
  }
  async _delete() {
    this._deleteTarget && (await ot(this.hass, this._deleteTarget.id), this._deleteTarget = null);
  }
  _itemsFor(e) {
    return wt(e, {
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
  render() {
    const e = vt(this.hass);
    return b`
      ${e.length === 0 ? b`<div class="empty">No reminders yet — use “New reminder”.</div>` : e.map((t) => {
      const s = yt(t);
      return b`
              <div class="row">
                <ha-icon
                  icon=${t.trigger_type === "time" ? "mdi:clock-outline" : t.trigger_type === "zone_enter" ? "mdi:home-import-outline" : "mdi:home-export-outline"}
                ></ha-icon>
                <div class="row-text" @click=${() => this.openEdit(t)}>
                  <div class="row-title">${t.title}</div>
                  ${s ? b`<div class="row-snippet">${s}</div>` : h}
                  <div class="row-meta">
                    <span class="chip ${D(t)}"
                      >${gt[D(t)]}</span
                    >
                    <span class="row-trigger">${$t(t)}</span>
                  </div>
                </div>
                <ha-icon-overflow-menu
                  .narrow=${!0}
                  .items=${this._itemsFor(t)}
                ></ha-icon-overflow-menu>
              </div>
            `;
    })}

      <ha-reminders-editor
        .hass=${this.hass}
        .reminder=${this._editing}
        .open=${this._editorOpen}
        @saved=${() => this._editorOpen = !1}
        @closed=${() => this._editorOpen = !1}
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
          @value-changed=${(t) => {
      t.stopPropagation(), this._snoozeMinutes = Number(t.detail.value) || 15;
    }}
        ></ha-selector>
        <div class="snooze-quick">
          ${[5, 15, 30, 60].map(
      (t) => b`
              <ha-button @click=${() => this._snoozeMinutes = t}
                >${t} min</ha-button
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
oe.styles = ve`
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
let g = oe;
O([
  I({ attribute: !1 })
], g.prototype, "hass");
O([
  u()
], g.prototype, "_editorOpen");
O([
  u()
], g.prototype, "_editing");
O([
  u()
], g.prototype, "_snoozeTarget");
O([
  u()
], g.prototype, "_snoozeMinutes");
O([
  u()
], g.prototype, "_deleteTarget");
customElements.get("ha-reminders-list") || customElements.define("ha-reminders-list", g);
export {
  E as a,
  b,
  St as e,
  ve as i,
  I as n,
  u as r
};

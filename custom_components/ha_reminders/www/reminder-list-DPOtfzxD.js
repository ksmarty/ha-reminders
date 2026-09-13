/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const I = globalThis, Z = I.ShadowRoot && (I.ShadyCSS === void 0 || I.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, K = Symbol(), X = /* @__PURE__ */ new WeakMap();
let ue = class {
  constructor(e, t, i) {
    if (this._$cssResult$ = !0, i !== K) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = e, this.t = t;
  }
  get styleSheet() {
    let e = this.o;
    const t = this.t;
    if (Z && e === void 0) {
      const i = t !== void 0 && t.length === 1;
      i && (e = X.get(t)), e === void 0 && ((this.o = e = new CSSStyleSheet()).replaceSync(this.cssText), i && X.set(t, e));
    }
    return e;
  }
  toString() {
    return this.cssText;
  }
};
const $e = (o) => new ue(typeof o == "string" ? o : o + "", void 0, K), pe = (o, ...e) => {
  const t = o.length === 1 ? o[0] : e.reduce((i, s, n) => i + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + o[n + 1], o[0]);
  return new ue(t, o, K);
}, ve = (o, e) => {
  if (Z) o.adoptedStyleSheets = e.map((t) => t instanceof CSSStyleSheet ? t : t.styleSheet);
  else for (const t of e) {
    const i = document.createElement("style"), s = I.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = t.cssText, o.appendChild(i);
  }
}, ee = Z ? (o) => o : (o) => o instanceof CSSStyleSheet ? ((e) => {
  let t = "";
  for (const i of e.cssRules) t += i.cssText;
  return $e(t);
})(o) : o;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: be, defineProperty: we, getOwnPropertyDescriptor: Ae, getOwnPropertyNames: Se, getOwnPropertySymbols: xe, getPrototypeOf: Ee } = Object, v = globalThis, te = v.trustedTypes, ze = te ? te.emptyScript : "", ke = v.reactiveElementPolyfillSupport, O = (o, e) => o, W = { toAttribute(o, e) {
  switch (e) {
    case Boolean:
      o = o ? ze : null;
      break;
    case Object:
    case Array:
      o = o == null ? o : JSON.stringify(o);
  }
  return o;
}, fromAttribute(o, e) {
  let t = o;
  switch (e) {
    case Boolean:
      t = o !== null;
      break;
    case Number:
      t = o === null ? null : Number(o);
      break;
    case Object:
    case Array:
      try {
        t = JSON.parse(o);
      } catch {
        t = null;
      }
  }
  return t;
} }, J = (o, e) => !be(o, e), ie = { attribute: !0, type: String, converter: W, reflect: !1, useDefault: !1, hasChanged: J };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), v.litPropertyMetadata ?? (v.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let x = class extends HTMLElement {
  static addInitializer(e) {
    this._$Ei(), (this.l ?? (this.l = [])).push(e);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(e, t = ie) {
    if (t.state && (t.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(e) && ((t = Object.create(t)).wrapped = !0), this.elementProperties.set(e, t), !t.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(e, i, t);
      s !== void 0 && we(this.prototype, e, s);
    }
  }
  static getPropertyDescriptor(e, t, i) {
    const { get: s, set: n } = Ae(this.prototype, e) ?? { get() {
      return this[t];
    }, set(r) {
      this[t] = r;
    } };
    return { get: s, set(r) {
      const l = s?.call(this);
      n?.call(this, r), this.requestUpdate(e, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(e) {
    return this.elementProperties.get(e) ?? ie;
  }
  static _$Ei() {
    if (this.hasOwnProperty(O("elementProperties"))) return;
    const e = Ee(this);
    e.finalize(), e.l !== void 0 && (this.l = [...e.l]), this.elementProperties = new Map(e.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(O("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(O("properties"))) {
      const t = this.properties, i = [...Se(t), ...xe(t)];
      for (const s of i) this.createProperty(s, t[s]);
    }
    const e = this[Symbol.metadata];
    if (e !== null) {
      const t = litPropertyMetadata.get(e);
      if (t !== void 0) for (const [i, s] of t) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t, i] of this.elementProperties) {
      const s = this._$Eu(t, i);
      s !== void 0 && this._$Eh.set(s, t);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(e) {
    const t = [];
    if (Array.isArray(e)) {
      const i = new Set(e.flat(1 / 0).reverse());
      for (const s of i) t.unshift(ee(s));
    } else e !== void 0 && t.push(ee(e));
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
    return ve(e, this.constructor.elementStyles), e;
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
    const i = this.constructor.elementProperties.get(e), s = this.constructor._$Eu(e, i);
    if (s !== void 0 && i.reflect === !0) {
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : W).toAttribute(t, i.type);
      this._$Em = e, n == null ? this.removeAttribute(s) : this.setAttribute(s, n), this._$Em = null;
    }
  }
  _$AK(e, t) {
    const i = this.constructor, s = i._$Eh.get(e);
    if (s !== void 0 && this._$Em !== s) {
      const n = i.getPropertyOptions(s), r = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : W;
      this._$Em = s;
      const l = r.fromAttribute(t, n.type);
      this[s] = l ?? this._$Ej?.get(s) ?? l, this._$Em = null;
    }
  }
  requestUpdate(e, t, i, s = !1, n) {
    if (e !== void 0) {
      const r = this.constructor;
      if (s === !1 && (n = this[e]), i ?? (i = r.getPropertyOptions(e)), !((i.hasChanged ?? J)(n, t) || i.useDefault && i.reflect && n === this._$Ej?.get(e) && !this.hasAttribute(r._$Eu(e, i)))) return;
      this.C(e, t, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(e, t, { useDefault: i, reflect: s, wrapped: n }, r) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(e) && (this._$Ej.set(e, r ?? t ?? this[e]), n !== !0 || r !== void 0) || (this._$AL.has(e) || (this.hasUpdated || i || (t = void 0), this._$AL.set(e, t)), s === !0 && this._$Em !== e && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(e));
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
        for (const [s, n] of this._$Ep) this[s] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, n] of i) {
        const { wrapped: r } = n, l = this[s];
        r !== !0 || this._$AL.has(s) || l === void 0 || this.C(s, void 0, n, l);
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
x.elementStyles = [], x.shadowRootOptions = { mode: "open" }, x[O("elementProperties")] = /* @__PURE__ */ new Map(), x[O("finalized")] = /* @__PURE__ */ new Map(), ke?.({ ReactiveElement: x }), (v.reactiveElementVersions ?? (v.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const M = globalThis, se = (o) => o, q = M.trustedTypes, oe = q ? q.createPolicy("lit-html", { createHTML: (o) => o }) : void 0, fe = "$lit$", $ = `lit$${Math.random().toFixed(9).slice(2)}$`, me = "?" + $, Ce = `<${me}>`, A = document, R = () => A.createComment(""), H = (o) => o === null || typeof o != "object" && typeof o != "function", Y = Array.isArray, Ue = (o) => Y(o) || typeof o?.[Symbol.iterator] == "function", V = `[ 	
\f\r]`, P = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, ne = /-->/g, re = />/g, b = RegExp(`>|${V}(?:([^\\s"'>=/]+)(${V}*=${V}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ae = /'/g, le = /"/g, ge = /^(?:script|style|textarea|title)$/i, Te = (o) => (e, ...t) => ({ _$litType$: o, strings: e, values: t }), y = Te(1), k = Symbol.for("lit-noChange"), h = Symbol.for("lit-nothing"), ce = /* @__PURE__ */ new WeakMap(), w = A.createTreeWalker(A, 129);
function ye(o, e) {
  if (!Y(o) || !o.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return oe !== void 0 ? oe.createHTML(e) : e;
}
const Pe = (o, e) => {
  const t = o.length - 1, i = [];
  let s, n = e === 2 ? "<svg>" : e === 3 ? "<math>" : "", r = P;
  for (let l = 0; l < t; l++) {
    const a = o[l];
    let d, _, c = -1, p = 0;
    for (; p < a.length && (r.lastIndex = p, _ = r.exec(a), _ !== null); ) p = r.lastIndex, r === P ? _[1] === "!--" ? r = ne : _[1] !== void 0 ? r = re : _[2] !== void 0 ? (ge.test(_[2]) && (s = RegExp("</" + _[2], "g")), r = b) : _[3] !== void 0 && (r = b) : r === b ? _[0] === ">" ? (r = s ?? P, c = -1) : _[1] === void 0 ? c = -2 : (c = r.lastIndex - _[2].length, d = _[1], r = _[3] === void 0 ? b : _[3] === '"' ? le : ae) : r === le || r === ae ? r = b : r === ne || r === re ? r = P : (r = b, s = void 0);
    const g = r === b && o[l + 1].startsWith("/>") ? " " : "";
    n += r === P ? a + Ce : c >= 0 ? (i.push(d), a.slice(0, c) + fe + a.slice(c) + $ + g) : a + $ + (c === -2 ? l : g);
  }
  return [ye(o, n + (o[t] || "<?>") + (e === 2 ? "</svg>" : e === 3 ? "</math>" : "")), i];
};
class D {
  constructor({ strings: e, _$litType$: t }, i) {
    let s;
    this.parts = [];
    let n = 0, r = 0;
    const l = e.length - 1, a = this.parts, [d, _] = Pe(e, t);
    if (this.el = D.createElement(d, i), w.currentNode = this.el.content, t === 2 || t === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (s = w.nextNode()) !== null && a.length < l; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const c of s.getAttributeNames()) if (c.endsWith(fe)) {
          const p = _[r++], g = s.getAttribute(c).split($), B = /([.?@])?(.*)/.exec(p);
          a.push({ type: 1, index: n, name: B[2], strings: g, ctor: B[1] === "." ? Me : B[1] === "?" ? Ne : B[1] === "@" ? Re : F }), s.removeAttribute(c);
        } else c.startsWith($) && (a.push({ type: 6, index: n }), s.removeAttribute(c));
        if (ge.test(s.tagName)) {
          const c = s.textContent.split($), p = c.length - 1;
          if (p > 0) {
            s.textContent = q ? q.emptyScript : "";
            for (let g = 0; g < p; g++) s.append(c[g], R()), w.nextNode(), a.push({ type: 2, index: ++n });
            s.append(c[p], R());
          }
        }
      } else if (s.nodeType === 8) if (s.data === me) a.push({ type: 2, index: n });
      else {
        let c = -1;
        for (; (c = s.data.indexOf($, c + 1)) !== -1; ) a.push({ type: 7, index: n }), c += $.length - 1;
      }
      n++;
    }
  }
  static createElement(e, t) {
    const i = A.createElement("template");
    return i.innerHTML = e, i;
  }
}
function C(o, e, t = o, i) {
  if (e === k) return e;
  let s = i !== void 0 ? t._$Co?.[i] : t._$Cl;
  const n = H(e) ? void 0 : e._$litDirective$;
  return s?.constructor !== n && (s?._$AO?.(!1), n === void 0 ? s = void 0 : (s = new n(o), s._$AT(o, t, i)), i !== void 0 ? (t._$Co ?? (t._$Co = []))[i] = s : t._$Cl = s), s !== void 0 && (e = C(o, s._$AS(o, e.values), s, i)), e;
}
class Oe {
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
    const { el: { content: t }, parts: i } = this._$AD, s = (e?.creationScope ?? A).importNode(t, !0);
    w.currentNode = s;
    let n = w.nextNode(), r = 0, l = 0, a = i[0];
    for (; a !== void 0; ) {
      if (r === a.index) {
        let d;
        a.type === 2 ? d = new j(n, n.nextSibling, this, e) : a.type === 1 ? d = new a.ctor(n, a.name, a.strings, this, e) : a.type === 6 && (d = new He(n, this, e)), this._$AV.push(d), a = i[++l];
      }
      r !== a?.index && (n = w.nextNode(), r++);
    }
    return w.currentNode = A, s;
  }
  p(e) {
    let t = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(e, i, t), t += i.strings.length - 2) : i._$AI(e[t])), t++;
  }
}
class j {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(e, t, i, s) {
    this.type = 2, this._$AH = h, this._$AN = void 0, this._$AA = e, this._$AB = t, this._$AM = i, this.options = s, this._$Cv = s?.isConnected ?? !0;
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
    e = C(this, e, t), H(e) ? e === h || e == null || e === "" ? (this._$AH !== h && this._$AR(), this._$AH = h) : e !== this._$AH && e !== k && this._(e) : e._$litType$ !== void 0 ? this.$(e) : e.nodeType !== void 0 ? this.T(e) : Ue(e) ? this.k(e) : this._(e);
  }
  O(e) {
    return this._$AA.parentNode.insertBefore(e, this._$AB);
  }
  T(e) {
    this._$AH !== e && (this._$AR(), this._$AH = this.O(e));
  }
  _(e) {
    this._$AH !== h && H(this._$AH) ? this._$AA.nextSibling.data = e : this.T(A.createTextNode(e)), this._$AH = e;
  }
  $(e) {
    const { values: t, _$litType$: i } = e, s = typeof i == "number" ? this._$AC(e) : (i.el === void 0 && (i.el = D.createElement(ye(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === s) this._$AH.p(t);
    else {
      const n = new Oe(s, this), r = n.u(this.options);
      n.p(t), this.T(r), this._$AH = n;
    }
  }
  _$AC(e) {
    let t = ce.get(e.strings);
    return t === void 0 && ce.set(e.strings, t = new D(e)), t;
  }
  k(e) {
    Y(this._$AH) || (this._$AH = [], this._$AR());
    const t = this._$AH;
    let i, s = 0;
    for (const n of e) s === t.length ? t.push(i = new j(this.O(R()), this.O(R()), this, this.options)) : i = t[s], i._$AI(n), s++;
    s < t.length && (this._$AR(i && i._$AB.nextSibling, s), t.length = s);
  }
  _$AR(e = this._$AA.nextSibling, t) {
    for (this._$AP?.(!1, !0, t); e !== this._$AB; ) {
      const i = se(e).nextSibling;
      se(e).remove(), e = i;
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
  constructor(e, t, i, s, n) {
    this.type = 1, this._$AH = h, this._$AN = void 0, this.element = e, this.name = t, this._$AM = s, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = h;
  }
  _$AI(e, t = this, i, s) {
    const n = this.strings;
    let r = !1;
    if (n === void 0) e = C(this, e, t, 0), r = !H(e) || e !== this._$AH && e !== k, r && (this._$AH = e);
    else {
      const l = e;
      let a, d;
      for (e = n[0], a = 0; a < n.length - 1; a++) d = C(this, l[i + a], t, a), d === k && (d = this._$AH[a]), r || (r = !H(d) || d !== this._$AH[a]), d === h ? e = h : e !== h && (e += (d ?? "") + n[a + 1]), this._$AH[a] = d;
    }
    r && !s && this.j(e);
  }
  j(e) {
    e === h ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, e ?? "");
  }
}
class Me extends F {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(e) {
    this.element[this.name] = e === h ? void 0 : e;
  }
}
class Ne extends F {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(e) {
    this.element.toggleAttribute(this.name, !!e && e !== h);
  }
}
class Re extends F {
  constructor(e, t, i, s, n) {
    super(e, t, i, s, n), this.type = 5;
  }
  _$AI(e, t = this) {
    if ((e = C(this, e, t, 0) ?? h) === k) return;
    const i = this._$AH, s = e === h && i !== h || e.capture !== i.capture || e.once !== i.once || e.passive !== i.passive, n = e !== h && (i === h || s);
    s && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, e), this._$AH = e;
  }
  handleEvent(e) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, e) : this._$AH.handleEvent(e);
  }
}
class He {
  constructor(e, t, i) {
    this.element = e, this.type = 6, this._$AN = void 0, this._$AM = t, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(e) {
    C(this, e);
  }
}
const De = M.litHtmlPolyfillSupport;
De?.(D, j), (M.litHtmlVersions ?? (M.litHtmlVersions = [])).push("3.3.3");
const je = (o, e, t) => {
  const i = t?.renderBefore ?? e;
  let s = i._$litPart$;
  if (s === void 0) {
    const n = t?.renderBefore ?? null;
    i._$litPart$ = s = new j(e.insertBefore(R(), n), n, void 0, t ?? {});
  }
  return s._$AI(o), s;
};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const N = globalThis;
class z extends x {
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
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(e), this._$Do = je(t, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(!0);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(!1);
  }
  render() {
    return k;
  }
}
z._$litElement$ = !0, z.finalized = !0, N.litElementHydrateSupport?.({ LitElement: z });
const Le = N.litElementPolyfillSupport;
Le?.({ LitElement: z });
(N.litElementVersions ?? (N.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const Be = { attribute: !0, type: String, converter: W, reflect: !1, hasChanged: J }, Ie = (o = Be, e, t) => {
  const { kind: i, metadata: s } = t;
  let n = globalThis.litPropertyMetadata.get(s);
  if (n === void 0 && globalThis.litPropertyMetadata.set(s, n = /* @__PURE__ */ new Map()), i === "setter" && ((o = Object.create(o)).wrapped = !0), n.set(t.name, o), i === "accessor") {
    const { name: r } = t;
    return { set(l) {
      const a = e.get.call(this);
      e.set.call(this, l), this.requestUpdate(r, a, o, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(r, void 0, o, l), l;
    } };
  }
  if (i === "setter") {
    const { name: r } = t;
    return function(l) {
      const a = this[r];
      e.call(this, l), this.requestUpdate(r, a, o, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function L(o) {
  return (e, t) => typeof t == "object" ? Ie(o, e, t) : ((i, s, n) => {
    const r = s.hasOwnProperty(n);
    return s.constructor.createProperty(n, i), r ? Object.getOwnPropertyDescriptor(s, n) : void 0;
  })(o, e, t);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function m(o) {
  return L({ ...o, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const We = (o, e, t) => (t.configurable = !0, t.enumerable = !0, Reflect.decorate && typeof e != "object" && Object.defineProperty(o, e, t), t);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function nt(o, e) {
  return (t, i, s) => {
    const n = (r) => r.renderRoot?.querySelector(o) ?? null;
    return We(t, i, { get() {
      return n(this);
    } });
  };
}
const U = "ha_reminders";
async function qe(o, e) {
  const t = await o.callService(U, "create", e);
  return String(t?.reminder_id ?? "");
}
async function Fe(o, e, t) {
  await o.callService(U, "update", {
    reminder_id: e,
    ...t
  });
}
async function Ve(o, e) {
  await o.callService(U, "delete", { reminder_id: e });
}
async function Ze(o, e, t) {
  await o.callService(U, "snooze", {
    reminder_id: e,
    minutes: t
  });
}
async function Ke(o, e) {
  await o.callService(U, "complete", { reminder_id: e });
}
async function Je(o, e, t) {
  await o.callService(U, "set_enabled", {
    reminder_id: e,
    enabled: t
  });
}
var Ye = Object.defineProperty, S = (o, e, t, i) => {
  for (var s = void 0, n = o.length - 1, r; n >= 0; n--)
    (r = o[n]) && (s = r(e, t, s) || s);
  return s && Ye(e, t, s), s;
};
const he = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" }
], Ge = {
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
}, G = class G extends z {
  constructor() {
    super(...arguments), this.reminder = null, this.open = !1, this._data = {}, this._saving = !1, this._error = "", this._notifyServices = [];
  }
  willUpdate(e) {
    e.has("open") && this.open && (this._data = this._dataFrom(this.reminder), this._error = "", this._saving = !1, this._loadNotifyServices());
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
      acknowledge_action_title: e?.acknowledge_action_title ?? "Mark as done",
      snooze_delays: (e?.snooze_delays ?? [5, 15, 30, 45, 60]).join(","),
      snooze_text: e?.snooze_text ?? "Snooze for ${time}",
      wait_time_if_no_action: e?.wait_time_if_no_action ?? 15,
      notification_count: e?.notification_count ?? 1,
      color: e?.color ?? "",
      channel: e?.channel ?? "",
      channel_importance: e?.channel_importance ?? "",
      notification_group: e?.notification_group ?? "",
      acknowledge_notification_title: e?.acknowledge_notification_title ?? "Someone acknowledged the notification",
      acknowledge_notification_body: e?.acknowledge_notification_body ?? ""
    };
  }
  async _loadNotifyServices() {
    try {
      const e = await this.hass.callWS({ type: "get_services" }), t = /* @__PURE__ */ new Set(["notify", "persistent_notification", "send_message"]), i = /* @__PURE__ */ new Set();
      Object.keys(e).forEach((s) => {
        s === "notify" ? Object.keys(e[s] ?? {}).forEach((n) => {
          t.has(n) || i.add(`notify.${n}`);
        }) : e[s]?.notify && i.add(s);
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
  _schema() {
    const t = (this._data.trigger_type ?? "time") !== "time", i = [
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
    ], s = t ? [
      { name: "zone_entity_id", selector: { entity: { domain: "zone" } } },
      {
        name: "person_entity_ids",
        selector: { entity: { domain: "person", multiple: !0 } }
      },
      { name: "time_window_start", selector: { time: {} } },
      { name: "time_window_end", selector: { time: {} } },
      { name: "start_date", selector: { date: {} } },
      { name: "stop_date", selector: { date: {} } },
      { name: "exclude_days_of_week", selector: { select: { multiple: !0, options: he } } }
    ] : [
      { name: "time", selector: { time: {} } },
      { name: "every_x_days", selector: { number: { min: 1, mode: "box" } } },
      { name: "start_date", selector: { date: {} } },
      { name: "stop_date", selector: { date: {} } },
      { name: "exclude_days_of_week", selector: { select: { multiple: !0, options: he } } }
    ], n = [
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
    return [...i, ...s, ...n];
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
      snooze_delays: String(t.snooze_delays ?? "").split(",").map((s) => parseInt(s.trim(), 10)).filter((s) => !Number.isNaN(s) && s > 0),
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
      this.reminder ? await Fe(this.hass, this.reminder.id, i) : await qe(this.hass, i), this.dispatchEvent(new CustomEvent("saved")), this.open = !1;
    } catch (s) {
      this._error = s instanceof Error ? s.message : "Failed to save the reminder.";
    } finally {
      this._saving = !1;
    }
  }
  render() {
    return y`
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
            .schema=${this._schema()}
            .computeLabel=${(e) => Ge[e.name] ?? e.name}
            @value-changed=${this._valueChanged}
          ></ha-form>
          ${this._error ? y`<div class="error">${this._error}</div>` : h}
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
G.styles = pe`
    .editor {
      display: block;
      min-width: min(560px, 80vw);
    }
    .error {
      color: var(--error-color, #db4437);
      padding: 8px 0 0;
    }
  `;
let u = G;
S([
  L({ attribute: !1 })
], u.prototype, "hass");
S([
  L({ attribute: !1 })
], u.prototype, "reminder");
S([
  L({ type: Boolean })
], u.prototype, "open");
S([
  m()
], u.prototype, "_data");
S([
  m()
], u.prototype, "_saving");
S([
  m()
], u.prototype, "_error");
S([
  m()
], u.prototype, "_notifyServices");
customElements.get("ha-reminders-editor") || customElements.define("ha-reminders-editor", u);
var Qe = Object.defineProperty, T = (o, e, t, i) => {
  for (var s = void 0, n = o.length - 1, r; n >= 0; n--)
    (r = o[n]) && (s = r(e, t, s) || s);
  return s && Qe(e, t, s), s;
};
const Xe = {
  scheduled: "Scheduled",
  active: "Active",
  snoozed: "Snoozed",
  completed: "Completed",
  disabled: "Disabled"
}, de = {
  active: 0,
  snoozed: 1,
  scheduled: 2,
  completed: 3,
  disabled: 4
};
function E(o) {
  return o.status ?? "scheduled";
}
function _e(o) {
  return o ? o.replace("zone.", "").replace(/_/g, " ").replace(/\b\w/g, (e) => e.toUpperCase()) : "";
}
function et(o) {
  if (!o) return "";
  const e = new Date(o);
  if (Number.isNaN(e.getTime())) return o;
  const t = e.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
  return e.toLocaleString(void 0, {
    ...t ? {} : { weekday: "short", month: "short", day: "numeric" },
    hour: "2-digit",
    minute: "2-digit"
  });
}
function tt(o) {
  if (o.trigger_type === "zone_enter")
    return `When you enter ${_e(o.zone_entity_id)}`;
  if (o.trigger_type === "zone_leave")
    return `When you leave ${_e(o.zone_entity_id)}`;
  const e = et(o.next_fire), t = (o.every_x_days ?? 1) > 1 ? ` (every ${o.every_x_days} days)` : "";
  return `${e || "Scheduled"}${t}`;
}
function it(o) {
  return o ? Object.values(o.states).filter((e) => typeof e.attributes.reminder_id == "string").map((e) => e.attributes).sort((e, t) => {
    const i = (de[E(e)] ?? 9) - (de[E(t)] ?? 9);
    return i !== 0 ? i : e.title.localeCompare(t.title);
  }) : [];
}
const Q = class Q extends z {
  constructor() {
    super(...arguments), this._editorOpen = !1, this._editing = null, this._snoozeTarget = null, this._snoozeMinutes = 15, this._deleteArmed = null;
  }
  openNew() {
    this._editing = null, this._editorOpen = !0;
  }
  openEdit(e) {
    this._editing = e, this._editorOpen = !0;
  }
  async _complete(e) {
    await Ke(this.hass, e.id);
  }
  async _toggleEnabled(e, t) {
    await Je(this.hass, e.id, t);
  }
  async _snooze() {
    this._snoozeTarget && (await Ze(this.hass, this._snoozeTarget.id, this._snoozeMinutes), this._snoozeTarget = null);
  }
  _armDelete(e) {
    if (this._deleteArmed === e.id) {
      this._deleteArmed = null, this._deleteTimer !== void 0 && (window.clearTimeout(this._deleteTimer), this._deleteTimer = void 0), Ve(this.hass, e.id);
      return;
    }
    this._deleteArmed = e.id, this._deleteTimer !== void 0 && window.clearTimeout(this._deleteTimer), this._deleteTimer = window.setTimeout(() => {
      this._deleteArmed = null, this._deleteTimer = void 0;
    }, 3e3);
  }
  render() {
    const e = it(this.hass);
    return y`
      ${e.length === 0 ? y`<div class="empty">No reminders yet — use “New reminder”.</div>` : e.map(
      (t) => y`
              <div class="row">
                <ha-icon
                  icon=${t.trigger_type === "time" ? "mdi:clock-outline" : t.trigger_type === "zone_enter" ? "mdi:home-import-outline" : "mdi:home-export-outline"}
                ></ha-icon>
                <div class="row-text">
                  <div class="row-title">${t.title}</div>
                  <div class="row-sub">${tt(t)}</div>
                </div>
                ${E(t) === "disabled" ? h : y`<span class="chip ${E(t)}"
                      >${Xe[E(t)]}</span
                    >`}
                <div class="actions">
                  ${E(t) === "disabled" ? h : y`
                        <ha-icon-button
                          label="Complete"
                          @click=${() => this._complete(t)}
                        >
                          <ha-icon icon="mdi:check"></ha-icon>
                        </ha-icon-button>
                        <ha-icon-button
                          label="Snooze"
                          @click=${() => {
        this._snoozeTarget = t, this._snoozeMinutes = 15;
      }}
                        >
                          <ha-icon icon="mdi:clock-outline"></ha-icon>
                        </ha-icon-button>
                      `}
                  <ha-icon-button
                    label="Edit"
                    @click=${() => this.openEdit(t)}
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
                  @change=${(i) => this._toggleEnabled(
        t,
        i.target.checked
      )}
                ></ha-switch>
              </div>
            `
    )}

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
      (t) => y`
              <ha-button @click=${() => this._snoozeMinutes = t}
                >${t} min</ha-button
              >
            `
    )}
        </div>
        <ha-button slot="primaryAction" @click=${this._snooze}>Snooze</ha-button>
        <ha-button slot="secondaryAction" @click=${() => this._snoozeTarget = null}
          >Cancel</ha-button
        >
      </ha-dialog>
    `;
  }
};
Q.styles = pe`
    :host {
      display: block;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 4px;
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }
    .row:last-of-type {
      border-bottom: none;
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
let f = Q;
T([
  L({ attribute: !1 })
], f.prototype, "hass");
T([
  m()
], f.prototype, "_editorOpen");
T([
  m()
], f.prototype, "_editing");
T([
  m()
], f.prototype, "_snoozeTarget");
T([
  m()
], f.prototype, "_snoozeMinutes");
T([
  m()
], f.prototype, "_deleteArmed");
customElements.get("ha-reminders-list") || customElements.define("ha-reminders-list", f);
export {
  z as a,
  y as b,
  nt as e,
  pe as i,
  L as n,
  m as r
};

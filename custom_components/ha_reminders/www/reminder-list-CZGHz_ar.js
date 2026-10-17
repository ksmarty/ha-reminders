/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const j = globalThis, et = j.ShadowRoot && (j.ShadyCSS === void 0 || j.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype, it = Symbol(), at = /* @__PURE__ */ new WeakMap();
let xt = class {
  constructor(t, e, i) {
    if (this._$cssResult$ = !0, i !== it) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t, this.t = e;
  }
  get styleSheet() {
    let t = this.o;
    const e = this.t;
    if (et && t === void 0) {
      const i = e !== void 0 && e.length === 1;
      i && (t = at.get(e)), t === void 0 && ((this.o = t = new CSSStyleSheet()).replaceSync(this.cssText), i && at.set(e, t));
    }
    return t;
  }
  toString() {
    return this.cssText;
  }
};
const Mt = (o) => new xt(typeof o == "string" ? o : o + "", void 0, it), St = (o, ...t) => {
  const e = o.length === 1 ? o[0] : t.reduce((i, s, n) => i + ((r) => {
    if (r._$cssResult$ === !0) return r.cssText;
    if (typeof r == "number") return r;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + r + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s) + o[n + 1], o[0]);
  return new xt(e, o, it);
}, Pt = (o, t) => {
  if (et) o.adoptedStyleSheets = t.map((e) => e instanceof CSSStyleSheet ? e : e.styleSheet);
  else for (const e of t) {
    const i = document.createElement("style"), s = j.litNonce;
    s !== void 0 && i.setAttribute("nonce", s), i.textContent = e.cssText, o.appendChild(i);
  }
}, lt = et ? (o) => o : (o) => o instanceof CSSStyleSheet ? ((t) => {
  let e = "";
  for (const i of t.cssRules) e += i.cssText;
  return Mt(e);
})(o) : o;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const { is: Lt, defineProperty: Nt, getOwnPropertyDescriptor: Ht, getOwnPropertyNames: Rt, getOwnPropertySymbols: Dt, getPrototypeOf: It } = Object, w = globalThis, ct = w.trustedTypes, Vt = ct ? ct.emptyScript : "", jt = w.reactiveElementPolyfillSupport, M = (o, t) => o, B = { toAttribute(o, t) {
  switch (t) {
    case Boolean:
      o = o ? Vt : null;
      break;
    case Object:
    case Array:
      o = o == null ? o : JSON.stringify(o);
  }
  return o;
}, fromAttribute(o, t) {
  let e = o;
  switch (t) {
    case Boolean:
      e = o !== null;
      break;
    case Number:
      e = o === null ? null : Number(o);
      break;
    case Object:
    case Array:
      try {
        e = JSON.parse(o);
      } catch {
        e = null;
      }
  }
  return e;
} }, ot = (o, t) => !Lt(o, t), dt = { attribute: !0, type: String, converter: B, reflect: !1, useDefault: !1, hasChanged: ot };
Symbol.metadata ?? (Symbol.metadata = Symbol("metadata")), w.litPropertyMetadata ?? (w.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
let E = class extends HTMLElement {
  static addInitializer(t) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t, e = dt) {
    if (e.state && (e.attribute = !1), this._$Ei(), this.prototype.hasOwnProperty(t) && ((e = Object.create(e)).wrapped = !0), this.elementProperties.set(t, e), !e.noAccessor) {
      const i = Symbol(), s = this.getPropertyDescriptor(t, i, e);
      s !== void 0 && Nt(this.prototype, t, s);
    }
  }
  static getPropertyDescriptor(t, e, i) {
    const { get: s, set: n } = Ht(this.prototype, t) ?? { get() {
      return this[e];
    }, set(r) {
      this[e] = r;
    } };
    return { get: s, set(r) {
      const l = s?.call(this);
      n?.call(this, r), this.requestUpdate(t, l, i);
    }, configurable: !0, enumerable: !0 };
  }
  static getPropertyOptions(t) {
    return this.elementProperties.get(t) ?? dt;
  }
  static _$Ei() {
    if (this.hasOwnProperty(M("elementProperties"))) return;
    const t = It(this);
    t.finalize(), t.l !== void 0 && (this.l = [...t.l]), this.elementProperties = new Map(t.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(M("finalized"))) return;
    if (this.finalized = !0, this._$Ei(), this.hasOwnProperty(M("properties"))) {
      const e = this.properties, i = [...Rt(e), ...Dt(e)];
      for (const s of i) this.createProperty(s, e[s]);
    }
    const t = this[Symbol.metadata];
    if (t !== null) {
      const e = litPropertyMetadata.get(t);
      if (e !== void 0) for (const [i, s] of e) this.elementProperties.set(i, s);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [e, i] of this.elementProperties) {
      const s = this._$Eu(e, i);
      s !== void 0 && this._$Eh.set(s, e);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(t) {
    const e = [];
    if (Array.isArray(t)) {
      const i = new Set(t.flat(1 / 0).reverse());
      for (const s of i) e.unshift(lt(s));
    } else t !== void 0 && e.push(lt(t));
    return e;
  }
  static _$Eu(t, e) {
    const i = e.attribute;
    return i === !1 ? void 0 : typeof i == "string" ? i : typeof t == "string" ? t.toLowerCase() : void 0;
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
    for (const i of e.keys()) this.hasOwnProperty(i) && (t.set(i, this[i]), delete this[i]);
    t.size > 0 && (this._$Ep = t);
  }
  createRenderRoot() {
    const t = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return Pt(t, this.constructor.elementStyles), t;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(!0), this._$EO?.forEach((t) => t.hostConnected?.());
  }
  enableUpdating(t) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t) => t.hostDisconnected?.());
  }
  attributeChangedCallback(t, e, i) {
    this._$AK(t, i);
  }
  _$ET(t, e) {
    const i = this.constructor.elementProperties.get(t), s = this.constructor._$Eu(t, i);
    if (s !== void 0 && i.reflect === !0) {
      const n = (i.converter?.toAttribute !== void 0 ? i.converter : B).toAttribute(e, i.type);
      this._$Em = t, n == null ? this.removeAttribute(s) : this.setAttribute(s, n), this._$Em = null;
    }
  }
  _$AK(t, e) {
    const i = this.constructor, s = i._$Eh.get(t);
    if (s !== void 0 && this._$Em !== s) {
      const n = i.getPropertyOptions(s), r = typeof n.converter == "function" ? { fromAttribute: n.converter } : n.converter?.fromAttribute !== void 0 ? n.converter : B;
      this._$Em = s;
      const l = r.fromAttribute(e, n.type);
      this[s] = l ?? this._$Ej?.get(s) ?? l, this._$Em = null;
    }
  }
  requestUpdate(t, e, i, s = !1, n) {
    if (t !== void 0) {
      const r = this.constructor;
      if (s === !1 && (n = this[t]), i ?? (i = r.getPropertyOptions(t)), !((i.hasChanged ?? ot)(n, e) || i.useDefault && i.reflect && n === this._$Ej?.get(t) && !this.hasAttribute(r._$Eu(t, i)))) return;
      this.C(t, e, i);
    }
    this.isUpdatePending === !1 && (this._$ES = this._$EP());
  }
  C(t, e, { useDefault: i, reflect: s, wrapped: n }, r) {
    i && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t) && (this._$Ej.set(t, r ?? e ?? this[t]), n !== !0 || r !== void 0) || (this._$AL.has(t) || (this.hasUpdated || i || (e = void 0), this._$AL.set(t, e)), s === !0 && this._$Em !== t && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t));
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
        for (const [s, n] of this._$Ep) this[s] = n;
        this._$Ep = void 0;
      }
      const i = this.constructor.elementProperties;
      if (i.size > 0) for (const [s, n] of i) {
        const { wrapped: r } = n, l = this[s];
        r !== !0 || this._$AL.has(s) || l === void 0 || this.C(s, void 0, n, l);
      }
    }
    let t = !1;
    const e = this._$AL;
    try {
      t = this.shouldUpdate(e), t ? (this.willUpdate(e), this._$EO?.forEach((i) => i.hostUpdate?.()), this.update(e)) : this._$EM();
    } catch (i) {
      throw t = !1, this._$EM(), i;
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
E.elementStyles = [], E.shadowRootOptions = { mode: "open" }, E[M("elementProperties")] = /* @__PURE__ */ new Map(), E[M("finalized")] = /* @__PURE__ */ new Map(), jt?.({ ReactiveElement: E }), (w.reactiveElementVersions ?? (w.reactiveElementVersions = [])).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const P = globalThis, ht = (o) => o, F = P.trustedTypes, _t = F ? F.createPolicy("lit-html", { createHTML: (o) => o }) : void 0, Et = "$lit$", v = `lit$${Math.random().toFixed(9).slice(2)}$`, Ct = "?" + v, Bt = `<${Ct}>`, S = document, N = () => S.createComment(""), H = (o) => o === null || typeof o != "object" && typeof o != "function", st = Array.isArray, Ft = (o) => st(o) || typeof o?.[Symbol.iterator] == "function", q = `[ 	
\f\r]`, U = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g, pt = /-->/g, ut = />/g, A = RegExp(`>|${q}(?:([^\\s"'>=/]+)(${q}*=${q}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g"), ft = /'/g, gt = /"/g, kt = /^(?:script|style|textarea|title)$/i, Wt = (o) => (t, ...e) => ({ _$litType$: o, strings: t, values: e }), g = Wt(1), k = Symbol.for("lit-noChange"), d = Symbol.for("lit-nothing"), mt = /* @__PURE__ */ new WeakMap(), x = S.createTreeWalker(S, 129);
function Tt(o, t) {
  if (!st(o) || !o.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return _t !== void 0 ? _t.createHTML(t) : t;
}
const qt = (o, t) => {
  const e = o.length - 1, i = [];
  let s, n = t === 2 ? "<svg>" : t === 3 ? "<math>" : "", r = U;
  for (let l = 0; l < e; l++) {
    const a = o[l];
    let h, _, c = -1, m = 0;
    for (; m < a.length && (r.lastIndex = m, _ = r.exec(a), _ !== null); ) m = r.lastIndex, r === U ? _[1] === "!--" ? r = pt : _[1] !== void 0 ? r = ut : _[2] !== void 0 ? (kt.test(_[2]) && (s = RegExp("</" + _[2], "g")), r = A) : _[3] !== void 0 && (r = A) : r === A ? _[0] === ">" ? (r = s ?? U, c = -1) : _[1] === void 0 ? c = -2 : (c = r.lastIndex - _[2].length, h = _[1], r = _[3] === void 0 ? A : _[3] === '"' ? gt : ft) : r === gt || r === ft ? r = A : r === pt || r === ut ? r = U : (r = A, s = void 0);
    const y = r === A && o[l + 1].startsWith("/>") ? " " : "";
    n += r === U ? a + Bt : c >= 0 ? (i.push(h), a.slice(0, c) + Et + a.slice(c) + v + y) : a + v + (c === -2 ? l : y);
  }
  return [Tt(o, n + (o[e] || "<?>") + (t === 2 ? "</svg>" : t === 3 ? "</math>" : "")), i];
};
class R {
  constructor({ strings: t, _$litType$: e }, i) {
    let s;
    this.parts = [];
    let n = 0, r = 0;
    const l = t.length - 1, a = this.parts, [h, _] = qt(t, e);
    if (this.el = R.createElement(h, i), x.currentNode = this.el.content, e === 2 || e === 3) {
      const c = this.el.content.firstChild;
      c.replaceWith(...c.childNodes);
    }
    for (; (s = x.nextNode()) !== null && a.length < l; ) {
      if (s.nodeType === 1) {
        if (s.hasAttributes()) for (const c of s.getAttributeNames()) if (c.endsWith(Et)) {
          const m = _[r++], y = s.getAttribute(c).split(v), V = /([.?@])?(.*)/.exec(m);
          a.push({ type: 1, index: n, name: V[2], strings: y, ctor: V[1] === "." ? Gt : V[1] === "?" ? Kt : V[1] === "@" ? Jt : W }), s.removeAttribute(c);
        } else c.startsWith(v) && (a.push({ type: 6, index: n }), s.removeAttribute(c));
        if (kt.test(s.tagName)) {
          const c = s.textContent.split(v), m = c.length - 1;
          if (m > 0) {
            s.textContent = F ? F.emptyScript : "";
            for (let y = 0; y < m; y++) s.append(c[y], N()), x.nextNode(), a.push({ type: 2, index: ++n });
            s.append(c[m], N());
          }
        }
      } else if (s.nodeType === 8) if (s.data === Ct) a.push({ type: 2, index: n });
      else {
        let c = -1;
        for (; (c = s.data.indexOf(v, c + 1)) !== -1; ) a.push({ type: 7, index: n }), c += v.length - 1;
      }
      n++;
    }
  }
  static createElement(t, e) {
    const i = S.createElement("template");
    return i.innerHTML = t, i;
  }
}
function T(o, t, e = o, i) {
  if (t === k) return t;
  let s = i !== void 0 ? e._$Co?.[i] : e._$Cl;
  const n = H(t) ? void 0 : t._$litDirective$;
  return s?.constructor !== n && (s?._$AO?.(!1), n === void 0 ? s = void 0 : (s = new n(o), s._$AT(o, e, i)), i !== void 0 ? (e._$Co ?? (e._$Co = []))[i] = s : e._$Cl = s), s !== void 0 && (t = T(o, s._$AS(o, t.values), s, i)), t;
}
class Zt {
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
    const { el: { content: e }, parts: i } = this._$AD, s = (t?.creationScope ?? S).importNode(e, !0);
    x.currentNode = s;
    let n = x.nextNode(), r = 0, l = 0, a = i[0];
    for (; a !== void 0; ) {
      if (r === a.index) {
        let h;
        a.type === 2 ? h = new I(n, n.nextSibling, this, t) : a.type === 1 ? h = new a.ctor(n, a.name, a.strings, this, t) : a.type === 6 && (h = new Yt(n, this, t)), this._$AV.push(h), a = i[++l];
      }
      r !== a?.index && (n = x.nextNode(), r++);
    }
    return x.currentNode = S, s;
  }
  p(t) {
    let e = 0;
    for (const i of this._$AV) i !== void 0 && (i.strings !== void 0 ? (i._$AI(t, i, e), e += i.strings.length - 2) : i._$AI(t[e])), e++;
  }
}
class I {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t, e, i, s) {
    this.type = 2, this._$AH = d, this._$AN = void 0, this._$AA = t, this._$AB = e, this._$AM = i, this.options = s, this._$Cv = s?.isConnected ?? !0;
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
    t = T(this, t, e), H(t) ? t === d || t == null || t === "" ? (this._$AH !== d && this._$AR(), this._$AH = d) : t !== this._$AH && t !== k && this._(t) : t._$litType$ !== void 0 ? this.$(t) : t.nodeType !== void 0 ? this.T(t) : Ft(t) ? this.k(t) : this._(t);
  }
  O(t) {
    return this._$AA.parentNode.insertBefore(t, this._$AB);
  }
  T(t) {
    this._$AH !== t && (this._$AR(), this._$AH = this.O(t));
  }
  _(t) {
    this._$AH !== d && H(this._$AH) ? this._$AA.nextSibling.data = t : this.T(S.createTextNode(t)), this._$AH = t;
  }
  $(t) {
    const { values: e, _$litType$: i } = t, s = typeof i == "number" ? this._$AC(t) : (i.el === void 0 && (i.el = R.createElement(Tt(i.h, i.h[0]), this.options)), i);
    if (this._$AH?._$AD === s) this._$AH.p(e);
    else {
      const n = new Zt(s, this), r = n.u(this.options);
      n.p(e), this.T(r), this._$AH = n;
    }
  }
  _$AC(t) {
    let e = mt.get(t.strings);
    return e === void 0 && mt.set(t.strings, e = new R(t)), e;
  }
  k(t) {
    st(this._$AH) || (this._$AH = [], this._$AR());
    const e = this._$AH;
    let i, s = 0;
    for (const n of t) s === e.length ? e.push(i = new I(this.O(N()), this.O(N()), this, this.options)) : i = e[s], i._$AI(n), s++;
    s < e.length && (this._$AR(i && i._$AB.nextSibling, s), e.length = s);
  }
  _$AR(t = this._$AA.nextSibling, e) {
    for (this._$AP?.(!1, !0, e); t !== this._$AB; ) {
      const i = ht(t).nextSibling;
      ht(t).remove(), t = i;
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
  constructor(t, e, i, s, n) {
    this.type = 1, this._$AH = d, this._$AN = void 0, this.element = t, this.name = e, this._$AM = s, this.options = n, i.length > 2 || i[0] !== "" || i[1] !== "" ? (this._$AH = Array(i.length - 1).fill(new String()), this.strings = i) : this._$AH = d;
  }
  _$AI(t, e = this, i, s) {
    const n = this.strings;
    let r = !1;
    if (n === void 0) t = T(this, t, e, 0), r = !H(t) || t !== this._$AH && t !== k, r && (this._$AH = t);
    else {
      const l = t;
      let a, h;
      for (t = n[0], a = 0; a < n.length - 1; a++) h = T(this, l[i + a], e, a), h === k && (h = this._$AH[a]), r || (r = !H(h) || h !== this._$AH[a]), h === d ? t = d : t !== d && (t += (h ?? "") + n[a + 1]), this._$AH[a] = h;
    }
    r && !s && this.j(t);
  }
  j(t) {
    t === d ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t ?? "");
  }
}
class Gt extends W {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t) {
    this.element[this.name] = t === d ? void 0 : t;
  }
}
class Kt extends W {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t) {
    this.element.toggleAttribute(this.name, !!t && t !== d);
  }
}
class Jt extends W {
  constructor(t, e, i, s, n) {
    super(t, e, i, s, n), this.type = 5;
  }
  _$AI(t, e = this) {
    if ((t = T(this, t, e, 0) ?? d) === k) return;
    const i = this._$AH, s = t === d && i !== d || t.capture !== i.capture || t.once !== i.once || t.passive !== i.passive, n = t !== d && (i === d || s);
    s && this.element.removeEventListener(this.name, this, i), n && this.element.addEventListener(this.name, this, t), this._$AH = t;
  }
  handleEvent(t) {
    typeof this._$AH == "function" ? this._$AH.call(this.options?.host ?? this.element, t) : this._$AH.handleEvent(t);
  }
}
class Yt {
  constructor(t, e, i) {
    this.element = t, this.type = 6, this._$AN = void 0, this._$AM = e, this.options = i;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t) {
    T(this, t);
  }
}
const Xt = P.litHtmlPolyfillSupport;
Xt?.(R, I), (P.litHtmlVersions ?? (P.litHtmlVersions = [])).push("3.3.3");
const Qt = (o, t, e) => {
  const i = e?.renderBefore ?? t;
  let s = i._$litPart$;
  if (s === void 0) {
    const n = e?.renderBefore ?? null;
    i._$litPart$ = s = new I(t.insertBefore(N(), n), n, void 0, e ?? {});
  }
  return s._$AI(o), s;
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
    var e;
    const t = super.createRenderRoot();
    return (e = this.renderOptions).renderBefore ?? (e.renderBefore = t.firstChild), t;
  }
  update(t) {
    const e = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t), this._$Do = Qt(e, this.renderRoot, this.renderOptions);
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
C._$litElement$ = !0, C.finalized = !0, L.litElementHydrateSupport?.({ LitElement: C });
const te = L.litElementPolyfillSupport;
te?.({ LitElement: C });
(L.litElementVersions ?? (L.litElementVersions = [])).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const ee = { attribute: !0, type: String, converter: B, reflect: !1, hasChanged: ot }, ie = (o = ee, t, e) => {
  const { kind: i, metadata: s } = e;
  let n = globalThis.litPropertyMetadata.get(s);
  if (n === void 0 && globalThis.litPropertyMetadata.set(s, n = /* @__PURE__ */ new Map()), i === "setter" && ((o = Object.create(o)).wrapped = !0), n.set(e.name, o), i === "accessor") {
    const { name: r } = e;
    return { set(l) {
      const a = t.get.call(this);
      t.set.call(this, l), this.requestUpdate(r, a, o, !0, l);
    }, init(l) {
      return l !== void 0 && this.C(r, void 0, o, l), l;
    } };
  }
  if (i === "setter") {
    const { name: r } = e;
    return function(l) {
      const a = this[r];
      t.call(this, l), this.requestUpdate(r, a, o, !0, l);
    };
  }
  throw Error("Unsupported decorator location: " + i);
};
function z(o) {
  return (t, e) => typeof e == "object" ? ie(o, t, e) : ((i, s, n) => {
    const r = s.hasOwnProperty(n);
    return s.constructor.createProperty(n, i), r ? Object.getOwnPropertyDescriptor(s, n) : void 0;
  })(o, t, e);
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function u(o) {
  return z({ ...o, state: !0, attribute: !1 });
}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const oe = (o, t, e) => (e.configurable = !0, e.enumerable = !0, Reflect.decorate && typeof t != "object" && Object.defineProperty(o, t, e), e);
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
function Te(o, t) {
  return (e, i, s) => {
    const n = (r) => r.renderRoot?.querySelector(o) ?? null;
    return oe(e, i, { get() {
      return n(this);
    } });
  };
}
var se = "M22.11,21.46L2.39,1.73L1.11,3L5.83,7.72C5.29,8.73 5,9.86 5,11V17L3,19V20H18.11L20.84,22.73L22.11,21.46M7,18V11C7,10.39 7.11,9.79 7.34,9.23L16.11,18H7M10,21H14A2,2 0 0,1 12,23A2,2 0 0,1 10,21M8.29,5.09C8.82,4.75 9.4,4.5 10,4.29C10,4.19 10,4.1 10,4A2,2 0 0,1 12,2A2,2 0 0,1 14,4C14,4.1 14,4.19 14,4.29C16.97,5.17 19,7.9 19,11V15.8L17,13.8V11A5,5 0 0,0 12,6C11.22,6 10.45,6.2 9.76,6.56L8.29,5.09Z", ne = "M10 21H14C14 22.1 13.1 23 12 23S10 22.1 10 21M21 19V20H3V19L5 17V11C5 7.9 7 5.2 10 4.3V4C10 2.9 10.9 2 12 2S14 2.9 14 4V4.3C17 5.2 19 7.9 19 11V17L21 19M17 11C17 8.2 14.8 6 12 6S7 8.2 7 11V18H17V11Z", re = "M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z", ae = "M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z", zt = "M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z", le = "M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z";
const O = "ha_reminders";
async function ce(o, t) {
  const e = await o.callService(O, "create", t);
  return String(e?.reminder_id ?? "");
}
async function de(o, t, e) {
  await o.callService(O, "update", {
    reminder_id: t,
    ...e
  });
}
async function $t(o, t) {
  await o.callService(O, "delete", { reminder_id: t });
}
async function he(o, t, e) {
  await o.callService(O, "snooze", {
    reminder_id: t,
    minutes: e
  });
}
async function _e(o, t) {
  await o.callService(O, "complete", { reminder_id: t });
}
async function pe(o, t, e) {
  await o.callService(O, "set_enabled", {
    reminder_id: t,
    enabled: e
  });
}
function Ot(o, t, e = !1) {
  const i = t.trim();
  i && o.dispatchEvent(
    new CustomEvent("hass-notification", {
      detail: { message: i, ...e ? { duration: 8e3 } : {} },
      bubbles: !0,
      composed: !0
    })
  );
}
function Ut(o, t) {
  return o instanceof Error && o.message ? o.message : o?.body?.message || t;
}
var ue = Object.defineProperty, $ = (o, t, e, i) => {
  for (var s = void 0, n = o.length - 1, r; n >= 0; n--)
    (r = o[n]) && (s = r(t, e, s) || s);
  return s && ue(t, e, s), s;
};
const fe = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" }
], yt = {
  title: "Title (required)",
  subtitle: "Subtitle",
  message: "Message (optional)",
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
  click_url: "Opens when tapped (URL)",
  color: "Color (Android)",
  channel: "Channel (Android)",
  channel_importance: "Channel importance",
  notification_group: "Notification group",
  acknowledge_notification_title: "Completion title (group)",
  acknowledge_notification_body: "Completion message (group)"
}, ge = [
  { value: "time", label: "At a fixed time" },
  { value: "zone_enter", label: "When I enter a zone" },
  { value: "zone_leave", label: "When I leave a zone" }
];
function me(o, t) {
  const e = [
    // Neither field is flagged `required`: see the note on `Field.required`.
    { name: "title", selector: { text: {} } },
    {
      name: "message",
      selector: { text: { multiline: !0 } },
      helper: "Optional — left empty, the notification repeats the title."
    },
    {
      name: "trigger_type",
      selector: { select: { mode: "dropdown", options: ge } }
    }
  ];
  return o === "time" ? (e.push({ name: "time", selector: { time: {} } }), e.push({ name: "start_date", selector: { date: {} } })) : (e.push({ name: "zone_entity_id", selector: { entity: { domain: "zone" } } }), e.push({
    name: "person_entity_ids",
    selector: { entity: { domain: "person", multiple: !0 } }
  })), e.push(t), e;
}
function $e(o) {
  const t = [
    { name: "subtitle", selector: { text: {} } },
    { name: "user_name", selector: { text: {} } },
    { name: "one_shot", selector: { boolean: {} } }
  ];
  return o === "time" ? t.push({ name: "every_x_days", selector: { number: { min: 1, mode: "box" } } }) : (t.push({ name: "time_window_start", selector: { time: {} } }), t.push({ name: "time_window_end", selector: { time: {} } }), t.push({ name: "start_date", selector: { date: {} } })), t.push(
    { name: "stop_date", selector: { date: {} } },
    {
      name: "exclude_days_of_week",
      selector: { select: { multiple: !0, options: fe } }
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
    { name: "click_url", selector: { text: {} } },
    { name: "color", selector: { text: {} } },
    { name: "notification_group", selector: { text: {} } },
    { name: "acknowledge_notification_title", selector: { text: {} } },
    { name: "acknowledge_notification_body", selector: { text: { multiline: !0 } } }
  ), t;
}
const K = [5, 15, 30, 45, 60], ye = "Someone", J = "Snooze for ${time}", Y = "Mark as done", X = "Someone acknowledged the notification", Q = 15, tt = 1;
function ve(o) {
  if (!o) return !1;
  const t = o.snooze_delays?.length ? o.snooze_delays : K, e = (o.user_name ?? "").trim(), i = (o.trigger_type ?? "time") === "time", s = o.one_shot ?? i, n = i ? "" : o.start_date ?? "";
  return !!((o.subtitle ?? "").trim() || e && e !== ye || s !== i || (o.every_x_days ?? 1) !== 1 || n || o.stop_date || (o.exclude_days_of_week ?? []).length > 0 || o.time_window_start || o.time_window_end || t.join(",") !== K.join(",") || (o.snooze_text ?? J) !== J || (o.acknowledge_action_title ?? Y) !== Y || (o.wait_time_if_no_action ?? Q) !== Q || (o.notification_count ?? tt) !== tt || (o.channel_importance ?? "") || (o.channel ?? "") || (o.icon ?? "") || (o.click_url ?? "") || (o.color ?? "") || (o.notification_group ?? "") || (o.acknowledge_notification_title ?? X) !== X || (o.acknowledge_notification_body ?? "").trim());
}
const nt = class nt extends C {
  constructor() {
    super(...arguments), this.reminder = null, this.open = !1, this._data = {}, this._saving = !1, this._error = "", this._notifyServices = [], this._advancedOpen = !1, this._customised = !1, this._collapseAdvanced = !1, this._targetId = null, this._wasOpen = !1;
  }
  willUpdate() {
    const t = this.open && !this._wasOpen;
    this._wasOpen = this.open, t && (this._targetId = this.reminder?.id ?? null, this._customised = ve(this.reminder), this._data = this._dataFrom(this.reminder), this._error = "", this._saving = !1, this._advancedOpen = !1, this._collapseAdvanced = !0, this._loadNotifyServices());
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
    const e = t?.trigger_type ?? "time";
    return {
      title: t?.title ?? "",
      subtitle: t?.subtitle ?? "",
      message: t?.message ?? "",
      notify_service: t?.notify_service ?? "",
      user_name: t?.user_name ?? "",
      trigger_type: e,
      // Only-once is the default for a timed reminder, exactly as the
      // integration defaults it when `one_shot` is absent from the payload.
      one_shot: t?.one_shot ?? e === "time",
      time: this._time(t?.time),
      every_x_days: t?.every_x_days ?? 1,
      start_date: t?.start_date ?? "",
      stop_date: t?.stop_date ?? "",
      exclude_days_of_week: (t?.exclude_days_of_week ?? []).map(String),
      zone_entity_id: t?.zone_entity_id ?? "",
      person_entity_ids: t?.person_entity_ids ?? [],
      time_window_start: this._time(t?.time_window_start),
      time_window_end: this._time(t?.time_window_end),
      acknowledge_action_title: t?.acknowledge_action_title ?? Y,
      snooze_delays: (t?.snooze_delays ?? K).join(","),
      snooze_text: t?.snooze_text ?? J,
      wait_time_if_no_action: t?.wait_time_if_no_action ?? Q,
      notification_count: t?.notification_count ?? tt,
      icon: t?.icon ?? "",
      click_url: t?.click_url ?? "",
      color: t?.color ?? "",
      channel: t?.channel ?? "",
      channel_importance: t?.channel_importance ?? "",
      notification_group: t?.notification_group ?? "",
      acknowledge_notification_title: t?.acknowledge_notification_title ?? X,
      acknowledge_notification_body: t?.acknowledge_notification_body ?? ""
    };
  }
  async _loadNotifyServices() {
    try {
      const t = await this.hass.callWS({ type: "get_services" }), e = /* @__PURE__ */ new Set(["notify", "persistent_notification", "send_message"]), i = /* @__PURE__ */ new Set();
      Object.keys(t).forEach((s) => {
        s === "notify" ? Object.keys(t[s] ?? {}).forEach((n) => {
          e.has(n) || i.add(`notify.${n}`);
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
  _valueChanged(t) {
    t.stopPropagation();
    const e = { ...t.detail.value }, i = this._data.trigger_type ?? "time";
    e.trigger_type !== i && this._data.one_shot === (i === "time") && (e.one_shot = e.trigger_type === "time"), this._data = e;
  }
  _validationError() {
    const t = this._data;
    if (!String(t.title ?? "").trim()) return "A title is required.";
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
      icon: this._orUndefined(e.icon),
      click_url: this._orUndefined(e.click_url),
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
      this._targetId ? await de(this.hass, this._targetId, i) : await ce(this.hass, i), this.dispatchEvent(new CustomEvent("saved")), this.open = !1;
    } catch (s) {
      this._error = Ut(
        s,
        this._targetId ? "Could not save the reminder." : "Could not create the reminder."
      ), Ot(this, this._error, !0);
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
            .schema=${me(
      this._data.trigger_type ?? "time",
      this._notifyField()
    )}
            .computeLabel=${(t) => yt[t.name] ?? t.name}
            .computeHelper=${(t) => t.helper ?? ""}
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
              .schema=${$e(
      this._data.trigger_type ?? "time"
    )}
              .computeLabel=${(t) => yt[t.name] ?? t.name}
              .computeHelper=${(t) => t.helper ?? ""}
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
nt.styles = St`
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
let p = nt;
$([
  z({ attribute: !1 })
], p.prototype, "hass");
$([
  z({ attribute: !1 })
], p.prototype, "reminder");
$([
  z({ type: Boolean })
], p.prototype, "open");
$([
  u()
], p.prototype, "_data");
$([
  u()
], p.prototype, "_saving");
$([
  u()
], p.prototype, "_error");
$([
  u()
], p.prototype, "_notifyServices");
$([
  u()
], p.prototype, "_advancedOpen");
$([
  u()
], p.prototype, "_customised");
customElements.get("ha-reminders-editor") || customElements.define("ha-reminders-editor", p);
var we = Object.defineProperty, b = (o, t, e, i) => {
  for (var s = void 0, n = o.length - 1, r; n >= 0; n--)
    (r = o[n]) && (s = r(t, e, s) || s);
  return s && we(t, e, s), s;
};
const be = {
  scheduled: "Scheduled",
  active: "Active",
  snoozed: "Snoozed",
  completed: "Completed",
  disabled: "Disabled"
}, vt = {
  active: 0,
  snoozed: 1,
  scheduled: 2,
  completed: 3,
  disabled: 4
};
function D(o) {
  return o.status ?? "scheduled";
}
function wt(o) {
  return o ? o.replace("zone.", "").replace(/_/g, " ").replace(/\b\w/g, (t) => t.toUpperCase()) : "";
}
function Ae(o) {
  if (!o) return "";
  const t = new Date(o);
  if (Number.isNaN(t.getTime())) return o;
  const e = t.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
  return t.toLocaleString(void 0, {
    ...e ? {} : { weekday: "short", month: "short", day: "numeric" },
    hour: "2-digit",
    minute: "2-digit"
  });
}
function xe(o) {
  const t = (o.message ?? "").trim();
  return t && t !== (o.title ?? "").trim() ? t : (o.subtitle ?? "").trim();
}
function Se(o) {
  if (o.trigger_type === "zone_enter")
    return `When you enter ${wt(o.zone_entity_id)}`;
  if (o.trigger_type === "zone_leave")
    return `When you leave ${wt(o.zone_entity_id)}`;
  const t = Ae(o.next_fire), e = (o.every_x_days ?? 1) > 1 ? ` · every ${o.every_x_days} days` : "", i = o.one_shot ? " · once" : " · repeats";
  return `${t || "Scheduled"}${e}${i}`;
}
function bt(o) {
  return o ? Object.values(o.states).filter((t) => typeof t.attributes.reminder_id == "string").map((t) => t.attributes).sort((t, e) => {
    const i = (vt[D(t)] ?? 9) - (vt[D(e)] ?? 9);
    return i !== 0 ? i : String(t.title ?? "").localeCompare(String(e.title ?? ""));
  }) : [];
}
function Z(o, t) {
  return String(o.title ?? "").localeCompare(String(t.title ?? ""));
}
function G(o, t) {
  const e = (o ?? "").trim(), i = (t ?? "").trim();
  return e === i ? null : e ? i ? e < i ? -1 : 1 : -1 : 1;
}
function At(o) {
  const t = { time: [], location: [], completed: [] };
  for (const e of o)
    D(e) === "completed" ? t.completed.push(e) : e.trigger_type === "time" ? t.time.push(e) : t.location.push(e);
  return t.time.sort(
    (e, i) => G(e.time, i.time) ?? Z(e, i)
  ), t.location.sort(
    (e, i) => G(e.created_at, i.created_at) ?? Z(e, i)
  ), t.completed.sort((e, i) => {
    const s = G(e.completed_at, i.completed_at);
    return s === null ? Z(e, i) : -s;
  }), t;
}
function Ee(o, t) {
  const e = D(o), i = [];
  return e !== "disabled" && e !== "completed" && (i.push({ label: "Mark done", path: re, action: t.complete }), i.push({ label: "Snooze", path: ae, action: t.snooze })), i.push({
    label: o.enabled ? "Disable" : "Enable",
    path: o.enabled ? se : ne,
    action: t.toggleEnabled
  }), i.push({ label: "Edit", path: le, action: t.edit }), i.push({
    label: "Delete",
    path: zt,
    action: t.remove,
    warning: !0
  }), i;
}
const rt = class rt extends C {
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
    } catch (i) {
      const s = Ut(i, "");
      return Ot(this, s ? `${e} ${s}` : e, !0), !1;
    }
  }
  async _complete(t) {
    await this._run(
      () => _e(this.hass, t.id),
      `Could not complete “${t.title}”.`
    );
  }
  async _toggleEnabled(t) {
    await this._run(
      () => pe(this.hass, t.id, !t.enabled),
      `Could not ${t.enabled ? "disable" : "enable"} “${t.title}”.`
    );
  }
  async _snooze() {
    if (!this._snoozeTarget) return;
    const t = this._snoozeTarget;
    await this._run(
      () => he(this.hass, t.id, this._snoozeMinutes),
      `Could not snooze “${t.title}”.`
    ) && (this._snoozeTarget = null);
  }
  async _delete() {
    if (!this._deleteTarget) return;
    const t = this._deleteTarget;
    await this._run(
      () => $t(this.hass, t.id),
      `Could not delete “${t.title}”.`
    ) && (this._deleteTarget = null);
  }
  _itemsFor(t) {
    return Ee(t, {
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
  /** One row: the text block (which opens the editor) plus the overflow menu. */
  _renderRow(t) {
    const e = xe(t), i = D(t);
    return g`
      <div class="row">
        <ha-icon
          icon=${t.trigger_type === "time" ? "mdi:clock-outline" : t.trigger_type === "zone_enter" ? "mdi:home-import-outline" : "mdi:home-export-outline"}
        ></ha-icon>
        <div class="row-text" @click=${() => this.openEdit(t)}>
          <div class="row-title">${t.title}</div>
          ${e ? g`<div class="row-snippet">${e}</div>` : d}
          <div class="row-meta">
            <span class="chip ${i}">${be[i]}</span>
            <span class="row-trigger">${Se(t)}</span>
          </div>
        </div>
        <ha-icon-overflow-menu
          .narrow=${!0}
          .items=${this._itemsFor(t)}
        ></ha-icon-overflow-menu>
      </div>
    `;
  }
  /**
   * Remove every completed reminder.
   *
   * Completed rows accumulate — something finished weeks ago still sits in the
   * section — so the section header carries a button that deletes them all.
   * Each delete goes through the same service call as a row's Delete, and a
   * failure is reported instead of swallowed.
   */
  async _clearCompleted() {
    const t = At(bt(this.hass)).completed;
    for (const e of t)
      await this._run(
        () => $t(this.hass, e.id),
        `Could not delete “${e.title}”.`
      );
  }
  /**
   * One collapsible section, as its own card. The count sits in the header so
   * it reads next to the title rather than under it (`secondary` wraps in the
   * panel's narrow layout).
   */
  _renderGroup(t, e, i) {
    const s = t === "completed" && i.length > 0;
    return g`
      <div class="group">
        <ha-expansion-panel
          .header=${`${e} (${i.length})`}
          .expanded=${this._expanded[t]}
          @expanded-changed=${(n) => {
      this._expanded = {
        ...this._expanded,
        [t]: !!n.detail?.expanded
      };
    }}
        >
          ${s ? g`<ha-icon-button
                slot="icons"
                .path=${zt}
                .label=${"Remove completed"}
                title="Remove completed"
                @click=${(n) => {
      n.stopPropagation(), this._clearCompleted();
    }}
              ></ha-icon-button>` : d}
          ${i.map((n) => this._renderRow(n))}
        </ha-expansion-panel>
      </div>
    `;
  }
  render() {
    const t = bt(this.hass), e = At(t);
    return g`
      ${t.length === 0 ? g`<div class="empty">No reminders yet — use “New reminder”.</div>` : this.grouped ? g`${this._renderGroup("time", "Time", e.time)}
              ${this._renderGroup("location", "Location", e.location)}
              ${this._renderGroup("completed", "Completed", e.completed)}` : t.map((i) => this._renderRow(i))}

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
rt.styles = St`
    :host {
      display: block;
    }
    ha-expansion-panel {
      display: block;
      --expansion-panel-content-padding: 0;
    }
    /* Each section is its own card in the sidebar. */
    .group {
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow, none);
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      padding: 4px 12px;
    }
    .group + .group {
      margin-top: 12px;
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
let f = rt;
b([
  z({ attribute: !1 })
], f.prototype, "hass");
b([
  z({ type: Boolean })
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
  Te as e,
  St as i,
  z as n,
  u as r
};

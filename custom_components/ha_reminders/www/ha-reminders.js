import { i as u, n as l, r as m, e as f, a as p, b as c } from "./reminder-list-5yTs-gyz.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const g = (t) => (e, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(t, e);
  }) : customElements.define(t, e);
};
var _ = Object.defineProperty, w = Object.getOwnPropertyDescriptor, n = (t, e, s, a) => {
  for (var r = a > 1 ? void 0 : a ? w(e, s) : e, o = t.length - 1, d; o >= 0; o--)
    (d = t[o]) && (r = (a ? d(e, s, r) : d(r)) || r);
  return a && r && _(e, s, r), r;
};
let i = class extends p {
  constructor() {
    super(...arguments), this._config = {};
  }
  setConfig(t) {
    const e = String(t.type ?? "").replace(/^custom:/, "");
    if (e && e !== "ha-reminders-card")
      throw new Error("Invalid card type");
    this._config = { ...t };
  }
  static getStubConfig() {
    return { type: "custom:ha-reminders-card" };
  }
  static getConfigElement() {
    return document.createElement("ha-reminders-card-editor");
  }
  getCardSize() {
    return 3;
  }
  render() {
    return this.hass ? c`
      <ha-card>
        <div class="header">
          <span class="title">${this._config.title ?? "Reminders"}</span>
          <ha-icon-button
            label="New reminder"
            @click=${() => this._list?.openNew()}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </ha-icon-button>
        </div>
        <ha-reminders-list .hass=${this.hass}></ha-reminders-list>
      </ha-card>
    ` : c``;
  }
};
i.styles = u`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 4px 8px;
    }
    .title {
      font-size: 18px;
      font-weight: 500;
    }
  `;
n([
  l({ attribute: !1 })
], i.prototype, "hass", 2);
n([
  m()
], i.prototype, "_config", 2);
n([
  f("ha-reminders-list")
], i.prototype, "_list", 2);
i = n([
  g("ha-reminders-card")
], i);
window.customCards = window.customCards ?? [];
window.customCards.some((t) => t.type === "ha-reminders-card") || window.customCards.push({
  type: "ha-reminders-card",
  name: "HA Reminders",
  description: "View, edit, snooze and complete your reminders."
});
class h extends p {
  constructor() {
    super(...arguments), this._config = {};
  }
  setConfig(e) {
    this._config = { ...e };
  }
  _valueChanged(e) {
    e.stopPropagation();
    const s = e.detail.value?.title ?? "";
    this._config = { ...this._config, title: s }, this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: this._config },
        bubbles: !0,
        composed: !0
      })
    );
  }
  render() {
    return c`
      <ha-form
        .hass=${this.hass}
        .data=${{ title: this._config.title ?? "" }}
        .schema=${[{ name: "title", selector: { text: {} } }]}
        .computeLabel=${() => "Card title"}
        @value-changed=${this._valueChanged}
      ></ha-form>
    `;
  }
}
n([
  l({ attribute: !1 })
], h.prototype, "hass", 2);
n([
  m()
], h.prototype, "_config", 2);
customElements.get("ha-reminders-card-editor") || customElements.define("ha-reminders-card-editor", h);
export {
  i as HaRemindersCard,
  h as HaRemindersCardEditor
};

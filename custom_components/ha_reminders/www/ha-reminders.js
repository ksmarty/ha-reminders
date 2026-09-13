import { i as p, n as l, r as h, e as m, a as u, b as c } from "./reminder-list-2fMCkJ5M.js";
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const f = (e) => (t, s) => {
  s !== void 0 ? s.addInitializer(() => {
    customElements.define(e, t);
  }) : customElements.define(e, t);
};
var w = Object.defineProperty, g = Object.getOwnPropertyDescriptor, a = (e, t, s, n) => {
  for (var r = n > 1 ? void 0 : n ? g(t, s) : t, o = e.length - 1, d; o >= 0; o--)
    (d = e[o]) && (r = (n ? d(t, s, r) : d(r)) || r);
  return n && r && w(t, s, r), r;
};
let i = class extends u {
  constructor() {
    super(...arguments), this._config = {};
  }
  setConfig(e) {
    const t = String(e.type ?? "").replace(/^custom:/, "");
    if (t && t !== "ha-reminders-card")
      throw new Error("Invalid card type");
    this._config = { ...e };
  }
  static getStubConfig() {
    return {};
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
i.styles = p`
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
a([
  l({ attribute: !1 })
], i.prototype, "hass", 2);
a([
  h()
], i.prototype, "_config", 2);
a([
  m("ha-reminders-list")
], i.prototype, "_list", 2);
i = a([
  f("ha-reminders-card")
], i);
window.customCards = window.customCards ?? [];
window.customCards.some((e) => e.type === "ha-reminders-card") || window.customCards.push({
  type: "ha-reminders-card",
  name: "HA Reminders",
  description: "View, edit, snooze and complete your reminders."
});
export {
  i as HaRemindersCard
};

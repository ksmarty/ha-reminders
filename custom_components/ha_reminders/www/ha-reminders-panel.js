import { a as h, i as c, b as l, n as i, e as b } from "./reminder-list-CMIfqYjb.js";
var u = Object.defineProperty, a = (r, o, d, m) => {
  for (var t = void 0, s = r.length - 1, p; s >= 0; s--)
    (p = r[s]) && (t = p(o, d, t) || t);
  return t && u(o, d, t), t;
};
const n = class n extends h {
  constructor() {
    super(...arguments), this.narrow = !1;
  }
  render() {
    return this.hass ? l`
      <div class="content">
        <div class="toolbar">
          <div class="heading">
            <ha-menu-button></ha-menu-button>
            <ha-icon icon="mdi:bell-ring-outline"></ha-icon>
            <span>Reminders</span>
          </div>
          <ha-button @click=${() => this._list?.openNew()}>
            <ha-icon icon="mdi:plus"></ha-icon>
            <span class="new-label">New reminder</span>
          </ha-button>
        </div>
        <div class="list">
          <ha-reminders-list .hass=${this.hass}></ha-reminders-list>
        </div>
      </div>
    ` : l``;
  }
};
n.styles = c`
    :host {
      display: block;
      padding: 16px;
      box-sizing: border-box;
      height: 100%;
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
    }
    .heading {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 22px;
      font-weight: 400;
      min-width: 0;
    }
    .heading span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    @media (max-width: 600px) {
      :host {
        padding: 12px 8px;
      }
      .heading {
        font-size: 18px;
      }
      .new-label {
        display: none;
      }
    }
    .content {
      max-width: 900px;
      margin: 0 auto;
    }
    .list {
      background: var(--card-background-color);
      border-radius: var(--ha-card-border-radius, 12px);
      box-shadow: var(--ha-card-box-shadow, none);
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      padding: 4px 12px;
    }
  `;
let e = n;
a([
  i({ attribute: !1 })
], e.prototype, "hass");
a([
  i({ type: Boolean })
], e.prototype, "narrow");
a([
  i({ attribute: !1 })
], e.prototype, "route");
a([
  i({ attribute: !1 })
], e.prototype, "panel");
a([
  b("ha-reminders-list")
], e.prototype, "_list");
customElements.get("ha-reminders-panel") || customElements.define("ha-reminders-panel", e);
export {
  e as HaRemindersPanel
};

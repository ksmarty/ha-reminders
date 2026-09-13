import { a as c, i as h, b as p, n as r, e as b } from "./reminder-list-DiXvDYwe.js";
var u = Object.defineProperty, i = (o, n, d, m) => {
  for (var t = void 0, a = o.length - 1, l; a >= 0; a--)
    (l = o[a]) && (t = l(n, d, t) || t);
  return t && u(n, d, t), t;
};
const s = class s extends c {
  constructor() {
    super(...arguments), this.narrow = !1;
  }
  render() {
    return this.hass ? p`
      <div class="content">
        <div class="toolbar">
          <div class="heading">
            <ha-icon icon="mdi:bell-ring-outline"></ha-icon>
            <span>Reminders</span>
          </div>
          <ha-button @click=${() => this._list?.openNew()}>
            <ha-icon icon="mdi:plus"></ha-icon>
            New reminder
          </ha-button>
        </div>
        <div class="list">
          <ha-reminders-list .hass=${this.hass}></ha-reminders-list>
        </div>
      </div>
    ` : p``;
  }
};
s.styles = h`
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
      gap: 16px;
      margin-bottom: 12px;
    }
    .heading {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 24px;
      font-weight: 400;
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
let e = s;
i([
  r({ attribute: !1 })
], e.prototype, "hass");
i([
  r({ type: Boolean })
], e.prototype, "narrow");
i([
  r({ attribute: !1 })
], e.prototype, "route");
i([
  r({ attribute: !1 })
], e.prototype, "panel");
i([
  b("ha-reminders-list")
], e.prototype, "_list");
customElements.get("ha-reminders-panel") || customElements.define("ha-reminders-panel", e);
export {
  e as HaRemindersPanel
};

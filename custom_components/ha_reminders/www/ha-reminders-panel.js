import { a as h, i as c, b as p, n as a, e as u } from "./reminder-list-CCXm0EC0.js";
var b = Object.defineProperty, t = (r, s, l, x) => {
  for (var i = void 0, o = r.length - 1, d; o >= 0; o--)
    (d = r[o]) && (i = d(s, l, i) || i);
  return i && b(s, l, i), i;
};
const n = class n extends h {
  constructor() {
    super(...arguments), this.narrow = !1;
  }
  render() {
    return this.hass ? p`
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
        <div class="scroll">
          <div class="list">
            <ha-reminders-list
              .hass=${this.hass}
              .grouped=${!0}
            ></ha-reminders-list>
          </div>
        </div>
      </div>
    ` : p``;
  }
};
n.styles = c`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      box-sizing: border-box;
    }
    .content {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      width: 100%;
      max-width: 900px;
      margin: 0 auto;
      padding: 16px;
      box-sizing: border-box;
    }
    /*
     * The header bar. It sits outside the scroll container, so it never moves;
     * sticky positioning (with an opaque background) is a fallback for the
     * case where HA hands the panel an auto height instead of a fixed one.
     */
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
      flex: 0 0 auto;
      position: sticky;
      top: 0;
      z-index: 1;
      background: var(--primary-background-color);
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
      .content {
        padding: 12px 8px;
      }
      .heading {
        font-size: 18px;
      }
      .new-label {
        display: none;
      }
    }
    /* Only the reminders scroll. */
    .scroll {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
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
t([
  a({ attribute: !1 })
], e.prototype, "hass");
t([
  a({ type: Boolean })
], e.prototype, "narrow");
t([
  a({ attribute: !1 })
], e.prototype, "route");
t([
  a({ attribute: !1 })
], e.prototype, "panel");
t([
  u("ha-reminders-list")
], e.prototype, "_list");
customElements.get("ha-reminders-panel") || customElements.define("ha-reminders-panel", e);
export {
  e as HaRemindersPanel
};

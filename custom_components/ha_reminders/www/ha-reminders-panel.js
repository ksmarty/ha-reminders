import { a as d, i as c, b as p, n as i, e as u } from "./reminder-list-BpA1l021.js";
var m = Object.defineProperty, a = (n, r, l, g) => {
  for (var t = void 0, o = n.length - 1, h; o >= 0; o--)
    (h = n[o]) && (t = h(r, l, t) || t);
  return t && m(r, l, t), t;
};
const s = class s extends d {
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
          <ha-reminders-list
            .hass=${this.hass}
            .grouped=${!0}
          ></ha-reminders-list>
        </div>
      </div>
    ` : p``;
  }
};
s.styles = c`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      box-sizing: border-box;
      overflow: hidden;
      background-color: var(--primary-background-color);
      /*
       * HA's panel container normally sizes us — hass-subpage relies on the
       * same height: 100% — but that does not hold everywhere, and without a
       * definite height the toolbar scrolls away with the reminders. Capping
       * the panel at the room below HA's header bar guarantees one either way.
       */
      max-height: calc(
        100vh - var(--header-height, 56px) - var(--safe-area-inset-top, 0px)
      );
      max-height: calc(
        100dvh - var(--header-height, 56px) - var(--safe-area-inset-top, 0px)
      );
    }
    /*
     * Narrow layouts are the case HA works around by pinning a full-page view
     * to the viewport (hass-subpage uses position: fixed here too): with auto
     * insets the panel keeps its place in the layout but stops scrolling with
     * the page, so its own reminders are the only thing that moves.
     */
    :host([narrow]) {
      position: fixed;
      width: 100%;
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
    /* The header bar: a flex row above the scroller, so it cannot move. */
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 12px;
      flex: 0 0 auto;
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
  `;
let e = s;
a([
  i({ attribute: !1 })
], e.prototype, "hass");
a([
  i({ type: Boolean, reflect: !0 })
], e.prototype, "narrow");
a([
  i({ attribute: !1 })
], e.prototype, "route");
a([
  i({ attribute: !1 })
], e.prototype, "panel");
a([
  u("ha-reminders-list")
], e.prototype, "_list");
customElements.get("ha-reminders-panel") || customElements.define("ha-reminders-panel", e);
export {
  e as HaRemindersPanel
};

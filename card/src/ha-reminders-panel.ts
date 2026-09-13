import { LitElement, css, html } from "lit";
import { property, query } from "lit/decorators.js";
import { ReminderList } from "./reminder-list";
import type { HomeAssistant } from "./types";
import "./reminder-list";

/**
 * Sidebar panel (like HACS / Browser Mod): a full-page reminder manager.
 *
 * Home Assistant loads the module and assigns `hass`, `narrow`, `route` and
 * `panel` onto the element, so every one of those must be a settable property.
 */
export class HaRemindersPanel extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;

  @property({ type: Boolean }) narrow = false;

  @property({ attribute: false }) route?: unknown;

  @property({ attribute: false }) panel?: unknown;

  @query("ha-reminders-list") private _list?: ReminderList;

  static styles = css`
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

  protected render() {
    if (!this.hass) return html``;
    return html`
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
    `;
  }
}

// Guarded: the card bundle may already have registered shared elements.
if (!customElements.get("ha-reminders-panel")) {
  customElements.define("ha-reminders-panel", HaRemindersPanel);
}
import { LitElement, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ReminderList } from "./reminder-list";
import type { CardConfig, HomeAssistant } from "./types";
import "./reminder-list";

/**
 * Lovelace card: a header plus the shared reminder list.
 *
 * Home Assistant passes the card config through with its `custom:` prefix
 * (`custom:ha-reminders-card`), so the type check must accept both forms.
 */
@customElement("ha-reminders-card")
export class HaRemindersCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;

  @state() private _config: CardConfig = {};

  @query("ha-reminders-list") private _list?: ReminderList;

  static styles = css`
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

  setConfig(config: CardConfig): void {
    const type = String(config.type ?? "").replace(/^custom:/, "");
    if (type && type !== "ha-reminders-card") {
      throw new Error("Invalid card type");
    }
    this._config = { ...config };
  }

  static getStubConfig(): Record<string, unknown> {
    return {};
  }

  getCardSize(): number {
    return 3;
  }

  protected render() {
    if (!this.hass) return html``;
    return html`
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
    `;
  }
}

declare global {
  interface Window {
    customCards?: { type: string; name: string; description?: string }[];
  }
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === "ha-reminders-card")) {
  window.customCards.push({
    type: "ha-reminders-card",
    name: "HA Reminders",
    description: "View, edit, snooze and complete your reminders.",
  });
}
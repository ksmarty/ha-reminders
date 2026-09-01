import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import {
  completeReminder,
  deleteReminder,
  setReminderEnabled,
  snoozeReminder,
} from "./api";
import type {
  CardConfig,
  HomeAssistant,
  Reminder,
  ReminderStatus,
} from "./types";
import "./reminder-editor";

const STATUS_LABELS: Record<ReminderStatus, string> = {
  scheduled: "Scheduled",
  active: "Active",
  snoozed: "Snoozed",
  completed: "Completed",
  disabled: "Disabled",
};

function statusOf(reminder: Reminder): ReminderStatus {
  return reminder.status ?? "scheduled";
}

function zoneName(entityId: string | null | undefined): string {
  if (!entityId) return "";
  return entityId.replace("zone.", "").replace(/_/g, " ");
}

function formatFireDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const sameDay =
    date.toDateString() === new Date().toDateString();
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    ...(sameDay ? {} : { weekday: "short" as const }),
    hour: "2-digit",
    minute: "2-digit",
  });
}

@customElement("ha-reminders-card")
export class HaRemindersCard extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;

  @state() private _config: CardConfig = {};

  @state() private _editorOpen = false;

  @state() private _editing: Reminder | null = null;

  @state() private _snoozeTarget: Reminder | null = null;

  @state() private _snoozeMinutes = 15;

  @state() private _deleteArmed: string | null = null;

  private _deleteTimer: number | undefined;

  static styles = css`
    .card {
      font-family: var(--primary-font-family, inherit);
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 8px;
    }
    .title {
      font-size: 18px;
      font-weight: 500;
    }
    .empty {
      color: var(--secondary-text-color);
      padding: 24px 0;
      text-align: center;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 4px;
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
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
    .new-btn {
      margin-top: 12px;
      width: 100%;
    }
    .snooze-quick {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 8px;
    }
  `;

  setConfig(config: CardConfig): void {
    if (!config.type || config.type !== "ha-reminders-card") {
      throw new Error("Invalid card type");
    }
    this._config = { ...config };
  }

  getCardSize(): number {
    return 3;
  }

  static getStubConfig(): Record<string, unknown> {
    return {};
  }

  private _reminders(): Reminder[] {
    if (!this.hass) return [];
    return Object.values(this.hass.states)
      .filter(
        (state) =>
          state.entity_id.startsWith("sensor.ha_reminder_") &&
          typeof state.attributes.reminder_id === "string",
      )
      .map((state) => state.attributes as unknown as Reminder)
      .sort((a, b) => {
        const rank: Record<ReminderStatus, number> = {
          active: 0,
          snoozed: 1,
          scheduled: 2,
          completed: 3,
          disabled: 4,
        };
        return (rank[statusOf(a)] ?? 9) - (rank[statusOf(b)] ?? 9);
      });
  }

  private _openNew(): void {
    this._editing = null;
    this._editorOpen = true;
  }

  private _openEdit(reminder: Reminder): void {
    this._editing = reminder;
    this._editorOpen = true;
  }

  private _openSnooze(reminder: Reminder): void {
    this._snoozeTarget = reminder;
    this._snoozeMinutes = 15;
  }

  private async _snooze(): Promise<void> {
    if (!this._snoozeTarget) return;
    await snoozeReminder(
      this.hass,
      this._snoozeTarget.id,
      this._snoozeMinutes,
    );
    this._snoozeTarget = null;
  }

  private async _complete(reminder: Reminder): Promise<void> {
    await completeReminder(this.hass, reminder.id);
  }

  private async _toggleEnabled(reminder: Reminder, enabled: boolean): Promise<void> {
    await setReminderEnabled(this.hass, reminder.id, enabled);
  }

  private _armDelete(reminder: Reminder): void {
    if (this._deleteArmed === reminder.id) {
      this._deleteArmed = null;
      if (this._deleteTimer !== undefined) {
        window.clearTimeout(this._deleteTimer);
        this._deleteTimer = undefined;
      }
      void deleteReminder(this.hass, reminder.id);
      return;
    }
    this._deleteArmed = reminder.id;
    if (this._deleteTimer !== undefined) {
      window.clearTimeout(this._deleteTimer);
    }
    this._deleteTimer = window.setTimeout(() => {
      this._deleteArmed = null;
      this._deleteTimer = undefined;
    }, 3000);
  }

  private _triggerText(reminder: Reminder): string {
    if (reminder.trigger_type === "zone_enter") {
      return `When you enter ${zoneName(reminder.zone_entity_id)}`;
    }
    if (reminder.trigger_type === "zone_leave") {
      return `When you leave ${zoneName(reminder.zone_entity_id)}`;
    }
    return formatFireDate(reminder.next_fire) || "Scheduled";
  }

  private _statusChip(reminder: Reminder) {
    const status = statusOf(reminder);
    if (status === "disabled") return nothing;
    return html`<span class="chip ${status}">${STATUS_LABELS[status]}</span>`;
  }

  protected render() {
    if (!this.hass) return nothing;
    const reminders = this._reminders();
    const title = this._config.title ?? "Reminders";

    return html`
      <ha-card class="card">
        <div class="header">
          <span class="title">${title}</span>
          <ha-icon-button
            label="New reminder"
            @click=${this._openNew}
          >
            <ha-icon icon="mdi:plus"></ha-icon>
          </ha-icon-button>
        </div>

        ${reminders.length === 0
          ? html`<div class="empty">No reminders yet — add one with +</div>`
          : reminders.map(
              (reminder) => html`
                <div class="row">
                  <ha-icon
                    icon=${reminder.trigger_type === "time"
                      ? "mdi:clock-outline"
                      : reminder.trigger_type === "zone_enter"
                        ? "mdi:home-import-outline"
                        : "mdi:home-export-outline"}
                  ></ha-icon>
                  <div class="row-text">
                    <div class="row-title">${reminder.title}</div>
                    <div class="row-sub">
                      ${this._triggerText(reminder)}
                      ${reminder.notified_count
                        ? html` · notified ${reminder.notified_count}
                            ×`
                        : ""}
                    </div>
                  </div>
                  ${this._statusChip(reminder)}
                  <div class="actions">
                    ${statusOf(reminder) === "disabled"
                      ? nothing
                      : html`
                          <ha-icon-button
                            label="Complete"
                            @click=${() => this._complete(reminder)}
                          >
                            <ha-icon icon="mdi:check"></ha-icon>
                          </ha-icon-button>
                          <ha-icon-button
                            label="Snooze"
                            @click=${() => this._openSnooze(reminder)}
                          >
                            <ha-icon icon="mdi:clock-outline"></ha-icon>
                          </ha-icon-button>
                        `}
                    <ha-icon-button
                      label="Edit"
                      @click=${() => this._openEdit(reminder)}
                    >
                      <ha-icon icon="mdi:pencil"></ha-icon>
                    </ha-icon-button>
                    <ha-icon-button
                      class="danger"
                      label=${this._deleteArmed === reminder.id
                        ? "Confirm delete"
                        : "Delete"}
                      @click=${() => this._armDelete(reminder)}
                    >
                      <ha-icon
                        icon=${this._deleteArmed === reminder.id
                          ? "mdi:check"
                          : "mdi:delete"}
                      ></ha-icon>
                    </ha-icon-button>
                  </div>
                  <ha-switch
                    .checked=${reminder.enabled}
                    @change=${(ev: Event) =>
                      this._toggleEnabled(
                        reminder,
                        (ev.target as HTMLInputElement).checked,
                      )}
                  ></ha-switch>
                </div>
              `,
            )}
      </ha-card>

      <ha-reminders-editor
        .hass=${this.hass}
        .reminder=${this._editing}
        .open=${this._editorOpen}
        @saved=${() => (this._editorOpen = false)}
        @closed=${() => (this._editorOpen = false)}
      ></ha-reminders-editor>

      <ha-dialog
        open=${this._snoozeTarget !== null}
        .heading=${this._snoozeTarget
          ? `Snooze "${this._snoozeTarget.title}"`
          : ""}
        @closed=${() => (this._snoozeTarget = null)}
      >
        <ha-textfield
          label="Minutes"
          type="number"
          min="1"
          .value=${String(this._snoozeMinutes)}
          @input=${(ev: Event) =>
            (this._snoozeMinutes = parseInt(
              (ev.target as HTMLInputElement).value,
              10,
            ) || 15)}
        ></ha-textfield>
        <div class="snooze-quick">
          ${[5, 15, 30, 60].map(
            (minutes) => html`
              <mwc-button
                outlined
                @click=${() => (this._snoozeMinutes = minutes)}
                >${minutes} min</mwc-button
              >
            `,
          )}
        </div>
        <mwc-button slot="primaryAction" @click=${this._snooze}
          >Snooze</mwc-button
        >
        <mwc-button
          slot="secondaryAction"
          @click=${() => (this._snoozeTarget = null)}
          >Cancel</mwc-button
        >
      </ha-dialog>
    `;
  }
}

declare global {
  interface Window {
    customCards?: { type: string; name: string; description?: string }[];
  }
}

window.customCards = window.customCards ?? [];
window.customCards.push({
  type: "ha-reminders-card",
  name: "HA Reminders",
  description: "View, edit, snooze and complete your reminders.",
});
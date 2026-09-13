import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import {
  completeReminder,
  deleteReminder,
  setReminderEnabled,
  snoozeReminder,
} from "./api";
import type { HomeAssistant, Reminder, ReminderStatus } from "./types";
import "./reminder-editor";

/**
 * Reminder list with per-row actions, shared by the Lovelace card and the
 * sidebar panel. Scans the integration's sensor entities, which carry the
 * `reminder_id` attribute and the full payload, so it re-renders on any state
 * change without its own data fetching.
 */

const STATUS_LABELS: Record<ReminderStatus, string> = {
  scheduled: "Scheduled",
  active: "Active",
  snoozed: "Snoozed",
  completed: "Completed",
  disabled: "Disabled",
};

const STATUS_ORDER: Record<ReminderStatus, number> = {
  active: 0,
  snoozed: 1,
  scheduled: 2,
  completed: 3,
  disabled: 4,
};

export function statusOf(reminder: Reminder): ReminderStatus {
  return reminder.status ?? "scheduled";
}

export function zoneName(entityId: string | null | undefined): string {
  if (!entityId) return "";
  return entityId
    .replace("zone.", "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatFireDate(iso: string | null | undefined): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const sameDay = date.toDateString() === new Date().toDateString();
  return date.toLocaleString(undefined, {
    ...(sameDay ? {} : { weekday: "short", month: "short", day: "numeric" }),
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function triggerText(reminder: Reminder): string {
  if (reminder.trigger_type === "zone_enter") {
    return `When you enter ${zoneName(reminder.zone_entity_id)}`;
  }
  if (reminder.trigger_type === "zone_leave") {
    return `When you leave ${zoneName(reminder.zone_entity_id)}`;
  }
  const at = formatFireDate(reminder.next_fire);
  const every = (reminder.every_x_days ?? 1) > 1 ? ` (every ${reminder.every_x_days} days)` : "";
  return `${at || "Scheduled"}${every}`;
}

export function collectReminders(hass: HomeAssistant | undefined): Reminder[] {
  if (!hass) return [];
  return Object.values(hass.states)
    .filter((state) => typeof state.attributes.reminder_id === "string")
    .map((state) => state.attributes as unknown as Reminder)
    .sort((a, b) => {
      const byStatus = (STATUS_ORDER[statusOf(a)] ?? 9) - (STATUS_ORDER[statusOf(b)] ?? 9);
      return byStatus !== 0 ? byStatus : a.title.localeCompare(b.title);
    });
}

export class ReminderList extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;

  @state() private _editorOpen = false;

  @state() private _editing: Reminder | null = null;

  @state() private _snoozeTarget: Reminder | null = null;

  @state() private _snoozeMinutes = 15;

  @state() private _deleteArmed: string | null = null;

  private _deleteTimer: number | undefined;

  static styles = css`
    :host {
      display: block;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 4px;
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }
    .row:last-of-type {
      border-bottom: none;
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

  public openNew(): void {
    this._editing = null;
    this._editorOpen = true;
  }

  public openEdit(reminder: Reminder): void {
    this._editing = reminder;
    this._editorOpen = true;
  }

  private async _complete(reminder: Reminder): Promise<void> {
    await completeReminder(this.hass, reminder.id);
  }

  private async _toggleEnabled(reminder: Reminder, enabled: boolean): Promise<void> {
    await setReminderEnabled(this.hass, reminder.id, enabled);
  }

  private async _snooze(): Promise<void> {
    if (!this._snoozeTarget) return;
    await snoozeReminder(this.hass, this._snoozeTarget.id, this._snoozeMinutes);
    this._snoozeTarget = null;
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

  protected render() {
    const reminders = collectReminders(this.hass);

    return html`
      ${reminders.length === 0
        ? html`<div class="empty">No reminders yet — use “New reminder”.</div>`
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
                  <div class="row-sub">${triggerText(reminder)}</div>
                </div>
                ${statusOf(reminder) === "disabled"
                  ? nothing
                  : html`<span class="chip ${statusOf(reminder)}"
                      >${STATUS_LABELS[statusOf(reminder)]}</span
                    >`}
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
                          @click=${() => {
                            this._snoozeTarget = reminder;
                            this._snoozeMinutes = 15;
                          }}
                        >
                          <ha-icon icon="mdi:clock-outline"></ha-icon>
                        </ha-icon-button>
                      `}
                  <ha-icon-button
                    label="Edit"
                    @click=${() => this.openEdit(reminder)}
                  >
                    <ha-icon icon="mdi:pencil"></ha-icon>
                  </ha-icon-button>
                  <ha-icon-button
                    class="danger"
                    label=${this._deleteArmed === reminder.id ? "Confirm delete" : "Delete"}
                    @click=${() => this._armDelete(reminder)}
                  >
                    <ha-icon
                      icon=${this._deleteArmed === reminder.id ? "mdi:check" : "mdi:delete"}
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

      <ha-reminders-editor
        .hass=${this.hass}
        .reminder=${this._editing}
        .open=${this._editorOpen}
        @saved=${() => (this._editorOpen = false)}
        @closed=${() => (this._editorOpen = false)}
      ></ha-reminders-editor>

      <ha-dialog
        .open=${this._snoozeTarget !== null}
        .heading=${this._snoozeTarget ? `Snooze "${this._snoozeTarget.title}"` : ""}
        @closed=${() => (this._snoozeTarget = null)}
      >
        <ha-selector
          .hass=${this.hass}
          .selector=${{ number: { min: 1, mode: "box" } }}
          .label=${"Minutes"}
          .value=${this._snoozeMinutes}
          @value-changed=${(ev: CustomEvent) => {
            ev.stopPropagation();
            this._snoozeMinutes = Number(ev.detail.value) || 15;
          }}
        ></ha-selector>
        <div class="snooze-quick">
          ${[5, 15, 30, 60].map(
            (minutes) => html`
              <ha-button @click=${() => (this._snoozeMinutes = minutes)}
                >${minutes} min</ha-button
              >
            `,
          )}
        </div>
        <ha-button slot="primaryAction" @click=${this._snooze}>Snooze</ha-button>
        <ha-button slot="secondaryAction" @click=${() => (this._snoozeTarget = null)}
          >Cancel</ha-button
        >
      </ha-dialog>
    `;
  }
}

// Guarded: the card and panel bundles can both be present on one page.
if (!customElements.get("ha-reminders-list")) {
  customElements.define("ha-reminders-list", ReminderList);
}
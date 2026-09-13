import {
  mdiBellOffOutline,
  mdiBellOutline,
  mdiCheck,
  mdiClockOutline,
  mdiDelete,
  mdiPencil,
} from "@mdi/js";
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
 * sidebar panel. Reminders are discovered by the `reminder_id` attribute the
 * integration puts on every sensor, so the UI does not depend on entity-id
 * naming.
 *
 * Rows are compact: the text block carries a snippet of the reminder plus its
 * trigger, and every action lives behind the overflow menu (a kebab menu that
 * never overflows the row) instead of a row of icon buttons and a switch.
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

export interface MenuItem {
  label: string;
  path: string;
  action: () => void;
  warning?: boolean;
}

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

/** Secondary line: the reminder's own text, falling back to its subtitle. */
export function snippetOf(reminder: Reminder): string {
  const message = (reminder.message ?? "").trim();
  if (message && message !== (reminder.title ?? "").trim()) return message;
  return (reminder.subtitle ?? "").trim();
}

export function triggerText(reminder: Reminder): string {
  if (reminder.trigger_type === "zone_enter") {
    return `When you enter ${zoneName(reminder.zone_entity_id)}`;
  }
  if (reminder.trigger_type === "zone_leave") {
    return `When you leave ${zoneName(reminder.zone_entity_id)}`;
  }
  const at = formatFireDate(reminder.next_fire);
  const every =
    (reminder.every_x_days ?? 1) > 1
      ? ` · every ${reminder.every_x_days} days`
      : "";
  return `${at || "Scheduled"}${every}`;
}

export function collectReminders(hass: HomeAssistant | undefined): Reminder[] {
  if (!hass) return [];
  return Object.values(hass.states)
    .filter((state) => typeof state.attributes.reminder_id === "string")
    .map((state) => state.attributes as unknown as Reminder)
    .sort((a, b) => {
      const byStatus =
        (STATUS_ORDER[statusOf(a)] ?? 9) - (STATUS_ORDER[statusOf(b)] ?? 9);
      return byStatus !== 0
        ? byStatus
        : String(a.title ?? "").localeCompare(String(b.title ?? ""));
    });
}

/** Actions offered for a row, in menu order. */
export function menuItemsFor(
  reminder: Reminder,
  handlers: {
    complete: () => void;
    snooze: () => void;
    toggleEnabled: () => void;
    edit: () => void;
    remove: () => void;
  },
): MenuItem[] {
  const status = statusOf(reminder);
  const items: MenuItem[] = [];

  if (status !== "disabled" && status !== "completed") {
    items.push({ label: "Mark done", path: mdiCheck, action: handlers.complete });
    items.push({ label: "Snooze", path: mdiClockOutline, action: handlers.snooze });
  }
  items.push({
    label: reminder.enabled ? "Disable" : "Enable",
    path: reminder.enabled ? mdiBellOffOutline : mdiBellOutline,
    action: handlers.toggleEnabled,
  });
  items.push({ label: "Edit", path: mdiPencil, action: handlers.edit });
  items.push({
    label: "Delete",
    path: mdiDelete,
    action: handlers.remove,
    warning: true,
  });
  return items;
}

export class ReminderList extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;

  @state() private _editorOpen = false;

  @state() private _editing: Reminder | null = null;

  @state() private _snoozeTarget: Reminder | null = null;

  @state() private _snoozeMinutes = 15;

  @state() private _deleteTarget: Reminder | null = null;

  static styles = css`
    :host {
      display: block;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 0;
      border-bottom: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
    }
    .row:last-of-type {
      border-bottom: none;
    }
    .row-text {
      flex: 1;
      min-width: 0;
      cursor: pointer;
    }
    .row-title {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .row-snippet {
      color: var(--secondary-text-color);
      font-size: 13px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .row-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 2px;
      min-width: 0;
    }
    .row-trigger {
      color: var(--secondary-text-color);
      font-size: 12px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .chip {
      font-size: 10px;
      line-height: 1;
      padding: 3px 7px;
      border-radius: 9px;
      white-space: nowrap;
      background: var(--secondary-background-color);
      color: var(--secondary-text-color);
      text-transform: uppercase;
      letter-spacing: 0.03em;
      flex-shrink: 0;
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
      opacity: 0.7;
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

  private async _toggleEnabled(reminder: Reminder): Promise<void> {
    await setReminderEnabled(this.hass, reminder.id, !reminder.enabled);
  }

  private async _snooze(): Promise<void> {
    if (!this._snoozeTarget) return;
    await snoozeReminder(this.hass, this._snoozeTarget.id, this._snoozeMinutes);
    this._snoozeTarget = null;
  }

  private async _delete(): Promise<void> {
    if (!this._deleteTarget) return;
    await deleteReminder(this.hass, this._deleteTarget.id);
    this._deleteTarget = null;
  }

  private _itemsFor(reminder: Reminder): MenuItem[] {
    return menuItemsFor(reminder, {
      complete: () => void this._complete(reminder),
      snooze: () => {
        this._snoozeTarget = reminder;
        this._snoozeMinutes = 15;
      },
      toggleEnabled: () => void this._toggleEnabled(reminder),
      edit: () => this.openEdit(reminder),
      remove: () => {
        this._deleteTarget = reminder;
      },
    });
  }

  protected render() {
    const reminders = collectReminders(this.hass);

    return html`
      ${reminders.length === 0
        ? html`<div class="empty">No reminders yet — use “New reminder”.</div>`
        : reminders.map((reminder) => {
            const snippet = snippetOf(reminder);
            return html`
              <div class="row">
                <ha-icon
                  icon=${reminder.trigger_type === "time"
                    ? "mdi:clock-outline"
                    : reminder.trigger_type === "zone_enter"
                      ? "mdi:home-import-outline"
                      : "mdi:home-export-outline"}
                ></ha-icon>
                <div class="row-text" @click=${() => this.openEdit(reminder)}>
                  <div class="row-title">${reminder.title}</div>
                  ${snippet
                    ? html`<div class="row-snippet">${snippet}</div>`
                    : nothing}
                  <div class="row-meta">
                    <span class="chip ${statusOf(reminder)}"
                      >${STATUS_LABELS[statusOf(reminder)]}</span
                    >
                    <span class="row-trigger">${triggerText(reminder)}</span>
                  </div>
                </div>
                <ha-icon-overflow-menu
                  .narrow=${true}
                  .items=${this._itemsFor(reminder)}
                ></ha-icon-overflow-menu>
              </div>
            `;
          })}

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
        <ha-dialog-footer slot="footer">
          <ha-button
            slot="secondaryAction"
            @click=${() => (this._snoozeTarget = null)}
            >Cancel</ha-button
          >
          <ha-button slot="primaryAction" @click=${this._snooze}>Snooze</ha-button>
        </ha-dialog-footer>
      </ha-dialog>

      <ha-dialog
        .open=${this._deleteTarget !== null}
        .heading=${"Delete reminder"}
        @closed=${() => (this._deleteTarget = null)}
      >
        Delete “${this._deleteTarget?.title ?? ""}”?
        <ha-dialog-footer slot="footer">
          <ha-button
            slot="secondaryAction"
            @click=${() => (this._deleteTarget = null)}
            >Cancel</ha-button
          >
          <ha-button slot="primaryAction" @click=${this._delete}>Delete</ha-button>
        </ha-dialog-footer>
      </ha-dialog>
    `;
  }
}

// Guarded: the card and panel bundles can both be present on one page.
if (!customElements.get("ha-reminders-list")) {
  customElements.define("ha-reminders-list", ReminderList);
}
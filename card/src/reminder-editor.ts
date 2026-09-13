import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { createReminder, updateReminder } from "./api";
import type { HomeAssistant, Reminder, TriggerType } from "./types";

/**
 * Editor dialog for creating/updating a reminder.
 *
 * Fields are rendered with `ha-form` (Home Assistant's own form renderer,
 * driven by selectors) so the inputs always match the current frontend
 * elements — earlier versions of this card used `ha-textfield`, which the
 * frontend has since removed, leaving the editor blank.
 */

interface Field {
  name: string;
  selector: Record<string, unknown>;
  required?: boolean;
  default?: unknown;
}

const WEEKDAYS = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" },
];

const LABELS: Record<string, string> = {
  title: "Title",
  subtitle: "Subtitle",
  message: "Message",
  notify_service: "Notification service",
  user_name: "User name (who the reminder is for)",
  trigger_type: "Trigger",
  one_shot: "Only once",
  time: "Time",
  every_x_days: "Repeat every N days",
  start_date: "Start date",
  stop_date: "Stop date",
  exclude_days_of_week: "Exclude these days",
  zone_entity_id: "Zone",
  person_entity_ids: "Watch these persons",
  time_window_start: "Only fire from",
  time_window_end: "Only fire until",
  acknowledge_action_title: "Acknowledge action title",
  snooze_delays: "Snooze delays (minutes, comma separated)",
  snooze_text: "Snooze action text",
  wait_time_if_no_action: "Resend after (minutes)",
  notification_count: "Maximum notifications",
  color: "Color (Android)",
  channel: "Channel (Android)",
  channel_importance: "Channel importance",
  notification_group: "Notification group",
  acknowledge_notification_title: "Completion title (group)",
  acknowledge_notification_body: "Completion message (group)",
};

type FormData = Record<string, unknown>;

export class ReminderEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;

  @property({ attribute: false }) reminder: Reminder | null = null;

  @property({ type: Boolean }) open = false;

  @state() private _data: FormData = {};

  @state() private _saving = false;

  @state() private _error = "";

  @state() private _notifyServices: string[] = [];

  static styles = css`
    .editor {
      display: block;
      min-width: min(560px, 80vw);
    }
    .error {
      color: var(--error-color, #db4437);
      padding: 8px 0 0;
    }
  `;

  protected willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("open") && this.open) {
      this._data = this._dataFrom(this.reminder);
      this._error = "";
      this._saving = false;
      void this._loadNotifyServices();
    }
  }

  private _time(value: string | null | undefined): string {
    if (!value) return "";
    return value.length === 5 ? `${value}:00` : value;
  }

  private _dataFrom(reminder: Reminder | null): FormData {
    return {
      title: reminder?.title ?? "",
      subtitle: reminder?.subtitle ?? "",
      message: reminder?.message ?? "",
      notify_service: reminder?.notify_service ?? "",
      user_name: reminder?.user_name ?? "",
      trigger_type: reminder?.trigger_type ?? "time",
      one_shot: reminder?.one_shot ?? false,
      time: this._time(reminder?.time),
      every_x_days: reminder?.every_x_days ?? 1,
      start_date: reminder?.start_date ?? "",
      stop_date: reminder?.stop_date ?? "",
      exclude_days_of_week: (reminder?.exclude_days_of_week ?? []).map(String),
      zone_entity_id: reminder?.zone_entity_id ?? "",
      person_entity_ids: reminder?.person_entity_ids ?? [],
      time_window_start: this._time(reminder?.time_window_start),
      time_window_end: this._time(reminder?.time_window_end),
      acknowledge_action_title: reminder?.acknowledge_action_title ?? "Mark as done",
      snooze_delays: (reminder?.snooze_delays ?? [5, 15, 30, 45, 60]).join(","),
      snooze_text: reminder?.snooze_text ?? "Snooze for ${time}",
      wait_time_if_no_action: reminder?.wait_time_if_no_action ?? 15,
      notification_count: reminder?.notification_count ?? 1,
      color: reminder?.color ?? "",
      channel: reminder?.channel ?? "",
      channel_importance: reminder?.channel_importance ?? "",
      notification_group: reminder?.notification_group ?? "",
      acknowledge_notification_title:
        reminder?.acknowledge_notification_title ??
        "Someone acknowledged the notification",
      acknowledge_notification_body: reminder?.acknowledge_notification_body ?? "",
    };
  }

  private async _loadNotifyServices(): Promise<void> {
    try {
      const services = await this.hass.callWS({ type: "get_services" });
      const generic = new Set(["notify", "persistent_notification", "send_message"]);
      const targets = new Set<string>();
      Object.keys(services).forEach((domain) => {
        if (domain === "notify") {
          Object.keys(services[domain] ?? {}).forEach((name) => {
            if (!generic.has(name)) {
              targets.add(`notify.${name}`);
            }
          });
        } else if (services[domain]?.notify) {
          targets.add(domain);
        }
      });
      this._notifyServices = [...targets].sort();
    } catch {
      this._notifyServices = [];
    }
  }

  private _notifyField(): Field {
    const current = String(this._data.notify_service ?? "");
    const options = [...new Set([...this._notifyServices, current])]
      .filter(Boolean)
      .map((value) => ({ value, label: value }));
    return {
      name: "notify_service",
      selector: { select: { mode: "dropdown", custom_value: true, options } },
    };
  }

  private _schema(): Field[] {
    const trigger = (this._data.trigger_type as TriggerType) ?? "time";
    const isZone = trigger !== "time";

    const common: Field[] = [
      { name: "title", selector: { text: {} }, required: true },
      { name: "message", selector: { text: { multiline: true } }, required: true },
      { name: "subtitle", selector: { text: {} } },
      this._notifyField(),
      { name: "user_name", selector: { text: {} } },
      {
        name: "trigger_type",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "time", label: "At a fixed time" },
              { value: "zone_enter", label: "When I enter a zone" },
              { value: "zone_leave", label: "When I leave a zone" },
            ],
          },
        },
      },
      { name: "one_shot", selector: { boolean: {} } },
    ];

    const triggerFields: Field[] = isZone
      ? [
          { name: "zone_entity_id", selector: { entity: { domain: "zone" } } },
          {
            name: "person_entity_ids",
            selector: { entity: { domain: "person", multiple: true } },
          },
          { name: "time_window_start", selector: { time: {} } },
          { name: "time_window_end", selector: { time: {} } },
          { name: "start_date", selector: { date: {} } },
          { name: "stop_date", selector: { date: {} } },
          { name: "exclude_days_of_week", selector: { select: { multiple: true, options: WEEKDAYS } } },
        ]
      : [
          { name: "time", selector: { time: {} } },
          { name: "every_x_days", selector: { number: { min: 1, mode: "box" } } },
          { name: "start_date", selector: { date: {} } },
          { name: "stop_date", selector: { date: {} } },
          { name: "exclude_days_of_week", selector: { select: { multiple: true, options: WEEKDAYS } } },
        ];

    const notification: Field[] = [
      { name: "acknowledge_action_title", selector: { text: {} } },
      { name: "snooze_delays", selector: { text: {} } },
      { name: "snooze_text", selector: { text: {} } },
      { name: "wait_time_if_no_action", selector: { number: { min: 1, mode: "box" } } },
      { name: "notification_count", selector: { number: { min: 1, mode: "box" } } },
      {
        name: "channel_importance",
        selector: {
          select: {
            mode: "dropdown",
            options: [
              { value: "", label: "Default" },
              { value: "min", label: "Min" },
              { value: "low", label: "Low" },
              { value: "high", label: "High" },
              { value: "max", label: "Max" },
            ],
          },
        },
      },
      { name: "channel", selector: { text: {} } },
      { name: "color", selector: { text: {} } },
      { name: "notification_group", selector: { text: {} } },
      { name: "acknowledge_notification_title", selector: { text: {} } },
      { name: "acknowledge_notification_body", selector: { text: { multiline: true } } },
    ];

    return [...common, ...triggerFields, ...notification];
  }

  private _valueChanged(ev: CustomEvent): void {
    ev.stopPropagation();
    this._data = { ...ev.detail.value };
  }

  private _validationError(): string {
    const d = this._data;
    if (!String(d.title ?? "").trim()) return "A title is required.";
    if (!String(d.message ?? "").trim()) return "A message is required.";
    if (d.trigger_type === "time") {
      if (!d.time) return "Pick a time for the reminder.";
    } else {
      if (!d.zone_entity_id) return "Pick a zone to watch.";
      if (!(d.person_entity_ids as string[] | undefined)?.length) {
        return "Pick at least one person to watch.";
      }
    }
    return "";
  }

  private _orUndefined(value: unknown): unknown {
    if (value === "" || value === null) return undefined;
    if (Array.isArray(value) && value.length === 0) return undefined;
    return value;
  }

  private async _save(): Promise<void> {
    if (this._saving) return;
    const problem = this._validationError();
    if (problem) {
      this._error = problem;
      return;
    }

    this._saving = true;
    this._error = "";
    const d = this._data;

    const payload: Record<string, unknown> = {
      title: String(d.title).trim(),
      message: String(d.message).trim(),
      subtitle: this._orUndefined(d.subtitle),
      notify_service: this._orUndefined(d.notify_service),
      user_name: this._orUndefined(d.user_name),
      trigger_type: d.trigger_type ?? "time",
      one_shot: Boolean(d.one_shot),
      time: this._orUndefined(d.time),
      every_x_days: d.every_x_days ?? 1,
      start_date: this._orUndefined(d.start_date),
      stop_date: this._orUndefined(d.stop_date),
      exclude_days_of_week: d.exclude_days_of_week ?? [],
      zone_entity_id: this._orUndefined(d.zone_entity_id),
      person_entity_ids: d.person_entity_ids ?? [],
      time_window_start: this._orUndefined(d.time_window_start),
      time_window_end: this._orUndefined(d.time_window_end),
      acknowledge_action_title: this._orUndefined(d.acknowledge_action_title),
      snooze_delays: String(d.snooze_delays ?? "")
        .split(",")
        .map((part) => parseInt(part.trim(), 10))
        .filter((value) => !Number.isNaN(value) && value > 0),
      snooze_text: this._orUndefined(d.snooze_text),
      wait_time_if_no_action: d.wait_time_if_no_action,
      notification_count: d.notification_count,
      color: this._orUndefined(d.color),
      channel: this._orUndefined(d.channel),
      channel_importance: this._orUndefined(d.channel_importance),
      notification_group: this._orUndefined(d.notification_group),
      acknowledge_notification_title: this._orUndefined(
        d.acknowledge_notification_title,
      ),
      acknowledge_notification_body: this._orUndefined(
        d.acknowledge_notification_body,
      ),
    };

    try {
      if (this.reminder) {
        await updateReminder(this.hass, this.reminder.id, payload);
      } else {
        await createReminder(this.hass, payload);
      }
      this.dispatchEvent(new CustomEvent("saved"));
      this.open = false;
    } catch (err) {
      this._error =
        err instanceof Error ? err.message : "Failed to save the reminder.";
    } finally {
      this._saving = false;
    }
  }

  protected render() {
    return html`
      <ha-dialog
        .open=${this.open}
        .heading=${this.reminder ? "Edit reminder" : "New reminder"}
        @closed=${() => {
          this.open = false;
          this.dispatchEvent(new CustomEvent("closed"));
        }}
      >
        <div class="editor">
          <ha-form
            .hass=${this.hass}
            .data=${this._data}
            .schema=${this._schema()}
            .computeLabel=${(schema: Field) =>
              LABELS[schema.name] ?? schema.name}
            @value-changed=${this._valueChanged}
          ></ha-form>
          ${this._error ? html`<div class="error">${this._error}</div>` : nothing}
        </div>

        <ha-button
          slot="primaryAction"
          .disabled=${this._saving}
          @click=${this._save}
        >
          ${this.reminder ? "Save" : "Create"}
        </ha-button>
        <ha-button slot="secondaryAction" @click=${() => (this.open = false)}>
          Cancel
        </ha-button>
      </ha-dialog>
    `;
  }
}

// Guarded: the card and panel bundles can both be present on one page.
if (!customElements.get("ha-reminders-editor")) {
  customElements.define("ha-reminders-editor", ReminderEditor);
}

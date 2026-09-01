import { LitElement, PropertyValues, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { createReminder, updateReminder } from "./api";
import type { HassEntity, HomeAssistant, Reminder, TriggerType } from "./types";

const WEEKDAYS = [
  { value: 0, label: "Mon" },
  { value: 1, label: "Tue" },
  { value: 2, label: "Wed" },
  { value: 3, label: "Thu" },
  { value: 4, label: "Fri" },
  { value: 5, label: "Sat" },
  { value: 6, label: "Sun" },
];

interface Draft extends Record<string, unknown> {
  title: string;
  subtitle: string;
  message: string;
  notify_service: string;
  user_name: string;
  trigger_type: TriggerType;
  start_date: string;
  stop_date: string;
  time: string;
  every_x_days: number;
  exclude_days_of_week: number[];
  zone_entity_id: string;
  person_entity_ids: string[];
  time_window_start: string;
  time_window_end: string;
  acknowledge_action_title: string;
  snooze_delays: string;
  snooze_text: string;
  wait_time_if_no_action: number;
  notification_count: number;
  color: string;
  channel: string;
  channel_importance: string;
  notification_group: string;
  one_shot: boolean;
}

@customElement("ha-reminders-editor")
export class ReminderEditor extends LitElement {
  @property({ attribute: false }) hass!: HomeAssistant;

  @property({ attribute: false }) reminder: Reminder | null = null;

  @property({ type: Boolean }) open = false;

  @state() private _draft: Draft | null = null;

  @state() private _saving = false;

  @state() private _error = "";

  @state() private _notifyServices: string[] = [];

  static styles = css`
    .editor {
      max-width: 560px;
    }
    .row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }
    .row > * {
      flex: 1 1 160px;
      min-width: 140px;
    }
    .full {
      flex-basis: 100%;
    }
    .days {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
      align-items: center;
      padding-top: 8px;
    }
    .error {
      color: var(--error-color, #db4437);
      padding: 8px 0;
    }
    .section {
      color: var(--secondary-text-color);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 16px 0 4px;
    }
  `;

  protected willUpdate(changed: PropertyValues): void {
    if (changed.has("open") && this.open) {
      this._draft = this._draftFrom(this.reminder);
      this._error = "";
      this._saving = false;
      void this._loadNotifyServices();
    }
  }

  private async _loadNotifyServices(): Promise<void> {
    try {
      const services = await this.hass.callWS({ type: "get_services" });
      const domains = Object.keys(services).filter(
        (domain) => services[domain]?.notify,
      );
      this._notifyServices = domains.sort();
    } catch {
      this._notifyServices = [];
    }
  }

  private _draftFrom(reminder: Reminder | null): Draft {
    return {
      title: reminder?.title ?? "",
      subtitle: reminder?.subtitle ?? "",
      message: reminder?.message ?? "",
      notify_service: reminder?.notify_service ?? "",
      user_name: reminder?.user_name ?? "",
      trigger_type: reminder?.trigger_type ?? "time",
      start_date: reminder?.start_date ?? "",
      stop_date: reminder?.stop_date ?? "",
      time: reminder?.time ?? "",
      every_x_days: reminder?.every_x_days ?? 1,
      exclude_days_of_week: reminder?.exclude_days_of_week ?? [],
      zone_entity_id: reminder?.zone_entity_id ?? "",
      person_entity_ids: reminder?.person_entity_ids ?? [],
      time_window_start: reminder?.time_window_start ?? "",
      time_window_end: reminder?.time_window_end ?? "",
      acknowledge_action_title:
        reminder?.acknowledge_action_title ?? "Mark as done",
      snooze_delays: (reminder?.snooze_delays ?? [5, 15, 30, 45, 60]).join(","),
      snooze_text: reminder?.snooze_text ?? "Snooze for ${time}",
      wait_time_if_no_action: reminder?.wait_time_if_no_action ?? 15,
      notification_count: reminder?.notification_count ?? 100,
      color: reminder?.color ?? "",
      channel: reminder?.channel ?? "",
      channel_importance: reminder?.channel_importance ?? "",
      notification_group: reminder?.notification_group ?? "",
      one_shot: reminder?.one_shot ?? false,
    };
  }

  private _set(key: keyof Draft, value: unknown): void {
    if (!this._draft) return;
    this._draft = { ...this._draft, [key]: value };
  }

  private _toggleWeekday(value: number): void {
    const current = new Set(this._draft?.exclude_days_of_week ?? []);
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    this._set("exclude_days_of_week", [...current].sort());
  }

  private _togglePerson(entityId: string): void {
    const current = new Set(this._draft?.person_entity_ids ?? []);
    if (current.has(entityId)) {
      current.delete(entityId);
    } else {
      current.add(entityId);
    }
    this._set("person_entity_ids", [...current].sort());
  }

  private async _save(): Promise<void> {
    if (!this._draft || this._saving) return;
    this._saving = true;
    this._error = "";
    const d = this._draft;

    const payload: Record<string, unknown> = {
      title: d.title,
      subtitle: d.subtitle || undefined,
      message: d.message,
      notify_service: d.notify_service || undefined,
      user_name: d.user_name || undefined,
      trigger_type: d.trigger_type,
      start_date: d.start_date || undefined,
      stop_date: d.stop_date || undefined,
      time: d.time || undefined,
      every_x_days: d.every_x_days,
      exclude_days_of_week: d.exclude_days_of_week,
      zone_entity_id: d.zone_entity_id || undefined,
      person_entity_ids: d.person_entity_ids,
      time_window_start: d.time_window_start || undefined,
      time_window_end: d.time_window_end || undefined,
      acknowledge_action_title: d.acknowledge_action_title || undefined,
      snooze_delays: d.snooze_delays
        .split(",")
        .map((part) => parseInt(part, 10))
        .filter((value) => !Number.isNaN(value) && value > 0),
      snooze_text: d.snooze_text || undefined,
      wait_time_if_no_action: d.wait_time_if_no_action,
      notification_count: d.notification_count,
      color: d.color || undefined,
      channel: d.channel || undefined,
      channel_importance: d.channel_importance || undefined,
      notification_group: d.notification_group || undefined,
      one_shot: d.one_shot,
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

  private _zones(): HassEntity[] {
    return Object.values(this.hass.states)
      .filter((state) => state.entity_id.startsWith("zone."))
      .sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  }

  private _persons(): HassEntity[] {
    return Object.values(this.hass.states)
      .filter((state) => state.entity_id.startsWith("person."))
      .sort((a, b) => a.entity_id.localeCompare(b.entity_id));
  }

  private _zoneLabel(entityId: string): string {
    const zone = this.hass.states[entityId];
    const name =
      (zone?.attributes.friendly_name as string | undefined) ??
      entityId.replace("zone.", "");
    return name;
  }

  protected render() {
    if (!this._draft) return nothing;
    const d = this._draft;
    const isZone = d.trigger_type !== "time";

    return html`
      <ha-dialog
        open="${this.open}"
        .heading=${this.reminder ? "Edit reminder" : "New reminder"}
        @closed=${() => (this.open = false)}
      >
        <div class="editor">
          <div class="row">
            <ha-textfield
              class="full"
              label="Title *"
              .value=${d.title}
              @input=${(ev: Event) =>
                this._set("title", (ev.target as HTMLInputElement).value)}
            ></ha-textfield>
          </div>
          <div class="row">
            <ha-textfield
              label="Subtitle"
              .value=${d.subtitle}
              @input=${(ev: Event) =>
                this._set("subtitle", (ev.target as HTMLInputElement).value)}
            ></ha-textfield>
            <ha-textfield
              label="Message *"
              .value=${d.message}
              @input=${(ev: Event) =>
                this._set("message", (ev.target as HTMLInputElement).value)}
            ></ha-textfield>
          </div>
          <div class="row">
            <ha-select
              label="Notification service"
              .value=${d.notify_service}
              @selected=${(ev: Event) =>
                this._set(
                  "notify_service",
                  (ev.target as HTMLSelectElement).value || "",
                )}
              @closed=${(ev: Event) => ev.stopPropagation()}
            >
              <mwc-list-item value=""></mwc-list-item>
              ${[...new Set([...this._notifyServices, d.notify_service])]
                .filter((service) => service)
                .map(
                  (service) => html`
                    <mwc-list-item value=${service}>${service}</mwc-list-item>
                  `,
                )}
            </ha-select>
            <ha-textfield
              label="User name"
              helper="Who this reminder is for — shown in group acknowledgement messages"
              .value=${d.user_name}
              @input=${(ev: Event) =>
                this._set("user_name", (ev.target as HTMLInputElement).value)}
            ></ha-textfield>
          </div>
          <div class="row">
            <ha-select
              label="Trigger"
              .value=${d.trigger_type}
              @selected=${(ev: Event) =>
                this._set(
                  "trigger_type",
                  (ev.target as HTMLSelectElement).value || "time",
                )}
              @closed=${(ev: Event) =>
                ev.stopPropagation()}
            >
              <mwc-list-item value="time">At a fixed time</mwc-list-item>
              <mwc-list-item value="zone_enter">When I enter a zone</mwc-list-item>
              <mwc-list-item value="zone_leave">When I leave a zone</mwc-list-item>
            </ha-select>
            <ha-formfield label="Only once">
              <ha-switch
                .checked=${d.one_shot}
                @change=${(ev: Event) =>
                  this._set("one_shot", (ev.target as HTMLInputElement).checked)}
              ></ha-switch>
            </ha-formfield>
          </div>

          ${isZone
            ? html`
                <div class="section">Zone trigger</div>
                <div class="row">
                  <ha-select
                    label="Zone"
                    .value=${d.zone_entity_id}
                    @selected=${(ev: Event) =>
                      this._set(
                        "zone_entity_id",
                        (ev.target as HTMLSelectElement).value || "",
                      )}
                    @closed=${(ev: Event) => ev.stopPropagation()}
                  >
                    <mwc-list-item value=""></mwc-list-item>
                    ${this._zones().map(
                      (zone) => html`
                        <mwc-list-item value=${zone.entity_id}
                          >${this._zoneLabel(zone.entity_id)}</mwc-list-item
                        >
                      `,
                    )}
                  </ha-select>
                </div>
                <div class="section">Watch these persons</div>
                ${this._persons().length
                  ? html`<div class="days">
                      ${this._persons().map(
                        (person) => html`
                          <ha-formfield
                            label=${String(
                              person.attributes.friendly_name ??
                                person.entity_id,
                            )}
                          >
                            <ha-checkbox
                              .checked=${d.person_entity_ids.includes(
                                person.entity_id,
                              )}
                              @change=${() =>
                                this._togglePerson(person.entity_id)}
                            ></ha-checkbox>
                          </ha-formfield>
                        `,
                      )}
                    </div>`
                  : html`<div>No person entities found.</div>`}
                <div class="row">
                  <ha-textfield
                    label="Only fire between (start)"
                    type="time"
                    .value=${d.time_window_start}
                    @input=${(ev: Event) =>
                      this._set(
                        "time_window_start",
                        (ev.target as HTMLInputElement).value,
                      )}
                  ></ha-textfield>
                  <ha-textfield
                    label="and (end)"
                    type="time"
                    .value=${d.time_window_end}
                    @input=${(ev: Event) =>
                      this._set(
                        "time_window_end",
                        (ev.target as HTMLInputElement).value,
                      )}
                  ></ha-textfield>
                </div>
              `
            : html`
                <div class="section">Time trigger</div>
                <div class="row">
                  <ha-textfield
                    label="Time *"
                    type="time"
                    .value=${d.time}
                    @input=${(ev: Event) =>
                      this._set("time", (ev.target as HTMLInputElement).value)}
                  ></ha-textfield>
                  <ha-textfield
                    label="Every N days *"
                    type="number"
                    min="1"
                    .value=${String(d.every_x_days)}
                    @input=${(ev: Event) =>
                      this._set(
                        "every_x_days",
                        parseInt((ev.target as HTMLInputElement).value, 10) || 1,
                      )}
                  ></ha-textfield>
                </div>
                <div class="row">
                  <ha-textfield
                    label="Start date"
                    type="date"
                    .value=${d.start_date}
                    @input=${(ev: Event) =>
                      this._set(
                        "start_date",
                        (ev.target as HTMLInputElement).value,
                      )}
                  ></ha-textfield>
                  <ha-textfield
                    label="Stop date"
                    type="date"
                    .value=${d.stop_date}
                    @input=${(ev: Event) =>
                      this._set(
                        "stop_date",
                        (ev.target as HTMLInputElement).value,
                      )}
                  ></ha-textfield>
                </div>
                <div class="section">Exclude days</div>
                <div class="days">
                  ${WEEKDAYS.map(
                    (day) => html`
                      <ha-formfield label=${day.label}>
                        <ha-checkbox
                          .checked=${d.exclude_days_of_week.includes(day.value)}
                          @change=${() => this._toggleWeekday(day.value)}
                        ></ha-checkbox>
                      </ha-formfield>
                    `,
                  )}
                </div>
              `}

          <div class="section">Notification</div>
          <div class="row">
            <ha-textfield
              label="Acknowledge action title"
              .value=${d.acknowledge_action_title}
              @input=${(ev: Event) =>
                this._set(
                  "acknowledge_action_title",
                  (ev.target as HTMLInputElement).value,
                )}
            ></ha-textfield>
            <ha-textfield
              label="Snooze delays (minutes)"
              helper="Comma separated, e.g. 5,15,30"
              .value=${d.snooze_delays}
              @input=${(ev: Event) =>
                this._set("snooze_delays", (ev.target as HTMLInputElement).value)}
            ></ha-textfield>
          </div>
          <div class="row">
            <ha-textfield
              label="Wait before resend (min)"
              type="number"
              min="1"
              .value=${String(d.wait_time_if_no_action)}
              @input=${(ev: Event) =>
                this._set(
                  "wait_time_if_no_action",
                  parseInt((ev.target as HTMLInputElement).value, 10) || 1,
                )}
            ></ha-textfield>
            <ha-textfield
              label="Max notifications"
              type="number"
              min="1"
              .value=${String(d.notification_count)}
              @input=${(ev: Event) =>
                this._set(
                  "notification_count",
                  parseInt((ev.target as HTMLInputElement).value, 10) || 1,
                )}
            ></ha-textfield>
          </div>
          <div class="row">
            <ha-textfield
              label="Snooze text"
              helper="\${time} is replaced by the delay"
              .value=${d.snooze_text}
              @input=${(ev: Event) =>
                this._set("snooze_text", (ev.target as HTMLInputElement).value)}
            ></ha-textfield>
            <ha-textfield
              label="Notification group"
              helper="Shared with other reminders"
              .value=${d.notification_group}
              @input=${(ev: Event) =>
                this._set(
                  "notification_group",
                  (ev.target as HTMLInputElement).value,
                )}
            ></ha-textfield>
          </div>
          <div class="row">
            <ha-textfield
              label="Color (Android)"
              .value=${d.color}
              @input=${(ev: Event) =>
                this._set("color", (ev.target as HTMLInputElement).value)}
            ></ha-textfield>
            <ha-textfield
              label="Channel (Android)"
              .value=${d.channel}
              @input=${(ev: Event) =>
                this._set("channel", (ev.target as HTMLInputElement).value)}
            ></ha-textfield>
            <ha-textfield
              label="Channel importance"
              .value=${d.channel_importance}
              @input=${(ev: Event) =>
                this._set(
                  "channel_importance",
                  (ev.target as HTMLInputElement).value,
                )}
            ></ha-textfield>
          </div>

          ${this._error
            ? html`<div class="error">${this._error}</div>`
            : nothing}
        </div>

        <mwc-button
          slot="primaryAction"
          .disabled=${this._saving || !d.title || !d.message}
          @click=${this._save}
        >
          ${this.reminder ? "Save" : "Create"}
        </mwc-button>
        <mwc-button slot="secondaryAction" @click=${() => (this.open = false)}>
          Cancel
        </mwc-button>
      </ha-dialog>
    `;
  }
}
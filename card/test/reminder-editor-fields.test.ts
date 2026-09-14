import { describe, expect, it } from "vitest";
import {
  advancedFields,
  basicFields,
  hasAdvancedValues,
  ReminderEditor,
} from "../src/reminder-editor";
import type { Reminder, TriggerType } from "../src/types";

/**
 * The editor shows a minimal form and hides everything else behind "Advanced
 * settings" — all functionality must stay reachable.
 */

const NOTIFY_FIELD = { name: "notify_service", selector: { text: {} } };

function names(trigger: TriggerType): string[] {
  return [
    ...basicFields(trigger, NOTIFY_FIELD),
    ...advancedFields(trigger),
  ].map((field) => field.name);
}

const ADVANCED_NAMES = [
  "subtitle",
  "user_name",
  "one_shot",
  "start_date",
  "stop_date",
  "exclude_days_of_week",
  "acknowledge_action_title",
  "snooze_delays",
  "snooze_text",
  "wait_time_if_no_action",
  "notification_count",
  "channel_importance",
  "channel",
  "color",
  "notification_group",
  "acknowledge_notification_title",
  "acknowledge_notification_body",
];

describe("basicFields", () => {
  it("asks only what the common case needs for a time reminder", () => {
    expect(basicFields("time", NOTIFY_FIELD).map((f) => f.name)).toEqual([
      "title",
      "message",
      "trigger_type",
      "time",
      "notify_service",
    ]);
  });

  it("swaps in zone fields for a location reminder", () => {
    expect(basicFields("zone_enter", NOTIFY_FIELD).map((f) => f.name)).toEqual([
      "title",
      "message",
      "trigger_type",
      "zone_entity_id",
      "person_entity_ids",
      "notify_service",
    ]);
  });

  it("keeps the advanced settings out of the basic form", () => {
    for (const trigger of ["time", "zone_enter", "zone_leave"] as TriggerType[]) {
      const basic = basicFields(trigger, NOTIFY_FIELD).map((f) => f.name);
      for (const advanced of ADVANCED_NAMES) {
        expect(basic).not.toContain(advanced);
      }
    }
  });
});

describe("advancedFields", () => {
  it("still exposes every advanced setting", () => {
    const advanced = advancedFields("time").map((f) => f.name);
    for (const name of ADVANCED_NAMES) {
      expect(advanced).toContain(name);
    }
    expect(advanced).toContain("every_x_days");
  });

  it("uses the zone time window for location reminders", () => {
    const advanced = advancedFields("zone_leave").map((f) => f.name);
    expect(advanced).toContain("time_window_start");
    expect(advanced).toContain("time_window_end");
    expect(advanced).not.toContain("every_x_days");
  });

  it("together with the basic form covers every editable property", () => {
    expect(new Set(names("time")).size).toBe(names("time").length);
    expect(new Set(names("time"))).toEqual(
      new Set([
        "title",
        "message",
        "trigger_type",
        "time",
        "notify_service",
        "every_x_days",
        ...ADVANCED_NAMES,
      ]),
    );
    expect(new Set(names("zone_enter"))).toEqual(
      new Set([
        "title",
        "message",
        "trigger_type",
        "zone_entity_id",
        "person_entity_ids",
        "notify_service",
        "time_window_start",
        "time_window_end",
        ...ADVANCED_NAMES,
      ]),
    );
  });
});

describe("hasAdvancedValues", () => {
  const base = {
    id: "x",
    title: "Trash",
    message: "Bins",
    notify_service: "notify.mobile_app_test",
    trigger_type: "time",
    time: "20:00",
    enabled: true,
  } as unknown as Reminder;

  it("is false for a plain reminder", () => {
    expect(hasAdvancedValues(base)).toBe(false);
    expect(hasAdvancedValues(null)).toBe(false);
  });

  it("detects configured advanced settings", () => {
    for (const patch of [
      { subtitle: "Weekly" },
      { one_shot: true },
      { every_x_days: 7 },
      { start_date: "2026-01-01" },
      { stop_date: "2026-02-01" },
      { exclude_days_of_week: [0] },
      { time_window_start: "09:00:00" },
      { snooze_delays: [5, 10] },
      { snooze_text: "Later ${time}" },
      { acknowledge_action_title: "Done" },
      { notification_count: 3 },
      { wait_time_if_no_action: 5 },
      { channel: "alerts" },
      { color: "#ff0000" },
      { notification_group: "family" },
      { user_name: "Kyle" },
    ]) {
      expect(hasAdvancedValues({ ...base, ...patch } as Reminder)).toBe(true);
    }
  });
});

describe("editor dialog layout", () => {
  it("shows the advanced section collapsed for a plain reminder", async () => {
    const element = new ReminderEditor();
    element.hass = { states: {}, callService: async () => ({}) } as never;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const panel = element.shadowRoot?.querySelector("ha-expansion-panel");
    expect(panel).toBeDefined();
    expect((panel as HTMLElement & { expanded: boolean }).expanded).toBe(false);

    const forms = element.shadowRoot?.querySelectorAll("ha-form") ?? [];
    expect(forms.length).toBe(2); // basic + advanced
    element.remove();
  });

  it("stays collapsed even when the reminder is customised", async () => {
    const element = new ReminderEditor();
    element.hass = { states: {}, callService: async () => ({}) } as never;
    element.reminder = {
      id: "abc",
      title: "Trash",
      message: "Bins",
      notify_service: "notify.mobile_app_test",
      trigger_type: "time",
      time: "20:00",
      enabled: true,
      notification_count: 100, // non-default: used to force the panel open
      snooze_delays: [5, 15, 30, 45, 60],
    } as never;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const panel = element.shadowRoot?.querySelector("ha-expansion-panel") as
      | (HTMLElement & { expanded: boolean; secondary?: string })
      | null;
    expect(panel?.expanded).toBe(false);
    // ...but the user is told there is something in there (bound as a
    // property, so it is read from the element rather than an attribute)
    expect(panel?.secondary).toBe("customised");
    element.remove();
  });
});

import { describe, expect, it } from "vitest";
import {
  collectReminders,
  menuItemsFor,
  snippetOf,
  statusOf,
  triggerText,
} from "../src/reminder-list";
import type { HomeAssistant } from "../src/types";

/**
 * The list finds reminders by the `reminder_id` attribute the integration puts
 * on every sensor. It used to filter on an `sensor.ha_reminder_` prefix, which
 * never matched the real entity ids (`sensor.ha_reminders_…`, domain
 * `ha_reminders`), so the card and panel listed nothing.
 */

function hassWith(states: Record<string, Record<string, unknown>>): HomeAssistant {
  return {
    states: Object.fromEntries(
      Object.entries(states).map(([entity_id, attributes]) => [
        entity_id,
        { entity_id, state: "scheduled", attributes },
      ]),
    ),
  } as unknown as HomeAssistant;
}

const REMINDER = {
  reminder_id: "abc123",
  title: "Take out the trash",
  message: "Bins go out",
  notify_service: "notify.mobile_app_test",
  trigger_type: "zone_enter",
  zone_entity_id: "zone.home",
  enabled: true,
  status: "scheduled",
};

describe("collectReminders", () => {
  it("finds the integration's sensors regardless of naming", () => {
    const hass = hassWith({
      "sensor.ha_reminders_take_out_the_trash_abc12345": REMINDER,
      "sensor.unrelated": { some: "attribute" },
    });

    const reminders = collectReminders(hass);

    expect(reminders).toHaveLength(1);
    expect(reminders[0].title).toBe("Take out the trash");
  });

  it("ignores entities without a reminder payload", () => {
    const hass = hassWith({
      "sensor.ha_reminders_orphan_ffffffff": { status: "unavailable" },
    });

    expect(collectReminders(hass)).toEqual([]);
  });

  it("orders active reminders before completed ones", () => {
    const hass = hassWith({
      "sensor.ha_reminders_done_11111111": {
        ...REMINDER,
        reminder_id: "b",
        title: "Done one",
        status: "completed",
      },
      "sensor.ha_reminders_live_22222222": {
        ...REMINDER,
        reminder_id: "a",
        title: "Active one",
        status: "active",
      },
    });

    expect(collectReminders(hass).map((r) => r.title)).toEqual([
      "Active one",
      "Done one",
    ]);
  });

  it("returns nothing when hass is not ready", () => {
    expect(collectReminders(undefined)).toEqual([]);
  });
});

describe("triggerText", () => {
  it("describes zone triggers", () => {
    expect(triggerText(REMINDER as never)).toContain("Home");
  });

  it("describes time triggers", () => {
    const text = triggerText({
      ...REMINDER,
      trigger_type: "time",
      next_fire: "2026-09-13T20:00:00",
    } as never);
    expect(text).toMatch(/8:00/);
  });
});

describe("statusOf", () => {
  it("defaults to scheduled", () => {
    expect(statusOf({ ...REMINDER, status: undefined } as never)).toBe("scheduled");
  });
});

describe("snippetOf", () => {
  it("shows the reminder text when it differs from the title", () => {
    expect(
      snippetOf({
        ...REMINDER,
        title: "Trash",
        message: "Bins go out tonight, recycling too",
      } as never),
    ).toBe("Bins go out tonight, recycling too");
  });

  it("falls back to the subtitle when it repeats the title", () => {
    expect(
      snippetOf({ ...REMINDER, title: "Trash", message: "Trash", subtitle: "Weekly" } as never),
    ).toBe("Weekly");
  });

  it("is empty when there is nothing extra", () => {
    expect(
      snippetOf({ ...REMINDER, title: "Trash", message: "Trash", subtitle: "" } as never),
    ).toBe("");
  });
});

describe("menuItemsFor", () => {
  const handlers = {
    complete: () => undefined,
    snooze: () => undefined,
    toggleEnabled: () => undefined,
    edit: () => undefined,
    remove: () => undefined,
  };

  it("offers the full set for an armed reminder", () => {
    const labels = menuItemsFor(REMINDER as never, handlers).map((i) => i.label);
    expect(labels).toEqual(["Mark done", "Snooze", "Disable", "Edit", "Delete"]);
  });

  it("hides completion once done", () => {
    const labels = menuItemsFor(
      { ...REMINDER, status: "completed" } as never,
      handlers,
    ).map((i) => i.label);
    expect(labels).toEqual(["Disable", "Edit", "Delete"]);
  });

  it("offers Enable for a disabled reminder", () => {
    const labels = menuItemsFor(
      { ...REMINDER, enabled: false, status: "disabled" } as never,
      handlers,
    ).map((i) => i.label);
    expect(labels).toEqual(["Enable", "Edit", "Delete"]);
  });

  it("marks delete as a warning action", () => {
    const remove = menuItemsFor(REMINDER as never, handlers).at(-1);
    expect(remove?.warning).toBe(true);
  });

  it("wires actions to the handlers", () => {
    let called = "";
    const items = menuItemsFor(REMINDER as never, {
      ...handlers,
      snooze: () => {
        called = "snooze";
      },
    });
    items.find((i) => i.label === "Snooze")?.action();
    expect(called).toBe("snooze");
  });
});

import { describe, expect, it } from "vitest";
import {
  collectReminders,
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

import { describe, expect, it } from "vitest";
import { groupReminders, ReminderList } from "../src/reminder-list";
import type { HomeAssistant, Reminder } from "../src/types";

/**
 * The sidebar panel groups reminders into three collapsible sections:
 * time and location (open by default) and completed (closed, at the bottom,
 * most recently completed first). The sort keys are `time`, `created_at` and
 * `completed_at`, and each is allowed to be missing.
 */

function reminder(overrides: Partial<Reminder> = {}): Reminder {
  return {
    id: "r",
    title: "Reminder",
    message: "Message",
    notify_service: "notify.mobile_app_test",
    trigger_type: "time",
    enabled: true,
    status: "scheduled",
    ...overrides,
  } as Reminder;
}

function titles(reminders: Reminder[]): string[] {
  return reminders.map((entry) => String(entry.title));
}

describe("groupReminders", () => {
  it("splits time, location and completed reminders apart", () => {
    const groups = groupReminders([
      reminder({ title: "Time", trigger_type: "time" }),
      reminder({ title: "Enter", trigger_type: "zone_enter" }),
      reminder({ title: "Leave", trigger_type: "zone_leave" }),
      reminder({ title: "Done", status: "completed" }),
    ]);

    expect(titles(groups.time)).toEqual(["Time"]);
    expect(titles(groups.location)).toEqual(["Enter", "Leave"]);
    expect(titles(groups.completed)).toEqual(["Done"]);
  });

  it("keeps a completed location reminder out of the location group", () => {
    const groups = groupReminders([
      reminder({ title: "Done", trigger_type: "zone_leave", status: "completed" }),
    ]);

    expect(titles(groups.location)).toEqual([]);
    expect(titles(groups.completed)).toEqual(["Done"]);
  });

  it("keeps disabled reminders in their own trigger group", () => {
    const groups = groupReminders([
      reminder({
        title: "Off",
        trigger_type: "zone_enter",
        enabled: false,
        status: "disabled",
      }),
    ]);

    expect(titles(groups.location)).toEqual(["Off"]);
    expect(titles(groups.completed)).toEqual([]);
  });

  it("orders time reminders by time of day, earliest first", () => {
    const groups = groupReminders([
      reminder({ title: "Evening", time: "20:00" }),
      reminder({ title: "Morning", time: "07:30" }),
      reminder({ title: "Noon", time: "12:00" }),
    ]);

    expect(titles(groups.time)).toEqual(["Morning", "Noon", "Evening"]);
  });

  it("orders location reminders by when they were added, oldest first", () => {
    const groups = groupReminders([
      reminder({
        title: "Second",
        trigger_type: "zone_leave",
        created_at: "2026-09-02T10:00:00",
      }),
      reminder({
        title: "First",
        trigger_type: "zone_enter",
        created_at: "2026-09-01T10:00:00",
      }),
    ]);

    expect(titles(groups.location)).toEqual(["First", "Second"]);
  });

  it("orders completed reminders newest first", () => {
    const groups = groupReminders([
      reminder({ title: "Older", status: "completed", completed_at: "2026-09-01T10:00:00" }),
      reminder({ title: "Newer", status: "completed", completed_at: "2026-09-03T10:00:00" }),
      reminder({ title: "Middle", status: "completed", completed_at: "2026-09-02T10:00:00" }),
    ]);

    expect(titles(groups.completed)).toEqual(["Newer", "Middle", "Older"]);
  });

  it("sorts entries without a timestamp last, then by title", () => {
    const groups = groupReminders([
      reminder({ title: "Unknown B", trigger_type: "zone_leave" }),
      reminder({
        title: "Known",
        trigger_type: "zone_leave",
        created_at: "2026-09-01T10:00:00",
      }),
      reminder({ title: "Unknown A", trigger_type: "zone_leave" }),
    ]);

    expect(titles(groups.location)).toEqual(["Known", "Unknown A", "Unknown B"]);
  });

  it("falls back to the title for a missing time", () => {
    const groups = groupReminders([
      reminder({ title: "No time" }),
      reminder({ title: "Timed", time: "09:00" }),
      reminder({ title: "Also no time" }),
    ]);

    expect(titles(groups.time)).toEqual(["Timed", "Also no time", "No time"]);
  });
});

function hassWith(reminders: Reminder[]): HomeAssistant {
  return {
    states: Object.fromEntries(
      reminders.map((entry, index) => [
        `sensor.ha_reminders_${index}`,
        {
          entity_id: `sensor.ha_reminders_${index}`,
          state: "x",
          // `collectReminders` finds reminders by this attribute.
          attributes: { ...entry, reminder_id: entry.id },
        },
      ]),
    ),
  } as unknown as HomeAssistant;
}

type Panel = HTMLElement & { header?: string; expanded?: boolean; secondary?: string };

async function groupedList(reminders: Reminder[]): Promise<ReminderList> {
  const element = new ReminderList();
  element.grouped = true;
  element.hass = hassWith(reminders);
  document.body.append(element);
  await element.updateComplete;
  return element;
}

function panels(element: ReminderList): Panel[] {
  return [...(element.shadowRoot?.querySelectorAll("ha-expansion-panel") ?? [])] as Panel[];
}

const TIME = reminder({ title: "Trash", trigger_type: "time", time: "20:00" });
const LOCATION = reminder({
  title: "Milk",
  trigger_type: "zone_leave",
  created_at: "2026-09-01T10:00:00",
});
const DONE = reminder({
  title: "Bins",
  status: "completed",
  completed_at: "2026-09-02T10:00:00",
});

describe("grouped list", () => {
  it("shows time, location and completed sections in that order", async () => {
    const element = await groupedList([DONE, LOCATION, TIME]);
    const [time, location, completed] = panels(element);

    expect([time.header, location.header, completed.header]).toEqual([
      "Time (1)",
      "Location (1)",
      "Completed (1)",
    ]);
    element.remove();
  });

  it("opens time and location and leaves completed collapsed", async () => {
    const element = await groupedList([TIME, LOCATION, DONE]);
    const [time, location, completed] = panels(element);

    expect(time.expanded).toBe(true);
    expect(location.expanded).toBe(true);
    expect(completed.expanded).toBe(false);
    element.remove();
  });

  it("puts each reminder in its own section", async () => {
    const element = await groupedList([TIME, LOCATION, DONE]);
    const [time, location, completed] = panels(element);

    expect(time.querySelectorAll(".row")).toHaveLength(1);
    expect(time.querySelector(".row-title")?.textContent).toBe("Trash");
    expect(location.querySelector(".row-title")?.textContent).toBe("Milk");
    expect(completed.querySelector(".row-title")?.textContent).toBe("Bins");
    element.remove();
  });

  it("keeps a section visible even when it is empty", async () => {
    // The Completed section used to be dropped when nothing was in it, which
    // made it look like the panel had no such section at all.
    const element = await groupedList([TIME]);
    const headers = panels(element).map((panel) => panel.header);

    expect(headers).toEqual(["Time (1)", "Location (0)", "Completed (0)"]);
    element.remove();
  });

  it("renders each section as its own card", async () => {
    const element = await groupedList([TIME, LOCATION, DONE]);
    const cards = [
      ...(element.shadowRoot?.querySelectorAll(".group") ?? []),
    ] as HTMLElement[];

    expect(cards).toHaveLength(3);
    for (const card of cards) {
      expect(card.querySelectorAll("ha-expansion-panel")).toHaveLength(1);
    }
    element.remove();
  });

  it("counts the reminders next to the section title", async () => {
    const element = await groupedList([
      TIME,
      reminder({ id: "t2", title: "Water", trigger_type: "time", time: "08:00" }),
      LOCATION,
    ]);

    expect(panels(element).map((panel) => panel.header)).toEqual([
      "Time (2)",
      "Location (1)",
      "Completed (0)",
    ]);
    element.remove();
  });

  it("shows the empty message instead of sections when there is nothing", async () => {
    const element = await groupedList([]);

    expect(panels(element)).toHaveLength(0);
    expect(element.shadowRoot?.querySelector(".empty")).toBeTruthy();
    element.remove();
  });

  it("keeps a section the user opened open across re-renders", async () => {
    const element = await groupedList([TIME, DONE]);
    const completed = () => panels(element).at(-1) as Panel;

    completed().dispatchEvent(
      new CustomEvent("expanded-changed", { detail: { expanded: true } }),
    );
    await element.updateComplete;
    expect(completed().expanded).toBe(true);

    // A coordinator update re-renders the list; the section must stay open.
    element.hass = hassWith([TIME, DONE, LOCATION]);
    await element.updateComplete;
    expect(completed().expanded).toBe(true);
    element.remove();
  });

  it("renders a flat list when not grouped", async () => {
    const element = new ReminderList();
    element.hass = hassWith([TIME, DONE]);
    document.body.append(element);
    await element.updateComplete;

    expect(element.shadowRoot?.querySelectorAll("ha-expansion-panel")).toHaveLength(0);
    expect(element.shadowRoot?.querySelectorAll(".row")).toHaveLength(2);
    element.remove();
  });
});

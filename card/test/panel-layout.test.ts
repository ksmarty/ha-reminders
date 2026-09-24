import { describe, expect, it } from "vitest";
import { HaRemindersPanel } from "../src/ha-reminders-panel";
import type { HomeAssistant } from "../src/types";

/**
 * Layout contract for the sidebar panel: the header bar stays put and only the
 * reminders scroll, so the toolbar must not live inside the scroll container.
 * (jsdom does no layout, so this pins the structure the CSS relies on.)
 */

const REMINDER = {
  reminder_id: "abc123",
  id: "abc123",
  title: "Take out the trash",
  message: "Bins go out",
  notify_service: "notify.mobile_app_test",
  trigger_type: "time",
  time: "20:00",
  enabled: true,
  status: "scheduled",
};

async function panel(): Promise<HaRemindersPanel> {
  const element = new HaRemindersPanel();
  element.hass = {
    states: {
      "sensor.ha_reminders_trash_abc12345": {
        entity_id: "sensor.ha_reminders_trash_abc12345",
        state: "scheduled",
        attributes: REMINDER,
      },
    },
  } as unknown as HomeAssistant;
  document.body.append(element);
  await element.updateComplete;
  return element;
}

describe("sidebar panel layout", () => {
  it("keeps the header bar outside the scrolling area", async () => {
    const element = await panel();
    const toolbar = element.shadowRoot?.querySelector(".toolbar");
    const scroll = element.shadowRoot?.querySelector(".scroll");

    expect(toolbar).toBeTruthy();
    expect(scroll).toBeTruthy();
    expect(scroll?.contains(toolbar as Node)).toBe(false);
    element.remove();
  });

  it("scrolls the reminders", async () => {
    const element = await panel();
    const scroll = element.shadowRoot?.querySelector(".scroll");

    expect(scroll?.querySelector(".list")).toBeTruthy();
    expect(scroll?.querySelector("ha-reminders-list")).toBeTruthy();
    element.remove();
  });

  it("asks the list for the grouped sections", async () => {
    const element = await panel();
    const list = element.shadowRoot?.querySelector("ha-reminders-list") as
      | (HTMLElement & { grouped?: boolean })
      | null;

    expect(list?.grouped).toBe(true);
    element.remove();
  });
});

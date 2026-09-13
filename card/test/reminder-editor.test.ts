import { describe, expect, it } from "vitest";
import { ReminderEditor } from "../src/reminder-editor";

/**
 * The editor dialog must stay closed until it is opened: binding `open` as a
 * string attribute (`open="false"`) always leaves the attribute present, which
 * `<ha-dialog>` treats as open — so the panel greeted users with the creation
 * form. The binding is a property now.
 */

function editor(): ReminderEditor {
  const element = new ReminderEditor();
  element.hass = { states: {}, callService: async () => ({}) } as never;
  document.body.append(element);
  return element;
}

function dialogs(element: ReminderEditor): Element[] {
  return Array.from(element.shadowRoot?.querySelectorAll("ha-dialog") ?? []);
}

describe("ReminderEditor dialog", () => {
  it("renders closed by default", async () => {
    const element = editor();
    await element.updateComplete;

    const [dialog] = dialogs(element) as (Element & { open?: boolean })[];
    expect(dialog).toBeDefined();
    // Property binding: `open` must be false, not the string "false" in an
    // attribute (any presence of which means "open" to ha-dialog).
    expect(dialog.open).toBe(false);
    expect(dialog.hasAttribute("open")).toBe(false);
    element.remove();
  });

  it("opens when asked", async () => {
    const element = new ReminderEditor();
    element.hass = { states: {}, callService: async () => ({}) } as never;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const [dialog] = dialogs(element) as (Element & { open?: boolean })[];
    expect(dialog.open).toBe(true);
    element.remove();
  });
});

describe("ReminderEditor footer", () => {
  it("offers a save affordance in the dialog footer", async () => {
    const element = editor();
    await element.updateComplete;

    // ha-dialog only renders a footer slot; buttons placed directly in the
    // dialog are dropped, which left the editor with no way to save.
    const footer = element.shadowRoot?.querySelector("ha-dialog-footer");
    expect(footer).toBeDefined();
    expect(footer?.getAttribute("slot")).toBe("footer");

    const primary = footer?.querySelector('ha-button[slot="primaryAction"]');
    expect(primary).toBeDefined();
    expect(primary?.textContent?.trim()).toBe("Create");

    const secondary = footer?.querySelector('ha-button[slot="secondaryAction"]');
    expect(secondary?.textContent?.trim()).toBe("Cancel");
    element.remove();
  });

  it("labels the primary action Save when editing", async () => {
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
    } as never;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    const primary = element.shadowRoot?.querySelector(
      'ha-button[slot="primaryAction"]',
    );
    expect(primary?.textContent?.trim()).toBe("Save");
    element.remove();
  });
});

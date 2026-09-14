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

/**
 * A save must never fall back to "create" because the target moved. Creating
 * the reminder that is being edited is exactly how a duplicate appears.
 */
describe("ReminderEditor save target", () => {
  function recordingEditor() {
    const calls: { service: string; data: Record<string, unknown> }[] = [];
    const element = new ReminderEditor();
    element.hass = {
      states: {},
      callService: async (_domain: string, service: string, data: unknown) => {
        calls.push({ service, data: data as Record<string, unknown> });
        return {};
      },
    } as never;
    return { element, calls };
  }

  const EXISTING = {
    id: "abc",
    title: "Trash",
    message: "Bins",
    notify_service: "notify.mobile_app_test",
    trigger_type: "time",
    time: "20:00",
    enabled: true,
  };

  async function clickSave(element: ReminderEditor): Promise<void> {
    // Always supply a valid form payload, whatever the dialog was opened
    // with — the tests deliberately re-bind `reminder` before saving.
    element.shadowRoot
      ?.querySelector("ha-form")
      ?.dispatchEvent(
        new CustomEvent("value-changed", {
          detail: {
            value: {
              title: "Trash",
              message: "Bins",
              trigger_type: "time",
              time: "20:00",
            },
          },
        }),
      );
    await element.updateComplete;

    const primary = element.shadowRoot?.querySelector(
      'ha-button[slot="primaryAction"]',
    ) as HTMLElement;
    primary.click();
    // Let the save promise chain settle.
    await new Promise((resolve) => setTimeout(resolve, 0));
    await element.updateComplete;
  }

  it("updates rather than creating when the target is re-bound mid-save", async () => {
    const { element, calls } = recordingEditor();
    element.reminder = { ...EXISTING } as never;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    // A coordinator update re-renders the list, which hands the editor a new
    // object; the list closing the dialog also drops its target.
    element.reminder = null;
    element.open = false;
    await clickSave(element);

    expect(calls.map((call) => call.service)).toEqual(["update"]);
    expect(calls[0].data.reminder_id).toBe("abc");
    element.remove();
  });

  it("creates only when the dialog was opened without a reminder", async () => {
    const { element, calls } = recordingEditor();
    element.reminder = null;
    element.open = true;
    document.body.append(element);
    await element.updateComplete;

    element.reminder = { ...EXISTING } as never; // a row appears mid-edit
    await clickSave(element);

    expect(calls.map((call) => call.service)).toEqual(["create"]);
    element.remove();
  });
});

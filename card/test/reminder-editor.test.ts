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

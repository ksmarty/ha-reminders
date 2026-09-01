import type {
  HassServiceResponse,
  HomeAssistant,
  Reminder,
} from "./types";

const DOMAIN = "ha_reminders";

export async function createReminder(
  hass: HomeAssistant,
  payload: Record<string, unknown>,
): Promise<string> {
  const response = await hass.callService(DOMAIN, "create", payload);
  return String(response?.reminder_id ?? "");
}

export async function updateReminder(
  hass: HomeAssistant,
  reminderId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await hass.callService(DOMAIN, "update", {
    reminder_id: reminderId,
    ...payload,
  });
}

export async function deleteReminder(
  hass: HomeAssistant,
  reminderId: string,
): Promise<void> {
  await hass.callService(DOMAIN, "delete", { reminder_id: reminderId });
}

export async function snoozeReminder(
  hass: HomeAssistant,
  reminderId: string,
  minutes: number,
): Promise<void> {
  await hass.callService(DOMAIN, "snooze", {
    reminder_id: reminderId,
    minutes,
  });
}

export async function completeReminder(
  hass: HomeAssistant,
  reminderId: string,
): Promise<void> {
  await hass.callService(DOMAIN, "complete", { reminder_id: reminderId });
}

export async function setReminderEnabled(
  hass: HomeAssistant,
  reminderId: string,
  enabled: boolean,
): Promise<void> {
  await hass.callService(DOMAIN, "set_enabled", {
    reminder_id: reminderId,
    enabled,
  });
}

export async function listReminders(
  hass: HomeAssistant,
): Promise<Reminder[]> {
  const response = await hass.callService(DOMAIN, "list", {});
  return (response?.reminders as Reminder[]) ?? [];
}

/** Pick one reminder id out of a service call that returns `reminder_id`. */
export function reminderIdOf(response: HassServiceResponse): string {
  return String(response?.reminder_id ?? "");
}
export type TriggerType = "time" | "zone_enter" | "zone_leave";

export type ReminderStatus =
  | "scheduled"
  | "active"
  | "snoozed"
  | "completed"
  | "disabled";

export interface Reminder {
  id: string;
  title: string;
  subtitle?: string | null;
  message: string;
  enabled: boolean;
  notify_service: string;
  user_name?: string | null;
  trigger_type: TriggerType;
  start_date?: string | null;
  stop_date?: string | null;
  time?: string | null;
  every_x_days?: number;
  exclude_days_of_week?: number[];
  zone_entity_id?: string | null;
  person_entity_ids?: string[];
  time_window_start?: string | null;
  time_window_end?: string | null;
  acknowledge_action_title?: string | null;
  acknowledge_actions?: Record<string, unknown>[];
  snooze_delays?: number[];
  snooze_text?: string | null;
  wait_time_if_no_action?: number;
  notification_count?: number;
  color?: string | null;
  channel?: string | null;
  channel_importance?: string | null;
  notification_group?: string | null;
  one_shot?: boolean;
  acknowledge_notification_title?: string | null;
  acknowledge_notification_body?: string | null;
  // Runtime (merged by the integration)
  status?: ReminderStatus;
  next_fire?: string | null;
  snooze_until?: string | null;
  notified_count?: number;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface HassServiceResponse {
  [key: string]: unknown;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callService(
    domain: string,
    service: string,
    serviceData?: Record<string, unknown>,
  ): Promise<HassServiceResponse>;
}

export interface CardConfig {
  type?: string;
  title?: string;
  [key: string]: unknown;
}
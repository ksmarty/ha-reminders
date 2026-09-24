"""Constants for the HA Reminders integration."""

from __future__ import annotations

DOMAIN = "ha_reminders"

# v1 stored a bare list of reminder records; v2 also stores the durable part
# of the runtime state (see `DURABLE_RUNTIME_KEYS`). `store.ReminderStore`
# migrates a v1 payload on load.
STORAGE_VERSION = 2
STORAGE_KEY = DOMAIN

# ---------------------------------------------------------------------------
# Per-reminder runtime state
# ---------------------------------------------------------------------------
# The coordinator keeps the reminder lifecycle in memory and only these keys
# are written to storage. `completed` is the "task is done" flag: losing it
# makes an acknowledged location reminder fire again on the next arrival (and
# a one-shot reminder fire again) after any reload. `completed_at` is *when* it
# was marked done — the sidebar panel orders its completed group by it, so it
# has to survive a reload as well. The rest of the runtime dict is a pending
# timer or a derived snapshot, and is rebuilt on load.
DURABLE_RUNTIME_KEYS = ("completed", "completed_at")

# ---------------------------------------------------------------------------
# Notification action protocol (kept compatible with the legacy blueprint)
# ---------------------------------------------------------------------------
ACTION_PREFIX = "taskReminder"
ACTION_SEPARATOR = "╡"
NOTIFICATION_ACTION_EVENT = "mobile_app_notification_action"
NOTIFICATION_TAG = f"{ACTION_PREFIX}{ACTION_SEPARATOR}{{reminder_id}}"
ACKNOWLEDGE_MINUTES = -1

# ---------------------------------------------------------------------------
# Reminder trigger types
# ---------------------------------------------------------------------------
TRIGGER_TIME = "time"
TRIGGER_ZONE_ENTER = "zone_enter"
TRIGGER_ZONE_LEAVE = "zone_leave"
TRIGGER_TYPES = (TRIGGER_TIME, TRIGGER_ZONE_ENTER, TRIGGER_ZONE_LEAVE)

# Runtime status values exposed through the sensor entities / card
STATUS_SCHEDULED = "scheduled"
STATUS_ACTIVE = "active"
STATUS_SNOOZED = "snoozed"
STATUS_COMPLETED = "completed"
STATUS_DISABLED = "disabled"

# ---------------------------------------------------------------------------
# Reminder record fields (also used by the service schemas)
# ---------------------------------------------------------------------------
FIELD_ID = "id"
FIELD_TITLE = "title"
FIELD_SUBTITLE = "subtitle"
FIELD_MESSAGE = "message"
FIELD_ENABLED = "enabled"
FIELD_NOTIFY_SERVICE = "notify_service"
FIELD_USER_NAME = "user_name"
FIELD_TRIGGER_TYPE = "trigger_type"

FIELD_START_DATE = "start_date"
FIELD_STOP_DATE = "stop_date"
FIELD_TIME = "time"
FIELD_EVERY_X_DAYS = "every_x_days"
FIELD_EXCLUDE_DAYS_OF_WEEK = "exclude_days_of_week"

FIELD_ZONE_ENTITY_ID = "zone_entity_id"
FIELD_PERSON_ENTITY_IDS = "person_entity_ids"
FIELD_TIME_WINDOW_START = "time_window_start"
FIELD_TIME_WINDOW_END = "time_window_end"

FIELD_ACKNOWLEDGE_ACTION_TITLE = "acknowledge_action_title"
FIELD_ACKNOWLEDGE_ACTIONS = "acknowledge_actions"
FIELD_SNOOZE_DELAYS = "snooze_delays"
FIELD_SNOOZE_TEXT = "snooze_text"
FIELD_WAIT_TIME = "wait_time_if_no_action"
FIELD_NOTIFICATION_COUNT = "notification_count"
FIELD_ICON = "icon"
FIELD_COLOR = "color"
FIELD_CHANNEL = "channel"
FIELD_CHANNEL_IMPORTANCE = "channel_importance"
FIELD_NOTIFICATION_GROUP = "notification_group"
FIELD_ONE_SHOT = "one_shot"
FIELD_ACKNOWLEDGE_NOTIFICATION_TITLE = "acknowledge_notification_title"
FIELD_ACKNOWLEDGE_NOTIFICATION_BODY = "acknowledge_notification_body"

# Runtime attributes merged into sensor attributes / list service responses
ATTR_REMINDER_ID = "reminder_id"
ATTR_STATUS = "status"
ATTR_NEXT_FIRE = "next_fire"
ATTR_SNOOZE_UNTIL = "snooze_until"
ATTR_NOTIFIED_COUNT = "notified_count"
ATTR_COMPLETED_AT = "completed_at"

# ---------------------------------------------------------------------------
# Defaults (overridable through the config entry options flow)
# ---------------------------------------------------------------------------
DEFAULT_USER_NAME = "Someone"
DEFAULT_SNOOZE_DELAYS = [5, 15, 30, 45, 60]
DEFAULT_SNOOZE_TEXT = "Snooze for ${time}"
DEFAULT_ACKNOWLEDGE_ACTION_TITLE = "Mark as done"
DEFAULT_WAIT_TIME_IF_NO_ACTION = 15
# Reminders notify once by default; set notification_count > 1 to nag
# with `wait_time_if_no_action` between repeats.
DEFAULT_NOTIFICATION_COUNT = 1
DEFAULT_ACKNOWLEDGE_NOTIFICATION_TITLE = "Someone acknowledged the notification"
DEFAULT_ACKNOWLEDGE_NOTIFICATION_BODY = ""

# Notification icon shown by the companion app. Accepts a Material Design Icon
# slug (`mdi:bell-ring`) or an image URL — the app takes those through two
# different payload keys, see `notify.icon_payload`.
DEFAULT_ICON = "mdi:bell-ring"
MDI_ICON_PREFIX = "mdi:"

# ---------------------------------------------------------------------------
# Config entry options
# ---------------------------------------------------------------------------
CONF_DEFAULT_NOTIFY_SERVICE = "default_notify_service"
CONF_DEFAULT_USER_NAME = "default_user_name"
CONF_DEFAULT_SNOOZE_DELAYS = "default_snooze_delays"
CONF_DEFAULT_WAIT_TIME_IF_NO_ACTION = "default_wait_time_if_no_action"
CONF_DEFAULT_NOTIFICATION_COUNT = "default_notification_count"
CONF_DEFAULT_SNOOZE_TEXT = "default_snooze_text"
CONF_DEFAULT_ACKNOWLEDGE_ACTION_TITLE = "default_acknowledge_action_title"
CONF_DEFAULT_ICON = "default_icon"
CONF_DEFAULT_PERSON_ENTITY_IDS = "default_person_entity_ids"

# Services
SERVICE_CREATE = "create"
SERVICE_UPDATE = "update"
SERVICE_DELETE = "delete"
SERVICE_LIST = "list"
SERVICE_SNOOZE = "snooze"
SERVICE_COMPLETE = "complete"
SERVICE_SET_ENABLED = "set_enabled"
SERVICE_INSTALL_SENTENCES = "install_sentences"

SENSOR_PREFIX = f"{DOMAIN}_"
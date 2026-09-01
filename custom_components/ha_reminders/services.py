"""Service definitions for HA Reminders.

Every mutation routes through the coordinator so the store, sensor entities and
scheduler stay consistent.
"""

from __future__ import annotations

import logging
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant, ServiceCall
from homeassistant.exceptions import HomeAssistantError

from .const import (
    DOMAIN,
    FIELD_ACKNOWLEDGE_ACTION_TITLE,
    FIELD_ACKNOWLEDGE_ACTIONS,
    FIELD_ACKNOWLEDGE_NOTIFICATION_BODY,
    FIELD_ACKNOWLEDGE_NOTIFICATION_TITLE,
    FIELD_CHANNEL,
    FIELD_CHANNEL_IMPORTANCE,
    FIELD_COLOR,
    FIELD_ENABLED,
    FIELD_EVERY_X_DAYS,
    FIELD_EXCLUDE_DAYS_OF_WEEK,
    FIELD_MESSAGE,
    FIELD_NOTIFICATION_COUNT,
    FIELD_NOTIFICATION_GROUP,
    FIELD_NOTIFY_SERVICE,
    FIELD_ONE_SHOT,
    FIELD_PERSON_ENTITY_IDS,
    FIELD_SNOOZE_DELAYS,
    FIELD_SNOOZE_TEXT,
    FIELD_START_DATE,
    FIELD_STOP_DATE,
    FIELD_SUBTITLE,
    FIELD_TIME,
    FIELD_TIME_WINDOW_END,
    FIELD_TIME_WINDOW_START,
    FIELD_TITLE,
    FIELD_TRIGGER_TYPE,
    FIELD_USER_NAME,
    FIELD_WAIT_TIME,
    FIELD_ZONE_ENTITY_ID,
    SERVICE_COMPLETE,
    SERVICE_CREATE,
    SERVICE_DELETE,
    SERVICE_LIST,
    SERVICE_SET_ENABLED,
    SERVICE_SNOOZE,
    SERVICE_UPDATE,
    TRIGGER_TYPES,
)
from .coordinator import ReminderCoordinator

_LOGGER = logging.getLogger(__name__)

FIELD_REMINDER_ID = "reminder_id"
FIELD_MINUTES = "minutes"

# Full record payload used by create/update
_REMINDER_FIELDS = {
    vol.Optional(FIELD_TITLE): str,
    vol.Optional(FIELD_SUBTITLE): str,
    vol.Optional(FIELD_MESSAGE): str,
    vol.Optional(FIELD_ENABLED): bool,
    vol.Optional(FIELD_NOTIFY_SERVICE): str,
    vol.Optional(FIELD_USER_NAME): str,
    vol.Optional(FIELD_TRIGGER_TYPE): vol.In(TRIGGER_TYPES),
    vol.Optional(FIELD_START_DATE): str,
    vol.Optional(FIELD_STOP_DATE): str,
    vol.Optional(FIELD_TIME): str,
    vol.Optional(FIELD_EVERY_X_DAYS): vol.All(vol.Coerce(int), vol.Range(min=1)),
    vol.Optional(FIELD_EXCLUDE_DAYS_OF_WEEK): vol.All(
        vol.Any([vol.All(vol.Coerce(int), vol.Range(min=0, max=6))], str)
    ),
    vol.Optional(FIELD_ZONE_ENTITY_ID): str,
    vol.Optional(FIELD_PERSON_ENTITY_IDS): vol.Any([str], str),
    vol.Optional(FIELD_TIME_WINDOW_START): str,
    vol.Optional(FIELD_TIME_WINDOW_END): str,
    vol.Optional(FIELD_ACKNOWLEDGE_ACTION_TITLE): str,
    vol.Optional(FIELD_ACKNOWLEDGE_ACTIONS): list,
    vol.Optional(FIELD_SNOOZE_DELAYS): vol.Any(
        [vol.All(vol.Coerce(int), vol.Range(min=1))], str
    ),
    vol.Optional(FIELD_SNOOZE_TEXT): str,
    vol.Optional(FIELD_WAIT_TIME): vol.All(vol.Coerce(int), vol.Range(min=1)),
    vol.Optional(FIELD_NOTIFICATION_COUNT): vol.All(
        vol.Coerce(int), vol.Range(min=1)
    ),
    vol.Optional(FIELD_COLOR): str,
    vol.Optional(FIELD_CHANNEL): str,
    vol.Optional(FIELD_CHANNEL_IMPORTANCE): str,
    vol.Optional(FIELD_NOTIFICATION_GROUP): str,
    vol.Optional(FIELD_ONE_SHOT): bool,
    vol.Optional(FIELD_ACKNOWLEDGE_NOTIFICATION_TITLE): str,
    vol.Optional(FIELD_ACKNOWLEDGE_NOTIFICATION_BODY): str,
}

SCHEMA_CREATE = vol.Schema(
    {
        vol.Required(FIELD_TITLE): str,
        vol.Required(FIELD_MESSAGE): str,
        **_REMINDER_FIELDS,
    },
    extra=vol.PREVENT_EXTRA,
)

SCHEMA_UPDATE = vol.Schema(
    {vol.Required(FIELD_REMINDER_ID): str, **_REMINDER_FIELDS},
    extra=vol.PREVENT_EXTRA,
)

SCHEMA_DELETE = vol.Schema(
    {vol.Required(FIELD_REMINDER_ID): str}, extra=vol.PREVENT_EXTRA
)

SCHEMA_SNOOZE = vol.Schema(
    {
        vol.Required(FIELD_REMINDER_ID): str,
        vol.Required(FIELD_MINUTES): vol.All(vol.Coerce(int), vol.Range(min=1)),
    },
    extra=vol.PREVENT_EXTRA,
)

SCHEMA_COMPLETE = vol.Schema(
    {
        vol.Required(FIELD_REMINDER_ID): str,
        vol.Optional(FIELD_USER_NAME): str,
    },
    extra=vol.PREVENT_EXTRA,
)

SCHEMA_SET_ENABLED = vol.Schema(
    {
        vol.Required(FIELD_REMINDER_ID): str,
        vol.Required(FIELD_ENABLED): bool,
    },
    extra=vol.PREVENT_EXTRA,
)

SCHEMA_LIST = vol.Schema({}, extra=vol.PREVENT_EXTRA)


def _error(err: Exception) -> HomeAssistantError:
    """Normalize a ValueError into a service-call friendly error."""
    return HomeAssistantError(str(err))


async def async_setup_services(
    hass: HomeAssistant, coordinator: ReminderCoordinator
) -> list[str]:
    """Register all services; returns the list of registered names."""

    async def _create(call: ServiceCall) -> dict[str, Any]:
        try:
            reminder_id = await coordinator.async_create(dict(call.data))
        except HomeAssistantError as err:
            raise _error(err) from err
        return {FIELD_REMINDER_ID: reminder_id}

    async def _update(call: ServiceCall) -> dict[str, Any]:
        data = dict(call.data)
        reminder_id = data.pop(FIELD_REMINDER_ID)
        try:
            await coordinator.async_update(reminder_id, data)
        except HomeAssistantError as err:
            raise _error(err) from err
        return {}

    async def _delete(call: ServiceCall) -> dict[str, Any]:
        await coordinator.async_delete(call.data[FIELD_REMINDER_ID])
        return {}

    async def _list(call: ServiceCall) -> dict[str, Any]:
        reminders = [coordinator.describe(r) for r in coordinator.data]
        return {"reminders": reminders, "count": len(reminders)}

    async def _snooze(call: ServiceCall) -> dict[str, Any]:
        await coordinator.async_snooze(
            call.data[FIELD_REMINDER_ID], int(call.data[FIELD_MINUTES])
        )
        return {}

    async def _complete(call: ServiceCall) -> dict[str, Any]:
        await coordinator.async_complete(
            call.data[FIELD_REMINDER_ID],
            user_name=call.data.get(FIELD_USER_NAME),
        )
        return {}

    async def _set_enabled(call: ServiceCall) -> dict[str, Any]:
        await coordinator.async_set_enabled(
            call.data[FIELD_REMINDER_ID], bool(call.data[FIELD_ENABLED])
        )
        return {}

    handlers = [
        (SERVICE_CREATE, _create, SCHEMA_CREATE),
        (SERVICE_UPDATE, _update, SCHEMA_UPDATE),
        (SERVICE_DELETE, _delete, SCHEMA_DELETE),
        (SERVICE_LIST, _list, SCHEMA_LIST),
        (SERVICE_SNOOZE, _snooze, SCHEMA_SNOOZE),
        (SERVICE_COMPLETE, _complete, SCHEMA_COMPLETE),
        (SERVICE_SET_ENABLED, _set_enabled, SCHEMA_SET_ENABLED),
    ]
    for name, handler, schema in handlers:
        hass.services.async_register(DOMAIN, name, handler, schema=schema)
    return [name for name, _, _ in handlers]
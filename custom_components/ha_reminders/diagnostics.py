"""Diagnostics support for HA Reminders.

Personal content (notification message, user name, notify service) is redacted.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.diagnostics import async_redact_data
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from .const import (
    CONF_DEFAULT_NOTIFY_SERVICE,
    CONF_DEFAULT_PERSON_ENTITY_IDS,
    DOMAIN,
    FIELD_MESSAGE,
    FIELD_NOTIFY_SERVICE,
    FIELD_USER_NAME,
)

_REDACT = {
    CONF_DEFAULT_NOTIFY_SERVICE,
    CONF_DEFAULT_PERSON_ENTITY_IDS,
    FIELD_MESSAGE,
    FIELD_NOTIFY_SERVICE,
    FIELD_USER_NAME,
}


async def async_get_config_entry_diagnostics(
    hass: HomeAssistant, entry: ConfigEntry
) -> dict[str, Any]:
    """Return redacted diagnostics."""
    coordinator = hass.data[DOMAIN]["coordinator"]
    payload: dict[str, Any] = {
        "entry_options": async_redact_data(dict(entry.options), _REDACT),
        "count": len(coordinator.data),
        "reminders": [
            async_redact_data(coordinator.describe(reminder), _REDACT)
            for reminder in coordinator.data
        ],
    }
    return payload
"""Config flow for HA Reminders.

A single config entry holds the global defaults used when new reminders are
created; per-reminder values override these defaults. All fields are editable
through the options flow after setup.
"""

from __future__ import annotations

from typing import Any

import voluptuous as vol

from homeassistant import config_entries
from homeassistant.data_entry_flow import FlowResult

from .const import (
    CONF_DEFAULT_ACKNOWLEDGE_ACTION_TITLE,
    CONF_DEFAULT_NOTIFICATION_COUNT,
    CONF_DEFAULT_NOTIFY_SERVICE,
    CONF_DEFAULT_PERSON_ENTITY_IDS,
    CONF_DEFAULT_SNOOZE_DELAYS,
    CONF_DEFAULT_SNOOZE_TEXT,
    CONF_DEFAULT_USER_NAME,
    CONF_DEFAULT_WAIT_TIME_IF_NO_ACTION,
    DEFAULT_ACKNOWLEDGE_ACTION_TITLE,
    DEFAULT_NOTIFICATION_COUNT,
    DEFAULT_SNOOZE_DELAYS,
    DEFAULT_SNOOZE_TEXT,
    DEFAULT_USER_NAME,
    DEFAULT_WAIT_TIME_IF_NO_ACTION,
    DOMAIN,
)


def _parse_snooze_delays(value: str) -> list[int]:
    """Validate a comma separated snooze delay string."""
    try:
        delays = [int(part.strip()) for part in str(value).split(",") if part.strip()]
    except ValueError as err:
        raise vol.Invalid("invalid_snooze_delays") from err
    if not delays or any(delay < 1 for delay in delays):
        raise vol.Invalid("invalid_snooze_delays")
    return list(dict.fromkeys(delays))


def _default_options() -> dict[str, Any]:
    return {
        CONF_DEFAULT_NOTIFY_SERVICE: "",
        CONF_DEFAULT_USER_NAME: DEFAULT_USER_NAME,
        CONF_DEFAULT_SNOOZE_DELAYS: ",".join(str(d) for d in DEFAULT_SNOOZE_DELAYS),
        CONF_DEFAULT_WAIT_TIME_IF_NO_ACTION: DEFAULT_WAIT_TIME_IF_NO_ACTION,
        CONF_DEFAULT_NOTIFICATION_COUNT: DEFAULT_NOTIFICATION_COUNT,
        CONF_DEFAULT_SNOOZE_TEXT: DEFAULT_SNOOZE_TEXT,
        CONF_DEFAULT_ACKNOWLEDGE_ACTION_TITLE: DEFAULT_ACKNOWLEDGE_ACTION_TITLE,
        CONF_DEFAULT_PERSON_ENTITY_IDS: "",
    }


def _options_schema(options: dict[str, Any]) -> vol.Schema:
    return vol.Schema(
        {
            vol.Optional(
                CONF_DEFAULT_NOTIFY_SERVICE,
                default=options.get(CONF_DEFAULT_NOTIFY_SERVICE, ""),
            ): str,
            vol.Optional(
                CONF_DEFAULT_USER_NAME,
                default=options.get(CONF_DEFAULT_USER_NAME, DEFAULT_USER_NAME),
            ): str,
            vol.Optional(
                CONF_DEFAULT_SNOOZE_DELAYS,
                default=options.get(
                    CONF_DEFAULT_SNOOZE_DELAYS,
                    ",".join(str(d) for d in DEFAULT_SNOOZE_DELAYS),
                ),
            ): str,
            vol.Optional(
                CONF_DEFAULT_WAIT_TIME_IF_NO_ACTION,
                default=options.get(
                    CONF_DEFAULT_WAIT_TIME_IF_NO_ACTION, DEFAULT_WAIT_TIME_IF_NO_ACTION
                ),
            ): vol.All(vol.Coerce(int), vol.Range(min=1)),
            vol.Optional(
                CONF_DEFAULT_NOTIFICATION_COUNT,
                default=options.get(
                    CONF_DEFAULT_NOTIFICATION_COUNT, DEFAULT_NOTIFICATION_COUNT
                ),
            ): vol.All(vol.Coerce(int), vol.Range(min=1)),
            vol.Optional(
                CONF_DEFAULT_SNOOZE_TEXT,
                default=options.get(CONF_DEFAULT_SNOOZE_TEXT, DEFAULT_SNOOZE_TEXT),
            ): str,
            vol.Optional(
                CONF_DEFAULT_ACKNOWLEDGE_ACTION_TITLE,
                default=options.get(
                    CONF_DEFAULT_ACKNOWLEDGE_ACTION_TITLE,
                    DEFAULT_ACKNOWLEDGE_ACTION_TITLE,
                ),
            ): str,
            vol.Optional(
                CONF_DEFAULT_PERSON_ENTITY_IDS,
                default=options.get(CONF_DEFAULT_PERSON_ENTITY_IDS, ""),
            ): str,
        }
    )


class RemindersConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle the single config entry for HA Reminders."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """First (and only) step: collect the global defaults."""
        if self._async_current_entries():
            return self.async_abort(reason="already_configured")

        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                options = dict(_default_options())
                options.update(user_input)
                options[CONF_DEFAULT_SNOOZE_DELAYS] = _parse_snooze_delays(
                    user_input.get(CONF_DEFAULT_SNOOZE_DELAYS, "")
                )
                return self.async_create_entry(
                    title="HA Reminders", data={}, options=options
                )
            except vol.Invalid:
                errors["base"] = "invalid_snooze_delays"

        return self.async_show_form(
            step_id="user",
            data_schema=_options_schema(_default_options()),
            errors=errors,
        )

    @staticmethod
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        return RemindersOptionsFlow(config_entry)


class RemindersOptionsFlow(config_entries.OptionsFlow):
    """Options flow: edit the global defaults."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        self._config_entry = config_entry

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        options = dict(self._config_entry.options or _default_options())
        errors: dict[str, str] = {}
        if user_input is not None:
            try:
                options.update(user_input)
                options[CONF_DEFAULT_SNOOZE_DELAYS] = _parse_snooze_delays(
                    user_input.get(CONF_DEFAULT_SNOOZE_DELAYS, "")
                )
                return self.async_create_entry(title="", data=options)
            except vol.Invalid:
                errors["base"] = "invalid_snooze_delays"

        return self.async_show_form(
            step_id="init",
            data_schema=_options_schema(options),
            errors=errors,
        )
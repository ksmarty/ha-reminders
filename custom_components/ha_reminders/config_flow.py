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
from homeassistant.helpers import config_validation as cv

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
from .util import as_list


def _parse_snooze_delays(value: str) -> list[int]:
    """Validate a comma separated snooze delay string."""
    try:
        delays = [int(part.strip()) for part in str(value).split(",") if part.strip()]
    except ValueError as err:
        raise vol.Invalid("invalid_snooze_delays") from err
    if not delays or any(delay < 1 for delay in delays):
        raise vol.Invalid("invalid_snooze_delays")
    return list(dict.fromkeys(delays))


def _format_snooze_delays(delays: list[int] | tuple[int, ...]) -> str:
    """Render snooze delays as a comma separated string for storage."""
    return ",".join(str(delay) for delay in delays)


def _default_options() -> dict[str, Any]:
    return {
        CONF_DEFAULT_NOTIFY_SERVICE: "",
        CONF_DEFAULT_USER_NAME: DEFAULT_USER_NAME,
        CONF_DEFAULT_SNOOZE_DELAYS: _format_snooze_delays(DEFAULT_SNOOZE_DELAYS),
        CONF_DEFAULT_WAIT_TIME_IF_NO_ACTION: DEFAULT_WAIT_TIME_IF_NO_ACTION,
        CONF_DEFAULT_NOTIFICATION_COUNT: DEFAULT_NOTIFICATION_COUNT,
        CONF_DEFAULT_SNOOZE_TEXT: DEFAULT_SNOOZE_TEXT,
        CONF_DEFAULT_ACKNOWLEDGE_ACTION_TITLE: DEFAULT_ACKNOWLEDGE_ACTION_TITLE,
        CONF_DEFAULT_PERSON_ENTITY_IDS: "",
    }


class RemindersConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle the single config entry for HA Reminders."""

    VERSION = 1

    def _notify_services(self) -> list[str]:
        """Return every domain that offers a `notify` service."""
        services = self.hass.services.async_services()
        return sorted(
            domain
            for domain, domain_services in services.items()
            if "notify" in domain_services
        )

    def _person_options(self) -> dict[str, str]:
        """Return {entity_id: label} for every person entity."""
        return {
            state.entity_id: str(
                state.attributes.get("friendly_name") or state.entity_id
            )
            for state in self.hass.states.async_all("person")
        }

    def _options_schema(self, options: dict[str, Any]) -> vol.Schema:
        """Build the defaults form with entity dropdowns where applicable."""
        notify_services = self._notify_services()
        current_notify = str(options.get(CONF_DEFAULT_NOTIFY_SERVICE, ""))
        if current_notify and current_notify not in notify_services:
            # Keep an already-configured value selectable even if the service
            # is temporarily unavailable.
            notify_services = [current_notify] + notify_services

        persons = self._person_options()
        for existing in as_list(options.get(CONF_DEFAULT_PERSON_ENTITY_IDS)):
            persons.setdefault(existing, existing)
        person_default = as_list(options.get(CONF_DEFAULT_PERSON_ENTITY_IDS))

        stored_delays = options.get(
            CONF_DEFAULT_SNOOZE_DELAYS,
            _format_snooze_delays(DEFAULT_SNOOZE_DELAYS),
        )
        if isinstance(stored_delays, (list, tuple)):
            stored_delays = _format_snooze_delays(stored_delays)

        schema: dict[vol.Optional, Any] = {
            vol.Optional(
                CONF_DEFAULT_NOTIFY_SERVICE, default=current_notify
            ): vol.In([""] + notify_services),
            vol.Optional(
                CONF_DEFAULT_USER_NAME,
                default=options.get(CONF_DEFAULT_USER_NAME, DEFAULT_USER_NAME),
            ): str,
            vol.Optional(
                CONF_DEFAULT_SNOOZE_DELAYS, default=stored_delays
            ): vol.All(str, _parse_snooze_delays),
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
        }
        if persons:
            schema[vol.Optional(CONF_DEFAULT_PERSON_ENTITY_IDS, default=person_default)] = (
                cv.multi_select(persons)
            )
        else:
            schema[
                vol.Optional(
                    CONF_DEFAULT_PERSON_ENTITY_IDS,
                    default=options.get(CONF_DEFAULT_PERSON_ENTITY_IDS, ""),
                )
            ] = str
        return vol.Schema(schema)

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
                options[CONF_DEFAULT_SNOOZE_DELAYS] = _format_snooze_delays(
                    _parse_snooze_delays(
                        user_input.get(CONF_DEFAULT_SNOOZE_DELAYS, "")
                    )
                )
                return self.async_create_entry(
                    title="HA Reminders", data={}, options=options
                )
            except vol.Invalid:
                errors["base"] = "invalid_snooze_delays"

        return self.async_show_form(
            step_id="user",
            data_schema=self._options_schema(_default_options()),
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
                options[CONF_DEFAULT_SNOOZE_DELAYS] = _format_snooze_delays(
                    _parse_snooze_delays(
                        user_input.get(CONF_DEFAULT_SNOOZE_DELAYS, "")
                    )
                )
                return self.async_create_entry(title="", data=options)
            except vol.Invalid:
                errors["base"] = "invalid_snooze_delays"

        return self.async_show_form(
            step_id="init",
            data_schema=self._options_schema(options),
            errors=errors,
        )
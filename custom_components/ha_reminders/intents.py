"""Intent handlers for the Assist voice integration.

Sentence templates live in the companion `custom_sentences/en/reminders.yaml`
file which the user copies into their HA `custom_sentences/` directory (HACS
cannot install it for you).

The `{zone}` slot is a named wildcard list in that file; the handler resolves
the spoken words against `zone.*` entity names here.
"""

from __future__ import annotations

import difflib
import logging
from datetime import timedelta
from typing import Any

import voluptuous as vol

from homeassistant.core import HomeAssistant
from homeassistant.helpers import intent
from homeassistant.util import dt as dt_util

from .const import (
    DOMAIN,
    TRIGGER_TIME,
    TRIGGER_ZONE_ENTER,
    TRIGGER_ZONE_LEAVE,
)
from .coordinator import ReminderCoordinator
from .models import Reminder
from .util import (
    normalize_word,
    parse_spoken_number,
    parse_time_text,
)

_LOGGER = logging.getLogger(__name__)


def async_setup_intents(hass: HomeAssistant) -> None:
    """Register every intent handler."""
    intent.async_register(hass, ReminderCreateIntent())
    intent.async_register(hass, ReminderListIntent())
    intent.async_register(hass, ReminderCompleteIntent())
    intent.async_register(hass, ReminderDeleteIntent())
    intent.async_register(hass, ReminderSnoozeIntent())


class _ReminderIntent(intent.IntentHandler):
    """Base class with shared resolution helpers."""

    def _coordinator(self, hass: HomeAssistant) -> ReminderCoordinator:
        coordinator = hass.data.setdefault(DOMAIN, {}).get("coordinator")
        if coordinator is None:
            raise intent.IntentHandleError(
                "The HA Reminders integration is not configured yet."
            )
        return coordinator

    def _resolve_reminder_by_title(
        self, hass: HomeAssistant, title: str
    ) -> Reminder:
        coordinator = self._coordinator(hass)
        target = normalize_word(title)
        if not target:
            raise intent.IntentHandleError("I need a reminder title.")

        exact = [r for r in coordinator.data if normalize_word(r.title) == target]
        if len(exact) == 1:
            return exact[0]
        if len(exact) > 1:
            raise intent.IntentHandleError(
                "There are several reminders with that title, please be more "
                "specific."
            )

        partial = [
            r for r in coordinator.data if target in normalize_word(r.title)
        ]
        if len(partial) == 1:
            return partial[0]
        if len(partial) > 1:
            names = ", ".join(r.title for r in partial)
            raise intent.IntentHandleError(
                f"Several reminders match: {names}. Please say the full title."
            )
        raise intent.IntentHandleError(
            f"I could not find a reminder called {title}."
        )

    def _resolve_reminder_by_number(
        self, hass: HomeAssistant, value: str
    ) -> Reminder:
        coordinator = self._coordinator(hass)
        index = parse_spoken_number(value)
        if index is None or index < 1:
            raise intent.IntentHandleError(
                f"I could not understand the number {value}."
            )
        pending = [r for r in coordinator.data if r.enabled]
        if index > len(pending):
            raise intent.IntentHandleError(
                f"There are only {len(pending)} reminders."
            )
        return pending[index - 1]

    def _resolve_zone(self, hass: HomeAssistant, zone_text: str) -> str:
        """Map spoken words to a `zone.*` entity id."""
        zones = [
            state
            for state in hass.states.async_all("zone")
            if not state.entity_id.startswith("zone.zone_")
        ]
        if not zones:
            raise intent.IntentHandleError("No zones are defined.")

        target = normalize_word(zone_text)
        if not target:
            raise intent.IntentHandleError("I need a zone name.")

        names = {
            state.entity_id: normalize_word(
                state.attributes.get("friendly_name")
                or state.entity_id.removeprefix("zone.")
            )
            for state in zones
        }
        for entity_id, name in names.items():
            if name == target or target == normalize_word(
                entity_id.removeprefix("zone.")
            ):
                return entity_id

        partial = [
            entity_id
            for entity_id, name in names.items()
            if target in name or name in target
        ]
        if len(partial) == 1:
            return partial[0]
        if len(partial) > 1:
            raise intent.IntentHandleError(
                "Several zones match, please be more specific."
            )

        close = difflib.get_close_matches(
            target, list(names.values()), n=1, cutoff=0.6
        )
        if close:
            for entity_id, name in names.items():
                if name == close[0]:
                    return entity_id

        raise intent.IntentHandleError(
            "I could not find a zone called "
            f"{zone_text}. Available zones: {', '.join(sorted(set(names.values())))}."
        )


class ReminderCreateIntent(_ReminderIntent):
    """Create a time or zone based reminder."""

    intent_type = "ReminderCreate"
    slot_schema = vol.Schema(
        {
            vol.Required("title"): str,
            vol.Optional("direction"): str,
            vol.Optional("zone"): str,
            vol.Optional("minutes"): str,
            vol.Optional("time"): str,
        },
        extra=vol.ALLOW_EXTRA,
    )

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        coordinator = self._coordinator(hass)
        slots = intent_obj.slots
        title = str(slots.get("title", "")).strip()
        if not title:
            raise intent.IntentHandleError("I need something to remind you about.")

        payload: dict[str, Any] = {
            "title": title,
            "message": title,
            "trigger_type": TRIGGER_TIME,
        }
        speech = ""

        if direction := str(slots.get("direction") or "").strip():
            zone_text = str(slots.get("zone") or "").strip()
            zone_entity_id = self._resolve_zone(hass, zone_text)
            payload["zone_entity_id"] = zone_entity_id
            if direction == "enter":
                payload["trigger_type"] = TRIGGER_ZONE_ENTER
                speech = (
                    f"Got it. I will remind you to {title} when you get to "
                    f"{zone_text}."
                )
            else:
                payload["trigger_type"] = TRIGGER_ZONE_LEAVE
                speech = (
                    f"Got it. I will remind you to {title} when you leave "
                    f"{zone_text}."
                )
            coordinator.apply_voice_defaults(payload)
        elif minutes := str(slots.get("minutes") or "").strip():
            duration = parse_spoken_number(minutes)
            if duration is None or duration < 1:
                raise intent.IntentHandleError(
                    "I could not understand the duration. Please say something "
                    "like 'remind me in 15 minutes'."
                )
            fire_at = dt_util.now().replace(tzinfo=None) + timedelta(
                minutes=duration
            )
            payload.update(
                {
                    "start_date": fire_at.date().isoformat(),
                    "time": fire_at.strftime("%H:%M"),
                    "one_shot": True,
                    "notification_count": 1,
                }
            )
            speech = (
                f"Got it. I will remind you to {title} in {duration} minutes."
            )
        elif time_text := str(slots.get("time") or "").strip():
            fire_time = parse_time_text(time_text)
            if fire_time is None:
                raise intent.IntentHandleError(
                    "I could not understand the time. Please say something "
                    "like 'at 8 pm' or 'at 20:00'."
                )
            now_local = dt_util.now().replace(tzinfo=None)
            start_date = now_local.date()
            if fire_time <= now_local.time():
                start_date += timedelta(days=1)
            payload.update(
                {
                    "start_date": start_date.isoformat(),
                    "time": fire_time.strftime("%H:%M"),
                }
            )
            speech = (
                f"Got it. I will remind you to {title} every day at "
                f"{fire_time.strftime('%I:%M %p').lstrip('0')}."
            )
        else:
            raise intent.IntentHandleError(
                "I did not understand when you want to be reminded. Try "
                "\"remind me to ... in 30 minutes\", \"... at 8 pm\", or "
                "\"... when I get home\"."
            )

        await coordinator.async_create(payload)
        response = intent_obj.create_response()
        response.async_set_speech(speech)
        return response


class ReminderListIntent(_ReminderIntent):
    """Read back the pending reminders."""

    intent_type = "ReminderList"

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        coordinator = self._coordinator(intent_obj.hass)
        pending = [r for r in coordinator.data if r.enabled]
        if not pending:
            speech = "You have no reminders."
        else:
            lines = ", ".join(
                f"{i}. {r.title}" for i, r in enumerate(pending, start=1)
            )
            speech = f"You have {len(pending)} reminders: {lines}."
        response = intent_obj.create_response()
        response.async_set_speech(speech)
        return response


class ReminderCompleteIntent(_ReminderIntent):
    """Mark a reminder as done."""

    intent_type = "ReminderComplete"
    slot_schema = vol.Schema(
        {
            vol.Required("title"): str,
        },
        extra=vol.ALLOW_EXTRA,
    )

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        reminder = self._resolve_reminder_by_title(
            intent_obj.hass, str(intent_obj.slots.get("title", ""))
        )
        await self._coordinator(intent_obj.hass).async_complete(reminder.id)
        response = intent_obj.create_response()
        response.async_set_speech(f"Marked {reminder.title} as complete.")
        return response


class ReminderDeleteIntent(_ReminderIntent):
    """Delete a reminder."""

    intent_type = "ReminderDelete"
    slot_schema = vol.Schema(
        {
            vol.Optional("title"): str,
            vol.Optional("number"): str,
        },
        extra=vol.ALLOW_EXTRA,
    )

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        slots = intent_obj.slots
        number = str(slots.get("number") or "").strip()
        title = str(slots.get("title") or "").strip()
        if number:
            reminder = self._resolve_reminder_by_number(hass, number)
        elif title:
            reminder = self._resolve_reminder_by_title(hass, title)
        else:
            raise intent.IntentHandleError(
                "Tell me which reminder to delete, for example "
                "\"delete reminder number 2\"."
            )
        await self._coordinator(hass).async_delete(reminder.id)
        response = intent_obj.create_response()
        response.async_set_speech(f"Deleted the reminder {reminder.title}.")
        return response


class ReminderSnoozeIntent(_ReminderIntent):
    """Snooze a reminder."""

    intent_type = "ReminderSnooze"
    slot_schema = vol.Schema(
        {
            vol.Required("title"): str,
            vol.Optional("minutes"): str,
        },
        extra=vol.ALLOW_EXTRA,
    )

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        reminder = self._resolve_reminder_by_title(
            hass, str(intent_obj.slots.get("title", ""))
        )
        minutes = parse_spoken_number(
            str(intent_obj.slots.get("minutes") or "")
        )
        if minutes is None or minutes < 1:
            minutes = 15
        await self._coordinator(hass).async_snooze(reminder.id, minutes)
        response = intent_obj.create_response()
        response.async_set_speech(
            f"Okay, I snoozed {reminder.title} for {minutes} minutes."
        )
        return response
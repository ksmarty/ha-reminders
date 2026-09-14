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
from collections.abc import Iterable, Mapping
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

#: Jaccard overlap between two titles above which they are treated as the same
#: task. "pack a work sweater" vs "pack a work sludder" scores 0.75; two
#: genuinely different tasks sharing one word score far lower.
SIMILAR_TITLE_THRESHOLD = 0.6


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


def _slot_value(slots: Mapping[str, Any], name: str) -> Any:
    """Return a slot's spoken value.

    Home Assistant wraps every slot as ``{"value": ..., "text": ...}`` (see
    `IntentHandler._slot_schema`), so handlers must not assume plain strings.
    """
    slot = slots.get(name)
    if isinstance(slot, Mapping):
        slot = slot.get("value", slot.get("text"))
    return slot


def _slot_text(slots: Mapping[str, Any], name: str) -> str:
    """Return a slot's value as trimmed text ("" when absent)."""
    value = _slot_value(slots, name)
    return "" if value is None else str(value).strip()


def _title_key(title: str) -> str:
    """Reduce a title to a comparable key: lowercase, single-spaced, no punctuation.

    Speech recognition mangles the odd word ("sweater" heard as "sludder"), so
    exact matching would miss the duplicates this is meant to catch.
    """
    return " ".join("".join(c if c.isalnum() else " " for c in title.lower()).split())


def _title_tokens(title: str) -> set[str]:
    return set(_title_key(title).split())


def find_similar_reminder(
    reminders: Iterable[Any], title: str
) -> Any | None:
    """Return an existing enabled reminder that looks like ``title``, if any.

    Only *similar* titles count — two different tasks that happen to share a
    word ("pack a sweater" / "pack a lunch") are not duplicates, so a match
    needs either identical keys or a clear overlap between the titles. Zone and
    time reminders are both considered: asking for the same task twice is the
    signal, however it is triggered.
    """
    key = _title_key(title)
    if not key:
        return None
    wanted = _title_tokens(title)

    best = None
    best_score = 0.0
    for reminder in reminders:
        if not getattr(reminder, "enabled", True):
            continue
        existing_key = _title_key(getattr(reminder, "title", "") or "")
        if not existing_key:
            continue
        if existing_key == key:
            return reminder
        existing = _title_tokens(existing_key)
        if not wanted or not existing:
            continue
        score = len(wanted & existing) / len(wanted | existing)
        if score >= SIMILAR_TITLE_THRESHOLD and score > best_score:
            best, best_score = reminder, score
    return best


class ReminderCreateIntent(_ReminderIntent):
    """Create a time or zone based reminder."""

    intent_type = "ReminderCreate"
    description = (
        "Create a reminder for the user. Put the task in 'title'. For a "
        "location reminder, set 'direction' to enter or leave and name the "
        "zone (for example home or work) in 'zone'. For a relative reminder, "
        "set 'minutes'. For a daily reminder, set 'time' (for example 8 pm)."
    )

    @property
    def slot_schema(self) -> dict:
        """Slot schema (HA wraps each value as {"value": ..., "text": ...})."""
        return {
            vol.Required("title"): vol.Any(str, int, float),
            vol.Optional("direction"): vol.In(["enter", "leave"]),
            vol.Optional("zone"): str,
            vol.Optional("minutes"): vol.Any(str, int, float),
            vol.Optional("time"): vol.Any(str, int, float),
        }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        coordinator = self._coordinator(hass)
        slots = self.async_validate_slots(intent_obj.slots)
        title = _slot_text(slots, "title")
        if not title:
            raise intent.IntentHandleError("I need something to remind you about.")

        payload: dict[str, Any] = {
            "title": title,
            "message": title,
            "trigger_type": TRIGGER_TIME,
        }
        speech = ""

        if direction := _slot_text(slots, "direction"):
            zone_text = _slot_text(slots, "zone")
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
        elif (minutes_value := _slot_value(slots, "minutes")) is not None:
            duration = parse_spoken_number(minutes_value)
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
        elif time_text := _slot_text(slots, "time"):
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

        # Asking for the same task twice used to silently create a second
        # reminder — speech recognition made it near-impossible to spot, since
        # the two titles differed by a misheard word. Update the existing one
        # instead, which is what the follow-up request means in practice.
        existing = find_similar_reminder(coordinator.data, title)
        if existing is not None:
            updates = {k: v for k, v in payload.items() if k != "title"}
            if existing.title != title:
                updates["title"] = title
                updates["message"] = title
            await coordinator.async_update(existing.id, updates)
            response = intent_obj.create_response()
            response.async_set_speech(
                f"{existing.title} is already on your list, so I updated it "
                "instead of adding a second reminder."
            )
            return response

        reminder_id = await coordinator.async_create(payload)
        created = coordinator.get(reminder_id)
        if created is not None and coordinator.would_broadcast(created):
            speech += (
                " Note: your default notification service notifies every "
                "device. Set a specific one in the integration options to "
                "reach a single device."
            )

        response = intent_obj.create_response()
        response.async_set_speech(speech)
        return response


class ReminderListIntent(_ReminderIntent):
    """Read back the pending reminders."""

    intent_type = "ReminderList"
    description = "List the user's reminders and their current status."

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        self.async_validate_slots(intent_obj.slots)
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
    description = "Mark one of the user's reminders as done, by its title."

    @property
    def slot_schema(self) -> dict:
        return {vol.Required("title"): vol.Any(str, int, float)}

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        slots = self.async_validate_slots(intent_obj.slots)
        reminder = self._resolve_reminder_by_title(
            intent_obj.hass, _slot_text(slots, "title")
        )
        await self._coordinator(intent_obj.hass).async_complete(reminder.id)
        response = intent_obj.create_response()
        response.async_set_speech(f"Marked {reminder.title} as complete.")
        return response


class ReminderDeleteIntent(_ReminderIntent):
    """Delete a reminder."""

    intent_type = "ReminderDelete"
    description = (
        "Delete one of the user's reminders, either by its title or by the "
        "number it has in the reminder list."
    )

    @property
    def slot_schema(self) -> dict:
        return {
            vol.Optional("title"): vol.Any(str, int, float),
            vol.Optional("number"): vol.Any(str, int, float),
        }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        slots = self.async_validate_slots(intent_obj.slots)
        number = _slot_text(slots, "number")
        title = _slot_text(slots, "title")
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
    description = (
        "Snooze a reminder's notification for a number of minutes, by title."
    )

    @property
    def slot_schema(self) -> dict:
        return {
            vol.Required("title"): vol.Any(str, int, float),
            vol.Optional("minutes"): vol.Any(str, int, float),
        }

    async def async_handle(self, intent_obj: intent.Intent) -> intent.IntentResponse:
        hass = intent_obj.hass
        slots = self.async_validate_slots(intent_obj.slots)
        reminder = self._resolve_reminder_by_title(hass, _slot_text(slots, "title"))
        minutes = parse_spoken_number(_slot_value(slots, "minutes"))
        if minutes is None or minutes < 1:
            minutes = 15
        await self._coordinator(hass).async_snooze(reminder.id, minutes)
        response = intent_obj.create_response()
        response.async_set_speech(
            f"Okay, I snoozed {reminder.title} for {minutes} minutes."
        )
        return response
"""Coordinator for HA Reminders.

Holds the in-memory reminder list, persists it through the store, computes the
runtime state exposed to the sensor entities, and drives the notification
lifecycle (fire -> resend -> acknowledge/snooze) in cooperation with the
scheduler.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, Mapping

from homeassistant.core import Event, HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from . import notify
from .const import (
    ATTR_NEXT_FIRE,
    ATTR_NOTIFIED_COUNT,
    ATTR_REMINDER_ID,
    ATTR_SNOOZE_UNTIL,
    ATTR_STATUS,
    CONF_DEFAULT_ACKNOWLEDGE_ACTION_TITLE,
    CONF_DEFAULT_NOTIFICATION_COUNT,
    CONF_DEFAULT_NOTIFY_SERVICE,
    CONF_DEFAULT_PERSON_ENTITY_IDS,
    CONF_DEFAULT_SNOOZE_DELAYS,
    CONF_DEFAULT_SNOOZE_TEXT,
    CONF_DEFAULT_USER_NAME,
    CONF_DEFAULT_WAIT_TIME_IF_NO_ACTION,
    DOMAIN,
    TRIGGER_ZONE_ENTER,
    TRIGGER_ZONE_LEAVE,
)
from .models import Reminder, compute_status
from .scheduler import KIND_OCCURRENCE, ReminderScheduler
from .store import ReminderStore
from .util import as_list, local_now

_LOGGER = logging.getLogger(__name__)


def _naive_now() -> datetime:
    return local_now()


class ReminderCoordinator(DataUpdateCoordinator[list[Reminder]]):
    """Owns reminder records, their runtime state and the notification loop."""

    def __init__(self, hass: HomeAssistant, options: Mapping[str, Any]) -> None:
        super().__init__(hass, _LOGGER, name=DOMAIN, update_interval=None)
        self._store = ReminderStore(hass)
        self._options = dict(options or {})
        self._reminders: list[Reminder] = []
        self._runtime: dict[str, dict[str, Any]] = {}
        self._scheduler: ReminderScheduler | None = None
        self._person_reminder_map: dict[str, list[Reminder]] = {}

    # ------------------------------------------------------------------
    # DataUpdateCoordinator
    # ------------------------------------------------------------------
    async def _async_update_data(self) -> list[Reminder]:
        """Load persisted reminders (called once at first refresh)."""
        self._reminders = await self._store.async_load()
        for reminder in self._reminders:
            self._runtime.setdefault(reminder.id, {})
        self._rebuild_person_map()
        return self._reminders

    # ------------------------------------------------------------------
    # Public accessors
    # ------------------------------------------------------------------
    @property
    def data(self) -> list[Reminder]:
        return self._reminders

    @property
    def options(self) -> dict[str, Any]:
        return dict(self._options)

    def get(self, reminder_id: str) -> Reminder | None:
        """Return a reminder by id."""
        return next((r for r in self._reminders if r.id == reminder_id), None)

    def runtime_of(self, reminder_id: str) -> dict[str, Any]:
        """Return the mutable runtime state dict for a reminder."""
        return self._runtime.setdefault(reminder_id, {})

    def zone_reminders_for(self, person: str) -> list[Reminder]:
        """Return zone reminders watching the given person entity."""
        return list(self._person_reminder_map.get(person, []))

    def describe(self, reminder: Reminder) -> dict[str, Any]:
        """Merge the record with runtime info (service list / sensor attrs)."""
        data = reminder.to_dict()
        runtime = self.runtime_of(reminder.id)
        data[ATTR_REMINDER_ID] = reminder.id
        data[ATTR_STATUS] = compute_status(reminder, runtime, _naive_now())
        data[ATTR_NEXT_FIRE] = (
            runtime.get("next_fire").isoformat()
            if isinstance(runtime.get("next_fire"), datetime)
            else None
        )
        data[ATTR_SNOOZE_UNTIL] = (
            runtime.get("snooze_until").isoformat()
            if isinstance(runtime.get("snooze_until"), datetime)
            else None
        )
        data[ATTR_NOTIFIED_COUNT] = int(runtime.get("notified_count", 0))
        return data

    # ------------------------------------------------------------------
    # CRUD (all mutations persist, then notify listeners)
    # ------------------------------------------------------------------
    async def async_create(self, payload: dict[str, Any]) -> str:
        """Create a reminder applying global defaults; returns its id."""
        data = dict(self._defaults_for(payload))
        data.update(payload)
        try:
            reminder = Reminder.from_dict(data)
        except (TypeError, ValueError) as err:
            raise HomeAssistantError(str(err)) from err
        self._reminders.append(reminder)
        self._runtime[reminder.id] = {}
        await self._persist_and_refresh()
        _LOGGER.debug("Created reminder %s (%s)", reminder.id, reminder.title)
        return reminder.id

    async def async_update(
        self, reminder_id: str, payload: dict[str, Any]
    ) -> None:
        """Merge a partial payload into an existing reminder (full replace of
        any listed field)."""
        reminder = self.get(reminder_id)
        if reminder is None:
            raise HomeAssistantError(f"Unknown reminder id: {reminder_id}")
        merged = dict(reminder.to_dict())
        merged.update(payload)
        try:
            updated = Reminder.from_dict(merged)
            updated.id = reminder_id
        except (TypeError, ValueError) as err:
            raise HomeAssistantError(str(err)) from err
        index = self._reminders.index(reminder)
        self._reminders[index] = updated
        await self._persist_and_refresh()

    async def async_delete(self, reminder_id: str) -> None:
        """Remove a reminder."""
        reminder = self.get(reminder_id)
        if reminder is None:
            raise HomeAssistantError(f"Unknown reminder id: {reminder_id}")
        self._reminders.remove(reminder)
        self._runtime.pop(reminder_id, None)
        await self._persist_and_refresh()

    async def async_set_enabled(self, reminder_id: str, enabled: bool) -> None:
        """Enable or disable a reminder."""
        reminder = self.get(reminder_id)
        if reminder is None:
            raise HomeAssistantError(f"Unknown reminder id: {reminder_id}")
        reminder.enabled = bool(enabled)
        if enabled:
            # Re-arm a completed cycle when re-enabled.
            self.runtime_of(reminder_id)["completed"] = False
        await self._persist_and_refresh()

    async def async_snooze(self, reminder_id: str, minutes: int) -> None:
        """Snooze a reminder notification for `minutes`."""
        reminder = self.get(reminder_id)
        if reminder is None:
            raise HomeAssistantError(f"Unknown reminder id: {reminder_id}")
        runtime = self.runtime_of(reminder_id)
        runtime["snooze_until"] = _naive_now() + timedelta(minutes=int(minutes))
        runtime.pop("next_resend", None)
        runtime["cycle_active"] = True
        runtime["next_fire"] = runtime["snooze_until"]
        await self._persist_and_refresh()

    async def async_complete(
        self, reminder_id: str, user_name: str | None = None
    ) -> None:
        """Acknowledge a reminder: run ack actions, notify the group."""
        reminder = self.get(reminder_id)
        if reminder is None:
            raise HomeAssistantError(f"Unknown reminder id: {reminder_id}")
        runtime = self.runtime_of(reminder_id)
        acknowledged_by = (user_name or reminder.user_name) or reminder.user_name

        await self._run_acknowledge_actions(reminder)
        await self._notify_group_completed(reminder, acknowledged_by)

        runtime["completed"] = True
        runtime["cycle_active"] = False
        runtime["snooze_until"] = None
        runtime["next_fire"] = None
        runtime.pop("next_resend", None)
        runtime["notified_count"] = 0
        await self._persist_and_refresh()
        _LOGGER.debug("Reminder %s completed by %s", reminder.id, acknowledged_by)

    # ------------------------------------------------------------------
    # Notification lifecycle (called by the scheduler)
    # ------------------------------------------------------------------
    async def async_notify_fired(
        self, reminder_id: str, kind: str = KIND_OCCURRENCE
    ) -> None:
        """A timer fired: start/resume the notification loop for a reminder."""
        reminder = self.get(reminder_id)
        if reminder is None:
            return
        runtime = self.runtime_of(reminder_id)

        runtime.pop("snooze_until", None)
        if kind == KIND_OCCURRENCE:
            runtime["completed"] = False
            runtime["one_shot_fired"] = False

        if runtime.get("cycle_active") and runtime.get("notified_count", 0) >= (
            reminder.notification_count
        ):
            runtime["cycle_active"] = False
            runtime.pop("next_resend", None)
            await self._persist_and_refresh()
            return

        if not runtime.get("cycle_active"):
            runtime["cycle_active"] = True
            runtime["notified_count"] = 0

        runtime["notified_count"] = int(runtime.get("notified_count", 0)) + 1

        if reminder.one_shot:
            # Single delivery: send once, then close the cycle.
            await notify.async_send_reminder(self.hass, reminder)
            runtime["one_shot_fired"] = True
            runtime["completed"] = True
            runtime["cycle_active"] = False
            runtime["next_fire"] = None
            runtime.pop("next_resend", None)
            await self._persist_and_refresh()
            return

        await notify.async_send_reminder(self.hass, reminder)

        if runtime["notified_count"] < reminder.notification_count:
            runtime["next_resend"] = _naive_now() + timedelta(
                minutes=reminder.wait_time_if_no_action
            )
            runtime["next_fire"] = runtime["next_resend"]
        else:
            runtime["cycle_active"] = False
            runtime["next_fire"] = None
            runtime.pop("next_resend", None)
        await self._persist_and_refresh()

    async def async_handle_action_event(self, event: Event) -> None:
        """Handle a mobile_app_notification_action event."""
        action = (event.data or {}).get("action")
        if not isinstance(action, str):
            return
        parsed = notify.parse_action(action)
        if parsed is None:
            return
        _, reminder_id, _, minutes, _user = parsed
        if self.get(reminder_id) is None:
            return
        if minutes == -1:
            await self.async_complete(reminder_id, user_name=_user or None)
        else:
            await self.async_snooze(reminder_id, minutes)

    # ------------------------------------------------------------------
    # Scheduler wiring
    # ------------------------------------------------------------------
    def set_scheduler(self, scheduler: ReminderScheduler) -> None:
        self._scheduler = scheduler

    def async_refresh(self) -> None:
        """Publish current data to listeners (sensors, scheduler)."""
        self.async_set_updated_data(self._reminders)

    def async_shutdown(self) -> None:
        """Stop the scheduler and drop coordinator state."""
        if self._scheduler is not None:
            self._scheduler.async_shutdown()
            self._scheduler = None

    # ------------------------------------------------------------------
    # Internals
    # ------------------------------------------------------------------
    def _defaults_for(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Defaults applied to new reminders from the config entry options."""
        options = self._options
        defaults: dict[str, Any] = {
            "user_name": str(
                options.get(CONF_DEFAULT_USER_NAME) or ""
            ) or None,
            "snooze_delays": as_list(
                options.get(CONF_DEFAULT_SNOOZE_DELAYS), int
            )
            or None,
            "snooze_text": options.get(CONF_DEFAULT_SNOOZE_TEXT) or None,
            "acknowledge_action_title": options.get(
                CONF_DEFAULT_ACKNOWLEDGE_ACTION_TITLE
            )
            or None,
            "wait_time_if_no_action": options.get(
                CONF_DEFAULT_WAIT_TIME_IF_NO_ACTION
            ),
            "notification_count": options.get(CONF_DEFAULT_NOTIFICATION_COUNT),
        }
        if not payload.get("notify_service"):
            defaults["notify_service"] = options.get(CONF_DEFAULT_NOTIFY_SERVICE)
        return {k: v for k, v in defaults.items() if v is not None}

    def _rebuild_person_map(self) -> None:
        person_map: dict[str, list[Reminder]] = {}
        for reminder in self._reminders:
            if reminder.is_zone_trigger():
                for person in reminder.person_entity_ids:
                    person_map.setdefault(person, []).append(reminder)
        self._person_reminder_map = person_map

    def _apply_voice_person_defaults(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Fill person entities for voice-created zone reminders."""
        if not payload.get("person_entity_ids"):
            configured = as_list(self._options.get(CONF_DEFAULT_PERSON_ENTITY_IDS))
            if configured:
                payload["person_entity_ids"] = configured
            else:
                payload["person_entity_ids"] = [
                    state.entity_id
                    for state in self.hass.states.async_all("person")
                ]
        return payload

    def apply_voice_defaults(self, payload: dict[str, Any]) -> dict[str, Any]:
        """Public hook used by the intent handlers before creating."""
        if payload.get("trigger_type") in (TRIGGER_ZONE_ENTER, TRIGGER_ZONE_LEAVE):
            self._apply_voice_person_defaults(payload)
        return payload

    async def _run_acknowledge_actions(self, reminder: Reminder) -> None:
        """Execute the configure acknowledge actions (service calls)."""
        for action in reminder.acknowledge_actions or []:
            if not isinstance(action, dict):
                continue
            service = action.get("service") or action.get("action")
            if not isinstance(service, str) or "." not in service:
                _LOGGER.warning(
                    "Skipping acknowledge action without 'domain.service': %s",
                    action,
                )
                continue
            domain, service_name = service.split(".", 1)
            data = action.get("data") or action.get("service_data") or {}
            try:
                await self.hass.services.async_call(domain, service_name, data)
            except Exception:  # noqa: BLE001 - never let one bad action break ack
                _LOGGER.exception("Acknowledge action failed for %s", reminder.id)

    async def _notify_group_completed(
        self, reminder: Reminder, acknowledged_by: str
    ) -> None:
        """Tell the rest of a notification group that the task is done."""
        if not reminder.notification_group:
            return
        for other in self._reminders:
            if other.id == reminder.id:
                continue
            if other.notification_group != reminder.notification_group:
                continue
            try:
                await notify.async_send_acknowledged(
                    self.hass, other, acknowledged_by
                )
            except Exception:  # noqa: BLE001
                _LOGGER.exception(
                    "Failed to notify group member %s about completion", other.id
                )

    async def _persist_and_refresh(self) -> None:
        """Persist the list and push the new state to all listeners."""
        await self._store.async_save(self._reminders)
        self._rebuild_person_map()
        self.async_refresh()
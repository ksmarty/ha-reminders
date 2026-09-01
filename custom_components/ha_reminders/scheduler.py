"""Scheduling for HA Reminders.

Owns every timer (next occurrence, resend, snooze) plus the zone state-change
listeners. On every coordinator data change the whole schedule is rebuilt,
which keeps the timers consistent with CRUD operations at the cost of a few
cheap resubscribes.
"""

from __future__ import annotations

import logging
from datetime import datetime, timedelta
from typing import Any, Callable

from homeassistant.core import Event, HomeAssistant, State
from homeassistant.helpers.event import (
    async_track_point_in_utc_time,
    async_track_state_change_event,
)
from homeassistant.util import dt as dt_util

from .const import TRIGGER_ZONE_ENTER, TRIGGER_ZONE_LEAVE
from .models import Reminder

_LOGGER = logging.getLogger(__name__)

# Timer kinds used to tell the coordinator why a fire happened.
KIND_OCCURRENCE = "occurrence"
KIND_RESEND = "resend"
KIND_SNOOZE = "snooze"
KIND_ROLLOVER = "rollover"


def _is_in_zone(state: State | None, zone_entity_id: str) -> bool:
    """True when a person state is currently inside the given zone."""
    return bool(state is not None and state.state == zone_entity_id)


class ReminderScheduler:
    """Reschedules everything whenever the coordinator data changes."""

    def __init__(self, hass: HomeAssistant, coordinator: Any) -> None:
        self._hass = hass
        self._coordinator = coordinator
        self._timers: dict[str, Callable[[], None]] = {}
        self._zone_unsub: Callable[[], None] | None = None
        self._zone_persons: set[str] = set()
        self._unsubs: list[Callable[[], None]] = []
        self._unsubs.append(coordinator.async_add_listener(self._handle_data_change))

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------
    def async_shutdown(self) -> None:
        """Cancel every timer and listener."""
        for unsub in self._timers.values():
            unsub()
        self._timers.clear()
        if self._zone_unsub is not None:
            self._zone_unsub()
            self._zone_unsub = None
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()

    # ------------------------------------------------------------------
    # Rescheduling
    # ------------------------------------------------------------------
    def _handle_data_change(self) -> None:
        """Coordinator data changed; rebuild schedule asynchronously."""
        self._hass.async_create_task(self.async_reschedule())

    async def async_reschedule(self) -> None:
        """Cancel all timers and schedule fresh ones from current data."""
        for unsub in self._timers.values():
            unsub()
        self._timers.clear()

        now_local = dt_util.now().replace(tzinfo=None)
        persons: set[str] = set()

        for reminder in self._coordinator.data:
            runtime = self._coordinator.runtime_of(reminder.id)

            if reminder.is_zone_trigger():
                persons.update(reminder.person_entity_ids)
                self._init_zone_membership(reminder, runtime)
                runtime["next_fire"] = None
                continue

            event, kind = self._next_time_event(reminder, runtime, now_local)
            if event is None:
                runtime["next_fire"] = None
                continue
            runtime["next_fire"] = event
            self._start_timer(reminder.id, event, kind)

        # Daily rollover: re-evaluate tomorrow so sensor next_fire / schedules
        # stay fresh after midnight.
        midnight = (now_local + timedelta(days=1)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )
        self._start_timer("__rollover", midnight, KIND_ROLLOVER)

        await self._ensure_zone_listener(persons)

    def _next_time_event(
        self, reminder: Reminder, runtime: dict[str, Any], now_local: datetime
    ) -> tuple[datetime | None, str]:
        """Pick the next timer target for a time reminder."""
        snooze_until = runtime.get("snooze_until")
        if snooze_until is not None:
            if snooze_until > now_local:
                return snooze_until, KIND_SNOOZE
            runtime.pop("snooze_until", None)

        next_resend = runtime.get("next_resend")
        if runtime.get("cycle_active") and next_resend is not None:
            if next_resend > now_local:
                return next_resend, KIND_RESEND
            runtime.pop("next_resend", None)

        if reminder.one_shot and runtime.get("completed"):
            return None, KIND_OCCURRENCE

        occurrence = reminder.next_occurrence(
            now_local, one_shot_fired=bool(runtime.get("one_shot_fired"))
        )
        if occurrence is None:
            return None, KIND_OCCURRENCE
        return occurrence, KIND_OCCURRENCE

    def _start_timer(
        self, reminder_id: str, when_local: datetime, kind: str
    ) -> None:
        """Schedule a one-shot timer at a local wall-clock time."""
        if when_local <= dt_util.now().replace(tzinfo=None):
            return

        async def _fired(now: datetime) -> None:
            if kind == KIND_ROLLOVER:
                self._handle_data_change()
                return
            await self._coordinator.async_notify_fired(reminder_id, kind=kind)

        self._timers[reminder_id] = async_track_point_in_utc_time(
            self._hass, _fired, dt_util.as_utc(when_local)
        )

    # ------------------------------------------------------------------
    # Zone triggers
    # ------------------------------------------------------------------
    async def _ensure_zone_listener(self, persons: set[str]) -> None:
        """Make sure the state listener covers exactly the persons in use."""
        if persons == self._zone_persons:
            return
        if self._zone_unsub is not None:
            self._zone_unsub()
            self._zone_unsub = None
        self._zone_persons = set(persons)
        if not persons:
            return
        self._zone_unsub = async_track_state_change_event(
            self._hass, sorted(persons), self._handle_zone_event
        )

    def _init_zone_membership(
        self, reminder: Reminder, runtime: dict[str, Any]
    ) -> None:
        """Track the current zone membership of each watched person.

        Initialized from the current state so a freshly created reminder does
        not fire just because someone is already in the zone.
        """
        membership = runtime.setdefault("zone_membership", {})
        for person in reminder.person_entity_ids:
            if person not in membership:
                membership[person] = _is_in_zone(
                    self._hass.states.get(person), reminder.zone_entity_id or ""
                )

    async def _handle_zone_event(self, event: Event) -> None:
        """React to a person state change; fire or re-arm zone reminders."""
        old_state: State | None = event.data.get("old_state")
        new_state: State | None = event.data.get("new_state")
        entity_id = event.data.get("entity_id")
        if old_state is None or new_state is None or not isinstance(entity_id, str):
            return

        for reminder in self._coordinator.zone_reminders_for(person=entity_id):
            if not reminder.enabled:
                continue
            runtime = self._coordinator.runtime_of(reminder.id)
            membership = runtime.setdefault("zone_membership", {})
            was_in = membership.get(entity_id, False)
            is_in = _is_in_zone(new_state, reminder.zone_entity_id or "")
            if was_in == is_in:
                continue
            membership[entity_id] = is_in

            entered = not was_in and is_in
            left = was_in and not is_in

            if reminder.trigger_type == TRIGGER_ZONE_ENTER and entered:
                if not runtime.get("completed") and reminder.zone_gate(
                    dt_util.now().replace(tzinfo=None)
                ):
                    await self._coordinator.async_notify_fired(reminder.id)
            elif reminder.trigger_type == TRIGGER_ZONE_LEAVE and left:
                if not runtime.get("completed") and reminder.zone_gate(
                    dt_util.now().replace(tzinfo=None)
                ):
                    await self._coordinator.async_notify_fired(reminder.id)
            elif (reminder.trigger_type == TRIGGER_ZONE_ENTER and left) or (
                reminder.trigger_type == TRIGGER_ZONE_LEAVE and entered
            ):
                # Opposite transition: re-arm a completed cycle.
                runtime["completed"] = False

            self._coordinator.async_refresh()
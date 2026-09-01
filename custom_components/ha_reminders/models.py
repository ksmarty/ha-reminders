"""Reminder data model for HA Reminders.

Pure dataclasses + (de)serialization + validation. No Home Assistant imports
at module level, so this file is unit-testable without an HA runtime.
"""

from __future__ import annotations

import math
from dataclasses import dataclass, field
from datetime import date, datetime, time as dtime, timedelta
from typing import Any
from uuid import uuid4

from .const import (
    DEFAULT_ACKNOWLEDGE_ACTION_TITLE,
    DEFAULT_ACKNOWLEDGE_NOTIFICATION_BODY,
    DEFAULT_ACKNOWLEDGE_NOTIFICATION_TITLE,
    DEFAULT_NOTIFICATION_COUNT,
    DEFAULT_SNOOZE_DELAYS,
    DEFAULT_SNOOZE_TEXT,
    DEFAULT_USER_NAME,
    DEFAULT_WAIT_TIME_IF_NO_ACTION,
    STATUS_ACTIVE,
    STATUS_COMPLETED,
    STATUS_DISABLED,
    STATUS_SCHEDULED,
    STATUS_SNOOZED,
    TRIGGER_TIME,
    TRIGGER_ZONE_ENTER,
    TRIGGER_ZONE_LEAVE,
    TRIGGER_TYPES,
)
from .util import as_list, coerce_bool

_MAX_OCCURRENCE_SCAN = 10000


def _parse_date(value: Any) -> date | None:
    """Parse a date from None/""/date/datetime/ISO string."""
    if value is None or value == "":
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value
    text = str(value).strip()
    if not text:
        return None
    return date.fromisoformat(text)


def _parse_time(value: Any) -> dtime | None:
    """Parse a time from None/""/time/`HH:MM`/`HH:MM:SS` string."""
    if value is None or value == "":
        return None
    if isinstance(value, dtime):
        return value
    text = str(value).strip()
    if not text:
        return None
    if len(text.split(":")) == 2:
        text = f"{text}:00"
    return dtime.fromisoformat(text)


def _coerce_weekday_list(value: Any) -> list[int]:
    result = []
    for item in as_list(value, int):
        if item < 0 or item > 6:
            raise ValueError(f"invalid weekday: {item}")
        result.append(item)
    return sorted(set(result))


def _coerce_delay_list(value: Any) -> list[int]:
    result = []
    for item in as_list(value, int):
        if item < 1:
            raise ValueError(f"invalid snooze delay: {item}")
        result.append(item)
    return sorted(set(result))


def _coerce_service_action_list(value: Any) -> list[dict[str, Any]]:
    result = []
    for item in as_list(value):
        if isinstance(item, dict):
            result.append(dict(item))
    return result


@dataclass
class Reminder:
    """One normalized reminder record."""

    id: str
    title: str
    message: str
    notify_service: str
    trigger_type: str = TRIGGER_TIME
    enabled: bool = True
    subtitle: str = ""
    user_name: str = DEFAULT_USER_NAME

    # Time trigger fields
    start_date: date | None = None
    stop_date: date | None = None
    time: dtime | None = None
    every_x_days: int = 1
    exclude_days_of_week: list[int] = field(default_factory=list)

    # Zone trigger fields
    zone_entity_id: str | None = None
    person_entity_ids: list[str] = field(default_factory=list)
    time_window_start: dtime | None = None
    time_window_end: dtime | None = None

    # Notification behavior
    acknowledge_action_title: str = DEFAULT_ACKNOWLEDGE_ACTION_TITLE
    acknowledge_actions: list[dict[str, Any]] = field(default_factory=list)
    snooze_delays: list[int] = field(default_factory=lambda: list(DEFAULT_SNOOZE_DELAYS))
    snooze_text: str = DEFAULT_SNOOZE_TEXT
    wait_time_if_no_action: int = DEFAULT_WAIT_TIME_IF_NO_ACTION
    notification_count: int = DEFAULT_NOTIFICATION_COUNT
    color: str = ""
    channel: str = ""
    channel_importance: str = ""
    notification_group: str = ""
    one_shot: bool = False
    acknowledge_notification_title: str = DEFAULT_ACKNOWLEDGE_NOTIFICATION_TITLE
    acknowledge_notification_body: str = DEFAULT_ACKNOWLEDGE_NOTIFICATION_BODY

    # ------------------------------------------------------------------
    # Serialization
    # ------------------------------------------------------------------
    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "Reminder":
        """Build a Reminder from a (validated) payload dict."""
        payload = dict(data or {})

        def get(key: str) -> Any:
            return payload.get(key)

        try:
            trigger_type = get("trigger_type") or TRIGGER_TIME
            if trigger_type not in TRIGGER_TYPES:
                raise ValueError(f"unknown trigger_type: {trigger_type}")

            reminder = cls(
                id=str(get("id") or uuid4().hex),
                title=str(get("title") or ""),
                subtitle=str(get("subtitle") or ""),
                message=str(get("message") or ""),
                enabled=coerce_bool(get("enabled") if "enabled" in payload else True),
                notify_service=str(get("notify_service") or ""),
                user_name=str(get("user_name") or DEFAULT_USER_NAME),
                trigger_type=trigger_type,
                start_date=_parse_date(get("start_date")),
                stop_date=_parse_date(get("stop_date")),
                time=_parse_time(get("time")),
                every_x_days=(
                    int(get("every_x_days"))
                    if get("every_x_days") is not None
                    else 1
                ),
                exclude_days_of_week=_coerce_weekday_list(get("exclude_days_of_week")),
                zone_entity_id=str(get("zone_entity_id") or "") or None,
                person_entity_ids=as_list(get("person_entity_ids"), str),
                time_window_start=_parse_time(get("time_window_start")),
                time_window_end=_parse_time(get("time_window_end")),
                acknowledge_action_title=str(
                    get("acknowledge_action_title") or DEFAULT_ACKNOWLEDGE_ACTION_TITLE
                ),
                acknowledge_actions=_coerce_service_action_list(
                    get("acknowledge_actions")
                ),
                snooze_delays=(
                    _coerce_delay_list(get("snooze_delays"))
                    if "snooze_delays" in payload
                    else list(DEFAULT_SNOOZE_DELAYS)
                ),
                snooze_text=str(get("snooze_text") or DEFAULT_SNOOZE_TEXT),
                wait_time_if_no_action=(
                    int(get("wait_time_if_no_action"))
                    if get("wait_time_if_no_action") is not None
                    else DEFAULT_WAIT_TIME_IF_NO_ACTION
                ),
                notification_count=(
                    int(get("notification_count"))
                    if get("notification_count") is not None
                    else DEFAULT_NOTIFICATION_COUNT
                ),
                color=str(get("color") or ""),
                channel=str(get("channel") or ""),
                channel_importance=str(get("channel_importance") or ""),
                notification_group=str(get("notification_group") or ""),
                one_shot=coerce_bool(get("one_shot") if "one_shot" in payload else False),
                acknowledge_notification_title=str(
                    get("acknowledge_notification_title")
                    or DEFAULT_ACKNOWLEDGE_NOTIFICATION_TITLE
                ),
                acknowledge_notification_body=str(
                    get("acknowledge_notification_body")
                    or DEFAULT_ACKNOWLEDGE_NOTIFICATION_BODY
                ),
            )
        except (TypeError, ValueError):
            raise
        reminder.validate()
        return reminder

    def to_dict(self) -> dict[str, Any]:
        """Serialize to a JSON-safe dict."""
        return {
            "id": self.id,
            "title": self.title,
            "subtitle": self.subtitle,
            "message": self.message,
            "enabled": self.enabled,
            "notify_service": self.notify_service,
            "user_name": self.user_name,
            "trigger_type": self.trigger_type,
            "start_date": self.start_date.isoformat() if self.start_date else None,
            "stop_date": self.stop_date.isoformat() if self.stop_date else None,
            "time": self.time.strftime("%H:%M") if self.time else None,
            "every_x_days": self.every_x_days,
            "exclude_days_of_week": self.exclude_days_of_week,
            "zone_entity_id": self.zone_entity_id,
            "person_entity_ids": self.person_entity_ids,
            "time_window_start": (
                self.time_window_start.strftime("%H:%M")
                if self.time_window_start
                else None
            ),
            "time_window_end": (
                self.time_window_end.strftime("%H:%M") if self.time_window_end else None
            ),
            "acknowledge_action_title": self.acknowledge_action_title,
            "acknowledge_actions": self.acknowledge_actions,
            "snooze_delays": self.snooze_delays,
            "snooze_text": self.snooze_text,
            "wait_time_if_no_action": self.wait_time_if_no_action,
            "notification_count": self.notification_count,
            "color": self.color,
            "channel": self.channel,
            "channel_importance": self.channel_importance,
            "notification_group": self.notification_group,
            "one_shot": self.one_shot,
            "acknowledge_notification_title": self.acknowledge_notification_title,
            "acknowledge_notification_body": self.acknowledge_notification_body,
        }

    # ------------------------------------------------------------------
    # Validation
    # ------------------------------------------------------------------
    def validate(self) -> "Reminder":
        """Validate the record, raising ValueError with a friendly message."""
        if not self.title or not str(self.title).strip():
            raise ValueError("title is required")
        if not self.message or not str(self.message).strip():
            raise ValueError("message is required")
        if not self.notify_service:
            raise ValueError("notify_service is required")
        if self.trigger_type not in TRIGGER_TYPES:
            raise ValueError(f"unknown trigger_type: {self.trigger_type}")
        if self.every_x_days < 1:
            raise ValueError("every_x_days must be at least 1")
        if not self.snooze_delays:
            raise ValueError("snooze_delays must not be empty")
        if self.wait_time_if_no_action < 1:
            raise ValueError("wait_time_if_no_action must be at least 1")
        if self.notification_count < 1:
            raise ValueError("notification_count must be at least 1")
        if (
            self.start_date is not None
            and self.stop_date is not None
            and self.stop_date < self.start_date
        ):
            raise ValueError("stop_date must not be before start_date")

        if self.trigger_type == TRIGGER_TIME:
            if self.time is None:
                raise ValueError("time is required for time reminders")
        else:
            if not self.zone_entity_id:
                raise ValueError("zone_entity_id is required for zone reminders")
            if not self.person_entity_ids:
                raise ValueError("person_entity_ids is required for zone reminders")
            if (
                self.time_window_start is not None
                and self.time_window_end is not None
                and self.time_window_end < self.time_window_start
            ):
                raise ValueError(
                    "time_window_end must not be before time_window_start"
                )
        return self

    # ------------------------------------------------------------------
    # Scheduling logic (pure — unit tested without HA)
    # ------------------------------------------------------------------
    def is_time_trigger(self) -> bool:
        return self.trigger_type == TRIGGER_TIME

    def is_zone_trigger(self) -> bool:
        return self.trigger_type in (TRIGGER_ZONE_ENTER, TRIGGER_ZONE_LEAVE)

    def next_occurrence(
        self,
        now: datetime,
        one_shot_fired: bool = False,
    ) -> datetime | None:
        """Return the next eligible local (naive) fire time, or None.

        Eligible dates are `start_date + k * every_x_days` (k >= 0) on which the
        weekday is not excluded and which fall at or after `start_date` and at
        or before `stop_date`. Excluded weekdays are skipped, not shifted.
        """
        if not self.is_time_trigger() or self.time is None:
            return None
        if self.one_shot and one_shot_fired:
            return None

        anchor = self.start_date or now.date()
        if self.stop_date is not None and anchor > self.stop_date:
            return None
        if self.one_shot and anchor < now.date():
            anchor = now.date()

        steps = max(0, math.ceil((now.date() - anchor).days / self.every_x_days))
        # `steps` is the first k whose candidate date is >= today. Start there
        # and walk forward until an eligible non-excluded date is found.
        for k in range(steps, steps + _MAX_OCCURRENCE_SCAN):
            candidate = anchor + timedelta(days=k * self.every_x_days)
            if self.stop_date is not None and candidate > self.stop_date:
                return None
            if candidate.weekday() in self.exclude_days_of_week:
                continue
            fire_at = datetime.combine(candidate, self.time)
            if candidate == now.date() and fire_at < now:
                continue
            return fire_at
        return None

    def zone_gate(self, now: datetime) -> bool:
        """Check date/weekday/time-window gates for a zone reminder.

        `now` is a local (naive) datetime. Called at transition time.
        """
        if self.start_date is not None and now.date() < self.start_date:
            return False
        if self.stop_date is not None and now.date() > self.stop_date:
            return False
        if now.date().weekday() in self.exclude_days_of_week:
            return False
        if self.time_window_start is not None and now.time() < self.time_window_start:
            return False
        if self.time_window_end is not None and now.time() > self.time_window_end:
            return False
        return True


def compute_status(reminder: Reminder, runtime: dict[str, Any], now: datetime) -> str:
    """Compute the display status of a reminder from its runtime state."""
    if not reminder.enabled:
        return STATUS_DISABLED
    if runtime.get("completed"):
        return STATUS_COMPLETED
    snooze_until = runtime.get("snooze_until")
    if snooze_until is not None and snooze_until > now:
        return STATUS_SNOOZED
    if runtime.get("cycle_active"):
        return STATUS_ACTIVE
    if reminder.is_time_trigger():
        if reminder.next_occurrence(
            now, one_shot_fired=bool(runtime.get("one_shot_fired"))
        ):
            return STATUS_SCHEDULED
        return STATUS_COMPLETED
    return STATUS_SCHEDULED
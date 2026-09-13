"""Scheduler timer tests.

Regression guard: zone reminders were skipped entirely when building timers,
so an active cycle (snooze / resend loop) never scheduled anything — a
snoozed zone reminder stayed snoozed forever.
"""

from __future__ import annotations

import asyncio
import os
from datetime import timedelta

import pytest

pytest.importorskip("homeassistant")

from homeassistant.core import HomeAssistant  # noqa: E402
from homeassistant.util import dt as dt_util  # noqa: E402

from custom_components.ha_reminders.coordinator import (  # noqa: E402
    ReminderCoordinator,
)
from custom_components.ha_reminders.scheduler import (  # noqa: E402
    ReminderScheduler,
)


async def _build(tmp_path):
    config_dir = str(tmp_path)
    os.makedirs(os.path.join(config_dir, ".storage"), exist_ok=True)

    hass = HomeAssistant(config_dir)
    hass.config.config_dir = config_dir

    from homeassistant.helpers import frame  # noqa: PLC0415

    if hasattr(frame, "async_setup"):
        frame.async_setup(hass)

    async def _noop(call) -> None:  # noqa: ANN001
        pass

    hass.services.async_register("notify", "mobile_app_test", _noop)

    coordinator = ReminderCoordinator(hass, {})
    coordinator.async_set_updated_data(await coordinator._async_update_data())  # noqa: SLF001
    return hass, coordinator


async def _zone_reminder(coordinator, **overrides) -> str:
    payload = {
        "title": "Zone snooze test",
        "message": "hello",
        "notify_service": "notify.mobile_app_test",
        "trigger_type": "zone_enter",
        "zone_entity_id": "zone.home",
        "person_entity_ids": ["sensor.test_tracker"],
        "snooze_delays": [1],
    }
    payload.update(overrides)
    return await coordinator.async_create(payload)


async def _run_zone_snooze(tmp_path) -> tuple[bool, bool, object]:
    hass, coordinator = await _build(tmp_path)
    scheduler = ReminderScheduler(hass, coordinator)
    coordinator.set_scheduler(scheduler)
    try:
        reminder_id = await _zone_reminder(coordinator)
        await scheduler.async_reschedule()
        assert reminder_id not in scheduler._timers  # no occurrence to wait for

        await coordinator.async_snooze(reminder_id, 5)
        await scheduler.async_reschedule()
        armed = reminder_id in scheduler._timers  # noqa: SLF001
        next_fire = coordinator.describe(
            coordinator.get(reminder_id)
        )["next_fire"]

        # Simulate the reminder firing, then confirm the resend loop is armed.
        await coordinator.async_notify_fired(reminder_id)
        await scheduler.async_reschedule()
        resend_armed = reminder_id in scheduler._timers  # noqa: SLF001
        return armed, resend_armed, next_fire
    finally:
        await coordinator.async_shutdown()
        await hass.async_stop()


def test_zone_reminder_snooze_is_scheduled(tmp_path) -> None:
    """Snoozing a zone reminder must arm a timer (bug: it never did)."""
    armed, resend_armed, next_fire = asyncio.run(_run_zone_snooze(tmp_path))
    assert armed, "snooze timer was not scheduled for a zone reminder"
    assert next_fire is not None, "next_fire should show the pending snooze"
    assert resend_armed, "resend timer was not scheduled for a zone reminder"


async def _run_zone_resend(tmp_path) -> bool:
    hass, coordinator = await _build(tmp_path)
    scheduler = ReminderScheduler(hass, coordinator)
    coordinator.set_scheduler(scheduler)
    try:
        reminder_id = await _zone_reminder(
            coordinator, wait_time_if_no_action=2, notification_count=3
        )
        await coordinator.async_notify_fired(reminder_id)
        await scheduler.async_reschedule()
        return reminder_id in scheduler._timers  # noqa: SLF001
    finally:
        await coordinator.async_shutdown()
        await hass.async_stop()


def test_zone_reminder_resend_is_scheduled(tmp_path) -> None:
    """Ignoring a zone reminder must arm the resend timer."""
    assert asyncio.run(_run_zone_resend(tmp_path))


async def _run_time_reminder(tmp_path) -> tuple[bool, object]:
    hass, coordinator = await _build(tmp_path)
    scheduler = ReminderScheduler(hass, coordinator)
    coordinator.set_scheduler(scheduler)
    try:
        fire_at = dt_util.now().replace(tzinfo=None) + timedelta(minutes=5)
        reminder_id = await coordinator.async_create(
            {
                "title": "Time test",
                "message": "hello",
                "notify_service": "notify.mobile_app_test",
                "trigger_type": "time",
                "time": fire_at.strftime("%H:%M"),
            }
        )
        await scheduler.async_reschedule()
        armed = reminder_id in scheduler._timers  # noqa: SLF001
        return armed, coordinator.describe(coordinator.get(reminder_id))["next_fire"]
    finally:
        await coordinator.async_shutdown()
        await hass.async_stop()


def test_time_reminder_arms_occurrence(tmp_path) -> None:
    armed, next_fire = asyncio.run(_run_time_reminder(tmp_path))
    assert armed
    assert next_fire is not None
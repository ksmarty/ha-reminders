"""End-to-end-ish plumbing test for the notification path.

Creates a time reminder through the coordinator, verifies it is armed with a
timer, then simulates the timer firing and asserts the notify service is called
with the expected payload (including the blueprint-compatible action strings).

Requires a Home Assistant runtime (skipped otherwise).
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


async def _run(tmp_path) -> None:
    config_dir = str(tmp_path)
    os.makedirs(os.path.join(config_dir, ".storage"), exist_ok=True)

    hass = HomeAssistant(config_dir)
    hass.config.config_dir = config_dir

    from homeassistant.helpers import frame  # noqa: PLC0415

    if hasattr(frame, "async_setup"):
        frame.async_setup(hass)

    calls: list[tuple[str, str, dict]] = []

    async def _fake_notify(call) -> None:  # noqa: ANN001
        calls.append((call.domain, call.service, dict(call.data)))

    hasattr(hass, "services") and hass.services.async_register(
        "notify", "mobile_app_zoom_zoom", _fake_notify
    )

    try:
        coordinator = ReminderCoordinator(hass, {})
        loaded = await coordinator._async_update_data()  # noqa: SLF001
        coordinator.async_set_updated_data(loaded)

        # A reminder the user would create for Test A: a couple of minutes out.
        fire_at = dt_util.now().replace(tzinfo=None) + timedelta(minutes=2)
        reminder_id = await coordinator.async_create(
            {
                "title": "Plumbing test",
                "message": "If this arrives, notifications work.",
                "notify_service": "notify.mobile_app_zoom_zoom",
                "trigger_type": "time",
                "time": fire_at.strftime("%H:%M"),
                "one_shot": True,
                "snooze_delays": [1],
            }
        )

        described = coordinator.describe(coordinator.get(reminder_id))
        assert described["status"] == "scheduled", described

        scheduler = ReminderScheduler(hass, coordinator)
        coordinator.set_scheduler(scheduler)
        await scheduler.async_reschedule()

        # After a reschedule the reminder must be armed with a timer and have
        # a resolved next_fire.
        described = coordinator.describe(coordinator.get(reminder_id))
        assert described["next_fire"] is not None, described
        assert reminder_id in scheduler._timers, scheduler._timers  # noqa: SLF001

        # Simulate the timer firing.
        await coordinator.async_notify_fired(reminder_id)

        assert len(calls) == 1, calls
        domain, service, data = calls[0]
        assert (domain, service) == ("notify", "mobile_app_zoom_zoom")
        assert data["title"] == "Plumbing test"
        assert data["message"] == "If this arrives, notifications work."
        action_ids = [action["action"] for action in data["data"]["actions"]]
        assert action_ids == [
            f"taskReminder╡{reminder_id}╡╡-1╡Someone",
            f"taskReminder╡{reminder_id}╡╡1╡Someone",
        ]
        assert data["data"]["tag"] == f"taskReminder╡{reminder_id}"

        # One-shot reminders close their cycle after a single delivery.
        described = coordinator.describe(coordinator.get(reminder_id))
        assert described["status"] == "completed", described
    finally:
        await coordinator.async_shutdown()
        await hass.async_stop()


def test_time_reminder_notification_plumbing(tmp_path) -> None:
    asyncio.run(_run(tmp_path))
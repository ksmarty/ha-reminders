"""Regression tests for the coordinator lifecycle.

Guards the v1.0.4 bug where a getter-only `data` property override broke
`DataUpdateCoordinator.__init__` (`property has no setter`), which stopped
entry setup with an AttributeError.

These tests require a Home Assistant runtime (skipped otherwise).
"""

from __future__ import annotations

import asyncio
import os

import pytest

pytest.importorskip("homeassistant")

from homeassistant.core import HomeAssistant  # noqa: E402

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
        # Newer HA requires the frame helper to be wired up for report_usage;
        # older releases manage it internally.
        frame.async_setup(hass)
    try:
        coordinator = ReminderCoordinator(hass, {})
        # Regression (v1.0.4): constructing the coordinator must not crash —
        # DataUpdateCoordinator assigns self.data in __init__ (needs a setter).
        assert coordinator.data is None

        loaded = await coordinator._async_update_data()  # noqa: SLF001
        assert loaded == []
        coordinator.async_set_updated_data(loaded)
        assert coordinator.data == []

        reminder_id = await coordinator.async_create(
            {
                "title": "Take out the trash",
                "message": "Bins go out tonight",
                "notify_service": "mobile_app_pixel",
                "trigger_type": "time",
                "time": "20:00",
            }
        )
        assert coordinator.get(reminder_id) is not None
        described = coordinator.describe(coordinator.get(reminder_id))
        assert described["title"] == "Take out the trash"
        assert described["status"] in {
            "scheduled",
            "active",
            "snoozed",
            "completed",
            "disabled",
        }

        scheduler = ReminderScheduler(hass, coordinator)
        coordinator.set_scheduler(scheduler)
        await scheduler.async_reschedule()

        await coordinator.async_delete(reminder_id)
        assert coordinator.get(reminder_id) is None
    finally:
        await coordinator.async_shutdown()
        await hass.async_stop()


def test_coordinator_lifecycle(tmp_path) -> None:
    asyncio.run(_run(tmp_path))
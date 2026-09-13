"""Zone reminder lifecycle contract.

Pins the behaviour the reminder model promises:
  - a reminder notifies once and does **not** auto-repeat when ignored
  - a zone reminder fires again on every arrival until it is acknowledged
  - once acknowledged it stays done — re-enabling or editing re-arms it
"""

from __future__ import annotations

import asyncio
import os

import pytest

pytest.importorskip("homeassistant")

from homeassistant.core import HomeAssistant  # noqa: E402

from custom_components.ha_reminders.config_flow import (  # noqa: E402
    _default_options,
)
from custom_components.ha_reminders.const import (  # noqa: E402
    CONF_DEFAULT_NOTIFICATION_COUNT,
)
from custom_components.ha_reminders.coordinator import (  # noqa: E402
    ReminderCoordinator,
)
from custom_components.ha_reminders.scheduler import (  # noqa: E402
    ReminderScheduler,
)

TRACKER = "sensor.test_tracker"


async def _build(tmp_path):
    config_dir = str(tmp_path)
    os.makedirs(os.path.join(config_dir, ".storage"), exist_ok=True)

    hass = HomeAssistant(config_dir)
    hass.config.config_dir = config_dir

    from homeassistant.helpers import frame  # noqa: PLC0415

    if hasattr(frame, "async_setup"):
        frame.async_setup(hass)

    hass.states.async_set(
        "zone.home",
        "0",
        {"friendly_name": "Home", "latitude": 43.0, "longitude": -79.0, "radius": 100},
    )
    hass.states.async_set(TRACKER, "not_home", {"friendly_name": "Tracker"})

    sent: list[dict] = []

    async def _fake_notify(call) -> None:  # noqa: ANN001
        sent.append(dict(call.data))

    hass.services.async_register("notify", "mobile_app_test", _fake_notify)

    coordinator = ReminderCoordinator(hass, {})
    coordinator.async_set_updated_data(await coordinator._async_update_data())  # noqa: SLF001
    scheduler = ReminderScheduler(hass, coordinator)
    coordinator.set_scheduler(scheduler)
    return hass, coordinator, scheduler, sent


async def _move(hass, value: str) -> None:
    """Set the tracker state and let the scheduler's listener run."""
    hass.states.async_set(TRACKER, value, {"friendly_name": "Tracker"})
    await hass.async_block_till_done()
    await asyncio.sleep(0)


async def _run(tmp_path) -> dict:
    hass, coordinator, scheduler, sent = await _build(tmp_path)
    out: dict[str, object] = {}
    try:
        reminder_id = await coordinator.async_create(
            {
                "title": "Take out the trash",
                "message": "Bins go out",
                "notify_service": "notify.mobile_app_test",
                "trigger_type": "zone_enter",
                "zone_entity_id": "zone.home",
                "person_entity_ids": [TRACKER],
            }
        )
        await scheduler.async_reschedule()  # subscribes + initialises membership
        created = coordinator.get(reminder_id)
        out["notification_count"] = created.notification_count

        def snapshot() -> tuple[str, int, bool]:
            described = coordinator.describe(coordinator.get(reminder_id))
            return (
                described["status"],
                described["notified_count"],
                reminder_id in scheduler._timers,  # noqa: SLF001
            )

        # 1. arrive -> one notification, nothing scheduled to repeat
        await _move(hass, "home")
        out["after_arrival"] = snapshot()
        out["sent_after_arrival"] = len(sent)

        # 2. leave and arrive again while unacknowledged -> fires again
        await _move(hass, "not_home")
        out["still_open_after_leaving"] = coordinator.runtime_of(reminder_id).get(
            "completed"
        )
        await _move(hass, "home")
        out["sent_after_reentry"] = len(sent)

        # 3. acknowledge -> stays done across further arrivals
        await coordinator.async_complete(reminder_id)
        out["after_complete"] = snapshot()
        await _move(hass, "not_home")
        await _move(hass, "home")
        out["sent_after_done"] = len(sent)
        out["status_after_done_arrival"] = coordinator.describe(
            coordinator.get(reminder_id)
        )["status"]

        # 4. re-enabling re-arms it
        await coordinator.async_set_enabled(reminder_id, False)
        await coordinator.async_set_enabled(reminder_id, True)
        await _move(hass, "not_home")
        await _move(hass, "home")
        out["sent_after_reenable"] = len(sent)

        # 5. editing re-arms it too
        await coordinator.async_complete(reminder_id)
        await coordinator.async_update(reminder_id, {"message": "Bins go out tonight"})
        await _move(hass, "not_home")
        await _move(hass, "home")
        out["sent_after_edit"] = len(sent)
        return out
    finally:
        await coordinator.async_shutdown()
        await hass.async_stop()


@pytest.fixture(scope="module")
def results(tmp_path_factory):
    return asyncio.run(_run(tmp_path_factory.mktemp("zone")))


def test_default_does_not_repeat(results) -> None:
    """No nag loop unless the user asks for one."""
    assert results["notification_count"] == 1
    assert _default_options()[CONF_DEFAULT_NOTIFICATION_COUNT] == 1


def test_fires_once_on_arrival(results) -> None:
    status, notified, armed = results["after_arrival"]
    # A single send closes the cycle immediately (nothing pending), so the
    # reminder is armed again for the next arrival rather than "active".
    assert status == "scheduled"
    assert notified == 1
    assert results["sent_after_arrival"] == 1
    assert armed is False, "nothing should be scheduled to repeat a single send"


def test_repeats_on_every_arrival_until_done(results) -> None:
    assert results["still_open_after_leaving"] is False
    assert results["sent_after_reentry"] == 2, "re-entering must notify again"


def test_stays_done_after_acknowledgement(results) -> None:
    status, _, _ = results["after_complete"]
    assert status == "completed", status
    assert results["sent_after_done"] == 2, "a completed zone reminder re-armed"
    assert results["status_after_done_arrival"] == "completed"


def test_reenabling_rearms(results) -> None:
    assert results["sent_after_reenable"] == 3


def test_editing_rearms(results) -> None:
    assert results["sent_after_edit"] == 4
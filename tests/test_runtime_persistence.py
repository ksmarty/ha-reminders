"""Acknowledged reminders must stay acknowledged across a restart/reload.

`completed` used to live only in `ReminderCoordinator._runtime`, which was
never persisted. After any reload — HA restart, HACS update, options change —
an acknowledged location reminder was `scheduled` again and notified on the
next arrival, and a one-shot reminder fired again. That is the reported
"marking a reminder as done from the notification doesn't stick" bug.

Requires a Home Assistant runtime (skipped otherwise).
"""

from __future__ import annotations

import asyncio
import json
import os

import pytest

pytest.importorskip("homeassistant")

from homeassistant.core import HomeAssistant  # noqa: E402

from custom_components.ha_reminders import notify  # noqa: E402
from custom_components.ha_reminders.const import (  # noqa: E402
    NOTIFICATION_ACTION_EVENT,
    STORAGE_KEY,
)
from custom_components.ha_reminders.coordinator import (  # noqa: E402
    ReminderCoordinator,
)
from custom_components.ha_reminders.scheduler import (  # noqa: E402
    ReminderScheduler,
)

TRACKER = "person.test_tracker"


def _new_hass(config_dir: str) -> HomeAssistant:
    os.makedirs(os.path.join(config_dir, ".storage"), exist_ok=True)
    hass = HomeAssistant(config_dir)
    hass.config.config_dir = config_dir

    from homeassistant.helpers import frame  # noqa: PLC0415

    if hasattr(frame, "async_setup"):
        frame.async_setup(hass)
    return hass


async def _load_entry(hass: HomeAssistant):
    """Wire up what `async_setup_entry` wires up, on a fresh store load."""
    coordinator = ReminderCoordinator(hass, {})
    coordinator.async_set_updated_data(await coordinator._async_update_data())  # noqa: SLF001
    scheduler = ReminderScheduler(hass, coordinator)
    coordinator.set_scheduler(scheduler)
    unsub = hass.bus.async_listen(
        NOTIFICATION_ACTION_EVENT, coordinator.async_handle_action_event
    )
    await scheduler.async_reschedule()
    await hass.async_block_till_done()
    return coordinator, scheduler, unsub


async def _move(hass: HomeAssistant, value: str) -> None:
    hass.states.async_set(TRACKER, value, {"friendly_name": "Tracker"})
    await hass.async_block_till_done()
    await asyncio.sleep(0)


async def _tap_mark_done(hass: HomeAssistant, coordinator, reminder_id: str) -> None:
    """Fire the event the companion app sends when the action is tapped."""
    action = notify.build_reminder_data(coordinator.get(reminder_id))["actions"][0][
        "action"
    ]
    assert action.split("╡")[3] == "-1", action
    hass.bus.async_fire(NOTIFICATION_ACTION_EVENT, {"action": action})
    await hass.async_block_till_done()


async def _run_zone(tmp_path) -> dict:
    """Leave the zone, mark the notification done, reload, leave again."""
    hass = _new_hass(str(tmp_path))
    sent: list[dict] = []

    async def _fake_notify(call) -> None:  # noqa: ANN001
        sent.append(dict(call.data))

    hass.services.async_register("notify", "mobile_app_test", _fake_notify)
    hass.states.async_set("zone.work", "0", {"friendly_name": "Work"})
    hass.states.async_set(TRACKER, "Work", {"friendly_name": "Tracker"})

    out: dict[str, object] = {}
    coordinator, scheduler, unsub = await _load_entry(hass)
    try:
        reminder_id = await coordinator.async_create(
            {
                "title": "Stop at the store",
                "message": "Pick up milk",
                "notify_service": "notify.mobile_app_test",
                "trigger_type": "zone_leave",
                "zone_entity_id": "zone.work",
                "person_entity_ids": [TRACKER],
            }
        )
        await scheduler.async_reschedule()
        await hass.async_block_till_done()

        await _move(hass, "not_home")
        out["sent_before_ack"] = len(sent)

        await _tap_mark_done(hass, coordinator, reminder_id)
        described = coordinator.describe(coordinator.get(reminder_id))
        out["status_after_ack"] = described["status"]
        out["completed_at_after_ack"] = described["completed_at"]

        # No reload: it stays done (this already worked).
        await _move(hass, "Work")
        await _move(hass, "not_home")
        out["sent_without_reload"] = len(sent)

        # ---- integration reload / HA restart ----
        unsub()
        await coordinator.async_shutdown()
        coordinator, scheduler, unsub = await _load_entry(hass)
        out["status_after_reload"] = coordinator.describe(
            coordinator.get(reminder_id)
        )["status"]
        out["completed_at_after_reload"] = coordinator.describe(
            coordinator.get(reminder_id)
        )["completed_at"]

        await _move(hass, "Work")
        await _move(hass, "not_home")
        out["sent_after_reload"] = len(sent)
        out["status_after_arrival"] = coordinator.describe(
            coordinator.get(reminder_id)
        )["status"]
        out["config_dir"] = str(tmp_path)
        return out
    finally:
        unsub()
        await coordinator.async_shutdown()
        await hass.async_stop()


async def _run_one_shot(tmp_path) -> dict:
    """A one-shot time reminder marked done must not fire again after reload."""
    hass = _new_hass(str(tmp_path))
    sent: list[dict] = []

    async def _fake_notify(call) -> None:  # noqa: ANN001
        sent.append(dict(call.data))

    hass.services.async_register("notify", "mobile_app_test", _fake_notify)

    out: dict[str, object] = {}
    coordinator, scheduler, unsub = await _load_entry(hass)
    try:
        reminder_id = await coordinator.async_create(
            {
                "title": "Water the plants",
                "message": "They are thirsty",
                "notify_service": "notify.mobile_app_test",
                "trigger_type": "time",
                "time": "23:59",
                "one_shot": True,
            }
        )
        # A one-shot delivers once and closes its own cycle; the user then taps
        # "Mark as done" on the notification that arrived.
        await coordinator.async_notify_fired(reminder_id)
        out["sent_before_ack"] = len(sent)
        await _tap_mark_done(hass, coordinator, reminder_id)
        out["status_after_ack"] = coordinator.describe(
            coordinator.get(reminder_id)
        )["status"]

        unsub()
        await coordinator.async_shutdown()
        coordinator, scheduler, unsub = await _load_entry(hass)

        out["status_after_reload"] = coordinator.describe(
            coordinator.get(reminder_id)
        )["status"]
        out["armed_after_reload"] = reminder_id in scheduler._timers  # noqa: SLF001

        # Re-arming (the documented way to reuse a reminder) clears the flag
        # *and* its timestamp, so it leaves the completed section.
        await coordinator.async_set_enabled(reminder_id, False)
        await coordinator.async_set_enabled(reminder_id, True)
        rearmed = coordinator.describe(coordinator.get(reminder_id))
        out["status_after_reenable"] = rearmed["status"]
        out["completed_at_after_reenable"] = rearmed["completed_at"]
        return out
    finally:
        unsub()
        await coordinator.async_shutdown()
        await hass.async_stop()


async def _run_legacy_payload(tmp_path) -> dict:
    """A v1 payload (a bare list of records) must upgrade, not be dropped."""
    config_dir = str(tmp_path)
    record = {
        "id": "legacy1",
        "title": "Take out the trash",
        "message": "Bins go out tonight",
        "notify_service": "notify.mobile_app_test",
        "trigger_type": "time",
        "time": "20:00",
    }
    hass = _new_hass(config_dir)
    with open(os.path.join(config_dir, ".storage", STORAGE_KEY), "w") as handle:
        json.dump(
            {
                "version": 1,
                "minor_version": 1,
                "key": STORAGE_KEY,
                "data": [record],
            },
            handle,
        )

    out: dict[str, object] = {}
    coordinator, scheduler, unsub = await _load_entry(hass)
    try:
        out["titles"] = [reminder.title for reminder in coordinator.data]
        out["status"] = coordinator.describe(coordinator.get("legacy1"))["status"]
        with open(os.path.join(config_dir, ".storage", STORAGE_KEY)) as handle:
            stored = json.load(handle)
        out["stored_version"] = stored["version"]
        out["stored_payload_keys"] = sorted(stored["data"])
        return out
    finally:
        unsub()
        await coordinator.async_shutdown()
        await hass.async_stop()


@pytest.fixture(scope="module")
def zone(tmp_path_factory):
    return asyncio.run(_run_zone(tmp_path_factory.mktemp("persist_zone")))


@pytest.fixture(scope="module")
def one_shot(tmp_path_factory):
    return asyncio.run(_run_one_shot(tmp_path_factory.mktemp("persist_oneshot")))


@pytest.fixture(scope="module")
def legacy(tmp_path_factory):
    return asyncio.run(_run_legacy_payload(tmp_path_factory.mktemp("persist_legacy")))


def test_zone_reminder_is_done_after_the_action(zone) -> None:
    assert zone["status_after_ack"] == "completed"
    assert zone["sent_before_ack"] == 1


def test_zone_reminder_stays_done_across_a_reload(zone) -> None:
    """The bug: the reload lost `completed` and the next arrival notified."""
    assert zone["status_after_reload"] == "completed"
    assert zone["sent_after_reload"] == 1, "a reloaded reminder notified again"
    assert zone["status_after_arrival"] == "completed"


def test_the_done_state_keeps_its_timestamp_across_a_reload(zone) -> None:
    """The sidebar orders the completed section by this, so it must not move."""
    assert zone["completed_at_after_ack"]
    assert zone["completed_at_after_reload"] == zone["completed_at_after_ack"]


def test_zone_reminder_does_not_notify_before_the_reload_either(zone) -> None:
    assert zone["sent_without_reload"] == 1


def test_only_durable_runtime_state_is_persisted(zone) -> None:
    """Pending timers and derived counts stay out of storage on purpose."""
    with open(os.path.join(zone["config_dir"], ".storage", STORAGE_KEY)) as handle:
        saved = json.load(handle)["data"]["runtime"]
    assert len(saved) == 1, saved
    # `completed_at` rides along with `completed` because it is the sort key of
    # the sidebar's completed section.
    state = list(saved.values())[0]
    assert sorted(state) == ["completed", "completed_at"]
    assert state["completed"] is True
    assert state["completed_at"]


def test_one_shot_reminder_stays_done_across_a_reload(one_shot) -> None:
    assert one_shot["sent_before_ack"] == 1
    assert one_shot["status_after_ack"] == "completed"
    assert one_shot["status_after_reload"] == "completed"
    assert one_shot["armed_after_reload"] is False, "a completed one-shot re-armed"


def test_rearming_clears_the_timestamp(one_shot) -> None:
    assert one_shot["status_after_reenable"] != "completed"
    assert one_shot["completed_at_after_reenable"] is None


def test_legacy_v1_payload_is_migrated(legacy) -> None:
    """Upgrading must not drop the reminders a user already had."""
    assert legacy["titles"] == ["Take out the trash"]
    assert legacy["status"] == "scheduled"
    assert legacy["stored_version"] == 2
    assert legacy["stored_payload_keys"] == ["reminders", "runtime"]

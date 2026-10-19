"""Tests for one-off notifications (the `notify` service).

A one-off notification is delivered now and stored nowhere: no reminder record,
no sensor entity, no scheduler timer. These tests drive the coordinator against
a real Home Assistant with a faked notify service, so "nothing was stored" is
asserted by reloading the store rather than by reading the code.

Requires a Home Assistant runtime (skipped otherwise).
"""

from __future__ import annotations

import asyncio
import os

import pytest

pytest.importorskip("homeassistant")

from homeassistant.core import Event, HomeAssistant  # noqa: E402
from homeassistant.exceptions import HomeAssistantError  # noqa: E402

from custom_components.ha_reminders.const import (  # noqa: E402
    CONF_DEFAULT_NOTIFY_SERVICE,
    DEFAULT_ICON,
    DEFAULT_ACKNOWLEDGE_ACTION_TITLE,
    DEFAULT_SNOOZE_DELAYS,
    DEFAULT_SNOOZE_TEXT,
    NOTIFICATION_ACTION_EVENT,
    ONE_OFF_TRACKED_LIMIT,
)
from custom_components.ha_reminders.coordinator import (  # noqa: E402
    ReminderCoordinator,
)
from custom_components.ha_reminders.notify import action_string  # noqa: E402
from custom_components.ha_reminders.services import SCHEMA_NOTIFY  # noqa: E402
from custom_components.ha_reminders.util import format_delay  # noqa: E402

NOTIFY = "mobile_app_zoom_zoom"


class Recorder:
    """Records the service calls a test cares about."""

    def __init__(self) -> None:
        self.calls: list[tuple[str, str, dict]] = []

    async def record(self, call) -> None:  # noqa: ANN001 - ServiceCall stand-in
        self.calls.append((call.domain, call.service, dict(call.data)))


async def _setup(tmp_path, options: dict | None = None):
    """A Home Assistant with a fake notify service and a fresh coordinator."""
    config_dir = str(tmp_path)
    os.makedirs(os.path.join(config_dir, ".storage"), exist_ok=True)

    hass = HomeAssistant(config_dir)
    hass.config.config_dir = config_dir

    from homeassistant.helpers import frame  # noqa: PLC0415

    if hasattr(frame, "async_setup"):
        frame.async_setup(hass)

    notifications = Recorder()
    hass.services.async_register("notify", NOTIFY, notifications.record)
    coordinator = ReminderCoordinator(hass, options or {})
    loaded = await coordinator._async_update_data()  # noqa: SLF001
    coordinator.async_set_updated_data(loaded)
    return hass, coordinator, notifications


async def _stop(hass, coordinator) -> None:
    await coordinator.async_shutdown()
    await hass.async_stop()


def test_notify_sends_without_storing(tmp_path) -> None:
    """The notification goes out; the store and the panel do not move."""

    async def _run() -> None:
        # No notify_service in the payload: it comes from the configured
        # default, which is what a caller that is not a reminder relies on.
        hass, coordinator, notifications = await _setup(
            tmp_path, {CONF_DEFAULT_NOTIFY_SERVICE: NOTIFY}
        )
        try:
            notification_id = await coordinator.async_notify_once(
                {
                    "title": "Take out the trash",
                    "message": "Bins go out tonight",
                    "click_url": "https://tasktick.test/tasks?task=abc",
                    "acknowledge_actions": [
                        {"service": "tasktick.complete_task", "data": {"task": "abc"}}
                    ],
                }
            )
            await hass.async_block_till_done()

            assert len(notifications.calls) == 1, notifications.calls
            domain, service, data = notifications.calls[0]
            assert (domain, service) == ("notify", NOTIFY)
            assert data["title"] == "Take out the trash"
            assert data["message"] == "Bins go out tonight"
            # The tag and action encoding a reminder uses, so replacing in
            # place and the buttons behave the way they do for a reminder.
            assert data["data"]["tag"] == f"taskReminder╡{notification_id}"
            assert data["data"]["notification_icon"] == DEFAULT_ICON
            assert data["data"]["url"] == "https://tasktick.test/tasks?task=abc"
            assert data["data"]["clickAction"] == data["data"]["url"]
            assert data["data"]["actions"] == [
                {
                    "action": action_string(notification_id, "", -1, "Someone"),
                    "title": DEFAULT_ACKNOWLEDGE_ACTION_TITLE,
                }
            ] + [
                {
                    "action": action_string(notification_id, "", minutes, "Someone"),
                    "title": DEFAULT_SNOOZE_TEXT.replace(
                        "${time}", format_delay(minutes)
                    ),
                }
                for minutes in DEFAULT_SNOOZE_DELAYS
            ], data["data"]["actions"]

            # Nothing was stored: reloading the store finds no record, so no
            # reminder and no sensor entity appeared either.
            assert await coordinator._async_update_data() == []  # noqa: SLF001
            assert coordinator.get(notification_id) is None
            assert coordinator.one_off(notification_id) is not None
        finally:
            await _stop(hass, coordinator)

    asyncio.run(_run())


def test_notify_raises_when_delivery_fails(tmp_path) -> None:
    """A failed send is an error, so the caller can fall back to its own push."""

    async def _run() -> None:
        hass, coordinator, notifications = await _setup(tmp_path)
        try:
            with pytest.raises(HomeAssistantError):
                await coordinator.async_notify_once(
                    {"title": "Nobody to tell", "notify_service": "mobile_app_missing"}
                )
            # No notify service anywhere: the same error, not a bare ValueError.
            with pytest.raises(HomeAssistantError):
                await coordinator.async_notify_once({"title": "Nobody to tell"})
            assert notifications.calls == []
            # Nothing is left behind pointing at a notification nobody received.
            assert coordinator._one_offs == {}  # noqa: SLF001
        finally:
            await _stop(hass, coordinator)

    asyncio.run(_run())


def test_acknowledge_action_runs_the_actions_and_forgets(tmp_path) -> None:
    """The acknowledge button runs the caller's service call, then drops the record."""

    async def _run() -> None:
        hass, coordinator, _notifications = await _setup(tmp_path)
        completions = Recorder()
        hass.services.async_register("tasktick", "complete_task", completions.record)
        try:
            notification_id = await coordinator.async_notify_once(
                {
                    "title": "Take out the trash",
                    "notify_service": NOTIFY,
                    "acknowledge_actions": [
                        {"service": "tasktick.complete_task", "data": {"task": "abc"}}
                    ],
                }
            )
            await hass.async_block_till_done()

            await coordinator.async_handle_action_event(
                Event(
                    NOTIFICATION_ACTION_EVENT,
                    {"action": action_string(notification_id, "", -1, "Kyle")},
                )
            )
            await hass.async_block_till_done()

            assert completions.calls == [
                ("tasktick", "complete_task", {"task": "abc"})
            ], completions.calls
            assert coordinator.one_off(notification_id) is None
        finally:
            await _stop(hass, coordinator)

    asyncio.run(_run())


def test_snooze_resends_once_and_replaces_itself(tmp_path) -> None:
    """Snoozing re-sends the notification; a second tap replaces the first.

    The delay is zero here so the re-send lands in the same turn of the event
    loop — it goes through the same timer path a real delay does.
    """

    async def _run() -> None:
        hass, coordinator, notifications = await _setup(tmp_path)
        try:
            notification_id = await coordinator.async_notify_once(
                {"title": "Take out the trash", "notify_service": NOTIFY}
            )
            await hass.async_block_till_done()
            assert len(notifications.calls) == 1

            snooze = {
                "action": action_string(notification_id, "", 0, "Kyle"),
                "title": "Snooze for 5 min",
            }
            await coordinator.async_handle_action_event(
                Event(NOTIFICATION_ACTION_EVENT, dict(snooze))
            )
            await coordinator.async_handle_action_event(
                Event(NOTIFICATION_ACTION_EVENT, dict(snooze))
            )
            await asyncio.sleep(0.05)
            await hass.async_block_till_done()

            # One re-send, not two: the second snooze replaced the first.
            assert len(notifications.calls) == 2, notifications.calls
            assert (
                notifications.calls[1][2]["data"]["tag"]
                == notifications.calls[0][2]["data"]["tag"]
            )
        finally:
            await _stop(hass, coordinator)

    asyncio.run(_run())


def test_tracked_notifications_are_bounded(tmp_path) -> None:
    """Past the cap the oldest notification is forgotten, the newest still works."""

    async def _run() -> None:
        hass, coordinator, notifications = await _setup(tmp_path)
        try:
            ids = []
            for index in range(ONE_OFF_TRACKED_LIMIT + 1):
                ids.append(
                    await coordinator.async_notify_once(
                        {"title": f"Reminder {index}", "notify_service": NOTIFY}
                    )
                )
            await hass.async_block_till_done()

            assert len(notifications.calls) == ONE_OFF_TRACKED_LIMIT + 1
            assert coordinator.one_off(ids[0]) is None
            assert coordinator.one_off(ids[1]) is not None
            assert coordinator.one_off(ids[-1]) is not None
        finally:
            await _stop(hass, coordinator)

    asyncio.run(_run())


def test_restart_forgets_tracked_notifications(tmp_path) -> None:
    """A one-off is not durable: after a reload nothing is tracked or stored."""

    async def _run() -> None:
        hass, coordinator, _notifications = await _setup(tmp_path)
        try:
            notification_id = await coordinator.async_notify_once(
                {"title": "Ping", "notify_service": NOTIFY}
            )
            await hass.async_block_till_done()
            assert coordinator.one_off(notification_id) is not None

            await coordinator.async_shutdown()
            reloaded = ReminderCoordinator(hass, {})
            loaded = await reloaded._async_update_data()  # noqa: SLF001
            reloaded.async_set_updated_data(loaded)
            assert reloaded.one_off(notification_id) is None
            assert reloaded.data == []
            await reloaded.async_shutdown()
        finally:
            await hass.async_stop()

    asyncio.run(_run())


class TestNotifySchema:
    """The service payload carries notification fields only."""

    def test_title_is_required(self):
        with pytest.raises(Exception):
            SCHEMA_NOTIFY({})

    def test_notification_fields_are_accepted(self):
        validated = SCHEMA_NOTIFY(
            {
                "title": "Ping",
                "message": "now",
                "notify_service": "notify.mobile_app_pixel",
                "user_name": "Kyle",
                "click_url": "https://tasktick.test/",
                "color": "#ff0000",
                "icon": "mdi:bell",
                "channel": "reminders",
                "channel_importance": "high",
                "snooze_delays": [5, 15],
                "snooze_text": "Later ${time}",
                "acknowledge_action_title": "Done",
                "acknowledge_actions": [{"service": "tasktick.complete_task"}],
            }
        )
        assert validated["title"] == "Ping"
        assert validated["snooze_delays"] == [5, 15]

    @pytest.mark.parametrize(
        "payload",
        [
            {"title": "Ping", "time": "08:00"},
            {"title": "Ping", "trigger_type": "time"},
            {"title": "Ping", "enabled": False},
            {"title": "Ping", "one_shot": True},
            {"title": "Ping", "notification_count": 3},
        ],
    )
    def test_scheduling_fields_are_refused(self, payload):
        # A one-off notification has no schedule, so a scheduling field is a
        # mistake worth surfacing rather than silently ignoring.
        with pytest.raises(Exception):
            SCHEMA_NOTIFY(payload)

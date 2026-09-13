"""Intent handler tests.

Drives the handlers through HA's real `intent.async_handle`, i.e. with slots in
the `{"value": ..., "text": ...}` shape the conversation agent sends.

Regression guard: handlers used to declare `slot_schema` as a `vol.Schema`,
which made HA's slot validation raise
`AttributeError: 'Schema' object has no attribute 'items'`, and they read slot
values as plain strings, so a matched intent still failed.
"""

from __future__ import annotations

import asyncio
import os

import pytest

pytest.importorskip("homeassistant")

from homeassistant.core import HomeAssistant  # noqa: E402
from homeassistant.helpers import intent  # noqa: E402

from custom_components.ha_reminders import intents as intents_module  # noqa: E402
from custom_components.ha_reminders.const import DOMAIN  # noqa: E402
from custom_components.ha_reminders.coordinator import (  # noqa: E402
    ReminderCoordinator,
)

OPTIONS = {
    "default_notify_service": "notify.mobile_app_test",
    "default_person_entity_ids": "person.kyle",
}


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
    hass.states.async_set("zone.work", "0", {"friendly_name": "Work"})
    hass.states.async_set("person.kyle", "not_home", {"friendly_name": "Kyle"})

    coordinator = ReminderCoordinator(hass, OPTIONS)
    coordinator.async_set_updated_data(await coordinator._async_update_data())  # noqa: SLF001
    hass.data[DOMAIN] = {"coordinator": coordinator}
    intents_module.async_setup_intents(hass)
    return hass, coordinator


async def _handle(hass, intent_type: str, slots: dict, text: str = ""):
    return await intent.async_handle(
        hass, "conversation", intent_type, slots=slots, text_input=text
    )


def _speech(response) -> str:
    return response.speech["plain"]["speech"]


async def _run(tmp_path):
    hass, coordinator = await _build(tmp_path)
    out: dict[str, object] = {}
    try:
        slot = lambda value: {"value": value, "text": str(value)}  # noqa: E731

        # zone create: "remind me when I get home to take out the trash"
        response = await _handle(
            hass,
            "ReminderCreate",
            {"title": slot("take out the trash"), "zone": slot("home"), "direction": slot("enter")},
            "remind me when I get home to take out the trash",
        )
        out["zone_speech"] = _speech(response)
        zone = coordinator.data[0]
        out["zone"] = (zone.trigger_type, zone.zone_entity_id, zone.person_entity_ids,
                       zone.title, zone.notify_service, zone.user_name)

        # relative time create (numeric slot value, as a range list delivers)
        await _handle(
            hass,
            "ReminderCreate",
            {"title": slot("stretch"), "minutes": {"value": 30.0, "text": "30"}},
            "remind me in 30 minutes to stretch",
        )
        timed = coordinator.data[1]
        out["timed"] = (timed.trigger_type, timed.one_shot, timed.time is not None,
                        timed.every_x_days)

        # absolute time create
        await _handle(
            hass,
            "ReminderCreate",
            {"title": slot("call mom"), "time": slot("8 pm")},
            "remind me at 8 pm to call mom",
        )
        daily = coordinator.data[2]
        out["daily"] = (daily.trigger_type, daily.one_shot, str(daily.time))

        # list
        out["list_speech"] = _speech(await _handle(hass, "ReminderList", {}))

        # snooze / complete / delete by title
        out["snooze_speech"] = _speech(
            await _handle(
                hass,
                "ReminderSnooze",
                {"title": slot("take out the trash"), "minutes": {"value": 15.0, "text": "15"}},
            )
        )
        out["complete_speech"] = _speech(
            await _handle(hass, "ReminderComplete", {"title": slot("take out the trash")})
        )
        out["delete_speech"] = _speech(
            await _handle(hass, "ReminderDelete", {"number": slot("2")})
        )
        out["remaining"] = len(coordinator.data)

        # unknown zone -> handled error
        try:
            await _handle(
                hass,
                "ReminderCreate",
                {"title": slot("x"), "zone": slot("atlantis"), "direction": slot("enter")},
            )
        except intent.IntentHandleError as err:
            out["unknown_zone_error"] = str(err)
        return out
    finally:
        await coordinator.async_shutdown()
        await hass.async_stop()


@pytest.fixture(scope="module")
def results(tmp_path_factory):
    return asyncio.run(_run(tmp_path_factory.mktemp("intents")))


def test_zone_reminder_created_from_slots(results) -> None:
    assert "take out the trash" in results["zone_speech"]
    trigger, zone_entity, persons, title, notify, user = results["zone"]
    assert trigger == "zone_enter"
    assert zone_entity == "zone.home"
    assert persons == ["person.kyle"]
    assert title == "take out the trash"
    assert notify == "notify.mobile_app_test"  # from the entry defaults


def test_relative_time_reminder_is_one_shot(results) -> None:
    trigger, one_shot, has_time, every = results["timed"]
    assert trigger == "time"
    assert one_shot is True
    assert has_time and every == 1


def test_absolute_time_reminder_is_daily(results) -> None:
    trigger, one_shot, when = results["daily"]
    assert trigger == "time"
    assert one_shot is False
    assert when == "20:00:00"


def test_list_returns_reminders(results) -> None:
    assert "reminder" in results["list_speech"].lower()


def test_snooze_complete_delete(results) -> None:
    assert "snoozed" in results["snooze_speech"]
    assert "complete" in results["complete_speech"].lower()
    assert "Deleted" in results["delete_speech"]
    assert results["remaining"] == 2  # 3 created, one deleted


def test_unknown_zone_reports_error(results) -> None:
    assert "atlantis" in results["unknown_zone_error"]
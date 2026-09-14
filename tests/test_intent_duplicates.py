"""Voice requests for a task that already exists must not create a second copy.

Regression guard: asking Assist for the same thing twice created another
reminder. Speech recognition made it hard to notice — "Pack a work sweater"
was created a second time as "Pack a work sludder".
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
from custom_components.ha_reminders.intents import find_similar_reminder  # noqa: E402
from custom_components.ha_reminders.models import Reminder  # noqa: E402

OPTIONS = {
    "default_notify_service": "notify.mobile_app_test",
    "default_person_entity_ids": "person.kyle",
}


def _reminder(title: str, enabled: bool = True) -> Reminder:
    return Reminder.from_dict(
        {
            "title": title,
            "message": title,
            "trigger_type": "zone_enter",
            "zone_entity_id": "zone.home",
            "person_entity_ids": ["person.kyle"],
            "notify_service": "notify.mobile_app_test",
            "enabled": enabled,
        }
    )


# --------------------------------------------------------------------------
# Title matching
# --------------------------------------------------------------------------


@pytest.mark.parametrize(
    "spoken,existing",
    [
        ("pack a work sweater", "pack a work sweater"),  # identical
        ("pack a work sludder", "pack a work sweater"),  # misheard word
        ("Pack A Work Sweater!", "pack a work sweater"),  # case/punctuation
        ("  pack   a work sweater  ", "pack a work sweater"),  # spacing
    ],
)
def test_similar_titles_match(spoken, existing) -> None:
    assert find_similar_reminder([_reminder(existing)], spoken) is not None


@pytest.mark.parametrize(
    "spoken,existing",
    [
        ("pack a lunch", "pack a work sweater"),  # one shared word only
        ("take out the trash", "pack a work sweater"),
        ("call mom", "pack a work sweater"),
    ],
)
def test_different_tasks_do_not_match(spoken, existing) -> None:
    assert find_similar_reminder([_reminder(existing)], spoken) is None


def test_disabled_reminders_are_not_matched() -> None:
    existing = _reminder("pack a work sweater", enabled=False)
    assert find_similar_reminder([existing], "pack a work sweater") is None


def test_empty_title_never_matches() -> None:
    assert find_similar_reminder([_reminder("pack a work sweater")], "") is None
    assert find_similar_reminder([_reminder("pack a work sweater")], "  !! ") is None


# --------------------------------------------------------------------------
# End to end through the intent handler
# --------------------------------------------------------------------------


async def _build(tmp_path):
    config_dir = str(tmp_path)
    os.makedirs(os.path.join(config_dir, ".storage"), exist_ok=True)

    hass = HomeAssistant(config_dir)
    hass.config.config_dir = config_dir

    from homeassistant.helpers import frame  # noqa: PLC0415

    if hasattr(frame, "async_setup"):
        frame.async_setup(hass)

    hass.states.async_set("zone.home", "0", {"friendly_name": "Home"})
    hass.states.async_set("person.kyle", "not_home", {"friendly_name": "Kyle"})

    coordinator = ReminderCoordinator(hass, OPTIONS)
    coordinator.async_set_updated_data(await coordinator._async_update_data())  # noqa: SLF001
    hass.data[DOMAIN] = {"coordinator": coordinator}
    intents_module.async_setup_intents(hass)
    return hass, coordinator


async def _say(hass, title: str):
    slot = lambda value: {"value": value, "text": str(value)}  # noqa: E731
    return await intent.async_handle(
        hass,
        "conversation",
        "ReminderCreate",
        slots={
            "title": slot(title),
            "zone": slot("home"),
            "direction": slot("enter"),
        },
        text_input=f"remind me when I get home to {title}",
    )


async def _run(tmp_path):
    hass, coordinator = await _build(tmp_path)
    out: dict[str, object] = {}
    try:
        first = await _say(hass, "pack a work sweater")
        out["first_speech"] = first.speech["plain"]["speech"]
        out["after_first"] = len(coordinator.data)

        # The misheard repeat.
        second = await _say(hass, "pack a work sludder")
        out["second_speech"] = second.speech["plain"]["speech"]
        out["after_second"] = len(coordinator.data)
        out["titles"] = [r.title for r in coordinator.data]

        # A genuinely different task still creates a new reminder.
        await _say(hass, "take out the trash")
        out["after_third"] = len(coordinator.data)
    finally:
        await hass.async_stop()
    return out


@pytest.fixture(scope="module")
def results(tmp_path_factory):
    return asyncio.run(_run(tmp_path_factory.mktemp("intents_duplicates")))


def test_repeat_request_does_not_create_a_second_reminder(results) -> None:
    assert results["after_first"] == 1
    assert results["after_second"] == 1, "the misheard repeat created a duplicate"
    assert results["titles"] == ["pack a work sludder"]  # renamed to what was said


def test_repeat_request_says_what_it_did(results) -> None:
    assert "already" in results["second_speech"].lower()
    assert "instead" in results["second_speech"].lower()


def test_a_different_task_still_creates_a_reminder(results) -> None:
    assert results["after_third"] == 2

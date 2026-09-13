"""Sentence-template tests.

Loads `custom_sentences/en/reminders.yaml` with the same matcher Home
Assistant uses (hassil) and asserts that natural phrasings map to the right
intent and slots — including "remind me when I get home to take out the
trash", which the original templates did not match.
"""

from __future__ import annotations

from pathlib import Path

import pytest
import yaml

hassil = pytest.importorskip("hassil")

from hassil.intents import Intents  # noqa: E402
from hassil.recognize import recognize  # noqa: E402

SENTENCES = (
    Path(__file__).resolve().parents[1]
    / "custom_sentences"
    / "en"
    / "reminders.yaml"
)


@pytest.fixture(scope="module")
def intents() -> Intents:
    return Intents.from_dict(yaml.safe_load(SENTENCES.read_text()))


def _match(intents: Intents, text: str):
    result = recognize(text, intents)
    if result is None:
        return None, {}
    return result.intent.name, {k: v.value for k, v in result.entities.items()}


@pytest.mark.parametrize(
    ("text", "direction", "zone", "title"),
    [
        ("remind me when I get home to take out the trash", "enter", "home", "take out the trash"),
        ("remind me when I get to work to check the mail", "enter", "work", "check the mail"),
        ("remind me when I arrive at home to unpack groceries", "enter", "home", "unpack groceries"),
        ("when I get home remind me to feed the cat", "enter", "home", "feed the cat"),
        ("remind me when I leave work to buy milk", "leave", "work", "buy milk"),
        ("when I leave home remind me to lock the door", "leave", "home", "lock the door"),
        ("remind me to take out the trash when I get home", "enter", "home", "take out the trash"),
        ("remind me to buy milk when I leave work", "leave", "work", "buy milk"),
        ("create a reminder to water the plants when I arrive at home", "enter", "home", "water the plants"),
    ],
)
def test_zone_phrasings(intents, text, direction, zone, title) -> None:
    name, slots = _match(intents, text)
    assert name == "ReminderCreate", f"{text!r} did not match ReminderCreate"
    assert slots.get("direction") == direction
    assert slots.get("zone") == zone
    assert slots.get("title") == title


@pytest.mark.parametrize(
    ("text", "expected_slot", "expected_value"),
    [
        ("remind me to stretch in 30 minutes", "minutes", 30),
        ("remind me in 30 minutes to stretch", "minutes", 30),
        ("remind me to call mom at 8 pm", "time", "8 pm"),
        ("remind me at 8 pm to call mom", "time", "8 pm"),
    ],
)
def test_time_phrasings(intents, text, expected_slot, expected_value) -> None:
    name, slots = _match(intents, text)
    assert name == "ReminderCreate", f"{text!r} did not match ReminderCreate"
    value = slots.get(expected_slot)
    assert value is not None, f"{text!r} did not fill {expected_slot}"
    assert int(value) == expected_value if isinstance(expected_value, int) else value == expected_value


@pytest.mark.parametrize(
    ("text", "intent_name", "slot", "value"),
    [
        ("list my reminders", "ReminderList", None, None),
        ("what reminders do I have", "ReminderList", None, None),
        ("delete reminder number 2", "ReminderDelete", "number", "2"),
        ("complete the reminder take out the trash", "ReminderComplete", "title", "take out the trash"),
        ("snooze reminder take out the trash for 15 minutes", "ReminderSnooze", "title", "take out the trash"),
    ],
)
def test_other_intents(intents, text, intent_name, slot, value) -> None:
    name, slots = _match(intents, text)
    assert name == intent_name, f"{text!r} -> {name}"
    if slot is not None:
        matched = slots.get(slot)
        assert matched is not None and str(int(matched)) == value if slot == "number" else matched == value
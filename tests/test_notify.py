"""Tests for the notification action protocol (blueprint-compatible encoding).

`notify.py` imports `homeassistant.core` only for type annotations. When a
Home Assistant runtime is not installed (plain `pip install pytest`), we stub
that module before importing; with HA installed the real module is used.
"""

from __future__ import annotations

import importlib.util
import sys
import types

if importlib.util.find_spec("homeassistant") is None:
    # Fallback for dev machines without a Home Assistant runtime.
    _ha = types.ModuleType("homeassistant")
    _ha_core = types.ModuleType("homeassistant.core")
    _ha_core.HomeAssistant = object  # type: ignore[attr-defined]
    sys.modules.setdefault("homeassistant", _ha)
    sys.modules["homeassistant.core"] = _ha_core

import pytest  # noqa: E402

from custom_components.ha_reminders import notify  # noqa: E402
from custom_components.ha_reminders.models import Reminder  # noqa: E402


def make_reminder(**overrides) -> Reminder:
    payload = {
        "id": "r1",
        "title": "Feed the cat",
        "message": "The cat is hungry",
        "notify_service": "mobile_app_pixel",
        "trigger_type": "time",
        "time": "08:00",
    }
    payload.update(overrides)
    return Reminder.from_dict(payload)


class TestActionProtocol:
    def test_action_string_encoding(self):
        encoded = notify.action_string("r1", "team", -1, "Kyle")
        assert encoded == "taskReminder╡r1╡team╡-1╡Kyle"

    def test_parse_action_roundtrip(self):
        encoded = notify.action_string("r1", "team", 15, "Kyle")
        assert notify.parse_action(encoded) == ("taskReminder", "r1", "team", 15, "Kyle")

    def test_parse_action_ignores_foreign(self):
        assert notify.parse_action("some_other_app.action") is None

    def test_parse_action_short_string(self):
        assert notify.parse_action("taskReminder╡r1") is None

    def test_parse_action_bad_minutes(self):
        assert notify.parse_action("taskReminder╡r1╡team╡abc╡Kyle") is None

    def test_tag(self):
        assert notify.notification_tag("r1") == "taskReminder╡r1"


class TestSplitService:
    @pytest.mark.parametrize(
        ("value", "expected"),
        [
            ("mobile_app_pixel", ("mobile_app_pixel", "notify")),
            ("notify.mobile_app_pixel", ("notify", "mobile_app_pixel")),
        ],
    )
    def test_split(self, value, expected):
        assert notify.split_service(value) == expected


class TestNotificationData:
    def test_build_reminder_data(self):
        reminder = make_reminder(
            user_name="Kyle",
            notification_group="team",
            acknowledge_action_title="Done",
            snooze_delays=[5, 60],
            color="#ff0000",
        )
        data = notify.build_reminder_data(reminder)
        assert data["tag"] == "taskReminder╡r1"
        assert data["color"] == "#ff0000"
        assert "subtitle" not in data  # empty strings are dropped
        assert len(data["actions"]) == 3  # ack + 2 snoozes
        ack, snooze_5, snooze_60 = data["actions"]
        assert ack["action"] == "taskReminder╡r1╡team╡-1╡Kyle"
        assert ack["title"] == "Done"
        assert snooze_5["title"] == "Snooze for 5m"
        assert snooze_60["title"] == "Snooze for 1h"

    def test_custom_snooze_text(self):
        reminder = make_reminder(snooze_text="Later in ${time}", snooze_delays=[90])
        actions = notify.build_reminder_data(reminder)["actions"]
        assert actions[1]["title"] == "Later in 1h30m"
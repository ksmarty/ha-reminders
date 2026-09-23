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

from custom_components.ha_reminders import notify  # noqa: E402
from custom_components.ha_reminders.models import Reminder  # noqa: E402
from custom_components.ha_reminders.notify import (  # noqa: E402
    resolve_notify_target,
)


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


class TestResolveNotifyTarget:
    """Resolution of stored notify targets to (domain, service)."""

    @staticmethod
    def _has_service(*services: tuple[str, str]):
        return lambda domain, service: (domain, service) in set(services)

    def test_generic_notify_target_is_flagged(self):
        """`notify.notify` broadcasts to every device, so it is flagged."""
        assert notify.is_generic_notify_target("notify", "notify")
        assert notify.is_generic_notify_target("notify", "send_message")
        assert not notify.is_generic_notify_target("notify", "mobile_app_pixel")
        assert not notify.is_generic_notify_target("mobile_app_pixel", "notify")

    def test_bare_generic_name_is_the_broadcast_target(self):
        """Documents the footgun: a bare 'notify' means 'notify everyone'."""
        has = self._has_service(("notify", "notify"))
        resolved = resolve_notify_target("notify", has)
        assert resolved == ("notify", "notify")
        assert notify.is_generic_notify_target(*resolved)

    def test_explicit_domain_service(self):
        assert resolve_notify_target(
            "notify.mobile_app_pixel", self._has_service()
        ) == ("notify", "mobile_app_pixel")

    def test_bare_name_resolves_against_notify_domain(self):
        """HA registers notify targets as services under the notify domain."""
        has = self._has_service(("notify", "mobile_app_pixel"))
        assert resolve_notify_target("mobile_app_pixel", has) == (
            "notify",
            "mobile_app_pixel",
        )

    def test_legacy_per_device_domain_still_works(self):
        has = self._has_service(("mobile_app_pixel", "notify"))
        assert resolve_notify_target("mobile_app_pixel", has) == (
            "mobile_app_pixel",
            "notify",
        )

    def test_unknown_bare_name_defaults_to_notify_domain(self):
        """Prefer the modern interpretation so errors name the right service."""
        assert resolve_notify_target("nope", self._has_service()) == ("notify", "nope")

    def test_empty_value(self):
        assert resolve_notify_target("", self._has_service()) == ("notify", "notify")


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


class TestIconPayload:
    """The companion app takes MDI slugs and images through different keys.

    See the "Notification icon and color" docs: `notification_icon` is a
    Material Design Icon slug, `icon_url` an image.
    """

    def test_no_icon_adds_no_key(self):
        assert notify.icon_payload("") == {}
        assert notify.icon_payload(None) == {}
        assert notify.icon_payload("   ") == {}

    def test_mdi_slug_uses_notification_icon(self):
        assert notify.icon_payload("mdi:bell-ring") == {
            "notification_icon": "mdi:bell-ring"
        }

    def test_url_uses_icon_url(self):
        url = "https://example.com/reminder.png"
        assert notify.icon_payload(url) == {"icon_url": url}

    def test_relative_path_is_an_image(self):
        """`/local/...` is a path, not an MDI slug."""
        assert notify.icon_payload("/local/reminder.png") == {
            "icon_url": "/local/reminder.png"
        }

    def test_reminder_icon_wins_over_the_integration_default(self):
        reminder = make_reminder(icon="mdi:alarm")
        data = notify.build_reminder_data(reminder, "mdi:bell-ring")
        assert data["notification_icon"] == "mdi:alarm"
        assert "icon_url" not in data

    def test_integration_default_is_used_when_the_reminder_has_none(self):
        data = notify.build_reminder_data(make_reminder(), "mdi:bell-ring")
        assert data["notification_icon"] == "mdi:bell-ring"

    def test_no_icon_anywhere_leaves_the_payload_alone(self):
        data = notify.build_reminder_data(make_reminder())
        assert "notification_icon" not in data
        assert "icon_url" not in data
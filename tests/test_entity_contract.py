"""Entity-contract regression tests.

Home Assistant calls `CoordinatorEntity._handle_coordinator_update` without
awaiting it, so an `async def` override silently does nothing and entity
states freeze (this shipped in v1.0.0–v1.0.7 and made working reminders look
broken in the UI).
"""

from __future__ import annotations

import inspect

import pytest

pytest.importorskip("homeassistant")

from custom_components.ha_reminders.sensor import ReminderSensor  # noqa: E402


def test_coordinator_update_handler_is_sync_callback() -> None:
    """Must be a plain callback — HA never awaits this hook."""
    assert not inspect.iscoroutinefunction(
        ReminderSensor._handle_coordinator_update
    ), "ReminderSensor._handle_coordinator_update must be a sync callback"


def test_sensor_exposes_reminder_id_attribute_contract() -> None:
    """The card finds reminders by scanning for the `reminder_id` attribute."""
    from custom_components.ha_reminders.const import ATTR_REMINDER_ID

    assert ATTR_REMINDER_ID == "reminder_id"
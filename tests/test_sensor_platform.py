"""Sensor platform setup tests.

Regression guard: HA passes a *sync* scheduling callback into platform setup
(`_async_schedule_add_entities`, which returns None). Awaiting it blindly
raised `TypeError: 'NoneType' object can't be awaited` on every add.
"""

from __future__ import annotations

import asyncio
import os
from types import SimpleNamespace

import pytest

pytest.importorskip("homeassistant")

from homeassistant.core import HomeAssistant  # noqa: E402

from custom_components.ha_reminders import sensor  # noqa: E402
from custom_components.ha_reminders.const import DOMAIN  # noqa: E402
from custom_components.ha_reminders.coordinator import (  # noqa: E402
    ReminderCoordinator,
)


async def _build(tmp_path):
    config_dir = str(tmp_path)
    os.makedirs(os.path.join(config_dir, ".storage"), exist_ok=True)

    hass = HomeAssistant(config_dir)
    hass.config.config_dir = config_dir

    from homeassistant.helpers import frame  # noqa: PLC0415

    if hasattr(frame, "async_setup"):
        frame.async_setup(hass)

    coordinator = ReminderCoordinator(hass, {})
    coordinator.async_set_updated_data(await coordinator._async_update_data())  # noqa: SLF001
    await coordinator.async_create(
        {
            "title": "Platform test",
            "message": "hello",
            "notify_service": "notify.mobile_app_test",
            "trigger_type": "time",
            "time": "08:00",
        }
    )
    hass.data[DOMAIN] = {"coordinator": coordinator}

    entry = SimpleNamespace(async_on_unload=lambda _unsub: None)
    return hass, coordinator, entry


async def _run_sync_callback(tmp_path) -> list:
    hass, coordinator, entry = await _build(tmp_path)
    captured: list = []

    def sync_add(entities) -> None:  # noqa: ANN001 - mimics HA's callback
        captured.extend(entities)
        return None

    try:
        await sensor.async_setup_entry(hass, entry, sync_add)
    finally:
        await coordinator.async_shutdown()
        await hass.async_stop()
    return captured


async def _run_async_callback(tmp_path) -> list:
    hass, coordinator, entry = await _build(tmp_path)
    captured: list = []

    async def async_add(entities) -> None:  # a version returning an awaitable
        captured.extend(entities)

    try:
        await sensor.async_setup_entry(hass, entry, async_add)
        await asyncio.sleep(0)  # let the created task run
    finally:
        await coordinator.async_shutdown()
        await hass.async_stop()
    return captured


def test_sync_add_entities_callback(tmp_path) -> None:
    """Must not raise when HA hands us its sync scheduling callback."""
    assert len(asyncio.run(_run_sync_callback(tmp_path))) == 1


def test_awaitable_add_entities_callback(tmp_path) -> None:
    """Awaitable callbacks are still supported."""
    assert len(asyncio.run(_run_async_callback(tmp_path))) == 1
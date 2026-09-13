"""Service registration contract tests.

Regression guard: `create`/`list` return data, but the services were registered
without `supports_response`, so callers got
"Service does not support responses" and the returned values were unusable
(Developer Tools, REST `?return_response`, automations with `response_variable`).
"""

from __future__ import annotations

import asyncio
import os

import pytest

pytest.importorskip("homeassistant")

from homeassistant.core import HomeAssistant, SupportsResponse  # noqa: E402

from custom_components.ha_reminders import services  # noqa: E402
from custom_components.ha_reminders.const import DOMAIN  # noqa: E402
from custom_components.ha_reminders.coordinator import (  # noqa: E402
    ReminderCoordinator,
)


async def _run(tmp_path) -> dict:
    config_dir = str(tmp_path)
    os.makedirs(os.path.join(config_dir, ".storage"), exist_ok=True)

    hass = HomeAssistant(config_dir)
    hass.config.config_dir = config_dir

    from homeassistant.helpers import frame  # noqa: PLC0415

    if hasattr(frame, "async_setup"):
        frame.async_setup(hass)

    coordinator = ReminderCoordinator(hass, {})
    try:
        await services.async_setup_services(hass, coordinator)
        return hass.services.async_services()[DOMAIN]
    finally:
        await coordinator.async_shutdown()
        await hass.async_stop()


def test_response_capable_services_declare_support(tmp_path) -> None:
    registered = asyncio.run(_run(tmp_path))

    assert registered["create"].supports_response is SupportsResponse.OPTIONAL
    assert registered["list"].supports_response is SupportsResponse.OPTIONAL


def test_mutating_services_need_no_response(tmp_path) -> None:
    registered = asyncio.run(_run(tmp_path))

    for name in ("update", "delete", "snooze", "complete", "set_enabled"):
        assert registered[name].supports_response is SupportsResponse.NONE
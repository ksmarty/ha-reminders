"""Validate the service UI descriptions against Home Assistant's schema.

`services.yaml` drives the Development Tools → Actions UI form; if it fails
HA's validation the fields silently disappear (services render as empty
forms). Requires a Home Assistant runtime (skipped otherwise).
"""

from __future__ import annotations

from pathlib import Path

import pytest

pytest.importorskip("homeassistant")

import yaml  # noqa: E402
from homeassistant.helpers.service import _SERVICES_SCHEMA  # noqa: E402

from custom_components.ha_reminders.const import (  # noqa: E402
    SERVICE_COMPLETE,
    SERVICE_CREATE,
    SERVICE_DELETE,
    SERVICE_LIST,
    SERVICE_SET_ENABLED,
    SERVICE_SNOOZE,
    SERVICE_UPDATE,
)


def _services_yaml() -> dict:
    path = (
        Path(__file__).resolve().parents[1]
        / "custom_components"
        / "ha_reminders"
        / "services.yaml"
    )
    return yaml.safe_load(path.read_text())


def test_services_yaml_validates() -> None:
    result = _SERVICES_SCHEMA(_services_yaml())
    for service in (
        SERVICE_CREATE,
        SERVICE_UPDATE,
        SERVICE_DELETE,
        SERVICE_LIST,
        SERVICE_SNOOZE,
        SERVICE_COMPLETE,
        SERVICE_SET_ENABLED,
    ):
        assert service in result, f"missing service description: {service}"


def test_create_has_ui_fields() -> None:
    """The create form must define selector fields (not an empty UI)."""
    result = _SERVICES_SCHEMA(_services_yaml())
    fields = result[SERVICE_CREATE]["fields"]
    for field in ("title", "message", "trigger_type", "zone_entity_id", "time"):
        assert field in fields, f"missing UI field: {field}"
        assert "selector" in fields[field], f"no selector for: {field}"
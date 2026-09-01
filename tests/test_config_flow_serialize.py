"""Regression tests for the config-flow form.

Guards against the v1.0.1 regression: the flow's voluptuous schema must be
serializable by HA's flow serializer (`voluptuous_serialize` +
`cv.custom_serializer`). A bare Python function used as a validator makes the
serializer raise `ValueError`, which surfaces as a 500 when opening the config
flow.

These tests require a Home Assistant runtime (skipped otherwise).
"""

from __future__ import annotations

from types import SimpleNamespace

import pytest

pytest.importorskip("homeassistant")

import voluptuous as vol  # noqa: E402
import voluptuous_serialize  # noqa: E402
from homeassistant.helpers import config_validation as cv  # noqa: E402

from custom_components.ha_reminders.config_flow import (  # noqa: E402
    _default_options,
    _parse_snooze_delays,
    RemindersConfigFlow,
)


class _FakeServices:
    @staticmethod
    def async_services() -> dict[str, dict[str, object]]:
        return {
            "mobile_app_pixel_8": {"notify": object()},
            "notify": {"notify": object()},
        }


class _FakeStates:
    @staticmethod
    def async_all(domain: str):
        if domain == "person":
            return [
                SimpleNamespace(
                    entity_id="person.kyle",
                    attributes={"friendly_name": "Kyle"},
                )
            ]
        return []


class _FakeHass:
    services = _FakeServices
    states = _FakeStates


def _serialize_schema(schema) -> list[dict]:
    return voluptuous_serialize.convert(schema, custom_serializer=cv.custom_serializer)


def test_defaults_form_serializes() -> None:
    """The user/options schema must convert without bare-function validators."""
    flow = RemindersConfigFlow()
    flow.hass = _FakeHass()  # type: ignore[attr-defined]
    schema = flow._options_schema(_default_options())  # noqa: SLF001
    serialized = _serialize_schema(schema)
    by_name = {field["name"]: field for field in serialized}

    assert by_name["default_snooze_delays"]["type"] == "string"
    assert by_name["default_notify_service"]["type"] == "select"
    assert by_name["default_person_entity_ids"]["type"] == "multi_select"

    # The empty default must be labeled, not rendered as a blank entry.
    notify_options = by_name["default_notify_service"]["options"]
    assert notify_options[0][0] == ""
    assert notify_options[0][1] == "No default"


def test_options_form_serializes_with_stale_defaults() -> None:
    """Already-configured values stay serializable even if entities are gone."""
    flow = RemindersConfigFlow()
    flow.hass = _FakeHass()  # type: ignore[attr-defined]
    options = _default_options()
    options["default_notify_service"] = "notify.disappeared_group"
    options["default_person_entity_ids"] = ["person.removed"]
    schema = flow._options_schema(options)  # noqa: SLF001
    serialized = _serialize_schema(schema)
    by_name = {field["name"]: field for field in serialized}

    assert by_name["default_person_entity_ids"]["type"] == "multi_select"
    assert "person.removed" in by_name["default_person_entity_ids"]["options"]


def test_no_persons_falls_back_to_string() -> None:
    """Without person entities the field degrades to a text input."""
    flow = RemindersConfigFlow()

    class _NoPersons(_FakeHass):
        class states:
            @staticmethod
            def async_all(domain: str):
                return []

    flow.hass = _NoPersons()  # type: ignore[attr-defined]
    schema = flow._options_schema(_default_options())  # noqa: SLF001
    serialized = _serialize_schema(schema)
    by_name = {field["name"]: field for field in serialized}

    assert by_name["default_person_entity_ids"]["type"] == "string"


class TestSnoozeDelays:
    def test_valid_parsing(self) -> None:
        assert _parse_snooze_delays("5,15,30") == [5, 15, 30]

    def test_deduplicates(self) -> None:
        assert _parse_snooze_delays("5,5,10") == [5, 10]

    def test_empty_rejected(self) -> None:
        with pytest.raises(vol.Invalid):
            _parse_snooze_delays("")

    def test_non_numeric_rejected(self) -> None:
        with pytest.raises(vol.Invalid):
            _parse_snooze_delays("5,abc")

    def test_negative_rejected(self) -> None:
        with pytest.raises(vol.Invalid):
            _parse_snooze_delays("-5")
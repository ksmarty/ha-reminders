"""LLM tool tests.

Conversational agents call tools rather than matching sentences, and recent
Home Assistant builds only learn about an integration's intents through its
`llm.py` platform. Without it an LLM agent answers "I can't set reminders
directly" — these tests pin the tools it now receives, and that calling one
actually creates a reminder.

`homeassistant.components.llm` (which provides `LLMTools`) only exists on
newer Home Assistant releases, so it is stubbed here to exercise the path.
"""

from __future__ import annotations

import asyncio
import os
import sys
import types

import pytest

pytest.importorskip("homeassistant")

from homeassistant.core import HomeAssistant  # noqa: E402

# The LLM tool helpers only exist on newer releases (and can drag in optional
# dependencies older versions do not install), so skip rather than fail there.
_llm = pytest.importorskip("homeassistant.helpers.llm")
if not hasattr(_llm, "IntentTool") or not hasattr(_llm, "NamespacedTool"):
    pytest.skip("no LLM tool helpers in this Home Assistant version", allow_module_level=True)

LLMContext, ToolInput = _llm.LLMContext, _llm.ToolInput

from custom_components.ha_reminders import intents as intents_module  # noqa: E402
from custom_components.ha_reminders import llm as llm_module  # noqa: E402
from custom_components.ha_reminders.const import DOMAIN  # noqa: E402
from custom_components.ha_reminders.coordinator import (  # noqa: E402
    ReminderCoordinator,
)

OPTIONS = {
    "default_notify_service": "notify.mobile_app_test",
    "default_person_entity_ids": "person.kyle",
}


class _LLMTools:
    def __init__(self, tools, prompt=None) -> None:
        self.tools = tools
        self.prompt = prompt


def _stub_llm_component(monkeypatch) -> None:
    module = types.ModuleType("homeassistant.components.llm")
    module.LLMTools = _LLMTools  # type: ignore[attr-defined]
    monkeypatch.setitem(sys.modules, "homeassistant.components.llm", module)


def _context() -> LLMContext:
    return LLMContext(
        platform="conversation",
        context=None,
        language="en",
        assistant="conversation",
        device_id=None,
    )


async def _run(tmp_path, monkeypatch):
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

    _stub_llm_component(monkeypatch)

    try:
        tools = llm_module.async_get_tools(hass, _context(), "assist")
        by_name = {tool.name: tool for tool in tools.tools}

        create = by_name["ha_reminders__ReminderCreate"]
        created = await create.async_call(
            hass,
            ToolInput(
                tool_name=create.name,
                tool_args={"title": "take out the trash", "direction": "enter", "zone": "home"},
            ),
            _context(),
        )

        listed = await by_name["ha_reminders__ReminderList"].async_call(
            hass, ToolInput(tool_name="ha_reminders__ReminderList", tool_args={}), _context()
        )

        return {
            "prompt": tools.prompt,
            "names": [tool.name for tool in tools.tools],
            "descriptions": {tool.name: tool.description for tool in tools.tools},
            "create_params": create.parameters,
            "created_call": created,
            "listed_call": listed,
            "reminder": coordinator.data[0] if coordinator.data else None,
        }
    finally:
        await coordinator.async_shutdown()
        await hass.async_stop()


@pytest.fixture(scope="module")
def result(tmp_path_factory, pytestconfig):
    # monkeypatch is function scoped, so drive the stub manually here.
    module = types.ModuleType("homeassistant.components.llm")
    module.LLMTools = _LLMTools  # type: ignore[attr-defined]
    previous = sys.modules.get("homeassistant.components.llm")
    sys.modules["homeassistant.components.llm"] = module
    try:
        return asyncio.run(_run(tmp_path_factory.mktemp("llm"), _NoPatch()))
    finally:
        if previous is None:
            sys.modules.pop("homeassistant.components.llm", None)
        else:
            sys.modules["homeassistant.components.llm"] = previous


class _NoPatch:
    """Minimal stand-in for pytest's monkeypatch fixture."""

    def setitem(self, mapping, key, value) -> None:
        mapping[key] = value


def test_tools_are_exposed_with_names_and_descriptions(result) -> None:
    assert result["names"] == [
        "ha_reminders__ReminderCreate",
        "ha_reminders__ReminderList",
        "ha_reminders__ReminderComplete",
        "ha_reminders__ReminderSnooze",
        "ha_reminders__ReminderDelete",
    ]
    for name, description in result["descriptions"].items():
        assert description, f"{name} has no description for the model"
    assert "reminder" in result["descriptions"]["ha_reminders__ReminderCreate"].lower()
    assert "zone" in result["descriptions"]["ha_reminders__ReminderCreate"]
    assert result["prompt"] and "ha_reminders" in result["prompt"]


def test_create_tool_parameters_guide_the_model(result) -> None:
    schema = result["create_params"].schema
    keys = {str(key) for key in schema}
    assert any("title" in key for key in keys)
    assert any("direction" in key for key in keys)
    direction = next(value for key, value in schema.items() if "direction" in str(key))
    assert "enter" in direction.container and "leave" in direction.container


def test_calling_the_create_tool_creates_a_reminder(result) -> None:
    reminder = result["reminder"]
    assert reminder is not None, "the tool did not create a reminder"
    assert reminder.title == "take out the trash"
    assert reminder.trigger_type == "zone_enter"
    assert reminder.zone_entity_id == "zone.home"
    assert reminder.person_entity_ids == ["person.kyle"]
    assert reminder.notify_service == "notify.mobile_app_test"


def test_calling_the_list_tool_reports_reminders(result) -> None:
    assert result["listed_call"] is not None
"""LLM tools for HA Reminders.

Conversational agents (Assist with an LLM, or any custom LLM conversation
agent) do not use the sentence templates — they call tools. Recent Home
Assistant versions gather those tools from each integration's ``llm.py``
platform (``components/llm/__init__.py``) instead of auto-exposing every
registered intent, so without this module an LLM agent has no way to touch
reminders and answers "I can't set reminders directly".

Older Home Assistant builds expose all intents to the Assist LLM API by
themselves and do not provide ``LLMTools``; there this module simply returns
nothing and behaviour is unchanged.
"""

from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant, callback

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Intents exposed as tools, in the order the model should consider them.
TOOL_INTENTS = (
    "ReminderCreate",
    "ReminderList",
    "ReminderComplete",
    "ReminderSnooze",
    "ReminderDelete",
)

PROMPT = (
    "The user can manage reminders through the ha_reminders tools. Use "
    "ha_reminders__ReminderCreate to set one (include 'direction' and 'zone' "
    "for a location reminder, 'minutes' for something relative like in 30 "
    "minutes, or 'time' for a daily reminder), ha_reminders__ReminderList to "
    "read them back, and the complete, snooze and delete tools to manage "
    "them. Reminders notify the user's devices; acknowledge with "
    "ha_reminders__ReminderComplete when the task is done."
)


@callback
def async_get_tools(hass: HomeAssistant, llm_context: object, api_id: str) -> object:
    """Return the reminder intents as LLM tools for a conversational agent."""
    try:
        from homeassistant.components.llm import LLMTools
        from homeassistant.helpers import intent
        from homeassistant.helpers.llm import IntentTool, NamespacedTool
    except ImportError:
        # Older Home Assistant: intents are already exposed to LLMs directly.
        return None

    handlers = [
        handler
        for handler in intent.async_get(hass)
        if handler.intent_type in TOOL_INTENTS
    ]
    if not handlers:
        _LOGGER.debug("No reminder intent handlers registered for LLM tools")
        return None

    tools = [
        # Namespaced like core integrations (e.g. intent__HassTurnOn).
        # NamespacedTool keeps the plain intent type for the actual call, so
        # the tool name is ha_reminders__ReminderCreate while the intent is
        # dispatched as ReminderCreate.
        NamespacedTool(DOMAIN, IntentTool(handler.intent_type, handler))
        for handler in sorted(handlers, key=lambda h: TOOL_INTENTS.index(h.intent_type))
    ]
    _LOGGER.debug("Exposing %d reminder tools to the LLM API '%s'", len(tools), api_id)
    return LLMTools(tools=tools, prompt=PROMPT)
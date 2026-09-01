"""Notification payload building and sending.

Keeps the `taskReminder╡<id>╡<group>╡<minutes>╡<user>` action encoding used by
the legacy blueprint so existing notification actions keep working.
"""

from __future__ import annotations

from typing import Any

from homeassistant.core import HomeAssistant

from .const import (
    ACKNOWLEDGE_MINUTES,
    ACTION_PREFIX,
    ACTION_SEPARATOR,
)
from .models import Reminder
from .util import format_delay


def action_string(
    reminder_id: str,
    notification_group: str,
    minutes: int,
    user_name: str,
) -> str:
    """Encode a notification action string."""
    return ACTION_SEPARATOR.join(
        (ACTION_PREFIX, reminder_id, notification_group, str(minutes), user_name)
    )


def notification_tag(reminder_id: str) -> str:
    """Tag used to replace the previous notification for the same reminder."""
    return f"{ACTION_PREFIX}{ACTION_SEPARATOR}{reminder_id}"


def parse_action(action: str) -> tuple[str, str, str, int, str] | None:
    """Parse a `taskReminder╡...` action string.

    Returns (prefix, reminder_id, group, minutes, user_name) or None when the
    action does not belong to this integration.
    """
    parts = str(action).split(ACTION_SEPARATOR)
    if len(parts) < 5 or parts[0] != ACTION_PREFIX:
        return None
    try:
        minutes = int(parts[3])
    except ValueError:
        return None
    return parts[0], parts[1], parts[2], minutes, parts[4]


def split_service(notify_service: str) -> tuple[str, str]:
    """Split a notify service reference into (domain, service).

    Accepts `mobile_app_pixel_8` (the blueprint convention, service is always
    `notify`) or an explicit `domain.service` reference.
    """
    if "." in str(notify_service):
        domain, service = str(notify_service).split(".", 1)
        return domain, service
    return str(notify_service), "notify"


def build_reminder_data(reminder: Reminder) -> dict[str, Any]:
    """Build the service data for a reminder notification."""
    actions = [
        {
            "action": action_string(
                reminder.id, reminder.notification_group, ACKNOWLEDGE_MINUTES,
                reminder.user_name,
            ),
            "title": reminder.acknowledge_action_title,
        }
    ]
    for minutes in reminder.snooze_delays:
        actions.append(
            {
                "action": action_string(
                    reminder.id, reminder.notification_group, minutes,
                    reminder.user_name,
                ),
                "title": reminder.snooze_text.replace("${time}", format_delay(minutes)),
            }
        )

    data: dict[str, Any] = {
        "subtitle": reminder.subtitle or "",
        "subject": reminder.subtitle or "",
        "channel": reminder.channel or "",
        "importance": reminder.channel_importance or "",
        "color": reminder.color or "",
        "tag": notification_tag(reminder.id),
        "actions": actions,
    }
    # Only include keys that carry a value; some platforms treat empty strings
    # as meaningful values.
    return {key: value for key, value in data.items() if value}


async def async_send_reminder(hass: HomeAssistant, reminder: Reminder) -> None:
    """Send (or resend) the reminder notification."""
    domain, service = split_service(reminder.notify_service)
    await hass.services.async_call(
        domain,
        service,
        {
            "title": reminder.title,
            "message": reminder.message,
            "data": build_reminder_data(reminder),
        },
    )


async def async_send_acknowledged(
    hass: HomeAssistant, reminder: Reminder, acknowledged_by: str
) -> None:
    """Notify the other members of a notification group that a task is done."""
    domain, service = split_service(reminder.notify_service)
    data: dict[str, Any] = {
        "subtitle": reminder.subtitle or "",
        "subject": reminder.subtitle or "",
        "channel": reminder.channel or "",
        "tag": notification_tag(reminder.id),
    }
    await hass.services.async_call(
        domain,
        service,
        {
            "title": reminder.acknowledge_notification_title.replace(
                "{user}", acknowledged_by
            ),
            "message": reminder.acknowledge_notification_body.replace(
                "{user}", acknowledged_by
            )
            or f"{acknowledged_by} acknowledged: {reminder.title}",
            "data": {key: value for key, value in data.items() if value},
        },
    )
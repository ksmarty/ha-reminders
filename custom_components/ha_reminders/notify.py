"""Notification payload building and sending.

Keeps the `taskReminder╡<id>╡<group>╡<minutes>╡<user>` action encoding used by
the legacy blueprint so existing notification actions keep working.
"""

from __future__ import annotations

import logging
from typing import Any, Callable

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

from .const import (
    ACKNOWLEDGE_MINUTES,
    ACTION_PREFIX,
    ACTION_SEPARATOR,
)
from .models import Reminder
from .util import format_delay

_LOGGER = logging.getLogger(__name__)

# Generic notify services are not device specific: `notify.notify` broadcasts to
# every notify target when no target is given (components/notify/legacy.py),
# and `notify.send_message` requires an entity target.
_GENERIC_NOTIFY_TARGETS = {("notify", "notify"), ("notify", "send_message")}


def is_generic_notify_target(domain: str, service: str) -> bool:
    """Return True for notify targets that are not tied to a single device."""
    return (domain, service) in _GENERIC_NOTIFY_TARGETS


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


def resolve_notify_target(
    notify_service: str, has_service: Callable[[str, str], bool]
) -> tuple[str, str]:
    """Resolve a stored notify target into a (domain, service) pair.

    Accepted forms:
    - explicit `domain.service` — what the HA UI lists, e.g.
      `notify.mobile_app_pixel_8`
    - bare modern service name — `mobile_app_pixel_8` (resolved against the
      `notify` domain, which is how HA registers it today)
    - legacy blueprint form — a per-device domain offering a `notify` service
    """
    value = str(notify_service or "").strip()
    if not value:
        return "notify", "notify"
    if "." in value:
        domain, service = value.split(".", 1)
        return domain, service
    if has_service("notify", value):
        return "notify", value
    if has_service(value, "notify"):
        return value, "notify"
    # Unknown: assume the modern form so the error message names something
    # the user can compare against their service list.
    return "notify", value


def _resolve(hass: HomeAssistant, reminder: Reminder) -> tuple[str, str]:
    """Resolve and validate the notify target for a reminder."""
    domain, service = resolve_notify_target(
        reminder.notify_service, hass.services.has_service
    )
    if not hass.services.has_service(domain, service):
        raise HomeAssistantError(
            f"notify service '{domain}.{service}' does not exist "
            f"(reminder uses '{reminder.notify_service}')"
        )
    if is_generic_notify_target(domain, service):
        _LOGGER.warning(
            "Reminder '%s' uses the generic notify service '%s.%s', which is "
            "not tied to a device — 'notify.notify' notifies every device. Set "
            "notify_service to a specific service such as "
            "'notify.mobile_app_pixel_8' to reach one device only.",
            reminder.title,
            domain,
            service,
        )
    return domain, service


async def async_send_reminder(hass: HomeAssistant, reminder: Reminder) -> None:
    """Send (or resend) the reminder notification."""
    domain, service = _resolve(hass, reminder)
    await hass.services.async_call(
        domain,
        service,
        {
            "title": reminder.title,
            "message": reminder.message,
            "data": build_reminder_data(reminder),
        },
    )


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


async def async_send_acknowledged(
    hass: HomeAssistant, reminder: Reminder, acknowledged_by: str
) -> None:
    """Notify the other members of a notification group that a task is done."""
    domain, service = _resolve(hass, reminder)
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
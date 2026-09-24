"""Persistent JSON storage for reminder records and durable runtime state.

Records are the user's reminder definitions; the runtime state is the small
part of the notification lifecycle that has to outlive a restart — see
`DURABLE_RUNTIME_KEYS` in `const.py` for what is kept and why.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION
from .models import Reminder

_LOGGER = logging.getLogger(__name__)


class _ReminderStore(Store):
    """The HA store, taught to upgrade the v1 payload shape."""

    async def _async_migrate_func(
        self, old_major_version: int, old_minor_version: int, old_data: Any
    ) -> dict[str, Any]:
        """Upgrade a stored payload to the current shape.

        v1 held a bare list of records; v2 wraps the records and the durable
        runtime state in one dict. Without this, HA raises
        NotImplementedError for a version mismatch and setup fails.
        """
        if old_major_version == 1:
            return {"reminders": old_data or [], "runtime": {}}
        raise NotImplementedError(
            f"no migration from storage version {old_major_version}"
        )


class ReminderStore:
    """Wraps the HA JSON Store holding the reminders and their runtime state."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store = _ReminderStore(hass, STORAGE_VERSION, STORAGE_KEY)
        self._reminders: list[Reminder] | None = None
        self._runtime: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> tuple[list[Reminder], dict[str, dict[str, Any]]]:
        """Load (once) and return the persisted reminders + runtime state."""
        if self._reminders is not None:
            return self._reminders, self._runtime

        raw = await self._store.async_load() or {}
        reminders: list[Reminder] = []
        for data in raw.get("reminders") or []:
            try:
                reminders.append(Reminder.from_dict(data))
            except (TypeError, ValueError) as err:
                _LOGGER.warning(
                    "Dropping invalid reminder record %s: %s",
                    data.get("id") if isinstance(data, dict) else data,
                    err,
                )
        self._reminders = reminders
        self._runtime = {
            str(reminder_id): dict(state)
            for reminder_id, state in (raw.get("runtime") or {}).items()
            if isinstance(state, dict)
        }
        return reminders, self._runtime

    async def async_save(
        self,
        reminders: list[Reminder],
        runtime: dict[str, dict[str, Any]] | None = None,
    ) -> None:
        """Persist the full reminder list and the durable runtime state."""
        self._reminders = reminders
        self._runtime = runtime or {}
        await self._store.async_save(
            {
                "reminders": [reminder.to_dict() for reminder in reminders],
                "runtime": self._runtime,
            }
        )

"""Persistent JSON storage for reminder records."""

from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from .const import STORAGE_KEY, STORAGE_VERSION
from .models import Reminder

_LOGGER = logging.getLogger(__name__)


class ReminderStore:
    """Wraps the HA JSON Store holding the list of reminder records."""

    def __init__(self, hass: HomeAssistant) -> None:
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._reminders: list[Reminder] | None = None

    async def async_load(self) -> list[Reminder]:
        """Load (once) and return the persisted reminders."""
        if self._reminders is not None:
            return self._reminders

        raw = await self._store.async_load()
        reminders: list[Reminder] = []
        for data in raw or []:
            try:
                reminders.append(Reminder.from_dict(data))
            except (TypeError, ValueError) as err:
                _LOGGER.warning(
                    "Dropping invalid reminder record %s: %s",
                    data.get("id") if isinstance(data, dict) else data,
                    err,
                )
        self._reminders = reminders
        return reminders

    async def async_save(self, reminders: list[Reminder]) -> None:
        """Persist the full reminder list."""
        self._reminders = reminders
        await self._store.async_save([reminder.to_dict() for reminder in reminders])
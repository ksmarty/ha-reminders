"""Sensor platform: one `sensor.ha_reminder_*` entity per reminder.

The card scans these entities (by the `reminder_id` attribute) instead of
loading data itself, so list/status updates are reactive for free.
"""

from __future__ import annotations

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, SENSOR_PREFIX
from .coordinator import ReminderCoordinator
from .util import slugify

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Create one sensor per reminder and keep them in sync with the store."""
    coordinator: ReminderCoordinator = hass.data[DOMAIN]["coordinator"]
    sensors: dict[str, ReminderSensor] = {}

    def _sync() -> None:
        """Add sensors for new reminders and remove stale ones."""
        by_id = {reminder.id: reminder for reminder in coordinator.data}

        new_entities: list[ReminderSensor] = []
        for reminder_id, reminder in by_id.items():
            if reminder_id not in sensors:
                sensors[reminder_id] = ReminderSensor(coordinator, reminder)
                new_entities.append(sensors[reminder_id])

        if new_entities:

            async def _add() -> None:
                await async_add_entities(new_entities)

            hass.async_create_task(_add())

        for reminder_id in list(sensors):
            if reminder_id not in by_id:
                stale = sensors.pop(reminder_id)
                hass.async_create_task(stale.async_remove())

    _sync()
    entry.async_on_unload(coordinator.async_add_listener(_sync))


class ReminderSensor(CoordinatorEntity, SensorEntity):
    """Sensor mirroring one reminder record plus its runtime status."""

    _attr_has_entity_name = True
    _attr_icon = "mdi:bell-ring-outline"

    def __init__(self, coordinator: ReminderCoordinator, reminder: Any) -> None:
        super().__init__(coordinator)
        self._reminder_id = reminder.id
        self._reminder = reminder
        self.entity_id = (
            f"sensor.{SENSOR_PREFIX}{slugify(reminder.title)}_{reminder.id[:8]}"
        )

    @property
    def unique_id(self) -> str:
        return f"{DOMAIN}_{self._reminder_id}"

    @property
    def name(self) -> str:
        return self._reminder.title or "Reminder"

    @property
    def entity_category(self) -> EntityCategory | None:
        return None

    def _live_reminder(self) -> Any:
        """Return the live record (may have been edited since creation)."""
        live = self.coordinator.get(self._reminder_id)
        if live is None:
            return self._reminder
        return live

    @property
    def available(self) -> bool:
        return self.coordinator.get(self._reminder_id) is not None

    @property
    def state(self) -> str:
        reminder = self._live_reminder()
        return str(self.coordinator.describe(reminder).get("status", "unknown"))

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        reminder = self._live_reminder()
        return self.coordinator.describe(reminder)

    async def _handle_coordinator_update(self) -> None:
        self.async_write_ha_state()
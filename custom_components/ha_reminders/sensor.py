"""Sensor platform: one `sensor.ha_reminder_*` entity per reminder.

The card scans these entities (by the `reminder_id` attribute) instead of
loading data itself, so list/status updates are reactive for free.
"""

from __future__ import annotations

import inspect
import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity import EntityCategory
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, SENSOR_PREFIX
from .coordinator import ReminderCoordinator
from .util import slugify

_LOGGER = logging.getLogger(__name__)

_ENTITY_DOMAIN = "sensor"


def _reminder_id_from_unique_id(unique_id: str) -> str | None:
    """Return the reminder id inside a sensor's unique id, or None."""
    prefix = f"{DOMAIN}_"
    if not unique_id.startswith(prefix):
        return None
    return unique_id[len(prefix) :]


async def _async_remove_sensor(hass: HomeAssistant, sensor: ReminderSensor) -> None:
    """Remove a deleted reminder's sensor from HA *and* the entity registry.

    `Entity.async_remove()` on its own leaves a non-disabled registry entry
    behind: HA then keeps the entity as a restored `unavailable` state and
    keeps the entity id reserved, so deleted reminders pile up in
    Settings → Entities and a new reminder that wants the same id gets a `_2`
    suffix. Dropping the registry entry is what actually deletes the entity.
    """
    if sensor.hass is not None:
        # force_remove: the state must go, not be parked as `unavailable`.
        await sensor.async_remove(force_remove=True)

    registry = er.async_get(hass)
    if registry is None:
        return
    entity_entry = registry.async_get_entity_id(
        _ENTITY_DOMAIN, DOMAIN, sensor.unique_id
    )
    if entity_entry is not None:
        registry.async_remove(entity_entry)


def _prune_orphan_sensors(hass: HomeAssistant, live_ids: set[str]) -> None:
    """Drop registry entries whose reminder no longer exists.

    Covers deletions that happened while HA was not running and the entries
    older versions left behind (they never removed the registry entry).
    """
    registry = er.async_get(hass)
    if registry is None:
        return

    for entity_entry in list(registry.entities.values()):
        if entity_entry.platform != DOMAIN:
            continue
        if entity_entry.domain != _ENTITY_DOMAIN:
            continue
        reminder_id = _reminder_id_from_unique_id(entity_entry.unique_id)
        if reminder_id is not None and reminder_id not in live_ids:
            registry.async_remove(entity_entry.entity_id)


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
            # HA passes a sync scheduling callback here (`_async_schedule_add_entities`)
            # which returns None — awaiting it blindly raises TypeError. Only
            # await when a version actually hands us an awaitable.
            result = async_add_entities(new_entities)
            if inspect.isawaitable(result):
                hass.async_create_task(result)

        for reminder_id in list(sensors):
            if reminder_id not in by_id:
                stale = sensors.pop(reminder_id)
                hass.async_create_task(_async_remove_sensor(hass, stale))

    _prune_orphan_sensors(hass, {reminder.id for reminder in coordinator.data})
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

    @callback
    def _handle_coordinator_update(self) -> None:
        """Write state when the coordinator publishes new data.

        Must stay a sync callback: HA calls this (it does not await it), so an
        async implementation is never executed and entity states freeze.
        """
        self.async_write_ha_state()
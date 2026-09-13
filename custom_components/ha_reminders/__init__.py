"""HA Reminders integration.

Entry setup wires the coordinator, services, sensor entities, the notification
action listener and the bundled Lovelace card (served over HTTP and injected
with `frontend.add_extra_js_url`).

Imports are intentionally lazy so importing the package (and with it the pure
model/helper modules used by unit tests) does not require a Home Assistant
runtime.
"""

from __future__ import annotations

import logging
import os
from typing import TYPE_CHECKING, Any

from .const import DOMAIN, NOTIFICATION_ACTION_EVENT

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant

PLATFORMS = ["sensor"]

_LOGGER = logging.getLogger(__name__)

CARD_FILENAME = "ha-reminders.js"
CARD_URL = f"/{DOMAIN}/{CARD_FILENAME}"
PANEL_FILENAME = "ha-reminders-panel.js"
PANEL_URL = f"/{DOMAIN}/{PANEL_FILENAME}"
PANEL_ELEMENT = "ha-reminders-panel"
PANEL_URL_PATH = DOMAIN.replace("_", "-")
CARD_URL_KEY = "card_url"
PANEL_TITLE = "Reminders"
PANEL_ICON = "mdi:bell-ring-outline"


async def async_setup(hass: HomeAssistant, config: dict[str, Any]) -> bool:
    """Register intent handlers once per HA start."""
    from . import intents as intents_module

    hass.data.setdefault(DOMAIN, {})
    intents_module.async_setup_intents(hass)
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up the (single) config entry."""
    from . import services
    from .coordinator import ReminderCoordinator
    from .scheduler import ReminderScheduler

    coordinator = ReminderCoordinator(hass, entry.options)
    await coordinator.async_config_entry_first_refresh()

    scheduler = ReminderScheduler(hass, coordinator)
    coordinator.set_scheduler(scheduler)
    await scheduler.async_reschedule()

    hass.data[DOMAIN]["coordinator"] = coordinator

    hass.data[DOMAIN]["services"] = await services.async_setup_services(
        hass, coordinator
    )

    unsub_bus = hass.bus.async_listen(
        NOTIFICATION_ACTION_EVENT, coordinator.async_handle_action_event
    )
    hass.data[DOMAIN]["unsub_bus"] = unsub_bus

    await _async_setup_frontend(hass)

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Tear down the config entry."""
    await hass.config_entries.async_unload_platforms(entry, PLATFORMS)

    for name in hass.data[DOMAIN].get("services", []):
        try:
            hass.services.async_remove(DOMAIN, name)
        except (ValueError, KeyError):
            pass

    if unsub_bus := hass.data[DOMAIN].pop("unsub_bus", None):
        unsub_bus()

    coordinator = hass.data[DOMAIN].get("coordinator")
    if coordinator is not None:
        await coordinator.async_shutdown()
    hass.data[DOMAIN].pop("coordinator", None)

    try:
        from homeassistant.components.frontend import async_remove_panel, remove_extra_js_url

        if card_url := hass.data[DOMAIN].pop(CARD_URL_KEY, None):
            remove_extra_js_url(hass, card_url)
        async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)
    except Exception:  # noqa: BLE001 - best effort on unload
        _LOGGER.debug("Could not remove the card/panel frontend assets")

    return True


async def _async_setup_frontend(hass: HomeAssistant) -> None:
    """Serve the bundled card and inject it into the frontend."""
    www_path = os.path.join(hass.config.path("custom_components"), DOMAIN, "www")
    if not os.path.isfile(os.path.join(www_path, CARD_FILENAME)) or not os.path.isfile(
        os.path.join(www_path, PANEL_FILENAME)
    ):
        _LOGGER.warning(
            "Card bundle %s not found; the dashboard card will not be "
            "available. Rebuild it with the card/ frontend toolchain",
            CARD_FILENAME,
        )
        return

    http = getattr(hass, "http", None)
    if http is None:
        _LOGGER.warning("HTTP is not set up; the reminder card will not be served")
        return

    try:
        from homeassistant.components.http import StaticPathConfig

        await http.async_register_static_paths(
            # (url_path, path, cache_headers) — no caching so a HACS update is
            # picked up instead of a stale bundle being served.
            [StaticPathConfig(f"/{DOMAIN}", www_path, False)]
        )
    except Exception as err:  # noqa: BLE001 - never block entry setup
        _LOGGER.error("Could not serve the reminder card at %s: %s", CARD_URL, err)
        return

    version = _integration_version(hass)
    card_url = f"{CARD_URL}?v={version}"
    panel_url = f"{PANEL_URL}?v={version}"

    try:
        from homeassistant.components.frontend import add_extra_js_url

        add_extra_js_url(hass, card_url)
        _LOGGER.debug("Serving reminder card at %s", card_url)
    except Exception as err:  # noqa: BLE001
        _LOGGER.error("Could not inject the reminder card into the frontend: %s", err)

    hass.data.setdefault(DOMAIN, {})[CARD_URL_KEY] = card_url
    await _async_setup_panel(hass, panel_url)


def _integration_version(hass: HomeAssistant) -> str:
    """Version stamp for the frontend assets (cache busting)."""
    try:
        from homeassistant.loader import async_get_loaded_integration

        return async_get_loaded_integration(hass, DOMAIN).version or "0"
    except Exception:  # noqa: BLE001 - fall back to an uncached URL
        return "0"


async def _async_setup_panel(hass: HomeAssistant, panel_url: str) -> None:
    """Add the reminders sidebar panel."""
    try:
        from homeassistant.components import panel_custom
        from homeassistant.components.frontend import async_remove_panel

        # Re-registering on reload would otherwise leave the old entry behind.
        async_remove_panel(hass, PANEL_URL_PATH, warn_if_unknown=False)

        await panel_custom.async_register_panel(
            hass,
            frontend_url_path=PANEL_URL_PATH,
            webcomponent_name=PANEL_ELEMENT,
            sidebar_title=PANEL_TITLE,
            sidebar_icon=PANEL_ICON,
            module_url=panel_url,
            embed_iframe=False,
            require_admin=False,
        )
        _LOGGER.debug("Registered reminders panel at /%s", PANEL_URL_PATH)
    except Exception as err:  # noqa: BLE001 - the card still works without it
        _LOGGER.error("Could not register the reminders panel: %s", err)
"""Sidebar panel wiring tests.

The panel is a second frontend entry (`ha-reminders-panel.js`) registered with
`panel_custom`; these tests pin the registration arguments so the sidebar entry
keeps pointing at the served module.
"""

from __future__ import annotations

import asyncio
import os
import pytest

pytest.importorskip("homeassistant")

from homeassistant.core import HomeAssistant  # noqa: E402

import custom_components.ha_reminders as integration  # noqa: E402


async def _run(tmp_path, monkeypatch):
    config_dir = str(tmp_path)
    www = os.path.join(config_dir, "custom_components", "ha_reminders", "www")
    os.makedirs(www, exist_ok=True)
    for name in (integration.CARD_FILENAME, integration.PANEL_FILENAME):
        with open(os.path.join(www, name), "w") as handle:
            handle.write("// bundle")

    hass = HomeAssistant(config_dir)
    hass.config.config_dir = config_dir

    from homeassistant.helpers import frame  # noqa: PLC0415

    if hasattr(frame, "async_setup"):
        frame.async_setup(hass)

    registered: dict[str, object] = {}

    from homeassistant.components import panel_custom  # noqa: PLC0415

    async def fake_register(hass_, **kwargs):  # noqa: ANN001
        # Deliberately async, like panel_custom.async_register_panel: a caller
        # that forgets to await it leaves `registered` empty and fails here.
        registered.update(kwargs)

    monkeypatch.setattr(panel_custom, "async_register_panel", fake_register)

    from homeassistant.components import frontend  # noqa: PLC0415

    monkeypatch.setattr(frontend, "add_extra_js_url", lambda hass_, url, es5=False: None)

    class _FakeHTTP:
        async def async_register_static_paths(self, configs):  # noqa: ANN001
            registered["static_paths"] = list(configs)

    hass.http = _FakeHTTP()
    try:
        await integration._async_setup_frontend(hass)  # noqa: SLF001
    finally:
        await hass.async_stop()
    return registered


def test_panel_registered_with_module_url(tmp_path, monkeypatch) -> None:
    registered = asyncio.run(_run(tmp_path, monkeypatch))

    assert registered["frontend_url_path"] == integration.PANEL_URL_PATH
    assert registered["webcomponent_name"] == integration.PANEL_ELEMENT
    assert str(registered["module_url"]).startswith(integration.PANEL_URL)
    assert "?v=" in str(registered["module_url"]), "assets need cache busting"
    assert registered["sidebar_title"] == integration.PANEL_TITLE
    assert registered["sidebar_icon"] == integration.PANEL_ICON
    assert registered["embed_iframe"] is False


def test_static_path_serves_both_bundles(tmp_path, monkeypatch) -> None:
    registered = asyncio.run(_run(tmp_path, monkeypatch))

    config = registered["static_paths"][0]
    assert config.url_path == f"/{integration.DOMAIN}"
    assert os.path.isfile(os.path.join(config.path, integration.PANEL_FILENAME))
    assert os.path.isfile(os.path.join(config.path, integration.CARD_FILENAME))

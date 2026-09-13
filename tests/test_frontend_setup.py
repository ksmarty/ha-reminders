"""Frontend wiring tests: the card must actually be served and injected.

Regression guard for a bug where the static-path registration used a wrong
import/call shape (and a dead fallback), so the card was never served on any
Home Assistant version.
"""

from __future__ import annotations

import asyncio
import os
from types import SimpleNamespace

import pytest

pytest.importorskip("homeassistant")

import homeassistant.components.frontend as frontend  # noqa: E402

from custom_components.ha_reminders import (  # noqa: E402
    CARD_FILENAME,
    CARD_URL,
    DOMAIN,
    _async_setup_frontend,
)


class _FakeHTTP:
    def __init__(self) -> None:
        self.configs: list = []

    async def async_register_static_paths(self, configs) -> None:  # noqa: ANN001
        self.configs.extend(configs)


def _fake_hass(config_dir: str, http: _FakeHTTP | None) -> SimpleNamespace:
    return SimpleNamespace(
        config=SimpleNamespace(path=lambda *parts: os.path.join(config_dir, *parts)),
        http=http,
    )


async def _run(tmp_path, monkeypatch, *, with_bundle: bool = True):
    config_dir = str(tmp_path)
    www = os.path.join(config_dir, "custom_components", DOMAIN, "www")
    os.makedirs(www, exist_ok=True)
    if with_bundle:
        with open(os.path.join(www, CARD_FILENAME), "w") as handle:
            handle.write("// bundle")

    injected: list[str] = []
    monkeypatch.setattr(
        frontend, "add_extra_js_url", lambda hass, url, es5=False: injected.append(url)
    )

    http = _FakeHTTP()
    await _async_setup_frontend(_fake_hass(config_dir, http))
    return www, http, injected


def test_card_is_served_and_injected(tmp_path, monkeypatch) -> None:
    www, http, injected = asyncio.run(_run(tmp_path, monkeypatch))

    assert len(http.configs) == 1, http.configs
    config = http.configs[0]
    assert config.url_path == f"/{DOMAIN}"
    assert config.path == www
    assert config.cache_headers is False  # never serve a stale bundle
    assert injected == [CARD_URL]


def test_missing_bundle_does_not_register(tmp_path, monkeypatch) -> None:
    _, http, injected = asyncio.run(_run(tmp_path, monkeypatch, with_bundle=False))

    assert http.configs == []
    assert injected == []


def test_missing_http_does_not_raise(tmp_path, monkeypatch) -> None:
    config_dir = str(tmp_path)
    www = os.path.join(config_dir, "custom_components", DOMAIN, "www")
    os.makedirs(www, exist_ok=True)
    with open(os.path.join(www, CARD_FILENAME), "w") as handle:
        handle.write("// bundle")

    injected: list[str] = []
    monkeypatch.setattr(
        frontend, "add_extra_js_url", lambda hass, url, es5=False: injected.append(url)
    )

    asyncio.run(_async_setup_frontend(_fake_hass(config_dir, None)))
    assert injected == []
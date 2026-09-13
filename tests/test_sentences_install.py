"""Tests for the Assist sentence installer.

Custom sentences can only be loaded from <config>/custom_sentences/, so the
integration ships the templates and copies them into place. These tests cover
the copy, the backup of local edits, and that the packaged copy never drifts
from the repository copy.
"""

from __future__ import annotations

import asyncio
from pathlib import Path

import pytest

pytest.importorskip("homeassistant")

from homeassistant.core import HomeAssistant  # noqa: E402
from homeassistant.exceptions import HomeAssistantError  # noqa: E402

from custom_components.ha_reminders import sentences  # noqa: E402

REPO_ROOT_COPY = (
    Path(__file__).resolve().parents[1] / "custom_sentences" / "en" / "reminders.yaml"
)


def test_packaged_sentences_exist() -> None:
    assert sentences.packaged_path("en").is_file()


def test_packaged_copy_matches_repository_copy() -> None:
    """The shipped copy and the browsable repo copy must not drift."""
    packaged = sentences.packaged_path("en").read_text(encoding="utf-8")
    assert packaged == REPO_ROOT_COPY.read_text(encoding="utf-8")


async def _install(tmp_path, *, pre_existing: str | None = None):
    config_dir = str(tmp_path)
    hass = HomeAssistant(config_dir)
    hass.config.config_dir = config_dir

    target = Path(config_dir, "custom_sentences", "en", "reminders.yaml")
    if pre_existing is not None:
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(pre_existing, encoding="utf-8")

    try:
        result = await sentences.async_install_sentences(hass, "en")
    finally:
        await hass.async_stop()
    return result, target


def test_installs_into_config_directory(tmp_path) -> None:
    result, target = asyncio.run(_install(tmp_path))

    assert result["updated"] is True
    assert result["reloaded"] is False  # no conversation component in the harness
    assert Path(result["path"]) == target
    assert target.read_text(encoding="utf-8") == sentences.packaged_path("en").read_text(
        encoding="utf-8"
    )


def test_identical_file_is_left_alone(tmp_path) -> None:
    existing = sentences.packaged_path("en").read_text(encoding="utf-8")
    result, target = asyncio.run(_install(tmp_path, pre_existing=existing))

    assert result["updated"] is False
    assert result["backup"] is None
    assert not target.with_name("reminders.yaml.bak").exists()


def test_local_edits_are_backed_up(tmp_path) -> None:
    result, target = asyncio.run(_install(tmp_path, pre_existing="# my own sentences\n"))

    assert result["updated"] is True
    backup = target.with_name("reminders.yaml.bak")
    assert result["backup"] == str(backup)
    assert backup.read_text(encoding="utf-8") == "# my own sentences\n"
    assert "ReminderCreate" in target.read_text(encoding="utf-8")


async def _install_missing_language(tmp_path) -> None:
    config_dir = str(tmp_path)
    hass = HomeAssistant(config_dir)
    hass.config.config_dir = config_dir
    try:
        with pytest.raises(HomeAssistantError, match="No packaged reminder sentences"):
            await sentences.async_install_sentences(hass, "xx")
    finally:
        await hass.async_stop()


def test_missing_language_reports_error(tmp_path) -> None:
    asyncio.run(_install_missing_language(tmp_path))
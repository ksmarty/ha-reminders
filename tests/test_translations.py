"""Guard the integration translation files against unescaped ICU placeholders.

Home Assistant's frontend compiles every translation value with formatjs, so a
bare `{time}` in a value raises MISSING_VALUE at render time (seen on the
config/options flow labels). ICU single-quote escaping (`'{time}'`) must be
used instead.

The `$` prefix is our snooze-text token delimiter and is not itself a formatjs
construct — the danger is only the unquoted `{...}` part.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

import pytest

_UNESCAPED_BRACE = re.compile(r"(?<!')\{(?!'|\{)")


def _walk_strings(node, path: str, violations: list[str]) -> None:
    if isinstance(node, dict):
        for key, value in node.items():
            _walk_strings(value, f"{path}.{key}", violations)
    elif isinstance(node, list):
        for index, value in enumerate(node):
            _walk_strings(value, f"{path}[{index}]", violations)
    elif isinstance(node, str) and _UNESCAPED_BRACE.search(node):
        violations.append(f"{path}: {node!r}")


@pytest.mark.parametrize(
    "filename",
    ["strings.json", "translations/en.json"],
)
def test_no_unescaped_icu_placeholders(filename: str) -> None:
    root = Path(__file__).resolve().parents[1] / "custom_components" / "ha_reminders"
    data = json.loads((root / filename).read_text())
    violations: list[str] = []
    _walk_strings(data, filename, violations)
    assert not violations, (
        "Found unescaped ICU placeholders (will crash the frontend with "
        "formatjs MISSING_VALUE); wrap literal braces in single quotes:\n"
        + "\n".join(violations)
    )


def test_snooze_text_label_is_escaped() -> None:
    """The known-vulnerable label must keep its ICU quoting."""
    root = Path(__file__).resolve().parents[1] / "custom_components" / "ha_reminders"
    data = json.loads((root / "strings.json").read_text())
    label = data["config"]["step"]["user"]["data"]["default_snooze_text"]
    assert label == "Snooze action text ($'{time}' is replaced)"
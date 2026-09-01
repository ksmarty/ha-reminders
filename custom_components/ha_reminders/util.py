"""Pure helper functions for HA Reminders.

Everything in this module is stdlib-only so it can be unit tested without a
Home Assistant runtime.
"""

from __future__ import annotations

import re
from datetime import datetime, time as dtime
from typing import Any

_SLUG_RE = re.compile(r"[^a-z0-9]+")

# 12 hour clock, e.g. "8pm", "8 pm", "8:30pm", "08:30 PM"
_ABS_TIME_12H = re.compile(
    r"^(?P<hour>\d{1,2})(?::(?P<minute>\d{2}))?\s*(?P<ampm>am|pm)$",
    re.IGNORECASE,
)
# 24 hour clock, e.g. "20:00", "8:00"
_ABS_TIME_24H = re.compile(r"^(?P<hour>\d{1,2}):(?P<minute>\d{2})$")

_NUMBER_WORDS = {
    "zero": 0,
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "six": 6,
    "seven": 7,
    "eight": 8,
    "nine": 9,
    "ten": 10,
    "eleven": 11,
    "twelve": 12,
    "thirteen": 13,
    "fourteen": 14,
    "fifteen": 15,
    "sixteen": 16,
    "seventeen": 17,
    "eighteen": 18,
    "nineteen": 19,
    "twenty": 20,
}

_ORDINAL_WORDS = {
    "first": 1,
    "second": 2,
    "third": 3,
    "fourth": 4,
    "fifth": 5,
    "sixth": 6,
    "seventh": 7,
    "eighth": 8,
    "ninth": 9,
    "tenth": 10,
}


def slugify(value: str) -> str:
    """Lowercase ASCII slug suitable for building entity ids."""
    slug = _SLUG_RE.sub("_", str(value).lower()).strip("_")
    return slug or "reminder"


def format_delay(minutes: int) -> str:
    """Format a delay in minutes as `5m`, `1h` or `1h30m` (blueprint parity)."""
    minutes = max(int(minutes), 0)
    hours, remaining = divmod(minutes, 60)
    if hours and remaining:
        return f"{hours}h{remaining}m"
    if hours:
        return f"{hours}h"
    return f"{remaining}m"


def parse_time_text(value: str) -> dtime | None:
    """Parse a free-form time string (`8pm`, `8:30 am`, `20:00`) into a time.

    Returns None when the string cannot be parsed.
    """
    text = str(value or "").strip()
    if not text:
        return None

    if match := _ABS_TIME_12H.match(text):
        hour = int(match.group("hour"))
        minute = int(match.group("minute") or 0)
        ampm = match.group("ampm").lower()
        if hour < 1 or hour > 12 or minute > 59:
            return None
        if ampm == "pm" and hour != 12:
            hour += 12
        elif ampm == "am" and hour == 12:
            hour = 0
        return dtime(hour, minute)

    if match := _ABS_TIME_24H.match(text):
        hour = int(match.group("hour"))
        minute = int(match.group("minute"))
        if hour > 23 or minute > 59:
            return None
        return dtime(hour, minute)

    return None


def parse_spoken_number(value: str) -> int | None:
    """Parse a spoken or numeric value (`two`, `second`, `3`) into an int."""
    text = str(value or "").strip().lower()
    if not text:
        return None
    if text.isdigit():
        return int(text)
    if text in _NUMBER_WORDS:
        return _NUMBER_WORDS[text]
    if text in _ORDINAL_WORDS:
        return _ORDINAL_WORDS[text]
    return None


def normalize_word(value: str) -> str:
    """Normalize text for fuzzy comparisons (casefold, trim, collapse spaces)."""
    return " ".join(str(value).casefold().replace("_", " ").split())


def coerce_bool(value: Any) -> bool:
    """Tolerant boolean coercion used when loading persisted records."""
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return bool(value)
    if isinstance(value, str):
        return value.strip().lower() in {"true", "on", "yes", "1"}
    return False


def as_list(value: Any, cast: type = str) -> list:
    """Coerce a value (list, tuple, set, comma string, single item) to a list."""
    if value is None:
        return []
    if isinstance(value, str):
        parts = [part.strip() for part in value.split(",") if part.strip()]
        return [cast(part) for part in parts]
    if isinstance(value, (list, tuple, set)):
        return [cast(item) for item in value]
    return [cast(value)]


def local_now() -> datetime:
    """Local wall-clock time as a naive datetime.

    Imported locally so this module stays stdlib-only (used from test code
    without Home Assistant); callers that already have `dt_util` should pass
    their own value instead.
    """
    from homeassistant.util import dt as dt_util  # noqa: PLC0415

    return dt_util.now().replace(tzinfo=None)
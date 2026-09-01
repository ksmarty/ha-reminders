"""Unit tests for the pure helper functions."""

from __future__ import annotations

from datetime import time as dtime

import pytest

from custom_components.ha_reminders.util import (
    normalize_word,
    parse_spoken_number,
    parse_time_text,
    slugify,
)


class TestSlugify:
    @pytest.mark.parametrize(
        ("value", "expected"),
        [
            ("Take out the trash", "take_out_the_trash"),
            ("   Wüter  & Sons  ", "w_ter_sons"),
            ("", "reminder"),
            ("A", "a"),
        ],
    )
    def test_slug(self, value, expected):
        assert slugify(value) == expected


class TestParseTime:
    @pytest.mark.parametrize(
        ("text", "expected"),
        [
            ("8pm", dtime(20, 0)),
            ("8 pm", dtime(20, 0)),
            ("8:30pm", dtime(20, 30)),
            ("08:30 PM", dtime(20, 30)),
            ("12am", dtime(0, 0)),
            ("12pm", dtime(12, 0)),
            ("20:00", dtime(20, 0)),
            ("8:00", dtime(8, 0)),
            ("  9 am  ", dtime(9, 0)),
        ],
    )
    def test_valid(self, text, expected):
        assert parse_time_text(text) == expected

    @pytest.mark.parametrize(
        "text",
        ["", "banana", "25:00", "8:75pm", "now", "tomorrow", "in 10 minutes"],
    )
    def test_invalid(self, text):
        assert parse_time_text(text) is None


class TestParseSpokenNumber:
    @pytest.mark.parametrize(
        ("text", "expected"),
        [
            ("2", 2),
            ("two", 2),
            ("second", 2),
            ("first", 1),
            ("fifteen", 15),
            ("twenty", 20),
            ("42", 42),
        ],
    )
    def test_valid(self, text, expected):
        assert parse_spoken_number(text) == expected

    @pytest.mark.parametrize("text", ["", "banana", "forty-two", "-3"])
    def test_invalid(self, text):
        assert parse_spoken_number(text) is None


class TestNormalizeWord:
    def test_casefold_and_spaces(self):
        assert normalize_word("  The   Office_Zone ") == "the office zone"

    def test_empty(self):
        assert normalize_word("") == ""
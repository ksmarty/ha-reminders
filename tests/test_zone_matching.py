"""Regression tests for zone state matching.

Home Assistant reports the zone a person/tracker is in as the zone's *name*
(`home` for `zone.home`, the friendly name for other zones), not its entity
id. Matching only the entity id silently broke zone reminders entirely.
"""

from __future__ import annotations

import pytest

from custom_components.ha_reminders.scheduler import zone_state_is_in


class TestHomeZone:
    @pytest.mark.parametrize("value", ["home", "Home", " home ", "zone.home"])
    def test_matches(self, value):
        assert zone_state_is_in(value, "zone.home", "Home")

    @pytest.mark.parametrize(
        "value", ["not_home", "work", "unknown", "unavailable", "", None]
    )
    def test_does_not_match(self, value):
        assert not zone_state_is_in(value, "zone.home", "Home")


class TestNamedZone:
    @pytest.mark.parametrize(
        "value",
        ["Work", "work", "work zone", "zone.work", "work_zone"],
    )
    def test_matches(self, value):
        if value == "work_zone":
            assert zone_state_is_in(value, "zone.work_zone", "Work Zone")
        else:
            assert zone_state_is_in(value, "zone.work", "Work Zone")

    @pytest.mark.parametrize("value", ["not_home", "home", "gym", "unknown"])
    def test_does_not_match(self, value):
        assert not zone_state_is_in(value, "zone.work", "Work Zone")

    def test_object_id_without_friendly_name(self):
        """A zone without a friendly name reports its object id."""
        assert zone_state_is_in("mom_s_house", "zone.mom_s_house", None)
        assert zone_state_is_in("mom s house", "zone.mom_s_house", None)

    def test_no_false_positive_from_shared_words(self):
        """A different zone's name must not match just because words overlap."""
        assert not zone_state_is_in("home", "zone.work_from_home", "Work From Home")
        assert zone_state_is_in(
            "work from home", "zone.work_from_home", "Work From Home"
        )
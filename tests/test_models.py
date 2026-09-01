"""Unit tests for the Reminder model (no Home Assistant runtime needed)."""

from __future__ import annotations

from datetime import date, datetime, time as dtime, timedelta

import pytest

from custom_components.ha_reminders.models import Reminder, compute_status
from custom_components.ha_reminders.util import format_delay


def make_reminder(**overrides) -> Reminder:
    payload = {
        "id": "abc123",
        "title": "Take out the trash",
        "message": "Don't forget the bins!",
        "notify_service": "mobile_app_pixel",
        "trigger_type": "time",
        "time": "08:00",
        "every_x_days": 1,
    }
    payload.update(overrides)
    return Reminder.from_dict(payload)


class TestSerialization:
    def test_roundtrip(self):
        reminder = make_reminder(
            start_date="2026-09-01",
            stop_date="2026-12-31",
            subtitle="Trash day",
            exclude_days_of_week=[0, 6],
            snooze_delays=[5, 15, 30],
            color="#ff0000",
        )
        restored = Reminder.from_dict(reminder.to_dict())
        assert restored == reminder

    def test_defaults_applied(self):
        reminder = make_reminder()
        assert reminder.user_name == "Someone"
        assert reminder.snooze_delays == [5, 15, 30, 45, 60]
        assert reminder.snooze_text == "Snooze for ${time}"
        assert reminder.acknowledge_action_title == "Mark as done"
        assert reminder.wait_time_if_no_action == 15
        assert reminder.notification_count == 100
        assert reminder.enabled is True
        assert reminder.one_shot is False

    def test_tolerant_coercion(self):
        reminder = make_reminder(
            every_x_days="2",
            exclude_days_of_week="0,6",
            snooze_delays="10,20",
            enabled="true",
            person_entity_ids="person.a, person.b",
            start_date=date(2026, 9, 1),
            time=dtime(7, 30),
        )
        assert reminder.every_x_days == 2
        assert reminder.exclude_days_of_week == [0, 6]
        assert reminder.snooze_delays == [10, 20]
        assert reminder.enabled is True
        assert reminder.person_entity_ids == ["person.a", "person.b"]
        assert reminder.start_date == date(2026, 9, 1)
        assert reminder.time == dtime(7, 30)

    def test_unknown_trigger_type_rejected(self):
        with pytest.raises(ValueError, match="trigger_type"):
            make_reminder(trigger_type="moon_phase")

    def test_invalid_weekday_rejected(self):
        with pytest.raises(ValueError, match="weekday"):
            make_reminder(exclude_days_of_week=[7])


class TestValidation:
    def test_title_required(self):
        with pytest.raises(ValueError, match="title"):
            make_reminder(title="")

    def test_message_required(self):
        with pytest.raises(ValueError, match="message"):
            make_reminder(message="")

    def test_notify_service_required(self):
        with pytest.raises(ValueError, match="notify_service"):
            make_reminder(notify_service="")

    def test_time_reminder_requires_time(self):
        with pytest.raises(ValueError, match="time is required"):
            make_reminder(time=None)

    def test_zone_reminder_requires_zone(self):
        with pytest.raises(ValueError, match="zone_entity_id"):
            make_reminder(trigger_type="zone_enter", zone_entity_id="")

    def test_zone_reminder_requires_persons(self):
        with pytest.raises(ValueError, match="person_entity_ids"):
            make_reminder(
                trigger_type="zone_leave",
                zone_entity_id="zone.work",
                person_entity_ids=[],
            )

    def test_every_x_days_minimum(self):
        with pytest.raises(ValueError, match="every_x_days"):
            make_reminder(every_x_days=0)

    def test_snooze_delays_empty_rejected(self):
        with pytest.raises(ValueError, match="snooze_delays"):
            make_reminder(snooze_delays=[])

    def test_stop_before_start_rejected(self):
        with pytest.raises(ValueError, match="stop_date"):
            make_reminder(start_date="2026-09-10", stop_date="2026-09-01")

    def test_time_window_ordering(self):
        with pytest.raises(ValueError, match="time_window_end"):
            make_reminder(
                trigger_type="zone_enter",
                zone_entity_id="zone.home",
                person_entity_ids=["person.me"],
                time_window_start="18:00",
                time_window_end="09:00",
            )


class TestNextOccurrence:
    NOW = datetime(2026, 9, 1, 10, 0)  # Tuesday

    def test_later_today(self):
        reminder = make_reminder(time="12:00", start_date="2026-09-01")
        assert reminder.next_occurrence(self.NOW) == datetime(2026, 9, 1, 12, 0)

    def test_time_passed_moves_to_next_occurrence(self):
        reminder = make_reminder(time="08:00", start_date="2026-09-01")
        assert reminder.next_occurrence(self.NOW) == datetime(2026, 9, 2, 8, 0)

    def test_every_three_days(self):
        reminder = make_reminder(
            time="08:00", start_date="2026-09-01", every_x_days=3
        )
        # Occurrences: 09-01, 09-04, 09-07 ... next after 09-01 10:00 -> 09-04
        assert reminder.next_occurrence(self.NOW) == datetime(2026, 9, 4, 8, 0)

    def test_excluded_weekday_skipped(self):
        reminder = make_reminder(
            time="08:00", start_date="2026-09-02", exclude_days_of_week=[2]
        )  # 09-02 is a Wednesday, excluded
        assert reminder.next_occurrence(
            datetime(2026, 9, 1, 10, 0)
        ) == datetime(2026, 9, 3, 8, 0)

    def test_stop_date_respected(self):
        reminder = make_reminder(
            time="08:00", start_date="2026-09-01", stop_date="2026-09-01"
        )
        assert reminder.next_occurrence(self.NOW) is None

    def test_start_date_in_future(self):
        reminder = make_reminder(
            time="08:00", start_date="2026-09-05"
        )  # Saturday
        assert reminder.next_occurrence(self.NOW) == datetime(2026, 9, 5, 8, 0)

    def test_one_shot_fired_no_recurrence(self):
        reminder = make_reminder(
            time="12:00", start_date="2026-09-01", one_shot=True
        )
        assert reminder.next_occurrence(self.NOW) == datetime(2026, 9, 1, 12, 0)
        assert (
            reminder.next_occurrence(self.NOW, one_shot_fired=True) is None
        )

    def test_non_time_trigger_returns_none(self):
        zone = make_reminder(
            trigger_type="zone_enter",
            zone_entity_id="zone.home",
            person_entity_ids=["person.me"],
            time="08:00",
        )
        assert zone.next_occurrence(self.NOW) is None


class TestZoneGate:
    NOW = datetime(2026, 9, 1, 10, 0)  # Tuesday

    def _zone(self, **overrides) -> Reminder:
        return make_reminder(
            trigger_type="zone_enter",
            zone_entity_id="zone.home",
            person_entity_ids=["person.me"],
            **overrides,
        )

    def test_within_window(self):
        reminder = self._zone(
            start_date="2026-09-01",
            stop_date="2026-09-30",
            time_window_start="09:00",
            time_window_end="17:00",
        )
        assert reminder.zone_gate(self.NOW)

    def test_outside_dates(self):
        reminder = self._zone(start_date="2026-10-01")
        assert not reminder.zone_gate(self.NOW)

    def test_outside_time_window(self):
        reminder = self._zone(time_window_start="12:00", time_window_end="18:00")
        assert not reminder.zone_gate(self.NOW)

    def test_excluded_weekday(self):
        reminder = self._zone(exclude_days_of_week=[1])  # Tuesday
        assert not reminder.zone_gate(self.NOW)


class TestComputeStatus:
    NOW = datetime(2026, 9, 1, 10, 0)

    def _time(self, **overrides) -> Reminder:
        base = {"time": "12:00", "start_date": "2026-09-01"}
        base.update(overrides)
        return make_reminder(**base)

    def test_disabled(self):
        reminder = self._time(enabled=False)
        assert compute_status(reminder, {}, self.NOW) == "disabled"

    def test_completed(self):
        reminder = self._time()
        assert (
            compute_status(reminder, {"completed": True}, self.NOW)
            == "completed"
        )

    def test_snoozed(self):
        reminder = self._time()
        runtime = {"snooze_until": self.NOW + timedelta(minutes=15)}
        assert compute_status(reminder, runtime, self.NOW) == "snoozed"

    def test_active(self):
        reminder = self._time()
        assert compute_status(reminder, {"cycle_active": True}, self.NOW) == "active"

    def test_scheduled(self):
        reminder = self._time()
        assert compute_status(reminder, {}, self.NOW) == "scheduled"

    def test_exhausted_is_completed(self):
        reminder = self._time(start_date="2026-08-01", stop_date="2026-08-31")
        assert compute_status(reminder, {}, self.NOW) == "completed"


class TestFormatDelay:
    @pytest.mark.parametrize(
        ("minutes", "expected"),
        [
            (5, "5m"),
            (60, "1h"),
            (90, "1h30m"),
            (65, "1h5m"),
            (0, "0m"),
            (1440, "24h"),
        ],
    )
    def test_formatting(self, minutes, expected):
        assert format_delay(minutes) == expected
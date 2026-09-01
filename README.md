# HA Reminders

Actionable, snoozable reminders for Home Assistant — now as a single HACS
**integration** with three ways to create and manage reminders:

- ⏰ **Scheduled reminders** — recurring (or one-shot) at a fixed time
- 📍 **Location-based reminders** — fire when you enter or leave a zone
- 🗣️ **Voice assistant support** — create, list, delete, snooze and complete
  reminders with Assistant
- 🎛️ **Dashboard card** — view, edit, snooze, complete and delete reminders
  from Lovelace

This is the successor to the included legacy
[`actionnable-task-reminder.yaml`](actionnable-task-reminder.yaml) blueprint:
it keeps the exact same notification behavior (acknowledge + snooze buttons,
notification groups, resend loop) but the integration owns the reminder store
and scheduler — no generated automations, and reminders are first-class
entities you can see and edit.

> **Credits:** the notification behavior is ported from the original
> ["Actionnable Task Reminder" blueprint](https://gist.github.com/sisimomo/107659d44c827a8680b1edbadd4c965b)
> by [@sisimomo](https://github.com/sisimomo), which is kept in this
> repository (unchanged) for reference.

> **Minimum requirements:** Home Assistant **2024.6+**, HACS 2.x.

---

## Installation

1. Add this repository to HACS:
   **HACS → ⋮ → Custom repositories** →
   `https://github.com/ksmarty/ha-reminders` →
   category **Integration**.
2. Install **HA Reminders** from HACS and restart Home Assistant.
3. Go to **Settings → Devices & Services → Add Integration → HA Reminders**
   and configure the global defaults (all overridable per reminder).

### 1. Enable the voice sentences (one-time)

Custom sentence templates cannot be shipped by an integration — the default
agent only loads them from your config directory. Copy them once:

```bash
HA_CONFIG=/path/to/your/config ./scripts/install_custom_sentences.sh
```

or manually: copy `custom_sentences/en/reminders.yaml` from this repository to
`<config>/custom_sentences/en/reminders.yaml`, then reload Assist (or restart
HA).

### 2. Add the dashboard card

1. Create a reminder first (otherwise the card shows an empty state).
2. Edit your dashboard → **Add card** → search **"HA Reminders"**
   (`type: custom:ha-reminders-card`).

The card is served by the integration itself — no manual
`/ha_reminders/ha-reminders.js` resource URL needed.

---

## Creating reminders

### Services (`ha_reminders.*`)

| Service | Description |
| --- | --- |
| `ha_reminders.create` | Create a reminder. Required: `title`, `message`. Returns `reminder_id`. |
| `ha_reminders.update` | Update a reminder (`reminder_id` + partial payload; listed fields replace the whole value). |
| `ha_reminders.delete` | Delete a reminder (`reminder_id`). |
| `ha_reminders.list` | List all reminders with runtime status (no arguments). |
| `ha_reminders.snooze` | Snooze a reminder (`reminder_id`, `minutes`). |
| `ha_reminders.complete` | Acknowledge a reminder: runs its acknowledge actions and notifies the rest of the group (`reminder_id`, optional `user_name`). |
| `ha_reminders.set_enabled` | Enable/disable a reminder (`reminder_id`, `enabled`). |

Full payload for `create`/`update`:

```yaml
service: ha_reminders.create
data:
  title: Take out the trash
  message: The bins go out tonight!
  notify_service: mobile_app_pixel_8
  user_name: Kyle
  trigger_type: time          # time | zone_enter | zone_leave
  # time trigger
  time: "20:00"               # HH:MM
  every_x_days: 1
  start_date: "2026-09-01"    # optional
  stop_date: "2026-12-31"     # optional
  exclude_days_of_week: [0, 6]  # Mon=0 ... Sun=6
  # zone trigger (when trigger_type is zone_enter / zone_leave)
  zone_entity_id: zone.home
  person_entity_ids: [person.kyle]
  time_window_start: "09:00"  # optional gate
  time_window_end: "17:00"
  # notification behavior
  acknowledge_action_title: Mark as done
  acknowledge_actions:        # optional service calls on acknowledge
    - service: script.trash_reminder_acknowledged
      data:
        who: kyle
  snooze_delays: [5, 15, 30, 45, 60]
  snooze_text: "Snooze for ${time}"
  wait_time_if_no_action: 15  # resend delay in minutes
  notification_count: 100     # max repeats when ignored
  notification_group: ""      # shared group: ack stops it everywhere
  one_shot: false             # fire exactly once
```

Example automation — a one-shot zone reminder:

```yaml
alias: Remind me when I get home
triggers:
  - trigger: state
    entity_id: person.kyle
    to: zone.home
actions:
  - service: ha_reminders.create
    data:
      title: Unpack the groceries
      message: Put the cold stuff away first!
      notify_service: mobile_app_pixel_8
      trigger_type: zone_enter
      zone_entity_id: zone.home
      person_entity_ids: [person.kyle]
      one_shot: true
```

> Note for `user_name` and `notify_service`: `user_name` appears in the
> notification group completion message; `notify_service` accepts the blueprint
> convention (`mobile_app_pixel_8`) or an explicit `notify.*` reference.

### Notification behavior (blueprint parity)

- One notification per reminder: the tag `taskReminder╡<id>` replaces earlier
  ones of the same reminder.
- Action buttons: **acknowledge** plus one **snooze** per `snooze_delays`
  entry. Snooze titles format delays as `5m`, `1h`, `1h30m`.
- Ignored notifications are resent after `wait_time_if_no_action` minutes, up
  to `notification_count` times.
- Notification groups: when anyone acknowledges, every other reminder with the
  same `notification_group` stops and its devices receive a
  "someone acknowledged" notification.
- Action strings keep the blueprint encoding (`taskReminder╡<id>╡<group>╡<minutes>╡<user>`),
  so existing automations that react to these actions keep working.

### Voice examples

Once the custom sentences are installed, say:

| You say | Result |
| --- | --- |
| "remind me to take out the trash at 8 pm" | daily reminder at 20:00 |
| "remind me to stretch in 30 minutes" | one-shot reminder in 30 min |
| "remind me to buy milk when I get home" | `zone_enter` reminder on `zone.home` |
| "remind me to feed the cat when I leave work" | `zone_leave` reminder on `zone.work` |
| "list my reminders" | reads back the pending reminders |
| "complete reminder take out the trash" | acknowledges the reminder |
| "snooze reminder take out the trash for 30 minutes" | snoozes it |
| "delete reminder number 2" | deletes the second pending reminder |

Zone reminders created by voice watch the person entities configured under
**Integration options → "Person entities used by zone reminders created via
voice"** (default: all `person.*` entities).

## Entities

Every reminder is exposed as a sensor:

- `sensor.ha_reminder_<slug>_<id>` — state is the runtime status
  (`scheduled` / `active` / `snoozed` / `completed` / `disabled`); attributes
  carry the full reminder payload plus `status`, `next_fire`, `snooze_until`
  and `notified_count`.

Useful for automations, e.g. a badge for active reminders:

```yaml
trigger:
  - trigger: time_pattern
    minutes: "/5"
condition:
  - condition: template
    value_template: >-
      {{ states.sensor
         | selectattr('entity_id', 'match', '^sensor\\.ha_reminder_')
         | map(attribute='state')
         | select('eq', 'active')
         | list | length > 0 }}
```

## Development

```bash
./scripts/dev_setup.sh          # venv + pytest + card dependencies
.venv/bin/pytest                # pure-Python unit tests (no HA runtime needed)
cd card
npm run lint                    # eslint
npm run build                   # writes custom_components/ha_reminders/www/ha-reminders.js
```

The built bundle is committed; CI (`build-card.yaml`) fails if it drifts from
`card/src`.

## Troubleshooting

- **Voice sentences don't respond** — make sure the file landed at
  `<config>/custom_sentences/en/reminders.yaml` and that Assist was reloaded.
- **Card not in the card picker** — check the Home Assistant log for the
  "Card bundle not found" warning (the `www/ha-reminders.js` bundle is
  missing/mismatched with the integration) and rebuild from `card/`.
- **Reminders not firing** — confirm the zone/person entities exist for zone
  reminders and that `notify_service` matches a working notify service.

## License

Apache-2.0 · see [LICENSE](LICENSE). This project is not affiliated with
Home Assistant or HACS.
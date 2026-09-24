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

### 1. Enable the voice sentences

Home Assistant only loads custom sentences from
`<config>/custom_sentences/<language>/`, so run the installer once — from
**Developer Tools → Actions**:

```yaml
action: ha_reminders.install_sentences
```

It copies the templates into your config directory and reloads the
conversation agent, so voice commands work immediately (no restart). Local
edits are kept as `reminders.yaml.bak`. Re-run it after an update to pick up
new phrasings.

<details>
<summary>Manual alternative</summary>

```bash
HA_CONFIG=/path/to/your/config ./scripts/install_custom_sentences.sh
```

or copy `custom_sentences/en/reminders.yaml` from this repository to
`<config>/custom_sentences/en/reminders.yaml` and restart Home Assistant.
</details>

### 2. Use the sidebar panel or the dashboard card

**Sidebar panel** — nothing to configure. After setup a **Reminders** entry
appears in the sidebar with the full reminder list: create, edit, snooze,
complete, enable/disable and delete from one page. The page keeps its header
in place and scrolls only the reminders, split into three sections: **Time**
(soonest first) and **Location** (in the order they were added), both open,
and **Completed** at the bottom, closed, most recently completed first. Empty
sections are left out.

**Dashboard card** — on any dashboard: **Add card** → search **"HA Reminders"**
(`type: custom:ha-reminders-card`). Both surfaces are served by the
integration itself, so there is no manual resource URL to add.

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
| `ha_reminders.install_sentences` | Copy the Assist sentence templates into `<config>/custom_sentences/` and reload Assist (`language`, default `en`). |

Full payload for `create`/`update`:

```yaml
service: ha_reminders.create
data:
  title: Take out the trash
  message: The bins go out tonight!
  notify_service: notify.mobile_app_pixel_8
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
      notify_service: notify.mobile_app_pixel_8
      trigger_type: zone_enter
      zone_entity_id: zone.home
      person_entity_ids: [person.kyle]
      one_shot: true
```

> ⚠️ **Never use the generic `notify` service** (`notify_service: notify`). It
> is not tied to a device: with no target it broadcasts to **every** notify
> target, so one reminder notifies the whole household. Always target a device,
> e.g. `notify.mobile_app_pixel_8`.
>
> **`notify_service`** — use the service id exactly as Home Assistant lists it
> under **Developer Tools → Actions**, e.g. `notify.mobile_app_pixel_8`. A bare
> device name (`mobile_app_pixel_8`) is also accepted and resolved against the
> `notify` domain, as is the legacy blueprint form where the device was its own
> domain. The dropdowns in the card editor and integration options offer the
> correct values.
>
> **`user_name`** is who the reminder is for — it is embedded in the
> notification action strings and shown in the message the rest of a
> notification group receives when someone acknowledges
> (e.g. `Kyle acknowledged: Take out the trash`).

### LLM-based assistants

Conversational agents that run on an LLM (the OpenAI/Anthropic integrations, or
any custom agent such as an OpenRouter preset) don't match sentences — they
call **tools**. The integration exposes its reminder intents as tools, so those
agents can manage reminders directly:

| Tool | Purpose |
| --- | --- |
| `ha_reminders__ReminderCreate` | create one (zone + direction for location, minutes for relative, time for daily) |
| `ha_reminders__ReminderList` | read them back |
| `ha_reminders__ReminderComplete` | mark one done |
| `ha_reminders__ReminderSnooze` | snooze a notification |
| `ha_reminders__ReminderDelete` | delete one |

Nothing to configure — the tools are offered to whichever agent you talk to, so
"remind me to take out the trash when I get home" works through an LLM agent
too.

### Global defaults (config entry)

The **Settings → Devices & Services → HA Reminders** entry holds defaults
applied to every new reminder; anything you leave unset falls back to them,
and every value can still be overridden per reminder:

- **Default notification service** — dropdown of all installed `notify`
  services (`mobile_app_*`, `notify` groups, …). `No default` means each
  reminder must pick its own service.
- **Default user name** — who reminders are for by default (shown in
  notification-group acknowledgement messages).
- **Default snooze delays / resend delay / max repeats / snooze text /
  acknowledge action title** — notification behavior defaults.
- **Default notification icon** — shown on every reminder notification.
  Either a Material Design Icon slug or an image URL (public, or a relative
  path such as `/local/reminder.png`); it ships as `mdi:bell-ring`. Reminders
  can override it individually, and clearing the option turns the icon off.
  Because it is resolved when the notification is sent, changing it restyles
  reminders that already exist.
- **Persons watched by voice-created zone reminders** — when you create a
  zone reminder via Assist ("remind me to … when I leave work"), the persons
  to watch; empty falls back to all `person.*` entities.

### Notification behavior (blueprint parity)

- One notification per reminder: the tag `taskReminder╡<id>` replaces earlier
  ones of the same reminder.
- **Custom notification icon**: the integration default icon (see above), or
  the reminder's own `icon`. An `mdi:` value sets the status-bar/sender icon
  (`notification_icon`), anything else is passed as `icon_url`.
- Action buttons: **acknowledge** plus one **snooze** per `snooze_delays`
  entry. Snooze titles format delays as `5m`, `1h`, `1h30m`.
- **Ignored notifications are not repeated by default** — a reminder notifies
  once. Set `notification_count` above 1 to nag, with
  `wait_time_if_no_action` minutes between repeats.
- **Location reminders repeat on every arrival** until they are acknowledged;
  once marked done they stay done. To use one again, re-enable it (toggle) or
  edit it — both re-arm it. Time reminders recur on their schedule.
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
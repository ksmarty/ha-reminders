---
name: HA Reminders
description: Working conventions for the HA Reminders repo (HACS integration + Lovelace card + voice intents)
---

# AGENTS.md

Instructions for agents working in this repository. These are conventions the
maintainer established through working sessions — follow them unless the task
explicitly overrides them.

## What this repo is

- **`custom_components/ha_reminders/`** — the HACS integration: reminder store,
  coordinator, scheduler (time + zone triggers), notification lifecycle,
  service definitions, Assist intents, config/options flow, sensor platform,
  diagnostics.
- **`card/`** — Lovelace card frontend (TypeScript + Vite + Lit). Build output
  is committed at `custom_components/ha_reminders/www/ha-reminders.js` and
  served/injected by the integration.
- **`custom_sentences/en/reminders.yaml`** — Assist sentence templates users
  copy into their HA config (HACS cannot install these).
- **`actionnable-task-reminder.yaml`** — the legacy blueprint, kept **verbatim**
  for reference (credit header only, never edit its behavior).

## Operating principles

1. **Verify, don't guess.** When a failure report is ambiguous, reproduce it
   locally before proposing a fix: install `homeassistant` in a venv, run the
   real code path (config flow, coordinator, serializer), and inspect HA's
   source for the exact mechanism. We have the tools — read them.
2. **Root-cause discipline.** Find the underlying reason (often a single
   wrong assumption) and state it with evidence. Don't ship a workaround that
   papers over it.
3. **Fix + regression test in one commit.** Every bug fix ships with a test
   that fails before the fix. Bugs that previously escaped were ones with no
   test coverage — never repeat that.
4. **Minimal diffs.** Change only what the task needs. No opportunistic
   refactors, no reformatting, no renamed conventions.
5. **Honest verification reporting.** Say plainly what was tested locally and
   what needs the user's HA instance (no HA runtime here to exercise
   end-to-end notification/Assist behavior). Never present an unverified
   change as done.
6. **Git discipline.** No `git commit`/`push`/tag/release without explicit
   user approval. Ask, then act once confirmed. The user decides when to
   release ("don't cut a release, just fix it" means push to `main` only).
7. **Surface plan deviations.** When a plan or spec is silently extended (a
   new field, a reworked API), call it out explicitly in the reply.

## Boundaries

### Always

- Run the full local verification before pushing (see Commands).
- After every fix, check whether comments/docstrings now describe old
  behavior and update them.
- When a coordinator/service/etc. change affects the sensor attributes or
  service payloads, keep `card/src` and `services.yaml` consistent with it.
- Rebuild the card bundle when `card/src` changes and commit the output.

### Ask first

- Any git mutation: init, add/commit, push, tag, `gh release create`.
- GitHub-side metadata changes (`gh repo edit`, topics, description).
- Releasing / version bumps — the user times these.

### Never

- Modify the legacy blueprint's behavior (comments only).
- Put a bare Python function inside a config-flow `vol.All(...)` — HA's
  schema serializer (`voluptuous_serialize`) cannot convert it and the flow
  breaks with a 500. Validate custom logic in the step handler instead.
- Override `DataUpdateCoordinator` properties (e.g. `data`) with
  getter-only versions — the base class assigns them in `__init__`.
- Add unescaped `{...}` to translation values in `strings.json` /
  `translations/en.json` — the frontend compiles every value with formatjs
  and literal braces raise `MISSING_VALUE`. Escape as `'{...}'`.

## Commands

```bash
# Python unit tests (pure modules run without HA; HA-gated tests skip)
.venv/bin/python -m pytest

# Lint + compile before every push
.venv/bin/python -m pyflakes custom_components/ha_reminders tests
python3 -m compileall -q custom_components/ha_reminders

# Card frontend
cd card && npm run lint && npx tsc --noEmit -p tsconfig.json && npm run build

# Local HA runtime repro (config-flow serialization etc.)
#   .venv holds HA 2026.x on Python 3.14 (manual install)
#   /tmp/ci_venv holds the HA version pip resolves on Python 3.12
.venv/bin/python /tmp/ha_repro_flow.py        # flow schema serialization check
```

Verify in **both** Python environments — pip resolves different HA releases
per Python version (3.12 → older HA, 3.14 → newer), and tests must pass on
both.

## Testing conventions

- Pure logic (`models.py`, `util.py`) must stay stdlib-only so it tests
  without a Home Assistant runtime.
- HA-gated tests use `pytest.importorskip("homeassistant")` and are expected
  to run in CI, where the python job installs `pytest homeassistant`.
- Guard version drift in tests: HA APIs differ across releases (e.g.
  `frame.async_setup` exists only on newer HA) — use `hasattr` guards.

## CI and release workflow

- `validate.yaml`: python job (`compileall` + pytest with `homeassistant`
  installed) + HACS action (runs only on `main`). `build-card.yaml`: lint +
  `npm ci` + build + **dist-drift check** (the committed bundle must be
  current).
- Actions must stay on current majors (Node 24) — no Node 20 deprecation
  annotations; verify `gh run list` annotations after workflow edits.
- HACS validation requirements that broke before: brand assets at
  `custom_components/ha_reminders/brand/`, repo description + topics set,
  valid `hacs.json`/`manifest.json`.

Release steps (after user approval):
1. Bump `custom_components/ha_reminders/manifest.json` `version`.
2. Commit "Bump version to X.Y.Z", wait for green CI on `main`.
3. `git tag -a vX.Y.Z -m "Version X.Y.Z" && git push origin main && git push origin vX.Y.Z`.
4. `gh release create vX.Y.Z --title "vX.Y.Z" --notes-file <notes>` (write
   notes to a temp file first — backticks in notes break shell heredocs).
5. Confirm Validate + Build card pass on `main` **and** the tag.

## Repo gotchas (hard-earned)

- **Config-flow schema serialization** — every validator must be convertible
  by `voluptuous_serialize` + `cv.custom_serializer` (v1.0.1 crash).
- **Options flow** — schema-building methods must be shared via a mixin; the
  options flow is a separate class from the config flow (v1.0.5 crash).
- **`reminder_id` in services** — the dev-tools entity picker returns sensor
  entity ids; `coordinator.get()` resolves `sensor.ha_reminder_*` back to the
  reminder uuid.
- **`services.yaml` drives the dev-tools UI** — without it, services render
  empty forms. Keep field names aligned with the voluptuous schemas and
  validate against `homeassistant.helpers.service._SERVICES_SCHEMA`
  (`tests/test_services_yaml.py`).
- **Sensor-to-card contract** — the card renders by scanning
  `sensor.ha_reminder_*` states; the `reminder_id` attribute is the key, so
  sensor attributes must always include it.
- **Blueprint action encoding** — notification actions keep the
  `taskReminder╡<id>╡<group>╡<minutes>╡<user>` format; don't change it
  (existing automations may parse it).
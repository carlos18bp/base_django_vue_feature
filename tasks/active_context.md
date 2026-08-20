---
trigger: manual
description: Current work focus, recent changes and next steps. The most volatile memory file — update after every significant change.
---

# Active Context — Base Django Vue Feature

_Last update: 2026-08-20_

## Current focus

Align the canonical testing standard with the quality-gate implementation. The
gate already supports `allow-negation-only`; this change documents the marker
without changing detector behavior.

## Active decisions

- Tests run **SQLite via `settings_dev`** (`DJANGO_SETTINGS_MODULE`); the QA engine's `db=mysql` fallback is ignored (registry lacks `db_type`).
- E2E executes against the **self-provisioned** stack (Playwright `webServer`: Django :8001 + Vite :5174); drafts only if boot fails.
- Selector convention: role/text-first (existing style), `data-testid` added only where no stable hook exists.
- Junk-baseline debt (36 findings) is reported, not purged in this run unless the auditor crosses it.

## Recent changes (before this run)

- 2026-08-11: skill mirrors synced from toolkit (`fake-data-refresh`, fleet-base docs blocks).
- 2026-07-27: `flow-definitions.json` migrated to outcome classes (20 flows, P1–P4).
- 2026-07-25: last fleet QA audit closed 🔴 (outcomes 9/20, gate errors=2).

## Next steps (after the QA run)

- Merge the testing-standard documentation PR after CI is green.
- `/merge-when-green` to integrate the QA PR once CI is green.
- `sync-test-quality-core.sh` for the drifted in-repo gate.
- Fleet registry: add `db_type`/branch metadata for this project.

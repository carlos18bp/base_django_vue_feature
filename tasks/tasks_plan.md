---
trigger: manual
description: Task backlog, progress tracking and known issues with exact verified counts.
---

# Tasks Plan — Base Django Vue Feature

## 1. Feature status (template scaffold)

| Feature | Status |
|---|---|
| JWT auth + captcha + custom User | ✅ stable |
| Blog CRUD | ✅ stable |
| Products + galleries (attachments) | ✅ stable |
| Shopping / Sales (guest checkout) | ✅ stable |
| Staging phase banner | ✅ stable |
| Health endpoint (project+environment identity) | ✅ stable |
| Huey queue | ⚙️ configured, no tasks defined yet |

## 2. Testing status (verified 2026-08-12, pre-QA-run)

| Layer | Files | Cases | Notes |
|---|---|---|---|
| Backend (pytest, SQLite/settings_dev) | 30 | ~267 | 8 sub-suites under `base_feature_app/tests/` |
| Frontend unit (Jest) | 26 | ~312 | under `frontend/test/` |
| E2E (Playwright, Desktop Chrome) | 16 specs | 28 | tags `@flow:` 1:1 with the 20-flow map |
| Flow outcomes covered | — | 9/20 | last audit 2026-07-25 (🔴): negative_case_gaps=3, gate errors=2 warnings=20 |
| Junk baseline | 36 findings | — | 35 frontend-unit · 1 e2e · 0 backend (`.junk-baseline.json`) |

## 3. Known issues (all verified in code)

1. **Orphan legacy e2e suite**: `frontend/test/e2e/*.spec.js` (8 Playwright specs) executed by no runner — DELETE candidates (QA run 2026-08-12, auditor batch).
2. **Duplicate test**: `backend/base_feature_app/tests/test_admin.py` duplicates `tests/admin/test_admin.py`.
3. **Collection hazard**: `pytest.ini` `python_files = test_*.py` collects `management/commands/test_email.py` (a management command).
4. **Quality-gate fork drift**: in-repo `scripts/test_quality_gate.py` behind the toolkit core (`sync-test-quality-core.sh` pending).
5. **Stale doc**: `docs/USER_FLOW_MAP.md` predates the outcome-class migration (regeneration in progress in the QA run).
6. **Dead scripts**: `package.json` `e2e:mobile`/`e2e:tablet` point to commented-out Playwright projects.
7. **Flow coverage not gating in CI**: the reporter uploads `flow-coverage.json` but no job fails on it.
8. **Residue**: `.bak.*` files in `scripts/` and repo root (`CLAUDE.md.bak`, `AGENTS.md.bak`).
9. **Registry gaps**: `projects.yml` entry lacks `db_type:`/`branch:` → QA engine falls back to `db=mysql` (wrong for the SQLite test path).

## 4. Backlog

- [x] Document `allow-negation-only` in the canonical testing standard so the
  published contract matches the existing quality-gate implementation.
- [ ] **QA run 2026-08-12 (in progress)**: close outcome-class gaps (target 20/20 or declared abstentions), purge orphans/duplicates, land on `qa/12082026` + PR.
- [ ] Sync quality-gate core from toolkit (declared divergence).
- [ ] Register `db_type`/work branch for this project in fleet `projects.yml`.
- [ ] Decide whether any flow deserves a `failure`-class outcome (network/timeout) or declare the class unused.
- [ ] Wire flow-coverage audit into CI as a gating job.
- [ ] Clean `.bak.*` residue.

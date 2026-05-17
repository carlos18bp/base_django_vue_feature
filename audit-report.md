# Vulnerability Audit & Dependency Update Report

**Branch:** `chore/17052026-vuln-audit`
**Date:** 2026-05-17
**Base:** `master` @ `6b82226`
**Scope:** patch + minor updates only (no major version bumps)

## Summary

| Surface  | Vulns (initial) | Vulns (final) | Outdated (initial) | In-major bumps applied |
|----------|-----------------|---------------|--------------------|------------------------|
| Frontend | 5 (4 low, 1 high) | 4 (4 low, 0 high) | 19 | 12 |
| Backend  | 10 in 4 packages | 4 in 1 package (pip tool) | 22 | 7 (+ 2 transitive security floors) |

---

## Frontend — `npm audit` (initial)
Source: `/tmp/base_django_vue_feature-npm-audit.json`

| Package | Severity | Notes |
|---|---|---|
| @babel/plugin-transform-modules-systemjs | high | arbitrary code generation on malicious input |
| @tootallnate/once | low | Incorrect Control Flow Scoping |
| http-proxy-agent | low | transitive via @tootallnate/once |
| jest-environment-jsdom | low | transitive via jsdom |
| jsdom | low | transitive via http-proxy-agent |

**Totals (initial):** critical=0 / high=1 / moderate=0 / low=4 → 5 total.

## Frontend — `npm outdated` (initial)
Source: `/tmp/base_django_vue_feature-npm-outdated.json`

In-major (applied):
- `@babel/preset-env`: 7.29.3 → 7.29.5
- `@playwright/test`: 1.59.1 → 1.60.0
- `@tailwindcss/postcss`: 4.2.4 → 4.3.0
- `@unhead/vue`: 2.1.13 → 2.1.15
- `axios`: 1.16.0 → 1.16.1
- `flowbite`: 4.0.1 → 4.0.2
- `postcss`: 8.5.13 → 8.5.14
- `tailwindcss`: 4.2.4 → 4.3.0
- `vue`: 3.5.33 → 3.5.34
- `vue-i18n`: 11.4.0 → 11.4.3
- `vue-router`: 5.0.6 → 5.0.7
- `vue3-google-login`: 2.1.3 → 2.1.4

Major skipped (cross-major, no `--force`):
- `@unhead/vue`: 2.x → 3.x
- `@vitejs/plugin-vue`: 5.x → 6.x
- `@vueuse/core`: 11.x → 14.x
- `babel-jest`: 29.x → 30.x
- `eslint`: 9.x → 10.x
- `jest`: 29.x → 30.x
- `jest-environment-jsdom`: 29.x → 30.x
- `vite`: 6.x → 8.x

---

## Backend — `pip-audit` (initial)
Source: `/tmp/base_django_vue_feature-pip-audit.json`

| Package | Current | Vulns | Min in-major fix |
|---|---|---|---|
| Django | 6.0.4 | CVE-2026-35192, CVE-2026-6907, CVE-2026-5766 | 6.0.5 ✓ |
| pip | 24.0 | CVE-2025-8869, CVE-2026-1703, CVE-2026-3219, CVE-2026-6357 | 25.3 (tool, not in requirements) |
| pygments | 2.19.2 | CVE-2026-4539 | 2.20.0 (transitive — added security floor) |
| urllib3 | 2.6.3 | CVE-2026-44431, CVE-2026-44432 | 2.7.0 (transitive — added security floor) |

## Backend — `pip list --outdated` (initial)
Source: `/tmp/base_django_vue_feature-pip-outdated.json`

In-major bumps applied to `requirements.txt`:
- `Django`: 6.0.4 → 6.0.5  *(fixes 3 CVEs)*
- `google-auth`: 2.50.0 → 2.53.0
- `google-auth-oauthlib`: 1.3.1 → 1.4.0
- `Faker`: 40.15.0 → 40.18.0
- `ruff`: 0.15.12 → 0.15.13
- `coverage`: 7.13.5 → 7.14.0
- `requests`: 2.33.1 → 2.34.2

Transitive security floors added (not previously pinned):
- `urllib3>=2.7.0`  *(fixes CVE-2026-44431, CVE-2026-44432)*
- `Pygments>=2.20.0`  *(fixes CVE-2026-4539)*

Skipped (cross-major or out of pin range):
- `cryptography`: 46.0.7 → 48.0.0 (cross-major; no current vuln)
- `huey`: 2.6.0 → 3.0.1 (cross-major; floor `>=2.5.0`)
- `gunicorn`: 23.0.0 → 26.0.0 (pin `>=23.0,<24.0` excludes by design)
- `pip`: 24.0 → 26.1.1 (tool, not a project dependency)
- Transitive minor bumps not directly required: cachetools, certifi, charset-normalizer, django-dbbackup (floor `>=4.0.0`, installed 5.2.0), django-silk (floor `>=5.0.0`), idna, markdown-it-py, packaging, redis (floor `>=4.0.0`, installed 7.2.1)

---

## Plan

### Frontend
1. Snapshot `npm audit --json` + `npm outdated --json`.
2. `npm audit fix` (no `--force`) — resolves the high `@babel/plugin-transform-modules-systemjs` advisory via in-major bump.
3. `npx npm-check-updates -u --target minor` + `npm install`.
4. `npm audit` final + `npm run build` for verification.
5. Commit `deps(frontend): apply patch+minor updates`.

### Backend
1. Snapshot `pip-audit --format json` + `pip list --outdated --format json`.
2. Edit `requirements.txt`: bump `==`-pinned packages within current major; add explicit security floors for transitive `urllib3` and `Pygments`.
3. `pip install -r requirements.txt`.
4. Verify: `python manage.py check` + `pytest --collect-only` + slice (`test_user_model.py`).
5. Commit `deps(backend): apply patch+minor updates`.

## Updates Applied

### Frontend — commit `b145283` `deps(frontend): apply patch+minor updates`
- `@babel/preset-env` 7.29.3 → 7.29.5
- `@playwright/test` 1.59.1 → 1.60.0
- `@tailwindcss/postcss` 4.2.4 → 4.3.0
- `@unhead/vue` 2.1.13 → 2.1.15
- `axios` 1.16.0 → 1.16.1
- `flowbite` 4.0.1 → 4.0.2
- `postcss` 8.5.13 → 8.5.14
- `tailwindcss` 4.2.4 → 4.3.0
- `vue` 3.5.33 → 3.5.34
- `vue-i18n` 11.4.0 → 11.4.3
- `vue-router` 5.0.6 → 5.0.7
- `vue3-google-login` 2.1.3 → 2.1.4

Final `npm audit`: critical=0 / high=0 / moderate=0 / low=4 → 4 total.
Remaining (low) — all chained from `@tootallnate/once` and only fixable by major bump of `jest-environment-jsdom` (29.x → 30.x), intentionally skipped:
- `@tootallnate/once`, `http-proxy-agent`, `jsdom`, `jest-environment-jsdom`.

### Backend — commit `6614f8c` `deps(backend): apply patch+minor updates`
- `Django` 6.0.4 → 6.0.5
- `google-auth` 2.50.0 → 2.53.0
- `google-auth-oauthlib` 1.3.1 → 1.4.0
- `Faker` 40.15.0 → 40.18.0
- `ruff` 0.15.12 → 0.15.13
- `coverage` 7.13.5 → 7.14.0
- `requests` 2.33.1 → 2.34.2
- *(new floor)* `urllib3>=2.7.0`
- *(new floor)* `Pygments>=2.20.0`

`pip-audit` final: 4 remaining vulns, all on `pip==24.0` (the package manager tool, not a project dependency). To remediate, the operator can `pip install --upgrade pip` inside `backend/venv/`. No project-level packages remain vulnerable.

## Rollbacks

Ninguno. `npm install` y `pip install` resolvieron sin `ERESOLVE` ni conflictos de peer deps.

## Verification Results

### Frontend
- `npm audit` (final): 0 critical / 0 high / 0 moderate / 4 low (down from 5 total).
- `npm run build`: success, `✓ built in 4m 11s` (Vite 6.4.x, output bundle ~328 kB main chunk).

### Backend
- `python manage.py check`: `System check identified no issues (0 silenced).`
- `pytest --collect-only --no-cov`: `261 tests collected in 6.63s` (no collection errors).
- Slice `pytest base_feature_app/tests/models/test_user_model.py --no-cov`: `11 passed in 107.82s`.

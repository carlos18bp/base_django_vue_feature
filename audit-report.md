# Vulnerability Audit & Dependency Update Report

**Branch:** `master`
**Date:** 2026-05-04
**Base:** `origin/master` @ `2efd0e1`
**Scope:** patch + minor updates only (no major version bumps)

## Summary

| Surface  | Vulns (initial) | Outdated (initial) | Vulns (final) |
|----------|-----------------|--------------------|---------------|
| Frontend | 0c/0h/0m/4l     | 4 applicable       | 0c/0h/0m/4l   |
| Backend  | 19 total (10 pkgs, mostly venv drift + 4 new CVEs) | 1 applicable (google-auth) | 4 (pip+pygments — tool deps, not project) |

---

## Frontend — `npm audit` (initial)

Source: `/tmp/base_django_vue_feature-npm-audit.json`

| Package | Severity | Notes |
|---|---|---|
| @tootallnate/once <3.0.1 | low | Incorrect Control Flow Scoping |
| http-proxy-agent (transitive) | low | Depends on @tootallnate/once |
| jsdom (transitive) | low | Depends on http-proxy-agent |
| jest-environment-jsdom | low | Depends on jsdom |

**Totals:** 0 critical / 0 high / 0 moderate / **4 low**.

All 4 lows require `jest-environment-jsdom` 29→30 (major) — deferred per policy.

## Frontend — `npm outdated` (initial)

Source: `/tmp/base_django_vue_feature-npm-outdated.json`

| Package | Current | Wanted | Latest | Action |
|---|---|---|---|---|
| @babel/preset-env | 7.29.2 | 7.29.3 | 7.29.3 | apply patch |
| @unhead/vue | 2.1.13 | 2.1.13 | 3.1.0 | skip major |
| @vitejs/plugin-vue | 5.2.4 | 5.2.4 | 6.0.6 | skip major |
| axios | 1.15.2 | 1.16.0 | 1.16.0 | apply minor |
| babel-jest | 29.7.0 | 29.7.0 | 30.3.0 | skip major |
| eslint | 9.39.4 | 9.39.4 | 10.3.0 | skip major |
| jest | 29.7.0 | 29.7.0 | 30.3.0 | skip major |
| jest-environment-jsdom | 29.7.0 | 29.7.0 | 30.3.0 | skip major |
| postcss | 8.5.12 | 8.5.13 | 8.5.13 | apply patch |
| vite | 6.4.2 | 6.4.2 | 8.0.10 | skip major (already at latest 6.x) |
| vue3-google-login | 2.0.42 | 2.1.3 | 2.1.3 | apply minor |

---

## Backend — `pip-audit` (initial)

Source: `/tmp/base_django_vue_feature-pip-audit.json`

**Note:** The venv was not synced with `requirements.txt` (which was already at patched versions from the 2026-04-30 audit). The 19 initial findings break down as:
- 14 = stale venv (packages already fixed in requirements.txt: Django, pillow, pytest, python-dotenv, requests + 2 google-auth ones)
- 5 = new since last audit

| Package | Version | Advisory | Fix | Category |
|---|---|---|---|---|
| cryptography | 46.0.5 | CVE-2026-34073 | 46.0.6 | **new CVE** |
| cryptography | 46.0.5 | CVE-2026-39892 | 46.0.7 | **new CVE** |
| django | 6.0.2 | CVE-2026-25674/73/33033/34/4292/4277/3902 (7) | 6.0.4 | venv drift (already in reqs) |
| pillow | 12.1.1 | CVE-2026-40192 | 12.2.0 | venv drift (already in reqs) |
| pip | 24.0 | CVE-2025-8869 | 25.3 | tool dep |
| pip | 24.0 | CVE-2026-1703 | 26.0 | tool dep |
| pip | 24.0 | CVE-2026-3219 | — | tool dep |
| pyasn1 | 0.6.2 | CVE-2026-30922 | 0.6.3 | **new CVE** |
| pygments | 2.19.2 | CVE-2026-4539 | 2.20.0 | tool dep (pip-audit) |
| pyjwt | 2.11.0 | CVE-2026-32597 | 2.12.0 | **new CVE** |
| pytest | 9.0.2 | CVE-2025-71176 | 9.0.3 | venv drift (already in reqs) |
| python-dotenv | 1.2.1 | CVE-2026-28684 | 1.2.2 | venv drift (already in reqs) |
| requests | 2.32.5 | CVE-2026-25645 | 2.33.0 | venv drift (already in reqs) |

## Backend — `pip list --outdated` (initial)

Packages in `requirements.txt` with new versions since last audit:

| Package | In requirements.txt | Latest | Action |
|---|---|---|---|
| google-auth | ==2.49.2 | 2.50.0 | apply minor |
| huey | >=2.5.0 | 3.0.0 | skip major (2→3) |

Transitive deps needing explicit pins for CVE fixes:
- `cryptography`: 46.0.5 → 46.0.7 (patch, 2 CVEs)
- `PyJWT`: 2.11.0 → 2.12.1 (minor, CVE-2026-32597)
- `pyasn1`: 0.6.2 → 0.6.3 (patch, CVE-2026-30922)

---

## Plan

### Frontend
- `@babel/preset-env` ^7.29.2 → ^7.29.3
- `axios` ^1.15.2 → ^1.16.0
- `postcss` ^8.5.12 → ^8.5.13
- `vue3-google-login` ^2.0.42 → ^2.1.3

### Backend
- `google-auth` ==2.49.2 → ==2.50.0
- Add `cryptography==46.0.7` (fix CVE-2026-34073, CVE-2026-39892)
- Add `PyJWT==2.12.1` (fix CVE-2026-32597)
- Add `pyasn1==0.6.3` (fix CVE-2026-30922)
- `gunicorn` constraint `>=23.0,<24.0` kept (latest 25.x is a major)
- `huey` not bumped (2→3 is a major)

---

## Updates Applied

### Frontend (commit `deps(frontend): apply patch+minor updates`)

| Package | From | To |
|---|---|---|
| @babel/preset-env | ^7.29.2 | ^7.29.3 |
| axios | ^1.15.2 | ^1.16.0 |
| postcss | ^8.5.12 | ^8.5.13 |
| vue3-google-login | ^2.0.42 | ^2.1.3 |

Final `npm audit`: **0 critical / 0 high / 0 moderate / 4 low** (jest chain, major bump required).

Remaining outdated (majors skipped intentionally): `@unhead/vue` 2→3, `@vitejs/plugin-vue` 5→6, `babel-jest/jest/jest-environment-jsdom` 29→30, `eslint` 9→10, `vite` 6→8.

### Backend (commit `deps(backend): apply patch+minor updates`)

| Package | From | To | Notes |
|---|---|---|---|
| google-auth | 2.49.2 | 2.50.0 | minor |
| cryptography | — | 46.0.7 | new explicit pin; fixes CVE-2026-34073, CVE-2026-39892 |
| PyJWT | — | 2.12.1 | new explicit pin; fixes CVE-2026-32597 |
| pyasn1 | — | 0.6.3 | new explicit pin; fixes CVE-2026-30922 |

`pip-audit` final: **4 remaining** — all in packages that are not project dependencies:
- `pip 24.0`: CVE-2025-8869, CVE-2026-1703, CVE-2026-3219 (package manager, not in requirements.txt)
- `pygments 2.19.2`: CVE-2026-4539 (transitive dep of pip-audit tool itself, not in requirements.txt)

---

## Rollbacks

Ninguno.

---

## Verification Results

### Frontend
- `npm audit`: 0 critical / 0 high / 0 moderate / 4 low (unchanged — jest chain).
- `npm run build`: ✅ success (Vite 6.4.2, 14s).

### Backend
- `python manage.py check`: ✅ System check identified no issues (0 silenced).
- `pytest --collect-only`: ✅ 255 tests collected.
- Slice: `pytest base_feature_app/tests/test_admin.py -v`: ✅ 7 passed in 11.18s.

---

## Majors Skipped (out of scope)

### Frontend
- `@unhead/vue` 2.x → 3.x
- `@vitejs/plugin-vue` 5.x → 6.x
- `babel-jest` 29.x → 30.x
- `eslint` 9.x → 10.x
- `jest` 29.x → 30.x
- `jest-environment-jsdom` 29.x → 30.x
- `vite` 6.x → 8.x

The chain `jest-environment-jsdom → jsdom → http-proxy-agent → @tootallnate/once` requires a major jest ecosystem bump (29→30) to clear; those four low-severity advisories remain.

### Backend
- `gunicorn` 23.x → 25.x (constraint in requirements is `>=23.0,<24.0`)
- `huey` 2.x → 3.x

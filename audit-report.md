# Vulnerability Audit Report — base_django_vue_feature

- Branch: `double-check-30042026`
- Base: `origin/master` (commit `eab559a`)
- Date: 2026-04-30
- Scope: backend (`backend/requirements.txt`, Python 3.12, Django 6.0.x), frontend (`frontend/package.json`, Vue 3.5 + Vite 6.4)

## Summary — CVEs by Severity

### Frontend (npm audit)

| Severity | Count |
|----------|------:|
| critical | 0 |
| high     | 4 |
| moderate | 7 |
| low      | 4 |
| **total**| **15** |

### Backend (pip-audit)

| Severity | Count |
|----------|------:|
| listed by advisory | 11 vulnerabilities across 5 packages |

`pip-audit` reports advisory IDs (CVE / GHSA) without explicit severity — see CVE Details below.

---

## Outdated Packages — Frontend

| Package | Current | Patch+Minor target | Latest | Notes |
|---|---|---|---|---|
| @babel/preset-env | 7.29.0 | 7.29.2 | 7.29.2 | minor |
| @playwright/test | 1.58.2 | 1.59.1 | 1.59.1 | minor |
| @tailwindcss/postcss | 4.2.1 | 4.2.4 | 4.2.4 | patch |
| @unhead/vue | 2.1.12 | 2.1.13 | 3.1.0 | major to 3.x — SKIP |
| @vitejs/plugin-vue | 5.2.4 | 5.2.4 | 6.0.6 | major to 6.x — SKIP |
| @vue/test-utils | 2.4.6 | 2.4.10 | 2.4.10 | patch |
| autoprefixer | 10.4.27 | 10.5.0 | 10.5.0 | minor |
| axios | 1.13.6 | 1.15.2 | 1.15.2 | minor |
| babel-jest | 29.7.0 | 29.7.0 | 30.3.0 | major to 30.x — SKIP |
| eslint | 9.39.4 | 9.39.4 | 10.2.1 | major to 10.x — SKIP |
| gsap | 3.14.2 | 3.15.0 | 3.15.0 | minor |
| jest | 29.7.0 | 29.7.0 | 30.3.0 | major to 30.x — SKIP |
| jest-environment-jsdom | 29.7.0 | 29.7.0 | 30.3.0 | major — SKIP |
| postcss | 8.5.8 | 8.5.12 | 8.5.12 | patch |
| sweetalert2 | 11.26.22 | 11.26.24 | 11.26.24 | patch |
| tailwindcss | 4.2.1 | 4.2.4 | 4.2.4 | patch |
| vite | 6.4.1 | 6.4.2 | 8.0.10 | bumped to latest 6.x patch — major skipped |
| vue | 3.5.30 | 3.5.33 | 3.5.33 | patch |
| vue-i18n | 11.3.0 | 11.4.0 | 11.4.0 | minor |
| vue-router | 5.0.3 | 5.0.6 | 5.0.6 | patch |
| vue3-google-login | 2.0.37 | 2.0.42 | 2.0.42 | patch |

## Outdated Packages — Backend

| Package | Current | Patch+Minor target | Latest | Notes |
|---|---|---|---|---|
| Django | 6.0.2 | 6.0.4 | 6.0.4 | patch |
| Faker | 40.5.1 | 40.15.0 | 40.15.0 | minor |
| coverage | 7.13.4 | 7.13.5 | 7.13.5 | patch |
| djangorestframework | 3.16.1 | 3.17.1 | 3.17.1 | minor |
| google-auth | 2.48.0 | 2.49.2 | 2.49.2 | minor |
| google-auth-oauthlib | 1.2.4 | 1.3.1 | 1.3.1 | minor |
| gunicorn | 23.0.0 | (kept `>=23.0,<24.0`) | 25.3.0 | constraint pins major — SKIP |
| mysqlclient | 2.2.4 | 2.2.8 | 2.2.8 | patch |
| pillow | 12.1.1 | 12.2.0 | 12.2.0 | minor |
| pytest | 9.0.2 | 9.0.3 | 9.0.3 | patch |
| pytest-cov | 7.0.0 | 7.1.0 | 7.1.0 | minor |
| python-dotenv | 1.2.1 | 1.2.2 | 1.2.2 | patch |
| requests | 2.32.5 | 2.33.1 | 2.33.1 | minor |
| ruff | 0.15.2 | 0.15.12 | 0.15.12 | patch |

---

## CVE Details

### Frontend

| Package | Severity | Advisory / Title | Fix |
|---|---|---|---|
| @tootallnate/once (transitive) | low | Incorrect Control Flow Scoping | requires jest-environment-jsdom 30.x (major) |
| @unhead/vue | moderate | Unhead `hasDangerousProtocol()` bypass via leading-zero padded HTML entities in `useHeadSafe()` | non-major fix available |
| axios | moderate | NO_PROXY Hostname Normalization Bypass leading to SSRF; Unrestricted Cloud Metadata Exfiltration via Header Injection Chain | 1.15.2 |
| brace-expansion (transitive) | moderate | Zero-step sequence causes process hang and memory exhaustion (DoS) | non-major fix available |
| defu (transitive) | high | Prototype pollution via `__proto__` key in defaults argument | non-major fix available |
| flatted (transitive) | high | Prototype Pollution via `parse()` in NodeJS flatted | non-major fix available |
| follow-redirects (transitive) | moderate | Leaks Custom Authentication Headers to Cross-Domain Redirect Targets | non-major fix available |
| http-proxy-agent / jsdom (transitive) | low | jsdom chain via @tootallnate/once | requires jest 30.x (major) |
| jest-environment-jsdom | low | jsdom chain | requires major bump — SKIP |
| picomatch (transitive) | high | Method Injection in POSIX Character Classes causes incorrect Glob Matching | non-major fix available |
| postcss | moderate | XSS via Unescaped `</style>` in CSS Stringify Output | 8.5.12 |
| unhead (transitive) | moderate | hasDangerousProtocol bypass | non-major fix available |
| vite | high | Path Traversal in Optimized Deps `.map` Handling; Arbitrary File Read via Vite Dev Server WebSocket | 6.4.x patch |
| yaml (transitive) | moderate | Stack Overflow via deeply nested YAML collections | non-major fix available |

### Backend

| Package | Version | Advisory | Fix versions |
|---|---|---|---|
| Django | 6.0.2 | CVE-2026-25674 (BIT-django-2026-25674) | 4.2.29, 5.2.12, 6.0.3 |
| Django | 6.0.2 | CVE-2026-25673 (GHSA-8p8v-wh79-9r56) | 4.2.29, 5.2.12, 6.0.3 |
| Django | 6.0.2 | CVE-2026-33033 (GHSA-5mf9-h53q-7mhq) | 4.2.30, 5.2.13, 6.0.4 |
| Django | 6.0.2 | CVE-2026-33034 (GHSA-933h-hp56-hf7m) | 4.2.30, 5.2.13, 6.0.4 |
| Django | 6.0.2 | CVE-2026-4292 (GHSA-mmwr-2jhp-mc7j) | 4.2.30, 5.2.13, 6.0.4 |
| Django | 6.0.2 | CVE-2026-4277 (GHSA-pwjp-ccjc-ghwg) | 4.2.30, 5.2.13, 6.0.4 |
| Django | 6.0.2 | CVE-2026-3902 (GHSA-mvfq-ggxm-9mc5) | 4.2.30, 5.2.13, 6.0.4 |
| python-dotenv | 1.2.1 | CVE-2026-28684 (GHSA-mf9w-mj56-hr94) | 1.2.2 |
| pillow | 12.1.1 | CVE-2026-40192 (GHSA-whj4-6x5x-4v2j) | 12.2.0 |
| pytest | 9.0.2 | CVE-2025-71176 (GHSA-6w46-j5rx-g56g) | 9.0.3 |
| requests | 2.32.5 | CVE-2026-25645 (GHSA-gc5v-m9x4-r6x2) | 2.33.0 |

All backend CVEs are resolvable via patch+minor updates within the existing pinned major versions.

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

The chain `jest-environment-jsdom → jsdom → http-proxy-agent → @tootallnate/once` requires a major jest ecosystem bump (29 → 30) to clear; therefore those four low-severity advisories remain.

### Backend
- `gunicorn` 23.x → 25.x (constraint in requirements is `>=23.0,<24.0`)

---

## Reproducibility Commands

```bash
# Setup
cd /home/dev-env/repos/base_django_vue_feature
git fetch origin
git checkout origin/master
git checkout -b double-check-30042026

# Frontend
cd frontend
npm install
npm audit --json > /tmp/base_django_vue_feature-npm-audit.json
npm outdated --json > /tmp/base_django_vue_feature-npm-outdated.json

# Backend
cd ../backend
python3 -m venv .venv-audit
.venv-audit/bin/pip install --upgrade pip pip-audit
.venv-audit/bin/pip install -r requirements.txt
.venv-audit/bin/pip-audit -r requirements.txt --format json > /tmp/base_django_vue_feature-pip-audit.json
.venv-audit/bin/pip list --outdated --format json > /tmp/base_django_vue_feature-pip-outdated.json
```

---

## Updates Applied

This section is updated after the patch+minor pass — see commits `deps(frontend): apply patch+minor updates` and `deps(backend): apply patch+minor updates` on this branch.

### Rollbacks

(populated after the verify step)

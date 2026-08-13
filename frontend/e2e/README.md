# E2E Tests — Playwright + Flow Coverage

End-to-end tests organized by module with **Flow Coverage** tracking.

## Structure

```
e2e/
├── flow-definitions.json          # All user flows (source of truth)
├── reporters/
│   └── flow-coverage-reporter.mjs # Custom reporter
├── helpers/
│   ├── flow-tags.js               # Tag constants per flow
│   ├── auth.js                    # Auth helpers (login, logout, localStorage)
│   ├── django-shell.js            # Idempotent manage.py shell-outs (fixtures: staff/superuser, staging singleton)
│   └── test.js                    # Custom test base (error logging, timeouts)
├── auth/                          # Auth module specs
│   ├── auth-login.spec.js
│   ├── auth-register.spec.js
│   ├── auth-logout.spec.js
│   ├── auth-protected-redirect.spec.js
│   └── auth-guest-redirect.spec.js
├── admin/                         # Admin/backoffice module specs
│   ├── backoffice.spec.js
│   └── admin-login-handoff.spec.js
├── shopping/                      # Shopping module specs
│   ├── shopping-catalog.spec.js
│   ├── shopping-product-detail.spec.js
│   ├── shopping-cart.spec.js
│   └── shopping-checkout.spec.js
├── blog/                          # Blog module specs
│   ├── blog-list.spec.js
│   └── blog-detail.spec.js
├── home/                          # Home module specs
│   └── home-carousels.spec.js
├── manual/                        # Manual module specs
│   ├── manual-view.spec.js
│   └── manual-search.spec.js
├── navigation/                    # Navigation module specs
│   ├── navigation-search.spec.js
│   ├── navigation-cart-overlay.spec.js
│   ├── navigation-theme-toggle.spec.js
│   └── navigation-not-found.spec.js
├── platform/                      # Platform module specs (staging gate — serial, mutates a DB singleton)
│   └── staging-banner.spec.js
└── static/                        # Static pages module specs
    └── static-pages.spec.js
```

## Artifacts (generated)

These directories are generated after runs and are gitignored:

- `playwright-report/` — HTML report
- `e2e-results/` — `flow-coverage.json` and `results.json`
- `test-results/` — traces/attachments (only on retries)

## Running Tests

```bash
# All tests (Flow Coverage + HTML + JSON reports)
npm run e2e

# Alias
npm run test:e2e

# Clean artifacts then run
npm run e2e:full

# List available E2E modules
npm run e2e:modules

# Interactive UI / headed
npm run e2e:ui
npm run e2e:headed

# Run by device project
npm run e2e:desktop
npm run e2e:mobile
npm run e2e:tablet

# Single module
npx playwright test e2e/auth/

# Single module (alias)
npm run e2e:module -- auth
npm run e2e:module -- --module auth --clean

# Filter by flow tag
npx playwright test --grep @module:auth
npx playwright test --grep @priority:P1

# Module-scoped coverage
clear && npm run e2e:clean && npm run e2e:coverage -- --grep @module:auth

# Module-scoped coverage (alias)
npm run e2e:coverage:module -- auth
npm run e2e:coverage:module -- --module auth --clean

# Single file
npx playwright test e2e/shopping/shopping-cart.spec.js

# Flow coverage only (CI reporter)
npm run e2e:coverage:ci

# View report
npm run e2e:report

# Clean artifacts
npm run e2e:clean
```

**Note:** `--grep @module:<name>` only runs tests tagged with that module. When you run a subset, the flow coverage report will still list other modules/flows as missing because they were not executed.

## Local web servers (automatic)

Playwright starts (or reuses) the following servers from `playwright.config.mjs`:

- Backend: `127.0.0.1:8001` (`/admin/` health check)
- Frontend: `127.0.0.1:5173` (Vite dev server)

If the servers are already running, `reuseExistingServer: true` keeps them.

## Flow Coverage System

Every test is tagged with `@flow:<flow-id>` linking it to a flow definition in `flow-definitions.json`. The custom reporter tracks coverage at the user-journey level.

### Tagging tests

```javascript
import { test, expect } from '../helpers/test.js';
import { AUTH_LOGIN_EMAIL } from '../helpers/flow-tags.js';

test('user can sign in', {
  tag: [...AUTH_LOGIN_EMAIL, '@role:shared'],
}, async ({ page }) => {
  // test body
});
```

### Flow Coverage Report

Example output (values vary per run):

```
╔══════════════════════════════════════════════════════════════════╗
║                    FLOW COVERAGE REPORT                         ║
╚══════════════════════════════════════════════════════════════════╝
📊 SUMMARY
   Total Flows Defined:  20
   ✅ Covered:           19 (95.0%)
   ⚠️  Partial:           1 (5.0%)
📦 COVERAGE BY MODULE
   auth     [████████████████████] 100% (6/6)
   blog     [████████████████████] 100% (3/3)
   ...
```

JSON artifacts:

- `e2e-results/flow-coverage.json`
- `e2e-results/results.json`

### Adding a new flow

1. Add entry to `e2e/flow-definitions.json`
2. Add constant to `e2e/helpers/flow-tags.js`
3. Create spec file with `@flow:` tag
4. Run tests and verify flow appears as `covered`

## Helpers

| Helper | File | Purpose |
|--------|------|---------|
| `login(page, email, password)` | `helpers/auth.js` | Sign in via UI form |
| `setAuthLocalStorage(page, options)` | `helpers/auth.js` | Inject auth state before navigation (call before `page.goto()`) |
| `logout(page)` | `helpers/auth.js` | Sign out via UI button |
| `test` / `expect` | `helpers/test.js` | Custom test base with error logging |
| Flow tag constants | `helpers/flow-tags.js` | Tag arrays per flow |
| Django shell-outs | `helpers/django-shell.js` | Idempotent `manage.py shell -c` fixtures (staff/superuser users, staging-banner singleton) — CI/local python branching included |

### Logging

Set `E2E_LOG_ERRORS=1` (or `E2E_LOG_CONSOLE_ERRORS=1`) to log page errors and console errors during runs.

## Flow Definitions (31 flows)

Source of truth: `e2e/flow-definitions.json` (update `lastUpdated` when adding flows). Human-readable mirror with evidence and outcome detail: `docs/USER_FLOW_MAP.md`.

| Module | Flows | Priority |
|--------|-------|----------|
| **auth** | login-email, login-invalid, login-server-error, register, google-login (structurally excluded in e2e — see helpers/test.js), logout, protected-redirect, guest-redirect, admin-login-handoff | P1-P3 |
| **admin** | backoffice-users-list, backoffice-sales-list | P2 |
| **shopping** | catalog-browse, product-detail, cart-add, cart-remove, cart-persist, checkout-complete | P1-P2 |
| **blog** | list-view, detail-view, detail-not-found | P2-P3 |
| **home** | carousel-navigate | P3 |
| **manual** | manual-view, manual-search | P3 |
| **navigation** | header-search, header-cart-overlay, theme-toggle, not-found-page | P2-P4 |
| **platform** | staging-phase-banner-display, staging-review-expired-overlay | P3-P4 |
| **static** | static-about, static-contact | P4 |

## References

- [Playwright Docs](https://playwright.dev/)
- [E2E Flow Coverage Report Standard](../docs/E2E_FLOW_COVERAGE_REPORT_STANDARD.md)
- [Architecture Standard — E2E sections](../docs/DJANGO_VUE_ARCHITECTURE_STANDARD.md)

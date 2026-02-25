# Playwright E2E - Cleanup and Maintenance Guide

## What uses disk space in Playwright?

### 1. Browsers (~500 MB - 1 GB)
**Location**: `~/.cache/ms-playwright/`

Playwright downloads real browsers (Chromium, Firefox, WebKit) the first time you install `@playwright/test`. These browsers are shared across all test runs.

### 2. Test artifacts (varies)
**Location**: `frontend/test-results/`, `frontend/playwright-report/`, `frontend/e2e-results/`

Each `npm run e2e` run can generate:
- **Traces** (debug artifacts, only on retries)
- **HTML report** (visual summary of the latest run)
- **Flow coverage + JSON results** (`flow-coverage.json`, `results.json`)

**Current configuration** (in `playwright.config.mjs`):
```javascript
use: {
  trace: 'on-first-retry',
  screenshot: 'off',
  video: 'off',
}
reporter: [
  ['html', { open: 'never' }],
  ['json', { outputFile: 'e2e-results/results.json' }],
  ['./e2e/reporters/flow-coverage-reporter.mjs', { outputDir: 'e2e-results' }],
]
```

This means **passing runs only produce the HTML report and JSON outputs**; traces appear only when retries happen (retries are enabled in CI).

---

## Cleanup commands

### Quick cleanup (test artifacts)
```bash
npm run e2e:clean
```

This removes:
- `test-results/` (traces)
- `playwright-report/` (HTML report)
- `e2e-results/` (flow coverage + JSON results)

**When to use**: After E2E runs or whenever the `frontend/` folder grows too large.

### Full cleanup (includes browsers)
```bash
# 1. Clean artifacts
npm run e2e:clean

# 2. Uninstall Playwright browsers
npx playwright uninstall --all

# 3. (Optional) Reinstall Chromium if you still plan to run E2E
npx playwright install chromium
```

**When to use**: If you need to free ~1 GB and will not run E2E for a while.

---

## Recommended workflow

### During active development
```bash
# 1. Run tests
npm run e2e

# 2. Open the report if something failed
npm run e2e:report

# 3. Clean artifacts when done
npm run e2e:clean
```

### In CI/CD
Artifacts are cleaned between builds, so no manual action is needed.

---

## Space optimization

### Current config already minimizes artifacts

Screenshots and videos are already off, so disk usage stays low. If you need more debugging data, enable artifacts in `playwright.config.mjs`.

Example to keep artifacts only on failure:
```javascript
use: {
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
  trace: 'on-first-retry',
}
```

### Alternative: keep artifacts only in CI
```javascript
use: {
  screenshot: process.env.CI ? 'only-on-failure' : 'off',
  video: process.env.CI ? 'retain-on-failure' : 'off',
  trace: process.env.CI ? 'on-first-retry' : 'off',
}
```

---

## Disk monitoring

### Check current artifact size
```bash
du -sh frontend/test-results frontend/playwright-report frontend/e2e-results
```

### Check Playwright browser size
```bash
du -sh ~/.cache/ms-playwright/
```

---

## FAQ

**Q: Why does Playwright download full browsers?**  
A: To guarantee tests run in a consistent environment, regardless of which browser is installed on your system.

**Q: Can I use my installed Chrome instead of Playwright browsers?**  
A: Technically yes, but it is not recommended. Playwright is optimized for its bundled browser versions.

**Q: Do videos take a lot of space?**  
A: A ~2 min video can be 5-10 MB. Videos are currently disabled; if enabled, they are usually recorded only on failures.

**Q: Should I add `test-results/`, `playwright-report/`, and `e2e-results/` to `.gitignore`?**  
A: Yes, they are already listed in `frontend/.gitignore`. Never commit test artifacts.

---

## Summary

| Action | Command | Frees |
|--------|---------|-------|
| Clean test artifacts | `npm run e2e:clean` | ~1-50 MB |
| Uninstall browsers | `npx playwright uninstall --all` | ~500 MB - 1 GB |
| Check current size | `du -sh frontend/test-results frontend/playwright-report frontend/e2e-results` | - |

**Recommendation**: Run `npm run e2e:clean` after each E2E session to keep the workspace tidy.

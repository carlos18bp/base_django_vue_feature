import { test, expect } from '../helpers/test.js';
import { STAGING_REVIEW_EXPIRED_OVERLAY, STAGING_PHASE_BANNER_DISPLAY } from '../helpers/flow-tags.js';
import { runDjangoShell } from '../helpers/django-shell.js';

/**
 * E2E tests for the site-wide staging review banner/overlay (StagingGate).
 *
 * StagingPhaseBanner is a DB singleton (pk=1, backend/base_feature_app/
 * models/staging_phase_banner.py:71-73) and nothing else in the suite
 * touches it, but both specs in THIS file mutate the same row — so they run
 * in `serial` mode (the project otherwise runs fullyParallel with
 * workers:3) and each resets the row to the exact state it needs
 * immediately before its own navigation.
 */

test.describe('Platform — staging review banner', () => {
  test.describe.configure({ mode: 'serial' });

  // Both tests below set the singleton and never reset it on their own —
  // without this, the file leaves the staging gate ACTIVE for the rest of
  // the suite and for future runs: `serial` only orders these 2 tests
  // against each other, the project itself is fullyParallel/workers:3, and
  // `is_visible` defaults to True while `started_at` is what actually gates
  // the render. Reset to the model's own inert default (started_at=null) —
  // not a guess at "off", the literal default new rows are created with.
  test.afterAll(() => {
    runDjangoShell(
      "from base_feature_app.models import StagingPhaseBanner; b=StagingPhaseBanner.get_solo(); b.started_at=None; b.save()",
    );
  });

  test('an expired review window replaces the page with the contact overlay', {
    tag: [...STAGING_REVIEW_EXPIRED_OVERLAY, '@role:shared', '@outcome:display'],
  }, async ({ page }) => {
    // Bug this catches: StagingGate's overlay-vs-banner-vs-children branching
    // failing against the REAL backend-computed `is_expired` field — the one
    // thing a fetch-mocked unit test cannot prove.
    // quality: allow-no-interaction (this is a passive, backend-state-driven site-wide render — there is no user action that triggers it, only navigation; the resulting takeover IS the behavior under test)
    runDjangoShell(
      "from base_feature_app.models import StagingPhaseBanner; from django.utils import timezone; from datetime import timedelta; b=StagingPhaseBanner.get_solo(); b.is_visible=True; b.current_phase='development'; b.started_at=timezone.now()-timedelta(days=b.development_duration_days+1); b.save()",
    );

    await page.goto('/');

    await expect(page.locator('[data-testid="staging-expired-overlay"]')).toBeVisible();
    await expect(page.locator('[data-testid="staging-phase-banner"]')).toHaveCount(0);
    await expect(page.getByTestId('staging-expired-whatsapp')).toBeVisible();
    await expect(page.getByTestId('staging-expired-email')).toBeVisible();
  });

  test('an active, non-expired review phase shows the sticky banner with phase and day count', {
    tag: [...STAGING_PHASE_BANNER_DISPLAY, '@role:shared', '@outcome:display'],
  }, async ({ page }) => {
    // Bug this catches: the same branching risk mirrored for the
    // non-expired path, plus the day-count/phase-label rendering itself —
    // StagingPhaseBanner.vue's own unit test only proves that with a
    // fabricated phase_labels fixture, never the real backend-computed value.
    // quality: allow-no-interaction (same as above — a passive, backend-state-driven site-wide render, reached by navigation alone)
    runDjangoShell(
      "from base_feature_app.models import StagingPhaseBanner; from django.utils import timezone; b=StagingPhaseBanner.get_solo(); b.is_visible=True; b.current_phase='design'; b.started_at=timezone.now(); b.save()",
    );

    await page.goto('/');

    const banner = page.locator('[data-testid="staging-phase-banner"]');
    await expect(banner).toBeVisible();
    await expect(banner).toContainText(/design phase/i);
    await expect(banner).toContainText(/\d+\s+days?/i);
    await expect(page.locator('[data-testid="staging-expired-overlay"]')).toHaveCount(0);
  });
});

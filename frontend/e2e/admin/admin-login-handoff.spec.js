import { test, expect } from '../helpers/test.js';
import { ADMIN_LOGIN_HANDOFF } from '../helpers/flow-tags.js';
import { runDjangoShell } from '../helpers/django-shell.js';

/**
 * E2E tests for the admin impersonation session handoff (/admin-login).
 *
 * AdminLogin.vue redeems the access/refresh tokens minted by the
 * Django-admin "Login as this user" action
 * (backend/base_feature_app/admin.py, login_as_user_view) and lands the
 * admin authenticated as the target user.
 *
 * The success path needs `settings.FRONTEND_URL` to point at this e2e run's
 * Vite origin (127.0.0.1:5174) — playwright.config.mjs's Django webServer
 * command now exports it explicitly, so the impersonation redirect actually
 * lands where the browser can redeem it.
 */

const SUPERADMIN_EMAIL = 'e2e-superadmin@example.com';
const SUPERADMIN_PASSWORD = 'password';
const TARGET_EMAIL = 'admin@gmail.com'; // seeded, real customer — login_as only mints tokens, it doesn't mutate the target row

test.describe('Auth — admin impersonation handoff', () => {
  test('redirects to sign_in when no tokens are present in the URL', {
    tag: [...ADMIN_LOGIN_HANDOFF, '@role:admin', '@outcome:error'],
  }, async ({ page }) => {
    // Bug this catches: AdminLogin.vue's onMounted guard
    // (frontend/src/views/auth/AdminLogin.vue:28-31) failing to redirect —
    // e.g. throwing on a missing token instead of bouncing to sign_in, or
    // attempting to redeem a partial/undefined token pair.
    // quality: allow-no-interaction (no UI path to /admin-login with no query params; a bare navigation here IS the behavior under test, mirroring auth-protected-redirect.spec.js's guard tests)
    await page.goto('/admin-login');

    await expect(page).toHaveURL(/\/sign_in/);
  });

  test.describe('successful handoff', () => {
    test.beforeAll(() => {
      runDjangoShell(
        "from base_feature_app.models import User; User.objects.filter(email='e2e-superadmin@example.com').exists() or User.objects.create_superuser(email='e2e-superadmin@example.com', password='password')",
      );
    });

    test('a superuser logging in as another user lands signed in on the Vue app', {
      tag: [...ADMIN_LOGIN_HANDOFF, '@role:admin', '@outcome:success'],
    }, async ({ page, context }) => {
      // Bug this catches: the redirect URL assembly in the Django-admin
      // action (admin.py: login_as_user_view) drifting from what
      // AdminLogin.vue expects (e.g. a renamed query param) — a regression
      // neither side's own unit tests can catch, since each mocks the
      // boundary the other owns. Unit-level coverage of the redemption side
      // (frontend/test/views/AdminLogin.test.js) and the trigger side
      // (backend/base_feature_app/tests/admin/test_admin.py) already exists —
      // this test's value is specifically the cross-system wiring.
      await page.goto('http://127.0.0.1:8001/admin/login/');
      await page.getByLabel('Email:').fill(SUPERADMIN_EMAIL);
      await page.getByLabel('Password:').fill(SUPERADMIN_PASSWORD);
      await page.getByRole('button', { name: 'Log in' }).click();
      await page.waitForLoadState('domcontentloaded');

      await page.goto('http://127.0.0.1:8001/admin/base_feature_app/user/');
      // #searchbar has no unambiguous accessible label of its own: its
      // <label> only wraps a magnifier <img>, and getByLabel('Search')
      // instead resolves to the surrounding <form role="search"
      // aria-labelledby="...Search users"> (verified live) — Django's own
      // long-stable admin template id, not part of this project's frontend.
      // quality: allow-fragile-selector (Django's own admin template id, stable for 15+ years, not part of this project's frontend code)
      await page.locator('#searchbar').fill(TARGET_EMAIL);
      await page.getByRole('button', { name: 'Search' }).click();
      await page.waitForLoadState('domcontentloaded');
      await page.getByRole('link', { name: TARGET_EMAIL }).click();
      await page.waitForLoadState('domcontentloaded');

      const [popup] = await Promise.all([
        context.waitForEvent('page'),
        page.getByRole('link', { name: 'Login as this user' }).click(),
      ]);

      await expect(popup).toHaveURL(/^http:\/\/127\.0\.0\.1:5174\//);
      await expect
        .poll(
          () => popup.evaluate(() => localStorage.getItem('access_token')),
          { message: 'expected AdminLogin.vue to store access_token in the popup after redeeming it' },
        )
        .toBeTruthy();
    });
  });
});

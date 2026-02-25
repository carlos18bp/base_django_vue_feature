import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';

jest.mock('@/services/http/client', () => ({
  default: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@/views/auth/SignUp.vue', () => ({ default: { template: '<div />' } }));
jest.mock('@/views/Backoffice.vue', () => ({ default: { template: '<div />' } }));
jest.mock('@/views/blog/Detail.vue', () => ({ default: { template: '<div />' } }));
jest.mock('@/views/blog/List.vue', () => ({ default: { template: '<div />' } }));
jest.mock('@/views/product/Detail.vue', () => ({ default: { template: '<div />' } }));
jest.mock('@/views/product/Catalog.vue', () => ({ default: { template: '<div />' } }));
jest.mock('@/views/product/Checkout.vue', () => ({ default: { template: '<div />' } }));
jest.mock('@/views/AboutUs.vue', () => ({ default: { template: '<div />' } }));
jest.mock('@/views/Contact.vue', () => ({ default: { template: '<div />' } }));
jest.mock('@/views/NotFound.vue', () => ({ default: { template: '<div />' } }));

jest.mock('@/services/http/tokens', () => ({
  getAccessToken: jest.fn(() => null),
  getRefreshToken: jest.fn(() => null),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

import { useAuthStore } from '@/stores/auth';
import { routes } from '@/router/index';

function buildRouter() {
  const router = createRouter({ history: createWebHashHistory(), routes });

  router.beforeEach((to) => {
    const authStore = useAuthStore();
    if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
      return { name: 'sign_in' };
    }
    if (to.meta?.requiresGuest && authStore.isAuthenticated) {
      return { name: 'dashboard' };
    }
    return true;
  });

  return router;
}

describe('Router — route definitions', () => {
  test('defines a home route at /', () => {
    const home = routes.find((r) => r.name === 'home');
    expect(home).toBeDefined();
    expect(home.path).toBe('/');
  });

  test('defines a sign_in route', () => {
    const route = routes.find((r) => r.name === 'sign_in');
    expect(route).toBeDefined();
    expect(route.path).toBe('/sign_in');
  });

  test('defines a sign_up route', () => {
    const route = routes.find((r) => r.name === 'sign_up');
    expect(route).toBeDefined();
    expect(route.path).toBe('/sign_up');
  });

  test('defines a dashboard route with requiresAuth', () => {
    const route = routes.find((r) => r.name === 'dashboard');
    expect(route).toBeDefined();
    expect(route.meta.requiresAuth).toBe(true);
  });

  test('defines a not_found catch-all route', () => {
    const route = routes.find((r) => r.name === 'not_found');
    expect(route).toBeDefined();
    expect(route.path).toBe('/:pathMatch(.*)*');
  });

  test('sign_in route has requiresGuest flag', () => {
    const route = routes.find((r) => r.name === 'sign_in');
    expect(route.meta.requiresGuest).toBe(true);
  });

  test('sign_up route has requiresGuest flag', () => {
    const route = routes.find((r) => r.name === 'sign_up');
    expect(route.meta.requiresGuest).toBe(true);
  });

  test('backoffice route requires authentication', () => {
    const route = routes.find((r) => r.name === 'backoffice');
    expect(route.meta.requiresAuth).toBe(true);
  });
});

describe('Router — beforeEach guard (unauthenticated user)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  test('redirects to sign_in when accessing a requiresAuth route without a token', async () => {
    const router = buildRouter();
    const authStore = useAuthStore();
    authStore.token = null;
    authStore.user = null;

    await router.push('/dashboard');

    expect(router.currentRoute.value.name).toBe('sign_in');
  });

  test('allows access to public route without authentication', async () => {
    const router = buildRouter();
    const authStore = useAuthStore();
    authStore.token = null;
    authStore.user = null;

    await router.push('/');

    expect(router.currentRoute.value.name).toBe('home');
  });
});

describe('Router — beforeEach guard (authenticated user)', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
  });

  test('redirects authenticated user away from requiresGuest route to dashboard', async () => {
    const router = buildRouter();
    const authStore = useAuthStore();
    authStore.token = 'mock-token';
    authStore.user = { id: 1, email: 'user@example.com' };

    await router.push('/sign_in');

    expect(router.currentRoute.value.name).toBe('dashboard');
  });

  test('allows authenticated user to access requiresAuth route', async () => {
    const router = buildRouter();
    const authStore = useAuthStore();
    authStore.token = 'mock-token';
    authStore.user = { id: 1, email: 'user@example.com' };

    await router.push('/dashboard');

    expect(router.currentRoute.value.name).toBe('dashboard');
  });
});

describe('Router — scrollBehavior', () => {
  let behavior;

  beforeAll(() => {
    const actualRouter = require('@/router/index').default;
    behavior = actualRouter.options.scrollBehavior;
  });

  test('returns savedPosition when it is provided', () => {
    const savedPosition = { left: 0, top: 200 };
    const result = behavior({}, {}, savedPosition);
    expect(result).toEqual(savedPosition);
  });

  test('returns top 0 with smooth behavior when no savedPosition', () => {
    const result = behavior({}, {}, null);
    expect(result).toEqual({ top: 0, behavior: 'smooth' });
  });
});

describe('Router — beforeEach guard (actual router)', () => {
  let actualRouter;

  beforeEach(async () => {
    setActivePinia(createPinia());
    localStorage.clear();
    actualRouter = require('@/router/index').default;
    await actualRouter.push('/').catch(() => {});
  });

  test('actual router redirects unauthenticated user from requiresAuth route to sign_in', async () => {
    const authStore = useAuthStore();
    authStore.token = null;
    authStore.user = null;

    await actualRouter.push('/dashboard');

    expect(actualRouter.currentRoute.value.name).toBe('sign_in');
  });

  test('actual router redirects authenticated user from requiresGuest route to dashboard', async () => {
    const authStore = useAuthStore();
    authStore.token = 'mock-token';
    authStore.user = { id: 1 };

    await actualRouter.push('/sign_up');

    expect(actualRouter.currentRoute.value.name).toBe('dashboard');
  });
});


describe('Router — lazy route component factories', () => {
  it.each([
    ['sign_up', 'sign_up'],
    ['backoffice', 'backoffice'],
    ['blog', 'blog'],
    ['blogs', 'blogs'],
    ['product', 'product'],
    ['catalog', 'catalog'],
    ['checkout', 'checkout'],
    ['about_us', 'about_us'],
    ['contact', 'contact'],
    ['not_found', 'not_found'],
  ])('component factory for %s route returns a Promise', async (_label, routeName) => {
    const route = routes.find((r) => r.name === routeName);
    const result = route.component();
    expect(result).toBeInstanceOf(Promise);
    await result;
  });
});

describe('Router — afterEach document title', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    document.title = '';
  });

  test('sets document title with route meta title and app name', async () => {
    const actualRouter = require('@/router/index').default;
    await actualRouter.push('/');
    expect(document.title).toContain('Home');
    expect(document.title).toContain('Base Feature');
  });

  test('sets document title to app name only when meta has no title', async () => {
    const { createRouter: _cr, createWebHashHistory } = require('vue-router');
    const APP_NAME = 'Base Feature';
    const testRouter = _cr({
      history: createWebHashHistory(),
      routes: [{ path: '/', name: 'home', component: { template: '<div />' }, meta: {} }],
    });
    testRouter.afterEach((to) => {
      const title = to.meta?.title;
      document.title = title ? `${title} — ${APP_NAME}` : APP_NAME;
    });
    await testRouter.push('/');
    expect(document.title).toBe('Base Feature');
  });

  test('actual router sets document title to app name when route has no title meta', async () => {
    const actualRouter = require('@/router/index').default;
    actualRouter.addRoute({ path: '/no-title-test', name: 'no_title_test', component: { template: '<div />' }, meta: {} });
    await actualRouter.push('/no-title-test');
    expect(document.title).toBe('Base Feature');
  });
});

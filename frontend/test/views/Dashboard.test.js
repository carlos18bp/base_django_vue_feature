import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';

jest.mock('@/services/http/client', () => ({
  default: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@/services/http/tokens', () => ({
  getAccessToken: jest.fn(() => null),
  getRefreshToken: jest.fn(() => null),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

import { createI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/auth';
import Dashboard from '@/views/Dashboard.vue';

const i18n = createI18n({ legacy: false, locale: 'en', messages: { en: { auth: { sign_out: 'Sign out' } } } });

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
      { path: '/sign_in', name: 'sign_in', component: { template: '<div />' } },
      { path: '/backoffice', name: 'backoffice', component: { template: '<div />' } },
    ],
  });
}

describe('Dashboard View', () => {
  let router;

  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
    router = buildRouter();
  });

  test('renders Dashboard heading', () => {
    const wrapper = mount(Dashboard, {
      global: {
        plugins: [router, i18n],
        stubs: { RouterLink: { template: '<a><slot /></a>' } },
      },
    });
    expect(wrapper.find('h1').text()).toBe('Dashboard');
  });

  test('signOut button calls authStore.signOut', async () => {
    const wrapper = mount(Dashboard, {
      global: {
        plugins: [router, i18n],
        stubs: { RouterLink: { template: '<a><slot /></a>' } },
      },
    });
    const authStore = useAuthStore();
    const signOutSpy = jest.spyOn(authStore, 'signOut');

    await wrapper.find('button').trigger('click');

    expect(signOutSpy).toHaveBeenCalled();
  });

  test('signOut button navigates to sign_in route', async () => {
    router.push('/dashboard');
    await router.isReady();

    const wrapper = mount(Dashboard, {
      global: {
        plugins: [router, i18n],
        stubs: { RouterLink: { template: '<a><slot /></a>' } },
      },
    });

    await wrapper.find('button').trigger('click');
    await flushPromises();

    expect(router.currentRoute.value.name).toBe('sign_in');
  });
});

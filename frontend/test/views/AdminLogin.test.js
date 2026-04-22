import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';

jest.mock('@/services/http/tokens', () => ({
  getAccessToken: jest.fn(() => null),
  getRefreshToken: jest.fn(() => null),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

const replace = jest.fn();
const mockRoute = { query: {} };
const restoreSession = jest.fn().mockResolvedValue(true);

jest.mock('vue-router', () => ({
  useRoute: () => mockRoute,
  useRouter: () => ({ replace }),
}));

jest.mock('@/stores/auth', () => ({
  useAuthStore: () => ({
    restoreSession,
  }),
}));

import { setTokens } from '@/services/http/tokens';
import AdminLogin from '@/views/auth/AdminLogin.vue';

describe('AdminLogin View', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
    mockRoute.query = {};
  });

  test('stores tokens, restores session, and redirects to a safe target', async () => {
    mockRoute.query = {
      access: 'a',
      refresh: 'r',
      redirect: '/dashboard',
    };

    mount(AdminLogin);
    await flushPromises();

    expect(setTokens).toHaveBeenCalledWith({ access: 'a', refresh: 'r' });
    expect(restoreSession).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith('/dashboard');
  });

  test('redirects to sign_in when tokens are missing', async () => {
    mockRoute.query = { redirect: '/dashboard' };

    mount(AdminLogin);
    await flushPromises();

    expect(setTokens).not.toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith({ name: 'sign_in' });
  });

  test.each([
    'https://evil.example.com',
    '//evil.example.com',
  ])('falls back to home for unsafe redirect %s', async (redirect) => {
    mockRoute.query = {
      access: 'a',
      refresh: 'r',
      redirect,
    };

    mount(AdminLogin);
    await flushPromises();

    expect(replace).toHaveBeenCalledWith('/');
  });
});

import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';

jest.mock('@/services/http/client', () => ({
  post: jest.fn(),
}));

jest.mock('@/services/http/tokens', () => ({
  getAccessToken: jest.fn(() => null),
  getRefreshToken: jest.fn(() => null),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

jest.mock('@/helpers/googleLogin', () => ({
  loginWithGoogle: jest.fn(),
}));

jest.mock('@/helpers/notification', () => ({
  showNotification: jest.fn(),
}));

jest.mock('vue3-google-login', () => ({
  GoogleLogin: {
    name: 'GoogleLogin',
    props: ['callback', 'prompt'],
    template: '<button data-testid="google-login-btn" @click="callback({ credential: \'test\' })"></button>',
  },
}));

import api from '@/services/http/client';
import { loginWithGoogle } from '@/helpers/googleLogin';
import { showNotification } from '@/helpers/notification';
import { useAuthStore } from '@/stores/auth';
import SignIn from '@/views/auth/SignIn.vue';

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/sign_in', name: 'sign_in', component: { template: '<div />' } },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
    ],
  });
}

function mountSignIn(router, authStoreOverrides = {}) {
  const authStore = useAuthStore();
  Object.assign(authStore, authStoreOverrides);

  return mount(SignIn, {
    global: {
      plugins: [router],
      stubs: { RouterLink: { template: '<a><slot /></a>' } },
    },
  });
}

describe('SignIn View', () => {
  let router;

  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
    router = buildRouter();
    delete window.location;
    window.location = { href: '' };
  });

  test('renders welcome heading', () => {
    const wrapper = mountSignIn(router);
    expect(wrapper.text()).toContain('Welcome back');
  });

  test('renders email and password inputs', () => {
    const wrapper = mountSignIn(router);
    expect(wrapper.find('input[type="email"]').exists()).toBe(true);
    expect(wrapper.find('input[type="password"]').exists()).toBe(true);
  });

  test('onMounted redirects to dashboard when already authenticated', async () => {
    router.push('/sign_in');
    await router.isReady();
    const pushSpy = jest.spyOn(router, 'push');

    mountSignIn(router, { token: 'abc', user: { id: 1 } });
    await flushPromises();

    expect(pushSpy).toHaveBeenCalledWith('/dashboard');
  });

  test('onMounted does not redirect when not authenticated', async () => {
    router.push('/sign_in');
    await router.isReady();
    const pushSpy = jest.spyOn(router, 'push');

    mountSignIn(router, { token: null, user: null });
    await flushPromises();

    expect(pushSpy).not.toHaveBeenCalled();
  });

  test('handleSignIn shows warning when email is empty', async () => {
    const wrapper = mountSignIn(router);
    await wrapper.find('input[type="password"]').setValue('secret');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(showNotification).toHaveBeenCalledWith('Email and password are required', 'warning');
    expect(api.post).not.toHaveBeenCalled();
  });

  test('handleSignIn shows warning when password is empty', async () => {
    const wrapper = mountSignIn(router);
    await wrapper.find('input[type="email"]').setValue('user@example.com');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(showNotification).toHaveBeenCalledWith('Email and password are required', 'warning');
    expect(api.post).not.toHaveBeenCalled();
  });

  test('handleSignIn calls api.post and redirects on successful login', async () => {
    const responseData = { access: 'token', user: { id: 1 } };
    api.post.mockResolvedValue({ data: responseData });

    const wrapper = mountSignIn(router);
    await wrapper.find('input[type="email"]').setValue('user@example.com');
    await wrapper.find('input[type="password"]').setValue('secret');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(api.post).toHaveBeenCalledWith('sign_in/', {
      email: 'user@example.com',
      password: 'secret',
    });
    expect(showNotification).toHaveBeenCalledWith('Sign in successful!', 'success');
    expect(window.location.href).toBe('/dashboard');
  });

  test('handleSignIn shows invalid credentials notification on 401 error', async () => {
    api.post.mockRejectedValue({ response: { status: 401 } });

    const wrapper = mountSignIn(router);
    await wrapper.find('input[type="email"]').setValue('user@example.com');
    await wrapper.find('input[type="password"]').setValue('wrong');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(showNotification).toHaveBeenCalledWith('Invalid credentials', 'error');
  });

  test('handleSignIn shows generic error notification on non-401 error', async () => {
    api.post.mockRejectedValue({ response: { status: 500 } });

    const wrapper = mountSignIn(router);
    await wrapper.find('input[type="email"]').setValue('user@example.com');
    await wrapper.find('input[type="password"]').setValue('secret');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(showNotification).toHaveBeenCalledWith('Error signing in', 'error');
  });

  test('handleSignIn resets isLoading to false after error', async () => {
    api.post.mockRejectedValue({ response: { status: 500 } });

    const wrapper = mountSignIn(router);
    await wrapper.find('input[type="email"]').setValue('user@example.com');
    await wrapper.find('input[type="password"]').setValue('secret');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    const btn = wrapper.find('button[type="submit"]');
    expect(btn.attributes('disabled')).toBeUndefined();
  });

  test('submit button is disabled while loading', async () => {
    let resolvePost;
    api.post.mockReturnValue(new Promise((res) => { resolvePost = res; }));

    const wrapper = mountSignIn(router);
    await wrapper.find('input[type="email"]').setValue('user@example.com');
    await wrapper.find('input[type="password"]').setValue('secret');
    wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined();
    resolvePost({ data: {} });
  });

  test('handleSignIn does nothing when already loading', async () => {
    let resolvePost;
    api.post.mockReturnValue(new Promise((res) => { resolvePost = res; }));

    const wrapper = mountSignIn(router);
    await wrapper.find('input[type="email"]').setValue('user@example.com');
    await wrapper.find('input[type="password"]').setValue('secret');

    wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();
    wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(api.post).toHaveBeenCalledTimes(1);
    resolvePost({ data: {} });
  });

  test('submit button shows Signing in text while request is in flight', async () => {
    let resolvePost;
    api.post.mockReturnValue(new Promise((res) => { resolvePost = res; }));

    const wrapper = mountSignIn(router);
    await wrapper.find('input[type="email"]').setValue('user@example.com');
    await wrapper.find('input[type="password"]').setValue('secret');
    wrapper.find('form').trigger('submit');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('button[type="submit"]').text()).toContain('Signing in');
    resolvePost({ data: {} });
  });

  test('handleGoogleLogin delegates to loginWithGoogle helper', async () => {
    const wrapper = mountSignIn(router);
    await wrapper.find('[data-testid="google-login-btn"]').trigger('click');
    await flushPromises();

    expect(loginWithGoogle).toHaveBeenCalledWith(
      { credential: 'test' },
      router,
      expect.any(Object),
    );
  });

  test('hides Google login section when __E2E_DISABLE_GOOGLE_LOGIN__ is set', () => {
    window.__E2E_DISABLE_GOOGLE_LOGIN__ = true;
    const wrapper = mountSignIn(router);

    expect(wrapper.find('[data-testid="google-login-btn"]').exists()).toBe(false);

    delete window.__E2E_DISABLE_GOOGLE_LOGIN__;
  });
});

import { loginWithGoogle } from '@/helpers/googleLogin';

jest.mock('@/services/http/client', () => ({
  post: jest.fn(),
}));

jest.mock('@/helpers/notification', () => ({
  showNotification: jest.fn(),
}));

jest.mock('vue3-google-login', () => ({
  decodeCredential: jest.fn(),
}));

import api from '@/services/http/client';
import { showNotification } from '@/helpers/notification';
import { decodeCredential } from 'vue3-google-login';

describe('loginWithGoogle', () => {
  let mockRouter;
  let mockAuthStore;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRouter = { push: jest.fn().mockResolvedValue(undefined) };
    mockAuthStore = { login: jest.fn() };

    decodeCredential.mockReturnValue({
      email: 'user@example.com',
      given_name: 'John',
      family_name: 'Doe',
      picture: 'https://example.com/pic.jpg',
    });

    delete window.location;
    window.location = { href: '' };
  });

  test('shows error notification when credential is missing', async () => {
    await loginWithGoogle({}, mockRouter, mockAuthStore);
    expect(showNotification).toHaveBeenCalledWith('Google login failed', 'error');
    expect(api.post).not.toHaveBeenCalled();
  });

  test('shows error notification when response is null', async () => {
    await loginWithGoogle(null, mockRouter, mockAuthStore);
    expect(showNotification).toHaveBeenCalledWith('Google login failed', 'error');
  });

  test('calls api.post with decoded credential data on valid response', async () => {
    api.post.mockResolvedValue({ data: { created: false } });
    await loginWithGoogle({ credential: 'valid-token' }, mockRouter, mockAuthStore);
    expect(api.post).toHaveBeenCalledWith('google_login/', {
      credential: 'valid-token',
      email: 'user@example.com',
      given_name: 'John',
      family_name: 'Doe',
      picture: 'https://example.com/pic.jpg',
    });
  });

  test('calls authStore.login with API response data on success', async () => {
    const responseData = { created: false, access: 'token', user: { email: 'user@example.com' } };
    api.post.mockResolvedValue({ data: responseData });
    await loginWithGoogle({ credential: 'valid-token' }, mockRouter, mockAuthStore);
    expect(mockAuthStore.login).toHaveBeenCalledWith(responseData);
  });

  test('shows registration success notification when user was created', async () => {
    api.post.mockResolvedValue({ data: { created: true } });
    await loginWithGoogle({ credential: 'valid-token' }, mockRouter, mockAuthStore);
    expect(showNotification).toHaveBeenCalledWith('Registration successful!', 'success');
  });

  test('shows sign in success notification when user already existed', async () => {
    api.post.mockResolvedValue({ data: { created: false } });
    await loginWithGoogle({ credential: 'valid-token' }, mockRouter, mockAuthStore);
    expect(showNotification).toHaveBeenCalledWith('Sign in successful!', 'success');
  });

  test('redirects to dashboard on successful login', async () => {
    api.post.mockResolvedValue({ data: { created: false } });
    await loginWithGoogle({ credential: 'valid-token' }, mockRouter, mockAuthStore);
    expect(window.location.href).toBe('/dashboard');
  });

  test('shows error notification with API error message on failure', async () => {
    api.post.mockRejectedValue({ response: { data: { error: 'Invalid token' } } });
    await loginWithGoogle({ credential: 'valid-token' }, mockRouter, mockAuthStore);
    expect(showNotification).toHaveBeenCalledWith('Invalid token', 'error');
  });

  test('shows generic error notification when API response has no error field', async () => {
    api.post.mockRejectedValue(new Error('Network error'));
    await loginWithGoogle({ credential: 'valid-token' }, mockRouter, mockAuthStore);
    expect(showNotification).toHaveBeenCalledWith(
      expect.stringContaining('error'),
      'error',
    );
  });

  test('shows detail field from response data when error field is absent', async () => {
    api.post.mockRejectedValue({ response: { data: { detail: 'Token expired' } } });
    await loginWithGoogle({ credential: 'valid-token' }, mockRouter, mockAuthStore);
    expect(showNotification).toHaveBeenCalledWith('Token expired', 'error');
  });

  test('shows response data directly when it is a plain string', async () => {
    api.post.mockRejectedValue({ response: { data: 'Unauthorized' } });
    await loginWithGoogle({ credential: 'valid-token' }, mockRouter, mockAuthStore);
    expect(showNotification).toHaveBeenCalledWith('Unauthorized', 'error');
  });

  test('shows error message property when response has no data', async () => {
    api.post.mockRejectedValue({ message: 'Request failed' });
    await loginWithGoogle({ credential: 'valid-token' }, mockRouter, mockAuthStore);
    expect(showNotification).toHaveBeenCalledWith('Request failed', 'error');
  });

  test('uses error message when response data is object with neither error nor detail', async () => {
    api.post.mockRejectedValue({ response: { data: { status: 'fail' } }, message: 'Fallback message' });
    await loginWithGoogle({ credential: 'valid-token' }, mockRouter, mockAuthStore);
    expect(showNotification).toHaveBeenCalledWith('Fallback message', 'error');
  });

  test('shows generic message when all error fields are absent', async () => {
    api.post.mockRejectedValue({ response: { data: null } });
    await loginWithGoogle({ credential: 'valid-token' }, mockRouter, mockAuthStore);
    expect(showNotification).toHaveBeenCalledWith('Error during Google authentication', 'error');
  });
});

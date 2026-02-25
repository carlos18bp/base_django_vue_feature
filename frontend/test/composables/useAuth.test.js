import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useAuth } from '@/composables/useAuth';

jest.mock('vue-router', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/stores/auth', () => ({
  useAuthStore: jest.fn(),
}));

describe('useAuth', () => {
  let mockPush;
  let mockAuthStore;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPush = jest.fn().mockResolvedValue(undefined);
    mockAuthStore = {
      isAuthenticated: false,
      user: null,
      logout: jest.fn(),
    };
    useRouter.mockReturnValue({ push: mockPush });
    useAuthStore.mockReturnValue(mockAuthStore);
  });

  test('isAuthenticated reflects false when store has isAuthenticated=false', () => {
    mockAuthStore.isAuthenticated = false;
    const { isAuthenticated } = useAuth();
    expect(isAuthenticated.value).toBe(false);
  });

  test('isAuthenticated reflects true when store has isAuthenticated=true', () => {
    mockAuthStore.isAuthenticated = true;
    const { isAuthenticated } = useAuth();
    expect(isAuthenticated.value).toBe(true);
  });

  test('user reflects null when store has no user', () => {
    mockAuthStore.user = null;
    const { user } = useAuth();
    expect(user.value).toBeNull();
  });

  test('user reflects the store user when authenticated', () => {
    const testUser = { email: 'test@example.com', first_name: 'Test' };
    mockAuthStore.user = testUser;
    const { user } = useAuth();
    expect(user.value).toEqual(testUser);
  });

  test('logout calls authStore.logout', async () => {
    const { logout } = useAuth();
    await logout();
    expect(mockAuthStore.logout).toHaveBeenCalledTimes(1);
  });

  test('logout redirects to sign_in route', async () => {
    const { logout } = useAuth();
    await logout();
    expect(mockPush).toHaveBeenCalledWith({ name: 'sign_in' });
  });

  test('logout calls store logout before router push', async () => {
    const callOrder = [];
    mockAuthStore.logout.mockImplementation(() => callOrder.push('logout'));
    mockPush.mockImplementation(() => {
      callOrder.push('push');
      return Promise.resolve();
    });

    const { logout } = useAuth();
    await logout();

    expect(callOrder).toEqual(['logout', 'push']);
  });
});

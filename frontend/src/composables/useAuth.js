import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

/**
 * Composable that exposes authentication helpers.
 *
 * @returns {{ isAuthenticated: ComputedRef<boolean>, user: ComputedRef<object|null>, logout: Function }}
 */
export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  const isAuthenticated = computed(() => authStore.isAuthenticated);
  const user = computed(() => authStore.user);

  /**
   * Log out the current user and redirect to the sign-in page.
   */
  async function logout() {
    authStore.logout();
    await router.push({ name: 'sign_in' });
  }

  return { isAuthenticated, user, logout };
}

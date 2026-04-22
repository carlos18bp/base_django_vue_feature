<template>
  <div class="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gray-50 text-gray-600">
    Signing in...
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { setTokens } from '@/services/http/tokens';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

function safeRedirectTarget(value) {
  if (!value || typeof value !== 'string') return '/';
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  return value;
}

onMounted(async () => {
  const access = typeof route.query.access === 'string' ? route.query.access : null;
  const refresh = typeof route.query.refresh === 'string' ? route.query.refresh : null;

  if (!access || !refresh) {
    await router.replace({ name: 'sign_in' });
    return;
  }

  const redirect = safeRedirectTarget(
    typeof route.query.redirect === 'string' ? route.query.redirect : null
  );

  setTokens({ access, refresh });
  await authStore.restoreSession();
  await router.replace(redirect);
});
</script>

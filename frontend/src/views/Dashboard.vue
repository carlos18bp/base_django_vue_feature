<template>
  <div class="max-w-3xl mx-auto mt-10">
    <h1 class="text-2xl font-semibold mb-4">Dashboard</h1>
    <p class="mb-4">This route is protected by a router guard (JWT required).</p>

    <div class="flex flex-wrap gap-3 mb-4">
      <RouterLink class="inline-block border border-black rounded px-3 py-2" :to="{ name: 'backoffice' }">
        Backoffice
      </RouterLink>

      <button class="bg-black text-white rounded px-3 py-2" @click="signOut">{{ $t('auth.sign_out') }}</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const signOut = () => {
  authStore.signOut();
  router.replace({ name: 'sign_in' });
};
</script>

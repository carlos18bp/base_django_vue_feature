<template>
  <div class="max-w-6xl mx-auto px-6 py-10">
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Backoffice</h1>
      <RouterLink class="border border-black rounded px-3 py-2" :to="{ name: 'dashboard' }">Dashboard</RouterLink>
    </div>

    <p class="text-gray-600 mt-2">
      Protected view (JWT). Users and Sales endpoints require staff permissions.
    </p>

    <p v-if="error" class="mt-4 text-red-600">{{ error }}</p>

    <section class="mt-10">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Users</h2>
        <button class="border border-black rounded px-3 py-2" @click="fetchUsers" :disabled="loadingUsers">
          {{ loadingUsers ? 'Loading...' : 'Refresh' }}
        </button>
      </div>

      <div class="mt-4 overflow-x-auto border rounded">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3">Email</th>
              <th class="text-left px-4 py-3">Role</th>
              <th class="text-left px-4 py-3">Staff</th>
              <th class="text-left px-4 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id" class="border-t">
              <td class="px-4 py-3">{{ u.email }}</td>
              <td class="px-4 py-3">{{ u.role }}</td>
              <td class="px-4 py-3">{{ u.is_staff ? 'yes' : 'no' }}</td>
              <td class="px-4 py-3">{{ u.is_active ? 'yes' : 'no' }}</td>
            </tr>
            <tr v-if="!users.length" class="border-t">
              <td class="px-4 py-3" colspan="4">No data</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="mt-12">
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-semibold">Sales</h2>
        <button class="border border-black rounded px-3 py-2" @click="fetchSales" :disabled="loadingSales">
          {{ loadingSales ? 'Loading...' : 'Refresh' }}
        </button>
      </div>

      <div class="mt-4 overflow-x-auto border rounded">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="text-left px-4 py-3">Id</th>
              <th class="text-left px-4 py-3">Email</th>
              <th class="text-left px-4 py-3">City</th>
              <th class="text-left px-4 py-3">State</th>
              <th class="text-left px-4 py-3">Postal</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in sales" :key="s.id" class="border-t">
              <td class="px-4 py-3">{{ s.id }}</td>
              <td class="px-4 py-3">{{ s.email }}</td>
              <td class="px-4 py-3">{{ s.city }}</td>
              <td class="px-4 py-3">{{ s.state }}</td>
              <td class="px-4 py-3">{{ s.postal_code }}</td>
            </tr>
            <tr v-if="!sales.length" class="border-t">
              <td class="px-4 py-3" colspan="5">No data</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

import api from '@/services/http/client';

const users = ref([]);
const sales = ref([]);

const loadingUsers = ref(false);
const loadingSales = ref(false);
const error = ref('');

const fetchUsers = async () => {
  loadingUsers.value = true;
  error.value = '';
  try {
    const response = await api.get('users/');
    users.value = Array.isArray(response.data) ? response.data : [];
  } catch (e) {
    error.value = 'Could not load backoffice data. Make sure you are signed in with a staff user.';
  } finally {
    loadingUsers.value = false;
  }
};

const fetchSales = async () => {
  loadingSales.value = true;
  error.value = '';
  try {
    const response = await api.get('sales/');
    sales.value = Array.isArray(response.data) ? response.data : [];
  } catch (e) {
    error.value = 'Could not load backoffice data. Make sure you are signed in with a staff user.';
  } finally {
    loadingSales.value = false;
  }
};

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchSales()]);
});
</script>

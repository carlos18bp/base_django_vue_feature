<template>
  <div class="flex flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50 min-h-[calc(100vh-64px)]">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-10 text-center text-3xl font-bold tracking-tight text-gray-900">
        Create your account
      </h2>
      <p class="mt-2 text-center text-sm text-gray-600">
        Already have an account?
        <router-link to="/sign_in" class="font-semibold text-indigo-600 hover:text-indigo-500">
          Sign in
        </router-link>
      </p>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white px-6 py-12 shadow sm:rounded-lg sm:px-12">
        <form class="space-y-6" @submit.prevent="handleSignUp">
          <!-- First Name -->
          <div>
            <label for="firstName" class="block text-sm font-medium leading-6 text-gray-900">
              First Name
            </label>
            <div class="mt-2">
              <input
                id="firstName"
                v-model="userForm.firstName"
                name="firstName"
                type="text"
                required
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                placeholder="John"
              />
            </div>
          </div>

          <!-- Last Name -->
          <div>
            <label for="lastName" class="block text-sm font-medium leading-6 text-gray-900">
              Last Name
            </label>
            <div class="mt-2">
              <input
                id="lastName"
                v-model="userForm.lastName"
                name="lastName"
                type="text"
                required
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                placeholder="Doe"
              />
            </div>
          </div>

          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium leading-6 text-gray-900">
              Email address
            </label>
            <div class="mt-2">
              <input
                id="email"
                v-model="userForm.email"
                name="email"
                type="email"
                autocomplete="email"
                required
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium leading-6 text-gray-900">
              Password
            </label>
            <div class="mt-2">
              <input
                id="password"
                v-model="userForm.password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                placeholder="••••••••"
              />
            </div>
            <p class="mt-1 text-xs text-gray-500">Minimum 8 characters</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium leading-6 text-gray-900">
              Confirm Password
            </label>
            <div class="mt-2">
              <input
                id="confirmPassword"
                v-model="userForm.confirmPassword"
                name="confirmPassword"
                type="password"
                autocomplete="new-password"
                required
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 px-3"
                placeholder="••••••••"
              />
            </div>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Creating account...' : 'Sign up' }}
            </button>
          </div>
        </form>

        <template v-if="isGoogleLoginEnabled">
          <!-- Divider -->
          <div class="relative mt-10">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-gray-200" />
            </div>
            <div class="relative flex justify-center text-sm font-medium leading-6">
              <span class="bg-white px-6 text-gray-900">Or continue with</span>
            </div>
          </div>

          <!-- Google Sign In Button -->
          <div class="mt-6 flex justify-center">
            <GoogleLogin
              :callback="handleGoogleLogin"
              prompt
            />
          </div>
        </template>

        <!-- Terms and Privacy -->
        <p class="mt-10 text-center text-xs leading-5 text-gray-500">
          By signing up, you agree to our
          <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Terms of Service</a>
          and
          <a href="#" class="font-semibold text-indigo-600 hover:text-indigo-500">Privacy Policy</a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '@/services/http/client';
import { GoogleLogin } from 'vue3-google-login';
import { useAuthStore } from '@/stores/auth';
import { loginWithGoogle } from '@/helpers/googleLogin';
import { showNotification } from '@/helpers/notification';

const router = useRouter();
const authStore = useAuthStore();
const isLoading = ref(false);

const userForm = reactive({
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
});

const isGoogleLoginEnabled =
  typeof window === 'undefined' || window.__E2E_DISABLE_GOOGLE_LOGIN__ !== true;

onMounted(async () => {
  // Redirect if already authenticated
  if (authStore.token && authStore.user?.id) {
    router.push('/dashboard');
  }
});

/**
 * Handles user sign up with email and password
 */
const handleSignUp = async () => {
  // Validation
  if (!userForm.firstName || !userForm.lastName || !userForm.email || !userForm.password) {
    showNotification('All fields are required', 'warning');
    return;
  }

  if (userForm.password.length < 8) {
    showNotification('Password must be at least 8 characters', 'warning');
    return;
  }

  if (userForm.password !== userForm.confirmPassword) {
    showNotification('Passwords do not match', 'warning');
    return;
  }

  if (isLoading.value) return;

  isLoading.value = true;

  try {
    const response = await api.post('sign_up/', {
      email: userForm.email,
      password: userForm.password,
      first_name: userForm.firstName,
      last_name: userForm.lastName,
    });

    authStore.login(response.data);
    showNotification('Account created successfully!', 'success');
    
    // Reload page to ensure clean state
    window.location.href = '/dashboard';
  } catch (error) {
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.detail ||
      (typeof error?.response?.data === 'string' ? error.response.data : null) ||
      error?.message ||
      'Error creating account';
    showNotification(message, 'error');
  } finally {
    isLoading.value = false;
  }
};

/**
 * Handles Google login
 */
const handleGoogleLogin = (response) => {
  loginWithGoogle(response, router, authStore);
};
</script>

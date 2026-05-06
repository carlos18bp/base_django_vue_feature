<template>
  <div class="flex flex-col justify-center px-6 py-12 lg:px-8 bg-muted min-h-[calc(100vh-64px)]">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <h2 class="mt-10 text-center text-3xl font-bold tracking-tight text-foreground">
        Welcome back
      </h2>
      <p class="mt-2 text-center text-sm text-muted-foreground">
        Don't have an account?
        <router-link to="/sign_up" class="font-semibold text-primary hover:text-primary/90">
          Sign up
        </router-link>
      </p>
    </div>

    <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-card text-card-foreground px-6 py-12 shadow sm:rounded-lg sm:px-12">
        <form class="space-y-6" @submit.prevent="handleSignIn">
          <!-- Email -->
          <div>
            <label for="email" class="block text-sm font-medium leading-6 text-foreground">
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
                class="block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6 px-3"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium leading-6 text-foreground">
                Password
              </label>
              <div class="text-sm">
                <a href="#" class="font-semibold text-primary hover:text-primary/90">
                  Forgot password?
                </a>
              </div>
            </div>
            <div class="mt-2">
              <input
                id="password"
                v-model="userForm.password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                class="block w-full rounded-md border-0 py-1.5 text-foreground bg-background shadow-sm ring-1 ring-inset ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-ring sm:text-sm sm:leading-6 px-3"
                placeholder="••••••••"
              />
            </div>
          </div>

          <!-- reCAPTCHA -->
          <div v-if="siteKey" class="flex justify-center">
            <div ref="recaptchaContainer" />
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isLoading ? 'Signing in...' : 'Sign in' }}
            </button>
          </div>
        </form>

        <template v-if="isGoogleLoginEnabled">
          <!-- Divider -->
          <div class="relative mt-10">
            <div class="absolute inset-0 flex items-center" aria-hidden="true">
              <div class="w-full border-t border-border" />
            </div>
            <div class="relative flex justify-center text-sm font-medium leading-6">
              <span class="bg-card px-6 text-foreground">Or continue with</span>
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
        <p class="mt-10 text-center text-xs leading-5 text-muted-foreground">
          By signing in, you agree to our
          <a href="#" class="font-semibold text-primary hover:text-primary/90">Terms of Service</a>
          and
          <a href="#" class="font-semibold text-primary hover:text-primary/90">Privacy Policy</a>
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

const siteKey = ref('');
const captchaToken = ref(null);
const recaptchaContainer = ref(null);
const recaptchaWidgetId = ref(null);

const renderRecaptcha = () => {
  if (recaptchaContainer.value && siteKey.value && window.grecaptcha) {
    recaptchaWidgetId.value = window.grecaptcha.render(recaptchaContainer.value, {
      sitekey: siteKey.value,
      callback: (token) => { captchaToken.value = token; },
      'expired-callback': () => { captchaToken.value = null; },
    });
  }
};

const userForm = reactive({
  email: '',
  password: '',
});

const isGoogleLoginEnabled =
  typeof window === 'undefined' || window.__E2E_DISABLE_GOOGLE_LOGIN__ !== true;

onMounted(async () => {
  // Redirect if already authenticated
  if (authStore.token && authStore.user?.id) {
    router.push('/dashboard');
  }

  // Fetch reCAPTCHA site key
  try {
    const res = await api.get('google-captcha/site-key/');
    siteKey.value = res.data.site_key || '';
  } catch {
    // Captcha key not available — continue without captcha
  }

  if (!siteKey.value) return;

  if (window.grecaptcha?.render) {
    renderRecaptcha();
  } else {
    const cbName = `__recaptchaLoad_signin`;
    window[cbName] = () => { renderRecaptcha(); delete window[cbName]; };
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=explicit&onload=${cbName}`;
    script.async = true;
    document.head.appendChild(script);
  }
});

/**
 * Handles user sign in with email and password
 */
const handleSignIn = async () => {
  if (!userForm.email || !userForm.password) {
    showNotification('Email and password are required', 'warning');
    return;
  }

  if (siteKey.value && !captchaToken.value) {
    showNotification('Please complete the captcha', 'warning');
    return;
  }

  if (isLoading.value) return;

  isLoading.value = true;

  try {
    const response = await api.post('sign_in/', {
      email: userForm.email,
      password: userForm.password,
      captcha_token: captchaToken.value,
    });

    authStore.login(response.data);
    showNotification('Sign in successful!', 'success');
    
    // Reload page to ensure clean state
    window.location.href = '/dashboard';
  } catch (error) {
    if (error.response?.status === 401) {
      showNotification('Invalid credentials', 'error');
    } else {
      showNotification('Error signing in', 'error');
    }
    if (recaptchaWidgetId.value !== null) window.grecaptcha?.reset(recaptchaWidgetId.value);
    captchaToken.value = null;
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
/* istanbul ignore next */
</script>

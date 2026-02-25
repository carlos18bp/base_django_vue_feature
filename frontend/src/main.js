import './style.css'; // Import global CSS styles
import App from './App.vue'; // Import the main App component
import router from './router'; // Import the router configuration
import { createApp } from 'vue'; // Import createApp from Vue
import { createPinia } from 'pinia'; // Import createPinia for state management
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import 'bootstrap-icons/font/bootstrap-icons.css'; // Import bootstrap icons
import globalMixin from '@/mixins/globalMixin';
import i18n from '@/i18n';
import vue3GoogleLogin from 'vue3-google-login';

const initializeApp = () => {
  const app = createApp(App); // Create a new Vue application instance

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const envDisableGoogleLogin = ['1', 'true', 'yes'].includes(
    String(import.meta.env.VITE_E2E_DISABLE_GOOGLE_LOGIN || '').toLowerCase(),
  );
  const preconfiguredDisableGoogleLogin =
    typeof window !== 'undefined' && window.__E2E_DISABLE_GOOGLE_LOGIN__ === true;
  const disableGoogleLogin = envDisableGoogleLogin || preconfiguredDisableGoogleLogin;
  window.__GOOGLE_CLIENT_ID__ = googleClientId;
  window.__E2E_DISABLE_GOOGLE_LOGIN__ = disableGoogleLogin;

  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);

  if (!disableGoogleLogin) {
    app.use(vue3GoogleLogin, {
      clientId: googleClientId,
      autoLogin: false,
    });
  }

  app.use(pinia); // Use Pinia for state management in the app
  app.use(router); // Use the router instance in the app
  app.use(i18n);

  app.mixin(globalMixin);

  app.config.errorHandler = (err, instance, info) => {
    console.error('[Vue error]', err, info);
  };

  window.addEventListener('unhandledrejection', (event) => {
    console.error('[Unhandled promise rejection]', event.reason);
  });

  app.mount('#app'); // Mount the Vue app to the DOM element with id 'app'
};

// Initialize and configure the app
initializeApp();

import { createI18n } from 'vue-i18n';

const messages = {
  en: {
    common: {
      app_name: 'Base Feature',
    },
    auth: {
      sign_in: 'Sign in',
      sign_out: 'Sign out',
    },
  },
  es: {
    common: {
      app_name: 'Base Feature',
    },
    auth: {
      sign_in: 'Iniciar sesión',
      sign_out: 'Cerrar sesión',
    },
  },
};

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  messages,
});

export default i18n;

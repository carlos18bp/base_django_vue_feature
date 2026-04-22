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
    manual: {
      navLabel: 'Manual',
      eyebrow: 'Step-by-step guide',
      title: 'Interactive manual',
      subtitle: 'Walk through the main flows of this app.',
      search: {
        placeholder: 'Search the manual...',
        clear: 'Clear search',
        noResults: 'No matches found.',
      },
      sidebar: {
        title: 'Index',
      },
      card: {
        why: 'Why it matters',
        steps: 'How it works',
        route: 'Where to find it',
        tips: 'Tips',
      },
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
    manual: {
      navLabel: 'Manual',
      eyebrow: 'Guía paso a paso',
      title: 'Manual interactivo',
      subtitle: 'Recorre los flujos principales de la aplicación.',
      search: {
        placeholder: 'Buscar en el manual...',
        clear: 'Limpiar búsqueda',
        noResults: 'Sin resultados.',
      },
      sidebar: {
        title: 'Índice',
      },
      card: {
        why: '¿Por qué importa?',
        steps: '¿Cómo funciona?',
        route: 'Dónde encontrarlo',
        tips: 'Tips útiles',
      },
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

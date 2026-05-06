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
    staging: {
      banner: {
        daysRemainingOne: 'remains',
        daysRemainingMany: 'remain',
        dayOne: 'day',
        dayMany: 'days',
        forReview: 'for your review',
      },
      expired: {
        title: 'The {phase} has ended',
        body: 'Thank you for reviewing the project. The review window has closed.',
        cta: 'To continue with the next phase or coordinate adjustments, please contact the ProjectApp team:',
        whatsappLabel: 'WhatsApp',
        emailLabel: 'Email',
      },
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
    staging: {
      banner: {
        daysRemainingOne: 'queda',
        daysRemainingMany: 'quedan',
        dayOne: 'día',
        dayMany: 'días',
        forReview: 'para tu revisión',
      },
      expired: {
        title: 'La etapa de {phase} ha finalizado',
        body: 'Gracias por revisar el avance del proyecto. El plazo de revisión ha terminado.',
        cta: 'Para continuar con la siguiente fase o coordinar ajustes, por favor contacta al equipo de ProjectApp:',
        whatsappLabel: 'WhatsApp',
        emailLabel: 'Email',
      },
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

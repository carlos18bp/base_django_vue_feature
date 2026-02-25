import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import i18n from '@/i18n';

const SUPPORTED_LOCALES = ['en', 'es'];
const STORAGE_KEY = 'locale';

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref(
    localStorage.getItem(STORAGE_KEY) || i18n.global.locale.value || 'en'
  );

  /**
   * Returns the active locale code.
   * @returns {string}
   */
  const currentLocale = computed(() => locale.value);

  /**
   * Returns the list of supported locale codes.
   * @returns {string[]}
   */
  const supportedLocales = computed(() => SUPPORTED_LOCALES);

  /**
   * Switch the active locale, persist it, and sync vue-i18n.
   * @param {string} newLocale - Target locale code.
   */
  function setLocale(newLocale) {
    if (!SUPPORTED_LOCALES.includes(newLocale)) return;
    locale.value = newLocale;
    i18n.global.locale.value = newLocale;
    localStorage.setItem(STORAGE_KEY, newLocale);
    document.documentElement.setAttribute('lang', newLocale);
  }

  setLocale(locale.value);

  return { locale, currentLocale, supportedLocales, setLocale };
});

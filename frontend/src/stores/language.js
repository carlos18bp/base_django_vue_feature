import { ref, computed } from 'vue';
import { defineStore } from 'pinia';

export const useLanguageStore = defineStore("language", () => {
  const currentLanguage = ref('en');

  /**
   * Get the current language.
   * @returns {string} - Current language code.
   */
  const getCurrentLanguage = computed(() => currentLanguage.value);

  /**
   * Set the current language.
   * @param {string} language - Language code to set as current language.
   */
  function setCurrentLanguage(language) {
    currentLanguage.value = language;
  }

  return { currentLanguage, getCurrentLanguage, setCurrentLanguage };
});

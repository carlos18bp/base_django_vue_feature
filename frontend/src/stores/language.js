import { defineStore } from 'pinia';

export const useAppStore = defineStore({
  id: 'app',
  state: () => ({
    currentLanguage: 'en',
  }),

  actions: {
    /**
     * Set the current language.
     * @param {string} language - Language code to set as current language.
     */
    setCurrentLanguage(language) {
      this.currentLanguage = language;
    },
  },

  getters: {
    /**
     * Get the current language.
     * @returns {string} - Current language code.
     */
    getCurrentLanguage() {
      return this.currentLanguage;
    },
  },
});
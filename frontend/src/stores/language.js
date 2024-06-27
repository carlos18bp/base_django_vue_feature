import { defineStore } from 'pinia';

export const useLanguageStore = defineStore("language", {
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
    getCurrentLanguage: (state) => {
      return state.currentLanguage;
    },
  },
});

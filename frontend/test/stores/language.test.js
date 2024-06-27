import { setActivePinia, createPinia } from "pinia";
import { useLanguageStore } from "@/stores/language";

describe("Language Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  /**
   * This test ensures that the store initializes with the default state.
   * It checks that the currentLanguage is set to 'en'.
   */
  test("should initialize with default state", () => {
    const store = useLanguageStore();
    expect(store.currentLanguage).toBe("en");
  });

  /**
   * This test ensures the setCurrentLanguage action correctly updates the currentLanguage state.
   * It sets the language to 'es' and checks if the state is updated.
   */
  test("should set the current language", () => {
    const store = useLanguageStore();
    store.setCurrentLanguage("es");
    expect(store.currentLanguage).toBe("es");
  });

  /**
   * This test checks the getCurrentLanguage getter to ensure it returns the correct currentLanguage state.
   * It sets the language to 'en' and checks if the getter returns 'en'.
   */
  test("should get the current language", () => {
    const store = useLanguageStore();
    store.setCurrentLanguage("en");
    expect(store.getCurrentLanguage).toBe("en");
  });
});

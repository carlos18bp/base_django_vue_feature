import { setActivePinia, createPinia } from 'pinia';

jest.mock('@/i18n', () => ({
  __esModule: true,
  default: {
    global: {
      locale: { value: 'en' },
    },
  },
}));

import i18n from '@/i18n';
import { useI18nStore } from '@/stores/i18n';

describe('i18n Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    i18n.global.locale.value = 'en';
  });

  test('initializes with default locale en', () => {
    const store = useI18nStore();
    expect(store.currentLocale).toBe('en');
  });

  test('setLocale updates currentLocale', () => {
    const store = useI18nStore();
    store.setLocale('es');
    expect(store.currentLocale).toBe('es');
  });

  test('setLocale persists to localStorage', () => {
    const store = useI18nStore();
    store.setLocale('es');
    expect(localStorage.getItem('locale')).toBe('es');
  });

  test('setLocale ignores unsupported locales', () => {
    const store = useI18nStore();
    store.setLocale('fr');
    expect(store.currentLocale).toBe('en');
  });

  test('supportedLocales returns en and es', () => {
    const store = useI18nStore();
    expect(store.supportedLocales).toContain('en');
    expect(store.supportedLocales).toContain('es');
  });

  test('initializes from localStorage when a stored locale exists', () => {
    localStorage.setItem('locale', 'es');
    const store = useI18nStore();
    expect(store.currentLocale).toBe('es');
  });

  test('falls back to en when localStorage and i18n.global.locale are both empty', () => {
    localStorage.clear();
    i18n.global.locale.value = '';
    const store = useI18nStore();
    expect(store.currentLocale).toBe('en');
  });
});

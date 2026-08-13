import { setActivePinia, createPinia } from 'pinia';
import { useThemeStore } from '@/stores/theme';

describe('Theme Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // jsdom does not implement matchMedia. The store reads it eagerly at
    // construction time (`ref(getSystemPrefersDark())`), not only inside
    // init(), so useThemeStore() itself throws without this stub — even
    // though these tests never call init() or exercise 'system' mode.
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
  });

  afterEach(() => {
    // applyTheme() mutates the shared jsdom document directly (outside
    // Pinia state), so it must be reset independently of the store.
    document.documentElement.classList.remove('dark');
    delete window.matchMedia;
  });

  // Falla si applyTheme() deja de agregar la clase 'dark' al <html> cuando
  // el modo resuelto es 'dark' (rompe el modo oscuro explícito para el
  // usuario).
  test('setMode adds the dark class to the document element when set to dark', () => {
    const store = useThemeStore();

    store.setMode('dark');

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  // Falla si applyTheme() deja de remover la clase 'dark' al volver a
  // 'light' (bug real de "stuck dark mode": el usuario cambia a claro y la
  // UI se queda oscura).
  test('setMode removes the dark class when switching from dark to light', () => {
    const store = useThemeStore();
    store.setMode('dark');

    store.setMode('light');

    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

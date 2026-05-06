/**
 * Theme store — owns the user's color-scheme preference.
 *
 * `mode` is one of: 'light' | 'dark' | 'system'.
 * `resolvedMode` is what's actually applied ('light' | 'dark') after
 * resolving 'system' against the OS preference.
 *
 * The store toggles the `dark` class on <html>; CSS (style.css) does the
 * rest via `@custom-variant dark`. Persisted to localStorage so the
 * pre-paint script in index.html can read it before Vue boots.
 */
import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';

const MEDIA_QUERY = '(prefers-color-scheme: dark)';

function getSystemPrefersDark() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(MEDIA_QUERY).matches;
}

let _initialized = false;

export const useThemeStore = defineStore(
  'theme',
  () => {
    const mode = ref('system');
    const systemDark = ref(getSystemPrefersDark());

    const resolvedMode = computed(() => {
      if (mode.value === 'system') return systemDark.value ? 'dark' : 'light';
      return mode.value;
    });

    function applyTheme() {
      if (typeof document === 'undefined') return;
      const root = document.documentElement;
      if (resolvedMode.value === 'dark') root.classList.add('dark');
      else root.classList.remove('dark');
    }

    function setMode(next) {
      mode.value = next;
    }

    function init() {
      // Guard against double-registration: store is a singleton but tests
      // or hot-reload could otherwise stack matchMedia listeners.
      if (typeof window === 'undefined' || _initialized) return;
      _initialized = true;
      const mq = window.matchMedia(MEDIA_QUERY);
      mq.addEventListener('change', (e) => {
        systemDark.value = e.matches;
      });
      applyTheme();
    }

    // Single source of DOM application. `flush: 'sync'` makes the watcher
    // fire in the same tick as the state change so callers see no flicker.
    watch(resolvedMode, applyTheme, { flush: 'sync' });

    return { mode, resolvedMode, setMode, init };
  },
  {
    persist: {
      // pinia-plugin-persistedstate v4 uses `pick`, not `paths`.
      // With `paths`, the option is silently dropped and the entire state
      // (including `systemDark`) gets persisted, which causes stale OS
      // preference to override the live matchMedia value on hydration.
      key: 'theme',
      pick: ['mode'],
    },
  }
);

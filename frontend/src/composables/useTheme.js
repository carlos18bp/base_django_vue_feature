/**
 * useTheme — thin wrapper around the theme store.
 * Exposes mode, resolvedMode, setMode, and a cycleMode helper
 * (light → dark → system → light) for compact toggle UIs.
 */
import { storeToRefs } from 'pinia';
import { useThemeStore } from '@/stores/theme';

const ORDER = ['light', 'dark', 'system'];

export function useTheme() {
  const store = useThemeStore();
  // storeToRefs preserves reactivity when callers destructure the result.
  // Returning `store.mode` directly would unwrap to a plain string.
  const { mode, resolvedMode } = storeToRefs(store);

  function cycleMode() {
    const i = ORDER.indexOf(mode.value);
    store.setMode(ORDER[(i + 1) % ORDER.length]);
  }

  return {
    mode,
    resolvedMode,
    setMode: store.setMode,
    cycleMode,
  };
}

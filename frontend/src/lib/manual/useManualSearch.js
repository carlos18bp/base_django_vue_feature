import { computed, onBeforeUnmount, ref, watch } from 'vue';
import Fuse from 'fuse.js';

import { MANUAL_SECTIONS } from './content';

const MAX_RESULTS = 12;
const DEBOUNCE_MS = 120;

const FUSE_OPTIONS = {
  includeScore: true,
  threshold: 0.4,
  ignoreLocation: true,
  minMatchCharLength: 2,
  keys: [
    { name: 'title', weight: 0.5 },
    { name: 'keywords', weight: 0.25 },
    { name: 'summary', weight: 0.15 },
    { name: 'steps', weight: 0.07 },
    { name: 'route', weight: 0.03 },
  ],
};

const buildIndex = (locale, sections) => {
  const rows = [];
  for (const section of sections) {
    for (const process of section.processes) {
      rows.push({
        id: process.id,
        sectionId: section.id,
        title: process.title[locale],
        summary: process.summary[locale],
        keywords: process.keywords,
        steps: process.steps[locale].join(' '),
        route: process.route ?? '',
        _process: process,
        _section: section,
      });
    }
  }
  return rows;
};

export function useManualSearch(queryRef, localeRef, sectionsRef = ref(MANUAL_SECTIONS)) {
  const deferredQuery = ref('');
  let timer = null;

  const clearTimer = () => {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  };

  watch(
    queryRef,
    (value) => {
      clearTimer();
      timer = setTimeout(() => {
        deferredQuery.value = (value ?? '').trim();
        timer = null;
      }, DEBOUNCE_MS);
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    clearTimer();
  });

  const fuse = computed(
    () => new Fuse(buildIndex(localeRef.value, sectionsRef.value), FUSE_OPTIONS),
  );

  const results = computed(() => {
    const query = deferredQuery.value;
    if (!query) return [];
    return fuse.value.search(query, { limit: MAX_RESULTS }).map((m) => ({
      process: m.item._process,
      section: m.item._section,
      score: m.score ?? 0,
    }));
  });

  const isSearching = computed(() => deferredQuery.value.length > 0);
  const activeQuery = computed(() => deferredQuery.value);

  return {
    results,
    isSearching,
    activeQuery,
  };
}

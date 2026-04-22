<template>
  <div class="relative">
    <label
      class="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20"
    >
      <Search class="h-4 w-4 text-gray-500" aria-hidden="true" />
      <input
        ref="inputRef"
        v-model="query"
        type="search"
        role="searchbox"
        :aria-label="$t('manual.search.placeholder')"
        :placeholder="$t('manual.search.placeholder')"
        class="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none"
        @keydown.down.prevent="onArrowDown"
        @keydown.up.prevent="onArrowUp"
        @keydown.enter.prevent="onEnter"
        @keydown.esc="onEsc"
      />
      <button
        v-if="query"
        type="button"
        class="text-gray-500 hover:text-gray-700"
        :aria-label="$t('manual.search.clear')"
        @click="clearQuery"
      >
        <X class="h-4 w-4" />
      </button>
      <kbd
        class="hidden md:inline-flex items-center gap-0.5 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-medium text-gray-500"
      >
        &#8984;K
      </kbd>
    </label>

    <div
      v-if="isSearching"
      class="absolute left-0 right-0 top-full z-40 mt-2 max-h-96 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-xl"
    >
      <p
        v-if="results.length === 0"
        class="px-4 py-6 text-center text-sm text-gray-500"
      >
        {{ $t('manual.search.noResults') }}
      </p>
      <ul v-else role="listbox" class="flex flex-col">
        <li v-for="(hit, idx) in results" :key="hit.process.id">
          <button
            type="button"
            role="option"
            :aria-selected="idx === highlighted"
            class="flex w-full flex-col gap-1 rounded-xl px-3 py-2 text-left transition-colors"
            :class="idx === highlighted ? 'bg-indigo-50' : 'hover:bg-gray-50'"
            @mouseenter="highlighted = idx"
            @click="handleSelect(hit.process.id)"
          >
            <span class="text-sm font-medium text-gray-900">
              {{ hit.process.title[locale] }}
            </span>
            <span class="text-xs text-gray-600 line-clamp-2">
              {{ hit.process.summary[locale] }}
            </span>
            <code
              v-if="hit.process.route"
              class="inline-block w-fit rounded-md bg-gray-100 px-1.5 py-0.5 text-[11px] text-gray-700"
            >
              {{ hit.process.route }}
            </code>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, toRef, watch } from 'vue';
import { Search, X } from 'lucide-vue-next';
import { useManualSearch } from '@/lib/manual/useManualSearch';

const props = defineProps({
  sections: {
    type: Array,
    required: true,
  },
  locale: {
    type: String,
    required: true,
  },
});

const query = ref('');
const highlighted = ref(0);
const inputRef = ref(null);

const localeRef = toRef(props, 'locale');
const sectionsRef = computed(() => props.sections);

const { results, isSearching } = useManualSearch(query, localeRef, sectionsRef);

const HIGHLIGHT_MS = 1600;
const HIGHLIGHT_CLASSES = ['ring-2', 'ring-indigo-500', 'ring-offset-2', 'ring-offset-white'];

let highlightTimer = null;
let highlightedEl = null;

const clearHighlightTimer = () => {
  if (highlightTimer !== null) {
    clearTimeout(highlightTimer);
    highlightTimer = null;
  }
};

const scrollToProcess = (id) => {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });

  clearHighlightTimer();
  if (highlightedEl) {
    highlightedEl.classList.remove(...HIGHLIGHT_CLASSES);
  }

  el.classList.add(...HIGHLIGHT_CLASSES);
  highlightedEl = el;
  highlightTimer = setTimeout(() => {
    el.classList.remove(...HIGHLIGHT_CLASSES);
    if (highlightedEl === el) highlightedEl = null;
    highlightTimer = null;
  }, HIGHLIGHT_MS);
};

const handleSelect = (id) => {
  query.value = '';
  scrollToProcess(id);
};

const clearQuery = () => {
  query.value = '';
  inputRef.value?.focus();
};

const onArrowDown = () => {
  if (!isSearching.value) return;
  const max = Math.max(results.value.length - 1, 0);
  highlighted.value = Math.min(highlighted.value + 1, max);
};

const onArrowUp = () => {
  if (!isSearching.value) return;
  highlighted.value = Math.max(highlighted.value - 1, 0);
};

const onEnter = () => {
  if (!isSearching.value) return;
  const hit = results.value[highlighted.value];
  if (hit) handleSelect(hit.process.id);
};

const onEsc = () => {
  query.value = '';
  inputRef.value?.blur();
};

watch(query, () => {
  highlighted.value = 0;
});

const onKeydown = (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    inputRef.value?.focus();
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  clearHighlightTimer();
  if (highlightedEl) {
    highlightedEl.classList.remove(...HIGHLIGHT_CLASSES);
    highlightedEl = null;
  }
});
</script>

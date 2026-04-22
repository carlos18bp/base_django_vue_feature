<template>
  <!-- Mobile -->
  <div class="lg:hidden mb-4">
    <button
      type="button"
      class="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
      :aria-expanded="mobileOpen"
      @click="mobileOpen = !mobileOpen"
    >
      <Menu class="h-5 w-5" />
      {{ $t('manual.sidebar.title') }}
    </button>
    <div
      v-if="mobileOpen"
      class="mt-2 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg"
    >
      <nav :aria-label="$t('manual.sidebar.title')" class="flex flex-col gap-1">
        <div v-for="section in sections" :key="section.id" class="flex flex-col">
          <button
            type="button"
            class="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            :aria-expanded="!isCollapsed(section.id)"
            :aria-controls="`manual-section-m-${section.id}`"
            @click="toggle(section.id)"
          >
            <span class="flex items-center gap-2">
              <component :is="section.icon" class="h-4 w-4 flex-shrink-0" />
              <span>{{ section.title[locale] }}</span>
            </span>
            <ChevronDown
              class="h-3.5 w-3.5 transition-transform"
              :class="{ '-rotate-90': isCollapsed(section.id) }"
            />
          </button>
          <ul
            v-if="!isCollapsed(section.id)"
            :id="`manual-section-m-${section.id}`"
            class="mt-1 flex flex-col gap-0.5 pl-6"
          >
            <li v-for="process in section.processes" :key="process.id">
              <a
                :href="'#' + process.id"
                class="block rounded-md border-l-2 border-transparent pl-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 hover:border-gray-900"
                @click="mobileOpen = false"
              >
                {{ process.title[locale] }}
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </div>

  <!-- Desktop -->
  <aside class="hidden lg:block w-72 flex-shrink-0">
    <div
      class="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-4"
    >
      <h2 class="mb-3 px-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
        {{ $t('manual.sidebar.title') }}
      </h2>
      <nav :aria-label="$t('manual.sidebar.title')" class="flex flex-col gap-1">
        <div v-for="section in sections" :key="section.id" class="flex flex-col">
          <button
            type="button"
            class="group flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-50"
            :aria-expanded="!isCollapsed(section.id)"
            :aria-controls="`manual-section-${section.id}`"
            @click="toggle(section.id)"
          >
            <span class="flex items-center gap-2">
              <component :is="section.icon" class="h-4 w-4 flex-shrink-0" />
              <span>{{ section.title[locale] }}</span>
            </span>
            <ChevronDown
              class="h-3.5 w-3.5 transition-transform"
              :class="{ '-rotate-90': isCollapsed(section.id) }"
            />
          </button>
          <ul
            v-if="!isCollapsed(section.id)"
            :id="`manual-section-${section.id}`"
            class="mt-1 flex flex-col gap-0.5 pl-6"
          >
            <li v-for="process in section.processes" :key="process.id">
              <a
                :href="'#' + process.id"
                class="block rounded-md border-l-2 border-transparent pl-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 hover:border-gray-900"
              >
                {{ process.title[locale] }}
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ChevronDown, Menu } from 'lucide-vue-next';

defineProps({
  sections: {
    type: Array,
    required: true,
  },
  locale: {
    type: String,
    required: true,
  },
});

const mobileOpen = ref(false);
const collapsed = reactive({});

const isCollapsed = (id) => collapsed[id] ?? false;
const toggle = (id) => {
  collapsed[id] = !collapsed[id];
};
</script>

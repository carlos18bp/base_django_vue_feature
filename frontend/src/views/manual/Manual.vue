<template>
  <main class="mx-auto max-w-[1400px] px-6 py-10">
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <ManualSidebar :sections="MANUAL_SECTIONS" :locale="manualLocale" />

      <div class="min-w-0 flex-1">
        <header class="mb-6">
          <p class="text-sm uppercase tracking-wider text-indigo-600">
            {{ $t('manual.eyebrow') }}
          </p>
          <h1 class="mt-1 text-3xl lg:text-4xl font-semibold text-gray-900">
            {{ $t('manual.title') }}
          </h1>
          <p class="mt-3 max-w-3xl text-gray-600">
            {{ $t('manual.subtitle') }}
          </p>
        </header>

        <div class="sticky top-20 z-30 mb-8">
          <ManualSearch :sections="MANUAL_SECTIONS" :locale="manualLocale" />
        </div>

        <div class="space-y-12">
          <section
            v-for="section in MANUAL_SECTIONS"
            :id="'section-' + section.id"
            :key="section.id"
            class="scroll-mt-24"
          >
            <header class="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3">
              <span
                class="h-9 w-9 rounded-xl bg-gray-100 text-gray-900 flex items-center justify-center"
              >
                <component :is="section.icon" class="h-5 w-5" />
              </span>
              <h2 class="text-xl font-semibold text-gray-900">
                {{ section.title[manualLocale] }}
              </h2>
            </header>

            <div class="flex flex-col gap-4">
              <ProcessCard
                v-for="process in section.processes"
                :key="process.id"
                :process="process"
                :locale="manualLocale"
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

import { MANUAL_SECTIONS } from '@/lib/manual/content';
import ManualSidebar from '@/components/manual/ManualSidebar.vue';
import ManualSearch from '@/components/manual/ManualSearch.vue';
import ProcessCard from '@/components/manual/ProcessCard.vue';

const { locale } = useI18n();
const manualLocale = computed(() => (locale.value === 'en' ? 'en' : 'es'));
</script>

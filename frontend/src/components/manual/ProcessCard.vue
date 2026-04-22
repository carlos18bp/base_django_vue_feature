<template>
  <article
    :id="process.id"
    class="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-6"
  >
    <header>
      <h3 class="text-lg font-semibold text-gray-900">{{ process.title[locale] }}</h3>
      <p class="mt-1 text-sm text-gray-600">{{ process.summary[locale] }}</p>
    </header>

    <section class="mt-4">
      <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {{ $t('manual.card.why') }}
      </h4>
      <p class="mt-1 text-sm text-gray-600">{{ process.why[locale] }}</p>
    </section>

    <section class="mt-4">
      <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {{ $t('manual.card.steps') }}
      </h4>
      <ol class="mt-2 list-decimal space-y-1.5 pl-5 text-sm text-gray-600 marker:text-gray-900">
        <li v-for="(step, idx) in process.steps[locale]" :key="idx">{{ step }}</li>
      </ol>
    </section>

    <section v-if="process.route" class="mt-4">
      <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {{ $t('manual.card.route') }}
      </h4>
      <code class="mt-1 inline-block rounded-md bg-gray-100 px-2 py-1 text-xs text-gray-900">
        {{ process.route }}
      </code>
    </section>

    <section
      v-if="process.tips && process.tips[locale] && process.tips[locale].length > 0"
      class="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
    >
      <h4 class="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {{ $t('manual.card.tips') }}
      </h4>
      <ul class="mt-2 space-y-1 text-sm text-gray-700">
        <li v-for="(tip, idx) in process.tips[locale]" :key="idx" class="flex gap-2">
          <span aria-hidden="true">&rarr;</span>
          <span>{{ tip }}</span>
        </li>
      </ul>
    </section>
  </article>
</template>

<script setup>
defineProps({
  process: {
    type: Object,
    required: true,
  },
  locale: {
    type: String,
    required: true,
  },
});
</script>

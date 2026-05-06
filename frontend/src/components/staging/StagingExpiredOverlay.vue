<template>
  <div
    role="dialog"
    aria-modal="true"
    data-testid="staging-expired-overlay"
    class="fixed inset-0 z-[100] bg-background text-foreground overflow-auto"
  >
    <div class="min-h-screen flex items-center justify-center px-6 py-12">
      <div class="max-w-xl w-full text-center space-y-6">
        <div class="text-5xl" aria-hidden>⏳</div>
        <h1 class="text-3xl font-bold">{{ title }}</h1>
        <p class="text-lg text-muted-foreground">{{ t('staging.expired.body') }}</p>
        <p class="text-base text-muted-foreground">{{ t('staging.expired.cta') }}</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <a
            :href="whatsappLink"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="staging-expired-whatsapp"
            class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-success text-success-foreground font-semibold hover:bg-success/90 transition-colors"
          >
            <span aria-hidden>📱</span>
            <span>{{ t('staging.expired.whatsappLabel') }}: {{ state.contact_whatsapp }}</span>
          </a>
          <a
            :href="`mailto:${state.contact_email}`"
            data-testid="staging-expired-email"
            class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-info text-info-foreground font-semibold hover:bg-info/90 transition-colors"
          >
            <span aria-hidden>✉️</span>
            <span>{{ t('staging.expired.emailLabel') }}: {{ state.contact_email }}</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  state: { type: Object, required: true },
});

const { t, locale } = useI18n();

const whatsappLink = computed(
  () => `https://wa.me/${(props.state.contact_whatsapp || '').replace(/[^0-9]/g, '')}`,
);

const title = computed(() => {
  const phase = props.state.phase_labels[locale.value] ?? '';
  return t('staging.expired.title', { phase: phase.toLowerCase() });
});
</script>

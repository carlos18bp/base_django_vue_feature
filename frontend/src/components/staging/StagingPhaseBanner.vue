<template>
  <div
    role="status"
    data-testid="staging-phase-banner"
    :class="[
      'sticky top-0 z-50 w-full border-b text-sm font-medium',
      isUrgent
        ? 'bg-warning text-warning-foreground border-warning/40'
        : 'bg-info text-info-foreground border-info/40',
    ]"
  >
    <div class="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-2 text-center">
      <span aria-hidden>{{ phaseIcon }}</span>
      <span>
        <strong>{{ phaseLabel }}</strong> — {{ verb }}
        <strong>{{ days }} {{ noun }}</strong> {{ t('staging.banner.forReview') }}
      </span>
    </div>
  </div>
</template>

<script>
const PHASE_ICONS = { design: '🎨', development: '🛠️' };
</script>

<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
  state: { type: Object, required: true },
});

const { t, locale } = useI18n();

const days = computed(() => props.state.days_remaining ?? 0);
const isUrgent = computed(() => days.value <= 2);
const phaseIcon = computed(() => PHASE_ICONS[props.state.current_phase] ?? '');
const phaseLabel = computed(() => props.state.phase_labels[locale.value] ?? '');
const verb = computed(() =>
  days.value === 1 ? t('staging.banner.daysRemainingOne') : t('staging.banner.daysRemainingMany'),
);
const noun = computed(() =>
  days.value === 1 ? t('staging.banner.dayOne') : t('staging.banner.dayMany'),
);
</script>

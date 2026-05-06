<template>
  <StagingExpiredOverlay v-if="showOverlay" :state="banner.state" />
  <template v-else>
    <StagingPhaseBanner v-if="showBanner" :state="banner.state" />
    <slot />
  </template>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useIntervalFn } from '@vueuse/core';
import { useStagingBannerStore } from '@/stores/stagingBanner';
import StagingPhaseBanner from './StagingPhaseBanner.vue';
import StagingExpiredOverlay from './StagingExpiredOverlay.vue';

const POLL_INTERVAL_MS = 60_000;

const banner = useStagingBannerStore();

onMounted(() => banner.fetchState());
useIntervalFn(() => banner.fetchState(), POLL_INTERVAL_MS);

const isActive = computed(
  () =>
    banner.hasFetched &&
    banner.state &&
    banner.state.is_visible &&
    banner.state.started_at,
);

const showOverlay = computed(() => isActive.value && banner.state.is_expired);
const showBanner = computed(() => isActive.value && !banner.state.is_expired);
</script>

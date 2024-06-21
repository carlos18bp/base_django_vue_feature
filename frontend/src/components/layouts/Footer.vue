<template>
    <footer>
      FOOTER TEMPLATE
    </footer>
</template>

<script setup>
    import { computed, onMounted, ref, watch, watchEffect } from "vue";
    import { useAppStore } from '@/stores/language.js';

    const appStore = useAppStore();
    const currentLanguage = computed(() => appStore.getCurrentLanguage);
</script>
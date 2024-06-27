<template>
    <footer>
      FOOTER TEMPLATE
    </footer>
</template>

<script setup>
    import { computed, onMounted, ref, watch, watchEffect } from "vue";
    import { useLanguageStore } from '@/stores/language.js';

    const appStore = useLanguageStore();
    const currentLanguage = computed(() => appStore.getCurrentLanguage);
</script>
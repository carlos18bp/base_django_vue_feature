<template>
    <Header></Header>
    <h1>ABOUT US VIEW</h1>
    <Footer></Footer>    
</template>

<script setup>
    import { computed } from "vue";
    import Header from "@/components/layouts/Header.vue";
    import Footer from "@/components/layouts/Footer.vue";
    import { useLanguageStore } from '@/stores/language.js';

    const languageStore = useLanguageStore();
    const currentLanguage = computed(() => languageStore.getCurrentLanguage);
</script>
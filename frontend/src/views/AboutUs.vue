<template>
    <Header></Header>
    <h1>ABOUT US VIEW</h1>
    <Footer></Footer>    
</template>

<script setup>
    import { computed } from "vue";
    import Header from "@/components/layouts/Header.vue";
    import Footer from "@/components/layouts/Footer.vue";
    import { useAppStore } from '@/stores/language.js';

    const appStore = useAppStore();
    const currentLanguage = computed(() => appStore.getCurrentLanguage);
</script>
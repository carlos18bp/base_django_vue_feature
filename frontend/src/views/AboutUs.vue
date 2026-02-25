<template>
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-4xl font-bold mb-6">About Us</h1>
        <div class="prose max-w-none">
            <p class="text-lg mb-4">
                Welcome to our Base Django Vue Feature Template. This is a comprehensive starter 
                template for building modern web applications with Django REST Framework backend 
                and Vue 3 frontend.
            </p>
            <p class="mb-4">
                Our mission is to provide developers with a solid foundation to kickstart their 
                projects quickly and efficiently, following best practices and modern development standards.
            </p>
            <h2 class="text-2xl font-semibold mt-6 mb-3">Our Technology Stack</h2>
            <ul class="list-disc list-inside mb-4">
                <li>Django REST Framework for powerful backend APIs</li>
                <li>Vue 3 with Composition API for reactive frontends</li>
                <li>Vite for lightning-fast development experience</li>
                <li>TailwindCSS for modern, utility-first styling</li>
                <li>Pinia for state management</li>
                <li>Jest and Playwright for comprehensive testing</li>
            </ul>
            <h2 class="text-2xl font-semibold mt-6 mb-3">Why Choose This Template?</h2>
            <p class="mb-4">
                This template comes with everything you need to build production-ready applications:
                complete authentication system, CRUD operations, file management, testing suite,
                and comprehensive documentation.
            </p>
        </div>
    </div>
</template>

<script setup>
    import { computed } from "vue";
    import { useLanguageStore } from '@/stores/language.js';

    const languageStore = useLanguageStore();
    const currentLanguage = computed(() => languageStore.getCurrentLanguage);
</script>
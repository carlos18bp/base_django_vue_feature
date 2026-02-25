<template>
    <!-- Global Header for all pages -->
    <Header />
    
    <!-- Main content area -->
    <main class="min-h-screen">
        <RouterView />
    </main>
    
    <!-- Global Footer for all pages -->
    <Footer />
</template>

<script setup>
    import { onMounted } from 'vue'
    import { RouterView } from "vue-router";
    import Header from "@/components/layouts/Header.vue";
    import Footer from "@/components/layouts/Footer.vue";
    import { useBlogStore } from "@/stores/blog";
    import { useProductStore } from '@/stores/product';

    const blogStore = useBlogStore();
    const prductStore = useProductStore()

    /**
     * Fetch the list of products from the store when the component is mounted.
     */
    onMounted(async () => {
        await blogStore.fetchBlogs();
        await prductStore.fetchProducts()
    })
</script>
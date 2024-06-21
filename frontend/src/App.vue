<template>
    <RouterView />
</template>

<script setup>
    import { onMounted } from 'vue'
    import { RouterView } from "vue-router";
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
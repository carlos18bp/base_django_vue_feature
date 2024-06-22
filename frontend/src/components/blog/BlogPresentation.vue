<template>
    <div class="flex flex-col pt-16">
        <RouterLink v-if="blog.id" :to="{ name: 'blog', params: { blog_id: blog.id } }" >
            <div>
                <img :src="blog.image_url" class="object-cover w-full h-96 pb-4">
            </div>
            <h2 v-if="currentLanguage === 'en'" class="text-xl uppercase pb-2">
                {{ blog.category }}
            </h2>
            <p v-if="currentLanguage === 'en'" class="font-bold text-3xl pb-3">                
                {{ blog.title }}
            </p>
        </RouterLink>
    </div>
</template>

<script setup>
    import { computed } from "vue";
    import { RouterLink } from 'vue-router';
    import { useAppStore } from '@/stores/language.js';

    /**
     * Props definition.
     * @typedef {Object} Props
     * @property {Object} blog - Object containing blog details.
     */
    const props = defineProps({
        blog: Object,
    });

    const appStore = useAppStore();
    const currentLanguage = computed(() => appStore.getCurrentLanguage);
</script>
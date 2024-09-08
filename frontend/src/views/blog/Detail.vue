<template>
    <!-- Header Component -->
    <Header></Header>

    <!-- Blog content -->
    <div v-if="blog" class="flex flex-col px-8 m-8">
        <div class="relative flex pb-8">
            <div class="w-full max-h-96 flex items-center justify-center">
                <img :src="blog.image_url" class="object-cover w-full h-full"/>
            </div>

            <div class="bg-white absolute bottom-0 -left-px p-8 pt-4 flex flex-col">
                <h1 v-if="currentLanguage === 'en'" class="font-bold text-4xl tracking-wider">{{ blog.title }}</h1>
            </div>
        </div>
        <p v-if="currentLanguage === 'en'" class="text-xl">
            {{ blog.description }}
        </p>
    </div>

    <BlogCarousel :top="{ top_blog }" class="mb-16"> </BlogCarousel>
    <!-- Footer Component -->
    <Footer></Footer>
</template>

<script setup>
    import { computed, onMounted, ref, reactive, watch, watchEffect } from "vue";
    import Header from "@/components/layouts/Header.vue";
    import Footer from "@/components/layouts/Footer.vue";
    import BlogCarousel from "@/components/blog/BlogCarousel.vue";
    import { useLanguageStore } from '@/stores/language.js';
    import { useBlogStore } from "@/stores/blog";
    import { useRoute } from "vue-router";

    const route = useRoute();
    const languageStore = useLanguageStore();
    const currentLanguage = computed(() => languageStore.getCurrentLanguage);

    const blogStore = useBlogStore();
    const blog = reactive({});

    const top_blog = ref(null);
    if (window.innerWidth >= 1024) {
        top_blog.value = 3;
    } else if (window.innerWidth < 1024 && 760 <= window.innerWidth) {
        top_blog.value = 2;
    } else if (window.innerWidth < 760) {
        top_blog.value = 1;
    }

    /**
     * onMounted lifecycle hook
     * Fetches blogs data
     */
    onMounted(async () => {
        await blogStore.fetchBlogs();
        /**
         * Fetch blog by id from the route parameter.
         * Assign the fetched blog to the 'blog' reactive object.
         */
        const blogId = route.params.blog_id;
        if (blogId) Object.assign(blog, blogStore.blogById(blogId));
    });
</script>
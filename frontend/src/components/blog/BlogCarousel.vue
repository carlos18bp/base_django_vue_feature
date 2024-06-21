<template>
    <!-- Carousel container for trending blogs -->
    <div v-if="blogsOnTrending" class="carousel-container p-16">
        <div class="text-center mb-8">
            <h2 class="text-3xl font-semibold">TRENDING NOW</h2>
            <p class="text-xl font-medium text-gray-500">
                Discover the trending blogs. |
                <RouterLink :to="{ name: 'blogs'}">
                    <span class="border-b-2 border-b-gray-500">Explore now</span>
                </RouterLink>
            </p>
        </div>
        <div class="relative">
            <!-- Previous button for carousel -->
            <button
                class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full shadow size-6 flex items-center justify-center z-10"
                @click="prev">
                <span class="sr-only">Previous</span>
                <span class="block text-sm leading-none">&lsaquo;</span>
            </button>
            <!-- Carousel items container -->
            <div class="overflow-hidden">
                <ul class="flex transition-transform duration-500 ease-in-out"
                    :style="{ transform: `translateX(-${(currentIndex * 100) / 5}%)` }">
                    <!-- Loop through trending blogs and display them in the carousel -->
                    <router-link :to="{ name: 'blog', params: { blog_id: blog.id } }"
                        v-for="blog in blogsOnTrending" :key="blog.id"
                        class="flex-none w-full sm:w-1/2 lg:w-1/5 px-2 cursor-pointer">
                        <div class="shadow">
                            <img :src="blog.image" :alt="blog.title"
                                class="w-full object-cover mb-4" />
                            <div class="text-center">
                                <h3 class="text-lg font-semibold">
                                    <!-- Display blog name based on current language -->
                                    <span v-if="currentLanguage === 'en'">{{ blog.title }}</span>
                                </h3>
                                <p class="text-lg font-semibold">
                                    {{ blog.category }}
                                </p>
                            </div>
                        </div>
                    </router-link>
                </ul>
            </div>
            <!-- Next button for carousel -->
            <button
                class="absolute right-0 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full shadow size-6 flex items-center justify-center z-10"
                @click="next">
                <span class="sr-only">Next</span>
                <span class="block text-sm leading-none">&rsaquo;</span>
            </button>
        </div>
    </div>
</template>

<script setup>
    // Importing necessary modules
    import { computed, ref, onMounted, onUnmounted } from "vue";
    import { useAppStore } from '@/stores/language.js';
    import { useBlogStore } from "@/stores/blog";

    // Initializing state
    const currentIndex = ref(0);
    const interval = ref(null);
    const blogsOnTrending = ref(null);

    // Access the current language from the store
    const appStore = useAppStore();
    const currentLanguage = computed(() => appStore.getCurrentLanguage);

    // Access the blog store to get trending blogs
    const blogStore = useBlogStore();

    // Fetch blogs when the component is mounted
    onMounted(async () => {
        await blogStore.fetchBlogs();
        blogsOnTrending.value = blogStore.blogs;
        startCarousel();
    });

    // Stop the carousel when the component is unmounted
    onUnmounted(() => {
        stopCarousel();
    });

    /**
     * Move to the next set of blogs in the carousel
     */
    const next = () => {
        if (currentIndex.value < Math.ceil(blogsOnTrending.value.length / 5) - 1) {
            currentIndex.value++;
        } else {
            currentIndex.value = 0;
        }
    };

    /**
     * Move to the previous set of blogs in the carousel
     */
    const prev = () => {
        if (currentIndex.value > 0) {
            currentIndex.value--;
        } else {
            currentIndex.value = Math.ceil(blogsOnTrending.value.length / 5) - 1;
        }
    };

    /**
     * Start the automatic carousel rotation
     */
    const startCarousel = () => {
        interval.value = setInterval(() => {
            next();
        }, 3000);
    };

    /**
     * Stop the automatic carousel rotation
     */
    const stopCarousel = () => {
        if (interval.value) {
            clearInterval(interval.value);
        }
    };
</script>
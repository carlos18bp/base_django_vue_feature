<template>
    <!-- Carousel container for trending products -->
    <div v-if="productsOnTrending" class="carousel-container py-16">
        <div class="text-center mb-8">
            <h2 class="text-3xl font-semibold">TRENDING NOW</h2>
            <p class="text-xl font-medium text-gray-500">
                Discover the trending products. Explore now |
                <RouterLink :to="{ name: 'catalog'}">
                    <span class="border-b-2 border-b-gray-500">SHOP NOW</span>
                </RouterLink>
            </p>
        </div>
        <div class="relative">
            <!-- Previous button for carousel -->
            <button
                class="absolute left-0 top-1/2 transform -translate-y-1/2 bg-black text-white rounded-full shadow size-6 flex items-center justify-center z-10"
                @click="prev">
                <span class="block text-sm leading-none">&lsaquo;</span>
            </button>
            <!-- Carousel items container -->
            <div class="overflow-hidden">
                <ul class="flex transition-transform duration-500 ease-in-out"
                    :style="{ transform: `translateX(-${(currentIndex * 100) / 5}%)` }">
                    <!-- Loop through trending products and display them in the carousel -->
                    <router-link :to="{ name: 'product', params: { product_ref: product.ref } }"
                        v-for="product in productsOnTrending" :key="product.id"
                        class="flex-none w-full sm:w-1/2 lg:w-1/5 px-2 cursor-pointer">
                        <div class="shadow">
                            <img :src="product.gallery_urls[0]" :alt="product.title"
                                class="w-full object-cover mb-4" />
                            <div class="text-center">
                                <h3 class="text-lg font-semibold">
                                    <!-- Display product name based on current language -->
                                    <span v-if="currentLanguage === 'en'">{{ product.title }}</span>
                                </h3>
                                <p class="text-lg font-semibold">
                                    ${{ product.price }}
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
                <span class="block text-sm leading-none">&rsaquo;</span>
            </button>
        </div>
    </div>
</template>

<script setup>
    // Importing necessary modules
    import { computed, ref, onMounted, onUnmounted } from "vue";
    import { useAppStore } from '@/stores/language.js';
    import { useProductStore } from "@/stores/product";

    // Initializing state
    const currentIndex = ref(0);
    const interval = ref(null);
    const productsOnTrending = ref(null);

    // Access the current language from the store
    const appStore = useAppStore();
    const currentLanguage = computed(() => appStore.getCurrentLanguage);

    // Access the product store to get trending products
    const productStore = useProductStore();

    // Fetch products when the component is mounted
    onMounted(async () => {
        await productStore.fetchProducts();
        productsOnTrending.value = productStore.products;
        startCarousel();
    });

    // Stop the carousel when the component is unmounted
    onUnmounted(() => {
        stopCarousel();
    });

    /**
     * Move to the next set of products in the carousel
     */
    const next = () => {
        if (currentIndex.value < Math.ceil(productsOnTrending.value.length / 5) - 1) {
            currentIndex.value++;
        } else {
            currentIndex.value = 0;
        }
    };

    /**
     * Move to the previous set of products in the carousel
     */
    const prev = () => {
        if (currentIndex.value > 0) {
            currentIndex.value--;
        } else {
            currentIndex.value = Math.ceil(productsOnTrending.value.length / 5) - 1;
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
<template>
    <!-- Modal overlay -->
    <div v-if="visible" class="w-screen h-screen">
        <!-- Close modal when clicking outside the modal content -->
        <div ref="background" @click="closeModal" class="absolute inset-0 bg-gray-500 bg-opacity-40 backdrop-blur-md" data-testid="search-overlay"></div>
        <!-- Modal content -->
        <div ref="bar" class="relative z-50 bg-white shadow-lg w-full p-6">
            <!-- Modal header with search input -->
            <div class="flex items-center justify-between border-b pb-4">
                <input type="text"
                    class="w-full p-2 text-lg border-transparent font-semibold"
                    placeholder="Search..." v-model="searchQuery" @input="onSearch(searchQuery)" />
                <button @click="closeModal" data-testid="search-close" class="cursor-pointer me-6">
                    <XMarkIcon class="h-6 w-6 text-gray-500" />
                </button>
            </div>
            <!-- Modal body with search results -->
            <div class="mt-4">
                <div class="grid grid-cols-3 gap-4">
                    <!-- Suggestion items -->
                    <RouterLink v-if="products" 
                        :to="{ name: 'product', params: { product_id: product.id } }"
                        v-for="product in products" :key="product.id" @click.native="closeModal"
                        class="flex items-center">
                        <img :src="product.gallery_urls[0]" alt="Product image"
                            class="w-16 h-16 object-cover rounded" />
                        <div class="ml-4">
                            <p class="text-lg font-bold">
                                <span v-if="currentLanguage === 'en'">{{ product.title }}</span>
                            </p>
                        </div>
                    </RouterLink>
                </div>
                <!-- Link to see all products -->
                <div class="mt-4 text-right">
                    <RouterLink :to="{ name: 'catalog' }" @click="closeModal" class="font-medium me-6">
                        See all products
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref, onMounted, watchEffect } from "vue";
    import { useLanguageStore } from '@/stores/language.js';
    import { useProductStore } from "@/stores/product";
    import { XMarkIcon } from "@heroicons/vue/24/outline";
    import { gsap } from "gsap";

    // Create references for Background and Bar Elements
    const background = ref(null);
    const bar = ref(null);

    // Define component props and events
    const props = defineProps({
        visible: Boolean,
    });
    const emit = defineEmits(["update:visible"]);

    // Store instances and reactive variables
    const appStore = useLanguageStore();
    const currentLanguage = computed(() => appStore.getCurrentLanguage);
    const productStore = useProductStore();
    const products = ref([]);
    const searchQuery = ref(null);

    // Fetch products when the component is mounted
    onMounted(async () => {
        await productStore.fetchProducts();
        products.value = productStore.products;
    });

    // Close modal function
    const closeModal = () => {
        const tl = gsap.timeline({
            onComplete: () => {
                document.body.style.overflow = "auto";
                products.value = [];
                searchQuery.value = null;
                emit("update:visible", false);
            },
        });
        tl.fromTo(
            bar.value,
            { y: 0 },
            { y: -bar.value.offsetHeight, duration: 1, ease: "power2.inOut" },
            0,
        );
        tl.fromTo(
            background.value,
            { opacity: 1 },
            { opacity: 0, duration: 1, ease: "power2.inOut" },
            0,
        );
    };

    // Search function to filter products by name
    const onSearch = (name) => {
        if (name !== "") {
            products.value = productStore.productsByName(name);
        } else {
            products.value = productStore.products;
        }
    };
    
    // Watch for changes in the state of Modal Search Bar for animate
    watchEffect(() => {
        if (props.visible) {
            document.body.style.overflow = "hidden";
            if (background.value) {
                gsap.fromTo(
                    background.value,
                    {
                        opacity: 0,
                    },
                    {
                        opacity: 1,
                        duration: 1,
                        ease: "power2.inOut",
                    }
                );
            }
            if (bar.value) {
                gsap.fromTo(
                    bar.value,
                    {
                        y: -bar.value.offsetHeight,
                    },
                    {
                        y: 0,
                        duration: 1,
                        ease: "power2.inOut",
                    }
                );
            }
        } else {
            document.body.style.overflow = "auto";
        }
    });
</script>
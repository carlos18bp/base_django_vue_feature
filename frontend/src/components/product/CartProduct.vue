<template>
    <div v-if="product" class="flex border-b pb-4 h-40 mb-4">
        <!-- Product Image -->
        <img :src="product.gallery_urls[0]" alt="Product Image" class="w-20 h-20 lg:w-40 lg:h-full rounded" />
        <div class="grid h-full relative flex-1 pl-4">
            <div class="flex justify-between">
                <div>
                    <!-- Product Title -->
                    <h3 class="font-semibold text-xl" v-if="currentLanguage === 'en'">
                        {{ product.title }}
                    </h3>
                </div>
                <!-- Total Price -->
                <p class="text-xl font-semibold">${{ product.price * product.quantity }}</p>
            </div>
            <div class="flex justify-between items-end">
                <!-- Quantity -->
                <p class="text-md text-gray-500 font-medium">
                    Qty {{ product.quantity }}
                </p>
                <div class="flex gap-2">
                    <!-- Add Product Button -->
                    <a @click="$emit('addProduct', product)" 
                        class="font-medium text-md cursor-pointer">
                        Add
                    </a>
                    <!-- Remove Product Button -->
                    <a @click="$emit('removeProduct', product.id)" 
                        class="text-gray-500 font-medium text-md cursor-pointer">
                        Remove
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue';
    import { useLanguageStore } from '@/stores/language.js';

    const appStore = useLanguageStore();
    const currentLanguage = computed(() => appStore.getCurrentLanguage);

    // Props definition
    const props = defineProps({
        product: Object,
    });
</script>
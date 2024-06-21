<template>
    <header>
        <!-- Navbar for large screens -->
        <nav class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
            <div class="hidden lg:flex lg:flex-1 justify-end">
                <!-- Search bar trigger -->
                <div @click="showSearchBar = true" class="flex items-center justify-center gap-3 cursor-pointer">
                    <MagnifyingGlassIcon class="text-black size-6"></MagnifyingGlassIcon>
                </div>

                <!-- Shopping cart icon -->
                <div class="relative cursor-pointer">
                    <ShoppingBagIcon class="size-5 text-black m-2" @click="showShoppingCart = true" />
                    <span @click="showShoppingCart = true" v-if="totalCartProducts > 0"
                        class="absolute top-0 left-1/2 bg-slate-100 rounded-full text-xs size-5 flex items-center justify-center shadow-lg m-2 ml-0">
                        {{ totalCartProducts }}
                    </span>
                </div>
                <ShoppingCart :visible="showShoppingCart" @update:visible="showShoppingCart = $event" />
            </div>
        </nav>

        <!-- Search bar component -->
        <div v-if="showSearchBar" class="fixed z-30 top-0">
            <SearchBar :visible="showSearchBar" @update:visible="showSearchBar = $event"></SearchBar>
        </div>

        <!-- Navbar for mobile screens -->

    </header>
</template>

<script setup>
    import { computed, ref } from "vue";
    import { MagnifyingGlassIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline';
    import SearchBar from "@/components/layouts/SearchBar.vue";
    import ShoppingCart from "@/components/product/ShoppingCart.vue";
    import { useAppStore } from "@/stores/language.js";
    import { useProductStore } from "@/stores/product";

    // Reactive references
    const appStore = useAppStore();
    const currentLanguage = computed(() => appStore.getCurrentLanguage);

    const showSearchBar = ref(false);

    const showShoppingCart = ref(false);
    const productStore = useProductStore();
    const totalCartProducts = computed(() => productStore.totalCartProducts);
</script>
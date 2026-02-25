<template>
    <header class="bg-white shadow-sm sticky top-0 z-50">
        <!-- Navbar for large screens -->
        <nav class="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8" aria-label="Global">
            <!-- Logo/Brand -->
            <div class="flex lg:flex-1">
                <router-link to="/" class="text-xl font-bold text-gray-900">
                    Base Project
                </router-link>
            </div>

            <!-- Desktop Navigation Links -->
            <div class="hidden lg:flex lg:gap-x-8">
                <router-link to="/" class="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
                    Home
                </router-link>
                <router-link to="/blogs" class="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
                    Blogs
                </router-link>
                <router-link to="/catalog" class="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
                    Catalog
                </router-link>
                <router-link to="/about_us" class="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
                    About Us
                </router-link>
                <router-link to="/contact" class="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
                    Contact
                </router-link>
            </div>

            <!-- Right side actions -->
            <div class="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4 items-center">
                <!-- Search icon -->
                <button @click="showSearchBar = true" class="p-2 hover:bg-gray-100 rounded-full" data-testid="header-search">
                    <MagnifyingGlassIcon class="h-6 w-6 text-gray-900" />
                </button>

                <!-- Shopping cart -->
                <button @click="showShoppingCart = true" class="relative p-2 hover:bg-gray-100 rounded-full" data-testid="header-cart">
                    <ShoppingBagIcon class="h-6 w-6 text-gray-900" />
                    <span v-if="totalCartProducts > 0"
                        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {{ totalCartProducts }}
                    </span>
                </button>

                <!-- Auth buttons -->
                <template v-if="isAuthenticated">
                    <router-link to="/dashboard"
                        class="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
                        Dashboard
                    </router-link>
                    <button @click="handleSignOut" data-testid="header-sign-out"
                        class="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
                        Sign Out
                    </button>
                </template>
                <template v-else>
                    <router-link to="/sign_in"
                        class="text-sm font-semibold leading-6 text-gray-900 hover:text-gray-600">
                        Sign In
                    </router-link>
                    <router-link to="/sign_up"
                        class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                        Sign Up
                    </router-link>
                </template>
            </div>

            <!-- Mobile menu button -->
            <div class="flex lg:hidden">
                <button type="button" @click="mobileMenuOpen = true"
                    class="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
                    <span class="sr-only">Open main menu</span>
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round"
                            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                    </svg>
                </button>
            </div>
        </nav>

        <!-- Mobile menu -->
        <div v-if="mobileMenuOpen" class="lg:hidden" role="dialog" aria-modal="true">
            <div class="fixed inset-0 z-50"></div>
            <div
                class="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                <div class="flex items-center justify-between">
                    <router-link to="/" class="text-xl font-bold text-gray-900" @click="mobileMenuOpen = false">
                        Base Project
                    </router-link>
                    <button type="button" @click="mobileMenuOpen = false" class="-m-2.5 rounded-md p-2.5 text-gray-700">
                        <span class="sr-only">Close menu</span>
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div class="mt-6 flow-root">
                    <div class="-my-6 divide-y divide-gray-500/10">
                        <div class="space-y-2 py-6">
                            <router-link to="/" @click="mobileMenuOpen = false"
                                class="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                Home
                            </router-link>
                            <router-link to="/blogs" @click="mobileMenuOpen = false"
                                class="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                Blogs
                            </router-link>
                            <router-link to="/catalog" @click="mobileMenuOpen = false"
                                class="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                Catalog
                            </router-link>
                            <router-link to="/about_us" @click="mobileMenuOpen = false"
                                class="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                About Us
                            </router-link>
                            <router-link to="/contact" @click="mobileMenuOpen = false"
                                class="block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                Contact
                            </router-link>
                        </div>
                        <div class="py-6">
                            <template v-if="isAuthenticated">
                                <router-link to="/dashboard" @click="mobileMenuOpen = false"
                                    class="block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                    Dashboard
                                </router-link>
                                <button @click="handleSignOut" data-testid="mobile-sign-out"
                                    class="block w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                    Sign Out
                                </button>
                            </template>
                            <template v-else>
                                <router-link to="/sign_in" @click="mobileMenuOpen = false"
                                    class="block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                    Sign In
                                </router-link>
                                <router-link to="/sign_up" @click="mobileMenuOpen = false"
                                    class="block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50">
                                    Sign Up
                                </router-link>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Search bar component -->
        <div v-if="showSearchBar" class="fixed z-30 top-0">
            <SearchBar :visible="showSearchBar" @update:visible="showSearchBar = $event"></SearchBar>
        </div>

        <!-- Shopping cart component -->
        <ShoppingCart :visible="showShoppingCart" @update:visible="showShoppingCart = $event" />
    </header>
</template>

<script setup>
    import { computed, ref } from "vue";
    import { useRouter } from "vue-router";
    import { MagnifyingGlassIcon, ShoppingBagIcon } from '@heroicons/vue/24/outline';
    import SearchBar from "@/components/layouts/SearchBar.vue";
    import ShoppingCart from "@/components/product/ShoppingCart.vue";
    import { useAuthStore } from "@/stores/auth";
    import { useProductStore } from "@/stores/product";

    const router = useRouter();
    const authStore = useAuthStore();
    const productStore = useProductStore();

    // Reactive references
    const showSearchBar = ref(false);
    const showShoppingCart = ref(false);
    const mobileMenuOpen = ref(false);

    const totalCartProducts = computed(() => productStore.totalCartProducts);
    const isAuthenticated = computed(() => authStore.token && authStore.user?.id);

    const handleSignOut = () => {
        authStore.logout();
        mobileMenuOpen.value = false;
        router.push('/');
    };
</script>
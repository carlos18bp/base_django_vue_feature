<template>
    <!-- Shopping Cart Overlay -->
    <div class="fixed inset-0 flex justify-end z-50" v-if="visible">
        <div ref="background" 
            @click="closeCart()" 
            class="absolute inset-0 bg-gray-500 bg-opacity-40 backdrop-blur-md" data-testid="cart-overlay">
        </div>
        <div ref="cart" class="relative bg-white h-full w-full lg:w-2/5 shadow-lg flex flex-col z-60">
            <!-- Cart Header -->
            <div class="flex justify-between items-center p-10">
                <h2 class="text-2xl font-semibold">Shopping Cart</h2>
                <button @click="closeCart()" data-testid="cart-close" class="cursor-pointer">
                    <XMarkIcon class="text-gray-500 w-6 h-6" />
                </button>
            </div>

            <!-- Cart Items -->
            <div v-if="cartProducts.length" class="p-10 space-y-4 flex-1 overflow-y-auto">
                <CartProduct v-for="product in cartProducts" 
                    :key="product.id" 
                    :product="product"
                    @addProduct="handleAddProduct" 
                    @removeProduct="handleRemoveProduct" />
            </div>
            <div v-else class="text-lg ps-10">
                <p>No products</p>
                <RouterLink :to="{ name: 'catalog' }" class="cursor-pointer border-b-black">
                    Continue Shopping
                </RouterLink>
            </div>

            <!-- Cart Footer -->
            <div v-if="cartProducts.length" class="border-t p-4">
                <div class="flex justify-between items-center mb-4">
                    <div>
                        <h3 class="text-2xl font-semibold">Subtotal</h3>
                        <p class="text-md text-gray-500 font-medium">
                            Shipping calculated at checkout.
                        </p>
                    </div>
                    <span class="text-xl font-semibold">$ {{ cartTotalPrice }}</span>
                </div>
                <router-link :to="{ name: 'checkout' }">
                    <button
                        class="w-full mt-4 bg-black text-white py-2 rounded-lg hover:bg-slate-200 hover:text-black font-medium text-xl tracking-wide">
                        Checkout
                    </button>
                </router-link>
                <div class="text-center mt-4 text-lg">
                    <RouterLink :to="{ name: 'catalog' }" class="cursor-pointer border-b-2 border-black">
                        Or Continue Shopping
                    </RouterLink>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { computed, ref, watchEffect } from "vue";
    import CartProduct from "./CartProduct.vue";
    import { gsap } from "gsap";
    import { XMarkIcon } from "@heroicons/vue/24/outline";
    import { useLanguageStore } from "@/stores/language.js";
    import { useProductStore } from "@/stores/product";

    // Create references for Background and Cart Elements
    const background = ref(null);
    const cart = ref(null);

    const appStore = useLanguageStore();
    /* istanbul ignore next */
    const currentLanguage = computed(() => appStore.getCurrentLanguage);

    // Product store references
    const productStore = useProductStore();
    const cartProducts = computed(() => productStore.cartProducts);
    const cartTotalPrice = computed(() => productStore.totalCartPrice);

    // Props definition
    const props = defineProps({
        visible: {
            type: Boolean,
            required: true,
        },
    });
    const emit = defineEmits(["update:visible"]);

    // Watch for changes in the current language, and in the state of shoppingCartToggle
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
            if (cart.value) {
                gsap.fromTo(
                    cart.value,
                    {
                        x: cart.value.offsetWidth,
                    },
                    {
                        x: 0,
                        duration: 1,
                        ease: "power2.inOut",
                    }
                );
            }
        } else {
            document.body.style.overflow = "auto";
        }
    });

    const closeCart = () => {
        const tl = gsap.timeline({
            onComplete: () => {
                emit("update:visible", false);
            },
        });
        tl.fromTo(
            cart.value,
            { x: 0 },
            { x: cart.value.offsetWidth, duration: 1, ease: "power2.inOut" },
            0,
        );
        tl.fromTo(
            background.value,
            { opacity: 1 },
            { opacity: 0, duration: 1, ease: "power2.inOut" },
            0,
        );
    };

    /**
     * Add product to cart
     * @param {Object} product - The product to add
     */
    const addProduct = (product) => {
        productStore.addProductToCart(product);
    };

    /**
     * Remove product from cart
     * @param {Number} productId - The ID of the product to remove
     */
    const removeProduct = (product) => {
        productStore.removeProductFromCart(product);
    };

    const handleAddProduct = (product) => {
        addProduct(product);
    };

    const handleRemoveProduct = (payload) => {
        const product = typeof payload === "object"
            ? payload
            : productStore.cartProducts.find((item) => item.id === payload);

        if (product) {
            removeProduct(product);
        }
    };
    /* istanbul ignore next */
</script>
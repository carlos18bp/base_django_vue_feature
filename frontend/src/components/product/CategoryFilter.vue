<template>
    <Disclosure as="div" v-for="category in categories" :key="category.name" class="border-b border-gray-200 py-6"
        v-slot="{ open }" data-testid="category-filter">
        <h3 class="-my-3 flow-root">
            <DisclosureButton
                class="flex w-full items-center justify-between py-3 text-sm text-gray-400 hover:text-gray-500" data-testid="category-filter-toggle">
                <span class="font-medium text-gray-900">{{ category.name }}</span>
                <span class="flex items-center">
                    <!-- Icon to indicate if the category is expanded or collapsed -->
                    <PlusIcon v-if="!open" class="h-5 w-5" aria-hidden="true" />
                    <MinusIcon v-else class="h-5 w-5" aria-hidden="true" />
                </span>
            </DisclosureButton>
        </h3>

        <!-- Sub-category filter for English language -->
        <SubCategoryFilter v-if="currentLanguage === 'en'" :subCategories="category.subCategories" />
    </Disclosure>
</template>

<script setup>
    import { Disclosure, DisclosureButton } from "@headlessui/vue";
    import { MinusIcon, PlusIcon } from "@heroicons/vue/20/solid";
    import SubCategoryFilter from "@/components/product/SubCategoryFilter.vue";

    // Props definition
    const props = defineProps({
        categories: Array,
        currentLanguage: String,
    });
</script>
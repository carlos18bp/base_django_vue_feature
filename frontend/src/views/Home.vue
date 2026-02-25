<template>
    <main class="mx-auto max-w-7xl px-8">
        <section class="py-12">
            <h1 class="text-4xl font-bold tracking-tight">
                Base Django + Vue Feature Template
            </h1>
            <p class="mt-3 text-gray-600">
                Example project with Django REST Framework, JWT auth, django_attachments, and a Vue 3 frontend.
            </p>

            <div class="mt-6 flex flex-wrap gap-3">
                <RouterLink class="bg-black text-white rounded px-4 py-2" :to="{ name: 'catalog' }">
                    Browse Catalog
                </RouterLink>
                <RouterLink class="border border-black rounded px-4 py-2" :to="{ name: 'blogs' }">
                    Read Blogs
                </RouterLink>
                <RouterLink class="border border-black rounded px-4 py-2" :to="{ name: 'dashboard' }">
                    Dashboard (JWT)
                </RouterLink>
            </div>
        </section>
    </main>

    <ProductCarousel></ProductCarousel>
    <BlogCarousel></BlogCarousel>
</template>

<script setup>
    import BlogCarousel from "@/components/blog/BlogCarousel.vue";
    import ProductCarousel from "@/components/product/ProductCarousel.vue";
</script>
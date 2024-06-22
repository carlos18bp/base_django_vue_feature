<template>
    <Header></Header>
    <div v-if="blogs.length" class="flex flex-col m-8 md:px-16">
        <div class="flex pb-12">
            <div class="w-full md:w-1/2 mt-4 -m-8 md:-m-0 md:mt-0">
                <img v-if="firstBlog" :src="`${firstBlog.image_url}`"
                    class="w-full md:h-96 object-cover" />
            </div>
            <div class="w-full md:w-1/2 flex flex-col justify-center pl-10 md:px-8">
                <RouterLink v-if="firstBlog.id"
                    :to="{
                        name: 'blog',
                        params: { blog_id: firstBlog.id },
                    }" >
                    <p v-if="currentLanguage === 'en'" 
                        class="tracking-widest text-lg md:text-xl uppercase pb-2">
                        {{ firstBlog.category }}
                    </p>
                    <h1 v-if="currentLanguage === 'en'" 
                        class="py-3 font-bold text-3xl md:text-5xl break-all">
                        {{ firstBlog.title }}                        
                    </h1>
                    <p v-if="currentLanguage === 'en'"
                        class="text-2xl line-clamp-3 pt-4">
                        {{ firstBlog.description }}
                    </p>
                </RouterLink>
            </div>
        </div>

        <div class="mb-16">
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-12 pb-8">
                <BlogPresentation v-for="blog in paginatedBlogs" :blog="blog"></BlogPresentation>
            </div>
            <nav class="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0">
                <!-- Previous page button -->
                <a class="cursor-pointer inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-slate-900 hover:text-slate-900"
                    @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                    <ArrowLongLeftIcon class="mr-3 h-5 w-5" aria-hidden="true" />
                    previous
                </a>

                <!-- Show page numbers -->
                <div class="hidden md:block">
                    <template v-for="page in totalPages" :key="page">
                        <a class="cursor-pointer inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium"
                            :class="{
                                'border-b-slate-400': currentPage === page,
                                'text-gray-500 hover:text-slate-900 hover:border-slate-900':
                                    currentPage !== page,
                            }" @click="goToPage(page)">
                            {{ page }}
                        </a>
                    </template>
                </div>

                <!-- Next page button -->
                <a class="cursor-pointer inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-slate-900 hover:text-slate-900"
                    @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
                    Next
                    <ArrowLongRightIcon class="ml-3 h-5 w-5" aria-hidden="true" />
                </a>
            </nav>
        </div>
    </div>
    <Footer></Footer>
</template>

<script setup>
    import { computed, onMounted, ref, reactive, watch, watchEffect } from "vue";
    import Header from "@/components/layouts/Header.vue";
    import Footer from "@/components/layouts/Footer.vue";
    import BlogPresentation from "@/components/blog/BlogPresentation.vue";
    import { ArrowLongLeftIcon, ArrowLongRightIcon } from "@heroicons/vue/20/solid";
    import { useAppStore } from '@/stores/language.js';
    import { useBlogStore } from "@/stores/blog";

    const appStore = useAppStore();
    const currentLanguage = computed(() => appStore.getCurrentLanguage);

    const blogStore = useBlogStore();
    const blogs = computed(() => blogStore.blogs);
    const firstBlog = reactive({});
    const currentPage = ref(1);

    /**
     * onMounted lifecycle hook
     * Fetches blogs data
     */
    onMounted(async () => {
        await blogStore.fetchBlogs();
        if (blogStore.blogs.length > 0) {
            Object.assign(firstBlog, blogStore.blogs[0]);
        }
    });

    let blogsPerPage;
    if (window.innerWidth >= 1024) {
        blogsPerPage = 6;
    } else if (window.innerWidth < 1024 && 760 <= window.innerWidth) {
        blogsPerPage = 4;
    } else if (window.innerWidth < 760) {
        blogsPerPage = 2;
    }

    // Calculate the total number of pages
    const totalPages = computed(() => {
        return Math.ceil(blogs.value.length / blogsPerPage);
    });

    // Calculate the blogs to display on the current page
    const paginatedBlogs = computed(() => {
        const start = (currentPage.value - 1) * blogsPerPage;
        const end = start + blogsPerPage;
        return blogs.value.slice(start, end);
    });

    // Property to store the scroll position
    const scrollPosition = ref(0);

    // Function to go to a specific page
    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            // Save current scroll position
            scrollPosition.value = window.scrollY;
            currentPage.value = page;

            setTimeout(() => {
                window.scrollTo(0, scrollPosition.value);
            }, 0);
        }
    };
</script>
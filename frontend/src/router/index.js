import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/Home.vue"),
    },
    {
      path: "/blog/:blog_id",
      name: "blog",
      component: () => import("@/views/blog/Detail.vue"),
    },
    {
      path: "/blog",
      name: "blogs",
      component: () => import("@/views/blog/List.vue"),
    },
    {
      path: "/product/:product_id",
      name: "product",
      component: () => import("@/views/product/Detail.vue"),
    },
    {
      path: "/catalog",
      name: "catalog",
      component: () => import("@/views/product/Catalog.vue"),
    },
    {
      path: "/about_us",
      name: "about_us",
      component: () => import("@/views/AboutUs.vue"),
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("@/views/Contact.vue"),
    },
  ],
});

export default router;
export const routes = router.options.routes;
import { createRouter, createWebHistory } from "vue-router";

import { useAuthStore } from "@/stores/auth";

const APP_NAME = 'Base Feature';

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, behavior: 'smooth' };
  },
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/Home.vue"),
      meta: { title: 'Home' },
    },
    {
      path: "/sign_in",
      name: "sign_in",
      component: () => import("@/views/auth/SignIn.vue"),
      meta: { requiresGuest: true, title: 'Sign In' },
    },
    {
      path: "/sign_up",
      name: "sign_up",
      component: () => import("@/views/auth/SignUp.vue"),
      meta: { requiresGuest: true, title: 'Sign Up' },
    },
    {
      path: "/dashboard",
      name: "dashboard",
      component: () => import("@/views/Dashboard.vue"),
      meta: { requiresAuth: true, title: 'Dashboard' },
    },
    {
      path: "/backoffice",
      name: "backoffice",
      component: () => import("@/views/Backoffice.vue"),
      meta: { requiresAuth: true, title: 'Backoffice' },
    },
    {
      path: "/blog/:blog_id",
      name: "blog",
      component: () => import("@/views/blog/Detail.vue"),
      meta: { title: 'Blog' },
    },
    {
      path: "/blogs",
      name: "blogs",
      component: () => import("@/views/blog/List.vue"),
      meta: { title: 'Blogs' },
    },
    {
      path: "/product/:product_id",
      name: "product",
      component: () => import("@/views/product/Detail.vue"),
      meta: { title: 'Product' },
    },
    {
      path: "/catalog",
      name: "catalog",
      component: () => import("@/views/product/Catalog.vue"),
      meta: { title: 'Catalog' },
    },
    {
      path: "/checkout",
      name: "checkout",
      component: () => import("@/views/product/Checkout.vue"),
      meta: { title: 'Checkout' },
    },
    {
      path: "/about_us",
      name: "about_us",
      component: () => import("@/views/AboutUs.vue"),
      meta: { title: 'About Us' },
    },
    {
      path: "/contact",
      name: "contact",
      component: () => import("@/views/Contact.vue"),
      meta: { title: 'Contact' },
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not_found",
      component: () => import("@/views/NotFound.vue"),
      meta: { title: 'Not Found' },
    },
  ],
});

router.beforeEach((to) => {
  const authStore = useAuthStore();

  if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
    return { name: "sign_in" };
  }

  if (to.meta?.requiresGuest && authStore.isAuthenticated) {
    return { name: "dashboard" };
  }

  return true;
});

router.afterEach((to) => {
  const title = to.meta?.title;
  document.title = title ? `${title} — ${APP_NAME}` : APP_NAME;
});

export default router;
export const routes = router.options.routes;

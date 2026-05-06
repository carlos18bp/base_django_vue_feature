<template>
  <div class="flex flex-col items-center justify-center min-h-screen text-center px-4">
    <h1 class="text-6xl font-bold text-foreground mb-4">404</h1>
    <p class="text-xl text-muted-foreground mb-8">Page not found.</p>
    <router-link
      to="/"
      class="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
    >
      Go home
    </router-link>
  </div>
</template>

<template>
  <RouterView/>
</template>

<script setup>
  import { onMounted } from 'vue'
  import { RouterView } from "vue-router";
  import { useProductStore } from '@/stores/product';

  // Initialize the product store
  const prductStore = useProductStore()

  /**
   * Fetch the list of products from the store when the component is mounted.
   */
  onMounted(() => {
    prductStore.fetchProducts()
  })
</script>
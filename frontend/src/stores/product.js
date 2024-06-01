import { defineStore } from 'pinia'
import { get_request } from "./services/request_http";

export const useProductStore = defineStore('productStore', {
  state: () => ({
    products: [],
    currentCategories: [],
    searchQuery: '',
  }),
  getters: {
    /**
     * Filters products based on current categories and search query.
     * 
     * @param {object} state - The state object.
     * @returns {array} - The filtered list of products.
     */
    filterProducts: (state) => {
      let filtered = state.products;

      if (state.currentCategories.length > 0) {
        filtered = filtered.filter(product => state.currentCategories.includes(product.category));
      }

      if (state.searchQuery) {
        filtered = filtered.filter(product => product.title.toLowerCase().includes(state.searchQuery.toLowerCase()));
      }

      return filtered;
    },
    /**
     * Retrieves the unique list of categories from the products.
     * 
     * @param {object} state - The state object.
     * @returns {array} - The list of categories.
     */
    categories: (state) => {
      const categorySet = new Set();
      if (Array.isArray(state.products)) {
        state.products.forEach(product => {
          categorySet.add(product.category);
        });
      }
      return Array.from(categorySet);
    }
  },
  actions: {
    /**
     * Fetches the list of products from the backend.
     */
    async fetchProducts() {
      try {
        const data = await get_request('products/');
        this.products = Array.isArray(data) ? data : []; // Ensure products is always an array
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    },
    /**
     * Sets the current categories for filtering.
     * 
     * @param {array} categories - The list of selected categories.
     */
    setCurrentCategories(categories) {
      this.currentCategories = categories;
    },
    /**
     * Sets the search query for filtering.
     * 
     * @param {string} query - The search query.
     */
    setSearchQuery(query) {
      this.searchQuery = query;
    }
  }
})
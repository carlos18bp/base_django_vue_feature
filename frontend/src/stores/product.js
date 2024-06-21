import { defineStore } from "pinia";
import { create_request, get_request } from "./services/request_http";

export const useProductStore = defineStore("productStore", {
  state: () => ({
    products: [],
    categories: [],
    filteredProducts: [],
    cartProducts: [],
    dataLoaded: false,
  }),
  getters: {
    /**
     * Get product by ID.
     * @param {object} state - State.
     * @returns {function} - Function to find product by ID.
     */
    productById: (state) => (productId) =>
      state.products.find((product) => product.id === productId),

    /**
     * Filter products by name and language
     * @param {Object} state - The current state of the store
     * @return {Function} - A function that takes a product name and language,
     *                      and returns a filtered list of products that match
     *                      the name in the specified language and have stock available
     */
    productsByName: (state) => (name) => {
      const lowerCaseName = name.toLowerCase();
      return state.products.filter((product) => {
        const productName = product.title.toLowerCase()
        return productName.includes(lowerCaseName);
      });
    },
    /**
     * Calculate total number of products in the cart.
     * @param {object} state - State.
     * @returns {number} - Total number of products in the cart.
     */
    totalCartProducts: (state) =>
      state.cartProducts.reduce(
        (total, product) => total + product.quantity,
        0
      ),

    /**
     * Calculate total price of products in the cart.
     * @param {object} state - State.
     * @returns {number} - Total price of products in the cart.
     */
    totalCartPrice: (state) =>
      state.cartProducts.reduce(
        (total, product) =>
          total + parseFloat(product.price) * product.quantity,
        0
      ),
  },
  actions: {
    /**
     * Fetches the list of products from the backend.
     */
    async fetchProducts() {
      if (this.dataLoaded) return;

      try {
        const response = await get_request("products-data/");
        this.products = Array.isArray(response.data) ? response.data : [];
        this.dataLoaded = true;
        this.filteredProducts = this.products;
        this.fetchUniqueCategoriesAndSubCategories();
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    },
    /**
     * Add product to the cart
     * @param {Object} addProduct - The product to add to the cart
     */
    addProductToCart(addProduct, quantity) {
      const existingProduct = this.cartProducts.find(
        (product) => product.id === addProduct.id
      );

      if (existingProduct) {
        existingProduct.quantity += quantity ? quantity : 1;
      } else {
        this.cartProducts.push({
          ...addProduct,
          quantity: quantity ? quantity : 1,
        });
      }
      localStorage.setItem("cartProducts", JSON.stringify(this.cartProducts));
    },
    /**
     * Remove product from the cart
     * @param {Number} removeProductId - The ID of the product to remove from the cart
     */
    removeProductFromCart(removeProduct) {
      const removeProductFound = this.cartProducts.find(
        (product) => product === removeProduct
      );

      if (removeProductFound.quantity > 1) {
        removeProductFound.quantity -= 1;
      } else {
        this.cartProducts = this.cartProducts.filter(
          (product) => product !== removeProductFound
        );
      }
      localStorage.setItem("cartProducts", JSON.stringify(this.cartProducts));
    },
    /**
     * Filter products by sub-category.
     */
    productBySubCategory() {
      const isChecked = (subCategory) => subCategory.checked;

      this.filteredProducts = this.products.filter((product) => {
        return this.categories.some((category) =>
          category.subCategories.some(
            (subCategory) =>
              isChecked(subCategory) &&
              product.sub_category === subCategory.name
          )
        );
      });

      if (this.filteredProducts.length === 0)
        this.filteredProducts = this.products;
    },

    /**
     * Fetch unique categories and subCategories from products.
     */
    async fetchUniqueCategoriesAndSubCategories() {
      if (!this.dataLoaded) await this.fetchProductsData();

      const categoryMap = new Map();

      this.products.forEach((product) => {
        // Process English categories and sub-categories
        if (!categoryMap.has(product.category)) {
          categoryMap.set(product.category, {
            name: product.category,
            subCategories: [],
          });
        }
        categoryMap
          .get(product.category)
          .subCategories.push({ name: product.sub_category, checked: false });
      });

      // Convert maps to arrays and remove duplicates
      this.categories = Array.from(categoryMap.values()).map((category) => ({
        ...category,
        subCategories: Array.from(
          new Set(category.subCategories.map((sub) => JSON.stringify(sub)))
        ).map((sub) => JSON.parse(sub)),
      }));
    },
    /**
     * Create a new sale
     * @param {Object} form - The form data for the sale
     * @returns {Number} - The response status of the sale creation request
     */
    async createSale(form) {
      try {
        const response = await create_request("create-sale/", {
          email: form.email,
          address: form.address,
          city: form.city,
          state: form.state,
          postal_code: form.postalCode,
          sold_products: form.soldProducts,
        });

        return response.status;
      } catch (error) {
        console.error("Error creating sale:", error);
      }
    },
  },
});

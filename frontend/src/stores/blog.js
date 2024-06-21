import { defineStore } from "pinia";
import { get_request } from "./services/request_http";

export const useBlogStore = defineStore("blog", {
  /**
   * Store state.
   * @returns {object} State object.
   */
  state: () => ({
    blogs: [],
    dataLoaded: false,
  }),

  getters: {
    /**
     * Get blog by ID.
     * @param {object} state - State.
     * @returns {function} - Function to find blog by ID.
     */
    blogById: (state) => (blogId) => {
      return state.blogs.find((blog) => blog.id == blogId);
    },
  },

  actions: {
    /**
     * Fetch blogs data from backend.
     */
    async fetchBlogs() {
      if (this.dataLoaded) return;

      try {
        let response = await get_request("blogs-data/");
        this.blogs = Array.isArray(response.data) ? response.data : [];
        this.dataLoaded = true;
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }
    },
  },
});
import { ref, computed } from "vue";
import { defineStore } from "pinia";
import { get_request } from "./services/request_http";

const normalizeMediaUrl = (url) => {
  if (!url || typeof url !== 'string') return url;
  const mediaIndex = url.indexOf('/media/');
  if (mediaIndex === -1) return url;
  return url.slice(mediaIndex);
};

export const useBlogStore = defineStore("blog", () => {
  const blogs = ref([]);
  const dataLoaded = ref(false);

  /**
   * Get blog by ID.
   * @param {number|string} blogId - Blog ID.
   * @returns {object|undefined} - Blog object or undefined.
   */
  const blogById = computed(() => (blogId) =>
    blogs.value.find((blog) => blog.id == blogId)
  );

  /**
   * Fetch blogs data from backend.
   */
  async function fetchBlogs() {
    if (dataLoaded.value) return;

    try {
      const response = await get_request("blogs/");
      blogs.value = Array.isArray(response.data)
        ? response.data.map((b) => ({ ...b, image_url: normalizeMediaUrl(b.image_url) }))
        : [];
      dataLoaded.value = true;
    } catch (error) {
      console.error('Failed to fetch blogs:', error);
    }
  }

  return { blogs, dataLoaded, blogById, fetchBlogs };
});
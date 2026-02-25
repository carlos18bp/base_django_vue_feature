import { setActivePinia, createPinia } from "pinia";
import { useBlogStore } from "@/stores/blog";

// Mock the request_http module
jest.mock("@/stores/services/request_http", () => ({
  get_request: jest.fn(),
}));

import { get_request } from "@/stores/services/request_http";

describe("Blog Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
  });

  describe("Initial State", () => {
    test("should initialize with default state", () => {
      const store = useBlogStore();
      expect(store.blogs).toEqual([]);
      expect(store.dataLoaded).toBe(false);
    });
  });

  describe("Getters", () => {
    test("blogById should return blog by id", () => {
      const store = useBlogStore();
      store.blogs = [
        { id: 1, title: "Blog 1", description: "Desc 1" },
        { id: 2, title: "Blog 2", description: "Desc 2" },
        { id: 3, title: "Blog 3", description: "Desc 3" },
      ];

      const blog = store.blogById(2);
      expect(blog).toEqual({ id: 2, title: "Blog 2", description: "Desc 2" });
    });

    test("blogById should handle string id", () => {
      const store = useBlogStore();
      store.blogs = [
        { id: 1, title: "Blog 1", description: "Desc 1" },
      ];

      const blog = store.blogById("1");
      expect(blog).toEqual({ id: 1, title: "Blog 1", description: "Desc 1" });
    });

    test("blogById should return undefined if not found", () => {
      const store = useBlogStore();
      store.blogs = [
        { id: 1, title: "Blog 1", description: "Desc 1" },
      ];

      const blog = store.blogById(999);
      expect(blog).toBeUndefined();
    });
  });

  describe("Actions - fetchBlogs", () => {
    test("should fetch blogs successfully", async () => {
      const store = useBlogStore();
      const mockBlogs = [
        { id: 1, title: "Blog 1", category: "Tech", description: "Description 1" },
        { id: 2, title: "Blog 2", category: "Health", description: "Description 2" },
      ];

      get_request.mockResolvedValue({ data: mockBlogs });

      await store.fetchBlogs();

      expect(store.blogs).toEqual(mockBlogs);
      expect(store.dataLoaded).toBe(true);
      expect(get_request).toHaveBeenCalledWith("blogs/");
    });

    test("should not fetch if data already loaded", async () => {
      const store = useBlogStore();
      store.dataLoaded = true;

      await store.fetchBlogs();

      expect(get_request).not.toHaveBeenCalled();
    });

    test("should handle non-array response", async () => {
      const store = useBlogStore();
      get_request.mockResolvedValue({ data: null });

      await store.fetchBlogs();

      expect(store.blogs).toEqual([]);
      expect(store.dataLoaded).toBe(true);
    });

    test("should handle fetch error", async () => {
      const store = useBlogStore();
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      get_request.mockRejectedValue(new Error("Network error"));

      await store.fetchBlogs();

      expect(store.blogs).toEqual([]);
      expect(store.dataLoaded).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Failed to fetch blogs:",
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });

    test("should handle empty array response", async () => {
      const store = useBlogStore();
      get_request.mockResolvedValue({ data: [] });

      await store.fetchBlogs();

      expect(store.blogs).toEqual([]);
      expect(store.dataLoaded).toBe(true);
    });

    test("should normalize image_url media paths", async () => {
      const store = useBlogStore();
      const mockBlogs = [
        { id: 1, title: "Blog 1", image_url: "http://localhost:8000/media/img1.jpg" },
        { id: 2, title: "Blog 2", image_url: "/media/img2.jpg" },
        { id: 3, title: "Blog 3", image_url: "https://example.com/other.png" },
        { id: 4, title: "Blog 4", image_url: null },
      ];

      get_request.mockResolvedValue({ data: mockBlogs });

      await store.fetchBlogs();

      expect(store.blogs[0].image_url).toBe("/media/img1.jpg");
      expect(store.blogs[1].image_url).toBe("/media/img2.jpg");
      expect(store.blogs[2].image_url).toBe("https://example.com/other.png");
      expect(store.blogs[3].image_url).toBeNull();
    });
  });
});

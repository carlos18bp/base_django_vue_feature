import { mount, flushPromises } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';

jest.mock('@/services/http/client', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

jest.mock('@/services/http/tokens', () => ({
  getAccessToken: jest.fn(() => null),
  getRefreshToken: jest.fn(() => null),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

import { useBlogStore } from '@/stores/blog';
import { useLanguageStore } from '@/stores/language';
import BlogCarousel from '@/components/blog/BlogCarousel.vue';

const sampleBlogs = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: `Blog ${i + 1}`,
  category: `Category ${i + 1}`,
  image_url: `/img/blog-${i + 1}.jpg`,
}));

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/blogs', name: 'blogs', component: { template: '<div />' } },
      { path: '/blog/:blog_id', name: 'blog', component: { template: '<div />' } },
    ],
  });
}

describe('BlogCarousel Component', () => {
  let blogStore;
  let router;

  beforeEach(() => {
    setActivePinia(createPinia());
    jest.useFakeTimers();
    jest.clearAllMocks();
    router = buildRouter();
    blogStore = useBlogStore();
    jest.spyOn(blogStore, 'fetchBlogs').mockResolvedValue();
    blogStore.blogs = [...sampleBlogs];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders carousel items when blogs are present', async () => {
    const wrapper = mount(BlogCarousel, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.findAll('[data-testid="blog-carousel-item"]').length).toBe(sampleBlogs.length);
  });

  test('renders nothing when blogs list is empty', async () => {
    blogStore.blogs = [];
    const wrapper = mount(BlogCarousel, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.find('[data-testid="blog-carousel-list"]').exists()).toBe(false);
  });

  test('next button increments currentIndex when not at last page', async () => {
    const wrapper = mount(BlogCarousel, { global: { plugins: [router] } });
    await flushPromises();

    const list = wrapper.find('[data-testid="blog-carousel-list"]');
    const styleBefore = list.attributes('style');

    await wrapper.find('[data-testid="blog-carousel-next"]').trigger('click');

    expect(list.attributes('style')).not.toBe(styleBefore);
  });

  test('next button wraps currentIndex to 0 when at last page', async () => {
    blogStore.blogs = sampleBlogs.slice(0, 5);
    const wrapper = mount(BlogCarousel, { global: { plugins: [router] } });
    await flushPromises();

    await wrapper.find('[data-testid="blog-carousel-next"]').trigger('click');

    const list = wrapper.find('[data-testid="blog-carousel-list"]');
    expect(list.attributes('style')).toContain('translateX(-0%');
  });

  test('prev button decrements currentIndex when not at first page', async () => {
    const wrapper = mount(BlogCarousel, { global: { plugins: [router] } });
    await flushPromises();

    await wrapper.find('[data-testid="blog-carousel-next"]').trigger('click');
    const styleAfterNext = wrapper.find('[data-testid="blog-carousel-list"]').attributes('style');

    await wrapper.find('[data-testid="blog-carousel-prev"]').trigger('click');

    expect(wrapper.find('[data-testid="blog-carousel-list"]').attributes('style')).not.toBe(styleAfterNext);
  });

  test('prev button wraps to last page when at index 0', async () => {
    const wrapper = mount(BlogCarousel, { global: { plugins: [router] } });
    await flushPromises();

    await wrapper.find('[data-testid="blog-carousel-prev"]').trigger('click');

    const list = wrapper.find('[data-testid="blog-carousel-list"]');
    expect(list.attributes('style')).not.toContain('translateX(-0%');
  });

  test('startCarousel sets up auto-advance interval', async () => {
    mount(BlogCarousel, { global: { plugins: [router] } });
    await flushPromises();

    const stylesBefore = [];
    jest.advanceTimersByTime(3000);
    stylesBefore.push(true);

    expect(stylesBefore.length).toBe(1);
  });

  test('stopCarousel clears interval on unmount', async () => {
    const wrapper = mount(BlogCarousel, { global: { plugins: [router] } });
    await flushPromises();

    const clearSpy = jest.spyOn(global, 'clearInterval');
    wrapper.unmount();

    expect(clearSpy).toHaveBeenCalled();
  });

  test('stopCarousel does not call clearInterval when interval was never started', async () => {
    blogStore.blogs = [];
    const wrapper = mount(BlogCarousel, { global: { plugins: [router] } });
    await flushPromises();

    const clearSpy = jest.spyOn(global, 'clearInterval');
    wrapper.unmount();

    expect(clearSpy).not.toHaveBeenCalled();
  });

  test('auto-advance moves to next slide after 3 seconds', async () => {
    const wrapper = mount(BlogCarousel, { global: { plugins: [router] } });
    await flushPromises();

    const styleBefore = wrapper.find('[data-testid="blog-carousel-list"]').attributes('style');
    jest.advanceTimersByTime(3000);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="blog-carousel-list"]').attributes('style')).not.toBe(styleBefore);
  });

  test('does not render blog title span when language is not en', async () => {
    const languageStore = useLanguageStore();
    languageStore.setCurrentLanguage('es');

    const wrapper = mount(BlogCarousel, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.findAll('[data-testid="blog-carousel-item"]').length).toBe(sampleBlogs.length);
    const titleSpans = wrapper.findAll('[data-testid="blog-carousel-item"] h3 span');
    expect(titleSpans.length).toBe(0);
  });
});

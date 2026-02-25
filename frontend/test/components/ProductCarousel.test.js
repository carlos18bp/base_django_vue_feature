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

import { useProductStore } from '@/stores/product';
import { useLanguageStore } from '@/stores/language';
import ProductCarousel from '@/components/product/ProductCarousel.vue';

const sampleProducts = Array.from({ length: 6 }, (_, i) => ({
  id: i + 1,
  title: `Product ${i + 1}`,
  price: (i + 1) * 10,
  gallery_urls: [`/img/product-${i + 1}.jpg`],
}));

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/catalog', name: 'catalog', component: { template: '<div />' } },
      { path: '/product/:product_id', name: 'product', component: { template: '<div />' } },
    ],
  });
}

describe('ProductCarousel Component', () => {
  let productStore;
  let router;

  beforeEach(() => {
    setActivePinia(createPinia());
    jest.useFakeTimers();
    jest.clearAllMocks();
    router = buildRouter();
    productStore = useProductStore();
    jest.spyOn(productStore, 'fetchProducts').mockResolvedValue();
    productStore.products = [...sampleProducts];
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('renders carousel items when products are present', async () => {
    const wrapper = mount(ProductCarousel, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.findAll('[data-testid="product-carousel-item"]').length).toBe(sampleProducts.length);
  });

  test('renders nothing when products list is empty', async () => {
    productStore.products = [];
    const wrapper = mount(ProductCarousel, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.find('[data-testid="product-carousel-list"]').exists()).toBe(false);
  });

  test('next button increments currentIndex when not at last page', async () => {
    const wrapper = mount(ProductCarousel, { global: { plugins: [router] } });
    await flushPromises();

    const list = wrapper.find('[data-testid="product-carousel-list"]');
    const styleBefore = list.attributes('style');

    await wrapper.find('[data-testid="product-carousel-next"]').trigger('click');

    expect(list.attributes('style')).not.toBe(styleBefore);
  });

  test('next button wraps currentIndex to 0 when at last page', async () => {
    productStore.products = sampleProducts.slice(0, 5);
    const wrapper = mount(ProductCarousel, { global: { plugins: [router] } });
    await flushPromises();

    await wrapper.find('[data-testid="product-carousel-next"]').trigger('click');

    const list = wrapper.find('[data-testid="product-carousel-list"]');
    expect(list.attributes('style')).toContain('translateX(-0%');
  });

  test('prev button decrements currentIndex when not at first page', async () => {
    const wrapper = mount(ProductCarousel, { global: { plugins: [router] } });
    await flushPromises();

    await wrapper.find('[data-testid="product-carousel-next"]').trigger('click');
    const styleAfterNext = wrapper.find('[data-testid="product-carousel-list"]').attributes('style');

    await wrapper.find('[data-testid="product-carousel-prev"]').trigger('click');

    expect(wrapper.find('[data-testid="product-carousel-list"]').attributes('style')).not.toBe(styleAfterNext);
  });

  test('prev button wraps to last page when at index 0', async () => {
    const wrapper = mount(ProductCarousel, { global: { plugins: [router] } });
    await flushPromises();

    await wrapper.find('[data-testid="product-carousel-prev"]').trigger('click');

    const list = wrapper.find('[data-testid="product-carousel-list"]');
    expect(list.attributes('style')).not.toContain('translateX(-0%');
  });

  test('stopCarousel clears interval on unmount', async () => {
    const wrapper = mount(ProductCarousel, { global: { plugins: [router] } });
    await flushPromises();

    const clearSpy = jest.spyOn(global, 'clearInterval');
    wrapper.unmount();

    expect(clearSpy).toHaveBeenCalled();
  });

  test('stopCarousel does not call clearInterval when interval was never started', async () => {
    productStore.products = [];
    const wrapper = mount(ProductCarousel, { global: { plugins: [router] } });
    await flushPromises();

    const clearSpy = jest.spyOn(global, 'clearInterval');
    wrapper.unmount();

    expect(clearSpy).not.toHaveBeenCalled();
  });

  test('auto-advance moves to next slide after 3 seconds', async () => {
    const wrapper = mount(ProductCarousel, { global: { plugins: [router] } });
    await flushPromises();

    const styleBefore = wrapper.find('[data-testid="product-carousel-list"]').attributes('style');
    jest.advanceTimersByTime(3000);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('[data-testid="product-carousel-list"]').attributes('style')).not.toBe(styleBefore);
  });

  test('does not render product title span when language is not en', async () => {
    const languageStore = useLanguageStore();
    languageStore.setCurrentLanguage('es');

    const wrapper = mount(ProductCarousel, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.findAll('[data-testid="product-carousel-item"]').length).toBe(sampleProducts.length);
    const titleSpans = wrapper.findAll('[data-testid="product-carousel-item"] h3 span');
    expect(titleSpans.length).toBe(0);
  });
});

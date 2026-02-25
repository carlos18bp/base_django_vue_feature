import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import { createRouter, createMemoryHistory } from 'vue-router';

jest.mock('@/services/http/client', () => ({
  default: { get: jest.fn(), post: jest.fn() },
}));

jest.mock('@/services/http/tokens', () => ({
  getAccessToken: jest.fn(() => null),
  getRefreshToken: jest.fn(() => null),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

import Home from '@/views/Home.vue';

const stubs = {
  BlogCarousel: { name: 'BlogCarousel', template: '<div data-testid="blog-carousel" />' },
  ProductCarousel: { name: 'ProductCarousel', template: '<div data-testid="product-carousel" />' },
  RouterLink: { props: ['to'], template: '<a><slot /></a>' },
};

function buildRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div />' } },
      { path: '/catalog', name: 'catalog', component: { template: '<div />' } },
      { path: '/blogs', name: 'blogs', component: { template: '<div />' } },
      { path: '/dashboard', name: 'dashboard', component: { template: '<div />' } },
    ],
  });
}

describe('Home View', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
  });

  test('renders main heading', () => {
    const wrapper = mount(Home, {
      global: { plugins: [buildRouter()], stubs },
    });
    expect(wrapper.text()).toContain('Base Django + Vue Feature Template');
  });

  test('renders description text', () => {
    const wrapper = mount(Home, {
      global: { plugins: [buildRouter()], stubs },
    });
    expect(wrapper.text()).toContain('Django REST Framework');
  });

  test('renders ProductCarousel component', () => {
    const wrapper = mount(Home, {
      global: { plugins: [buildRouter()], stubs },
    });
    expect(wrapper.find('[data-testid="product-carousel"]').exists()).toBe(true);
  });

  test('renders BlogCarousel component', () => {
    const wrapper = mount(Home, {
      global: { plugins: [buildRouter()], stubs },
    });
    expect(wrapper.find('[data-testid="blog-carousel"]').exists()).toBe(true);
  });

  test('renders Browse Catalog link', () => {
    const wrapper = mount(Home, {
      global: { plugins: [buildRouter()], stubs },
    });
    expect(wrapper.text()).toContain('Browse Catalog');
  });

  test('renders Read Blogs link', () => {
    const wrapper = mount(Home, {
      global: { plugins: [buildRouter()], stubs },
    });
    expect(wrapper.text()).toContain('Read Blogs');
  });

  test('renders Dashboard link', () => {
    const wrapper = mount(Home, {
      global: { plugins: [buildRouter()], stubs },
    });
    expect(wrapper.text()).toContain('Dashboard');
  });
});

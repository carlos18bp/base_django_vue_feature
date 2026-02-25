import { setActivePinia, createPinia } from 'pinia';

jest.mock('@/stores/product', () => ({
  useProductStore: jest.fn(),
}));

import { useProductStore } from '@/stores/product';
import globalMixin from '@/mixins/globalMixin';

describe('globalMixin', () => {
  let mockProductStore;

  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
    localStorage.clear();

    mockProductStore = { cartProducts: [] };
    useProductStore.mockReturnValue(mockProductStore);
  });

  describe('created hook', () => {
    test('restores cartProducts from localStorage when data is present', () => {
      const storedProducts = [{ id: 1, title: 'Product A', quantity: 2 }];
      localStorage.setItem('cartProducts', JSON.stringify(storedProducts));

      globalMixin.created.call({});

      expect(mockProductStore.cartProducts).toEqual(storedProducts);
    });

    test('sets cartProducts to empty array when localStorage has no data', () => {
      globalMixin.created.call({});

      expect(mockProductStore.cartProducts).toEqual([]);
    });

    test('sets cartProducts to empty array when localStorage value is null', () => {
      localStorage.removeItem('cartProducts');

      globalMixin.created.call({});

      expect(mockProductStore.cartProducts).toEqual([]);
    });

    test('calls useProductStore to get the store instance', () => {
      globalMixin.created.call({});

      expect(useProductStore).toHaveBeenCalledTimes(1);
    });
  });

  describe('methods', () => {
    test('globalMethod is defined', () => {
      expect(typeof globalMixin.methods.globalMethod).toBe('function');
    });

    test('globalMethod executes without throwing', () => {
      expect(() => globalMixin.methods.globalMethod()).not.toThrow();
    });
  });
});

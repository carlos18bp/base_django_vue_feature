import '@testing-library/jest-dom';

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true,
  });
}
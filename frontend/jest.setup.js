import '@testing-library/jest-dom';

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
  stopTimer: jest.fn(),
  resumeTimer: jest.fn(),
}));

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'scrollTo', {
    value: jest.fn(),
    writable: true,
  });
}
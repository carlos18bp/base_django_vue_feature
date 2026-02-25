import { showNotification } from '@/helpers/notification';

jest.mock('sweetalert2', () => ({
  fire: jest.fn(),
  stopTimer: jest.fn(),
  resumeTimer: jest.fn(),
}));

import Swal from 'sweetalert2';

describe('showNotification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('calls Swal.fire with the provided message as title', () => {
    showNotification('Operation successful');
    expect(Swal.fire).toHaveBeenCalledTimes(1);
    const config = Swal.fire.mock.calls[0][0];
    expect(config.title).toBe('Operation successful');
  });

  test('defaults to info icon type when no type is provided', () => {
    showNotification('Hello');
    const config = Swal.fire.mock.calls[0][0];
    expect(config.icon).toBe('info');
  });

  test('uses the provided type as icon', () => {
    showNotification('Success!', 'success');
    const config = Swal.fire.mock.calls[0][0];
    expect(config.icon).toBe('success');
  });

  test('uses error type correctly', () => {
    showNotification('Something went wrong', 'error');
    const config = Swal.fire.mock.calls[0][0];
    expect(config.icon).toBe('error');
  });

  test('uses warning type correctly', () => {
    showNotification('Be careful', 'warning');
    const config = Swal.fire.mock.calls[0][0];
    expect(config.icon).toBe('warning');
  });

  test('configures toast as true', () => {
    showNotification('Test');
    const config = Swal.fire.mock.calls[0][0];
    expect(config.toast).toBe(true);
  });

  test('sets showConfirmButton to false', () => {
    showNotification('Test');
    const config = Swal.fire.mock.calls[0][0];
    expect(config.showConfirmButton).toBe(false);
  });

  test('positions toast at top-end', () => {
    showNotification('Test');
    const config = Swal.fire.mock.calls[0][0];
    expect(config.position).toBe('top-end');
  });

  test('sets a timer duration', () => {
    showNotification('Test');
    const config = Swal.fire.mock.calls[0][0];
    expect(config.timer).toBeGreaterThan(0);
  });

  test('didOpen callback attaches mouseenter listener that calls Swal.stopTimer', () => {
    showNotification('Test');
    const config = Swal.fire.mock.calls[0][0];

    const listeners = {};
    const mockToast = {
      addEventListener: jest.fn((event, handler) => {
        listeners[event] = handler;
      }),
    };

    config.didOpen(mockToast);
    listeners['mouseenter']();

    expect(Swal.stopTimer).toHaveBeenCalled();
  });

  test('didOpen callback attaches mouseleave listener that calls Swal.resumeTimer', () => {
    showNotification('Test');
    const config = Swal.fire.mock.calls[0][0];

    const listeners = {};
    const mockToast = {
      addEventListener: jest.fn((event, handler) => {
        listeners[event] = handler;
      }),
    };

    config.didOpen(mockToast);
    listeners['mouseleave']();

    expect(Swal.resumeTimer).toHaveBeenCalled();
  });
});

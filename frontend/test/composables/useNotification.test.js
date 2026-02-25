import { useNotification } from '@/composables/useNotification';

describe('useNotification composable', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('initializes with empty message and info type', () => {
    const { message, type } = useNotification();
    expect(message.value).toBe('');
    expect(type.value).toBe('info');
  });

  test('notify sets message and type', () => {
    const { message, type, notify } = useNotification();
    notify('Something went wrong', 'error');
    expect(message.value).toBe('Something went wrong');
    expect(type.value).toBe('error');
  });

  test('notify defaults to info level', () => {
    const { type, notify } = useNotification();
    notify('Hello');
    expect(type.value).toBe('info');
  });

  test('clear resets message and type', () => {
    const { message, type, notify, clear } = useNotification();
    notify('temp', 'warning');
    clear();
    expect(message.value).toBe('');
    expect(type.value).toBe('info');
  });

  test('auto-clears after duration', () => {
    const { message, notify } = useNotification();
    notify('auto clear', 'success', 3000);
    expect(message.value).toBe('auto clear');
    jest.advanceTimersByTime(3000);
    expect(message.value).toBe('');
  });

  test('does not auto-clear when duration is 0', () => {
    const { message, notify } = useNotification();
    notify('persistent', 'info', 0);
    jest.advanceTimersByTime(60000);
    expect(message.value).toBe('persistent');
  });
});

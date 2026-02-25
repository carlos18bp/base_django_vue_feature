import { ref } from 'vue';

/**
 * Composable for lightweight in-app notifications.
 *
 * @returns {{ message: Ref<string>, type: Ref<string>, notify: Function, clear: Function }}
 */
export function useNotification() {
  const message = ref('');
  const type = ref('info');

  /**
   * Show a notification.
   * @param {string} text - Message to display.
   * @param {'info'|'success'|'warning'|'error'} level - Notification level.
   * @param {number} [duration=4000] - Auto-clear after ms (0 = never).
   */
  function notify(text, level = 'info', duration = 4000) {
    message.value = text;
    type.value = level;

    if (duration > 0) {
      setTimeout(() => clear(), duration);
    }
  }

  /**
   * Clear the current notification.
   */
  function clear() {
    message.value = '';
    type.value = 'info';
  }

  return { message, type, notify, clear };
}

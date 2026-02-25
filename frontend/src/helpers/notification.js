import Swal from 'sweetalert2';

/**
 * Shows a notification message using SweetAlert2
 * @param {string} message - The message to display
 * @param {string} type - The type of notification ('success', 'error', 'warning', 'info')
 */
export const showNotification = (message, type = 'info') => {
  const config = {
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon: type,
    title: message,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  };

  Swal.fire(config);
};

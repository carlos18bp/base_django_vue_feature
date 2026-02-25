import api from '@/services/http/client';
import { showNotification } from './notification';
import { decodeCredential } from 'vue3-google-login';

/**
 * Handles the login/signup process with Google
 * @param {Object} response - The response object from Google login
 * @param {Object} router - The router instance to handle navigation
 * @param {Object} authStore - The authentication store instance
 */
export const loginWithGoogle = async (response, router, authStore) => {
  try {
    if (!response?.credential) {
      showNotification('Google login failed', 'error');
      return;
    }
    const decodedCredential = decodeCredential(response.credential);

    // Send the user's data to the backend
    const res = await api.post('google_login/', {
      credential: response.credential,
      email: decodedCredential.email,
      given_name: decodedCredential.given_name,
      family_name: decodedCredential.family_name,
      picture: decodedCredential.picture,
    });

    // Log in the user and save the authentication data
    authStore.login(res.data);

    // Check if the user was created or just logged in
    if (res.data.created) {
      showNotification('Registration successful!', 'success');
    } else {
      showNotification('Sign in successful!', 'success');
    }

    // Reload the page to ensure a clean state
    window.location.href = '/dashboard';
  } catch (error) {
    console.error('Error during Google login:', error);
    const message =
      error?.response?.data?.error ||
      error?.response?.data?.detail ||
      (typeof error?.response?.data === 'string' ? error.response.data : null) ||
      error?.message ||
      'Error during Google authentication';
    showNotification(message, 'error');
  }
};

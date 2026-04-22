import { defineStore } from 'pinia';
import axios from 'axios';
import api from '@/services/http/client';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/services/http/tokens';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: (() => {
      try {
        return JSON.parse(localStorage.getItem('user')) || null;
      } catch {
        return null;
      }
    })(),
    token: getAccessToken(),
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token && state.user?.id),
  },
  actions: {
    /**
     * Logs in the user by setting the token and user details
     * @param {Object} data - The user data containing the access token and user details
     */
    login(data) {
      this.token = data.access;
      this.accessToken = data.access;
      this.refreshToken = data.refresh;
      this.user = data.user;

      if (this.token) {
        setTokens({ access: data.access, refresh: data.refresh });
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        localStorage.setItem('user', JSON.stringify(this.user));
      }
    },

    /**
     * Legacy signIn method for backwards compatibility
     */
    async signIn({ email, password }) {
      const response = await api.post('token/', { email, password });
      const { access, refresh, user } = response.data;
      
      this.login({
        access,
        refresh,
        user: user || { email }
      });
    },

    /**
     * Logs out the user by clearing the token and user details
     */
    logout() {
      clearTokens();
      this.token = null;
      this.accessToken = null;
      this.refreshToken = null;
      this.user = null;
      localStorage.removeItem('user');
      delete axios.defaults.headers.common['Authorization'];
    },

    /**
     * Legacy signOut method for backwards compatibility
     */
    signOut() {
      this.logout();
    },

    restoreSessionFromTokens() {
      const access = getAccessToken();
      const refresh = getRefreshToken();

      this.token = access;
      this.accessToken = access;
      this.refreshToken = refresh;

      if (access) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      } else {
        delete axios.defaults.headers.common['Authorization'];
      }
    },

    /**
     * Validates the current authentication token with the server
     */
    async validateToken() {
      if (!this.token) return false;

      try {
        const response = await api.get('validate_token/');
        if (response?.data?.user) {
          this.user = response.data.user;
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return true;
      } catch (error) {
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          this.logout();
        }
        return false;
      }
    },

    async restoreSession() {
      this.restoreSessionFromTokens();
      if (!this.token) return false;
      return await this.validateToken();
    },

    /**
     * Checks if the user is authenticated by validating the token
     */
    async checkAuth() {
      if (!this.token || !this.user?.id) return false;
      return await this.validateToken();
    },
  },
  persist: true,
});

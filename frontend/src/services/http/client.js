import axios from 'axios';

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/services/http/tokens';

const api = axios.create({
  baseURL: '/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    const status = error?.response?.status;

    if (!originalRequest || status !== 401 || originalRequest._retry) {
      throw error;
    }

    const refresh = getRefreshToken();
    if (!refresh) {
      clearTokens();
      throw error;
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = axios.post('/api/token/refresh/', { refresh });
      }
      const response = await refreshPromise;
      const { access } = response.data;
      setTokens({ access });
      refreshPromise = null;

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${access}`;
      return api(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      clearTokens();
      throw refreshError;
    }
  }
);

export default api;

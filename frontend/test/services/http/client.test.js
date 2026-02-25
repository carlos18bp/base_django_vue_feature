import axios from 'axios';
import api from '@/services/http/client';
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from '@/services/http/tokens';

jest.mock('axios', () => {
  const requestHandlers = [];
  const responseHandlers = {};

  const apiFn = jest.fn();
  apiFn.interceptors = {
    request: {
      use: jest.fn((fn) => {
        requestHandlers.push(fn);
      }),
    },
    response: {
      use: jest.fn((onFulfilled, onRejected) => {
        responseHandlers.onFulfilled = onFulfilled;
        responseHandlers.onRejected = onRejected;
      }),
    },
  };
  apiFn.get = jest.fn();
  apiFn.post = jest.fn();

  const axiosMock = {
    create: jest.fn(() => apiFn),
    post: jest.fn(),
    __requestHandlers: requestHandlers,
    __responseHandlers: responseHandlers,
    __apiInstance: apiFn,
  };

  return {
    __esModule: true,
    default: axiosMock,
  };
});

jest.mock('@/services/http/tokens', () => ({
  getAccessToken: jest.fn(),
  getRefreshToken: jest.fn(),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

const getRequestHandler = () => {
  const axiosInstance = axios;
  return axiosInstance.__requestHandlers[0];
};

const getResponseErrorHandler = () => {
  const axiosInstance = axios;
  return axiosInstance.__responseHandlers.onRejected;
};

const getResponseSuccessHandler = () => {
  const axiosInstance = axios;
  return axiosInstance.__responseHandlers.onFulfilled;
};

describe('http client', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('adds Authorization header when access token exists', async () => {
    getAccessToken.mockReturnValue('token-123');
    const handler = getRequestHandler();

    const config = { headers: {} };
    const result = handler(config);

    expect(result.headers.Authorization).toBe('Bearer token-123');
  });

  test('initializes headers when missing and access token exists', () => {
    getAccessToken.mockReturnValue('token-456');
    const handler = getRequestHandler();

    const config = {};
    const result = handler(config);

    expect(result.headers.Authorization).toBe('Bearer token-456');
  });

  test('does not modify headers when no access token', async () => {
    getAccessToken.mockReturnValue(null);
    const handler = getRequestHandler();

    const config = { headers: {} };
    const result = handler(config);

    expect(result.headers.Authorization).toBeUndefined();
  });

  test('passes through non-401 error responses', async () => {
    const handler = getResponseErrorHandler();
    const error = { config: {}, response: { status: 500 } };

    await expect(handler(error)).rejects.toBe(error);
  });

  test('clears tokens when no refresh token on 401', async () => {
    const handler = getResponseErrorHandler();
    getRefreshToken.mockReturnValue(null);

    const error = { config: {}, response: { status: 401 } };

    await expect(handler(error)).rejects.toBe(error);
    expect(clearTokens).toHaveBeenCalled();
  });

  test('refreshes token and retries original request on 401', async () => {
    const axiosInstance = axios;
    const handler = getResponseErrorHandler();

    getRefreshToken.mockReturnValue('refresh-token');
    axiosInstance.post.mockResolvedValue({ data: { access: 'new-access' } });

    const originalRequest = { headers: {} };
    const error = { config: originalRequest, response: { status: 401 } };

    const resultPromise = handler(error);
    await resultPromise;

    expect(axiosInstance.post).toHaveBeenCalledWith('/api/token/refresh/', { refresh: 'refresh-token' });
    expect(setTokens).toHaveBeenCalledWith({ access: 'new-access' });
    expect(axiosInstance.__apiInstance).toHaveBeenCalledWith(originalRequest);
    expect(originalRequest.headers.Authorization).toBe('Bearer new-access');
  });

  test('reuses refresh promise when already refreshing', async () => {
    const axiosInstance = axios;
    const handler = getResponseErrorHandler();

    getRefreshToken.mockReturnValue('refresh-token');

    let resolveRefresh;
    const refreshPromise = new Promise((resolve) => {
      resolveRefresh = resolve;
    });
    axiosInstance.post.mockReturnValue(refreshPromise);

    const originalRequest1 = { headers: {} };
    const originalRequest2 = {};
    const error1 = { config: originalRequest1, response: { status: 401 } };
    const error2 = { config: originalRequest2, response: { status: 401 } };

    const promise1 = handler(error1);
    const promise2 = handler(error2);

    resolveRefresh({ data: { access: 'shared-access' } });
    await Promise.all([promise1, promise2]);

    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(axiosInstance.__apiInstance).toHaveBeenCalledTimes(2);
    expect(originalRequest2.headers.Authorization).toBe('Bearer shared-access');
  });

  test('clears tokens when refresh fails', async () => {
    const axiosInstance = axios;
    const handler = getResponseErrorHandler();

    getRefreshToken.mockReturnValue('refresh-token');
    const refreshError = new Error('refresh failed');
    axiosInstance.post.mockRejectedValue(refreshError);

    const error = { config: {}, response: { status: 401 } };

    await expect(handler(error)).rejects.toBe(refreshError);
    expect(clearTokens).toHaveBeenCalled();
  });

  test('passes through successful responses unchanged', () => {
    const handler = getResponseSuccessHandler();
    const response = { data: { ok: true } };

    const result = handler(response);

    expect(result).toBe(response);
  });
});

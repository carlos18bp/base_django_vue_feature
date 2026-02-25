import { setActivePinia, createPinia } from "pinia";

// Mock modules with inline functions
jest.mock("@/services/http/client", () => ({
  default: {
    post: jest.fn(),
  },
}));

jest.mock("@/services/http/tokens", () => ({
  getAccessToken: jest.fn(() => null),
  getRefreshToken: jest.fn(() => null),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
}));

import { useAuthStore } from "@/stores/auth";
import api from "@/services/http/client";
import * as tokens from "@/services/http/tokens";
import axios from "axios";

describe("Auth Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    jest.clearAllMocks();
    localStorage.clear();
    delete axios.defaults.headers.common["Authorization"];
  });

  describe("Initial State", () => {
    test("should initialize with default state structure", () => {
      const store = useAuthStore();
      expect(store).toHaveProperty("user");
      expect(store).toHaveProperty("accessToken");
      expect(store).toHaveProperty("refreshToken");
    });
  });

  describe("Getters", () => {
    test("isAuthenticated should return false when token or user is missing", () => {
      const store = useAuthStore();
      store.token = null;
      store.user = null;
      expect(store.isAuthenticated).toBe(false);
    });

    test("isAuthenticated should return true when token and user.id exist", () => {
      const store = useAuthStore();
      store.token = "test-token";
      store.user = { id: 1, email: "test@example.com" };
      expect(store.isAuthenticated).toBe(true);
    });
  });

  describe("Actions - signIn", () => {
    test("should update tokens after successful sign in", async () => {
      const store = useAuthStore();
      
      const mockCredentials = {
        email: "test@example.com",
        password: "password123",
      };
      const mockResponse = {
        data: {
          access: "new-access-token",
          refresh: "new-refresh-token",
        },
      };

      // Reset and configure mock for this specific test
      api.post = jest.fn().mockResolvedValue(mockResponse);

      await store.signIn(mockCredentials);

      expect(api.post).toHaveBeenCalledWith("token/", mockCredentials);
      expect(tokens.setTokens).toHaveBeenCalledWith({
        access: "new-access-token",
        refresh: "new-refresh-token",
      });
      expect(store.accessToken).toBe("new-access-token");
      expect(store.refreshToken).toBe("new-refresh-token");
    });

    test("should handle API errors correctly", async () => {
      const store = useAuthStore();
      
      const mockCredentials = {
        email: "wrong@example.com",
        password: "wrongpassword",
      };

      // Reset and configure mock for this specific test
      api.post = jest.fn().mockRejectedValue(new Error("Invalid credentials"));

      await expect(store.signIn(mockCredentials)).rejects.toThrow("Invalid credentials");
    });
  });

  describe("Actions - login", () => {
    test("does not persist tokens when access token is missing", () => {
      const store = useAuthStore();

      store.login({ access: null, refresh: null, user: { id: 1, email: "test@example.com" } });

      expect(tokens.setTokens).not.toHaveBeenCalled();
      expect(localStorage.getItem("user")).toBeNull();
      expect(axios.defaults.headers.common.Authorization).toBeUndefined();
    });
  });

  describe("Actions - signOut", () => {
    test("should clear all auth data on sign out", () => {
      const store = useAuthStore();
      store.accessToken = "test-access-token";
      store.refreshToken = "test-refresh-token";
      store.user = { id: 1, email: "test@example.com" };

      store.signOut();

      expect(tokens.clearTokens).toHaveBeenCalled();
      expect(store.accessToken).toBeNull();
      expect(store.refreshToken).toBeNull();
      expect(store.user).toBeNull();
    });

    test("should safely sign out when not authenticated", () => {
      const store = useAuthStore();
      store.accessToken = null;
      store.refreshToken = null;
      store.user = null;

      expect(() => store.signOut()).not.toThrow();
      expect(tokens.clearTokens).toHaveBeenCalled();
    });
  });

  describe("Actions - validateToken and checkAuth", () => {
    test("validateToken returns false when no token is present", async () => {
      const store = useAuthStore();
      store.token = null;

      const result = await store.validateToken();

      expect(result).toBe(false);
    });

    test("validateToken does not logout on non-auth errors", async () => {
      const store = useAuthStore();
      store.token = "test-token";
      store.user = { id: 1, email: "test@example.com" };

      api.get = jest.fn().mockRejectedValue({ response: { status: 500 } });
      const logoutSpy = jest.spyOn(store, "logout");

      const result = await store.validateToken();

      expect(logoutSpy).not.toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test("validateToken logs out on 403 error", async () => {
      const store = useAuthStore();
      store.token = "test-token";
      store.user = { id: 1, email: "test@example.com" };

      api.get = jest.fn().mockRejectedValue({ response: { status: 403 } });
      const logoutSpy = jest.spyOn(store, "logout");

      const result = await store.validateToken();

      expect(logoutSpy).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test("validateToken returns true when API call succeeds", async () => {
      const store = useAuthStore();
      store.token = "test-token";

      // Provide a mocked get method for the http client
      api.get = jest.fn().mockResolvedValue({ data: { valid: true } });

      const result = await store.validateToken();

      expect(api.get).toHaveBeenCalledWith("validate_token/");
      expect(result).toBe(true);
    });

    test("validateToken logs out on 401/403 error and returns false", async () => {
      const store = useAuthStore();
      store.token = "test-token";
      store.user = { id: 1, email: "test@example.com" };

      api.get = jest.fn().mockRejectedValue({ response: { status: 401 } });
      const logoutSpy = jest.spyOn(store, "logout");

      const result = await store.validateToken();

      expect(logoutSpy).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    test("checkAuth returns false when token and user are both null", async () => {
      const store = useAuthStore();
      store.token = null;
      store.user = null;

      await expect(store.checkAuth()).resolves.toBe(false);
    });

    test("checkAuth returns false when user is null but token is present", async () => {
      const store = useAuthStore();
      store.token = "token-only";
      store.user = null;

      await expect(store.checkAuth()).resolves.toBe(false);
    });

    test("checkAuth returns false when token is null but user is present", async () => {
      const store = useAuthStore();
      store.token = null;
      store.user = { id: 1 };

      await expect(store.checkAuth()).resolves.toBe(false);
    });

    test("checkAuth delegates to validateToken when prerequisites are met", async () => {
      const store = useAuthStore();
      store.token = "test-token";
      store.user = { id: 1, email: "test@example.com" };

      const validateSpy = jest.spyOn(store, "validateToken").mockResolvedValue(true);

      const result = await store.checkAuth();

      expect(validateSpy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});

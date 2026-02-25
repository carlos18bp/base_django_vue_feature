import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/services/http/tokens";

describe("tokens", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("getAccessToken returns null when not set", () => {
    expect(getAccessToken()).toBeNull();
  });

  test("getRefreshToken returns null when not set", () => {
    expect(getRefreshToken()).toBeNull();
  });

  test("setTokens stores access and refresh", () => {
    setTokens({ access: "a", refresh: "r" });

    expect(localStorage.getItem("access_token")).toBe("a");
    expect(localStorage.getItem("refresh_token")).toBe("r");
  });

  test("setTokens does not overwrite refresh when missing", () => {
    setTokens({ access: "a", refresh: "r" });
    setTokens({ access: "a2" });

    expect(localStorage.getItem("access_token")).toBe("a2");
    expect(localStorage.getItem("refresh_token")).toBe("r");
  });

  test("clearTokens removes both tokens", () => {
    setTokens({ access: "a", refresh: "r" });
    clearTokens();

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });

  test("setTokens does not store anything when both tokens are missing", () => {
    setTokens({ access: null, refresh: null });

    expect(localStorage.getItem("access_token")).toBeNull();
    expect(localStorage.getItem("refresh_token")).toBeNull();
  });
});

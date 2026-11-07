import { afterEach, describe, expect, it, vi } from "vitest";
import { api, ApiError, setToken, setUnauthorizedHandler } from "./api";

function mockFetch(status: number, body?: unknown) {
  const fn = vi.fn().mockResolvedValue({
    status,
    ok: status >= 200 && status < 300,
    json: () => (body === undefined ? Promise.reject(new Error("no body")) : Promise.resolve(body)),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

describe("api client", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    setUnauthorizedHandler(null);
  });

  it("sends the bearer token on authenticated requests", async () => {
    setToken("abc");
    const fetchMock = mockFetch(200, { user: { id: "1", name: "A", email: "a@a.com", createdAt: "" } });

    await api.me();

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer abc");
  });

  it("throws an ApiError carrying the server error code", async () => {
    mockFetch(409, { error: { code: "EMAIL_IN_USE", message: "Email is already registered" } });

    await expect(
      api.register({ name: "Ann", email: "ann@example.com", password: "password123" }),
    ).rejects.toMatchObject({ status: 409, code: "EMAIL_IN_USE" });
  });

  it("calls the unauthorized handler on 401 for authenticated requests", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    setToken("expired");
    mockFetch(401, { error: { code: "UNAUTHORIZED", message: "Invalid or expired token" } });

    await expect(api.me()).rejects.toBeInstanceOf(ApiError);
    expect(handler).toHaveBeenCalledOnce();
  });

  it("does not trigger the unauthorized handler when login fails", async () => {
    const handler = vi.fn();
    setUnauthorizedHandler(handler);
    mockFetch(401, { error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password" } });

    await expect(api.login({ email: "a@a.com", password: "wrong" })).rejects.toBeInstanceOf(ApiError);
    expect(handler).not.toHaveBeenCalled();
  });

  it("maps network failures to a NETWORK_ERROR", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("fetch failed")));

    await expect(api.me()).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  });
});

/**
 * 文件名: request-auth.test.js
 * 描述: 401 无感刷新 / 单飞锁 / 请求重放 / 兜底跳转单测（FE-001）
 */

jest.mock("../utils/auth-token");
jest.mock("../utils/request");

const authToken = require("../utils/auth-token");
const request = require("../utils/request");
const {
  refreshAccessToken,
  handleUnauthorized,
  clearAndRedirect,
} = require("../utils/request-auth");

beforeEach(() => {
  jest.clearAllMocks();
});

describe("refreshAccessToken 单飞锁", () => {
  it("并发刷新仅发起一次请求", async () => {
    authToken.getRefreshToken.mockReturnValue("rt-1");
    request.mockResolvedValue({ token: "new-token", refreshToken: "rt-2", userInfo: {} });

    const [a, b] = await Promise.all([
      refreshAccessToken(),
      refreshAccessToken(),
    ]);

    expect(request).toHaveBeenCalledTimes(1);
    expect(authToken.saveAuth).toHaveBeenCalledWith({
      token: "new-token",
      refreshToken: "rt-2",
      userInfo: {},
    });
    expect(a.token).toBe("new-token");
    expect(b.token).toBe("new-token");
  });

  it("无刷新令牌时直接拒绝", async () => {
    authToken.getRefreshToken.mockReturnValue("");
    await expect(refreshAccessToken()).rejects.toThrow("no_refresh_token");
  });
});

describe("handleUnauthorized 重放", () => {
  it("刷新成功后将原请求重放一次", async () => {
    authToken.getRefreshToken.mockReturnValue("rt-1");
    request.mockImplementation((opts) => {
      if (opts && opts._authInternal) {
        return Promise.resolve({ token: "new-token", refreshToken: "rt-2" });
      }
      if (opts && opts._authRetried) {
        return Promise.resolve("replayed-data");
      }
      return Promise.reject(Object.assign(new Error("未授权，请重新登录"), { statusCode: 401 }));
    });

    const config = { url: "/api/user/info", method: "GET" };
    const result = await handleUnauthorized(config, request);

    expect(result).toBe("replayed-data");
    expect(request).toHaveBeenCalledWith(
      expect.objectContaining({ _authRetried: true })
    );
  });

  it("刷新失败时拒绝 token_refresh_failed", async () => {
    authToken.getRefreshToken.mockReturnValue("rt-1");
    request.mockRejectedValue(new Error("bad refresh"));

    await expect(handleUnauthorized({ url: "/x" }, request)).rejects.toThrow(
      "token_refresh_failed"
    );
  });

  it("刷新请求自身 401 时不再重试", async () => {
    authToken.getRefreshToken.mockReturnValue("rt-1");
    request.mockResolvedValue({ token: "t", refreshToken: "r" });

    await expect(
      handleUnauthorized({ _authInternal: true, url: "/auth/refresh-token" }, request)
    ).rejects.toThrow("token_refresh_failed");
  });
});

describe("clearAndRedirect 兜底", () => {
  it("清除登录态并跳转登录页", () => {
    const wx = { reLaunch: jest.fn(), removeStorageSync: jest.fn() };
    clearAndRedirect(wx);
    expect(authToken.clearAuth).toHaveBeenCalled();
    expect(wx.reLaunch).toHaveBeenCalledWith({ url: "/pages/home/index" });
    expect(wx.removeStorageSync).toHaveBeenCalledWith("openid");
  });
});

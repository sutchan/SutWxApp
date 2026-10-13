/**
 * 文件名: auth-token.test.js
 * 描述: 登录态令牌存储 / 过期解析 / 读写逻辑单测（FE-001）
 */

const authToken = require("../utils/auth-token");

function base64url(obj) {
  return Buffer.from(JSON.stringify(obj))
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeToken(payload, secret = "x") {
  return `${base64url({ alg: "HS256", typ: "JWT" })}.${base64url(payload)}.${base64url(secret)}`;
}

describe("auth-token 基础编解码", () => {
  beforeEach(() => {
    const store = {};
    global.wx = {
      getStorageSync: (k) => (k in store ? store[k] : ""),
      setStorageSync: (k, v) => {
        store[k] = v;
      },
      removeStorageSync: (k) => {
        delete store[k];
      },
    };
  });

  afterEach(() => {
    delete global.wx;
  });

  it("decodeExp 解析 JWT 的 exp", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const token = makeToken({ sub: 1, exp: future });
    expect(authToken.decodeExp(token)).toBe(future);
  });

  it("decodeExp 段数不足返回 0", () => {
    expect(authToken.decodeExp("a.b")).toBe(0);
    expect(authToken.decodeExp("")).toBe(0);
  });

  it("isExpired 正确判断过期", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    const past = Math.floor(Date.now() / 1000) - 10;
    expect(authToken.isExpired(makeToken({ exp: future }))).toBe(false);
    expect(authToken.isExpired(makeToken({ exp: past }))).toBe(true);
  });

  it("无法解析 exp 时视为未过期（兼容非 JWT 本地 token）", () => {
    expect(authToken.isExpired("not-a-jwt")).toBe(false);
  });

  it("willExpireSoon 考虑提前量", () => {
    const soon = Math.floor(Date.now() / 1000) + 30; // 30s 后过期，小于默认 120s skew
    expect(authToken.willExpireSoon(makeToken({ exp: soon }))).toBe(true);
    const later = Math.floor(Date.now() / 1000) + 600;
    expect(authToken.willExpireSoon(makeToken({ exp: later }))).toBe(false);
  });
});

describe("auth-token 存储读写", () => {
  let store;
  beforeEach(() => {
    store = {};
    global.wx = {
      getStorageSync: (k) => (k in store ? store[k] : ""),
      setStorageSync: (k, v) => {
        store[k] = v;
      },
      removeStorageSync: (k) => {
        delete store[k];
      },
    };
  });
  afterEach(() => {
    delete global.wx;
  });

  it("saveAuth 写入 token/refreshToken/userInfo/openid", () => {
    const saved = authToken.saveAuth({
      token: "T1",
      refreshToken: "R1",
      userInfo: { nickName: "苏小糖", openid: "o123" },
    });
    expect(authToken.getToken()).toBe("T1");
    expect(authToken.getRefreshToken()).toBe("R1");
    expect(authToken.getUserInfo()).toEqual({ nickName: "苏小糖", openid: "o123" });
    expect(saved.expiresAt).toBeGreaterThan(0);
  });

  it("isLoggedIn 有未过期 token 时为真", () => {
    const future = Math.floor(Date.now() / 1000) + 3600;
    authToken.saveAuth({ token: makeToken({ exp: future }), refreshToken: "R" });
    expect(authToken.isLoggedIn()).toBe(true);
  });

  it("isLoggedIn 无 token 时为假", () => {
    authToken.clearAuth();
    expect(authToken.isLoggedIn()).toBe(false);
  });

  it("clearAuth 清除登录态", () => {
    authToken.saveAuth({ token: "T", refreshToken: "R" });
    authToken.clearAuth();
    expect(authToken.getToken()).toBe("");
    expect(authToken.getRefreshToken()).toBe("");
  });
});

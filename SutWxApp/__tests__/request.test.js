/**
 * 文件名: request.test.js
 * 描述: 网络请求主模块单测（对齐 request.js v3.5.0 当前实现：鉴权头、无 token 拦截、
 *       401 无感刷新兜底、状态码分发、重试、拦截器、baseURL 拼接、异常边界）
 */

const request = require("../utils/request");

// 每个用例提供可控的 wx 桩，关闭 CSRF / XSS / 缓存副作用以聚焦主流程
beforeEach(() => {
  global.wx = makeWx();
  request.enableCsrf(false);
  request.enableXssProtection(false);
  request.enableCache(false);
});

function makeWx(overrides) {
  const store = Object.assign(
    { token: "test-token", userInfo: { id: "user-001" } },
    overrides || {},
  );
  const calls = { removeStorageSync: [], reLaunch: [] };
  return {
    getStorageSync: jest.fn((k) => (k in store ? store[k] : null)),
    setStorageSync: jest.fn((k, v) => {
      store[k] = v;
    }),
    removeStorageSync: jest.fn((k) => {
      delete store[k];
      calls.removeStorageSync.push(k);
    }),
    reLaunch: jest.fn((o) => calls.reLaunch.push(o)),
    request: jest.fn(),
    _calls: calls,
    _store: store,
  };
}

describe("HTTP 动词", () => {
  test("GET 请求应正确发送并解析响应", async () => {
    global.wx.request = jest.fn((o) =>
      o.success({ statusCode: 200, data: { hello: "world" } }),
    );
    const result = await request.get("/api/test");
    expect(global.wx.request).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/test", method: "GET" }),
    );
    expect(result).toEqual({ hello: "world" });
  });

  test("POST 请求应携带 data", async () => {
    const data = { name: "测试", value: 123 };
    global.wx.request = jest.fn((o) => o.success({ statusCode: 200, data: {} }));
    await request.post("/api/test", data);
    expect(global.wx.request).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/test", method: "POST", data }),
    );
  });

  test("PUT 请求应正确发送", async () => {
    const data = { id: 1, name: "更新" };
    global.wx.request = jest.fn((o) => o.success({ statusCode: 200, data: {} }));
    await request.put("/api/test/1", data);
    expect(global.wx.request).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/test/1", method: "PUT", data }),
    );
  });

  test("DELETE 请求应正确发送", async () => {
    global.wx.request = jest.fn((o) => o.success({ statusCode: 200, data: {} }));
    await request.delete("/api/test/1");
    expect(global.wx.request).toHaveBeenCalledWith(
      expect.objectContaining({ url: "/api/test/1", method: "DELETE" }),
    );
  });
});

describe("Authorization 头", () => {
  test("needAuth 默认且存在 token 时应添加 Bearer 头", async () => {
    global.wx.request = jest.fn((o) => {
      expect(o.header.Authorization).toBe("Bearer test-token");
      o.success({ statusCode: 200, data: {} });
    });
    await request.get("/api/test");
  });

  test("needAuth=false 时不应添加 Authorization 头", async () => {
    global.wx.request = jest.fn((o) => {
      expect(o.header.Authorization).toBeUndefined();
      o.success({ statusCode: 200, data: {} });
    });
    await request.get("/api/public", {}, { needAuth: false });
  });

  test("无 token 且 needAuth 默认时应拦截并拒绝", async () => {
    global.wx = makeWx({ token: null });
    let called = false;
    global.wx.request = jest.fn(() => {
      called = true;
    });
    await expect(request.get("/api/test")).rejects.toThrow("未授权，请重新登录");
    expect(called).toBe(false);
  });
});

describe("状态码处理", () => {
  test("2xx 应解析响应数据", async () => {
    global.wx.request = jest.fn((o) =>
      o.success({ statusCode: 200, data: { success: true } }),
    );
    const result = await request.get("/api/test");
    expect(result).toEqual({ success: true });
  });

  test("400 应抛出服务端消息", async () => {
    global.wx.request = jest.fn((o) =>
      o.success({ statusCode: 400, data: { message: "参数错误" } }),
    );
    await expect(request.get("/api/test")).rejects.toThrow("参数错误");
  });

  test("500 应抛出状态码错误", async () => {
    global.wx.request = jest.fn((o) => o.success({ statusCode: 500, data: {} }));
    await expect(request.get("/api/test")).rejects.toThrow("服务器内部错误");
  });

  test("401 无刷新令牌应拒绝 no_refresh_token 并清除登录态跳转首页", async () => {
    global.wx.request = jest.fn((o) =>
      o.success({ statusCode: 401, data: { message: "未授权" } }),
    );
    await expect(request.get("/api/test")).rejects.toThrow("no_refresh_token");
    expect(global.wx._calls.removeStorageSync).toContain("openid");
    expect(global.wx.reLaunch).toHaveBeenCalledWith({ url: "/pages/home/index" });
  });
});

describe("重试机制", () => {
  test("失败后在重试次数内成功应解析最终结果", async () => {
    let count = 0;
    global.wx.request = jest.fn((o) => {
      count++;
      if (count < 3) {
        o.fail({ errMsg: "网络错误" });
      } else {
        o.success({ statusCode: 200, data: { ok: true } });
      }
    });
    const result = await request.get("/api/test", {}, { retry: 2, retryDelay: 0 });
    expect(count).toBe(3);
    expect(result).toEqual({ ok: true });
  });

  test("重试耗尽后应拒绝错误", async () => {
    const mockError = { errMsg: "网络错误" };
    global.wx.request = jest.fn((o) => o.fail(mockError));
    await expect(
      request.get("/api/test", {}, { retry: 2, retryDelay: 0 }),
    ).rejects.toThrow("网络错误");
  });
});

describe("拦截器", () => {
  test("请求拦截器应能修改配置", async () => {
    const interceptor = jest.fn((config) => ({
      ...config,
      header: { ...config.header, "X-Custom-Header": "value" },
    }));
    request.addRequestInterceptor(interceptor);
    global.wx.request = jest.fn((o) => {
      expect(o.header["X-Custom-Header"]).toBe("value");
      o.success({ statusCode: 200, data: {} });
    });
    await request.get("/api/test");
    expect(interceptor).toHaveBeenCalled();
  });

  test("响应拦截器应能修改响应数据", async () => {
    const interceptor = jest.fn((response) => ({
      ...response,
      data: { ...response.data, intercepted: true },
    }));
    request.addResponseInterceptor(interceptor);
    global.wx.request = jest.fn((o) =>
      o.success({ statusCode: 200, data: { original: true } }),
    );
    const result = await request.get("/api/test");
    expect(result).toEqual({ original: true, intercepted: true });
  });
});

describe("baseURL 拼接", () => {
  test("应设置 baseURL 并拼接相对路径", async () => {
    request.setBaseURL("https://api.example.com");
    global.wx.request = jest.fn((o) => {
      expect(o.url).toBe("https://api.example.com/api/test");
      o.success({ statusCode: 200, data: {} });
    });
    await request.get("/api/test");
    request.setBaseURL("");
  });
});

describe("异常处理", () => {
  test("wx.request 未定义时应抛出错误", async () => {
    const original = global.wx.request;
    delete global.wx.request;
    await expect(request.get("/api/test")).rejects.toThrow("wx.request未定义");
    global.wx.request = original;
  });

  test("Content-Type 默认应为 application/json", async () => {
    global.wx.request = jest.fn((o) => {
      expect(o.header["content-type"]).toBe("application/json");
      o.success({ statusCode: 200, data: {} });
    });
    await request.post("/api/test", { data: "test" });
  });

  test("自定义 header 应与默认 header 合并", async () => {
    global.wx.request = jest.fn((o) => {
      expect(o.header["content-type"]).toBe("application/json");
      expect(o.header["X-Custom"]).toBe("value");
      o.success({ statusCode: 200, data: {} });
    });
    await request.get("/api/test", {}, { header: { "X-Custom": "value" } });
  });
});

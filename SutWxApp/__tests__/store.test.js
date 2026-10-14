/**
 * 文件名: store.test.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-28 10:30
 * 描述: 状态管理工具单元测试，验证状态存储、读取、突变等功能的正确性
 */

const store = require("../utils/store");

describe("状态管理工具测试", () => {
  const originalWx = global.wx;

  beforeEach(() => {
    jest.clearAllMocks();

    global.wx = {
      getStorageSync: jest.fn().mockImplementation((key) => {
        if (key === "token") return "test-token";
        if (key === "userInfo") return { id: "user-001", nickname: "测试用户" };
        if (key === "points") return 100;
        if (key === "unreadCount") return 5;
        return null;
      }),
      setStorageSync: jest.fn(),
      removeStorageSync: jest.fn(),
    };
  });

  afterEach(() => {
    global.wx = originalWx;
    jest.restoreAllMocks();
  });

  describe("状态初始化测试", () => {
    test("getState应该返回当前状态的副本", () => {
      const state = store.getState();

      expect(state).toHaveProperty("token");
      expect(state).toHaveProperty("userInfo");
      expect(state).toHaveProperty("points");
      expect(state).toHaveProperty("unreadCount");
      expect(typeof state).toBe("object");
    });

    test("getState应该返回独立的对象引用", () => {
      const state1 = store.getState();
      const state2 = store.getState();

      expect(state1).not.toBe(state2);
      expect(state1).toEqual(state2);
    });
  });

  describe("SET_TOKEN突变测试", () => {
    test("设置token应该更新状态并存储", () => {
      store.commit("SET_TOKEN", "new-token");

      expect(wx.setStorageSync).toHaveBeenCalledWith("token", "new-token");
    });

    test("设置null token应该清除存储", () => {
      store.commit("SET_TOKEN", null);

      expect(wx.removeStorageSync).toHaveBeenCalledWith("token");
    });

    test("设置token应该更新内存状态", () => {
      store.commit("SET_TOKEN", "updated-token");
      const state = store.getState();

      expect(state.token).toBe("updated-token");
    });
  });

  describe("SET_USER_INFO突变测试", () => {
    test("设置userInfo应该更新状态并存储", () => {
      const newUserInfo = { id: "user-002", nickname: "新用户" };
      store.commit("SET_USER_INFO", newUserInfo);

      expect(wx.setStorageSync).toHaveBeenCalledWith("userInfo", newUserInfo);
    });

    test("设置null userInfo应该清除存储", () => {
      store.commit("SET_USER_INFO", null);

      expect(wx.removeStorageSync).toHaveBeenCalledWith("userInfo");
    });

    test("设置userInfo应该更新内存状态", () => {
      const newUserInfo = { id: "user-003", nickname: "测试" };
      store.commit("SET_USER_INFO", newUserInfo);
      const state = store.getState();

      expect(state.userInfo).toEqual(newUserInfo);
    });
  });

  describe("SET_POINTS突变测试", () => {
    test("设置points应该更新状态并存储", () => {
      store.commit("SET_POINTS", 500);

      expect(wx.setStorageSync).toHaveBeenCalledWith("points", 500);
    });

    test("设置points应该更新内存状态", () => {
      store.commit("SET_POINTS", 999);
      const state = store.getState();

      expect(state.points).toBe(999);
    });

    test("设置points为0应该正确处理", () => {
      store.commit("SET_POINTS", 0);
      const state = store.getState();

      expect(state.points).toBe(0);
    });
  });

  describe("SET_UNREAD_COUNT突变测试", () => {
    test("设置unreadCount应该更新状态并存储", () => {
      store.commit("SET_UNREAD_COUNT", 10);

      expect(wx.setStorageSync).toHaveBeenCalledWith("unreadCount", 10);
    });

    test("设置unreadCount应该更新内存状态", () => {
      store.commit("SET_UNREAD_COUNT", 20);
      const state = store.getState();

      expect(state.unreadCount).toBe(20);
    });
  });

  describe("RESET_STATE突变测试", () => {
    test("重置状态应该清除所有存储", () => {
      store.commit("RESET_STATE");

      expect(wx.removeStorageSync).toHaveBeenCalledWith("token");
      expect(wx.removeStorageSync).toHaveBeenCalledWith("userInfo");
      expect(wx.removeStorageSync).toHaveBeenCalledWith("points");
      expect(wx.removeStorageSync).toHaveBeenCalledWith("unreadCount");
    });

    test("重置状态应该将所有值恢复为初始值", () => {
      store.commit("SET_POINTS", 500);
      store.commit("SET_UNREAD_COUNT", 10);

      store.commit("RESET_STATE");

      const state = store.getState();
      expect(state.token).toBeNull();
      expect(state.userInfo).toBeNull();
      expect(state.points).toBe(0);
      expect(state.unreadCount).toBe(0);
    });
  });

  describe("未知突变测试", () => {
    test("未知突变应该记录警告", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      store.commit("UNKNOWN_MUTATION", "test");

      expect(consoleSpy).toHaveBeenCalledWith(
        "未知的mutation: UNKNOWN_MUTATION",
      );

      consoleSpy.mockRestore();
    });
  });

  describe("wx对象未定义时的行为测试", () => {
    beforeEach(() => {
      delete global.wx;
    });

    afterEach(() => {
      global.wx = originalWx;
    });

    test("commit应该处理wx对象未定义的情况", () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      store.commit("SET_TOKEN", "test");

      expect(consoleSpy).toHaveBeenCalledWith("wx对象未定义，跳过状态变更");

      consoleSpy.mockRestore();
    });
  });
});

describe("状态管理边界条件测试", () => {
  const originalWx = global.wx;

  beforeEach(() => {
    jest.clearAllMocks();

    global.wx = {
      getStorageSync: jest.fn().mockReturnValue(null),
      setStorageSync: jest.fn(),
      removeStorageSync: jest.fn(),
    };
  });

  afterEach(() => {
    global.wx = originalWx;
    jest.restoreAllMocks();
  });

  test("空token应该正确处理", () => {
    global.wx.getStorageSync = jest.fn().mockReturnValue("");

    const state = store.getState();

    expect(state.token).toBeFalsy();
  });

  test("空userInfo应该正确处理", () => {
    global.wx.getStorageSync = jest.fn().mockReturnValue("");

    const state = store.getState();

    expect(state.userInfo).toBeFalsy();
  });

  test("空points应该返回默认值0", () => {
    global.wx.getStorageSync = jest.fn().mockImplementation((key) => {
      if (key === "points") return "";
      return null;
    });

    const state = store.getState();

    expect(state.points).toBe(0);
  });

  test("空unreadCount应该返回默认值0", () => {
    global.wx.getStorageSync = jest.fn().mockImplementation((key) => {
      if (key === "unreadCount") return "";
      return null;
    });

    const state = store.getState();

    expect(state.unreadCount).toBe(0);
  });

  test("复杂对象作为payload应该正确处理", () => {
    const complexUserInfo = {
      id: "user-001",
      nickname: "测试用户",
      avatar: "http://example.com/avatar.png",
      phone: "13800138000",
      address: {
        province: "北京",
        city: "北京",
        district: "朝阳",
        detail: "某路1号",
      },
    };

    store.commit("SET_USER_INFO", complexUserInfo);

    expect(wx.setStorageSync).toHaveBeenCalledWith("userInfo", complexUserInfo);
  });

  test("数字类型的payload应该正确处理", () => {
    store.commit("SET_POINTS", 12345.67);

    expect(wx.setStorageSync).toHaveBeenCalledWith("points", 12345.67);
  });

  test("数组类型的payload应该正确处理", () => {
    const addressList = [
      { id: "addr-001", name: "地址1" },
      { id: "addr-002", name: "地址2" },
    ];

    store.commit("SET_USER_INFO", addressList);

    expect(wx.setStorageSync).toHaveBeenCalledWith("userInfo", addressList);
  });

  test("多次连续commit应该正确处理", () => {
    store.commit("SET_TOKEN", "token-1");
    store.commit("SET_TOKEN", "token-2");
    store.commit("SET_TOKEN", "token-3");

    expect(wx.setStorageSync).toHaveBeenCalledTimes(3);

    const state = store.getState();
    expect(state.token).toBe("token-3");
  });

  test("状态快照应该保持一致性", () => {
    store.commit("SET_POINTS", 100);
    store.commit("SET_UNREAD_COUNT", 5);

    const state1 = store.getState();
    const state2 = store.getState();

    expect(state1).toEqual(state2);
    expect(state1.points).toBe(100);
    expect(state1.unreadCount).toBe(5);
  });
});

describe("状态管理异常处理测试", () => {
  const originalWx = global.wx;

  beforeEach(() => {
    jest.clearAllMocks();

    global.wx = {
      getStorageSync: jest.fn().mockReturnValue(null),
      setStorageSync: jest.fn(),
      removeStorageSync: jest.fn(),
    };
  });

  afterEach(() => {
    global.wx = originalWx;
    jest.restoreAllMocks();
  });

  test("storage操作应该使用同步方法", () => {
    store.commit("SET_TOKEN", "test");

    expect(global.wx.setStorageSync).toHaveBeenCalledTimes(1);
    expect(global.wx.removeStorageSync).toHaveBeenCalledTimes(0);
  });
});

/**
 * 文件名: offline-snapshot.test.js
 * 描述: 离线快照模块单测（FE-003）：保存 / 读取 / 删除 / 清空
 */

const offline = require("../utils/offline-snapshot");

function mockWxStorage() {
  const store = {};
  global.wx = {
    getStorageSync: (k) => (k in store ? store[k] : ""),
    setStorageSync: (k, v) => {
      store[k] = v;
    },
    removeStorageSync: (k) => {
      delete store[k];
    },
    getStorageInfoSync: () => ({ keys: Object.keys(store) }),
  };
}

describe("离线快照", () => {
  beforeEach(() => {
    mockWxStorage();
  });

  test("保存后可读回数据与时间戳", () => {
    offline.saveSnapshot("k1", { a: 1 });
    const snap = offline.getSnapshot("k1");
    expect(snap).not.toBeNull();
    expect(snap.data).toEqual({ a: 1 });
    expect(typeof snap.ts).toBe("number");
  });

  test("删除快照后读取为 null", () => {
    offline.saveSnapshot("k2", { b: 2 });
    offline.removeSnapshot("k2");
    expect(offline.getSnapshot("k2")).toBeNull();
  });

  test("清空仅移除快照前缀的键", () => {
    offline.saveSnapshot("k3", { c: 3 });
    global.wx.setStorageSync("other", "x");
    offline.clearSnapshots();
    expect(offline.getSnapshot("k3")).toBeNull();
    expect(global.wx.getStorageSync("other")).toBe("x");
  });

  test("无 wx 环境应安全降级（不抛错）", () => {
    delete global.wx;
    expect(() => offline.saveSnapshot("k", {})).not.toThrow();
    expect(offline.getSnapshot("k")).toBeNull();
  });
});

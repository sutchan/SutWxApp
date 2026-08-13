/**
 * 文件名: home.utils.test.js
 * 版本号: 3.0.2
 * 更新日期: 2026-08-13
 * 描述: home 模块纯函数单元测试
 */
const { buildBannerList } = require("../pages/home/utils");
const { pickCategory } = require("../pages/home/parts");
const { formatPrice } = require("../utils/format");

describe("home/utils", () => {
  test("buildBannerList 规整字段", () => {
    expect(buildBannerList([{ image: "a", link: "b" }])).toEqual([
      { image: "a", link: "b" },
    ]);
    expect(buildBannerList(null)).toEqual([]);
    expect(buildBannerList([{ img: "x" }])).toEqual([{ image: "x", link: "" }]);
  });
});

describe("home/parts", () => {
  test("pickCategory 安全索引", () => {
    expect(pickCategory("2")).toBe(2);
    expect(pickCategory(-1)).toBe(0);
    expect(pickCategory("abc")).toBe(0);
  });
});

describe("utils/format", () => {
  test("formatPrice 保留两位小数", () => {
    expect(formatPrice(9.9)).toBe("9.90");
    expect(formatPrice(0)).toBe("0.00");
  });
});

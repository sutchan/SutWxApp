/**
 * 文件名: product.utils.test.js
 * 版本号: 3.0.2
 * 更新日期: 2026-08-13
 * 描述: product/utils.js 纯函数单元测试
 */
const {
  getCurrentSpecPrice,
  buildVisibleImages,
  buildImageLoadedMap,
  safeStock,
} = require("../pages/product/utils");

describe("product/utils", () => {
  test("getCurrentSpecPrice 取选中规格价", () => {
    const info = { price: 10, specs: [{ price: 20 }, { price: 30 }] };
    expect(getCurrentSpecPrice(info, 1)).toBe(30);
  });

  test("getCurrentSpecPrice 无规格时取基础价", () => {
    expect(getCurrentSpecPrice({ price: 15 }, 0)).toBe(15);
  });

  test("buildVisibleImages 仅前两张可见", () => {
    expect(buildVisibleImages(["a", "b", "c"])).toEqual([true, true, false]);
  });

  test("buildImageLoadedMap 前两张已加载", () => {
    expect(buildImageLoadedMap(["a", "b"])).toEqual({ 0: true, 1: true });
  });

  test("safeStock 缺省 99", () => {
    expect(safeStock(undefined)).toBe(99);
    expect(safeStock(5)).toBe(5);
    expect(safeStock(-1)).toBe(99);
  });
});

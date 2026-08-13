/**
 * 文件名: product.parts.test.js
 * 版本号: 3.0.2
 * 更新日期: 2026-08-13
 * 描述: product/parts.js 业务子逻辑单元测试
 */
const { adjustQuantity, parseQuantity, buildBuyNowItem } = require("../pages/product/parts");

describe("product/parts", () => {
  test("adjustQuantity minus 不低于 1", () => {
    expect(adjustQuantity(1, "minus", 10)).toBe(1);
    expect(adjustQuantity(3, "minus", 10)).toBe(2);
  });

  test("adjustQuantity plus 不超过库存", () => {
    expect(adjustQuantity(10, "plus", 10)).toBe(10);
    expect(adjustQuantity(2, "plus", 10)).toBe(3);
  });

  test("parseQuantity 容错", () => {
    expect(parseQuantity("5", 10)).toBe(5);
    expect(parseQuantity("abc", 10)).toBe(1);
    expect(parseQuantity("99", 5)).toBe(5);
  });

  test("buildBuyNowItem 构造正确", () => {
    const info = {
      id: 1,
      name: "商品",
      images: ["img"],
      specs: [{ name: "规格", price: 9.9 }],
    };
    expect(buildBuyNowItem(info, 0, 2)).toEqual({
      productId: 1,
      productName: "商品",
      productImage: "img",
      specName: "规格",
      specPrice: 9.9,
      quantity: 2,
      selected: true,
    });
  });

  test("buildBuyNowItem 信息缺失返回 null", () => {
    expect(buildBuyNowItem(null, 0, 1)).toBeNull();
  });
});

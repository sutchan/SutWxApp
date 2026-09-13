/**
 * 文件名: category.mapper.test.js
 * 版本号: 3.0.11
 * 更新日期: 2026-09-13
 * 描述: 分类模型 WooCommerce 映射纯函数单元测试
 */

const {
  mapWooCommerceCategory,
  mapWooCommerceCategories,
  toNumber,
  stripHtml,
} = require("../models/category");

describe("category mapper", () => {
  test("toNumber 安全转换与回退", () => {
    expect(toNumber("12", 0)).toBe(12);
    expect(toNumber("", 5)).toBe(5);
    expect(toNumber(null, 5)).toBe(5);
    expect(toNumber("abc", 5)).toBe(5);
  });

  test("stripHtml 去除标签与反转义", () => {
    expect(stripHtml("<p>绿萝</p>")).toBe("绿萝");
    expect(stripHtml("A&amp;B &lt;x&gt;")).toBe("A&B <x>");
    expect(stripHtml(null)).toBe("");
  });

  test("mapWooCommerceCategory 基本映射", () => {
    const wc = {
      id: 2,
      name: "绿色植物",
      image: { id: 9, src: "https://x/cat.png" },
      count: 36,
      description: "<p>好看的植物</p>",
      parent: 0,
      slug: "green",
      permalink: "https://x/cat/green",
    };
    const dto = mapWooCommerceCategory(wc);
    expect(dto).toEqual({
      id: 2,
      name: "绿色植物",
      icon: "https://x/cat.png",
      count: 36,
      description: "好看的植物",
      parentId: 0,
      slug: "green",
      permalink: "https://x/cat/green",
    });
  });

  test("mapWooCommerceCategory 字符串图标与缺省字段", () => {
    const dto = mapWooCommerceCategory({ id: 3, name: "多肉", image: "https://x/m.png" });
    expect(dto.icon).toBe("https://x/m.png");
    expect(dto.count).toBe(0);
    expect(dto.parentId).toBe(0);
  });

  test("mapWooCommerceCategory 无 id 返回 null", () => {
    expect(mapWooCommerceCategory({ name: "无 id" })).toBeNull();
    expect(mapWooCommerceCategory(null)).toBeNull();
  });

  test("mapWooCommerceCategories 批量映射并过滤无效项", () => {
    const list = [
      { id: 1, name: "A" },
      { name: "无 id" },
      { id: 2, name: "B", image: { src: "https://x/b.png" } },
    ];
    const dtos = mapWooCommerceCategories(list);
    expect(dtos).toHaveLength(2);
    expect(dtos[0].id).toBe(1);
    expect(dtos[1].icon).toBe("https://x/b.png");
  });

  test("mapWooCommerceCategories 非数组返回空数组", () => {
    expect(mapWooCommerceCategories(null)).toEqual([]);
    expect(mapWooCommerceCategories(undefined)).toEqual([]);
  });
});

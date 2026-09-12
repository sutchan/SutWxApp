/**
 * 文件名: product.mapper.test.js
 * 版本号: 1.0.0
 * 更新日期: 2026-09-12
 * 描述: WooCommerce 商品映射层单元测试
 */

const {
  mapWooCommerceProduct,
  mapWooCommerceProducts,
  toNumber,
  stripHtml,
} = require("../models/product");

describe("toNumber", () => {
  it("将字符串价格转为数字", () => {
    expect(toNumber("29.90", 0)).toBe(29.9);
  });
  it("非法值回退默认值", () => {
    expect(toNumber("", 99)).toBe(99);
    expect(toNumber(undefined, 0)).toBe(0);
  });
});

describe("stripHtml", () => {
  it("去除标签与转义", () => {
    expect(stripHtml("<p>你好 <b>世界</b></p>")).toBe("你好 世界");
    expect(stripHtml("&lt;x&gt;")).toBe("<x>");
  });
});

describe("mapWooCommerceProduct - 简单商品", () => {
  const wc = {
    id: 101,
    name: "绿萝盆栽",
    type: "simple",
    price: "29.90",
    regular_price: "39.90",
    sale_price: "29.90",
    on_sale: true,
    purchasable: true,
    total_sales: 1288,
    sku: "SKU-001",
    manage_stock: true,
    stock_quantity: 100,
    stock_status: "instock",
    images: [{ id: 1, src: "https://x/a.jpg", name: "a" }],
    categories: [{ id: 2, name: "绿色植物" }],
    short_description: "<p>净化空气</p>",
    description: "<p>详情 HTML</p>",
    average_rating: "4.8",
    rating_count: 256,
  };

  const dto = mapWooCommerceProduct(wc);

  it("映射基础字段", () => {
    expect(dto.id).toBe(101);
    expect(dto.name).toBe("绿萝盆栽");
    expect(dto.price).toBe(29.9);
    expect(dto.originPrice).toBe(39.9);
    expect(dto.image).toBe("https://x/a.jpg");
    expect(dto.categoryId).toBe(2);
    expect(dto.categoryName).toBe("绿色植物");
    expect(dto.sales).toBe(1288);
    expect(dto.stock).toBe(100);
    expect(dto.stockStatus).toBe("instock");
    expect(dto.sku).toBe("SKU-001");
  });

  it("短描述去标签、详情保留 HTML", () => {
    expect(dto.desc).toBe("净化空气");
    expect(dto.description).toBe("<p>详情 HTML</p>");
  });

  it("生成单一默认规格", () => {
    expect(Array.isArray(dto.specs)).toBe(true);
    expect(dto.specs).toHaveLength(1);
    expect(dto.specs[0].price).toBe(29.9);
  });
});

describe("mapWooCommerceProduct - 多规格商品", () => {
  const wc = {
    id: 202,
    name: "多肉组合",
    type: "variable",
    price: "49.90",
    regular_price: "69.90",
    manage_stock: false,
    stock_status: "instock",
    images: [],
    attributes: [
      { name: "规格", variation: true, options: ["5株", "10株"] },
      { name: "颜色", variation: false, options: ["红", "绿"] },
    ],
  };

  const dto = mapWooCommerceProduct(wc);

  it("仅 variation 属性生成规格", () => {
    expect(dto.specs).toHaveLength(2);
    expect(dto.specs[0].name).toBe("规格: 5株");
    expect(dto.specs[1].name).toBe("规格: 10株");
  });
});

describe("mapWooCommerceProduct - 容错与幂等", () => {
  it("无 id 返回 null", () => {
    expect(mapWooCommerceProduct(null)).toBeNull();
    expect(mapWooCommerceProduct({})).toBeNull();
  });

  it("已是 DTO 时幂等规整并补全 specs", () => {
    const input = { id: 9, name: "测试", price: 10 };
    const out = mapWooCommerceProduct(input);
    expect(out.price).toBe(10);
    expect(Array.isArray(out.specs)).toBe(true);
    expect(out.specs[0].name).toBe("默认规格");
  });
});

describe("mapWooCommerceProducts", () => {
  it("批量映射并过滤无效项", () => {
    const list = [
      { id: 1, name: "A", price: "1" },
      null,
      { id: 2, name: "B", price: "2" },
    ];
    const out = mapWooCommerceProducts(list);
    expect(out).toHaveLength(2);
    expect(out[0].name).toBe("A");
  });
});

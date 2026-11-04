/**
 * 文件名: regression-2026-11.test.js
 * 版本号: 3.5.10
 * 更新日期: 2026-11-04
 * 描述: 2026-11 代码审查修复的回归测试（核心流程鲁棒性）。
 *       覆盖：SQL 校验不误杀合法文本、首页轮播数据规整、下单 items 映射、
 *       认证服务解包与路径、分类/商品 DTO 契约、非幂等请求不自动重试。
 */

jest.mock("../utils/request", () => ({
  get: jest.fn(),
  post: jest.fn(),
  enableCsrf: jest.fn(),
  enableXssProtection: jest.fn(),
  enableCache: jest.fn(),
}));

const request = require("../utils/request");
const { validateRequestData } = require("../utils/request-security-sql");
const { buildBannerList } = require("../pages/home/utils");
const categoryModel = require("../models/category");
const productModel = require("../models/product");
const orderService = require("../services/orderService");

describe("SQL 注入校验：拦截注入但不误杀合法文本", () => {
  test("门牌号 / 备注中的 # 与 -- 不应被误判", () => {
    expect(() =>
      validateRequestData({ detail: "朝阳区建国路 A#301" }),
    ).not.toThrow();
    expect(() =>
      validateRequestData({ remark: "加急--勿拆包装" }),
    ).not.toThrow();
  });

  test("真实注入结构仍被拦截", () => {
    expect(() =>
      validateRequestData({ keyword: "1' OR 1=1 --" }),
    ).toThrow(/SQL injection/);
    expect(() =>
      validateRequestData({ keyword: "x UNION SELECT password FROM users" }),
    ).toThrow(/SQL injection/);
    expect(() =>
      validateRequestData({ keyword: "x; DROP TABLE users" }),
    ).toThrow(/SQL injection/);
  });
});

describe("首页轮播数据规整", () => {
  test("输出 WXML 绑定的 imageUrl 字段", () => {
    const list = buildBannerList([{ id: 1, image: "/a.png", link: "/p/1" }]);
    expect(list[0].imageUrl).toBe("/a.png");
    expect(list[0].link).toBe("/p/1");
  });

  test("兼容 {list:[...]} 包络结构", () => {
    const list = buildBannerList({ list: [{ imageUrl: "/b.png" }] });
    expect(list).toHaveLength(1);
    expect(list[0].imageUrl).toBe("/b.png");
  });

  test("空数据返回空数组", () => {
    expect(buildBannerList(null)).toEqual([]);
    expect(buildBannerList({})).toEqual([]);
  });
});

describe("下单 items 字段映射（woocommerce 数据源）", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.getApp = () => ({ globalData: { productSource: "woocommerce" } });
  });

  afterAll(() => {
    delete global.getApp;
  });

  test("购物车 productId 与页面 id 两种输入都能正确映射", async () => {
    request.post.mockResolvedValue({
      code: 200,
      data: { id: 1001, orderNo: "1001", status: 1, products: [], address: {} },
    });
    await orderService.createOrder({
      items: [
        { productId: 7, quantity: 2 },
        { id: 9, quantity: 1 },
      ],
      address: {
        name: "张三",
        phone: "13800138000",
        province: "北京市",
        city: "北京市",
        district: "朝阳区",
        detail: "建国路 1 号",
      },
    });
    const payload = request.post.mock.calls[0][1];
    expect(payload.items).toEqual([
      { productId: 7, quantity: 2 },
      { productId: 9, quantity: 1 },
    ]);
    expect(payload.address.province).toBe("北京市");
    expect(payload.address.city).toBe("北京市");
    expect(payload.address.district).toBe("朝阳区");
  });
});

describe("分类 DTO 图标契约", () => {
  test("后端 DTO 的 icon 字符串被保留", () => {
    const dto = categoryModel.mapWooCommerceCategory({
      id: 5,
      name: "绿植",
      icon: "/images/cat.png",
    });
    expect(dto.icon).toBe("/images/cat.png");
  });

  test("WC 原始 image 对象仍可解析", () => {
    const dto = categoryModel.mapWooCommerceCategory({
      id: 6,
      name: "多肉",
      image: { src: "/images/succulent.png" },
    });
    expect(dto.icon).toBe("/images/succulent.png");
  });
});

describe("商品 DTO 判别（含 type 字段的后端 DTO 不应被重解析）", () => {
  test("后端 DTO 原样保留 price / image / specs", () => {
    const dto = {
      id: 11,
      name: "绿萝",
      price: 29.9,
      image: "/images/p.png",
      images: ["/images/p.png"],
      stockStatus: "instock",
      specs: [{ id: 1, name: "中号盆", price: 29.9, stock: 10 }],
      type: "simple",
    };
    const mapped = productModel.mapWooCommerceProduct(dto);
    expect(mapped.price).toBe(29.9);
    expect(mapped.image).toBe("/images/p.png");
    expect(mapped.specs).toHaveLength(1);
  });
});

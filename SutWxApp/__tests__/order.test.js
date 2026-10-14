/**
 * 文件名: order.test.js
 * 版本号: 3.5.4
 * 更新日期: 2026-10-14
 * 描述: 订单模块单测（FE-004）：DTO 映射、mock 数据源分支、woocommerce 分支端点调用。
 */

jest.mock("../utils/request", () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

const request = require("../utils/request");
const {
  mapWooCommerceOrder,
  mapWooCommerceOrders,
  getStatusText,
} = require("../models/order");
const orderService = require("../services/orderService");

// 订单 DTO 样例（与后端 map-order.php 输出结构一致）
const orderDto = {
  id: 1001,
  orderNo: "1001",
  status: 1,
  statusText: "待付款",
  totalPrice: "59.80",
  productPrice: "49.80",
  shippingFee: "10.00",
  totalQuantity: 2,
  createTime: "2026-10-14 10:00:00",
  products: [
    { id: 7, name: "绿萝盆栽", image: "/img.png", price: "29.90", quantity: 1, spec: "中号盆" },
    { id: 8, name: "多肉组合", image: "/img2.png", price: "19.90", quantity: 1, spec: "" },
  ],
  address: { name: "张三", phone: "13800138000", detail: "北京市朝阳区某某路 1 号" },
  remark: "尽快发货",
  payTime: "",
  completeTime: "",
};

describe("订单 DTO 映射", () => {
  test("有效 DTO 应规整数值与结构", () => {
    const order = mapWooCommerceOrder(orderDto);
    expect(order.id).toBe(1001);
    expect(order.status).toBe(1);
    expect(order.totalPrice).toBeCloseTo(59.8, 2);
    expect(order.shippingFee).toBeCloseTo(10, 2);
    expect(order.products).toHaveLength(2);
    expect(order.products[0].price).toBeCloseTo(29.9, 2);
    expect(order.address.detail).toContain("朝阳区");
    expect(order.remark).toBe("尽快发货");
  });

  test("缺失字段应补默认值", () => {
    const order = mapWooCommerceOrder({ id: 5 });
    expect(order).not.toBeNull();
    expect(order.status).toBe(0);
    expect(order.statusText).toBe("已取消");
    expect(order.totalPrice).toBe(0);
    expect(order.products).toEqual([]);
    expect(order.address).toEqual({ name: "", phone: "", detail: "" });
  });

  test("无效输入返回 null，批量映射过滤无效项", () => {
    expect(mapWooCommerceOrder(null)).toBeNull();
    expect(mapWooCommerceOrder("x")).toBeNull();
    expect(mapWooCommerceOrders([orderDto, null, {}])).toHaveLength(2);
    expect(mapWooCommerceOrders("nope")).toEqual([]);
  });

  test("状态文案映射", () => {
    expect(getStatusText(1)).toBe("待付款");
    expect(getStatusText(4)).toBe("已完成");
    expect(getStatusText(99)).toBe("未知状态");
  });
});

describe("orderService mock 数据源", () => {
  // getApp 未定义 → getDataSource() 回落 mock
  beforeEach(() => {
    jest.clearAllMocks();
    delete global.getApp;
  });

  test("列表默认返回全部 mock 订单", async () => {
    const list = await orderService.getOrderList(null);
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBeGreaterThan(0);
  });

  test("按状态筛选", async () => {
    const list = await orderService.getOrderList(4);
    expect(list.every((o) => o.status === 4)).toBe(true);
  });

  test("详情存在与不存在", async () => {
    const detail = await orderService.getOrderDetail(1);
    expect(detail.id).toBe(1);
    await expect(orderService.getOrderDetail(99999)).rejects.toThrow("订单不存在");
  });

  test("创建/取消/确认收货", async () => {
    const created = await orderService.createOrder({
      items: [{ id: 7, name: "绿萝", price: 29.9, quantity: 2, spec: "中号盆" }],
      remark: "测试",
    });
    expect(created.status).toBe(1);
    expect(created.orderNo).toMatch(/^SU\d{8}\d{3}$/);
    expect(created.totalQuantity).toBe(2);

    await expect(orderService.cancelOrder(1)).resolves.toBe(true);
    await expect(orderService.confirmReceive(2)).resolves.toBe(true);
  });
});

describe("orderService woocommerce 数据源", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.getApp = () => ({ globalData: { productSource: "woocommerce" } });
  });

  afterAll(() => {
    delete global.getApp;
  });

  test("列表走 /api/order/list 并映射", async () => {
    request.get.mockResolvedValue({
      code: 200,
      data: { list: [orderDto], total: 1, page: 1, pageSize: 20 },
    });
    const list = await orderService.getOrderList(1);
    expect(request.get).toHaveBeenCalledWith(
      "/api/order/list",
      expect.objectContaining({ status: 1, page: 1, pageSize: 20 }),
      expect.objectContaining({ useCache: false }),
    );
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(1001);
  });

  test("详情走 /api/order/detail", async () => {
    request.get.mockResolvedValue({ code: 200, data: orderDto });
    const detail = await orderService.getOrderDetail(1001);
    expect(request.get).toHaveBeenCalledWith(
      "/api/order/detail",
      { id: 1001 },
      expect.objectContaining({ useCache: false }),
    );
    expect(detail.orderNo).toBe("1001");
  });

  test("创建订单转换 items 与地址快照", async () => {
    request.post.mockResolvedValue({ code: 200, data: orderDto });
    const order = await orderService.createOrder({
      items: [{ id: 7, quantity: 2 }],
      address: { id: 3, name: "张三", phone: "13800138000", detail: "北京市朝阳区某某路 1 号" },
      remark: "尽快发货",
    });
    expect(request.post).toHaveBeenCalledWith(
      "/api/order/create",
      {
        items: [{ productId: 7, quantity: 2 }],
        address: { name: "张三", phone: "13800138000", detail: "北京市朝阳区某某路 1 号" },
        remark: "尽快发货",
      },
      expect.objectContaining({ useCache: false }),
    );
    expect(order.id).toBe(1001);
  });

  test("取消与确认收货走对应端点", async () => {
    request.post.mockResolvedValue({ code: 200, data: { ...orderDto, status: 0 } });
    await orderService.cancelOrder(1001);
    expect(request.post).toHaveBeenCalledWith(
      "/api/order/cancel",
      { id: 1001 },
      expect.objectContaining({ useCache: false }),
    );

    request.post.mockResolvedValue({ code: 200, data: { ...orderDto, status: 4 } });
    await orderService.confirmReceive(1001);
    expect(request.post).toHaveBeenCalledWith(
      "/api/order/confirm",
      { id: 1001 },
      expect.objectContaining({ useCache: false }),
    );
  });
});

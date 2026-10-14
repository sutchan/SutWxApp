/**
 * 文件名: pay-service.test.js
 * 版本号: 3.5.4
 * 更新日期: 2026-10-14
 * 描述: 支付服务单测（FE-004）：预支付参数校验、wx.requestPayment 封装、
 *       支付成功/失败后的查单兜底同步。
 */

jest.mock("../utils/request", () => ({
  post: jest.fn(),
}));

const request = require("../utils/request");
const payService = require("../services/payService");

// 预支付参数样例（后端 build_pay_params 输出）
const prepayParams = {
  timeStamp: "1760000000",
  nonceStr: "abc123",
  package: "prepay_id=wx20261014",
  signType: "RSA",
  paySign: "sign-value",
  orderId: 1001,
};

/** 可控 wx.requestPayment 桩 */
function mockWxPayment(behavior) {
  global.wx = {
    requestPayment: jest.fn((opts) => {
      behavior(opts);
    }),
  };
}

describe("fetchPrepayParams", () => {
  beforeEach(() => jest.clearAllMocks());

  test("返回有效参数", async () => {
    request.post.mockResolvedValue({ code: 200, data: prepayParams });
    const params = await payService.fetchPrepayParams(1001);
    expect(request.post).toHaveBeenCalledWith(
      "/api/pay/prepay",
      { orderId: 1001 },
      expect.objectContaining({ useCache: false }),
    );
    expect(params.paySign).toBe("sign-value");
  });

  test("缺少 paySign 应抛错", async () => {
    request.post.mockResolvedValue({ code: 200, data: { orderId: 1001 } });
    await expect(payService.fetchPrepayParams(1001)).rejects.toThrow("支付参数获取失败");
  });
});

describe("requestPayment", () => {
  beforeEach(() => jest.clearAllMocks());

  test("参数透传 wx.requestPayment，成功 resolve", async () => {
    mockWxPayment((opts) => opts.success({}));
    await expect(payService.requestPayment(prepayParams)).resolves.toBeUndefined();
    expect(global.wx.requestPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        timeStamp: "1760000000",
        nonceStr: "abc123",
        package: "prepay_id=wx20261014",
        signType: "RSA",
        paySign: "sign-value",
      }),
    );
  });

  test("signType 缺失回落 RSA", async () => {
    mockWxPayment((opts) => opts.success({}));
    await payService.requestPayment({ ...prepayParams, signType: "" });
    expect(global.wx.requestPayment).toHaveBeenCalledWith(
      expect.objectContaining({ signType: "RSA" }),
    );
  });

  test("失败 reject", async () => {
    mockWxPayment((opts) => opts.fail({ errMsg: "requestPayment:fail" }));
    await expect(payService.requestPayment(prepayParams)).rejects.toMatchObject({
      errMsg: "requestPayment:fail",
    });
  });
});

describe("payOrder 全流程", () => {
  beforeEach(() => jest.clearAllMocks());

  test("支付成功后查单同步，返回最新订单", async () => {
    const paidOrder = { ...prepayParams, id: 1001, status: 2, statusText: "待发货" };
    request.post
      .mockResolvedValueOnce({ code: 200, data: prepayParams }) // prepay
      .mockResolvedValueOnce({
        code: 200,
        data: { tradeState: "SUCCESS", order: paidOrder },
      }); // query
    mockWxPayment((opts) => opts.success({}));

    const order = await payService.payOrder(1001);
    expect(request.post).toHaveBeenNthCalledWith(
      2,
      "/api/pay/query",
      { orderId: 1001 },
      expect.objectContaining({ useCache: false }),
    );
    expect(order.status).toBe(2);
  });

  test("支付失败但查单显示已到账（回调延迟），返回已支付订单", async () => {
    const paidOrder = { ...prepayParams, id: 1001, status: 2 };
    request.post
      .mockResolvedValueOnce({ code: 200, data: prepayParams })
      .mockResolvedValueOnce({
        code: 200,
        data: { tradeState: "SUCCESS", order: paidOrder },
      });
    mockWxPayment((opts) =>
      opts.fail({ errMsg: "requestPayment:fail cancel" }),
    );

    const order = await payService.payOrder(1001);
    expect(order).not.toBeNull();
    expect(order.status).toBe(2);
  });

  test("支付失败且未到账，向上抛出原错误", async () => {
    const pendingOrder = { ...prepayParams, id: 1001, status: 1 };
    request.post
      .mockResolvedValueOnce({ code: 200, data: prepayParams })
      .mockResolvedValueOnce({
        code: 200,
        data: { tradeState: "NOTPAY", order: pendingOrder },
      });
    mockWxPayment((opts) => opts.fail({ errMsg: "requestPayment:fail" }));

    await expect(payService.payOrder(1001)).rejects.toMatchObject({
      errMsg: "requestPayment:fail",
    });
  });

  test("支付成功但查单失败，返回 null（不阻断主流程）", async () => {
    request.post
      .mockResolvedValueOnce({ code: 200, data: prepayParams })
      .mockRejectedValueOnce(new Error("query timeout"));
    mockWxPayment((opts) => opts.success({}));

    await expect(payService.payOrder(1001)).resolves.toBeNull();
  });
});

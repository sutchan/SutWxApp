/**
 * 文件名: orderService.mock.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 订单服务层演示数据（'mock' 数据源），从 orderService.js 抽离以保持单文件精简
 */

const mockOrders = [
  {
    id: 1,
    orderNo: "SU20260506001",
    status: 1,
    statusText: "待付款",
    totalPrice: 29.9,
    productPrice: 29.9,
    shippingFee: 0,
    totalQuantity: 1,
    createTime: "2026-05-06 10:30:00",
    products: [
      {
        id: 1,
        name: "绿萝盆栽",
        image: "/images/placeholder.svg",
        price: 29.9,
        quantity: 1,
        spec: "中号盆"
      }
    ],
    address: {
      name: "张三",
      phone: "13800138000",
      detail: "北京市朝阳区某某街道123号"
    }
  },
  {
    id: 2,
    orderNo: "SU20260506002",
    status: 3,
    statusText: "待收货",
    totalPrice: 137.9,
    productPrice: 127.9,
    shippingFee: 10,
    totalQuantity: 3,
    createTime: "2026-05-05 15:20:00",
    products: [
      {
        id: 2,
        name: "多肉植物组合",
        image: "/images/placeholder.svg",
        price: 49.9,
        quantity: 2,
        spec: "5株装"
      },
      {
        id: 3,
        name: "发财树",
        image: "/images/placeholder.svg",
        price: 38.1,
        quantity: 1,
        spec: "1米高"
      }
    ],
    address: {
      name: "李四",
      phone: "13900139000",
      detail: "上海市浦东新区某某路456号"
    }
  },
  {
    id: 3,
    orderNo: "SU20260506003",
    status: 4,
    statusText: "已完成",
    totalPrice: 88.0,
    productPrice: 88.0,
    shippingFee: 0,
    totalQuantity: 1,
    createTime: "2026-05-01 09:10:00",
    completeTime: "2026-05-04 14:20:00",
    products: [
      {
        id: 3,
        name: "发财树",
        image: "/images/placeholder.svg",
        price: 88.0,
        quantity: 1,
        spec: "1米高"
      }
    ],
    address: {
      name: "王五",
      phone: "13700137000",
      detail: "广州市天河区某某巷789号"
    }
  }
];

module.exports = { mockOrders };

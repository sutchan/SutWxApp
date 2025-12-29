/**
 * 文件名: index.js
 * 版本号: 1.0.0
 * 更新日期: 2025-12-27
 * 描述: 帮助中心页面，提供常见问题解答和客服联系方式
 */

Page({
  data: {
    searchKeyword: "",
    categories: [
      { id: 1, name: "购物指南", icon: "🛒", count: 8 },
      { id: 2, name: "支付问题", icon: "💳", count: 6 },
      { id: 3, name: "配送说明", icon: "📦", count: 5 },
      { id: 4, name: "售后服务", icon: "🔧", count: 7 },
    ],
    faqList: [
      {
        id: 1,
        question: "如何下单购买商品？",
        answer:
          '浏览商品后，选择规格和数量，点击"加入购物车"或"立即购买"，然后在购物车页面确认商品信息，点击"去结算"，填写收货地址并选择支付方式，最后提交订单完成购买。',
        expanded: false,
      },
      {
        id: 2,
        question: "支持哪些支付方式？",
        answer:
          "我们支持微信支付、支付宝支付、银行卡支付等多种支付方式。您可以在结算页面选择最适合您的支付方式进行付款。",
        expanded: false,
      },
      {
        id: 3,
        question: "下单后多久发货？",
        answer:
          "一般情况下，您下单后24小时内我们会安排发货。发货后，您可以在订单详情页面查看物流信息，跟踪包裹的配送进度。",
        expanded: false,
      },
      {
        id: 4,
        question: "如何查看物流信息？",
        answer:
          '您可以进入"我的订单"页面，点击相应的订单即可查看详细的物流信息。如有疑问，您可以联系我们的客服人员进行咨询。',
        expanded: false,
      },
      {
        id: 5,
        question: "支持退货退款吗？",
        answer:
          "我们支持7天无理由退货退款服务。如商品存在质量问题或与描述不符，您可以在收货后7天内申请退货退款。具体退货流程请咨询客服。",
        expanded: false,
      },
      {
        id: 6,
        question: "如何修改收货地址？",
        answer:
          '未发货的订单，您可以进入订单详情页面点击"修改地址"进行更改。如订单已发货，则无法修改地址，建议您联系客服尝试拦截快递。',
        expanded: false,
      },
      {
        id: 7,
        question: "积分有什么用途？",
        answer:
          "积分可以在结算时抵扣现金（100积分=1元），也可以参与积分商城兑换商品。此外，积分还可以参与不定期的积分抽奖活动。",
        expanded: false,
      },
      {
        id: 8,
        question: "如何联系客服？",
        answer:
          "您可以通过以下方式联系客服：1）拨打客服热线400-888-8888；2）点击页面右下角在线客服图标；3）发送邮件至support@sut.com。",
        expanded: false,
      },
    ],
  },

  onLoad: function (options) {},

  onSearchInput: function (e) {
    this.setData({
      searchKeyword: e.detail.value,
    });
  },

  onSearch: function () {
    const keyword = this.data.searchKeyword.trim();
    if (!keyword) {
      wx.showToast({
        title: "请输入搜索内容",
        icon: "none",
      });
      return;
    }

    const faqList = this.data.faqList.map((item) => {
      const match =
        item.question.includes(keyword) || item.answer.includes(keyword);
      return { ...item, expanded: match };
    });

    this.setData({ faqList });
    wx.showToast({
      title: "搜索完成",
      icon: "success",
      duration: 1000,
    });
  },

  onSelectCategory: function (e) {
    const id = e.currentTarget.dataset.id;
    const category = this.data.categories.find((item) => item.id === id);

    if (category) {
      const faqList = this.data.faqList.map((item) => {
        return { ...item, expanded: true };
      });

      this.setData({ faqList });

      wx.showToast({
        title: `查看${category.name}`,
        icon: "none",
      });
    }
  },

  onToggleQuestion: function (e) {
    const id = e.currentTarget.dataset.id;
    const faqList = this.data.faqList.map((item) => {
      if (item.id === id) {
        return { ...item, expanded: !item.expanded };
      }
      return item;
    });
    this.setData({ faqList });
  },

  onCallService: function () {
    wx.makePhoneCall({
      phoneNumber: "4008888888",
      fail: function () {
        wx.showToast({
          title: "拨打电话失败",
          icon: "none",
        });
      },
    });
  },

  onContactService: function () {
    wx.showModal({
      title: "在线客服",
      content: "是否跳转到客服对话？",
      confirmColor: "#ff4d4f",
      success: function (res) {
        if (res.confirm) {
          wx.showToast({
            title: "客服功能开发中",
            icon: "none",
          });
        }
      },
    });
  },

  onSendEmail: function () {
    wx.setClipboardData({
      data: "business@sut.com",
      success: function () {
        wx.showToast({
          title: "邮箱已复制",
          icon: "success",
        });
      },
    });
  },

  onFeedback: function () {
    wx.navigateTo({
      url: "/pages/settings/feedback/index",
    });
  },

  onShareAppMessage: function () {
    return {
      title: "苏铁商城 - 帮助中心",
      path: "/pages/help/index",
    };
  },
});

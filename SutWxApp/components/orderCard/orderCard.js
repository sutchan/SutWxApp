/**
 * 订单卡片组件
 * 用于在订单列表等位置展示订单信息
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 订单信息
    order: {
      type: Object,
      value: {}
    },
    // 是否显示边框
    bordered: {
      type: Boolean,
      value: true
    },
    // 是否显示操作按钮
    showActions: {
      type: Boolean,
      value: true
    },
    // 卡片宽度，默认100%
    width: {
      type: String,
      value: '100%'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 订单状态映射
    statusMap: {
      'pending': { text: '待付款', color: '#ff9500' },
      'paid': { text: '待发货', color: '#007aff' },
      'shipped': { text: '待收货', color: '#4cd964' },
      'completed': { text: '已完成', color: '#8e8e93' },
      'cancelled': { text: '已取消', color: '#8e8e93' },
      'refunded': { text: '已退款', color: '#8e8e93' }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 点击订单卡片
     */
    onOrderTap() {
      this.triggerEvent('tap', {
        order: this.data.order
      });
    },

    /**
     * 点击取消订单
     */
    onCancelOrder(e) {
      e.stopPropagation();
      this.triggerEvent('cancel', {
        order: this.data.order
      });
    },

    /**
     * 点击确认收货
     */
    onConfirmReceive(e) {
      e.stopPropagation();
      this.triggerEvent('confirm', {
        order: this.data.order
      });
    },

    /**
     * 点击删除订单
     */
    onDeleteOrder(e) {
      e.stopPropagation();
      this.triggerEvent('delete', {
        order: this.data.order
      });
    },

    /**
     * 点击评价订单
     */
    onReviewOrder(e) {
      e.stopPropagation();
      this.triggerEvent('review', {
        order: this.data.order
      });
    },

    /**
     * 点击查看物流
     */
    onViewLogistics(e) {
      e.stopPropagation();
      this.triggerEvent('logistics', {
        order: this.data.order
      });
    },

    /**
     * 格式化订单状态
     */
    formatOrderStatus(status) {
      return this.data.statusMap[status] || { text: '未知状态', color: '#8e8e93' };
    }
  }
});
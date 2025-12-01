/**
 * 文件名: orderCard.js
 * 版本号: 1.0.2
 * 更新日期: 2025-11-29
 * 作者: Sut
 * 描述: 订单卡片组件
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    // 订单数据
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
      'pending': { text: '待支付', color: '#ff9500' },
      'paid': { text: '已支付', color: '#007aff' },
      'shipped': { text: '已发货', color: '#4cd964' },
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
     * @returns {void}
     */
    onOrderTap() {
      this.triggerEvent('tap', {
        order: this.properties.order
      });
    },

    /**
     * 点击取消订单按钮
     * @param {Object} e - 事件对象
     * @returns {void}
     */
    onCancelOrder(e) {
      e.stopPropagation();
      this.triggerEvent('cancel', {
        order: this.properties.order
      });
    },

    /**
     * 点击确认收货按钮
     * @param {Object} e - 事件对象
     * @returns {void}
     */
    onConfirmReceive(e) {
      e.stopPropagation();
      this.triggerEvent('confirm', {
        order: this.properties.order
      });
    },

    /**
     * 点击删除订单按钮
     * @param {Object} e - 事件对象
     * @returns {void}
     */
    onDeleteOrder(e) {
      e.stopPropagation();
      this.triggerEvent('delete', {
        order: this.properties.order
      });
    },

    /**
     * 点击评价订单按钮
     * @param {Object} e - 事件对象
     * @returns {void}
     */
    onReviewOrder(e) {
      e.stopPropagation();
      this.triggerEvent('review', {
        order: this.properties.order
      });
    },

    /**
     * 点击查看物流按钮
     * @param {Object} e - 事件对象
     * @returns {void}
     */
    onViewLogistics(e) {
      e.stopPropagation();
      this.triggerEvent('logistics', {
        order: this.properties.order
      });
    },

    /**
     * 格式化订单状态
     * @param {string} status - 订单状态
     * @returns {Object} 格式化后的状态信息
     */
    formatOrderStatus(status) {
      return this.data.statusMap[status] || { text: '未知状态', color: '#8e8e93' };
    }
  }
});
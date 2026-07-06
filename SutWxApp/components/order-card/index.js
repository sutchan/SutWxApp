/**
 * 文件名: index.js
 * 版本号: 3.0.0
 * 更新日期: 2026-07-06
 * 描述: OrderCard 订单卡片组件，用于展示订单信息和操作入口
 */

Component({
  properties: {
    /**
     * 订单数据
     */
    order: {
      type: Object,
      value: {}
    },
    /**
     * 是否显示操作按钮
     */
    showActions: {
      type: Boolean,
      value: true
    }
  },

  data: {
    /**
     * 状态类名
     */
    statusClass: '',
    /**
     * 操作按钮列表
     */
    actionButtons: []
  },

  observers: {
    'order': function (order) {
      this.updateStatusAndActions();
    }
  },

  lifetimes: {
    attached: function () {
      this.updateStatusAndActions();
    }
  },

  methods: {
    /**
     * 更新状态样式和操作按钮
     */
    updateStatusAndActions: function () {
      const { order } = this.properties;
      const status = order.status || '';
      
      let statusClass = '';
      let actionButtons = [];
      
      switch (status) {
        case 'pending':
          statusClass = 's-order-status-pending';
          actionButtons = [
            { key: 'cancel', text: '取消订单', variant: 'default' },
            { key: 'pay', text: '去支付', variant: 'primary' }
          ];
          break;
        case 'shipping':
          statusClass = 's-order-status-shipping';
          actionButtons = [
            { key: 'confirm', text: '确认收货', variant: 'primary' }
          ];
          break;
        case 'completed':
          statusClass = 's-order-status-completed';
          actionButtons = [
            { key: 'rebuy', text: '再次购买', variant: 'default' },
            { key: 'review', text: '去评价', variant: 'primary' }
          ];
          break;
        case 'cancelled':
          statusClass = 's-order-status-cancelled';
          actionButtons = [
            { key: 'delete', text: '删除订单', variant: 'default' },
            { key: 'rebuy', text: '再次购买', variant: 'primary' }
          ];
          break;
        default:
          statusClass = '';
          actionButtons = [];
      }
      
      this.setData({
        statusClass,
        actionButtons
      });
    },

    /**
     * 卡片点击事件
     */
    onTap: function (e) {
      this.triggerEvent('tap', { order: this.properties.order });
    },

    /**
     * 操作按钮点击事件
     */
    onActionTap: function (e) {
      const action = e.currentTarget.dataset.action;
      this.triggerEvent('action', { 
        order: this.properties.order,
        action: action
      });
    }
  }
});

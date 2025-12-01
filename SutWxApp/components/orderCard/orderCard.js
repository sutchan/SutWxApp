/**
 * 鏂囦欢鍚? orderCard.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 浣滆€? Sut
 * 鎻忚堪: 璁㈠崟鍗＄墖缁勪欢 */
Component({
  /**
   * 缁勪欢鐨勫睘鎬у垪琛?   */
  properties: {
    // 璁㈠崟鏁版嵁
    order: {
      type: Object,
      value: {}
    },
    // 鏄惁鏄剧ず杈规
    bordered: {
      type: Boolean,
      value: true
    },
    // 鏄惁鏄剧ず鎿嶄綔鎸夐挳
    showActions: {
      type: Boolean,
      value: true
    },
    // 鍗＄墖瀹藉害锛岄粯璁?00%
    width: {
      type: String,
      value: '100%'
    }
  },

  /**
   * 缁勪欢鐨勫垵濮嬫暟鎹?   */
  data: {
    // 璁㈠崟鐘舵€佹槧灏?    statusMap: {
      'pending': { text: '寰呬粯娆?, color: '#ff9500' },
      'paid': { text: '寰呭彂璐?, color: '#007aff' },
      'shipped': { text: '寰呮敹璐?, color: '#4cd964' },
      'completed': { text: '宸插畬鎴?, color: '#8e8e93' },
      'cancelled': { text: '宸插彇娑?, color: '#8e8e93' },
      'refunded': { text: '宸查€€娆?, color: '#8e8e93' }
    }
  },

  /**
   * 缁勪欢鐨勬柟娉曞垪琛?   */
  methods: {
    /**
     * 鐐瑰嚮璁㈠崟鍗＄墖
     * @returns {void}
     */
    onOrderTap() {
      this.triggerEvent('tap', {
        order: this.properties.order
      });
    },

    /**
     * 鐐瑰嚮鍙栨秷璁㈠崟鎸夐挳
     * @param {Object} e - 浜嬩欢瀵硅薄
     * @returns {void}
     */
    onCancelOrder(e) {
      e.stopPropagation();
      this.triggerEvent('cancel', {
        order: this.properties.order
      });
    },

    /**
     * 鐐瑰嚮纭鏀惰揣鎸夐挳
     * @param {Object} e - 浜嬩欢瀵硅薄
     * @returns {void}
     */
    onConfirmReceive(e) {
      e.stopPropagation();
      this.triggerEvent('confirm', {
        order: this.properties.order
      });
    },

    /**
     * 鐐瑰嚮鍒犻櫎璁㈠崟鎸夐挳
     * @param {Object} e - 浜嬩欢瀵硅薄
     * @returns {void}
     */
    onDeleteOrder(e) {
      e.stopPropagation();
      this.triggerEvent('delete', {
        order: this.properties.order
      });
    },

    /**
     * 鐐瑰嚮璇勪环璁㈠崟鎸夐挳
     * @param {Object} e - 浜嬩欢瀵硅薄
     * @returns {void}
     */
    onReviewOrder(e) {
      e.stopPropagation();
      this.triggerEvent('review', {
        order: this.properties.order
      });
    },

    /**
     * 鐐瑰嚮鏌ョ湅鐗╂祦鎸夐挳
     * @param {Object} e - 浜嬩欢瀵硅薄
     * @returns {void}
     */
    onViewLogistics(e) {
      e.stopPropagation();
      this.triggerEvent('logistics', {
        order: this.properties.order
      });
    },

    /**
     * 鏍煎紡鍖栬鍗曠姸鎬?     * @param {string} status - 璁㈠崟鐘舵€?     * @returns {Object} 鐘舵€佹樉绀洪厤缃?     */
    formatOrderStatus(status) {
      return this.data.statusMap[status] || { text: '鏈煡鐘舵€?, color: '#8e8e93' };
    }
  }
});

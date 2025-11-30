/**
 * 文件名: list.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 鐢ㄦ埛浼樻儬鍒稿垪琛ㄩ〉闈? */
Page({
  data: {
    couponList: [],
    loading: true,
    activeTab: 0, // 0: 鍙敤, 1: 宸蹭娇鐢? 2: 宸茶繃鏈?    tabs: ['鍙敤', '宸蹭娇鐢?, '宸茶繃鏈?],
    timer: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @returns {void}
   */
  onLoad() {
    this.loadCouponList(this.data.activeTab);
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   * @returns {void}
   */
  onUnload() {
    // 娓呯悊瀹氭椂鍣紝闃叉鍐呭瓨娉勬紡
    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
  },

  /**
   * 鍒囨崲浼樻儬鍒哥被鍨?   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  onTabChange(e) {
    const index = e.detail.index;
    this.setData({ activeTab: index });
    this.loadCouponList(index);
  },

  /**
   * 鍔犺浇浼樻儬鍒稿垪琛?   * @param {number} type - 浼樻儬鍒哥被鍨?(0: 鍙敤, 1: 宸蹭娇鐢? 2: 宸茶繃鏈?
   * @returns {void}
   */
  loadCouponList(type) {
    this.setData({ loading: true });
    // 妯℃嫙鏁版嵁璇锋眰
    const timer = setTimeout(() => {
      let mockList = [];
      if (type === 0) {
        mockList = [
          { id: 1, name: '婊?00鍑?0鍏?, value: 10, condition: '婊?00鍏冨彲鐢?, endDate: '2023-12-31' },
          { id: 2, name: '鏂颁汉涓撲韩鍒?, value: 5, condition: '鏃犻棬妲?, endDate: '2023-11-30' }
        ];
      } else if (type === 1) {
        mockList = [
          { id: 3, name: '宸蹭娇鐢ㄤ紭鎯犲埜', value: 20, condition: '婊?00鍏冨彲鐢?, endDate: '2023-10-31' }
        ];
      } else if (type === 2) {
        mockList = [
          { id: 4, name: '宸茶繃鏈熶紭鎯犲埜', value: 15, condition: '婊?50鍏冨彲鐢?, endDate: '2023-09-30' }
        ];
      }
      this.setData({
        couponList: mockList,
        loading: false,
        timer: null
      });
    }, 500);
    
    this.setData({ timer });
  }
});

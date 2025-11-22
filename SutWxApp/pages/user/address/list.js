/**
 * 文件名: list.js
 * 用户地址列表页面
 */
Page({
  data: {
    addressList: [],
    loading: true
  },

  /**
   * 生命周期函数--监听页面加载
   * @returns {void}
   */
  onLoad() {
    this.loadAddressList();
  },

  /**
   * 生命周期函数--监听页面显示
   * @returns {void}
   */
  onShow() {
    // 页面显示时刷新地址列表，确保数据最新
    this.loadAddressList();
  },

  /**
   * 加载地址列表
   * @returns {void}
   */
  loadAddressList() {
    this.setData({ loading: true });
    // 模拟数据请求
    setTimeout(() => {
      const mockList = [
        {
          id: '1',
          name: '张三',
          phone: '13800138000',
          province: '广东省',
          city: '广州市',
          district: '天河区',
          detail: 'XXX街道XXX号',
          isDefault: true
        },
        {
          id: '2',
          name: '李四',
          phone: '13912345678',
          province: '广东省',
          city: '深圳市',
          district: '南山区',
          detail: 'YYY路YYY号',
          isDefault: false
        }
      ];
      this.setData({
        addressList: mockList,
        loading: false
      });
    }, 500);
  },

  /**
   * 编辑地址
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  editAddress(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/user/address/edit?id=${id}`
    });
  },

  /**
   * 添加新地址
   * @returns {void}
   */
  addAddress() {
    wx.navigateTo({
      url: '/pages/user/address/edit'
    });
  }
});
// 地址列表页面逻辑
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    addressList: [], // 地址列表
    loading: true, // 加载状态
    error: false, // 错误状态
    errorMsg: '', // 错误信息
    selectMode: false, // 是否为选择模式（从订单页面跳转过来选择地址）
    selectedAddressId: '' // 选中的地址ID
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 记录页面访问事件
    app.analyticsService.track('page_view', {
      page: 'address_list',
      select_mode: options.selectMode === 'true'
    });
    
    // 检查是否为选择模式
    if (options.selectMode === 'true') {
      this.setData({
        selectMode: true
      });
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 检查是否登录
    if (!app.isLoggedIn()) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: '请先登录',
        addressList: []
      });
      return;
    }
    this.loadAddressList();
  },

  /**
   * 监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.loadAddressList();
  },

  /**
   * 加载地址列表
   */
  async loadAddressList() {
    try {
      this.setData({
        loading: true,
        error: false
      });

      // 使用addressService获取地址列表
      const addressList = await app.services.address.getAddressList();
      
      this.setData({
        addressList: addressList || [],
        loading: false
      });
    } catch (err) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: err.message || '加载失败，请重试'
      });
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 新增地址
   */
  onAddAddress: function() {
    wx.navigateTo({
      url: '/pages/user/address/edit?mode=add'
    });
  },

  /**
   * 编辑地址
   */
  onEditAddress: function(e) {
    const addressId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/address/edit?mode=edit&id=${addressId}`
    });
  },

  /**
   * 删除地址
   */
  onDeleteAddress(e) {
    const addressId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个地址吗？',
      success: async (resModal) => {
        if (resModal.confirm) {
          try {
            // 记录地址删除事件
            app.analyticsService.track('address_deleted', {
              address_id: addressId
            });
            
            // 使用addressService删除地址
            await app.services.address.deleteAddress(addressId);
            
            showToast('删除成功', 'success');
            // 重新加载地址列表
            this.loadAddressList();
          } catch (err) {
            showToast(err.message || '删除失败，请重试', 'none');
          }
        }
      }
    });
  },

  /**
   * 设置默认地址
   */
  async onSetDefault(e) {
    try {
      const addressId = e.currentTarget.dataset.id;
      
      // 记录设置默认地址事件
      app.analyticsService.track('address_set_default', {
        address_id: addressId
      });
      
      // 使用addressService设置默认地址
      await app.services.address.setDefaultAddress(addressId);
      
      showToast('设置成功', 'success');
      // 重新加载地址列表
      this.loadAddressList();
    } catch (err) {
      showToast(err.message || '设置失败，请重试', 'none');
    }
  },

  /**
   * 选择地址（用于订单页面）
   */
  onSelectAddress: function(e) {
    if (!this.data.selectMode) return;
    
    const addressId = e.currentTarget.dataset.id;
    const address = this.data.addressList.find(item => item.id === addressId);
    
    // 将选中的地址返回给上一页
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        selectedAddress: address
      });
    }
    
    // 返回上一页
    wx.navigateBack();
  },

  /**
   * 去登录
   */
  onLogin: function() {
    // 记录登录跳转事件
    app.analyticsService.track('login_redirect', {
      from_page: 'address_list'
    });
    
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  /**
   * 重试加载
   */
  onRetry: function() {
    // 记录重试加载事件
    app.analyticsService.track('retry_loading', {
      page: 'address_list'
    });
    
    this.loadAddressList();
  }
});
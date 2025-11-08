// 鍦板潃鍒楄〃椤甸潰閫昏緫
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    addressList: [], // 鍦板潃鍒楄〃
    loading: true, // 鍔犺浇鐘舵€?    error: false, // 閿欒鐘舵€?    errorMsg: '', // 閿欒淇℃伅
    selectMode: false, // 鏄惁涓洪€夋嫨妯″紡锛堜粠璁㈠崟椤甸潰璺宠浆杩囨潵閫夋嫨鍦板潃锛?    selectedAddressId: '' // 閫変腑鐨勫湴鍧€ID
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'address_list',
      select_mode: options.selectMode === 'true'
    });
    
    // 妫€鏌ユ槸鍚︿负閫夋嫨妯″紡
    if (options.selectMode === 'true') {
      this.setData({
        selectMode: true
      });
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 妫€鏌ユ槸鍚︾櫥褰?    if (!app.isLoggedIn()) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: '璇峰厛鐧诲綍',
        addressList: []
      });
      return;
    }
    this.loadAddressList();
  },

  /**
   * 鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
   */
  onPullDownRefresh: function() {
    this.loadAddressList();
  },

  /**
   * 鍔犺浇鍦板潃鍒楄〃
   */
  async loadAddressList() {
    try {
      this.setData({
        loading: true,
        error: false
      });

      // 浣跨敤addressService鑾峰彇鍦板潃鍒楄〃
      const addressList = await app.services.address.getAddressList();
      
      this.setData({
        addressList: addressList || [],
        loading: false
      });
    } catch (err) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: err.message || '鍔犺浇澶辫触锛岃閲嶈瘯'
      });
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 鏂板鍦板潃
   */
  onAddAddress: function() {
    wx.navigateTo({
      url: '/pages/user/address/edit?mode=add'
    });
  },

  /**
   * 缂栬緫鍦板潃
   */
  onEditAddress: function(e) {
    const addressId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/address/edit?mode=edit&id=${addressId}`
    });
  },

  /**
   * 鍒犻櫎鍦板潃
   */
  onDeleteAddress(e) {
    const addressId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '纭鍒犻櫎',
      content: '纭畾瑕佸垹闄よ繖涓湴鍧€鍚楋紵',
      success: async (resModal) => {
        if (resModal.confirm) {
          try {
            // 璁板綍鍦板潃鍒犻櫎浜嬩欢
            app.analyticsService.track('address_deleted', {
              address_id: addressId
            });
            
            // 浣跨敤addressService鍒犻櫎鍦板潃
            await app.services.address.deleteAddress(addressId);
            
            showToast('鍒犻櫎鎴愬姛', 'success');
            // 閲嶆柊鍔犺浇鍦板潃鍒楄〃
            this.loadAddressList();
          } catch (err) {
            showToast(err.message || '鍒犻櫎澶辫触锛岃閲嶈瘯', 'none');
          }
        }
      }
    });
  },

  /**
   * 璁剧疆榛樿鍦板潃
   */
  async onSetDefault(e) {
    try {
      const addressId = e.currentTarget.dataset.id;
      
      // 璁板綍璁剧疆榛樿鍦板潃浜嬩欢
      app.analyticsService.track('address_set_default', {
        address_id: addressId
      });
      
      // 浣跨敤addressService璁剧疆榛樿鍦板潃
      await app.services.address.setDefaultAddress(addressId);
      
      showToast('璁剧疆鎴愬姛', 'success');
      // 閲嶆柊鍔犺浇鍦板潃鍒楄〃
      this.loadAddressList();
    } catch (err) {
      showToast(err.message || '璁剧疆澶辫触锛岃閲嶈瘯', 'none');
    }
  },

  /**
   * 閫夋嫨鍦板潃锛堢敤浜庤鍗曢〉闈級
   */
  onSelectAddress: function(e) {
    if (!this.data.selectMode) return;
    
    const addressId = e.currentTarget.dataset.id;
    const address = this.data.addressList.find(item => item.id === addressId);
    
    // 灏嗛€変腑鐨勫湴鍧€杩斿洖缁欎笂涓€椤?    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        selectedAddress: address
      });
    }
    
    // 杩斿洖涓婁竴椤?    wx.navigateBack();
  },

  /**
   * 鍘荤櫥褰?   */
  onLogin: function() {
    // 璁板綍鐧诲綍璺宠浆浜嬩欢
    app.analyticsService.track('login_redirect', {
      from_page: 'address_list'
    });
    
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  onRetry: function() {
    // 璁板綍閲嶈瘯鍔犺浇浜嬩欢
    app.analyticsService.track('retry_loading', {
      page: 'address_list'
    });
    
    this.loadAddressList();
  }
});\n
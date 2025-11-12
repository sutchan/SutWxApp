锘?/ 閸︽澘娼冮崚妤勩€冩い鐢告桨闁槒绶?const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    addressList: [], // 閸︽澘娼冮崚妤勩€?    loading: true, // 閸旂姾娴囬悩鑸碘偓?    error: false, // 闁挎瑨顕ら悩鑸碘偓?    errorMsg: '', // 闁挎瑨顕ゆ穱鈩冧紖
    selectMode: false, // 閺勵垰鎯佹稉娲偓澶嬪濡€崇础閿涘牅绮犵拋銏犲礋妞ょ敻娼扮捄瀹犳祮鏉╁洦娼甸柅澶嬪閸︽澘娼冮敍?    selectedAddressId: '' // 闁鑵戦惃鍕勾閸р偓ID
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.analyticsService.track('page_view', {
      page: 'address_list',
      select_mode: options.selectMode === 'true'
    });
    
    // 濡偓閺屻儲妲搁崥锔胯礋闁瀚ㄥΟ鈥崇础
    if (options.selectMode === 'true') {
      this.setData({
        selectMode: true
      });
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 濡偓閺屻儲妲搁崥锔炬瑜?    if (!app.isLoggedIn()) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: '鐠囧嘲鍘涢惂璇茬秿',
        addressList: []
      });
      return;
    }
    this.loadAddressList();
  },

  /**
   * 閻╂垵鎯夐悽銊﹀煕娑撳濯洪崝銊ょ稊
   */
  onPullDownRefresh: function() {
    this.loadAddressList();
  },

  /**
   * 閸旂姾娴囬崷鏉挎絻閸掓銆?   */
  async loadAddressList() {
    try {
      this.setData({
        loading: true,
        error: false
      });

      // 娴ｈ法鏁ddressService閼惧嘲褰囬崷鏉挎絻閸掓銆?      const addressList = await app.services.address.getAddressList();
      
      this.setData({
        addressList: addressList || [],
        loading: false
      });
    } catch (err) {
      this.setData({
        loading: false,
        error: true,
        errorMsg: err.message || '閸旂姾娴囨径杈Е閿涘矁顕柌宥堢槸'
      });
    } finally {
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 閺傛澘顤冮崷鏉挎絻
   */
  onAddAddress: function() {
    wx.navigateTo({
      url: '/pages/user/address/edit?mode=add'
    });
  },

  /**
   * 缂傛牞绶崷鏉挎絻
   */
  onEditAddress: function(e) {
    const addressId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/user/address/edit?mode=edit&id=${addressId}`
    });
  },

  /**
   * 閸掔娀娅庨崷鏉挎絻
   */
  onDeleteAddress(e) {
    const addressId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '绾喛顓婚崚鐘绘珟',
      content: '绾喖鐣剧憰浣稿灩闂勩倛绻栨稉顏勬勾閸р偓閸氭绱?,
      success: async (resModal) => {
        if (resModal.confirm) {
          try {
            // 鐠佹澘缍嶉崷鏉挎絻閸掔娀娅庢禍瀣╂
            app.analyticsService.track('address_deleted', {
              address_id: addressId
            });
            
            // 娴ｈ法鏁ddressService閸掔娀娅庨崷鏉挎絻
            await app.services.address.deleteAddress(addressId);
            
            showToast('閸掔娀娅庨幋鎰', 'success');
            // 闁插秵鏌婇崝鐘烘祰閸︽澘娼冮崚妤勩€?            this.loadAddressList();
          } catch (err) {
            showToast(err.message || '閸掔娀娅庢径杈Е閿涘矁顕柌宥堢槸', 'none');
          }
        }
      }
    });
  },

  /**
   * 鐠佸墽鐤嗘妯款吇閸︽澘娼?   */
  async onSetDefault(e) {
    try {
      const addressId = e.currentTarget.dataset.id;
      
      // 鐠佹澘缍嶇拋鍓х枂姒涙顓婚崷鏉挎絻娴滃娆?      app.analyticsService.track('address_set_default', {
        address_id: addressId
      });
      
      // 娴ｈ法鏁ddressService鐠佸墽鐤嗘妯款吇閸︽澘娼?      await app.services.address.setDefaultAddress(addressId);
      
      showToast('鐠佸墽鐤嗛幋鎰', 'success');
      // 闁插秵鏌婇崝鐘烘祰閸︽澘娼冮崚妤勩€?      this.loadAddressList();
    } catch (err) {
      showToast(err.message || '鐠佸墽鐤嗘径杈Е閿涘矁顕柌宥堢槸', 'none');
    }
  },

  /**
   * 闁瀚ㄩ崷鏉挎絻閿涘牏鏁ゆ禍搴ゎ吂閸楁洟銆夐棃顫礆
   */
  onSelectAddress: function(e) {
    if (!this.data.selectMode) return;
    
    const addressId = e.currentTarget.dataset.id;
    const address = this.data.addressList.find(item => item.id === addressId);
    
    // 鐏忓棝鈧鑵戦惃鍕勾閸р偓鏉╂柨娲栫紒娆庣瑐娑撯偓妞?    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    if (prevPage) {
      prevPage.setData({
        selectedAddress: address
      });
    }
    
    // 鏉╂柨娲栨稉濠佺妞?    wx.navigateBack();
  },

  /**
   * 閸樿崵娅ヨぐ?   */
  onLogin: function() {
    // 鐠佹澘缍嶉惂璇茬秿鐠哄疇娴嗘禍瀣╂
    app.analyticsService.track('login_redirect', {
      from_page: 'address_list'
    });
    
    wx.navigateTo({
      url: '/pages/user/login/login'
    });
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  onRetry: function() {
    // 鐠佹澘缍嶉柌宥堢槸閸旂姾娴囨禍瀣╂
    app.analyticsService.track('retry_loading', {
      page: 'address_list'
    });
    
    this.loadAddressList();
  }
});\n
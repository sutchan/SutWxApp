// 鍦板潃缂栬緫椤甸潰閫昏緫
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    mode: 'add', // 妯″紡锛歛dd 娣诲姞锛宔dit 缂栬緫
    id: '', // 鍦板潃ID锛堢紪杈戞ā寮忎笅浣跨敤锛?    name: '', // 鏀惰揣浜哄鍚?    phone: '', // 鎵嬫満鍙风爜
    province: '', // 鐪佷唤
    city: '', // 鍩庡競
    district: '', // 鍖?鍘?    detail: '', // 璇︾粏鍦板潃
    isDefault: false, // 鏄惁榛樿鍦板潃
    loading: false, // 鍔犺浇鐘舵€?    submitting: false // 鎻愪氦鐘舵€?  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'address_edit',
      mode: options.mode || 'add'
    });
    
    // 鑾峰彇妯″紡鍜孖D鍙傛暟
    const mode = options.mode || 'add';
    const id = options.id || '';
    
    this.setData({
      mode: mode,
      id: id
    });
    
    // 濡傛灉鏄紪杈戞ā寮忥紝鍔犺浇鍦板潃璇︽儏
    if (mode === 'edit' && id) {
      this.loadAddressDetail(id);
    }
  },

  /**
   * 鍔犺浇鍦板潃璇︽儏
   */
  async loadAddressDetail(id) {
    try {
      this.setData({ loading: true });
      
      // 浣跨敤addressService鑾峰彇鍦板潃璇︽儏
      const address = await app.services.address.getAddressDetail(id);
      
      this.setData({
        name: address.name || '',
        phone: address.phone || '',
        province: address.province || '',
        city: address.city || '',
        district: address.district || '',
        detail: address.detail || '',
        isDefault: address.isDefault || false
      });
    } catch (err) {
      showToast(err.message || '鍔犺浇澶辫触锛岃閲嶈瘯', 'none');
      // 杩斿洖鍒板湴鍧€鍒楄〃椤?      wx.navigateBack();
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 杈撳叆濮撳悕
   */
  onNameInput: function(e) {
    this.setData({
      name: e.detail.value
    });
  },

  /**
   * 杈撳叆鎵嬫満鍙?   */
  onPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  /**
   * 閫夋嫨鍦板尯
   */
  onRegionChange: function(e) {
    const region = e.detail.value;
    this.setData({
      province: region[0] || '',
      city: region[1] || '',
      district: region[2] || ''
    });
  },

  /**
   * 杈撳叆璇︾粏鍦板潃
   */
  onDetailInput: function(e) {
    this.setData({
      detail: e.detail.value
    });
  },

  /**
   * 鍒囨崲鏄惁榛樿鍦板潃
   */
  onDefaultChange: function(e) {
    this.setData({
      isDefault: e.detail.value
    });
  },

  /**
   * 琛ㄥ崟楠岃瘉
   */
  validateForm() {
    const { name, phone, province, city, district, detail } = this.data;
    
    if (!name.trim()) {
      showToast('璇疯緭鍏ユ敹璐т汉濮撳悕', 'none');
      return false;
    }
    
    // 绠€鍗曠殑鎵嬫満鍙烽獙璇侊紙11浣嶆暟瀛楋級
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phone.trim() || !phoneRegex.test(phone)) {
      showToast('璇疯緭鍏ユ纭殑鎵嬫満鍙风爜', 'none');
      return false;
    }
    
    if (!province || !city || !district) {
      showToast('璇烽€夋嫨鎵€鍦ㄥ湴鍖?, 'none');
      return false;
    }
    
    if (!detail.trim()) {
      showToast('璇疯緭鍏ヨ缁嗗湴鍧€', 'none');
      return false;
    }
    
    return true;
  },

  /**
   * 鎻愪氦琛ㄥ崟
   */
  async onSubmit() {
    // 琛ㄥ崟楠岃瘉
    if (!this.validateForm()) {
      return;
    }
    
    try {
      const { mode, id, name, phone, province, city, district, detail, isDefault } = this.data;
      
      this.setData({ submitting: true });
      
      // 鏋勫缓璇锋眰鍙傛暟
      const data = {
        name: name.trim(),
        phone: phone.trim(),
        province: province,
        city: city,
        district: district,
        detail: detail.trim(),
        isDefault: isDefault
      };
      
      // 鏍规嵁妯″紡閫夋嫨璋冪敤鐨勬湇鍔℃柟娉?      if (mode === 'edit') {
        // 璁板綍鍦板潃淇敼浜嬩欢
        app.analyticsService.track('address_updated', {
          address_id: id
        });
        
        await app.services.address.updateAddress(id, data);
        showToast('淇敼鎴愬姛', 'success');
      } else {
        // 璁板綍鍦板潃娣诲姞浜嬩欢
        app.analyticsService.track('address_added', {
          province: province,
          is_default: isDefault
        });
        
        await app.services.address.createAddress(data);
        showToast('娣诲姞鎴愬姛', 'success');
      }
      
      // 寤惰繜杩斿洖鍦板潃鍒楄〃椤?      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      const { mode } = this.data;
      showToast(err.message || (mode === 'add' ? '娣诲姞澶辫触锛岃閲嶈瘯' : '淇敼澶辫触锛岃閲嶈瘯'), 'none');
    } finally {
      this.setData({ submitting: false });
    }
  }
});
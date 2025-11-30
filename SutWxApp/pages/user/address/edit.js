/**
 * 文件名: edit.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 鐢ㄦ埛鍦板潃缂栬緫椤甸潰
 */
Page({
  data: {
    addressId: null,
    formData: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      isDefault: false
    },
    rules: [
      { name: 'name', rules: { required: true, message: '璇疯緭鍏ユ敹璐т汉濮撳悕' } },
      { name: 'phone', rules: [{ required: true, message: '璇疯緭鍏ユ墜鏈哄彿鐮? }, { mobile: true, message: '鎵嬫満鍙风爜鏍煎紡涓嶆纭? }] },
      { name: 'province', rules: { required: true, message: '璇烽€夋嫨鐪佷唤' } },
      { name: 'city', rules: { required: true, message: '璇烽€夋嫨鍩庡競' } },
      { name: 'detail', rules: { required: true, message: '璇疯緭鍏ヨ缁嗗湴鍧€' } }
    ],
    timer: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   * @param {Object} options - 椤甸潰鍙傛暟
   * @param {string} options.id - 鍦板潃ID
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ addressId: options.id });
      this.loadAddressDetail(options.id);
    }
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
   * 鍔犺浇鍦板潃璇︽儏
   * @param {string} id - 鍦板潃ID
   * @returns {void}
   */
  loadAddressDetail(id) {
    // 妯℃嫙鏁版嵁璇锋眰
    const timer = setTimeout(() => {
      const mockAddress = {
        id: id,
        name: '寮犱笁',
        phone: '13800138000',
        province: '骞夸笢鐪?,
        city: '骞垮窞甯?,
        district: '澶╂渤鍖?,
        detail: 'XXX琛楅亾XXX鍙?,
        isDefault: true
      };
      this.setData({ 
        'formData': mockAddress,
        timer: null
      });
    }, 500);
    
    this.setData({ timer });
  },

  /**
   * 琛ㄥ崟杈撳叆鏀瑰彉
   * @param {Object} e - 浜嬩欢瀵硅薄
   * @returns {void}
   */
  formInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  /**
   * 鎻愪氦琛ㄥ崟
   * @returns {void}
   */
  submitForm() {
    this.selectComponent('#form').validate((valid, errors) => {
      if (valid) {
        wx.showToast({
          title: '鎻愪氦鎴愬姛',
          icon: 'success'
        });
        // 瀹為檯鎻愪氦閫昏緫
      } else {
        const firstError = errors[0];
        wx.showToast({
          title: firstError.message,
          icon: 'none'
        });
      }
    });
  }
});
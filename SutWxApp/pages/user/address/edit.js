锘?/ 閸︽澘娼冪紓鏍帆妞ょ敻娼伴柅鏄忕帆
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    mode: 'add', // 濡€崇础閿涙瓫dd 濞ｈ濮為敍瀹攄it 缂傛牞绶?    id: '', // 閸︽澘娼僆D閿涘牏绱潏鎴災佸蹇庣瑓娴ｈ法鏁ら敍?    name: '', // 閺€鎯版彛娴滃搫顫橀崥?    phone: '', // 閹靛婧€閸欓鐖?    province: '', // 閻椒鍞?    city: '', // 閸╁骸绔?    district: '', // 閸?閸?    detail: '', // 鐠囷妇绮忛崷鏉挎絻
    isDefault: false, // 閺勵垰鎯佹妯款吇閸︽澘娼?    loading: false, // 閸旂姾娴囬悩鑸碘偓?    submitting: false // 閹绘劒姘﹂悩鑸碘偓?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.analyticsService.track('page_view', {
      page: 'address_edit',
      mode: options.mode || 'add'
    });
    
    // 閼惧嘲褰囧Ο鈥崇础閸滃瓥D閸欏倹鏆?    const mode = options.mode || 'add';
    const id = options.id || '';
    
    this.setData({
      mode: mode,
      id: id
    });
    
    // 婵″倹鐏夐弰顖滅椽鏉堟垶膩瀵骏绱濋崝鐘烘祰閸︽澘娼冪拠锔藉剰
    if (mode === 'edit' && id) {
      this.loadAddressDetail(id);
    }
  },

  /**
   * 閸旂姾娴囬崷鏉挎絻鐠囷附鍎?   */
  async loadAddressDetail(id) {
    try {
      this.setData({ loading: true });
      
      // 娴ｈ法鏁ddressService閼惧嘲褰囬崷鏉挎絻鐠囷附鍎?      const address = await app.services.address.getAddressDetail(id);
      
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
      showToast(err.message || '閸旂姾娴囨径杈Е閿涘矁顕柌宥堢槸', 'none');
      // 鏉╂柨娲栭崚鏉挎勾閸р偓閸掓銆冩い?      wx.navigateBack();
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 鏉堟挸鍙嗘慨鎾虫倳
   */
  onNameInput: function(e) {
    this.setData({
      name: e.detail.value
    });
  },

  /**
   * 鏉堟挸鍙嗛幍瀣簚閸?   */
  onPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  /**
   * 闁瀚ㄩ崷鏉垮隘
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
   * 鏉堟挸鍙嗙拠锔剧矎閸︽澘娼?   */
  onDetailInput: function(e) {
    this.setData({
      detail: e.detail.value
    });
  },

  /**
   * 閸掑洦宕查弰顖氭儊姒涙顓婚崷鏉挎絻
   */
  onDefaultChange: function(e) {
    this.setData({
      isDefault: e.detail.value
    });
  },

  /**
   * 鐞涖劌宕熸宀冪槈
   */
  validateForm() {
    const { name, phone, province, city, district, detail } = this.data;
    
    if (!name.trim()) {
      showToast('鐠囩柉绶崗銉︽暪鐠愌傛眽婵挸鎮?, 'none');
      return false;
    }
    
    // 缁犫偓閸楁洜娈戦幍瀣簚閸欑兘鐛欑拠渚婄礄11娴ｅ秵鏆熺€涙绱?    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phone.trim() || !phoneRegex.test(phone)) {
      showToast('鐠囩柉绶崗銉︻劀绾喚娈戦幍瀣簚閸欓鐖?, 'none');
      return false;
    }
    
    if (!province || !city || !district) {
      showToast('鐠囩兘鈧瀚ㄩ幍鈧崷銊ユ勾閸?, 'none');
      return false;
    }
    
    if (!detail.trim()) {
      showToast('鐠囩柉绶崗銉嚊缂佸棗婀撮崸鈧?, 'none');
      return false;
    }
    
    return true;
  },

  /**
   * 閹绘劒姘︾悰銊ュ礋
   */
  async onSubmit() {
    // 鐞涖劌宕熸宀冪槈
    if (!this.validateForm()) {
      return;
    }
    
    try {
      const { mode, id, name, phone, province, city, district, detail, isDefault } = this.data;
      
      this.setData({ submitting: true });
      
      // 閺嬪嫬缂撶拠閿嬬湴閸欏倹鏆?      const data = {
        name: name.trim(),
        phone: phone.trim(),
        province: province,
        city: city,
        district: district,
        detail: detail.trim(),
        isDefault: isDefault
      };
      
      // 閺嶈宓佸Ο鈥崇础闁瀚ㄧ拫鍐暏閻ㄥ嫭婀囬崝鈩冩煙濞?      if (mode === 'edit') {
        // 鐠佹澘缍嶉崷鏉挎絻娣囶喗鏁兼禍瀣╂
        app.analyticsService.track('address_updated', {
          address_id: id
        });
        
        await app.services.address.updateAddress(id, data);
        showToast('娣囶喗鏁奸幋鎰', 'success');
      } else {
        // 鐠佹澘缍嶉崷鏉挎絻濞ｈ濮炴禍瀣╂
        app.analyticsService.track('address_added', {
          province: province,
          is_default: isDefault
        });
        
        await app.services.address.createAddress(data);
        showToast('濞ｈ濮為幋鎰', 'success');
      }
      
      // 瀵ゆ儼绻滄潻鏂挎礀閸︽澘娼冮崚妤勩€冩い?      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      const { mode } = this.data;
      showToast(err.message || (mode === 'add' ? '濞ｈ濮炴径杈Е閿涘矁顕柌宥堢槸' : '娣囶喗鏁兼径杈Е閿涘矁顕柌宥堢槸'), 'none');
    } finally {
      this.setData({ submitting: false });
    }
  }
});\n
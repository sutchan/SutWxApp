// 地址编辑页面逻辑
const app = getApp();
const { showToast } = app.global;

Page({
  data: {
    mode: 'add', // 模式：add 添加，edit 编辑
    id: '', // 地址ID（编辑模式下使用）
    name: '', // 收货人姓名
    phone: '', // 手机号码
    province: '', // 省份
    city: '', // 城市
    district: '', // 区/县
    detail: '', // 详细地址
    isDefault: false, // 是否默认地址
    loading: false, // 加载状态
    submitting: false // 提交状态
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 记录页面访问事件
    app.analyticsService.track('page_view', {
      page: 'address_edit',
      mode: options.mode || 'add'
    });
    
    // 获取模式和ID参数
    const mode = options.mode || 'add';
    const id = options.id || '';
    
    this.setData({
      mode: mode,
      id: id
    });
    
    // 如果是编辑模式，加载地址详情
    if (mode === 'edit' && id) {
      this.loadAddressDetail(id);
    }
  },

  /**
   * 加载地址详情
   */
  async loadAddressDetail(id) {
    try {
      this.setData({ loading: true });
      
      // 使用addressService获取地址详情
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
      showToast(err.message || '加载失败，请重试', 'none');
      // 返回到地址列表页
      wx.navigateBack();
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 输入姓名
   */
  onNameInput: function(e) {
    this.setData({
      name: e.detail.value
    });
  },

  /**
   * 输入手机号
   */
  onPhoneInput: function(e) {
    this.setData({
      phone: e.detail.value
    });
  },

  /**
   * 选择地区
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
   * 输入详细地址
   */
  onDetailInput: function(e) {
    this.setData({
      detail: e.detail.value
    });
  },

  /**
   * 切换是否默认地址
   */
  onDefaultChange: function(e) {
    this.setData({
      isDefault: e.detail.value
    });
  },

  /**
   * 表单验证
   */
  validateForm() {
    const { name, phone, province, city, district, detail } = this.data;
    
    if (!name.trim()) {
      showToast('请输入收货人姓名', 'none');
      return false;
    }
    
    // 简单的手机号验证（11位数字）
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phone.trim() || !phoneRegex.test(phone)) {
      showToast('请输入正确的手机号码', 'none');
      return false;
    }
    
    if (!province || !city || !district) {
      showToast('请选择所在地区', 'none');
      return false;
    }
    
    if (!detail.trim()) {
      showToast('请输入详细地址', 'none');
      return false;
    }
    
    return true;
  },

  /**
   * 提交表单
   */
  async onSubmit() {
    // 表单验证
    if (!this.validateForm()) {
      return;
    }
    
    try {
      const { mode, id, name, phone, province, city, district, detail, isDefault } = this.data;
      
      this.setData({ submitting: true });
      
      // 构建请求参数
      const data = {
        name: name.trim(),
        phone: phone.trim(),
        province: province,
        city: city,
        district: district,
        detail: detail.trim(),
        isDefault: isDefault
      };
      
      // 根据模式选择调用的服务方法
      if (mode === 'edit') {
        // 记录地址修改事件
        app.analyticsService.track('address_updated', {
          address_id: id
        });
        
        await app.services.address.updateAddress(id, data);
        showToast('修改成功', 'success');
      } else {
        // 记录地址添加事件
        app.analyticsService.track('address_added', {
          province: province,
          is_default: isDefault
        });
        
        await app.services.address.createAddress(data);
        showToast('添加成功', 'success');
      }
      
      // 延迟返回地址列表页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (err) {
      const { mode } = this.data;
      showToast(err.message || (mode === 'add' ? '添加失败，请重试' : '修改失败，请重试'), 'none');
    } finally {
      this.setData({ submitting: false });
    }
  }
});
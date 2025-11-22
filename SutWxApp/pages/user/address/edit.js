/**
 * 文件名: edit.js
 * 用户地址编辑页面
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
      { name: 'name', rules: { required: true, message: '请输入收货人姓名' } },
      { name: 'phone', rules: [{ required: true, message: '请输入手机号码' }, { mobile: true, message: '手机号码格式不正确' }] },
      { name: 'province', rules: { required: true, message: '请选择省份' } },
      { name: 'city', rules: { required: true, message: '请选择城市' } },
      { name: 'detail', rules: { required: true, message: '请输入详细地址' } }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   * @param {Object} options - 页面参数
   * @param {string} options.id - 地址ID
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ addressId: options.id });
      this.loadAddressDetail(options.id);
    }
  },

  /**
   * 加载地址详情
   * @param {string} id - 地址ID
   * @returns {void}
   */
  loadAddressDetail(id) {
    // 模拟数据请求
    setTimeout(() => {
      const mockAddress = {
        id: id,
        name: '张三',
        phone: '13800138000',
        province: '广东省',
        city: '广州市',
        district: '天河区',
        detail: 'XXX街道XXX号',
        isDefault: true
      };
      this.setData({ 'formData': mockAddress });
    }, 500);
  },

  /**
   * 表单输入改变
   * @param {Object} e - 事件对象
   * @returns {void}
   */
  formInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`formData.${field}`]: e.detail.value
    });
  },

  /**
   * 提交表单
   * @returns {void}
   */
  submitForm() {
    this.selectComponent('#form').validate((valid, errors) => {
      if (valid) {
        wx.showToast({
          title: '提交成功',
          icon: 'success'
        });
        console.log('提交数据:', this.data.formData);
        // 实际提交逻辑
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
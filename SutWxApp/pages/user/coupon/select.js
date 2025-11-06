// 优惠券选择页面逻辑
const app = getApp();
import { showToast } from '../../../../utils/global';

Page({
  data: {
    coupons: [], // 可用优惠券列表
    params: null, // 从订单确认页传入的参数
    currentCouponId: '', // 当前已选择的优惠券ID
    loading: true, // 加载状态
    noCoupons: false, // 是否无可用优惠券
    selectedCoupon: null // 选中的优惠券
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 解析参数
    if (options.params) {
      try {
        const params = JSON.parse(decodeURIComponent(options.params));
        this.setData({
          params: params,
          currentCouponId: params.current_coupon_id || ''
        });
        
        // 加载可用优惠券
        this.loadAvailableCoupons();
      } catch (e) {
        console.error('解析参数失败', e);
        showToast('参数错误', 'none');
        wx.navigateBack();
      }
    }
  },

  /**
   * 加载可用优惠券
   */
  async loadAvailableCoupons() {
    try {
      this.setData({ loading: true });
      
      // 检查是否有优惠券服务
      if (!app.services || !app.services.coupon) {
        throw new Error('优惠券服务未初始化');
      }
      
      // 调用优惠券服务获取可用优惠券
      const coupons = await app.services.coupon.getAvailableCoupons(this.data.params);
      
      // 模拟数据（当API不可用时使用）
      // const coupons = this.getMockCoupons();
      
      this.setData({
        coupons: coupons,
        loading: false,
        noCoupons: coupons.length === 0
      });
    } catch (err) {
      console.error('加载优惠券失败', err);
      this.setData({
        loading: false,
        noCoupons: true
      });
      showToast('获取优惠券失败', 'none');
    }
  },

  /**
   * 选择优惠券
   */
  onSelectCoupon(e) {
    const couponId = e.currentTarget.dataset.id;
    
    // 查找对应的优惠券
    const selectedCoupon = this.data.coupons.find(coupon => coupon.id === couponId);
    
    if (selectedCoupon) {
      this.setData({ selectedCoupon: selectedCoupon });
      
      // 返回上一页并传递选中的优惠券
      this.selectCouponAndReturn(selectedCoupon);
    }
  },

  /**
   * 不使用优惠券
   */
  onNoUseCoupon() {
    this.setData({ selectedCoupon: null });
    
    // 获取事件通道并发送清空优惠券信号
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.emit('selectCoupon', {
        clearCoupon: true
      });
    }
    
    // 返回上一页
    wx.navigateBack();
  },

  /**
   * 选择优惠券并返回结果
   */
  selectCouponAndReturn(coupon) {
    // 获取事件通道并发送选择结果
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.emit('selectCoupon', {
        coupon: coupon
      });
    }
    
    // 返回上一页
    wx.navigateBack();
  },

  /**
   * 查看优惠券详情
   */
  onViewCouponDetail(e) {
    const couponId = e.currentTarget.dataset.id;
    
    // 这里可以跳转到优惠券详情页面
    // wx.navigateTo({
    //   url: `/pages/user/coupon/detail?id=${couponId}`
    // });
    
    // 暂时显示提示
    showToast('优惠券详情功能开发中', 'none');
  },

  /**
   * 格式化优惠券信息
   */
  formatCoupon(coupon) {
    if (!coupon) return {};
    
    // 格式化优惠券类型文本
    let typeText = '';
    let valueText = '';
    
    if (app.services && app.services.coupon) {
      typeText = app.services.coupon.getCouponTypeText(coupon.type);
    } else {
      // 备用逻辑
      const typeMap = {
        'cash': '现金券',
        'percent': '折扣券',
        'shipping': '运费券'
      };
      typeText = typeMap[coupon.type] || '优惠券';
    }
    
    // 格式化优惠券金额/折扣
    if (coupon.type === 'cash') {
      valueText = `¥${coupon.value}`;
    } else if (coupon.type === 'percent') {
      valueText = `${coupon.value}折`;
    }
    
    // 格式化有效期
    let expireText = '';
    if (coupon.end_time) {
      if (app.services && app.services.coupon) {
        expireText = app.services.coupon.formatExpireTime(coupon.end_time);
      } else {
        // 备用格式化逻辑
        const date = new Date(coupon.end_time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        expireText = `${year}.${month}.${day}`;
      }
    }
    
    // 格式化使用条件
    const conditionText = coupon.min_amount > 0 ? `满${coupon.min_amount}元可用` : '无门槛';
    
    return {
      ...coupon,
      typeText,
      valueText,
      expireText,
      conditionText
    };
  },

  /**
   * 模拟优惠券数据（测试用）
   */
  getMockCoupons() {
    return [
      {
        id: '1',
        name: '新人专享券',
        type: 'cash',
        value: 10,
        min_amount: 50,
        start_time: '2024-01-01T00:00:00Z',
        end_time: '2024-12-31T23:59:59Z',
        status: 'available',
        description: '新用户专享，订单满50元可用'
      },
      {
        id: '2',
        name: '全场通用折扣券',
        type: 'percent',
        value: 90,
        min_amount: 0,
        max_discount: 50,
        start_time: '2024-01-01T00:00:00Z',
        end_time: '2024-12-31T23:59:59Z',
        status: 'available',
        description: '全场通用，最高优惠50元'
      }
    ];
  }
});
// 优惠券列表页面逻辑
const app = getApp();
import { showToast, showLoading, hideLoading } from '../../../../utils/global';

Page({
  data: {
    tabs: [
      { key: 'available', name: '可用' },
      { key: 'used', name: '已使用' },
      { key: 'expired', name: '已过期' }
    ],
    activeTab: 'available', // 当前选中的标签
    coupons: [], // 优惠券列表
    loading: true, // 加载状态
    noCoupons: false, // 是否无优惠券
    page: 1, // 当前页码
    hasMore: true // 是否有更多数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 加载优惠券数据
    this.loadCoupons();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 如果是从其他页面返回，刷新当前标签的数据
    this.setData({ page: 1, hasMore: true });
    this.loadCoupons(true);
  },

  /**
   * 切换标签
   */
  onTabChange(e) {
    const tabKey = e.currentTarget.dataset.key;
    this.setData({
      activeTab: tabKey,
      page: 1,
      hasMore: true
    });
    this.loadCoupons(true);
  },

  /**
   * 加载优惠券数据
   * @param {boolean} reset 是否重置数据（用于切换标签或刷新）
   */
  async loadCoupons(reset = false) {
    try {
      if (reset) {
        this.setData({ loading: true });
      } else {
        showLoading();
      }

      // 检查是否有优惠券服务
      if (!app.services || !app.services.coupon) {
        throw new Error('优惠券服务未初始化');
      }

      // 如果没有更多数据，直接返回
      if (!this.data.hasMore && !reset) {
        hideLoading();
        return;
      }

      // 调用优惠券服务获取优惠券列表
      const coupons = await app.services.coupon.getUserCoupons(this.data.activeTab);
      
      // 模拟数据（当API不可用时使用）
      // const coupons = this.getMockCoupons(this.data.activeTab);

      let newCoupons = coupons;
      if (!reset && coupons.length > 0) {
        newCoupons = [...this.data.coupons, ...coupons];
      }

      this.setData({
        coupons: newCoupons,
        loading: false,
        noCoupons: newCoupons.length === 0,
        hasMore: coupons.length >= 10, // 假设每页10条
        page: reset ? 1 : this.data.page + 1
      });
    } catch (err) {
      console.error('加载优惠券失败', err);
      this.setData({
        loading: false,
        noCoupons: reset ? true : this.data.noCoupons
      });
      showToast('获取优惠券失败', 'none');
    } finally {
      hideLoading();
    }
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadCoupons(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 上拉加载更多
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadCoupons();
    }
  },

  /**
   * 查看优惠券详情
   */
  onViewCouponDetail(e) {
    const couponId = e.currentTarget.dataset.id;
    
    // 这里可以跳转到优惠券详情页面
    wx.navigateTo({
      url: `/pages/user/coupon/detail?id=${couponId}`
    });
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
  getMockCoupons(status) {
    const baseCoupons = [
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

    if (status === 'used') {
      return [
        {
          id: '3',
          name: '满减券',
          type: 'cash',
          value: 20,
          min_amount: 100,
          start_time: '2024-01-01T00:00:00Z',
          end_time: '2024-12-31T23:59:59Z',
          status: 'used',
          used_time: '2024-06-15T10:30:00Z',
          order_id: '10086',
          description: '订单满100元可用'
        }
      ];
    } else if (status === 'expired') {
      return [
        {
          id: '4',
          name: '限时特惠券',
          type: 'cash',
          value: 15,
          min_amount: 0,
          start_time: '2024-01-01T00:00:00Z',
          end_time: '2024-05-31T23:59:59Z',
          status: 'expired',
          description: '限时特惠，无门槛使用'
        }
      ];
    }

    return baseCoupons;
  }
});

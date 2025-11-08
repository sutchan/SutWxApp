// 浼樻儬鍒稿垪琛ㄩ〉闈㈤€昏緫
const app = getApp();
import { showToast, showLoading, hideLoading } from '../../../../utils/global';

Page({
  data: {
    tabs: [
      { key: 'available', name: '鍙敤' },
      { key: 'used', name: '宸蹭娇鐢? },
      { key: 'expired', name: '宸茶繃鏈? }
    ],
    activeTab: 'available', // 褰撳墠閫変腑鐨勬爣绛?    coupons: [], // 浼樻儬鍒稿垪琛?    loading: true, // 鍔犺浇鐘舵€?    noCoupons: false, // 鏄惁鏃犱紭鎯犲埜
    page: 1, // 褰撳墠椤电爜
    hasMore: true // 鏄惁鏈夋洿澶氭暟鎹?  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 鍔犺浇浼樻儬鍒告暟鎹?    this.loadCoupons();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 濡傛灉鏄粠鍏朵粬椤甸潰杩斿洖锛屽埛鏂板綋鍓嶆爣绛剧殑鏁版嵁
    this.setData({ page: 1, hasMore: true });
    this.loadCoupons(true);
  },

  /**
   * 鍒囨崲鏍囩
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
   * 鍔犺浇浼樻儬鍒告暟鎹?   * @param {boolean} reset 鏄惁閲嶇疆鏁版嵁锛堢敤浜庡垏鎹㈡爣绛炬垨鍒锋柊锛?   */
  async loadCoupons(reset = false) {
    try {
      if (reset) {
        this.setData({ loading: true });
      } else {
        showLoading();
      }

      // 妫€鏌ユ槸鍚︽湁浼樻儬鍒告湇鍔?      if (!app.services || !app.services.coupon) {
        throw new Error('浼樻儬鍒告湇鍔℃湭鍒濆鍖?);
      }

      // 濡傛灉娌℃湁鏇村鏁版嵁锛岀洿鎺ヨ繑鍥?      if (!this.data.hasMore && !reset) {
        hideLoading();
        return;
      }

      // 璋冪敤浼樻儬鍒告湇鍔¤幏鍙栦紭鎯犲埜鍒楄〃
      const coupons = await app.services.coupon.getUserCoupons(this.data.activeTab);
      
      // 妯℃嫙鏁版嵁锛堝綋API涓嶅彲鐢ㄦ椂浣跨敤锛?      // const coupons = this.getMockCoupons(this.data.activeTab);

      let newCoupons = coupons;
      if (!reset && coupons.length > 0) {
        newCoupons = [...this.data.coupons, ...coupons];
      }

      this.setData({
        coupons: newCoupons,
        loading: false,
        noCoupons: newCoupons.length === 0,
        hasMore: coupons.length >= 10, // 鍋囪姣忛〉10鏉?        page: reset ? 1 : this.data.page + 1
      });
    } catch (err) {
      console.error('鍔犺浇浼樻儬鍒稿け璐?, err);
      this.setData({
        loading: false,
        noCoupons: reset ? true : this.data.noCoupons
      });
      showToast('鑾峰彇浼樻儬鍒稿け璐?, 'none');
    } finally {
      hideLoading();
    }
  },

  /**
   * 涓嬫媺鍒锋柊
   */
  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadCoupons(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 涓婃媺鍔犺浇鏇村
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadCoupons();
    }
  },

  /**
   * 鏌ョ湅浼樻儬鍒歌鎯?   */
  onViewCouponDetail(e) {
    const couponId = e.currentTarget.dataset.id;
    
    // 杩欓噷鍙互璺宠浆鍒颁紭鎯犲埜璇︽儏椤甸潰
    wx.navigateTo({
      url: `/pages/user/coupon/detail?id=${couponId}`
    });
  },

  /**
   * 鏍煎紡鍖栦紭鎯犲埜淇℃伅
   */
  formatCoupon(coupon) {
    if (!coupon) return {};

    // 鏍煎紡鍖栦紭鎯犲埜绫诲瀷鏂囨湰
    let typeText = '';
    let valueText = '';

    if (app.services && app.services.coupon) {
      typeText = app.services.coupon.getCouponTypeText(coupon.type);
    } else {
      // 澶囩敤閫昏緫
      const typeMap = {
        'cash': '鐜伴噾鍒?,
        'percent': '鎶樻墸鍒?,
        'shipping': '杩愯垂鍒?
      };
      typeText = typeMap[coupon.type] || '浼樻儬鍒?;
    }

    // 鏍煎紡鍖栦紭鎯犲埜閲戦/鎶樻墸
    if (coupon.type === 'cash') {
      valueText = `楼${coupon.value}`;
    } else if (coupon.type === 'percent') {
      valueText = `${coupon.value}鎶榒;
    }

    // 鏍煎紡鍖栨湁鏁堟湡
    let expireText = '';
    if (coupon.end_time) {
      if (app.services && app.services.coupon) {
        expireText = app.services.coupon.formatExpireTime(coupon.end_time);
      } else {
        // 澶囩敤鏍煎紡鍖栭€昏緫
        const date = new Date(coupon.end_time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        expireText = `${year}.${month}.${day}`;
      }
    }

    // 鏍煎紡鍖栦娇鐢ㄦ潯浠?    const conditionText = coupon.min_amount > 0 ? `婊?{coupon.min_amount}鍏冨彲鐢╜ : '鏃犻棬妲?;

    return {
      ...coupon,
      typeText,
      valueText,
      expireText,
      conditionText
    };
  },

  /**
   * 妯℃嫙浼樻儬鍒告暟鎹紙娴嬭瘯鐢級
   */
  getMockCoupons(status) {
    const baseCoupons = [
      {
        id: '1',
        name: '鏂颁汉涓撲韩鍒?,
        type: 'cash',
        value: 10,
        min_amount: 50,
        start_time: '2024-01-01T00:00:00Z',
        end_time: '2024-12-31T23:59:59Z',
        status: 'available',
        description: '鏂扮敤鎴蜂笓浜紝璁㈠崟婊?0鍏冨彲鐢?
      },
      {
        id: '2',
        name: '鍏ㄥ満閫氱敤鎶樻墸鍒?,
        type: 'percent',
        value: 90,
        min_amount: 0,
        max_discount: 50,
        start_time: '2024-01-01T00:00:00Z',
        end_time: '2024-12-31T23:59:59Z',
        status: 'available',
        description: '鍏ㄥ満閫氱敤锛屾渶楂樹紭鎯?0鍏?
      }
    ];

    if (status === 'used') {
      return [
        {
          id: '3',
          name: '婊″噺鍒?,
          type: 'cash',
          value: 20,
          min_amount: 100,
          start_time: '2024-01-01T00:00:00Z',
          end_time: '2024-12-31T23:59:59Z',
          status: 'used',
          used_time: '2024-06-15T10:30:00Z',
          order_id: '10086',
          description: '璁㈠崟婊?00鍏冨彲鐢?
        }
      ];
    } else if (status === 'expired') {
      return [
        {
          id: '4',
          name: '闄愭椂鐗规儬鍒?,
          type: 'cash',
          value: 15,
          min_amount: 0,
          start_time: '2024-01-01T00:00:00Z',
          end_time: '2024-05-31T23:59:59Z',
          status: 'expired',
          description: '闄愭椂鐗规儬锛屾棤闂ㄦ浣跨敤'
        }
      ];
    }

    return baseCoupons;
  }
});
\n
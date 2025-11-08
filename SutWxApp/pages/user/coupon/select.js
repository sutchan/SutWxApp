// 浼樻儬鍒搁€夋嫨椤甸潰閫昏緫
const app = getApp();
import { showToast } from '../../../../utils/global';

Page({
  data: {
    coupons: [], // 鍙敤浼樻儬鍒稿垪琛?    params: null, // 浠庤鍗曠‘璁ら〉浼犲叆鐨勫弬鏁?    currentCouponId: '', // 褰撳墠宸查€夋嫨鐨勪紭鎯犲埜ID
    loading: true, // 鍔犺浇鐘舵€?    noCoupons: false, // 鏄惁鏃犲彲鐢ㄤ紭鎯犲埜
    selectedCoupon: null // 閫変腑鐨勪紭鎯犲埜
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 瑙ｆ瀽鍙傛暟
    if (options.params) {
      try {
        const params = JSON.parse(decodeURIComponent(options.params));
        this.setData({
          params: params,
          currentCouponId: params.current_coupon_id || ''
        });
        
        // 鍔犺浇鍙敤浼樻儬鍒?        this.loadAvailableCoupons();
      } catch (e) {
        console.error('瑙ｆ瀽鍙傛暟澶辫触', e);
        showToast('鍙傛暟閿欒', 'none');
        wx.navigateBack();
      }
    }
  },

  /**
   * 鍔犺浇鍙敤浼樻儬鍒?   */
  async loadAvailableCoupons() {
    try {
      this.setData({ loading: true });
      
      // 妫€鏌ユ槸鍚︽湁浼樻儬鍒告湇鍔?      if (!app.services || !app.services.coupon) {
        throw new Error('浼樻儬鍒告湇鍔℃湭鍒濆鍖?);
      }
      
      // 璋冪敤浼樻儬鍒告湇鍔¤幏鍙栧彲鐢ㄤ紭鎯犲埜
      const coupons = await app.services.coupon.getAvailableCoupons(this.data.params);
      
      // 妯℃嫙鏁版嵁锛堝綋API涓嶅彲鐢ㄦ椂浣跨敤锛?      // const coupons = this.getMockCoupons();
      
      this.setData({
        coupons: coupons,
        loading: false,
        noCoupons: coupons.length === 0
      });
    } catch (err) {
      console.error('鍔犺浇浼樻儬鍒稿け璐?, err);
      this.setData({
        loading: false,
        noCoupons: true
      });
      showToast('鑾峰彇浼樻儬鍒稿け璐?, 'none');
    }
  },

  /**
   * 閫夋嫨浼樻儬鍒?   */
  onSelectCoupon(e) {
    const couponId = e.currentTarget.dataset.id;
    
    // 鏌ユ壘瀵瑰簲鐨勪紭鎯犲埜
    const selectedCoupon = this.data.coupons.find(coupon => coupon.id === couponId);
    
    if (selectedCoupon) {
      this.setData({ selectedCoupon: selectedCoupon });
      
      // 杩斿洖涓婁竴椤靛苟浼犻€掗€変腑鐨勪紭鎯犲埜
      this.selectCouponAndReturn(selectedCoupon);
    }
  },

  /**
   * 涓嶄娇鐢ㄤ紭鎯犲埜
   */
  onNoUseCoupon() {
    this.setData({ selectedCoupon: null });
    
    // 鑾峰彇浜嬩欢閫氶亾骞跺彂閫佹竻绌轰紭鎯犲埜淇″彿
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.emit('selectCoupon', {
        clearCoupon: true
      });
    }
    
    // 杩斿洖涓婁竴椤?    wx.navigateBack();
  },

  /**
   * 閫夋嫨浼樻儬鍒稿苟杩斿洖缁撴灉
   */
  selectCouponAndReturn(coupon) {
    // 鑾峰彇浜嬩欢閫氶亾骞跺彂閫侀€夋嫨缁撴灉
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.emit('selectCoupon', {
        coupon: coupon
      });
    }
    
    // 杩斿洖涓婁竴椤?    wx.navigateBack();
  },

  /**
   * 鏌ョ湅浼樻儬鍒歌鎯?   */
  onViewCouponDetail(e) {
    const couponId = e.currentTarget.dataset.id;
    
    // 杩欓噷鍙互璺宠浆鍒颁紭鎯犲埜璇︽儏椤甸潰
    // wx.navigateTo({
    //   url: `/pages/user/coupon/detail?id=${couponId}`
    // });
    
    // 鏆傛椂鏄剧ず鎻愮ず
    showToast('浼樻儬鍒歌鎯呭姛鑳藉紑鍙戜腑', 'none');
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
  getMockCoupons() {
    return [
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
  }
});\n
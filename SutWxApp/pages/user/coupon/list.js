锘?/ 娴兼ɑ鍎崚绋垮灙鐞涖劑銆夐棃銏も偓鏄忕帆
const app = getApp();
import { showToast, showLoading, hideLoading } from '../../../../utils/global';

Page({
  data: {
    tabs: [
      { key: 'available', name: '閸欘垳鏁? },
      { key: 'used', name: '瀹歌弓濞囬悽? },
      { key: 'expired', name: '瀹歌尪绻冮張? }
    ],
    activeTab: 'available', // 瑜版挸澧犻柅澶夎厬閻ㄥ嫭鐖ｇ粵?    coupons: [], // 娴兼ɑ鍎崚绋垮灙鐞?    loading: true, // 閸旂姾娴囬悩鑸碘偓?    noCoupons: false, // 閺勵垰鎯侀弮鐘辩喘閹姴鍩?    page: 1, // 瑜版挸澧犳い鐢电垳
    hasMore: true // 閺勵垰鎯侀張澶嬫纯婢舵碍鏆熼幑?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 閸旂姾娴囨导妯诲劕閸掑憡鏆熼幑?    this.loadCoupons();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 婵″倹鐏夐弰顖欑矤閸忔湹绮い鐢告桨鏉╂柨娲栭敍灞藉煕閺傛澘缍嬮崜宥嗙垼缁涘墽娈戦弫鐗堝祦
    this.setData({ page: 1, hasMore: true });
    this.loadCoupons(true);
  },

  /**
   * 閸掑洦宕查弽鍥╊劮
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
   * 閸旂姾娴囨导妯诲劕閸掑憡鏆熼幑?   * @param {boolean} reset 閺勵垰鎯侀柌宥囩枂閺佺増宓侀敍鍫㈡暏娴滃骸鍨忛幑銏＄垼缁涚偓鍨ㄩ崚閿嬫煀閿?   */
  async loadCoupons(reset = false) {
    try {
      if (reset) {
        this.setData({ loading: true });
      } else {
        showLoading();
      }

      // 濡偓閺屻儲妲搁崥锔芥箒娴兼ɑ鍎崚鍛婃箛閸?      if (!app.services || !app.services.coupon) {
        throw new Error('娴兼ɑ鍎崚鍛婃箛閸斺剝婀崚婵嗩潗閸?);
      }

      // 婵″倹鐏夊▽鈩冩箒閺囨潙顦块弫鐗堝祦閿涘瞼娲块幒銉ㄧ箲閸?      if (!this.data.hasMore && !reset) {
        hideLoading();
        return;
      }

      // 鐠嬪啰鏁ゆ导妯诲劕閸掑憡婀囬崝陇骞忛崣鏍︾喘閹姴鍩滈崚妤勩€?      const coupons = await app.services.coupon.getUserCoupons(this.data.activeTab);
      
      // 濡剝瀚欓弫鐗堝祦閿涘牆缍婣PI娑撳秴褰查悽銊︽娴ｈ法鏁ら敍?      // const coupons = this.getMockCoupons(this.data.activeTab);

      let newCoupons = coupons;
      if (!reset && coupons.length > 0) {
        newCoupons = [...this.data.coupons, ...coupons];
      }

      this.setData({
        coupons: newCoupons,
        loading: false,
        noCoupons: newCoupons.length === 0,
        hasMore: coupons.length >= 10, // 閸嬪洩顔曞В蹇涖€?0閺?        page: reset ? 1 : this.data.page + 1
      });
    } catch (err) {
      console.error('閸旂姾娴囨导妯诲劕閸掔銇戠拹?, err);
      this.setData({
        loading: false,
        noCoupons: reset ? true : this.data.noCoupons
      });
      showToast('閼惧嘲褰囨导妯诲劕閸掔銇戠拹?, 'none');
    } finally {
      hideLoading();
    }
  },

  /**
   * 娑撳濯洪崚閿嬫煀
   */
  onPullDownRefresh() {
    this.setData({ page: 1, hasMore: true });
    this.loadCoupons(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 娑撳﹥濯洪崝鐘烘祰閺囨潙顦?   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadCoupons();
    }
  },

  /**
   * 閺屻儳婀呮导妯诲劕閸掓瓕顕涢幆?   */
  onViewCouponDetail(e) {
    const couponId = e.currentTarget.dataset.id;
    
    // 鏉╂瑩鍣烽崣顖欎簰鐠哄疇娴嗛崚棰佺喘閹姴鍩滅拠锔藉剰妞ょ敻娼?    wx.navigateTo({
      url: `/pages/user/coupon/detail?id=${couponId}`
    });
  },

  /**
   * 閺嶇厧绱￠崠鏍︾喘閹姴鍩滄穱鈩冧紖
   */
  formatCoupon(coupon) {
    if (!coupon) return {};

    // 閺嶇厧绱￠崠鏍︾喘閹姴鍩滅猾璇茬€烽弬鍥ㄦ拱
    let typeText = '';
    let valueText = '';

    if (app.services && app.services.coupon) {
      typeText = app.services.coupon.getCouponTypeText(coupon.type);
    } else {
      // 婢跺洨鏁ら柅鏄忕帆
      const typeMap = {
        'cash': '閻滀即鍣鹃崚?,
        'percent': '閹舵ɑ澧搁崚?,
        'shipping': '鏉╂劘鍨傞崚?
      };
      typeText = typeMap[coupon.type] || '娴兼ɑ鍎崚?;
    }

    // 閺嶇厧绱￠崠鏍︾喘閹姴鍩滈柌鎴︻杺/閹舵ɑ澧?    if (coupon.type === 'cash') {
      valueText = `妤?{coupon.value}`;
    } else if (coupon.type === 'percent') {
      valueText = `${coupon.value}閹舵;
    }

    // 閺嶇厧绱￠崠鏍ㄦ箒閺佸牊婀?    let expireText = '';
    if (coupon.end_time) {
      if (app.services && app.services.coupon) {
        expireText = app.services.coupon.formatExpireTime(coupon.end_time);
      } else {
        // 婢跺洨鏁ら弽鐓庣础閸栨牠鈧槒绶?        const date = new Date(coupon.end_time);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        expireText = `${year}.${month}.${day}`;
      }
    }

    // 閺嶇厧绱￠崠鏍﹀▏閻劍娼禒?    const conditionText = coupon.min_amount > 0 ? `濠?{coupon.min_amount}閸忓啫褰查悽鈺?: '閺冪娀妫Σ?;

    return {
      ...coupon,
      typeText,
      valueText,
      expireText,
      conditionText
    };
  },

  /**
   * 濡剝瀚欐导妯诲劕閸掑憡鏆熼幑顕嗙礄濞村鐦悽顭掔礆
   */
  getMockCoupons(status) {
    const baseCoupons = [
      {
        id: '1',
        name: '閺傞姹夋稉鎾查煩閸?,
        type: 'cash',
        value: 10,
        min_amount: 50,
        start_time: '2024-01-01T00:00:00Z',
        end_time: '2024-12-31T23:59:59Z',
        status: 'available',
        description: '閺傛壆鏁ら幋铚傜瑩娴滎偓绱濈拋銏犲礋濠?0閸忓啫褰查悽?
      },
      {
        id: '2',
        name: '閸忋劌婧€闁氨鏁ら幎妯诲⒏閸?,
        type: 'percent',
        value: 90,
        min_amount: 0,
        max_discount: 50,
        start_time: '2024-01-01T00:00:00Z',
        end_time: '2024-12-31T23:59:59Z',
        status: 'available',
        description: '閸忋劌婧€闁氨鏁ら敍灞炬付妤傛ü绱幆?0閸?
      }
    ];

    if (status === 'used') {
      return [
        {
          id: '3',
          name: '濠娾€冲櫤閸?,
          type: 'cash',
          value: 20,
          min_amount: 100,
          start_time: '2024-01-01T00:00:00Z',
          end_time: '2024-12-31T23:59:59Z',
          status: 'used',
          used_time: '2024-06-15T10:30:00Z',
          order_id: '10086',
          description: '鐠併垹宕熷?00閸忓啫褰查悽?
        }
      ];
    } else if (status === 'expired') {
      return [
        {
          id: '4',
          name: '闂勬劖妞傞悧瑙勫劕閸?,
          type: 'cash',
          value: 15,
          min_amount: 0,
          start_time: '2024-01-01T00:00:00Z',
          end_time: '2024-05-31T23:59:59Z',
          status: 'expired',
          description: '闂勬劖妞傞悧瑙勫劕閿涘本妫ら梻銊︻潬娴ｈ法鏁?
        }
      ];
    }

    return baseCoupons;
  }
});
\n
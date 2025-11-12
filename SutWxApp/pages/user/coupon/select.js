锘?/ 娴兼ɑ鍎崚鎼佲偓澶嬪妞ょ敻娼伴柅鏄忕帆
const app = getApp();
import { showToast } from '../../../../utils/global';

Page({
  data: {
    coupons: [], // 閸欘垳鏁ゆ导妯诲劕閸掔鍨悰?    params: null, // 娴犲氦顓归崡鏇犫€樼拋銈夈€夋导鐘插弳閻ㄥ嫬寮弫?    currentCouponId: '', // 瑜版挸澧犲鏌モ偓澶嬪閻ㄥ嫪绱幆鐘插煖ID
    loading: true, // 閸旂姾娴囬悩鑸碘偓?    noCoupons: false, // 閺勵垰鎯侀弮鐘插讲閻劋绱幆鐘插煖
    selectedCoupon: null // 闁鑵戦惃鍕喘閹姴鍩?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 鐟欙絾鐎介崣鍌涙殶
    if (options.params) {
      try {
        const params = JSON.parse(decodeURIComponent(options.params));
        this.setData({
          params: params,
          currentCouponId: params.current_coupon_id || ''
        });
        
        // 閸旂姾娴囬崣顖滄暏娴兼ɑ鍎崚?        this.loadAvailableCoupons();
      } catch (e) {
        console.error('鐟欙絾鐎介崣鍌涙殶婢惰精瑙?, e);
        showToast('閸欏倹鏆熼柨娆掝嚖', 'none');
        wx.navigateBack();
      }
    }
  },

  /**
   * 閸旂姾娴囬崣顖滄暏娴兼ɑ鍎崚?   */
  async loadAvailableCoupons() {
    try {
      this.setData({ loading: true });
      
      // 濡偓閺屻儲妲搁崥锔芥箒娴兼ɑ鍎崚鍛婃箛閸?      if (!app.services || !app.services.coupon) {
        throw new Error('娴兼ɑ鍎崚鍛婃箛閸斺剝婀崚婵嗩潗閸?);
      }
      
      // 鐠嬪啰鏁ゆ导妯诲劕閸掑憡婀囬崝陇骞忛崣鏍у讲閻劋绱幆鐘插煖
      const coupons = await app.services.coupon.getAvailableCoupons(this.data.params);
      
      // 濡剝瀚欓弫鐗堝祦閿涘牆缍婣PI娑撳秴褰查悽銊︽娴ｈ法鏁ら敍?      // const coupons = this.getMockCoupons();
      
      this.setData({
        coupons: coupons,
        loading: false,
        noCoupons: coupons.length === 0
      });
    } catch (err) {
      console.error('閸旂姾娴囨导妯诲劕閸掔銇戠拹?, err);
      this.setData({
        loading: false,
        noCoupons: true
      });
      showToast('閼惧嘲褰囨导妯诲劕閸掔銇戠拹?, 'none');
    }
  },

  /**
   * 闁瀚ㄦ导妯诲劕閸?   */
  onSelectCoupon(e) {
    const couponId = e.currentTarget.dataset.id;
    
    // 閺屻儲澹樼€电懓绨查惃鍕喘閹姴鍩?    const selectedCoupon = this.data.coupons.find(coupon => coupon.id === couponId);
    
    if (selectedCoupon) {
      this.setData({ selectedCoupon: selectedCoupon });
      
      // 鏉╂柨娲栨稉濠佺妞ら潧鑻熸导鐘烩偓鎺椻偓澶夎厬閻ㄥ嫪绱幆鐘插煖
      this.selectCouponAndReturn(selectedCoupon);
    }
  },

  /**
   * 娑撳秳濞囬悽銊ょ喘閹姴鍩?   */
  onNoUseCoupon() {
    this.setData({ selectedCoupon: null });
    
    // 閼惧嘲褰囨禍瀣╂闁岸浜鹃獮璺哄絺闁焦绔荤粚杞扮喘閹姴鍩滄穱鈥冲娇
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.emit('selectCoupon', {
        clearCoupon: true
      });
    }
    
    // 鏉╂柨娲栨稉濠佺妞?    wx.navigateBack();
  },

  /**
   * 闁瀚ㄦ导妯诲劕閸掔鑻熸潻鏂挎礀缂佹挻鐏?   */
  selectCouponAndReturn(coupon) {
    // 閼惧嘲褰囨禍瀣╂闁岸浜鹃獮璺哄絺闁線鈧瀚ㄧ紒鎾寸亯
    const eventChannel = this.getOpenerEventChannel();
    if (eventChannel) {
      eventChannel.emit('selectCoupon', {
        coupon: coupon
      });
    }
    
    // 鏉╂柨娲栨稉濠佺妞?    wx.navigateBack();
  },

  /**
   * 閺屻儳婀呮导妯诲劕閸掓瓕顕涢幆?   */
  onViewCouponDetail(e) {
    const couponId = e.currentTarget.dataset.id;
    
    // 鏉╂瑩鍣烽崣顖欎簰鐠哄疇娴嗛崚棰佺喘閹姴鍩滅拠锔藉剰妞ょ敻娼?    // wx.navigateTo({
    //   url: `/pages/user/coupon/detail?id=${couponId}`
    // });
    
    // 閺嗗倹妞傞弰鍓с仛閹绘劗銇?    showToast('娴兼ɑ鍎崚姝岊嚊閹懎濮涢懗钘夌磻閸欐垳鑵?, 'none');
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
  getMockCoupons() {
    return [
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
  }
});\n
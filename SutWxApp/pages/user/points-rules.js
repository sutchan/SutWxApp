锘?/ 缁夘垰鍨庣憴鍕灟妞ょ敻娼伴柅鏄忕帆
const app = getApp();
const { showToast } = app.global;

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    earnRules: [], // 閼惧嘲褰囩粔顖氬瀻鐟欏嫬鍨?    useRules: [],  // 娴ｈ法鏁ょ粔顖氬瀻鐟欏嫬鍨?    expireRules: null, // 鏉╁洦婀＄憴鍕灟
    faqs: [],
    isLoading: false,
    error: null
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.analyticsService.track('page_view', {
      page: 'points_rules'
    });
    
    this.loadPointsRules();
  },

  /**
   * 閸旂姾娴囩粔顖氬瀻鐟欏嫬鍨?   */
  async loadPointsRules() {
    try {
      this.setData({ isLoading: true, error: null });

      // 娴ｈ法鏁ointsService閼惧嘲褰囩粔顖氬瀻鐟欏嫬鍨?      const result = await app.services.points.getPointsRules();
      
      this.setData({
        earnRules: result.earnRules || [],
        useRules: result.useRules || [],
        expireRules: result.expireRules || null,
        // 娣囨繄鏆€faq閸旂喕鍏橀敍灞藉祮娴ｇ芳PI濞屸剝婀佹潻鏂挎礀
        faqs: result.faqs || this.getDefaultFaqs(),
        error: null
      });
    } catch (err) {
      let errorMsg = '閼惧嘲褰囩粔顖氬瀻鐟欏嫬鍨径杈Е';
      if (err.message) {
        errorMsg = err.message;
      }
      
      this.setData({ 
        error: errorMsg,
        // 婵″倹鐏夐懢宄板絿婢惰精瑙﹂敍灞煎▏閻劑绮拋銈堫潐閸?        earnRules: this.getDefaultEarnRules(),
        useRules: this.getDefaultUseRules(),
        expireRules: this.getDefaultExpireRules(),
        faqs: this.getDefaultFaqs()
      });
      
      console.error('閼惧嘲褰囩粔顖氬瀻鐟欏嫬鍨径杈Е:', err);
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 閼惧嘲褰囨妯款吇缁夘垰鍨庨懢宄板絿鐟欏嫬鍨?   */
  getDefaultEarnRules: function() {
    return [
      { type: 'signin', description: '濮ｅ繑妫╃粵鎯у煂閼惧嘲绶?缁夘垰鍨庨敍宀冪箾缂侇厾顒烽崚?婢垛晠顤傛径鏍ь殯閸?0缁夘垰鍨?, dailyLimit: 1 },
      { type: 'purchase', description: '鐠愵厾澧块柌鎴︻杺1:1濮ｆ柧绶ラ懢宄扮繁缁夘垰鍨庨敍宀€澹掑▓濠傛櫌閸濅線娅庢径?, dailyLimit: null },
      { type: 'review', description: '鐠囧嫪鐜崯鍡楁惂閼惧嘲绶?0缁夘垰鍨?閺夆槄绱濆В蹇旀）娑撳﹪妾?閺?, dailyLimit: 5 },
      { type: 'share', description: '閹存劕濮涢崚鍡曢煩閸熷棗鎼ч幋鏍ㄦた閸斻劏骞忓?缁夘垰鍨?濞嗏槄绱濆В蹇旀）娑撳﹪妾?0濞?, dailyLimit: 10 },
      { type: 'profile', description: '鐎瑰苯鏉芥稉顏冩眽鐠у嫭鏋￠懢宄扮繁50缁夘垰鍨庨敍鍫滅濞嗏剝鈧嶇礆', dailyLimit: 1 }
    ];
  },
  
  /**
   * 閼惧嘲褰囨妯款吇缁夘垰鍨庢担璺ㄦ暏鐟欏嫬鍨?   */
  getDefaultUseRules: function() {
    return [
      { type: 'order', description: '100缁夘垰鍨庨幎鍨⒏1閸忓喛绱濋崡鏇犵應鐠併垹宕熼張鈧径姘▏閻劏顓归崡鏇㈠櫨妫?0%閻ㄥ嫮袧閸?, minPoints: 100 },
      { type: 'mall', description: '缁夘垰鍨庨崯鍡楃厔閸忔垶宕查崯鍡楁惂閸滃奔绱幆鐘插煖', minPoints: 0 }
    ];
  },
  
  /**
   * 閼惧嘲褰囨妯款吇缁夘垰鍨庢潻鍥ㄦ埂鐟欏嫬鍨?   */
  getDefaultExpireRules: function() {
    return {
      duration: '12娑擃亝婀€',
      description: '缁夘垰鍨庨張澶嬫櫏閺堢喍璐熼懢宄扮繁娑斿妫╃挧?2娑擃亝婀€閿涘矂鈧偓婀￠張顏冨▏閻劎娈戠粔顖氬瀻鐏忓棜鍤滈崝銊︾闂?
    };
  },

  /**
   * 閼惧嘲褰囨妯款吇鐢瓕顫嗛梻顕€顣?   */
  getDefaultFaqs: function() {
    return [
      { question: '缁夘垰鍨庨張澶夌矆娑斿牏鏁ら敍?, answer: '缁夘垰鍨庨崣顖欎簰閻劋绨崗鎴炲床楠炲啿褰撮幓鎰返閻ㄥ嫯娅勯幏鐔稿灗鐎圭偘缍嬫總鏍уС閿涘奔浜掗崣濠傚棘娑撳海澹掔€规碍妞块崝銊ｂ偓? },
      { question: '缁夘垰鍨庢导姘崇箖閺堢喎鎮ч敍?, answer: '閺勵垳娈戦敍宀€袧閸掑棙婀侀弫鍫熸埂娑撹桨绔撮獮杈剧礉鐠囧嘲寮烽弮鏈靛▏閻劊鈧? },
      { question: '婵″倷缍嶉弻銉嚄閹存垹娈戠粔顖氬瀻閺勫海绮忛敍?, answer: '閸?閹存垹娈戠粔顖氬瀻"妞ょ敻娼伴崣顖欎簰閺屻儳婀呴幍鈧張澶屝濋崚鍡楀綁閸斻劏顔囪ぐ鏇樷偓? },
      { question: '缁夘垰鍨庨崗鎴炲床閸氬骸褰叉禒銉┾偓鈧▎鎯ф偋閿?, answer: '缁夘垰鍨庨崗鎴炲床閸氬簼绗夐崣顖炩偓鈧▎鎾呯礉鐠囩柉鐨戦幈搴㈡惙娴ｆ嚎鈧? }
    ];
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  onRetry: function() {
    // 鐠佹澘缍嶉柌宥堢槸閸旂姾娴囨禍瀣╂
    app.analyticsService.track('retry_loading', {
      page: 'points_rules'
    });
    
    this.loadPointsRules();
  },

  /**
   * 鐏炴洖绱?閺€鎯版崳FAQ
   */
  toggleFaq: function(e) {
    const index = e.currentTarget.dataset.index;
    const faqs = this.data.faqs;
    faqs[index].expanded = !faqs[index].expanded;
    
    // 鐠佹澘缍岶AQ閻愮懓鍤禍瀣╂
    app.analyticsService.track('toggle_faq', {
      index,
      expanded: faqs[index].expanded
    });
    
    this.setData({ faqs });
  }
});\n
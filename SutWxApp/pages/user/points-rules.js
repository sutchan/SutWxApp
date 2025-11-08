// 绉垎瑙勫垯椤甸潰閫昏緫
const app = getApp();
const { showToast } = app.global;

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    earnRules: [], // 鑾峰彇绉垎瑙勫垯
    useRules: [],  // 浣跨敤绉垎瑙勫垯
    expireRules: null, // 杩囨湡瑙勫垯
    faqs: [],
    isLoading: false,
    error: null
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'points_rules'
    });
    
    this.loadPointsRules();
  },

  /**
   * 鍔犺浇绉垎瑙勫垯
   */
  async loadPointsRules() {
    try {
      this.setData({ isLoading: true, error: null });

      // 浣跨敤pointsService鑾峰彇绉垎瑙勫垯
      const result = await app.services.points.getPointsRules();
      
      this.setData({
        earnRules: result.earnRules || [],
        useRules: result.useRules || [],
        expireRules: result.expireRules || null,
        // 淇濈暀faq鍔熻兘锛屽嵆浣緼PI娌℃湁杩斿洖
        faqs: result.faqs || this.getDefaultFaqs(),
        error: null
      });
    } catch (err) {
      let errorMsg = '鑾峰彇绉垎瑙勫垯澶辫触';
      if (err.message) {
        errorMsg = err.message;
      }
      
      this.setData({ 
        error: errorMsg,
        // 濡傛灉鑾峰彇澶辫触锛屼娇鐢ㄩ粯璁よ鍒?        earnRules: this.getDefaultEarnRules(),
        useRules: this.getDefaultUseRules(),
        expireRules: this.getDefaultExpireRules(),
        faqs: this.getDefaultFaqs()
      });
      
      console.error('鑾峰彇绉垎瑙勫垯澶辫触:', err);
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 鑾峰彇榛樿绉垎鑾峰彇瑙勫垯
   */
  getDefaultEarnRules: function() {
    return [
      { type: 'signin', description: '姣忔棩绛惧埌鑾峰緱5绉垎锛岃繛缁鍒?澶╅澶栧鍔?0绉垎', dailyLimit: 1 },
      { type: 'purchase', description: '璐墿閲戦1:1姣斾緥鑾峰緱绉垎锛岀壒娈婂晢鍝侀櫎澶?, dailyLimit: null },
      { type: 'review', description: '璇勪环鍟嗗搧鑾峰緱10绉垎/鏉★紝姣忔棩涓婇檺5鏉?, dailyLimit: 5 },
      { type: 'share', description: '鎴愬姛鍒嗕韩鍟嗗搧鎴栨椿鍔ㄨ幏寰?绉垎/娆★紝姣忔棩涓婇檺10娆?, dailyLimit: 10 },
      { type: 'profile', description: '瀹屽杽涓汉璧勬枡鑾峰緱50绉垎锛堜竴娆℃€э級', dailyLimit: 1 }
    ];
  },
  
  /**
   * 鑾峰彇榛樿绉垎浣跨敤瑙勫垯
   */
  getDefaultUseRules: function() {
    return [
      { type: 'order', description: '100绉垎鎶垫墸1鍏冿紝鍗曠瑪璁㈠崟鏈€澶氫娇鐢ㄨ鍗曢噾棰?0%鐨勭Н鍒?, minPoints: 100 },
      { type: 'mall', description: '绉垎鍟嗗煄鍏戞崲鍟嗗搧鍜屼紭鎯犲埜', minPoints: 0 }
    ];
  },
  
  /**
   * 鑾峰彇榛樿绉垎杩囨湡瑙勫垯
   */
  getDefaultExpireRules: function() {
    return {
      duration: '12涓湀',
      description: '绉垎鏈夋晥鏈熶负鑾峰緱涔嬫棩璧?2涓湀锛岄€炬湡鏈娇鐢ㄧ殑绉垎灏嗚嚜鍔ㄦ竻闆?
    };
  },

  /**
   * 鑾峰彇榛樿甯歌闂
   */
  getDefaultFaqs: function() {
    return [
      { question: '绉垎鏈変粈涔堢敤锛?, answer: '绉垎鍙互鐢ㄤ簬鍏戞崲骞冲彴鎻愪緵鐨勮櫄鎷熸垨瀹炰綋濂栧姳锛屼互鍙婂弬涓庣壒瀹氭椿鍔ㄣ€? },
      { question: '绉垎浼氳繃鏈熷悧锛?, answer: '鏄殑锛岀Н鍒嗘湁鏁堟湡涓轰竴骞达紝璇峰強鏃朵娇鐢ㄣ€? },
      { question: '濡備綍鏌ヨ鎴戠殑绉垎鏄庣粏锛?, answer: '鍦?鎴戠殑绉垎"椤甸潰鍙互鏌ョ湅鎵€鏈夌Н鍒嗗彉鍔ㄨ褰曘€? },
      { question: '绉垎鍏戞崲鍚庡彲浠ラ€€娆惧悧锛?, answer: '绉垎鍏戞崲鍚庝笉鍙€€娆撅紝璇疯皑鎱庢搷浣溿€? }
    ];
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  onRetry: function() {
    // 璁板綍閲嶈瘯鍔犺浇浜嬩欢
    app.analyticsService.track('retry_loading', {
      page: 'points_rules'
    });
    
    this.loadPointsRules();
  },

  /**
   * 灞曞紑/鏀惰捣FAQ
   */
  toggleFaq: function(e) {
    const index = e.currentTarget.dataset.index;
    const faqs = this.data.faqs;
    faqs[index].expanded = !faqs[index].expanded;
    
    // 璁板綍FAQ鐐瑰嚮浜嬩欢
    app.analyticsService.track('toggle_faq', {
      index,
      expanded: faqs[index].expanded
    });
    
    this.setData({ faqs });
  }
});
/**
 * 鏂囦欢鍚? records.js
 * 鐗堟湰鍙? 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 缁夘垰鍨庣拋鏉跨秿妞ょ敻娼? */
Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    activeTab: 'all', // 瑜版挸澧犲┑鈧ú鑽ゆ畱閺嶅洨顒烽敍姝沴l(閸忋劑鍎?閵嗕躬arn(閼惧嘲褰?閵嗕菇se(娴ｈ法鏁?
    tabs: [
      { key: 'all', value: '閸忋劑鍎? },
      { key: 'earn', value: '閼惧嘲褰? },
      { key: 'use', value: '娴ｈ法鏁? }
    ],
    pointsRecords: [], // 缁夘垰鍨庣拋鏉跨秿閸掓銆?    loading: false, // 加载状态   page: 1, // 瑜版挸澧犳い鐢电垳
    pageSize: 20, // 濮ｅ繘銆夐弫浼村櫤
    hasMore: true, // 閺勵垰鎯佹潻妯绘箒閺囨潙顦块弫鐗堝祦
    totalPoints: 0 // 閻劍鍩涢幀鑽ば濋崚?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    this.loadUserPoints();
    this.loadPointsRecords();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸掓繃顐煎〒鍙夌厠鐎瑰本鍨?   */
  onReady: function () {
    
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function () {
    
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨闂呮劘妫?   */
  onHide: function () {
    
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   */
  onUnload: function () {
    
  },

  /**
   * 妞ょ敻娼伴惄绋垮彠娴滃娆㈡径鍕倞閸戣姤鏆?-閻╂垵鎯夐悽銊﹀煕娑撳濯洪崝銊ょ稊
   */
  onPullDownRefresh: function () {
    this.setData({
      page: 1,
      pointsRecords: [],
      hasMore: true
    }, () => {
      this.loadPointsRecords();
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 妞ょ敻娼版稉濠冨鐟欙箑绨虫禍瀣╂閻ㄥ嫬顦╅悶鍡楀毐閺?   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPointsRecords();
    }
  },

  /**
   * 閻劍鍩涢悙鐟板毊閸欏厖绗傜憴鎺戝瀻娴?   */
  onShareAppMessage: function () {
    return {
      title: '閹存垹娈戠粔顖氬瀻鐠佹澘缍?,
      path: '/pages/user/points/records/records'
    };
  },

  /**
   * 閸掑洦宕查弽鍥╊劮
   */
  onTabChange: function(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.activeTab) return;
    
    this.setData({
      activeTab: tab,
      page: 1,
      pointsRecords: [],
      hasMore: true
    }, () => {
      this.loadPointsRecords();
    });
  },

  /**
   * 閸旂姾娴囬悽銊﹀煕閹崵袧閸?   */
  loadUserPoints: function() {
    // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ら張宥呭閼惧嘲褰囬悽銊﹀煕缁夘垰鍨?    // 濡剝瀚欓弫鐗堝祦
    setTimeout(() => {
      this.setData({
        totalPoints: 1280
      });
    }, 500);
  },

  /**
   * 閸旂姾娴囩粔顖氬瀻鐠佹澘缍?   */
  loadPointsRecords: function() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ら張宥呭閼惧嘲褰囩粔顖氬瀻鐠佹澘缍?    // 濡剝瀚欓弫鐗堝祦
    setTimeout(() => {
      const mockRecords = this.generateMockRecords(this.data.page, this.data.pageSize);
      
      this.setData({
        pointsRecords: [...this.data.pointsRecords, ...mockRecords],
        loading: false,
        page: this.data.page + 1,
        hasMore: mockRecords.length >= this.data.pageSize
      });
    }, 1000);
  },

  /**
   * 閻㈢喐鍨氬Ο鈩冨珯缁夘垰鍨庣拋鏉跨秿閺佺増宓?   */
  generateMockRecords: function(page, pageSize) {
    const allRecords = [
      { id: 1, type: 'earn', amount: 10, title: '濮ｅ繑妫╃粵鎯у煂', desc: '鏉╃偟鐢荤粵鎯у煂3婢?, time: '2023-06-15 08:30:00' },
      { id: 2, type: 'earn', amount: 50, title: '鐎瑰本鍨氭禒璇插', desc: '鐎瑰苯鏉芥稉顏冩眽鐠у嫭鏋?, time: '2023-06-14 15:20:00' },
      { id: 3, type: 'use', amount: -100, title: '缁夘垰鍨庨崗鎴炲床', desc: '閸忔垶宕?0閸忓啩绱幆鐘插煖', time: '2023-06-13 10:15:00' },
      { id: 4, type: 'earn', amount: 20, title: '鐠囧嫪鐜崯鍡楁惂', desc: '鐠囧嫪鐜鑼跺枠娑旀澘鏅㈤崫?, time: '2023-06-12 14:45:00' },
      { id: 5, type: 'use', amount: -200, title: '缁夘垰鍨庨崗鎴炲床', desc: '閸忔垶宕?0閸忓啩绱幆鐘插煖', time: '2023-06-10 09:30:00' },
      { id: 6, type: 'earn', amount: 30, title: '閸掑棔闊╅崯鍡楁惂', desc: '閸掑棔闊╅崯鍡楁惂缂佹瑥銈介崣?, time: '2023-06-08 16:20:00' },
      { id: 7, type: 'earn', amount: 100, title: '閺傛壆鏁ら幋宄邦殯閸?, desc: '娉ㄥ唽闁胶袧閸?, time: '2023-06-01 12:00:00' },
      { id: 8, type: 'use', amount: -50, title: '缁夘垰鍨庨崗鎴炲床', desc: '閸忔垶宕?閸忓啩绱幆鐘插煖', time: '2023-05-28 11:10:00' }
    ];
    
    // 閺嶈宓佽ぐ鎾冲閺嶅洨顒锋潻鍥ㄦ姢閺佺増宓?    let filteredRecords = allRecords;
    if (this.data.activeTab === 'earn') {
      filteredRecords = allRecords.filter(record => record.type === 'earn');
    } else if (this.data.activeTab === 'use') {
      filteredRecords = allRecords.filter(record => record.type === 'use');
    }
    
    // 閸掑棝銆?    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredRecords.slice(start, end);
  }
});

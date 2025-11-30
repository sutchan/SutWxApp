/**
 * 文件名: records.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 绉垎璁板綍椤甸潰
 */
Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    activeTab: 'all', // 褰撳墠婵€娲荤殑鏍囩锛歛ll(鍏ㄩ儴)銆乪arn(鑾峰彇)銆乽se(浣跨敤)
    tabs: [
      { key: 'all', value: '鍏ㄩ儴' },
      { key: 'earn', value: '鑾峰彇' },
      { key: 'use', value: '浣跨敤' }
    ],
    pointsRecords: [], // 绉垎璁板綍鍒楄〃
    loading: false, // 鍔犺浇鐘舵€?    page: 1, // 褰撳墠椤电爜
    pageSize: 20, // 姣忛〉鏁伴噺
    hasMore: true, // 鏄惁杩樻湁鏇村鏁版嵁
    totalPoints: 0 // 鐢ㄦ埛鎬荤Н鍒?  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    this.loadUserPoints();
    this.loadPointsRecords();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍒濇娓叉煋瀹屾垚
   */
  onReady: function () {
    
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰闅愯棌
   */
  onHide: function () {
    
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍗歌浇
   */
  onUnload: function () {
    
  },

  /**
   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
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
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPointsRecords();
    }
  },

  /**
   * 鐢ㄦ埛鐐瑰嚮鍙充笂瑙掑垎浜?   */
  onShareAppMessage: function () {
    return {
      title: '鎴戠殑绉垎璁板綍',
      path: '/pages/user/points/records/records'
    };
  },

  /**
   * 鍒囨崲鏍囩
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
   * 鍔犺浇鐢ㄦ埛鎬荤Н鍒?   */
  loadUserPoints: function() {
    // 杩欓噷搴旇璋冪敤鏈嶅姟鑾峰彇鐢ㄦ埛绉垎
    // 妯℃嫙鏁版嵁
    setTimeout(() => {
      this.setData({
        totalPoints: 1280
      });
    }, 500);
  },

  /**
   * 鍔犺浇绉垎璁板綍
   */
  loadPointsRecords: function() {
    if (this.data.loading || !this.data.hasMore) return;
    
    this.setData({ loading: true });
    
    // 杩欓噷搴旇璋冪敤鏈嶅姟鑾峰彇绉垎璁板綍
    // 妯℃嫙鏁版嵁
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
   * 鐢熸垚妯℃嫙绉垎璁板綍鏁版嵁
   */
  generateMockRecords: function(page, pageSize) {
    const allRecords = [
      { id: 1, type: 'earn', amount: 10, title: '姣忔棩绛惧埌', desc: '杩炵画绛惧埌3澶?, time: '2023-06-15 08:30:00' },
      { id: 2, type: 'earn', amount: 50, title: '瀹屾垚浠诲姟', desc: '瀹屽杽涓汉璧勬枡', time: '2023-06-14 15:20:00' },
      { id: 3, type: 'use', amount: -100, title: '绉垎鍏戞崲', desc: '鍏戞崲10鍏冧紭鎯犲埜', time: '2023-06-13 10:15:00' },
      { id: 4, type: 'earn', amount: 20, title: '璇勪环鍟嗗搧', desc: '璇勪环宸茶喘涔板晢鍝?, time: '2023-06-12 14:45:00' },
      { id: 5, type: 'use', amount: -200, title: '绉垎鍏戞崲', desc: '鍏戞崲20鍏冧紭鎯犲埜', time: '2023-06-10 09:30:00' },
      { id: 6, type: 'earn', amount: 30, title: '鍒嗕韩鍟嗗搧', desc: '鍒嗕韩鍟嗗搧缁欏ソ鍙?, time: '2023-06-08 16:20:00' },
      { id: 7, type: 'earn', amount: 100, title: '鏂扮敤鎴峰鍔?, desc: '娉ㄥ唽閫佺Н鍒?, time: '2023-06-01 12:00:00' },
      { id: 8, type: 'use', amount: -50, title: '绉垎鍏戞崲', desc: '鍏戞崲5鍏冧紭鎯犲埜', time: '2023-05-28 11:10:00' }
    ];
    
    // 鏍规嵁褰撳墠鏍囩杩囨护鏁版嵁
    let filteredRecords = allRecords;
    if (this.data.activeTab === 'earn') {
      filteredRecords = allRecords.filter(record => record.type === 'earn');
    } else if (this.data.activeTab === 'use') {
      filteredRecords = allRecords.filter(record => record.type === 'use');
    }
    
    // 鍒嗛〉
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredRecords.slice(start, end);
  }
});
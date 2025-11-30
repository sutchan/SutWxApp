/**
 * 文件名: points.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 绉垎椤甸潰
 */

const pointsService = require('../../../services/pointsService');

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    userInfo: {
      avatarUrl: '/images/default-avatar.png',
      nickName: '寰俊鐢ㄦ埛'
    },
    pointsInfo: {
      totalPoints: 1250,
      availablePoints: 1250,
      frozenPoints: 0,
      todayEarned: 20,
      todaySpent: 0
    },
    pointsRecords: [],
    loading: true,
    refreshing: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad() {
    this.loadUserInfo();
    this.loadPointsInfo();
    this.loadPointsRecords(true);
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow() {
    // 椤甸潰鏄剧ず鏃跺埛鏂扮Н鍒嗕俊鎭?    this.loadPointsInfo();
  },

  /**
   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔
   */
  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadPointsInfo();
    this.loadPointsRecords(true).then(() => {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 椤甸潰涓婃媺瑙﹀簳浜嬩欢鐨勫鐞嗗嚱鏁?   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPointsRecords(false);
    }
  },

  /**
   * 鍔犺浇鐢ㄦ埛淇℃伅
   */
  async loadUserInfo() {
    try {
      // 杩欓噷搴旇璋冪敤瀹為檯鐨勭敤鎴蜂俊鎭疉PI
      // const userInfo = await userService.getUserInfo();
      
      // 妯℃嫙鏁版嵁
      this.setData({
        userInfo: {
          avatarUrl: '/images/default-avatar.png',
          nickName: '寰俊鐢ㄦ埛'
        }
      });
    } catch (error) {
      console.error('鍔犺浇鐢ㄦ埛淇℃伅澶辫触:', error);
    }
  },

  /**
   * 鍔犺浇绉垎淇℃伅
   */
  async loadPointsInfo() {
    try {
      // 杩欓噷搴旇璋冪敤瀹為檯鐨勭Н鍒嗕俊鎭疉PI
      // const pointsInfo = await pointsService.getUserPoints();
      
      // 妯℃嫙鏁版嵁
      setTimeout(() => {
        this.setData({
          pointsInfo: {
            totalPoints: 1250,
            availablePoints: 1250,
            frozenPoints: 0,
            todayEarned: 20,
            todaySpent: 0
          }
        });
      }, 500);
    } catch (error) {
      console.error('鍔犺浇绉垎淇℃伅澶辫触:', error);
      wx.showToast({
        title: '鍔犺浇绉垎淇℃伅澶辫触',
        icon: 'none'
      });
    }
  },

  /**
   * 鍔犺浇绉垎璁板綍
   */
  async loadPointsRecords(reset = false) {
    if (this.data.loading) return;
    
    try {
      this.setData({ loading: true });
      
      const page = reset ? 1 : this.data.page;
      
      // 杩欓噷搴旇璋冪敤瀹為檯鐨勭Н鍒嗚褰旳PI
      // const result = await pointsService.getPointsRecords({ page, pageSize: this.data.pageSize });
      
      // 妯℃嫙鏁版嵁
      setTimeout(() => {
        const newRecords = [
          {
            id: '1',
            type: 'earn',
            amount: 20,
            reason: '姣忔棩绛惧埌',
            createTime: '2023-12-20 09:00:00',
            orderNo: ''
          },
          {
            id: '2',
            type: 'earn',
            amount: 50,
            reason: '瀹屾垚订单璇勪环',
            createTime: '2023-12-19 14:30:00',
            orderNo: 'ORD20231219001'
          },
          {
            id: '3',
            type: 'spend',
            amount: -100,
            reason: '绉垎鍏戞崲鍟嗗搧',
            createTime: '2023-12-18 16:20:00',
            orderNo: 'EXC20231218001'
          },
          {
            id: '4',
            type: 'earn',
            amount: 30,
            reason: '鍒嗕韩鍟嗗搧缁欏ソ鍙?,
            createTime: '2023-12-17 11:15:00',
            orderNo: ''
          },
          {
            id: '5',
            type: 'earn',
            amount: 10,
            reason: '瀹屽杽涓汉璧勬枡',
            createTime: '2023-12-16 10:30:00',
            orderNo: ''
          },
          {
            id: '6',
            type: 'spend',
            amount: -50,
            reason: '绉垎鍏戞崲浼樻儬鍒?,
            createTime: '2023-12-15 15:45:00',
            orderNo: 'EXC20231215001'
          },
          {
            id: '7',
            type: 'earn',
            amount: 100,
            reason: '鏂扮敤鎴锋敞鍐屽鍔?,
            createTime: '2023-12-10 12:00:00',
            orderNo: ''
          },
          {
            id: '8',
            type: 'earn',
            amount: 20,
            reason: '姣忔棩绛惧埌',
            createTime: '2023-12-09 09:00:00',
            orderNo: ''
          },
          {
            id: '9',
            type: 'spend',
            amount: -200,
            reason: '绉垎鍏戞崲鍟嗗搧',
            createTime: '2023-12-08 14:20:00',
            orderNo: 'EXC20231208001'
          },
          {
            id: '10',
            type: 'earn',
            amount: 15,
            reason: '娴忚鍟嗗搧',
            createTime: '2023-12-07 16:10:00',
            orderNo: ''
          }
        ];
        
        // 鏍规嵁椤电爜鎴彇鏁版嵁
        const startIndex = (page - 1) * this.data.pageSize;
        const endIndex = startIndex + this.data.pageSize;
        const pageRecords = newRecords.slice(startIndex, endIndex);
        
        const updatedRecords = reset ? 
          pageRecords : 
          [...this.data.pointsRecords, ...pageRecords];
        
        this.setData({
          pointsRecords: updatedRecords,
          page: page + 1,
          hasMore: endIndex < newRecords.length,
          loading: false
        });
      }, 800);
      
    } catch (error) {
      console.error('鍔犺浇绉垎璁板綍澶辫触:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '鍔犺浇绉垎璁板綍澶辫触',
        icon: 'none'
      });
    }
  },

  /**
   * 璺宠浆鍒扮Н鍒嗕换鍔￠〉闈?   */
  goToPointsTasks() {
    wx.navigateTo({
      url: '/pages/user/pointsTasks/pointsTasks'
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗗晢鍩庨〉闈?   */
  goToPointsMall() {
    wx.navigateTo({
      url: '/pages/user/pointsMall/pointsMall'
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗙鍒伴〉闈?   */
  goToPointsSignin() {
    wx.navigateTo({
      url: '/pages/user/pointsSignin/pointsSignin'
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗚鍒欓〉闈?   */
  goToPointsRules() {
    wx.navigateTo({
      url: '/pages/user/pointsRules/pointsRules'
    });
  },

  /**
   * 璺宠浆鍒扮Н鍒嗗厬鎹㈣褰曢〉闈?   */
  goToPointsExchangeRecords() {
    wx.navigateTo({
      url: '/pages/user/pointsExchangeRecords/pointsExchangeRecords'
    });
  },

  /**
   * 鏍煎紡鍖栫Н鍒嗗彉鍖?   */
  formatPointsChange(amount) {
    return amount > 0 ? `+${amount}` : `${amount}`;
  },

  /**
   * 鏍煎紡鍖栨椂闂?   */
  formatTime(time) {
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    
    // 灏忎簬1灏忔椂
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes <= 0 ? '鍒氬垰' : `${minutes}鍒嗛挓鍓峘;
    }
    
    // 灏忎簬24灏忔椂
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}灏忔椂鍓峘;
    }
    
    // 灏忎簬30澶?    if (diff < 2592000000) {
      const days = Math.floor(diff / 86400000);
      return `${days}澶╁墠`;
    }
    
    // 瓒呰繃30澶╂樉绀哄叿浣撴棩鏈?    return time.split(' ')[0];
  }
});

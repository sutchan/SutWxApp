// 姣忔棩绛惧埌椤甸潰閫昏緫
const app = getApp();
const { showToast, showLoading, hideLoading } = app.global;

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    todaySigned: false,
    consecutiveDays: 0,
    totalSignedDays: 0,
    monthlySignedDays: 0,
    signInRecords: [],
    calendarData: [],
    loading: true,
    error: null,
    signing: false
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    // 璁板綍椤甸潰璁块棶浜嬩欢
    app.analyticsService.track('page_view', {
      page: 'points_signin'
    });
    
    // 鍔犺浇绛惧埌鏁版嵁
    this.loadSignInData();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function() {
    // 姣忔鏄剧ず椤甸潰鏃堕兘閲嶆柊鍔犺浇鏁版嵁锛岀‘淇濇樉绀烘渶鏂扮姸鎬?    this.loadSignInData();
  },

  /**
   * 鍔犺浇绛惧埌鐩稿叧鏁版嵁
   */
  async loadSignInData() {
    try {
      this.setData({ loading: true, error: null });
      
      // 骞惰璇锋眰绛惧埌鐘舵€佸拰绛惧埌璁板綍
      const [statusResult, recordsResult] = await Promise.all([
        app.services.points.getUserSignInStatus(),
        app.services.points.getUserSignInRecords()
      ]);
      
      // 鏇存柊绛惧埌鐘舵€?      this.setData({
        todaySigned: statusResult.todaySigned || false,
        consecutiveDays: statusResult.consecutiveDays || 0,
        totalSignedDays: statusResult.totalDays || 0,
        monthlySignedDays: statusResult.monthlyDays || 0,
        signInRecords: recordsResult.list || [],
        error: null
      });
      
      // 鐢熸垚鏃ュ巻鏁版嵁
      this.generateCalendarData();
    } catch (err) {
      console.error('鍔犺浇绛惧埌鏁版嵁澶辫触:', err);
      let errorMsg = '鑾峰彇绛惧埌淇℃伅澶辫触';
      if (err.message) {
        errorMsg = err.message;
      }
      
      this.setData({ error: errorMsg });
      showToast({ title: errorMsg, icon: 'none' });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 鐢熸垚鏃ュ巻鏁版嵁
   */
  generateCalendarData() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarData = [];
    
    // 鐢熸垚褰撴湀鏃ユ湡鏁版嵁
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const isSigned = this.data.signInRecords.some(record => 
        record.date === dateStr
      );
      const isToday = day === today.getDate();
      
      calendarData.push({
        day,
        isSigned,
        isToday,
        isFuture: false
      });
    }
    
    this.setData({ calendarData });
  },

  /**
   * 鎵ц绛惧埌
   */
  async doSignIn() {
    // 闃叉閲嶅绛惧埌鎴栨鍦ㄧ鍒颁腑鐨勯噸澶嶇偣鍑?    if (this.data.todaySigned || this.data.signing) {
      return;
    }
    
    try {
      // 璁剧疆绛惧埌涓姸鎬侊紝闃叉閲嶅鎻愪氦
      this.setData({ signing: true });
      
      // 璋冪敤绛惧埌鎺ュ彛
      const result = await app.services.points.doUserSignIn();
      
      // 澶勭悊绛惧埌鎴愬姛鎯呭喌
      if (result.success) {
        // 鏇存柊绛惧埌鐘舵€?        this.setData({
          todaySigned: true,
          consecutiveDays: result.consecutiveDays || 0,
          totalSignedDays: result.totalDays || 0,
          monthlySignedDays: result.monthlyDays || 0
        });
        
        // 閲嶆柊鑾峰彇绛惧埌璁板綍浠ユ洿鏂扮晫闈?        const recordsResult = await app.services.points.getUserSignInRecords();
        this.setData({
          signInRecords: recordsResult.list || []
        });
        
        // 鏇存柊鏃ュ巻鏄剧ず
        this.generateCalendarData();
        
        // 鏄剧ず绛惧埌鎴愬姛鎻愮ず淇℃伅
        showToast({
          title: `绛惧埌鎴愬姛锛岃幏寰?{result.pointsRewarded || 0}绉垎`,
          icon: 'success'
        });
        
        // 璁板綍绛惧埌鎴愬姛浜嬩欢鐢ㄤ簬鏁版嵁鍒嗘瀽
        app.analyticsService.track('points_signin_success', {
          consecutive_days: result.consecutiveDays || 0,
          points_rewarded: result.pointsRewarded || 0
        });
      } else {
        // 澶勭悊绛惧埌澶辫触鎯呭喌锛堟帴鍙ｈ繑鍥炲け璐ワ級
        showToast({ 
          title: result.message || '绛惧埌澶辫触', 
          icon: 'none' 
        });
      }
    } catch (err) {
      // 澶勭悊寮傚父鎯呭喌
      console.error('绛惧埌澶辫触:', err);
      showToast({ 
        title: '绛惧埌澶辫触锛岃閲嶈瘯', 
        icon: 'none' 
      });
    } finally {
      // 鏃犺鎴愬姛澶辫触锛岄兘闇€瑕侀噸缃鍒颁腑鐘舵€?      this.setData({ signing: false });
    }
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  onRetry: function() {
    this.loadSignInData();
  },

  /**
   * 鏌ョ湅绉垎鏄庣粏
   */
  navigateToPointsHistory: function() {
    wx.navigateTo({
      url: '/pages/user/points'
    });
  },

  /**
   * 鏌ョ湅绉垎鍟嗗煄
   */
  navigateToPointsMall: function() {
    wx.navigateTo({
      url: '/pages/user/points-mall'
    });
  }
});
\n
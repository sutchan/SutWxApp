锘?/ 濮ｅ繑妫╃粵鎯у煂妞ょ敻娼伴柅鏄忕帆
const app = getApp();
const { showToast, showLoading, hideLoading } = app.global;

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.analyticsService.track('page_view', {
      page: 'points_signin'
    });
    
    // 閸旂姾娴囩粵鎯у煂閺佺増宓?    this.loadSignInData();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 濮ｅ繑顐奸弰鍓с仛妞ょ敻娼伴弮鍫曞厴闁插秵鏌婇崝鐘烘祰閺佺増宓侀敍宀€鈥樻穱婵囨▔缁€鐑樻付閺傛壆濮搁幀?    this.loadSignInData();
  },

  /**
   * 閸旂姾娴囩粵鎯у煂閻╃鍙ч弫鐗堝祦
   */
  async loadSignInData() {
    try {
      this.setData({ loading: true, error: null });
      
      // 楠炴儼顢戠拠閿嬬湴缁涙儳鍩岄悩鑸碘偓浣告嫲缁涙儳鍩岀拋鏉跨秿
      const [statusResult, recordsResult] = await Promise.all([
        app.services.points.getUserSignInStatus(),
        app.services.points.getUserSignInRecords()
      ]);
      
      // 閺囧瓨鏌婄粵鎯у煂閻樿埖鈧?      this.setData({
        todaySigned: statusResult.todaySigned || false,
        consecutiveDays: statusResult.consecutiveDays || 0,
        totalSignedDays: statusResult.totalDays || 0,
        monthlySignedDays: statusResult.monthlyDays || 0,
        signInRecords: recordsResult.list || [],
        error: null
      });
      
      // 閻㈢喐鍨氶弮銉ュ坊閺佺増宓?      this.generateCalendarData();
    } catch (err) {
      console.error('閸旂姾娴囩粵鎯у煂閺佺増宓佹径杈Е:', err);
      let errorMsg = '閼惧嘲褰囩粵鎯у煂娣団剝浼呮径杈Е';
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
   * 閻㈢喐鍨氶弮銉ュ坊閺佺増宓?   */
  generateCalendarData() {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const calendarData = [];
    
    // 閻㈢喐鍨氳ぐ鎾存箑閺冦儲婀￠弫鐗堝祦
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
   * 閹笛嗩攽缁涙儳鍩?   */
  async doSignIn() {
    // 闂冨弶顒涢柌宥咁槻缁涙儳鍩岄幋鏍劀閸︺劎顒烽崚棰佽厬閻ㄥ嫰鍣告径宥囧仯閸?    if (this.data.todaySigned || this.data.signing) {
      return;
    }
    
    try {
      // 鐠佸墽鐤嗙粵鎯у煂娑擃厾濮搁幀渚婄礉闂冨弶顒涢柌宥咁槻閹绘劒姘?      this.setData({ signing: true });
      
      // 鐠嬪啰鏁ょ粵鎯у煂閹恒儱褰?      const result = await app.services.points.doUserSignIn();
      
      // 婢跺嫮鎮婄粵鎯у煂閹存劕濮涢幆鍛枌
      if (result.success) {
        // 閺囧瓨鏌婄粵鎯у煂閻樿埖鈧?        this.setData({
          todaySigned: true,
          consecutiveDays: result.consecutiveDays || 0,
          totalSignedDays: result.totalDays || 0,
          monthlySignedDays: result.monthlyDays || 0
        });
        
        // 闁插秵鏌婇懢宄板絿缁涙儳鍩岀拋鏉跨秿娴犮儲娲块弬鎵櫕闂?        const recordsResult = await app.services.points.getUserSignInRecords();
        this.setData({
          signInRecords: recordsResult.list || []
        });
        
        // 閺囧瓨鏌婇弮銉ュ坊閺勫墽銇?        this.generateCalendarData();
        
        // 閺勫墽銇氱粵鎯у煂閹存劕濮涢幓鎰仛娣団剝浼?        showToast({
          title: `缁涙儳鍩岄幋鎰閿涘矁骞忓?{result.pointsRewarded || 0}缁夘垰鍨巂,
          icon: 'success'
        });
        
        // 鐠佹澘缍嶇粵鎯у煂閹存劕濮涙禍瀣╂閻劋绨弫鐗堝祦閸掑棙鐎?        app.analyticsService.track('points_signin_success', {
          consecutive_days: result.consecutiveDays || 0,
          points_rewarded: result.pointsRewarded || 0
        });
      } else {
        // 婢跺嫮鎮婄粵鎯у煂婢惰精瑙﹂幆鍛枌閿涘牊甯撮崣锝堢箲閸ョ偛銇戠拹銉礆
        showToast({ 
          title: result.message || '缁涙儳鍩屾径杈Е', 
          icon: 'none' 
        });
      }
    } catch (err) {
      // 婢跺嫮鎮婂鍌氱埗閹懎鍠?      console.error('缁涙儳鍩屾径杈Е:', err);
      showToast({ 
        title: '缁涙儳鍩屾径杈Е閿涘矁顕柌宥堢槸', 
        icon: 'none' 
      });
    } finally {
      // 閺冪姾顔戦幋鎰婢惰精瑙﹂敍宀勫厴闂団偓鐟曚線鍣哥純顔绢劮閸掗鑵戦悩鑸碘偓?      this.setData({ signing: false });
    }
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  onRetry: function() {
    this.loadSignInData();
  },

  /**
   * 閺屻儳婀呯粔顖氬瀻閺勫海绮?   */
  navigateToPointsHistory: function() {
    wx.navigateTo({
      url: '/pages/user/points'
    });
  },

  /**
   * 閺屻儳婀呯粔顖氬瀻閸熷棗鐓?   */
  navigateToPointsMall: function() {
    wx.navigateTo({
      url: '/pages/user/points-mall'
    });
  }
});
\n
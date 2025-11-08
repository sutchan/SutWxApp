// 绉垎鍟嗗煄鍟嗗搧璇︽儏椤甸潰閫昏緫
const app = getApp();
const { showToast, showLoading, hideLoading, showModal } = app.global;

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    productId: '',
    product: null,
    userPoints: 0,
    loading: true,
    error: null,
    exchangeLoading: false
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function(options) {
    if (options.id) {
      this.setData({ productId: options.id });
      // 璁板綍椤甸潰璁块棶浜嬩欢
      app.analyticsService.track('page_view', {
        page: 'points_mall_detail',
        product_id: options.id
      });
      
      // 鍔犺浇鍟嗗搧璇︽儏鍜岀敤鎴风Н鍒?      this.loadProductDetail();
    } else {
      this.setData({ error: '鍟嗗搧涓嶅瓨鍦?, loading: false });
    }
  },

  /**
   * 鍔犺浇鍟嗗搧璇︽儏鍜岀敤鎴风Н鍒?   */
  async loadProductDetail() {
    try {
      this.setData({ loading: true, error: null });
      
      // 骞惰璇锋眰鍟嗗搧璇︽儏鍜岀敤鎴风Н鍒嗕俊鎭?      const [productResult, userPointsResult] = await Promise.all([
        app.services.points.getPointsMallProductDetail(this.data.productId),
        app.services.points.getUserPointsInfo()
      ]);
      
      this.setData({
        product: productResult,
        userPoints: userPointsResult.totalPoints || 0,
        error: null
      });
    } catch (err) {
      console.error('鍔犺浇鍟嗗搧璇︽儏澶辫触:', err);
      let errorMsg = '鑾峰彇鍟嗗搧璇︽儏澶辫触';
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
   * 绉垎鍏戞崲鍟嗗搧
   */
  async exchangeProduct() {
    // 妫€鏌ョН鍒嗘槸鍚﹁冻澶?    if (this.data.userPoints < this.data.product.points) {
      showToast({ title: '绉垎涓嶈冻锛屾棤娉曞厬鎹?, icon: 'none' });
      return;
    }

    // 纭鍏戞崲
    showModal({
      title: '纭鍏戞崲',
      content: `纭畾瑕佽姳璐?{this.data.product.points}绉垎鍏戞崲姝ゅ晢鍝佸悧锛焋,
      success: async (res) => {
        if (res.confirm) {
          try {
            this.setData({ exchangeLoading: true });
            
            // 璋冪敤鍏戞崲鎺ュ彛
            const result = await app.services.points.exchangePointsProduct({
              productId: this.data.productId
            });
            
            if (result.success) {
              showToast({ title: '鍏戞崲鎴愬姛' });
              
              // 璁板綍鍏戞崲鎴愬姛浜嬩欢
              app.analyticsService.track('points_exchange_success', {
                product_id: this.data.productId,
                product_name: this.data.product.title,
                points_spent: this.data.product.points
              });
              
              // 寤惰繜鍚庤烦杞?              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/user/points-exchange-records'
                });
              }, 1500);
            } else {
              showToast({ title: result.message || '鍏戞崲澶辫触', icon: 'none' });
            }
          } catch (err) {
            console.error('鍏戞崲鍟嗗搧澶辫触:', err);
            showToast({ title: '鍏戞崲澶辫触锛岃閲嶈瘯', icon: 'none' });
          } finally {
            this.setData({ exchangeLoading: false });
          }
        }
      }
    });
  },

  /**
   * 閲嶈瘯鍔犺浇
   */
  onRetry: function() {
    this.loadProductDetail();
  },

  /**
   * 鏌ョ湅绉垎瑙勫垯
   */
  navigateToPointsRules: function() {
    wx.navigateTo({
      url: '/pages/user/points-rules'
    });
  },

  /**
   * 鏌ョ湅绉垎鏄庣粏
   */
  navigateToPointsHistory: function() {
    wx.navigateTo({
      url: '/pages/user/points'
    });
  }
});

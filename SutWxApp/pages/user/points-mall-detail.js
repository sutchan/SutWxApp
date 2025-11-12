锘?/ 缁夘垰鍨庨崯鍡楃厔閸熷棗鎼х拠锔藉剰妞ょ敻娼伴柅鏄忕帆
const app = getApp();
const { showToast, showLoading, hideLoading, showModal } = app.global;

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    productId: '',
    product: null,
    userPoints: 0,
    loading: true,
    error: null,
    exchangeLoading: false
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    if (options.id) {
      this.setData({ productId: options.id });
      // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
      app.analyticsService.track('page_view', {
        page: 'points_mall_detail',
        product_id: options.id
      });
      
      // 閸旂姾娴囬崯鍡楁惂鐠囷附鍎忛崪宀€鏁ら幋椋幮濋崚?      this.loadProductDetail();
    } else {
      this.setData({ error: '閸熷棗鎼ф稉宥呯摠閸?, loading: false });
    }
  },

  /**
   * 閸旂姾娴囬崯鍡楁惂鐠囷附鍎忛崪宀€鏁ら幋椋幮濋崚?   */
  async loadProductDetail() {
    try {
      this.setData({ loading: true, error: null });
      
      // 楠炴儼顢戠拠閿嬬湴閸熷棗鎼х拠锔藉剰閸滃瞼鏁ら幋椋幮濋崚鍡曚繆閹?      const [productResult, userPointsResult] = await Promise.all([
        app.services.points.getPointsMallProductDetail(this.data.productId),
        app.services.points.getUserPointsInfo()
      ]);
      
      this.setData({
        product: productResult,
        userPoints: userPointsResult.totalPoints || 0,
        error: null
      });
    } catch (err) {
      console.error('閸旂姾娴囬崯鍡楁惂鐠囷附鍎忔径杈Е:', err);
      let errorMsg = '閼惧嘲褰囬崯鍡楁惂鐠囷附鍎忔径杈Е';
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
   * 缁夘垰鍨庨崗鎴炲床閸熷棗鎼?   */
  async exchangeProduct() {
    // 濡偓閺屻儳袧閸掑棙妲搁崥锕佸喕婢?    if (this.data.userPoints < this.data.product.points) {
      showToast({ title: '缁夘垰鍨庢稉宥堝喕閿涘本妫ゅ▔鏇炲幀閹?, icon: 'none' });
      return;
    }

    // 绾喛顓婚崗鎴炲床
    showModal({
      title: '绾喛顓婚崗鎴炲床',
      content: `绾喖鐣剧憰浣藉С鐠?{this.data.product.points}缁夘垰鍨庨崗鎴炲床濮濄倕鏅㈤崫浣告偋閿涚剫,
      success: async (res) => {
        if (res.confirm) {
          try {
            this.setData({ exchangeLoading: true });
            
            // 鐠嬪啰鏁ら崗鎴炲床閹恒儱褰?            const result = await app.services.points.exchangePointsProduct({
              productId: this.data.productId
            });
            
            if (result.success) {
              showToast({ title: '閸忔垶宕查幋鎰' });
              
              // 鐠佹澘缍嶉崗鎴炲床閹存劕濮涙禍瀣╂
              app.analyticsService.track('points_exchange_success', {
                product_id: this.data.productId,
                product_name: this.data.product.title,
                points_spent: this.data.product.points
              });
              
              // 瀵ゆ儼绻滈崥搴ょ儲鏉?              setTimeout(() => {
                wx.navigateTo({
                  url: '/pages/user/points-exchange-records'
                });
              }, 1500);
            } else {
              showToast({ title: result.message || '閸忔垶宕叉径杈Е', icon: 'none' });
            }
          } catch (err) {
            console.error('閸忔垶宕查崯鍡楁惂婢惰精瑙?', err);
            showToast({ title: '閸忔垶宕叉径杈Е閿涘矁顕柌宥堢槸', icon: 'none' });
          } finally {
            this.setData({ exchangeLoading: false });
          }
        }
      }
    });
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  onRetry: function() {
    this.loadProductDetail();
  },

  /**
   * 閺屻儳婀呯粔顖氬瀻鐟欏嫬鍨?   */
  navigateToPointsRules: function() {
    wx.navigateTo({
      url: '/pages/user/points-rules'
    });
  },

  /**
   * 閺屻儳婀呯粔顖氬瀻閺勫海绮?   */
  navigateToPointsHistory: function() {
    wx.navigateTo({
      url: '/pages/user/points'
    });
  }
});
\n
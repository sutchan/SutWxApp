锘?/ pages/user/agreement/agreement.js
/**
 * 閸楀繗顔呮い鐢告桨 - 閺勫墽銇氶悽銊﹀煕閸楀繗顔呴幋鏍缁変焦鏂傜粵鏍у敶鐎? */
Page({
  data: {
    type: 'user', // 'user' 閹?'privacy'
    title: '閻劍鍩涢崡蹇氼唴',
    content: '',
    loading: true,
    error: false
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 閼惧嘲褰囨导鐘插弳閻ㄥ嫬宕楃拋顔捐閸?    const type = options.type || 'user';
    
    this.setData({
      type: type,
      title: type === 'privacy' ? '闂呮劗顫嗛弨璺ㄧ摜' : '閻劍鍩涢崡蹇氼唴'
    });
    
    // 鐠佸墽鐤嗙€佃壈鍩呴弽蹇旂垼妫?    wx.setNavigationBarTitle({
      title: this.data.title
    });
    
    // 閸旂姾娴囬崡蹇氼唴閸愬懎顔?    this.loadAgreementContent();
  },

  /**
   * 閸旂姾娴囬崡蹇氼唴閸愬懎顔?   */
  loadAgreementContent: function() {
    const app = getApp();
    const url = this.data.type === 'privacy' ? '/agreement/privacy' : '/agreement/user';
    
    app.request({
      url: url,
      method: 'GET',
      success: (res) => {
        if (res.code === 200 && res.data && res.data.content) {
          this.setData({
            content: res.data.content,
            loading: false,
            error: false
          });
        } else {
          console.error('閼惧嘲褰囬崡蹇氼唴閸愬懎顔愭径杈Е:', res.message);
          this.setData({
            loading: false,
            error: true,
            content: res.message || '閸愬懎顔愰崝鐘烘祰婢惰精瑙?
          });
        }
      },
      fail: (error) => {
        console.error('缂冩垹绮剁拠閿嬬湴婢惰精瑙?', error);
        this.setData({
          loading: false,
          error: true,
          content: '缂冩垹绮跺鍌氱埗閿涘苯鍞寸€圭懓濮炴潪钘夈亼鐠?
        });
      }
    });
  },

  /**
   * 闁插秵鏌婇崝鐘烘祰
   */
  reloadContent: function() {
    this.setData({
      loading: true,
      error: false
    });
    this.loadAgreementContent();
  },

  /**
   * 婢跺秴鍩楅崡蹇氼唴閸愬懎顔?   */
  copyContent: function() {
    wx.setClipboardData({
      data: this.data.content,
      success: () => {
        wx.showToast({
          title: '閸愬懎顔愬鎻掝槻閸?,
          icon: 'success',
          duration: 2000
        });
      },
      fail: () => {
        wx.showToast({
          title: '婢跺秴鍩楁径杈Е',
          icon: 'none'
        });
      }
    });
  }
});\n
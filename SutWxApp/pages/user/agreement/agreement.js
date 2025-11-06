// pages/user/agreement/agreement.js
/**
 * 协议页面 - 显示用户协议或隐私政策内容
 */
Page({
  data: {
    type: 'user', // 'user' 或 'privacy'
    title: '用户协议',
    content: '',
    loading: true,
    error: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 获取传入的协议类型
    const type = options.type || 'user';
    
    this.setData({
      type: type,
      title: type === 'privacy' ? '隐私政策' : '用户协议'
    });
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: this.data.title
    });
    
    // 加载协议内容
    this.loadAgreementContent();
  },

  /**
   * 加载协议内容
   */
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
          console.error('获取协议内容失败:', res.message);
          this.setData({
            loading: false,
            error: true,
            content: res.message || '内容加载失败'
          });
        }
      },
      fail: (error) => {
        console.error('网络请求失败:', error);
        this.setData({
          loading: false,
          error: true,
          content: '网络异常，内容加载失败'
        });
      }
    });
  },

  /**
   * 重新加载
   */
  reloadContent: function() {
    this.setData({
      loading: true,
      error: false
    });
    this.loadAgreementContent();
  },

  /**
   * 复制协议内容
   */
  copyContent: function() {
    wx.setClipboardData({
      data: this.data.content,
      success: () => {
        wx.showToast({
          title: '内容已复制',
          icon: 'success',
          duration: 2000
        });
      },
      fail: () => {
        wx.showToast({
          title: '复制失败',
          icon: 'none'
        });
      }
    });
  }
});
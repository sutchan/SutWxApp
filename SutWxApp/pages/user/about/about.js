// pages/user/about/about.js
/**
 * 关于我们页面 - 显示应用的相关信息
 */
Page({
  data: {
    appName: 'Sut微信小程序',
    appVersion: '1.0.1',
    appDescription: '为您提供优质的内容服务',
    companyName: 'Sut Company',
    copyright: '© 2024 Sut Company. 保留所有权利。',
    contactEmail: 'contact@sut.com',
    website: 'https://sutchan.github.io'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    const app = getApp();
    
    this.setData({
      appVersion: app.globalData.appVersion || '1.0.0'
    });
    
    wx.setNavigationBarTitle({
      title: '关于我们'
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // 可以在这里更新页面数据
  },

  /**
   * 复制邮箱地址
   */
  copyEmail: function() {
    wx.setClipboardData({
      data: this.data.contactEmail,
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
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
  },

  /**
   * 打开官方网站
   */
  openWebsite: function() {
    wx.navigateToMiniProgram({
      appId: '', // 如果是跳转到其他小程序
      path: '',
      success: () => {
        console.log('跳转成功');
      },
      fail: () => {
        // 如果没有指定小程序，则打开网页
        wx.openLocation({
          latitude: 0,
          longitude: 0,
          name: this.data.appName,
          address: this.data.website,
          success: () => {
            console.log('打开位置成功');
          },
          fail: () => {
            // 尝试打开网页
            wx.showModal({
              title: '打开网站',
              content: '是否跳转到官方网站？',
              success: (res) => {
                if (res.confirm) {
                  wx.navigateTo({
                    url: '/pages/common/webview/webview?url=' + encodeURIComponent(this.data.website)
                  });
                }
              }
            });
          }
        });
      }
    });
  },

  /**
   * 检查更新
   */
  checkUpdate: function() {
    const app = getApp();
    app.checkUpdate();
  }
});
// pages/user/profile/profile.js\n/**\n * 涓汉涓績椤甸潰 - 灞曠ず鐢ㄦ埛淇℃伅鍜屾彁渚涚敤鎴风浉鍏冲姛鑳?
 */\nPage({\n  data: {\n    userInfo: null, // 鐢ㄦ埛淇℃伅\n    userStats: {}, // 鐢ㄦ埛缁熻鏁版嵁\n    signinStatus: false, // 绛惧埌鐘舵€?
    signinDays: 0, // 杩炵画绛惧埌澶╂暟\n    isLoading: true, // 椤甸潰鍔犺浇鐘舵€?
    error: null, // 閿欒淇℃伅\n    appVersion: getApp().globalData.appVersion, // 搴旂敤鐗堟湰\n    showStatsCard: true, // 鏄惁鏄剧ず缁熻鍗＄墖\n    showHelpCenter: true, // 鏄惁鏄剧ず甯姪涓績\n    showSkeleton: true // 鏄惁鏄剧ず楠ㄦ灦灞?
  },\n\n  /**\n   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇\n   */\n  onLoad: function() {\n    // 椤甸潰鍔犺浇鏃惰幏鍙栫敤鎴蜂俊鎭?
    this.setData({\n      isLoggedIn: getApp().isLoggedIn(),\n      showSkeleton: true\n    });\n    this.loadUserInfo();\n  },\n\n  /**\n   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず\n   */\n  onShow: function() {\n    // 椤甸潰鏄剧ず鏃跺埛鏂扮敤鎴蜂俊鎭?
    this.loadUserInfo();\n  },\n\n  /**\n   * 椤甸潰鐩稿叧浜嬩欢澶勭悊鍑芥暟--鐩戝惉鐢ㄦ埛涓嬫媺鍔ㄤ綔\n   */\n  onPullDownRefresh: function() {\n    // 涓嬫媺鍒锋柊鏃堕噸鏂板姞杞界敤鎴蜂俊鎭?
    this.setData({\n      showSkeleton: true,\n      error: null\n    });\n    this.loadUserInfo();\n  },\n\n  /**\n   * 鍔犺浇鐢ㄦ埛淇℃伅\n   */\n  loadUserInfo: function() {\n    const app = getApp();\n    \n    // 鏇存柊鐧诲綍鐘舵€?
    this.setData({\n      isLoggedIn: app.isLoggedIn()\n    });\n    \n    // 妫€鏌ョ敤鎴锋槸鍚︾櫥褰?
    if (app.isLoggedIn()) {\n      // 宸茬櫥褰曪紝鑾峰彇鐢ㄦ埛淇℃伅鍜岀粺璁℃暟鎹?
      this.getUserInfo();\n      this.getUserStats();\n      this.getSigninStatus();\n    } else {\n      // 鏈櫥褰曠姸鎬?
      this.setData({\n        isLoading: false,\n        showSkeleton: false\n      });\n    }\n  },\n\n  /**
   * 鑾峰彇鐢ㄦ埛璇︾粏淇℃伅
   */
  getUserInfo: function() {
    const app = getApp();
    
    wx.showLoading({ title: '鍔犺浇涓? });
    
    app.services.user.getUserProfile()
      .then(res => {
        wx.hideLoading();
        if (res.code === 200) {
          // 鍚堝苟鍏ㄥ眬鐢ㄦ埛淇℃伅鍜孉PI杩斿洖鐨勭敤鎴蜂俊鎭?          const userInfo = { ...app.globalData.user, ...res.data };
          
          this.setData({
            userInfo: userInfo,
            error: null,
            showSkeleton: false
          });
          
          // 鏇存柊鍏ㄥ眬鐢ㄦ埛淇℃伅
          app.globalData.user = userInfo;
          wx.setStorageSync('user', userInfo);
        } else {
          this.setData({
            error: res.message || '鑾峰彇鐢ㄦ埛淇℃伅澶辫触',
            showSkeleton: false
          });
          wx.showToast({
            title: res.message || '鑾峰彇鐢ㄦ埛淇℃伅澶辫触',
            icon: 'none',
            duration: 2000
          });
        }
      })
      .catch(error => {
        wx.hideLoading();
        console.error('鑾峰彇鐢ㄦ埛淇℃伅澶辫触:', error);
        this.setData({
          error: '缃戠粶閿欒锛岃閲嶈瘯',
          showSkeleton: false
        });
        wx.showToast({
          title: '缃戠粶閿欒锛岃閲嶈瘯',
          icon: 'none',
          duration: 2000
        });
      })
      .finally(() => {
        wx.stopPullDownRefresh();
        this.setData({ 
          isLoading: false,
          showSkeleton: false 
        });
      });\n  },\n\n  /**\n   * 鑾峰彇鐢ㄦ埛缁熻鏁版嵁\n   */\n  getUserStats: function() {\n    const app = getApp();\n    \n    app.services.user.getUserStats()\n      .then(res => {\n        if (res.code === 200) {\n          this.setData({\n            userStats: res.data,\n            error: null\n          });\n        } else {\n          console.error('鑾峰彇鐢ㄦ埛缁熻鏁版嵁澶辫触:', res);\n        }\n      })\n      .catch(error => {\n        console.error('鑾峰彇鐢ㄦ埛缁熻鏁版嵁澶辫触:', error);\n      });\n  },\n\n  /**\n   * 鑾峰彇鐢ㄦ埛绛惧埌鐘舵€?
   */\n  getSigninStatus: function() {\n    const app = getApp();\n    \n    app.services.user.getSignInStatus()\n      .then(res => {\n        if (res.code === 200) {\n          this.setData({\n            signinStatus: res.data.is_signed || false,\n            signinDays: res.data.continuous_days || 0\n          });\n        } else {\n          console.error('鑾峰彇绛惧埌鐘舵€佸け璐?', res);\n        }\n      })\n      .catch(error => {\n        console.error('鑾峰彇绛惧埌鐘舵€佸け璐?', error);\n      });\n  },\n  \n  /**\n   * 鐐瑰嚮澶村儚涓婁紶鏂板ご鍍?
   */\n  onAvatarTap: function() {\n    const upload = require('../../utils/upload.js');\n    \n    // 鏄剧ず閫夋嫨鍥剧墖鐨勫姩浣滈潰鏉?
    wx.showActionSheet({\n      itemList: ['浠庣浉鍐岄€夋嫨', '鎷嶇収'],\n      success: (res) => {\n        if (!res.cancel) {\n          const sourceType = res.tapIndex === 0 ? ['album'] : ['camera'];\n          \n          // 璋冪敤鍥剧墖涓婁紶宸ュ叿绫?
          upload.chooseAndUploadImage({\n            count: 1,\n            sourceType: sourceType,\n            sizeType: ['compressed'],\n            uploadParams: {\n              url: '/user/avatar', // 澶村儚涓婁紶鎺ュ彛\n              name: 'avatar',\n              formData: {\n                type: 'avatar'\n              }\n            },\n            success: (uploadRes) => {\n              // 涓婁紶鎴愬姛锛屾洿鏂扮敤鎴峰ご鍍?
              if (uploadRes.code === 200) {\n                // 鏇存柊鏈湴鐢ㄦ埛淇℃伅\n                const app = getApp();\n                const updatedUserInfo = {\n                  ...this.data.userInfo,\n                  avatar: uploadRes.data.url\n                };\n                \n                this.setData({\n                  userInfo: updatedUserInfo\n                });\n                \n                // 鏇存柊鍏ㄥ眬鐢ㄦ埛淇℃伅\n                app.globalData.userInfo = updatedUserInfo;\n                wx.setStorageSync('userInfo', updatedUserInfo);\n                \n                wx.showToast({\n                  title: '澶村儚鏇存柊鎴愬姛',\n                  icon: 'success',\n                  duration: 2000\n                });\n              } else {\n                wx.showToast({\n                  title: uploadRes.message || '澶村儚涓婁紶澶辫触',\n                  icon: 'none',\n                  duration: 2000\n                });\n              }\n            },\n            fail: (error) => {\n              console.error('澶村儚涓婁紶澶辫触:', error);\n              if (error.message !== '鐢ㄦ埛鍙栨秷閫夋嫨') {\n                wx.showToast({\n                  title: '澶村儚涓婁紶澶辫触锛岃閲嶈瘯',\n                  icon: 'none',\n                  duration: 2000\n                });\n              }\n            }\n          });\n        }\n      }\n    });\n  },\n\n  /**\n   * 璺宠浆鍒扮櫥褰曢〉闈?
   */\n  navigateToLogin: function() {\n    wx.navigateTo({\n      url: '/pages/user/login/login',\n      fail: function() {\n        wx.showToast({\n          title: '璺宠浆鐧诲綍椤甸潰澶辫触',\n          icon: 'none'\n        });\n      }\n    });\n  },\n\n  /**\n   * 鎵ц绛惧埌鎿嶄綔\n   */\n  doSignin: function() {\n    if (this.data.signinStatus) {\n      wx.showToast({\n        title: '浠婂ぉ宸茬粡绛惧埌杩囦簡',\n        icon: 'none',\n        duration: 2000\n      });\n      return;\n    }\n    \n    const app = getApp();\n    \n    // 鏄剧ず鍔犺浇鍔ㄧ敾\n    wx.showLoading({\n      title: '绛惧埌涓?,\n      mask: true\n    });\n    \n    app.services.user.signIn()\n      .then(res => {\n        wx.hideLoading();\n        \n        if (res.code === 200) {\n          // 鏇存柊绛惧埌鐘舵€?
          this.setData({\n            signinStatus: true,\n            signinDays: res.data.continuous_days || 0\n          });\n          \n          // 鏄剧ず绛惧埌鎴愬姛鎻愮ず\n          wx.showToast({\n            title: '绛惧埌鎴愬姛锛岃幏寰? + res.data.points + '绉垎',\n            icon: 'success',\n            duration: 2000\n          });\n          \n          // 鍒锋柊鐢ㄦ埛缁熻鏁版嵁\n          this.getUserStats();\n        } else if (res.code === 400 && res.message.includes('宸茬鍒?)) {\n          // 浠婂ぉ宸茬粡绛惧埌杩?
          this.setData({\n            signinStatus: true\n          });\n          \n          wx.showToast({\n            title: '浠婂ぉ宸茬粡绛惧埌杩囦簡',\n            icon: 'none',\n            duration: 2000\n          });\n        } else {\n          // 鍏朵粬閿欒\n          wx.showToast({\n            title: res.message || '绛惧埌澶辫触',\n            icon: 'none',\n            duration: 2000\n          });\n        }\n      })\n      .catch(error => {\n        wx.hideLoading();\n        console.error('绛惧埌澶辫触:', error);\n        \n        wx.showToast({\n          title: '缃戠粶閿欒锛岃閲嶈瘯',\n          icon: 'none',\n          duration: 2000\n        });\n      });\n  },\n\n  /**\n   * 璺宠浆鍒扮鍒板巻鍙查〉闈?
   */\n  navigateToSigninHistory: function() {\n    wx.showToast({\n      title: '绛惧埌鍘嗗彶鍔熻兘灏氭湭瀹炵幇',\n      icon: 'none',\n      duration: 2000\n    });\n  },\n\n  /**\n   * 璺宠浆鍒板湴鍧€绠＄悊椤甸潰\n   */\n  navigateToAddressList: function() {\n    wx.showToast({\n      title: '鍦板潃绠＄悊鍔熻兘灏氭湭瀹炵幇',\n      icon: 'none',\n      duration: 2000\n    });\n  },\n\n  /**\n   * 璺宠浆鍒版敹钘忓垪琛ㄩ〉闈?
   */\n  navigateToFavoriteList: function() {\n    wx.showToast({\n      title: '鏀惰棌鍒楄〃鍔熻兘灏氭湭瀹炵幇',\n      icon: 'none',\n      duration: 2000\n    });\n  },\n\n  /**\n   * 璺宠浆鍒拌鍗曞垪琛ㄩ〉闈?
   */\n  navigateToOrderList: function() {\n    wx.showToast({\n      title: '璁㈠崟鍒楄〃鍔熻兘灏氭湭瀹炵幇',\n      icon: 'none',\n      duration: 2000\n    });\n  },\n\n  /**\n   * 璺宠浆鍒扮Н鍒嗕腑蹇冮〉闈?
   */\n  navigateToPointsCenter: function() {\n    wx.showToast({\n      title: '绉垎涓績鍔熻兘灏氭湭瀹炵幇',\n      icon: 'none',\n      duration: 2000\n    });\n  },\n\n  /**\n   * 璺宠浆鍒拌缃〉闈?
   */\n  navigateToSettings: function() {\n    wx.navigateTo({\n      url: '/pages/user/settings/settings'\n    });\n  },\n\n  /**\n   * 璺宠浆鍒版剰瑙佸弽棣堥〉闈?
   */\n  navigateToFeedback: function() {\n    wx.showToast({\n      title: '鎰忚鍙嶉鍔熻兘灏氭湭瀹炵幇',\n      icon: 'none',\n      duration: 2000\n    });\n  },\n\n  /**\n   * 閫€鍑虹櫥褰?
   */\n  logout: function() {\n    wx.showModal({\n      title: '纭閫€鍑?,\n      content: '纭畾瑕侀€€鍑虹櫥褰曞悧锛?,\n      success: (res) => {\n        if (res.confirm) {\n          const app = getApp();\n          \n          app.request({\n            url: '/user/logout',\n            method: 'POST',\n            success: (res) => {\n              // 娓呴櫎鏈湴瀛樺偍鐨勭敤鎴蜂俊鎭拰token\n              app.clearUserData();\n              \n              // 璺宠浆鍒扮櫥褰曢〉闈?
              wx.reLaunch({\n                url: '/pages/user/login/login'\n              });\n            },\n            fail: (error) => {\n              console.error('鐧诲嚭澶辫触:', error);\n              \n              // 鍗充娇澶辫触涔熸竻闄ゆ湰鍦版暟鎹?
              app.clearUserData();\n              \n              wx.reLaunch({\n                url: '/pages/user/login/login'\n              });\n            }\n          });\n        }\n      }\n    });\n  },\n\n  /**\n   * 鍒锋柊鐢ㄦ埛淇℃伅锛堝己鍒堕噸鏂板姞杞芥墍鏈夌敤鎴风浉鍏虫暟鎹級\n   */\n  refreshUserInfo: function() {\n    wx.showLoading({\n      title: '鍒锋柊涓?,\n    });\n    \n    this.setData({\n      isLoading: true,\n      error: null\n    });\n    \n    this.getUserInfo();\n    this.getUserStats();\n    this.getSigninStatus();\n    \n    setTimeout(() => {\n      wx.hideLoading();\n      wx.showToast({\n        title: '鍒锋柊鎴愬姛',\n        icon: 'success',\n        duration: 1500\n      });\n    }, 800);\n  },\n  \n  /**\n   * 閲嶈瘯鍔犺浇鏁版嵁\n   */\n  onRetry: function() {\n    this.setData({\n      isLoading: true,\n      error: null,\n      showSkeleton: true\n    });\n    this.loadUserInfo();\n  },\n  \n  /**\n   * 璺宠浆鍒板府鍔╀腑蹇冮〉闈?
   */\n  navigateToHelpCenter: function() {\n    wx.showToast({\n      title: '甯姪涓績鍔熻兘灏氭湭瀹炵幇',\n      icon: 'none',\n      duration: 2000\n    });\n  }\n});
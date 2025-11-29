/**
 * 鏂囦欢鍚? profile.js
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-23
 * 鐢ㄦ埛涓汉璧勬枡椤甸潰
 */
Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '寰俊鐢ㄦ埛',
      gender: 0, // 0: 鏈煡, 1: 鐢? 2: 濂?      birthday: ''
    }
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad() {
    this.loadUserInfo();
  },

  /**
   * 鍔犺浇鐢ㄦ埛淇℃伅
   */
  loadUserInfo() {
    // 妯℃嫙浠庢湰鍦板瓨鍌ㄦ垨鍚庣鑾峰彇鐢ㄦ埛淇℃伅
    const userInfo = wx.getStorageSync('userInfo') || {
      avatarUrl: '/assets/images/default_avatar.png',
      nickName: '寰俊鐢ㄦ埛',
      gender: 0,
      birthday: ''
    };
    this.setData({ userInfo });
  },

  /**
   * 閫夋嫨澶村儚
   */
  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const { tempFiles } = res;
        if (tempFiles && tempFiles.length > 0) {
          const avatarUrl = tempFiles[0].tempFilePath;
          this.setData({
            'userInfo.avatarUrl': avatarUrl
          });
          wx.setStorageSync('userInfo', this.data.userInfo);
          wx.showToast({
            title: '澶村儚鏇存柊鎴愬姛',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 缂栬緫鏄电О
   */
  editNickName() {
    wx.showModal({
      title: '缂栬緫鏄电О',
      editable: true,
      placeholderText: '璇疯緭鍏ユ樀绉?,
      content: this.data.userInfo.nickName,
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            'userInfo.nickName': res.content
          });
          wx.setStorageSync('userInfo', this.data.userInfo);
          wx.showToast({
            title: '鏄电О鏇存柊鎴愬姛',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 缂栬緫鎬у埆
   */
  editGender() {
    wx.showActionSheet({
      itemList: ['鐢?, '濂?],
      success: (res) => {
        const gender = res.tapIndex === 0 ? 1 : 2;
        this.setData({
          'userInfo.gender': gender
        });
        wx.setStorageSync('userInfo', this.data.userInfo);
        wx.showToast({
          title: '鎬у埆鏇存柊鎴愬姛',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 缂栬緫鐢熸棩
   */
  editBirthday() {
    wx.showDatePicker({
      value: this.data.userInfo.birthday || '2000-01-01',
      success: (res) => {
        this.setData({
          'userInfo.birthday': res.value
        });
        wx.setStorageSync('userInfo', this.data.userInfo);
        wx.showToast({
          title: '鐢熸棩鏇存柊鎴愬姛',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 閫€鍑虹櫥褰?   */
  logout() {
    wx.showModal({
      title: '閫€鍑虹櫥褰?,
      content: '纭畾瑕侀€€鍑虹櫥褰曞悧锛?,
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.showToast({
            title: '閫€鍑烘垚鍔?,
            icon: 'success'
          });
          // 璺宠浆鍒扮櫥褰曢〉闈㈡垨棣栭〉
          wx.reLaunch({
            url: '/pages/user/login/login'
          });
        }
      }
    });
  }
});
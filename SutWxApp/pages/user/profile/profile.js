/**
 * 文件名 profile.js
 * 版本号 1.0.0
 * 更新日期: 2025-12-04
 * 閻劍鍩涙稉顏冩眽鐠у嫭鏋℃い鐢告桨
 */
Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '瀵邦喕淇婇悽銊﹀煕',
      gender: 0, // 0: 閺堫亞鐓? 1: 閻? 2: 婵?      birthday: ''
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad() {
    this.loadUserInfo();
  },

  /**
   * 閸旂姾娴囬悽銊﹀煕娣団剝浼?   */
  loadUserInfo() {
    // 濡剝瀚欐禒搴㈡拱閸︽澘鐡ㄩ崒銊﹀灗閸氬海顏懢宄板絿閻劍鍩涙穱鈩冧紖
    const userInfo = wx.getStorageSync('userInfo') || {
      avatarUrl: '/assets/images/default_avatar.png',
      nickName: '瀵邦喕淇婇悽銊﹀煕',
      gender: 0,
      birthday: ''
    };
    this.setData({ userInfo });
  },

  /**
   * 闁瀚ㄦ径鏉戝剼
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
            title: '婢舵潙鍎氶弴瀛樻煀閹存劕濮?,
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 缂傛牞绶弰鐢敌?   */
  editNickName() {
    wx.showModal({
      title: '缂傛牞绶弰鐢敌?,
      editable: true,
      placeholderText: '鐠囩柉绶崗銉︽█缁?,
      content: this.data.userInfo.nickName,
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            'userInfo.nickName': res.content
          });
          wx.setStorageSync('userInfo', this.data.userInfo);
          wx.showToast({
            title: '閺勭數袨閺囧瓨鏌婇幋鎰',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 缂傛牞绶幀褍鍩?   */
  editGender() {
    wx.showActionSheet({
      itemList: ['閻?, '婵?],
      success: (res) => {
        const gender = res.tapIndex === 0 ? 1 : 2;
        this.setData({
          'userInfo.gender': gender
        });
        wx.setStorageSync('userInfo', this.data.userInfo);
        wx.showToast({
          title: '閹冨焼閺囧瓨鏌婇幋鎰',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 缂傛牞绶悽鐔告）
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
          title: '閻㈢喐妫╅弴瀛樻煀閹存劕濮?,
          icon: 'success'
        });
      }
    });
  },

  /**
   * 闁偓閸戣櫣娅ヨぐ?   */
  logout() {
    wx.showModal({
      title: '闁偓閸戣櫣娅ヨぐ?,
      content: '绾喖鐣剧憰渚€鈧偓閸戣櫣娅ヨぐ鏇炴偋閿?,
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.showToast({
            title: '闁偓閸戠儤鍨氶崝?,
            icon: 'success'
          });
          // 鐠哄疇娴嗛崚鎵瑜版洟銆夐棃銏″灗首页          wx.reLaunch({
            url: '/pages/user/login/login'
          });
        }
      }
    });
  }
});

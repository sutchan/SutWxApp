/**
 * 文件名: profile.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 用户个人资料页面
 */
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: '',
      nickName: '微信用户',
      gender: 0, // 0: 未知, 1: 男, 2: 女
      birthday: ''
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadUserInfo();
  },

  /**
   * 加载用户信息
   */
  loadUserInfo() {
    // 模拟从本地存储或后端获取用户信息
    const userInfo = wx.getStorageSync('userInfo') || {
      avatarUrl: '/assets/images/default_avatar.png',
      nickName: '微信用户',
      gender: 0,
      birthday: ''
    };
    this.setData({ userInfo });
  },

  /**
   * 选择头像
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
            title: '头像更新成功',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 编辑昵称
   */
  editNickName() {
    wx.showModal({
      title: '编辑昵称',
      editable: true,
      placeholderText: '请输入昵称',
      content: this.data.userInfo.nickName,
      success: (res) => {
        if (res.confirm && res.content) {
          this.setData({
            'userInfo.nickName': res.content
          });
          wx.setStorageSync('userInfo', this.data.userInfo);
          wx.showToast({
            title: '昵称更新成功',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 编辑性别
   */
  editGender() {
    wx.showActionSheet({
      itemList: ['男', '女'],
      success: (res) => {
        const gender = res.tapIndex === 0 ? 1 : 2;
        this.setData({
          'userInfo.gender': gender
        });
        wx.setStorageSync('userInfo', this.data.userInfo);
        wx.showToast({
          title: '性别更新成功',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 编辑生日
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
          title: '生日更新成功',
          icon: 'success'
        });
      }
    });
  },

  /**
   * 退出登录
   */
  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo');
          wx.showToast({
            title: '退出成功',
            icon: 'success'
          });
          // 跳转到登录页面或首页
          wx.reLaunch({
            url: '/pages/user/login/login'
          });
        }
      }
    });
  }
});
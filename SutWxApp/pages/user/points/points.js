/**
 * 文件名: points.js
 * 版本号: 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 积分页面
 */

const pointsService = require('../../../services/pointsService');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {
      avatarUrl: '/images/default-avatar.png',
      nickName: '微信用户'
    },
    pointsInfo: {
      totalPoints: 1250,
      availablePoints: 1250,
      frozenPoints: 0,
      todayEarned: 20,
      todaySpent: 0
    },
    pointsRecords: [],
    loading: true,
    refreshing: false,
    hasMore: true,
    page: 1,
    pageSize: 10
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.loadUserInfo();
    this.loadPointsInfo();
    this.loadPointsRecords(true);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时刷新积分信息
    this.loadPointsInfo();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({ refreshing: true });
    this.loadPointsInfo();
    this.loadPointsRecords(true).then(() => {
      this.setData({ refreshing: false });
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPointsRecords(false);
    }
  },

  /**
   * 加载用户信息
   */
  async loadUserInfo() {
    try {
      // 这里应该调用实际的用户信息API
      // const userInfo = await userService.getUserInfo();
      
      // 模拟数据
      this.setData({
        userInfo: {
          avatarUrl: '/images/default-avatar.png',
          nickName: '微信用户'
        }
      });
    } catch (error) {
      console.error('加载用户信息失败:', error);
    }
  },

  /**
   * 加载积分信息
   */
  async loadPointsInfo() {
    try {
      // 这里应该调用实际的积分信息API
      // const pointsInfo = await pointsService.getUserPoints();
      
      // 模拟数据
      setTimeout(() => {
        this.setData({
          pointsInfo: {
            totalPoints: 1250,
            availablePoints: 1250,
            frozenPoints: 0,
            todayEarned: 20,
            todaySpent: 0
          }
        });
      }, 500);
    } catch (error) {
      console.error('加载积分信息失败:', error);
      wx.showToast({
        title: '加载积分信息失败',
        icon: 'none'
      });
    }
  },

  /**
   * 加载积分记录
   */
  async loadPointsRecords(reset = false) {
    if (this.data.loading) return;
    
    try {
      this.setData({ loading: true });
      
      const page = reset ? 1 : this.data.page;
      
      // 这里应该调用实际的积分记录API
      // const result = await pointsService.getPointsRecords({ page, pageSize: this.data.pageSize });
      
      // 模拟数据
      setTimeout(() => {
        const newRecords = [
          {
            id: '1',
            type: 'earn',
            amount: 20,
            reason: '每日签到',
            createTime: '2023-12-20 09:00:00',
            orderNo: ''
          },
          {
            id: '2',
            type: 'earn',
            amount: 50,
            reason: '完成订单评价',
            createTime: '2023-12-19 14:30:00',
            orderNo: 'ORD20231219001'
          },
          {
            id: '3',
            type: 'spend',
            amount: -100,
            reason: '积分兑换商品',
            createTime: '2023-12-18 16:20:00',
            orderNo: 'EXC20231218001'
          },
          {
            id: '4',
            type: 'earn',
            amount: 30,
            reason: '分享商品给好友',
            createTime: '2023-12-17 11:15:00',
            orderNo: ''
          },
          {
            id: '5',
            type: 'earn',
            amount: 10,
            reason: '完善个人资料',
            createTime: '2023-12-16 10:30:00',
            orderNo: ''
          },
          {
            id: '6',
            type: 'spend',
            amount: -50,
            reason: '积分兑换优惠券',
            createTime: '2023-12-15 15:45:00',
            orderNo: 'EXC20231215001'
          },
          {
            id: '7',
            type: 'earn',
            amount: 100,
            reason: '新用户注册奖励',
            createTime: '2023-12-10 12:00:00',
            orderNo: ''
          },
          {
            id: '8',
            type: 'earn',
            amount: 20,
            reason: '每日签到',
            createTime: '2023-12-09 09:00:00',
            orderNo: ''
          },
          {
            id: '9',
            type: 'spend',
            amount: -200,
            reason: '积分兑换商品',
            createTime: '2023-12-08 14:20:00',
            orderNo: 'EXC20231208001'
          },
          {
            id: '10',
            type: 'earn',
            amount: 15,
            reason: '浏览商品',
            createTime: '2023-12-07 16:10:00',
            orderNo: ''
          }
        ];
        
        // 根据页码截取数据
        const startIndex = (page - 1) * this.data.pageSize;
        const endIndex = startIndex + this.data.pageSize;
        const pageRecords = newRecords.slice(startIndex, endIndex);
        
        const updatedRecords = reset ? 
          pageRecords : 
          [...this.data.pointsRecords, ...pageRecords];
        
        this.setData({
          pointsRecords: updatedRecords,
          page: page + 1,
          hasMore: endIndex < newRecords.length,
          loading: false
        });
      }, 800);
      
    } catch (error) {
      console.error('加载积分记录失败:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '加载积分记录失败',
        icon: 'none'
      });
    }
  },

  /**
   * 跳转到积分任务页面
   */
  goToPointsTasks() {
    wx.navigateTo({
      url: '/pages/user/pointsTasks/pointsTasks'
    });
  },

  /**
   * 跳转到积分商城页面
   */
  goToPointsMall() {
    wx.navigateTo({
      url: '/pages/user/pointsMall/pointsMall'
    });
  },

  /**
   * 跳转到积分签到页面
   */
  goToPointsSignin() {
    wx.navigateTo({
      url: '/pages/user/pointsSignin/pointsSignin'
    });
  },

  /**
   * 跳转到积分规则页面
   */
  goToPointsRules() {
    wx.navigateTo({
      url: '/pages/user/pointsRules/pointsRules'
    });
  },

  /**
   * 跳转到积分兑换记录页面
   */
  goToPointsExchangeRecords() {
    wx.navigateTo({
      url: '/pages/user/pointsExchangeRecords/pointsExchangeRecords'
    });
  },

  /**
   * 格式化积分变化
   */
  formatPointsChange(amount) {
    return amount > 0 ? `+${amount}` : `${amount}`;
  },

  /**
   * 格式化时间
   */
  formatTime(time) {
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    
    // 小于1小时
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes <= 0 ? '刚刚' : `${minutes}分钟前`;
    }
    
    // 小于24小时
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}小时前`;
    }
    
    // 小于30天
    if (diff < 2592000000) {
      const days = Math.floor(diff / 86400000);
      return `${days}天前`;
    }
    
    // 超过30天显示具体日期
    return time.split(' ')[0];
  }
});
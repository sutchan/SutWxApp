/**
 * 鏂囦欢鍚? points.js
 * 鐗堟湰鍙? 1.0.0
 * 更新日期: 2025-11-23
 * 描述: 缁夘垰鍨庢い鐢告桨
 */

const pointsService = require('../../../services/pointsService');

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    userInfo: {
      avatarUrl: '/images/default-avatar.png',
      nickName: '瀵邦喕淇婇悽銊﹀煕'
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
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad() {
    this.loadUserInfo();
    this.loadPointsInfo();
    this.loadPointsRecords(true);
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow() {
    // 妞ょ敻娼伴弰鍓с仛閺冭泛鍩涢弬鎵濋崚鍡曚繆閹?    this.loadPointsInfo();
  },

  /**
   * 妞ょ敻娼伴惄绋垮彠娴滃娆㈡径鍕倞閸戣姤鏆?-閻╂垵鎯夐悽銊﹀煕娑撳濯洪崝銊ょ稊
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
   * 妞ょ敻娼版稉濠冨鐟欙箑绨虫禍瀣╂閻ㄥ嫬顦╅悶鍡楀毐閺?   */
  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadPointsRecords(false);
    }
  },

  /**
   * 閸旂姾娴囬悽銊﹀煕娣団剝浼?   */
  async loadUserInfo() {
    try {
      // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ょ€圭偤妾惃鍕暏閹磋渹淇婇幁鐤塒I
      // const userInfo = await userService.getUserInfo();
      
      // 濡剝瀚欓弫鐗堝祦
      this.setData({
        userInfo: {
          avatarUrl: '/images/default-avatar.png',
          nickName: '瀵邦喕淇婇悽銊﹀煕'
        }
      });
    } catch (error) {
      console.error('閸旂姾娴囬悽銊﹀煕娣団剝浼呮径杈Е:', error);
    }
  },

  /**
   * 閸旂姾娴囩粔顖氬瀻娣団剝浼?   */
  async loadPointsInfo() {
    try {
      // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ょ€圭偤妾惃鍕濋崚鍡曚繆閹枆PI
      // const pointsInfo = await pointsService.getUserPoints();
      
      // 濡剝瀚欓弫鐗堝祦
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
      console.error('閸旂姾娴囩粔顖氬瀻娣団剝浼呮径杈Е:', error);
      wx.showToast({
        title: '閸旂姾娴囩粔顖氬瀻娣団剝浼呮径杈Е',
        icon: 'none'
      });
    }
  },

  /**
   * 閸旂姾娴囩粔顖氬瀻鐠佹澘缍?   */
  async loadPointsRecords(reset = false) {
    if (this.data.loading) return;
    
    try {
      this.setData({ loading: true });
      
      const page = reset ? 1 : this.data.page;
      
      // 鏉╂瑩鍣锋惔鏃囶嚉鐠嬪啰鏁ょ€圭偤妾惃鍕濋崚鍡氼唶瑜版棾PI
      // const result = await pointsService.getPointsRecords({ page, pageSize: this.data.pageSize });
      
      // 濡剝瀚欓弫鐗堝祦
      setTimeout(() => {
        const newRecords = [
          {
            id: '1',
            type: 'earn',
            amount: 20,
            reason: '濮ｅ繑妫╃粵鎯у煂',
            createTime: '2023-12-20 09:00:00',
            orderNo: ''
          },
          {
            id: '2',
            type: 'earn',
            amount: 50,
            reason: '鐎瑰本鍨氳鍗曠拠鍕幆',
            createTime: '2023-12-19 14:30:00',
            orderNo: 'ORD20231219001'
          },
          {
            id: '3',
            type: 'spend',
            amount: -100,
            reason: '缁夘垰鍨庨崗鎴炲床閸熷棗鎼?,
            createTime: '2023-12-18 16:20:00',
            orderNo: 'EXC20231218001'
          },
          {
            id: '4',
            type: 'earn',
            amount: 30,
            reason: '閸掑棔闊╅崯鍡楁惂缂佹瑥銈介崣?,
            createTime: '2023-12-17 11:15:00',
            orderNo: ''
          },
          {
            id: '5',
            type: 'earn',
            amount: 10,
            reason: '鐎瑰苯鏉芥稉顏冩眽鐠у嫭鏋?,
            createTime: '2023-12-16 10:30:00',
            orderNo: ''
          },
          {
            id: '6',
            type: 'spend',
            amount: -50,
            reason: '缁夘垰鍨庨崗鎴炲床娴兼ɑ鍎崚?,
            createTime: '2023-12-15 15:45:00',
            orderNo: 'EXC20231215001'
          },
          {
            id: '7',
            type: 'earn',
            amount: 100,
            reason: '閺傛壆鏁ら幋閿嬫暈閸愬苯顨涢崝?,
            createTime: '2023-12-10 12:00:00',
            orderNo: ''
          },
          {
            id: '8',
            type: 'earn',
            amount: 20,
            reason: '濮ｅ繑妫╃粵鎯у煂',
            createTime: '2023-12-09 09:00:00',
            orderNo: ''
          },
          {
            id: '9',
            type: 'spend',
            amount: -200,
            reason: '缁夘垰鍨庨崗鎴炲床閸熷棗鎼?,
            createTime: '2023-12-08 14:20:00',
            orderNo: 'EXC20231208001'
          },
          {
            id: '10',
            type: 'earn',
            amount: 15,
            reason: '濞村繗顫嶉崯鍡楁惂',
            createTime: '2023-12-07 16:10:00',
            orderNo: ''
          }
        ];
        
        // 閺嶈宓佹い鐢电垳閹搭亜褰囬弫鐗堝祦
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
      console.error('閸旂姾娴囩粔顖氬瀻鐠佹澘缍嶆径杈Е:', error);
      this.setData({ loading: false });
      wx.showToast({
        title: '閸旂姾娴囩粔顖氬瀻鐠佹澘缍嶆径杈Е',
        icon: 'none'
      });
    }
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡曟崲閸旓繝銆夐棃?   */
  goToPointsTasks() {
    wx.navigateTo({
      url: '/pages/user/pointsTasks/pointsTasks'
    });
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡楁櫌閸╁酣銆夐棃?   */
  goToPointsMall() {
    wx.navigateTo({
      url: '/pages/user/pointsMall/pointsMall'
    });
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡欘劮閸掍即銆夐棃?   */
  goToPointsSignin() {
    wx.navigateTo({
      url: '/pages/user/pointsSignin/pointsSignin'
    });
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡氼潐閸掓瑩銆夐棃?   */
  goToPointsRules() {
    wx.navigateTo({
      url: '/pages/user/pointsRules/pointsRules'
    });
  },

  /**
   * 鐠哄疇娴嗛崚鎵濋崚鍡楀幀閹广垼顔囪ぐ鏇€夐棃?   */
  goToPointsExchangeRecords() {
    wx.navigateTo({
      url: '/pages/user/pointsExchangeRecords/pointsExchangeRecords'
    });
  },

  /**
   * 閺嶇厧绱￠崠鏍濋崚鍡楀綁閸?   */
  formatPointsChange(amount) {
    return amount > 0 ? `+${amount}` : `${amount}`;
  },

  /**
   * 閺嶇厧绱￠崠鏍ㄦ闂?   */
  formatTime(time) {
    const date = new Date(time);
    const now = new Date();
    const diff = now - date;
    
    // 鐏忓繋绨?鐏忓繑妞?    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes <= 0 ? '閸掓艾鍨? : `${minutes}閸掑棝鎸撻崜宄?
    }
    
    // 鐏忓繋绨?4鐏忓繑妞?    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}鐏忓繑妞傞崜宄?
    }
    
    // 鐏忓繋绨?0婢?    if (diff < 2592000000) {
      const days = Math.floor(diff / 86400000);
      return `${days}婢垛晛澧燻;
    }
    
    // 鐡掑懓绻?0婢垛晜妯夌粈鍝勫徔娴ｆ挻妫╅張?    return time.split(' ')[0];
  }
});

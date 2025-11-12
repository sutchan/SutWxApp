锘?/ 閻劍鍩涚拠锔藉剰妞ょ敻娼?- 閻劋绨弻銉ф箙閸忔湹绮悽銊﹀煕閻ㄥ嫪淇婇幁?import { showToast } from '../../utils/global';

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    userId: '', // 閻劍鍩汭D
    userInfo: null, // 閻劍鍩涙穱鈩冧紖
    loading: true, // 閸旂姾娴囬悩鑸碘偓?    error: '', // 闁挎瑨顕ゆ穱鈩冧紖
    isFollowing: false, // 閺勵垰鎯佸鎻掑彠濞?    followingCount: 0, // 閸忚櫕鏁為弫?    followersCount: 0, // 缁绗ｉ弫?    articlesCount: 0, // 閺傚洨鐝烽弫?    isCurrentUser: false // 閺勵垰鎯佹稉鍝勭秼閸撳秶鏁ら幋?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    const app = getApp();
    
    // 閼惧嘲褰囨导鐘插弳閻ㄥ嫮鏁ら幋绋〥
    const userId = options.id || '';
    
    if (!userId) {
      this.setData({
        error: '閻劍鍩汭D娑撳秴鐡ㄩ崷?,
        loading: false
      });
      return;
    }
    
    this.setData({
      userId: userId,
      // 濡偓閺屻儲妲搁崥锔胯礋瑜版挸澧犻惂璇茬秿閻劍鍩?      isCurrentUser: app.globalData.userInfo && app.globalData.userInfo.id === userId
    });
    
    // 閸旂姾娴囬悽銊﹀煕娣団剝浼?    this.loadUserInfo();
    
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    if (app.services && app.services.analytics) {
      app.services.analytics.trackPageView('user_profile_detail', { userId: userId });
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 妞ょ敻娼伴弰鍓с仛閺冭泛鍩涢弬鐗堟殶閹?    this.loadUserInfo();
  },

  /**
   * 閸旂姾娴囬悽銊﹀煕娣団剝浼?   */
  loadUserInfo: async function() {
    const app = getApp();
    
    // 閺勫墽銇氶崝鐘烘祰閻樿埖鈧?    this.setData({
      loading: true,
      error: ''
    });

    try {
      // 娴ｈ法鏁ら悽銊﹀煕閺堝秴濮熼懢宄板絿閻劍鍩涙穱鈩冧紖
      const result = await app.services.api.request({
        url: `/users/${this.data.userId}`,
        method: 'GET'
      });
      
      const userInfo = result.data || {};
      
      this.setData({
        userInfo: userInfo,
        followingCount: userInfo.following_count || 0,
        followersCount: userInfo.followers_count || 0,
        articlesCount: userInfo.articles_count || 0
      });
      
      // 婵″倹鐏夋稉宥嗘Ц瑜版挸澧犻悽銊﹀煕閿涘本顥呴弻銉ュ彠濞夈劎濮搁幀?      if (!this.data.isCurrentUser) {
        await this.checkFollowingStatus();
      }
    } catch (error) {
      console.error('閼惧嘲褰囬悽銊﹀煕娣団剝浼呮径杈Е:', error);
      this.setData({
        error: error.message || '閸旂姾娴囬悽銊﹀煕娣団剝浼呮径杈Е',
        loading: false
      });
      showToast('閼惧嘲褰囬悽銊﹀煕娣団剝浼呮径杈Е', 'none');
    } finally {
      this.setData({
        loading: false
      });
    }
  },

  /**
   * 濡偓閺屻儱鍙у▔銊уЦ閹?   */
  checkFollowingStatus: async function() {
    const app = getApp();
    
    try {
      // 濡偓閺屻儳娅ヨぐ鏇犲Ц閹?      if (!app.isLoggedIn()) {
        this.setData({ isFollowing: false });
        return;
      }
      
      // 娴ｈ法鏁ら崗铏暈閺堝秴濮熷Λ鈧弻銉ュ彠濞夈劎濮搁幀?      if (app.services && app.services.following) {
        const result = await app.services.following.checkFollowingStatus({
          user_id: this.data.userId
        });
        
        this.setData({
          isFollowing: result.data?.is_following || false
        });
      }
    } catch (error) {
      console.error('濡偓閺屻儱鍙у▔銊уЦ閹礁銇戠拹?', error);
      this.setData({ isFollowing: false });
    }
  },

  /**
   * 閸忚櫕鏁?閸欐牗绉烽崗铏暈閻劍鍩?   */
  toggleFollow: async function() {
    const app = getApp();
    
    // 濡偓閺屻儳娅ヨぐ鏇犲Ц閹?    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    try {
      if (this.data.isFollowing) {
        // 閸欐牗绉烽崗铏暈
        await app.services.following.unfollowUser({
          id: this.data.userId
        });
        
        showToast('閸欐牗绉烽崗铏暈閹存劕濮?, 'success');
        this.setData({
          isFollowing: false,
          followersCount: Math.max(0, this.data.followersCount - 1)
        });
      } else {
        // 閸忚櫕鏁為悽銊﹀煕
        await app.services.following.followUser({
          user_id: this.data.userId
        });
        
        showToast('閸忚櫕鏁為幋鎰', 'success');
        this.setData({
          isFollowing: true,
          followersCount: this.data.followersCount + 1
        });
      }
      
      // 鐠佹澘缍嶆禍瀣╂
      if (app.services && app.services.analytics) {
        app.services.analytics.trackEvent(
          this.data.isFollowing ? 'user_follow' : 'user_unfollow',
          { target_user_id: this.data.userId }
        );
      }
    } catch (error) {
      console.error('閹垮秳缍旀径杈Е:', error);
      showToast(error.message || '閹垮秳缍旀径杈Е', 'none');
    }
  },

  /**
   * 鐠哄疇娴嗛崚鎵暏閹撮攱鏋冪粩鐘插灙鐞?   */
  navigateToUserArticles: function() {
    wx.navigateTo({
      url: `/pages/user/profile/articles?id=${this.data.userId}&name=${encodeURIComponent(this.data.userInfo?.nickname || '')}`
    });
  },

  /**
   * 鐠哄疇娴嗛崚鎵暏閹村嘲鍙у▔銊ュ灙鐞?   */
  navigateToUserFollowing: function() {
    wx.navigateTo({
      url: `/pages/user/profile/following?id=${this.data.userId}&name=${encodeURIComponent(this.data.userInfo?.nickname || '')}`
    });
  },

  /**
   * 鐠哄疇娴嗛崚鎵暏閹撮鐭囨稉婵嗗灙鐞?   */
  navigateToUserFollowers: function() {
    wx.navigateTo({
      url: `/pages/user/profile/followers?id=${this.data.userId}&name=${encodeURIComponent(this.data.userInfo?.nickname || '')}`
    });
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  retryLoad: function() {
    this.loadUserInfo();
  },

  /**
   * 鐠哄疇娴嗛崚鐗堝灉閻ㄥ嫪閲滄禍杞拌厬韫?   */
  navigateToMyProfile: function() {
    wx.navigateTo({
      url: '/pages/user/profile/profile'
    });
  }
});
\n
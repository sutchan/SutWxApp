锘?/ 閻劍鍩涢崗铏暈妞ょ敻娼?import { showToast } from '../../utils/global';

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    followingList: [], // 閸忚櫕鏁為崚妤勩€?    loading: false, // 閸旂姾娴囬悩鑸碘偓?    refreshing: false, // 娑撳濯洪崚閿嬫煀閻樿埖鈧?    error: '', // 闁挎瑨顕ゆ穱鈩冧紖
    hasMore: true, // 閺勵垰鎯侀張澶嬫纯婢舵碍鏆熼幑?    page: 1, // 瑜版挸澧犳い鐢电垳
    pageSize: 10 // 濮ｅ繘銆夐弫鐗堝祦闁?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    const app = getApp();
    
    // 濡偓閺屻儳娅ヨぐ鏇犲Ц閹?    if (!app.isLoggedIn()) {
      wx.navigateTo({
        url: '/pages/user/login/login'
      });
      return;
    }
    
    // 閸旂姾娴囬崗铏暈閺佺増宓?    this.loadFollowingData();
    
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    if (app.services && app.services.analytics) {
      app.services.analytics.trackPageView('user_following');
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    const app = getApp();
    
    // 濡偓閺屻儳娅ヨぐ鏇犲Ц閹?    if (!app.isLoggedIn()) {
      return;
    }
    
    // 妞ょ敻娼伴弰鍓с仛閺冭泛鍩涢弬鐗堟殶閹?    this.setData({
      page: 1,
      followingList: [],
      hasMore: true
    });
    this.loadFollowingData();
  },

  /**
   * 閸旂姾娴囬崗铏暈閺佺増宓?   * @param {boolean} refresh - 閺勵垰鎯佹稉鍝勫煕閺傜増鎼锋担?   */
  loadFollowingData: async function(refresh = false) {
    const app = getApp();
    
    // 婵″倹鐏夊锝呮躬閸旂姾娴囬敍宀€娲块幒銉ㄧ箲閸?    if (this.data.loading) return;

    // 閺勫墽銇氶崝鐘烘祰閻樿埖鈧?    this.setData({
      loading: true,
      error: ''
    });

    try {
      // 濡偓閺屻儱鍙у▔銊︽箛閸斺剝妲搁崥锕€鐡ㄩ崷?      if (!app.services || !app.services.following) {
        throw new Error('閸忚櫕鏁為張宥呭閺嗗倷绗夐崣顖滄暏');
      }
      
      // 閺嬪嫬缂撶拠閿嬬湴閸欏倹鏆?      const page = refresh ? 1 : this.data.page;
      
      // 娴ｈ法鏁ら崗铏暈閺堝秴濮熼懢宄板絿閸忚櫕鏁為崚妤勩€?      const result = await app.services.following.getUserFollowing({
        page: page,
        per_page: this.data.pageSize
      });
      
      const newList = result.list || [];
      const newFollowingList = refresh ? newList : [...this.data.followingList, ...newList];
      
      // 閸掋倖鏌囬弰顖氭儊鏉╂ɑ婀侀弴鏉戭樋閺佺増宓?      const hasMore = newList.length === this.data.pageSize;
      const nextPage = refresh ? 2 : this.data.page + 1;

      this.setData({
        followingList: newFollowingList,
        hasMore: hasMore,
        page: nextPage,
        error: ''
      });
    } catch (error) {
      console.error('閼惧嘲褰囬崗铏暈閸掓銆冩径杈Е:', error);
      this.setData({
        error: error.message || '閸旂姾娴囨径杈Е閿涘矁顕柌宥堢槸'
      });
      showToast('閼惧嘲褰囬崗铏暈婢惰精瑙?, 'none');
    } finally {
      this.setData({
        loading: false,
        refreshing: false
      });
      wx.stopPullDownRefresh();
    }
  },

  /**
   * 婢跺嫮鎮婄拠閿嬬湴閹存劕濮?   * @param {Object} result - 閸濆秴绨查弫鐗堝祦
   * @param {boolean} refresh - 閺勵垰鎯佹稉鍝勫煕閺傜増鎼锋担?   */
  handleRequestSuccess: function(result, refresh) {
    const newList = result.list || [];
    const newFollowingList = refresh ? newList : [...this.data.followingList, ...newList];
    
    // 閸掋倖鏌囬弰顖氭儊鏉╂ɑ婀侀弴鏉戭樋閺佺増宓?    const hasMore = newList.length === this.data.pageSize;
    const nextPage = refresh ? 2 : this.data.page + 1;

    this.setData({
      followingList: newFollowingList,
      hasMore: hasMore,
      page: nextPage,
      error: ''
    });
  },

  /**
   * 婢跺嫮鎮婄拠閿嬬湴闁挎瑨顕?   * @param {Object} error - 闁挎瑨顕ゆ穱鈩冧紖
   */
  handleRequestError: function(error) {
    console.error('閼惧嘲褰囬崗铏暈閸掓銆冩径杈Е:', error);
    this.setData({
      error: error.message || '缂冩垹绮跺鍌氱埗閿涘矁顕Λ鈧弻銉х秹缂佹粏绻涢幒銉ユ倵闁插秷鐦?
    });
    showToast('閼惧嘲褰囬崗铏暈婢惰精瑙?, 'none');
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  retryLoad: function() {
    this.setData({
      page: 1,
      followingList: [],
      hasMore: true
    });
    this.loadFollowingData();
  },

  /**
   * 閸旂姾娴囬弴鏉戭樋
   */
  loadMore: function() {
    if (!this.data.hasMore || this.data.loading) return;
    this.loadFollowingData(false);
  },

  /**
   * 閸欐牗绉烽崗铏暈
   * @param {Object} e - 娴滃娆㈢€电钖?   */
  unfollow: function(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;
    const userId = e.currentTarget.dataset.userId;

    wx.showModal({
      title: '绾喛顓婚幙宥勭稊',
      content: '绾喖鐣剧憰浣稿絿濞戝牆鍙у▔銊ユ偋閿?,
      success: (res) => {
        if (res.confirm) {
          this.executeUnfollow(id, index, userId);
        }
      }
    });
  },

  /**
   * 閹笛嗩攽閸欐牗绉烽崗铏暈閹垮秳缍?   * @param {number} id - 閸忚櫕鏁濱D
   * @param {number} index - 閸掓銆冪槐銏犵穿
   * @param {number} userId - 閻劍鍩汭D
   */
  executeUnfollow: async function(id, index, userId) {
    const app = getApp();
    
    try {
      // 濡偓閺屻儱鍙у▔銊︽箛閸斺剝妲搁崥锕€鐡ㄩ崷?      if (!app.services || !app.services.following) {
        throw new Error('閸忚櫕鏁為張宥呭閺嗗倷绗夐崣顖滄暏');
      }
      
      // 娴ｈ法鏁ら崗铏暈閺堝秴濮熼崣鏍ㄧХ閸忚櫕鏁?      await app.services.following.unfollowUser({
        id: id
      });
      
      // 娴犲骸鍨悰銊よ厬缁夊娅庣拠銉ュ彠濞夈劑銆?      const newFollowingList = [...this.data.followingList];
      newFollowingList.splice(index, 1);
      
      this.setData({
        followingList: newFollowingList
      });
      
      showToast('閸欐牗绉烽崗铏暈閹存劕濮?, 'success');
      
      // 鐠佹澘缍嶉崣鏍ㄧХ閸忚櫕鏁炴禍瀣╂
      if (app.services && app.services.analytics) {
        app.services.analytics.trackEvent('user_unfollow', {
          following_id: id,
          user_id: userId
        });
      }
    } catch (error) {
      console.error('閸欐牗绉烽崗铏暈婢惰精瑙?', error);
      showToast(error.message || '閸欐牗绉烽崗铏暈婢惰精瑙?, 'none');
    }
  },

  /**
   * 鐠哄疇娴嗛崚鎵暏閹寸柉顕涢幆鍛淬€?   * @param {Object} e - 娴滃娆㈢€电钖?   */
  navigateToUserProfile: function(e) {
    const userId = e.currentTarget.dataset.userId;
    const app = getApp();
    
    // 鐠佹澘缍嶇捄瀹犳祮娴滃娆?    if (app.services && app.services.analytics) {
      app.services.analytics.trackEvent('user_following_profile_click', {
        user_id: userId
      });
    }
    
    wx.navigateTo({
      url: `/pages/user/user-detail?id=${userId}`
    });
  },

  /**
   * 娑撳濯洪崚閿嬫煀
   */
  onPullDownRefresh: function() {
    this.setData({
      refreshing: true,
      page: 1,
      hasMore: true
    });
    this.loadFollowingData(true);
  },

  /**
   * 娑撳﹥濯虹憴锕€绨抽崝鐘烘祰閺囨潙顦?   */
  onReachBottom: function() {
    this.loadMore();
  }
});\n
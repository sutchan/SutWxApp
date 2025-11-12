锘?/ pages/user/followers.js
// 缁绗ｉ崚妤勩€冩い鐢告桨
import { showToast } from '../../utils/global';

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    followersList: [], // 缁绗ｉ崚妤勩€?    loading: false, // 閸旂姾娴囬悩鑸碘偓?    error: null, // 闁挎瑨顕ゆ穱鈩冧紖
    currentPage: 1, // 瑜版挸澧犳い鐢电垳
    pageSize: 10, // 濮ｅ繘銆夐弫浼村櫤
    hasMore: true // 閺勵垰鎯侀張澶嬫纯婢舵碍鏆熼幑?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    this.loadFollowersList();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function() {
    // 妞ょ敻娼伴弰鍓с仛閺冭泛鍩涢弬鐗堟殶閹?    if (this.data.followersList.length > 0) {
      this.refreshList();
    }
  },

  /**
   * 妞ょ敻娼伴惄绋垮彠娴滃娆㈡径鍕倞閸戣姤鏆?-閻╂垵鎯夐悽銊﹀煕娑撳濯洪崝銊ょ稊
   */
  onPullDownRefresh: function() {
    this.refreshList();
  },

  /**
   * 閸旂姾娴囩划澶夌閸掓銆?   */
  loadFollowersList: function(refresh = false) {
    const app = getApp();
    
    // 濡偓閺屻儲妲搁崥锕€鍑￠惂璇茬秿
    if (!app.isLoggedIn()) {
      wx.stopPullDownRefresh();
      this.setData({
        loading: false,
        error: '鐠囧嘲鍘涢惂璇茬秿',
        hasMore: false
      });
      showToast('鐠囧嘲鍘涢惂璇茬秿', 'none');
      return;
    }

    // 鐠佸墽鐤嗘い鐢电垳
    if (refresh) {
      this.setData({ currentPage: 1, hasMore: true, error: null });
    } else if (!this.data.hasMore) {
      wx.stopPullDownRefresh();
      return;
    }

    // 閺勫墽銇氶崝鐘烘祰閻樿埖鈧?    this.setData({ loading: true });

    // 鐠嬪啰鏁ら崗铏暈閺堝秴濮熼懢宄板絿缁绗ｉ崚妤勩€?    app.services.following.getMyFollowers({
      page: this.data.currentPage,
      per_page: this.data.pageSize
    })
    .then(res => {
      wx.stopPullDownRefresh();
      
      if (res.code === 200) {
        const newFollowers = res.data.list || [];
        const followersList = refresh ? newFollowers : [...this.data.followersList, ...newFollowers];
        
        this.setData({
          followersList: followersList,
          hasMore: newFollowers.length === this.data.pageSize,
          loading: false,
          error: null
        });
        
        // 婢х偛濮炴い鐢电垳
        if (!refresh && newFollowers.length > 0) {
          this.setData({ currentPage: this.data.currentPage + 1 });
        }
      } else {
        this.setData({
          loading: false,
          error: res.message || '閼惧嘲褰囩划澶夌閸掓銆冩径杈Е'
        });
      }
    })
    .catch(error => {
      wx.stopPullDownRefresh();
      console.error('閼惧嘲褰囩划澶夌閸掓銆冩径杈Е:', error);
      this.setData({
        loading: false,
        error: '缂冩垹绮堕柨娆掝嚖閿涘矁顕柌宥堢槸'
      });
    });
  },

  /**
   * 閸掗攱鏌婇崚妤勩€?   */
  refreshList: function() {
    this.loadFollowersList(true);
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  retryLoad: function() {
    this.refreshList();
  },

  /**
   * 閸旂姾娴囬弴鏉戭樋
   */
  loadMore: function() {
    if (!this.data.loading && this.data.hasMore) {
      this.loadFollowersList(false);
    }
  },

  /**
   * 鐠哄疇娴嗛崚鎵暏閹寸柉顕涢幆鍛淬€?   */
  navigateToUserProfile: function(e) {
    const userId = e.currentTarget.dataset.user_id;
    if (userId) {
      wx.navigateTo({
        url: `/pages/user/user-detail?id=${userId}`
      });
    }
  },

  /**
   * 閸忚櫕鏁為悽銊﹀煕
   */
  followUser: function(e) {
    const { id, index } = e.currentTarget.dataset;
    const app = getApp();
    
    // 閺勫墽銇氶崝鐘烘祰閻樿埖鈧?    wx.showLoading({ title: '閹垮秳缍旀稉? });
    
    // 鐠嬪啰鏁ら崗铏暈閺堝秴濮熸潻娑滎攽閸忚櫕鏁為幙宥勭稊
    app.services.following.followUser(id)
      .then(res => {
        wx.hideLoading();
        
        if (res.code === 200) {
          // 閺囧瓨鏌婄划澶夌閸掓銆冩稉顓犳畱閸忚櫕鏁為悩鑸碘偓?          const followersList = [...this.data.followersList];
          if (followersList[index]) {
            followersList[index].is_following = true;
          }
          this.setData({ followersList });
          
          showToast('閸忚櫕鏁為幋鎰');
        } else {
          showToast(res.message || '閸忚櫕鏁炴径杈Е', 'none');
        }
      })
      .catch(error => {
        wx.hideLoading();
        console.error('閸忚櫕鏁為悽銊﹀煕婢惰精瑙?', error);
        showToast('缂冩垹绮堕柨娆掝嚖閿涘矁顕柌宥堢槸', 'none');
      });
  }
});\n
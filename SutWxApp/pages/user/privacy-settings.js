锘?/ 閻劍鍩涢梾鎰潌鐠佸墽鐤嗘い鐢告桨闁槒绶?const app = getApp();
const { showToast } = app.global;

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    privacySettings: {
      allowComments: true, // 閸忎浇顔忕拠鍕啈
      allowFollow: true, // 閸忎浇顔忛崗铏暈
      showActivity: true, // 閺勫墽銇氬ú璇插З
      receiveNotifications: true, // 閹恒儲鏁归柅姘辩叀
      showLocation: false, // 閺勫墽銇氭担宥囩枂娣団剝浼?      shareDataWithPartners: false // 娑撳骸鎮庢担婊€绱导鏉戝彙娴滎偅鏆熼幑?    },
    loading: true, // 閺勵垰鎯佸锝呮躬閸旂姾娴?    saving: false, // 閺勵垰鎯佸锝呮躬娣囨繂鐡?    error: false, // 閺勵垰鎯侀崝鐘烘祰婢惰精瑙?    saveSuccess: false // 娣囨繂鐡ㄩ弰顖氭儊閹存劕濮?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function(options) {
    // 鐠佹澘缍嶆い鐢告桨鐠佸潡妫舵禍瀣╂
    app.analyticsService.track('page_view', {
      page: 'privacy_settings'
    });
    
    // 閸旂姾娴囬梾鎰潌鐠佸墽鐤?    this.loadPrivacySettings();
  },

  /**
   * 閸旂姾娴囬梾鎰潌鐠佸墽鐤?   */
  async loadPrivacySettings() {
    try {
      // 閺勫墽銇氶崝鐘烘祰閻樿埖鈧?      this.setData({
        loading: true,
        error: false
      });

      // 濡偓閺屻儳娅ヨぐ鏇犲Ц閹?      if (!app.isLoggedIn()) {
        this.setData({
          loading: false,
          error: true
        });
        showToast('鐠囧嘲鍘涢惂璇茬秿', 'none');
        return;
      }

      // 娴ｈ法鏁serService閼惧嘲褰囬梾鎰潌鐠佸墽鐤?      const result = await app.services.user.getUserPrivacySettings();
      
      // 閺囧瓨鏌婇梾鎰潌鐠佸墽鐤嗛弫鐗堝祦
      this.setData({
        privacySettings: result || this.data.privacySettings,
        loading: false,
        error: false
      });
    } catch (err) {
      this.setData({
        loading: false,
        error: true
      });
      console.error('閸旂姾娴囬梾鎰潌鐠佸墽鐤嗘径杈Е:', err);
    }
  },

  /**
   * 婢跺嫮鎮婄拠閿嬬湴闁挎瑨顕?   * @param {Object} err 闁挎瑨顕ょ€电钖?   */
  handleRequestError(err) {
    let errorMsg = '鐠囬攱鐪版径杈Е';
    
    if (err.message) {
      errorMsg = err.message;
    } else if (err.data && err.data.message) {
      errorMsg = err.data.message;
    }
    
    showToast(errorMsg, 'none');
    
    this.setData({
      loading: false,
      error: true,
      saving: false
    });
  },

  /**
   * 閸掑洦宕茬拋鍓х枂妞?   * @param {Object} e 娴滃娆㈢€电钖?   */
  toggleSetting(e) {
    const { setting } = e.currentTarget.dataset;
    const { privacySettings } = this.data;
    const previousValue = privacySettings[setting];
    
    // 閺囧瓨鏌婄拋鍓х枂閸?    privacySettings[setting] = !previousValue;
    
    this.setData({
      privacySettings,
      saveSuccess: false // 闁插秶鐤嗘穱婵嗙摠閹存劕濮涢悩鑸碘偓?    });
    
    // 鐠佹澘缍嶇拋鍓х枂閸欐ɑ娲挎禍瀣╂
    app.analyticsService.track('privacy_setting_toggled', {
      setting: setting,
      value: privacySettings[setting]
    });
  },

  /**
   * 娣囨繂鐡ㄩ梾鎰潌鐠佸墽鐤?   */
  async savePrivacySettings() {
    try {
      // 閺勫墽銇氭穱婵嗙摠閻樿埖鈧?      this.setData({
        saving: true,
        saveSuccess: false
      });

      // 濡偓閺屻儳娅ヨぐ鏇犲Ц閹?      if (!app.isLoggedIn()) {
        this.setData({
          saving: false
        });
        showToast('鐠囧嘲鍘涢惂璇茬秿', 'none');
        return;
      }

      // 鐠佹澘缍嶆穱婵嗙摠鐠佸墽鐤嗘禍瀣╂
      app.analyticsService.track('privacy_settings_saved', {
        settings: this.data.privacySettings
      });
      
      // 娴ｈ法鏁serService娣囨繂鐡ㄩ梾鎰潌鐠佸墽鐤?      await app.services.user.updateUserPrivacySettings(this.data.privacySettings);
      
      this.setData({
        saving: false,
        saveSuccess: true
      });
      
      // 閺勫墽銇氭穱婵嗙摠閹存劕濮涢幓鎰仛
      showToast('鐠佸墽鐤嗘穱婵嗙摠閹存劕濮?, 'success');
    } catch (err) {
      this.setData({
        saving: false
      });
      showToast(err.message || '娣囨繂鐡ㄦ径杈Е閿涘矁顕柌宥堢槸', 'none');
    }
  },

  /**
   * 闁插秷鐦崝鐘烘祰
   */
  retryLoad: function() {
    // 鐠佹澘缍嶉柌宥堢槸閸旂姾娴囨禍瀣╂
    app.analyticsService.track('retry_loading', {
      page: 'privacy_settings'
    });
    
    this.loadPrivacySettings();
  }
});\n
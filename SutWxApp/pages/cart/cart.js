锘?/ cart.js - 鐠愵厾澧挎潪锕傘€夐棃?
// 鐎电厧鍙嗙拹顓犲⒖鏉烇附婀囬崝?import cartService from '../../utils/cart-service';
import { showToast, showConfirm, showLoading, hideLoading } from '../../utils/global';
import { validateId, validateCartItemQuantity } from '../../utils/validator';

Page({
  /**
   * 妞ょ敻娼伴惃鍕灥婵鏆熼幑?   */
  data: {
    cartItems: [],
    totalPrice: 0,
    selectedCount: 0,
    allSelected: false,
    loading: false,
    refreshing: false,
    isEditing: false,
    checkedGoodsList: [],
    submitting: false // 闂冨弶顒涢柌宥咁槻閹绘劒姘?  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   */
  onLoad: function (options) {
    this.loadCartData();
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閺勫墽銇?   */
  onShow: function () {
    // 妞ょ敻娼伴弰鍓с仛閺冨爼鍣搁弬鏉垮鏉炲€熷枠閻椻晞婧呴弫鐗堝祦
    this.loadCartData();
  },

  /**
   * 妞ょ敻娼伴崡姝屾祰閸撳秵绔婚悶鍡氼嚞濮?   */
  onUnload: function() {
    // 妞ょ敻娼伴崡姝屾祰閺冭泛褰囧☉鍫熸弓鐎瑰本鍨氶惃鍕嚞濮瑰偊绱濋柆鍨帳閸愬懎鐡ㄥ▔鍕础
    cartService.clearCartCache();
  },

  /**
   * 娑撳濯洪崚閿嬫煀
   */
  onPullDownRefresh: function() {
    this.setData({
      refreshing: true
    });
    // 瀵搫鍩楅崚閿嬫煀鐠愵厾澧挎潪锔芥殶閹?    this.loadCartData(true);
  },

  /**
   * 閸旂姾娴囩拹顓犲⒖鏉烇附鏆熼幑?   */
  loadCartData: async function (forceRefresh = false) {
    try {
      this.setData({
        loading: true
      });
      
      const cartItems = await cartService.getCartItems({ forceRefresh });
      
      // 濡偓閺屻儱鏅㈤崫浣哄Ц閹緤绱欐稉瀣仸閵嗕礁绨辩€涙ü绗夌搾宕囩搼閿?      this.checkCartItemsStatus(cartItems);
      
      this.setData({
        cartItems: cartItems || []
      });
      
      // 閸掓繂顫愰崠鏍偓澶夎厬閻樿埖鈧?      this.initSelectedState();
      
      // 鐠侊紕鐣婚幀璁崇幆閸滃本鏆熼柌?      this.calculateTotal();
      
    } catch (error) {
      console.error('閸旂姾娴囩拹顓犲⒖鏉烇附鏆熼幑顔笺亼鐠?', error);
      showToast('閸旂姾娴囩拹顓犲⒖鏉烇箑銇戠拹銉礉鐠囩兘鍣哥拠?, { icon: 'none' });
    } finally {
      this.setData({
        loading: false,
        refreshing: false
      });
    }
  },

  /**
   * 濡偓閺屻儴鍠橀悧鈺勬簠閸熷棗鎼ч悩鑸碘偓?   */
  checkCartItemsStatus: function (cartItems) {
    // 濡偓閺屻儱鏅㈤崫浣规Ц閸氾箑褰查悽銊ｂ偓浣规Ц閸氾缚绗呴弸鍓佺搼
    cartItems.forEach(item => {
      // 闁插秶鐤嗛悩鑸碘偓浣圭垼韫?      item.unavailable = false;
      item.outOfStock = false;
      item.overStock = false;
      item.unavailableReason = '';
      
      if (!item.available || item.status !== 1) {
        item.unavailable = true;
        item.unavailableReason = item.statusText || '閸熷棗鎼у韫瑓閺嬭埖鍨ㄦ稉宥呭讲閻?;
      } else if (item.stock <= 0) {
        item.outOfStock = true;
        item.unavailableReason = '閸熷棗鎼ф惔鎾崇摠娑撳秷鍐?;
      } else if (item.quantity > item.stock) {
        item.overStock = true;
        item.availableQuantity = item.stock;
      }
    });
  },

  /**
   * 閸掓繂顫愰崠鏍偓澶夎厬閻樿埖鈧?   */
  initSelectedState: function () {
    const cartItems = [...this.data.cartItems];
    
    // 姒涙顓婚柅澶夎厬閸欘垳鏁ら惃鍕櫌閸?    cartItems.forEach(item => {
      if (!item.unavailable && !item.outOfStock) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
    
    this.setData({
      cartItems
    });
    
    // 濡偓閺屻儲妲搁崥锕€鍙忛柅?    this.checkAllSelected();
  },

  /**
   * 濡偓閺屻儲妲搁崥锕€鍙忛柅?   */
  checkAllSelected: function () {
    const availableItems = this.data.cartItems.filter(item => !item.unavailable && !item.outOfStock);
    
    if (availableItems.length === 0) {
      this.setData({
        allSelected: false
      });
      return;
    }
    
    const allSelected = availableItems.every(item => item.selected);
    
    this.setData({
      allSelected
    });
  },

  /**
   * 閸忋劑鈧?閸欐牗绉烽崗銊┾偓?   */
  toggleAllSelected: function () {
    const allSelected = !this.data.allSelected;
    const cartItems = [...this.data.cartItems];
    
    // 閺囧瓨鏌婇柅澶夎厬閻樿埖鈧?    cartItems.forEach(item => {
      if (!item.unavailable && !item.outOfStock) {
        item.selected = allSelected;
      }
    });
    
    this.setData({
      cartItems,
      allSelected
    });
    
    // 鐠侊紕鐣婚幀璁崇幆
    this.calculateTotal();
  },

  /**
   * 閸掑洦宕查崯鍡楁惂闁鑵戦悩鑸碘偓?   */
  toggleItemSelected: function (e) {
    const index = e.currentTarget.dataset.index;
    const cartItems = [...this.data.cartItems];
    
    // 閸掑洦宕查柅澶夎厬閻樿埖鈧?    cartItems[index].selected = !cartItems[index].selected;
    
    this.setData({
      cartItems
    });
    
    // 濡偓閺屻儲妲搁崥锕€鍙忛柅?    this.checkAllSelected();
    
    // 鐠侊紕鐣婚幀璁崇幆
    this.calculateTotal();
  },

  /**
   * 婢х偛濮為崯鍡楁惂閺佷即鍣?   */
  increaseQuantity: async function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const item = this.data.cartItems[index];
      
      // 濡偓閺屻儱鏅㈤崫浣规Ц閸氾箑褰查悽?      if (item.unavailable || item.outOfStock) {
        return;
      }
      
      // 濡偓閺屻儱绨辩€涙﹢妾洪崚?      if (item.quantity >= item.stock) {
        showToast('瀹歌尪鎻崚鐗堟付婢堆冪氨鐎?, { icon: 'none' });
        return;
      }
      
      const newQuantity = item.quantity + 1;
      
      // 閺佺増宓佹宀冪槈
      validateCartItemQuantity(newQuantity);
      
      // 閺囧瓨鏌奤I
      this.setData({
        [`cartItems[${index}].quantity`]: newQuantity,
        [`cartItems[${index}].loading`]: true
      });
      
      // 閺囧瓨鏌婄拹顓犲⒖鏉?      await cartService.updateCartItem(item.id, newQuantity);
      
      // 鐠侊紕鐣婚幀璁崇幆
      this.calculateTotal();
      
    } catch (error) {
      console.error('婢х偛濮為崯鍡楁惂閺佷即鍣烘径杈Е:', error);
      showToast(error.message || '閺囧瓨鏌婃径杈Е閿涘矁顕柌宥堢槸', { icon: 'none' });
      
      // 閹垹顦查崢鐔告殶闁?      const index = e.currentTarget.dataset.index;
      this.setData({
        [`cartItems[${index}].loading`]: false
      });
      
      // 闁插秵鏌婇崝鐘烘祰閺佺増宓佹禒銉р€樻穱婵嗗櫙绾喗鈧?      this.loadCartData();
    }
  },

  /**
   * 閸戝繐鐨崯鍡楁惂閺佷即鍣?   */
  decreaseQuantity: async function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const item = this.data.cartItems[index];
      
      // 濡偓閺屻儲妲搁崥锔胯礋閺堚偓鐏忓繐鈧?      if (item.quantity <= 1) {
        return;
      }
      
      const newQuantity = item.quantity - 1;
      
      // 閺佺増宓佹宀冪槈
      validateCartItemQuantity(newQuantity);
      
      // 閺囧瓨鏌奤I
      this.setData({
        [`cartItems[${index}].quantity`]: newQuantity,
        [`cartItems[${index}].loading`]: true
      });
      
      // 閺囧瓨鏌婄拹顓犲⒖鏉?      await cartService.updateCartItem(item.id, newQuantity);
      
      // 鐠侊紕鐣婚幀璁崇幆
      this.calculateTotal();
      
    } catch (error) {
      console.error('閸戝繐鐨崯鍡楁惂閺佷即鍣烘径杈Е:', error);
      showToast(error.message || '閺囧瓨鏌婃径杈Е閿涘矁顕柌宥堢槸', { icon: 'none' });
      
      // 閹垹顦查崢鐔告殶闁?      const index = e.currentTarget.dataset.index;
      this.setData({
        [`cartItems[${index}].loading`]: false
      });
      
      // 闁插秵鏌婇崝鐘烘祰閺佺増宓佹禒銉р€樻穱婵嗗櫙绾喗鈧?      this.loadCartData();
    }
  },

  /**
   * 閸掔娀娅庣拹顓犲⒖鏉烇箑鏅㈤崫?   */
  deleteCartItem: async function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const item = this.data.cartItems[index];
      
      // 閺勫墽銇氱涵顔款吇鐎电鐦藉?      await showConfirm('绾喛顓绘禒搴ゅ枠閻椻晞婧呮稉顓犘╅梽銈堫嚉閸熷棗鎼ч崥妤嬬吹', '绾喛顓婚崚鐘绘珟', '閸欐牗绉?);
      
      showLoading('濮濓絽婀崚鐘绘珟...');
      
      // 閸掔娀娅庨崯鍡楁惂
      await cartService.deleteCartItem(item.id);
      
      // 閺囧瓨鏌婇張顒€婀撮弫鐗堝祦
      const cartItems = [...this.data.cartItems];
      cartItems.splice(index, 1);
      
      this.setData({
        cartItems
      });
      
      // 鐠侊紕鐣婚幀璁崇幆
      this.calculateTotal();
      
      // 濡偓閺屻儲妲搁崥锕€鍙忛柅?      this.checkAllSelected();
      
      showToast('閸掔娀娅庨幋鎰');
      
    } catch (error) {
      console.error('閸掔娀娅庣拹顓犲⒖鏉烇箑鏅㈤崫浣搞亼鐠?', error);
      if (error.message !== 'cancel') {
        showToast(error.message || '閸掔娀娅庢径杈Е閿涘矁顕柌宥堢槸', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 閹靛綊鍣洪崚鐘绘珟闁鑵戦惃鍕櫌閸?   */
  deleteSelectedItems: async function () {
    try {
      // 閼惧嘲褰囬柅澶夎厬閻ㄥ嫬鏅㈤崫?      const selectedItems = this.data.cartItems.filter(item => item.selected);
      
      if (selectedItems.length === 0) {
        showToast('鐠囩兘鈧瀚ㄧ憰浣稿灩闂勩倗娈戦崯鍡楁惂', { icon: 'none' });
        return;
      }
      
      // 閺勫墽銇氱涵顔款吇鐎电鐦藉?      await showConfirm(`绾喛顓婚崚鐘绘珟闁鑵戦惃?{selectedItems.length}娴犺泛鏅㈤崫浣告偋閿涚剫, '绾喛顓婚崚鐘绘珟', '閸欐牗绉?);
      
      showLoading('濮濓絽婀崚鐘绘珟...');
      
      // 閹靛綊鍣洪崚鐘绘珟閸熷棗鎼?      const itemIds = selectedItems.map(item => item.id);
      await cartService.deleteCartItems(itemIds);
      
      // 閺囧瓨鏌婇張顒€婀撮弫鐗堝祦
      const cartItems = this.data.cartItems.filter(item => !item.selected);
      
      this.setData({
        cartItems,
        allSelected: false,
        isEditing: false
      });
      
      // 鐠侊紕鐣婚幀璁崇幆
      this.calculateTotal();
      
      showToast('閸掔娀娅庨幋鎰');
      
    } catch (error) {
      console.error('閹靛綊鍣洪崚鐘绘珟鐠愵厾澧挎潪锕€鏅㈤崫浣搞亼鐠?', error);
      if (error.message !== 'cancel') {
        showToast(error.message || '閸掔娀娅庢径杈Е閿涘矁顕柌宥堢槸', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 濞撳懐鈹栫拹顓犲⒖鏉?   */
  clearCart: async function () {
    try {
      // 閺勫墽銇氱涵顔款吇鐎电鐦藉?      await showConfirm('绾喛顓诲〒鍛敄鐠愵厾澧挎潪锕€鎮ч敍鐔割劃閹垮秳缍旀稉宥呭讲閹垹顦查妴?, '绾喛顓诲〒鍛敄', '閸欐牗绉?);
      
      showLoading('濮濓絽婀〒鍛敄鐠愵厾澧挎潪?..');
      
      // 濞撳懐鈹栫拹顓犲⒖鏉?      await cartService.clearCart();
      
      // 閺囧瓨鏌婇張顒€婀撮弫鐗堝祦
      this.setData({
        cartItems: [],
        totalPrice: 0,
        selectedCount: 0,
        allSelected: false,
        checkedGoodsList: []
      });
      
      showToast('鐠愵厾澧挎潪锕€鍑″〒鍛敄');
      
    } catch (error) {
      console.error('濞撳懐鈹栫拹顓犲⒖鏉烇箑銇戠拹?', error);
      if (error.message !== 'cancel') {
        showToast(error.message || '濞撳懐鈹栨径杈Е閿涘矁顕柌宥堢槸', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 鐏忓棗鏅㈤崫浣盒╅懛铏暪閽?   */
  moveToFavorite: async function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const item = this.data.cartItems[index];
      
      // 閺勫墽銇氱涵顔款吇鐎电鐦藉?      await showConfirm('绾喛顓荤亸鍡橆劃閸熷棗鎼уǎ璇插閸掔増鏁归挊蹇撱仚閸氭绱靛ǎ璇插閸氬簼绱版禒搴ゅ枠閻椻晞婧呮稉顓犘╅梽銈冣偓?, '绾喛顓诲ǎ璇插', '閸欐牗绉?);
      
      showLoading('濮濓絽婀ǎ璇插閸掔増鏁归挊蹇撱仚...');
      
      // 缁夋槒鍤﹂弨鎯版
      await cartService.moveToFavorite(item.id);
      
      // 閺囧瓨鏌婇張顒€婀撮弫鐗堝祦
      const cartItems = [...this.data.cartItems];
      cartItems.splice(index, 1);
      
      this.setData({
        cartItems
      });
      
      // 鐠侊紕鐣婚幀璁崇幆
      this.calculateTotal();
      
      // 濡偓閺屻儲妲搁崥锕€鍙忛柅?      this.checkAllSelected();
      
      showToast('瀹稿弶鍧婇崝鐘插煂閺€鎯版婢?);
      
    } catch (error) {
      console.error('缁夋槒鍤﹂弨鎯版婢剁懓銇戠拹?', error);
      if (error.message !== 'cancel') {
        showToast(error.message || '濞ｈ濮炴径杈Е閿涘矁顕柌宥堢槸', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 鐠侊紕鐣婚幀璁崇幆閸滃矂鈧鑵戦弫浼村櫤
   */
  calculateTotal: function () {
    const cartItems = this.data.cartItems;
    let totalPrice = 0;
    let selectedCount = 0;
    const checkedGoodsList = [];
    
    cartItems.forEach(item => {
      if (item.selected && !item.unavailable && !item.outOfStock) {
        totalPrice += item.price * item.quantity;
        selectedCount += item.quantity;
        checkedGoodsList.push(item);
      }
    });
    
    this.setData({
      totalPrice: totalPrice.toFixed(2),
      selectedCount,
      checkedGoodsList
    });
  },

  /**
   * 缂佹挾鐣?   */
  checkout: async function () {
    try {
      // 闂冨弶顒涢柌宥咁槻閹绘劒姘?      if (this.data.submitting) {
        return;
      }
      
      this.setData({
        submitting: true
      });
      
      // 閼惧嘲褰囬柅澶夎厬閻ㄥ嫬鏅㈤崫?      const selectedItems = this.data.cartItems.filter(item => item.selected);
      
      if (selectedItems.length === 0) {
        showToast('鐠囩兘鈧瀚ㄧ憰浣虹波缁犳娈戦崯鍡楁惂', { icon: 'none' });
        return;
      }
      
      // 濡偓閺屻儵鈧鑵戦崯鍡楁惂閺勵垰鎯侀崣顖滄暏
      const unavailableItems = selectedItems.filter(item => item.unavailable || item.outOfStock);
      if (unavailableItems.length > 0) {
        showToast('闁鑵戦惃鍕櫌閸濅椒鑵戦張澶夌瑝閸欘垳鏁ら幋鏍х氨鐎涙ü绗夌搾宕囨畱閸熷棗鎼?, { icon: 'none' });
        return;
      }
      
      // 濡偓閺屻儱绨辩€?      const overStockItems = selectedItems.filter(item => item.overStock);
      if (overStockItems.length > 0) {
        showToast('闁劌鍨庨崯鍡楁惂鎼存挸鐡ㄦ稉宥堝喕閿涘矁顕拫鍐╂殻閺佷即鍣洪崥搴″晙缂佹挾鐣?, { icon: 'none' });
        return;
      }
      
      showLoading('濮濓絽婀Λ鈧弻銉ョ氨鐎?..');
      
      // 娴滃本顐煎Λ鈧弻銉ョ氨鐎涙﹫绱欑€圭偞妞傚Λ鈧弻銉礆
      const stockResult = await cartService.checkCartStock(selectedItems);
      
      if (stockResult.out_of_stock && stockResult.out_of_stock.length > 0) {
        showToast('闁劌鍨庨崯鍡楁惂鎼存挸鐡ㄦ稉宥堝喕閿涘矁顕崚閿嬫煀鐠愵厾澧挎潪锕€鎮楅柌宥堢槸', { icon: 'none' });
        // 闁插秵鏌婇崝鐘烘祰閺佺増宓?        this.loadCartData(true);
        return;
      }
      
      // 閺嬪嫬缂撶拋銏犲礋閺佺増宓?      const orderData = {
        items: selectedItems.map(item => ({
          cart_item_id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          sku_id: item.sku_id
        }))
      };
      
      // 鐠哄疇娴嗛崚鎵波缁犳銆夐棃?      wx.navigateTo({
        url: '/pages/checkout/checkout?orderData=' + encodeURIComponent(JSON.stringify(orderData)),
        fail: (err) => {
          console.error('鐠哄疇娴嗛崚鎵波缁犳銆夐棃銏犮亼鐠?', err);
          showToast('鐠哄疇娴嗘径杈Е閿涘矁顕柌宥堢槸', { icon: 'none' });
        }
      });
      
    } catch (error) {
      console.error('缂佹挾鐣绘径杈Е:', error);
      showToast(error.message || '缂佹挾鐣绘径杈Е閿涘矁顕柌宥堢槸', { icon: 'none' });
    } finally {
      hideLoading();
      this.setData({
        submitting: false
      });
    }
  },

  /**
   * 缂傛牞绶Ο鈥崇础閸掑洦宕?   */
  toggleEditMode: function() {
    this.setData({
      isEditing: !this.data.isEditing
    });
  },

  /**
   * 鐠哄疇娴嗛崚鏉挎櫌閸濅浇顕涢幆?   */
  navigateToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.productId;
    wx.navigateTo({
      url: `/pages/product/detail?id=${productId}`
    });
  }
});\n
// cart.js - 璐墿杞﹂〉闈?
// 瀵煎叆璐墿杞︽湇鍔?import cartService from '../../utils/cart-service';
import { showToast, showConfirm, showLoading, hideLoading } from '../../utils/global';
import { validateId, validateCartItemQuantity } from '../../utils/validator';

Page({
  /**
   * 椤甸潰鐨勫垵濮嬫暟鎹?   */
  data: {
    cartItems: [],
    totalPrice: 0,
    selectedCount: 0,
    allSelected: false,
    loading: false,
    refreshing: false,
    isEditing: false,
    checkedGoodsList: [],
    submitting: false // 闃叉閲嶅鎻愪氦
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鍔犺浇
   */
  onLoad: function (options) {
    this.loadCartData();
  },

  /**
   * 鐢熷懡鍛ㄦ湡鍑芥暟--鐩戝惉椤甸潰鏄剧ず
   */
  onShow: function () {
    // 椤甸潰鏄剧ず鏃堕噸鏂板姞杞借喘鐗╄溅鏁版嵁
    this.loadCartData();
  },

  /**
   * 椤甸潰鍗歌浇鍓嶆竻鐞嗚姹?   */
  onUnload: function() {
    // 椤甸潰鍗歌浇鏃跺彇娑堟湭瀹屾垚鐨勮姹傦紝閬垮厤鍐呭瓨娉勬紡
    cartService.clearCartCache();
  },

  /**
   * 涓嬫媺鍒锋柊
   */
  onPullDownRefresh: function() {
    this.setData({
      refreshing: true
    });
    // 寮哄埗鍒锋柊璐墿杞︽暟鎹?    this.loadCartData(true);
  },

  /**
   * 鍔犺浇璐墿杞︽暟鎹?   */
  loadCartData: async function (forceRefresh = false) {
    try {
      this.setData({
        loading: true
      });
      
      const cartItems = await cartService.getCartItems({ forceRefresh });
      
      // 妫€鏌ュ晢鍝佺姸鎬侊紙涓嬫灦銆佸簱瀛樹笉瓒崇瓑锛?      this.checkCartItemsStatus(cartItems);
      
      this.setData({
        cartItems: cartItems || []
      });
      
      // 鍒濆鍖栭€変腑鐘舵€?      this.initSelectedState();
      
      // 璁＄畻鎬讳环鍜屾暟閲?      this.calculateTotal();
      
    } catch (error) {
      console.error('鍔犺浇璐墿杞︽暟鎹け璐?', error);
      showToast('鍔犺浇璐墿杞﹀け璐ワ紝璇烽噸璇?, { icon: 'none' });
    } finally {
      this.setData({
        loading: false,
        refreshing: false
      });
    }
  },

  /**
   * 妫€鏌ヨ喘鐗╄溅鍟嗗搧鐘舵€?   */
  checkCartItemsStatus: function (cartItems) {
    // 妫€鏌ュ晢鍝佹槸鍚﹀彲鐢ㄣ€佹槸鍚︿笅鏋剁瓑
    cartItems.forEach(item => {
      // 閲嶇疆鐘舵€佹爣蹇?      item.unavailable = false;
      item.outOfStock = false;
      item.overStock = false;
      item.unavailableReason = '';
      
      if (!item.available || item.status !== 1) {
        item.unavailable = true;
        item.unavailableReason = item.statusText || '鍟嗗搧宸蹭笅鏋舵垨涓嶅彲鐢?;
      } else if (item.stock <= 0) {
        item.outOfStock = true;
        item.unavailableReason = '鍟嗗搧搴撳瓨涓嶈冻';
      } else if (item.quantity > item.stock) {
        item.overStock = true;
        item.availableQuantity = item.stock;
      }
    });
  },

  /**
   * 鍒濆鍖栭€変腑鐘舵€?   */
  initSelectedState: function () {
    const cartItems = [...this.data.cartItems];
    
    // 榛樿閫変腑鍙敤鐨勫晢鍝?    cartItems.forEach(item => {
      if (!item.unavailable && !item.outOfStock) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
    
    this.setData({
      cartItems
    });
    
    // 妫€鏌ユ槸鍚﹀叏閫?    this.checkAllSelected();
  },

  /**
   * 妫€鏌ユ槸鍚﹀叏閫?   */
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
   * 鍏ㄩ€?鍙栨秷鍏ㄩ€?   */
  toggleAllSelected: function () {
    const allSelected = !this.data.allSelected;
    const cartItems = [...this.data.cartItems];
    
    // 鏇存柊閫変腑鐘舵€?    cartItems.forEach(item => {
      if (!item.unavailable && !item.outOfStock) {
        item.selected = allSelected;
      }
    });
    
    this.setData({
      cartItems,
      allSelected
    });
    
    // 璁＄畻鎬讳环
    this.calculateTotal();
  },

  /**
   * 鍒囨崲鍟嗗搧閫変腑鐘舵€?   */
  toggleItemSelected: function (e) {
    const index = e.currentTarget.dataset.index;
    const cartItems = [...this.data.cartItems];
    
    // 鍒囨崲閫変腑鐘舵€?    cartItems[index].selected = !cartItems[index].selected;
    
    this.setData({
      cartItems
    });
    
    // 妫€鏌ユ槸鍚﹀叏閫?    this.checkAllSelected();
    
    // 璁＄畻鎬讳环
    this.calculateTotal();
  },

  /**
   * 澧炲姞鍟嗗搧鏁伴噺
   */
  increaseQuantity: async function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const item = this.data.cartItems[index];
      
      // 妫€鏌ュ晢鍝佹槸鍚﹀彲鐢?      if (item.unavailable || item.outOfStock) {
        return;
      }
      
      // 妫€鏌ュ簱瀛橀檺鍒?      if (item.quantity >= item.stock) {
        showToast('宸茶揪鍒版渶澶у簱瀛?, { icon: 'none' });
        return;
      }
      
      const newQuantity = item.quantity + 1;
      
      // 鏁版嵁楠岃瘉
      validateCartItemQuantity(newQuantity);
      
      // 鏇存柊UI
      this.setData({
        [`cartItems[${index}].quantity`]: newQuantity,
        [`cartItems[${index}].loading`]: true
      });
      
      // 鏇存柊璐墿杞?      await cartService.updateCartItem(item.id, newQuantity);
      
      // 璁＄畻鎬讳环
      this.calculateTotal();
      
    } catch (error) {
      console.error('澧炲姞鍟嗗搧鏁伴噺澶辫触:', error);
      showToast(error.message || '鏇存柊澶辫触锛岃閲嶈瘯', { icon: 'none' });
      
      // 鎭㈠鍘熸暟閲?      const index = e.currentTarget.dataset.index;
      this.setData({
        [`cartItems[${index}].loading`]: false
      });
      
      // 閲嶆柊鍔犺浇鏁版嵁浠ョ‘淇濆噯纭€?      this.loadCartData();
    }
  },

  /**
   * 鍑忓皯鍟嗗搧鏁伴噺
   */
  decreaseQuantity: async function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const item = this.data.cartItems[index];
      
      // 妫€鏌ユ槸鍚︿负鏈€灏忓€?      if (item.quantity <= 1) {
        return;
      }
      
      const newQuantity = item.quantity - 1;
      
      // 鏁版嵁楠岃瘉
      validateCartItemQuantity(newQuantity);
      
      // 鏇存柊UI
      this.setData({
        [`cartItems[${index}].quantity`]: newQuantity,
        [`cartItems[${index}].loading`]: true
      });
      
      // 鏇存柊璐墿杞?      await cartService.updateCartItem(item.id, newQuantity);
      
      // 璁＄畻鎬讳环
      this.calculateTotal();
      
    } catch (error) {
      console.error('鍑忓皯鍟嗗搧鏁伴噺澶辫触:', error);
      showToast(error.message || '鏇存柊澶辫触锛岃閲嶈瘯', { icon: 'none' });
      
      // 鎭㈠鍘熸暟閲?      const index = e.currentTarget.dataset.index;
      this.setData({
        [`cartItems[${index}].loading`]: false
      });
      
      // 閲嶆柊鍔犺浇鏁版嵁浠ョ‘淇濆噯纭€?      this.loadCartData();
    }
  },

  /**
   * 鍒犻櫎璐墿杞﹀晢鍝?   */
  deleteCartItem: async function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const item = this.data.cartItems[index];
      
      // 鏄剧ず纭瀵硅瘽妗?      await showConfirm('纭浠庤喘鐗╄溅涓Щ闄よ鍟嗗搧鍚楋紵', '纭鍒犻櫎', '鍙栨秷');
      
      showLoading('姝ｅ湪鍒犻櫎...');
      
      // 鍒犻櫎鍟嗗搧
      await cartService.deleteCartItem(item.id);
      
      // 鏇存柊鏈湴鏁版嵁
      const cartItems = [...this.data.cartItems];
      cartItems.splice(index, 1);
      
      this.setData({
        cartItems
      });
      
      // 璁＄畻鎬讳环
      this.calculateTotal();
      
      // 妫€鏌ユ槸鍚﹀叏閫?      this.checkAllSelected();
      
      showToast('鍒犻櫎鎴愬姛');
      
    } catch (error) {
      console.error('鍒犻櫎璐墿杞﹀晢鍝佸け璐?', error);
      if (error.message !== 'cancel') {
        showToast(error.message || '鍒犻櫎澶辫触锛岃閲嶈瘯', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 鎵归噺鍒犻櫎閫変腑鐨勫晢鍝?   */
  deleteSelectedItems: async function () {
    try {
      // 鑾峰彇閫変腑鐨勫晢鍝?      const selectedItems = this.data.cartItems.filter(item => item.selected);
      
      if (selectedItems.length === 0) {
        showToast('璇烽€夋嫨瑕佸垹闄ょ殑鍟嗗搧', { icon: 'none' });
        return;
      }
      
      // 鏄剧ず纭瀵硅瘽妗?      await showConfirm(`纭鍒犻櫎閫変腑鐨?{selectedItems.length}浠跺晢鍝佸悧锛焋, '纭鍒犻櫎', '鍙栨秷');
      
      showLoading('姝ｅ湪鍒犻櫎...');
      
      // 鎵归噺鍒犻櫎鍟嗗搧
      const itemIds = selectedItems.map(item => item.id);
      await cartService.deleteCartItems(itemIds);
      
      // 鏇存柊鏈湴鏁版嵁
      const cartItems = this.data.cartItems.filter(item => !item.selected);
      
      this.setData({
        cartItems,
        allSelected: false,
        isEditing: false
      });
      
      // 璁＄畻鎬讳环
      this.calculateTotal();
      
      showToast('鍒犻櫎鎴愬姛');
      
    } catch (error) {
      console.error('鎵归噺鍒犻櫎璐墿杞﹀晢鍝佸け璐?', error);
      if (error.message !== 'cancel') {
        showToast(error.message || '鍒犻櫎澶辫触锛岃閲嶈瘯', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 娓呯┖璐墿杞?   */
  clearCart: async function () {
    try {
      // 鏄剧ず纭瀵硅瘽妗?      await showConfirm('纭娓呯┖璐墿杞﹀悧锛熸鎿嶄綔涓嶅彲鎭㈠銆?, '纭娓呯┖', '鍙栨秷');
      
      showLoading('姝ｅ湪娓呯┖璐墿杞?..');
      
      // 娓呯┖璐墿杞?      await cartService.clearCart();
      
      // 鏇存柊鏈湴鏁版嵁
      this.setData({
        cartItems: [],
        totalPrice: 0,
        selectedCount: 0,
        allSelected: false,
        checkedGoodsList: []
      });
      
      showToast('璐墿杞﹀凡娓呯┖');
      
    } catch (error) {
      console.error('娓呯┖璐墿杞﹀け璐?', error);
      if (error.message !== 'cancel') {
        showToast(error.message || '娓呯┖澶辫触锛岃閲嶈瘯', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 灏嗗晢鍝佺Щ鑷虫敹钘?   */
  moveToFavorite: async function (e) {
    try {
      const index = e.currentTarget.dataset.index;
      const item = this.data.cartItems[index];
      
      // 鏄剧ず纭瀵硅瘽妗?      await showConfirm('纭灏嗘鍟嗗搧娣诲姞鍒版敹钘忓す鍚楋紵娣诲姞鍚庝細浠庤喘鐗╄溅涓Щ闄ゃ€?, '纭娣诲姞', '鍙栨秷');
      
      showLoading('姝ｅ湪娣诲姞鍒版敹钘忓す...');
      
      // 绉昏嚦鏀惰棌
      await cartService.moveToFavorite(item.id);
      
      // 鏇存柊鏈湴鏁版嵁
      const cartItems = [...this.data.cartItems];
      cartItems.splice(index, 1);
      
      this.setData({
        cartItems
      });
      
      // 璁＄畻鎬讳环
      this.calculateTotal();
      
      // 妫€鏌ユ槸鍚﹀叏閫?      this.checkAllSelected();
      
      showToast('宸叉坊鍔犲埌鏀惰棌澶?);
      
    } catch (error) {
      console.error('绉昏嚦鏀惰棌澶瑰け璐?', error);
      if (error.message !== 'cancel') {
        showToast(error.message || '娣诲姞澶辫触锛岃閲嶈瘯', { icon: 'none' });
      }
    } finally {
      hideLoading();
    }
  },

  /**
   * 璁＄畻鎬讳环鍜岄€変腑鏁伴噺
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
   * 缁撶畻
   */
  checkout: async function () {
    try {
      // 闃叉閲嶅鎻愪氦
      if (this.data.submitting) {
        return;
      }
      
      this.setData({
        submitting: true
      });
      
      // 鑾峰彇閫変腑鐨勫晢鍝?      const selectedItems = this.data.cartItems.filter(item => item.selected);
      
      if (selectedItems.length === 0) {
        showToast('璇烽€夋嫨瑕佺粨绠楃殑鍟嗗搧', { icon: 'none' });
        return;
      }
      
      // 妫€鏌ラ€変腑鍟嗗搧鏄惁鍙敤
      const unavailableItems = selectedItems.filter(item => item.unavailable || item.outOfStock);
      if (unavailableItems.length > 0) {
        showToast('閫変腑鐨勫晢鍝佷腑鏈変笉鍙敤鎴栧簱瀛樹笉瓒崇殑鍟嗗搧', { icon: 'none' });
        return;
      }
      
      // 妫€鏌ュ簱瀛?      const overStockItems = selectedItems.filter(item => item.overStock);
      if (overStockItems.length > 0) {
        showToast('閮ㄥ垎鍟嗗搧搴撳瓨涓嶈冻锛岃璋冩暣鏁伴噺鍚庡啀缁撶畻', { icon: 'none' });
        return;
      }
      
      showLoading('姝ｅ湪妫€鏌ュ簱瀛?..');
      
      // 浜屾妫€鏌ュ簱瀛橈紙瀹炴椂妫€鏌ワ級
      const stockResult = await cartService.checkCartStock(selectedItems);
      
      if (stockResult.out_of_stock && stockResult.out_of_stock.length > 0) {
        showToast('閮ㄥ垎鍟嗗搧搴撳瓨涓嶈冻锛岃鍒锋柊璐墿杞﹀悗閲嶈瘯', { icon: 'none' });
        // 閲嶆柊鍔犺浇鏁版嵁
        this.loadCartData(true);
        return;
      }
      
      // 鏋勫缓璁㈠崟鏁版嵁
      const orderData = {
        items: selectedItems.map(item => ({
          cart_item_id: item.id,
          product_id: item.product_id,
          quantity: item.quantity,
          sku_id: item.sku_id
        }))
      };
      
      // 璺宠浆鍒扮粨绠楅〉闈?      wx.navigateTo({
        url: '/pages/checkout/checkout?orderData=' + encodeURIComponent(JSON.stringify(orderData)),
        fail: (err) => {
          console.error('璺宠浆鍒扮粨绠楅〉闈㈠け璐?', err);
          showToast('璺宠浆澶辫触锛岃閲嶈瘯', { icon: 'none' });
        }
      });
      
    } catch (error) {
      console.error('缁撶畻澶辫触:', error);
      showToast(error.message || '缁撶畻澶辫触锛岃閲嶈瘯', { icon: 'none' });
    } finally {
      hideLoading();
      this.setData({
        submitting: false
      });
    }
  },

  /**
   * 缂栬緫妯″紡鍒囨崲
   */
  toggleEditMode: function() {
    this.setData({
      isEditing: !this.data.isEditing
    });
  },

  /**
   * 璺宠浆鍒板晢鍝佽鎯?   */
  navigateToProductDetail: function(e) {
    const productId = e.currentTarget.dataset.productId;
    wx.navigateTo({
      url: `/pages/product/detail?id=${productId}`
    });
  }
});\n
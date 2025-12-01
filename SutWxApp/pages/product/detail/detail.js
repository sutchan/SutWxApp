/**
 * 鏂囦欢鍚? detail.js
 * 鐗堟湰鍙? 1.0.0
 * 更新日期: 2025-11-23
 * 閸熷棗鎼х拠锔藉剰妞ょ敻娼? */
const i18n = require('../../../utils/i18n');
const socialService = require('../../../services/socialService');

Page({
  data: {
    i18n: i18n,
    loading: false,
    productId: null,
    product: null,
    selectedSpecs: {},
    quantity: 1,
    showSpecModal: false,
    reviews: [],
    relatedProducts: [],
    timer: null,
    reviewsTimer: null,
    relatedProductsTimer: null
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸旂姾娴?   * @param {Object} options - 妞ょ敻娼伴崣鍌涙殶
   * @param {string} options.id - 閸熷棗鎼D
   * @returns {void}
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ productId: options.id });
      this.loadProductDetail(options.id);
      this.loadProductReviews(options.id);
      this.loadRelatedProducts(options.id);
    }
  },

  /**
   * 閻㈢喎鎳￠崨銊︽埂閸戣姤鏆?-閻╂垵鎯夋い鐢告桨閸楁瓕娴?   * @returns {void}
   */
  onUnload() {
    // 濞撳懐鎮婇幍鈧張澶婄暰閺冭泛娅掗敍宀勬Щ濮濄垹鍞寸€涙ɑ纭犲?    if (this.data.timer) {
      clearTimeout(this.data.timer);
    }
    if (this.data.reviewsTimer) {
      clearTimeout(this.data.reviewsTimer);
    }
    if (this.data.relatedProductsTimer) {
      clearTimeout(this.data.relatedProductsTimer);
    }
  },

  /**
   * 妞ょ敻娼伴弰鍓с仛閺冩儼袝閸?   * @returns {void}
   */
  onShow() {
    // 閸欘垯浜掗崷銊︻劃婢跺嫬鍩涢弬浼村劥閸掑棙鏆熼幑?  },

  /**
   * 娑撳濯洪崚閿嬫煀閸ョ偠鐨?   * @returns {void}
   */
  onPullDownRefresh() {
    this.loadProductDetail(this.data.productId, () => {
      wx.stopPullDownRefresh();
    });
  },

  /**
   * 閸掑棔闊╂い鐢告桨
   * @returns {Object} 閸掑棔闊╅柊宥囩枂
   */
  onShareAppMessage() {
    const { product, productId } = this.data;
    const title = product ? product.name : i18n.translate('閸熷棗鎼х拠锔藉剰');
    const path = `/pages/product/detail/detail?id=${productId}`;
    
    // 閸掑棔闊╁彈鍝嶆椂閿涘苯绠?    return {
      title,
      path,
      success: (res) => {
        // 鐠佸墽鐤嗘い鐢告桨娴滃娆㈣蹇撻柌鍙ョ拠銉ㄧ儤
        if (res.errMsg === 'shareAppMessage:ok') {
          // 鐠佸墽鐤嗘い鐢告桨娴滃娆㈣蹇撳鍦惃鍕壐
          const shareChannel = res.channel || 'wechat';
          
          // 鐠佸墽鐤嗘い鐢告桨娴滃娆㈣蹇撳鍦惃鍕壐
          socialService.shareProduct({
            productId,
            title,
            description: product ? product.description : '',
            imageUrl: product && product.images && product.images.length > 0 ? product.images[0] : '',
            shareChannel
          }).then(() => {
            console.log('閸掑棔闊╁彈鍝嶅惃鍕壐娴滃娆㈣蹇撳▔鎴︼拷');
          }).catch((err) => {
            console.error('閸掑棔闊╁彈鍝嶅惃鍕壐娴滃娆㈣蹇撴径杈Е:', err);
          });
        }
      },
      fail: (err) => {
        console.error('閸掑棔闊╂径杈Е:', err);
      }
    };
  },

  /**
   * 閸旂姾娴囬崯鍡楁惂鐠囷附鍎?   * @param {string} id - 閸熷棗鎼D
   * @param {Function} done - 鐎瑰本鍨氶崶鐐剁殶
   * @returns {void}
   */
  loadProductDetail(id, done) {
    this.setData({ loading: true });
    const timer = setTimeout(() => {
      const mockProduct = {
        id: id,
        name: i18n.translate('娴兼宸濋崯鍡楁惂'),
        description: i18n.translate('鏉╂瑦妲告稉鈧稉顏堢彯鐠愩劑鍣洪惃鍕櫌閸濅緤绱濋柌鍥╂暏娴兼宸濋弶鎰灐閸掓湹缍旈敍宀冾啎鐠侊紕绨跨紘搴礉閸旂喕鍏樼€圭偟鏁ら妴?),
        price: '99.00',
        originalPrice: '129.00',
        images: [
          '/images/placeholder.svg',
          '/images/placeholder.svg',
          '/images/placeholder.svg'
        ],
        specs: [
          {
            name: i18n.translate('妫版粏澹?),
            options: [
              { id: 'red', name: i18n.translate('缁俱垼澹?) },
              { id: 'blue', name: i18n.translate('閽冩繆澹?) },
              { id: 'black', name: i18n.translate('姒涙垼澹?) }
            ]
          },
          {
            name: i18n.translate('鐏忓搫顕?),
            options: [
              { id: 's', name: 'S' },
              { id: 'm', name: 'M' },
              { id: 'l', name: 'L' }
            ]
          }
        ],
        stock: 100,
        sales: 500,
        rating: 4.5
      };

      // 閸掓繂顫愰崠鏍偓澶夎厬鐟欏嫭鐗?      const selectedSpecs = {};
      mockProduct.specs.forEach(spec => {
        selectedSpecs[spec.name] = spec.options[0].id;
      });

      this.setData({
        product: mockProduct,
        selectedSpecs,
        loading: false,
        timer: null
      });
      
      if (typeof done === 'function') done();
    }, 300);
    
    this.setData({ timer });
  },

  /**
   * 閸旂姾娴囬崯鍡楁惂鐠囧嫪鐜?   * @param {string} id - 閸熷棗鎼D
   * @returns {void}
   */
  loadProductReviews(id) {
    console.log('閸旂姾娴囬崯鍡楁惂鐠囧嫪鐜敍灞芥櫌閸濅浮D:', id);
    const reviewsTimer = setTimeout(() => {
      const mockReviews = [
        {
          id: 1,
          user: {
            avatar: '/images/default-avatar.png',
            name: i18n.translate('閻劍鍩汚')
          },
          rating: 5,
          content: i18n.translate('閸熷棗鎼х拹銊╁櫤瀵板牆銈介敍宀勬姜鐢憡寮ч幇蹇ョ磼'),
          images: ['/images/placeholder.svg'],
          createTime: '2023-10-01'
        },
        {
          id: 2,
          user: {
            avatar: '/images/default-avatar.png',
            name: i18n.translate('閻劍鍩汢')
          },
          rating: 4,
          content: i18n.translate('閺佺繝缍嬫稉宥夋晩閿涘苯姘ㄩ弰顖滃⒖濞翠焦婀侀悙瑙勫弮'),
          images: [],
          createTime: '2023-09-28'
        }
      ];

      this.setData({ 
        reviews: mockReviews,
        reviewsTimer: null
      });
    }, 500);
    
    this.setData({ reviewsTimer });
  },

  /**
   * 閸旂姾娴囬惄绋垮彠閸熷棗鎼?   * @param {string} id - 閸熷棗鎼D
   * @returns {void}
   */
  loadRelatedProducts(id) {
    console.log('閸旂姾娴囬惄绋垮彠閸熷棗鎼ч敍灞界秼閸撳秴鏅㈤崫涓:', id);
    const relatedProductsTimer = setTimeout(() => {
      const mockRelatedProducts = [
        { id: 1, name: i18n.translate('閻╃鍙ч崯鍡楁惂A'), image: '/images/placeholder.svg', price: '89.00' },
        { id: 2, name: i18n.translate('閻╃鍙ч崯鍡楁惂B'), image: '/images/placeholder.svg', price: '109.00' },
        { id: 3, name: i18n.translate('閻╃鍙ч崯鍡楁惂C'), image: '/images/placeholder.svg', price: '79.00' }
      ];

      this.setData({ 
        relatedProducts: mockRelatedProducts,
        relatedProductsTimer: null
      });
    }, 500);
    
    this.setData({ relatedProductsTimer });
  },

  /**
   * 妫板嫯顫嶉崶鍓у
   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  previewImage(e) {
    const { urls, current } = e.currentTarget.dataset;
    wx.previewImage({
      urls,
      current
    });
  },

  /**
   * 閺勫墽銇氱憴鍕壐闁瀚ㄥ鍦崶
   * @returns {void}
   */
  showSpecModal() {
    this.setData({ showSpecModal: true });
  },

  /**
   * 闂呮劘妫岀憴鍕壐闁瀚ㄥ鍦崶
   * @returns {void}
   */
  hideSpecModal() {
    this.setData({ showSpecModal: false });
  },

  /**
   * 闁瀚ㄧ憴鍕壐
   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  selectSpec(e) {
    const { specName, optionId } = e.currentTarget.dataset;
    this.setData({
      [`selectedSpecs.${specName}`]: optionId
    });
  },

  /**
   * 婢х偛濮為弫浼村櫤
   * @returns {void}
   */
  increaseQuantity() {
    const { quantity, product } = this.data;
    if (quantity < product.stock) {
      this.setData({ quantity: quantity + 1 });
    }
  },

  /**
   * 閸戝繐鐨弫浼村櫤
   * @returns {void}
   */
  decreaseQuantity() {
    const { quantity } = this.data;
    if (quantity > 1) {
      this.setData({ quantity: quantity - 1 });
    }
  },

  /**
   * 濞ｈ濮為崚鎷屽枠閻椻晞婧?   * @returns {void}
   */
  addToCart() {
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ殶閻⑺婸I濞ｈ濮為崚鎷屽枠閻椻晞婧?    wx.showToast({
      title: i18n.translate('瀹稿弶鍧婇崝鐘插煂鐠愵厾澧挎潪?),
      icon: 'success'
    });
    this.hideSpecModal();
  },

  /**
   * 缁斿宓嗚喘涔?   * @returns {void}
   */
  buyNow() {
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ儲鏉烆剙鍩岃鍗曠涵顔款吇妞ょ敻娼?    this.hideSpecModal();
    wx.navigateTo({
      url: `/pages/order/confirm?productId=${this.data.productId}&quantity=${this.data.quantity}`
    });
  },

  /**
   * 閺€鎯版閸熷棗鎼?   * @returns {void}
   */
  toggleFavorite() {
    // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ㄧ殶閻⑺婸I閺€鎯版/閸欐牗绉烽弨鎯版
    const { product } = this.data;
    const isFavorited = product.isFavorited;
    
    wx.showToast({
      title: isFavorited ? i18n.translate('瀹告彃褰囧☉鍫熸暪閽?) : i18n.translate('瀹稿弶鏁归挊?),
      icon: 'success'
    });
    
    this.setData({
      'product.isFavorited': !isFavorited
    });
  },

  /**
   * 鐠哄疇娴嗛崚鏉挎櫌閸濅浇顕涢幆鍛淬€?   * @param {Object} e - 娴滃娆㈢€电钖?   * @returns {void}
   */
  goToProductDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product/detail/detail?id=${id}`
    });
  }
});

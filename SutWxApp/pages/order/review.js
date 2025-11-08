// review.js - 璁㈠崟璇勪环椤甸潰缁勪欢

const orderService = require('../../utils/order-service');

Page({
  data: {
    orderId: '',
    orderItems: [], // 璁㈠崟涓殑鍟嗗搧鍒楄〃
    reviewData: [], // 璇勪环鏁版嵁
    anonymous: false, // 鏄惁鍖垮悕璇勪环
    loading: true,
    error: false,
    errorMessage: '',
    submitting: false, // 鏄惁姝ｅ湪鎻愪氦璇勪环
    uploadProgress: {} // 鍥剧墖涓婁紶杩涘害
  },

  onLoad: function(options) {
    // 浠庨〉闈㈠弬鏁颁腑鑾峰彇璁㈠崟ID
    if (options.orderId) {
      this.setData({
        orderId: options.orderId
      });
      // 鍔犺浇璁㈠崟淇℃伅锛岃幏鍙栧緟璇勪环鐨勫晢鍝佸垪琛?      this.loadOrderItems();
    } else {
      this.setData({
        loading: false,
        error: true,
        errorMessage: '璁㈠崟ID涓嶅瓨鍦?
      });
    }
  },

  /**
   * 鍔犺浇璁㈠崟鍟嗗搧淇℃伅
   */
  loadOrderItems: function() {
    const that = this;
    that.setData({
      loading: true,
      error: false
    });

    orderService.getOrderDetail(that.data.orderId)
      .then(res => {
        if (res && res.code === 0 && res.data) {
          const orderDetail = res.data;
          
          if (orderDetail.items && orderDetail.items.length > 0) {
            // 鍒濆鍖栬瘎浠锋暟鎹?            const reviewData = orderDetail.items.map(item => ({
              product_id: item.product_id,
              product_name: item.product_name,
              product_image: item.product_image,
              score: 5, // 榛樿浜旀槦濂借瘎
              content: '',
              images: [],
              specs: item.specs || ''
            }));

            that.setData({
              orderItems: orderDetail.items,
              reviewData: reviewData,
              loading: false
            });
          } else {
            that.setData({
              loading: false,
              error: true,
              errorMessage: '鑾峰彇寰呰瘎浠峰晢鍝佸け璐?
            });
          }
        } else {
          that.setData({
            loading: false,
            error: true,
            errorMessage: res ? res.message : '鑾峰彇璁㈠崟璇︽儏澶辫触'
          });
        }
      })
      .catch(err => {
        console.error('鍔犺浇璁㈠崟鍟嗗搧澶辫触:', err);
        that.setData({
          loading: false,
          error: true,
          errorMessage: '缃戠粶寮傚父锛岃绋嶅悗閲嶈瘯'
        });
      });
  },

  /**
   * 璁剧疆璇勫垎
   */
  setScore: function(e) {
    const { index, score } = e.currentTarget.dataset;
    const reviewData = this.data.reviewData;
    reviewData[index].score = parseInt(score);
    
    this.setData({
      reviewData: reviewData
    });
  },

  /**
   * 杈撳叆璇勪环鍐呭
   */
  inputContent: function(e) {
    const { index } = e.currentTarget.dataset;
    const { value } = e.detail;
    const reviewData = this.data.reviewData;
    reviewData[index].content = value;
    
    this.setData({
      reviewData: reviewData
    });
  },

  /**
   * 閫夋嫨鍥剧墖
   */
  chooseImage: function(e) {
    const { index } = e.currentTarget.dataset;
    const reviewData = this.data.reviewData;
    
    // 妫€鏌ュ綋鍓嶅凡涓婁紶鍥剧墖鏁伴噺
    const currentImages = reviewData[index].images || [];
    const maxImages = 5;
    const remainingImages = maxImages - currentImages.length;
    
    if (remainingImages <= 0) {
      wx.showToast({
        title: '鏈€澶氬彧鑳戒笂浼?寮犲浘鐗?,
        icon: 'none'
      });
      return;
    }

    wx.chooseImage({
      count: remainingImages,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        // 寮€濮嬩笂浼犲浘鐗?        this.uploadImages(index, tempFilePaths);
      },
      fail: (err) => {
        console.error('閫夋嫨鍥剧墖澶辫触:', err);
      }
    });
  },

  /**
   * 涓婁紶鍥剧墖
   */
  uploadImages: function(index, tempFilePaths) {
    const that = this;
    const reviewData = this.data.reviewData;
    const uploadProgress = this.data.uploadProgress;
    
    tempFilePaths.forEach((tempFilePath, i) => {
      // 鐢熸垚鍥剧墖鍞竴鏍囪瘑锛岀敤浜庢洿鏂拌繘搴?      const imageKey = `${index}_${Date.now()}_${i}`;
      
      // 鏄剧ず涓婁紶涓彁绀?      wx.showLoading({
        title: '鍥剧墖涓婁紶涓?..',
      });
      
      // 妯℃嫙鍥剧墖涓婁紶锛屽疄闄呴」鐩腑搴旇璋冪敤鐪熷疄鐨勪笂浼犳帴鍙?      // 杩欓噷浣跨敤setTimeout妯℃嫙缃戠粶寤惰繜
      setTimeout(() => {
        // 妯℃嫙涓婁紶鎴愬姛锛屽皢涓存椂璺緞浣滀负鍥剧墖URL
        // 瀹為檯椤圭洰涓簲璇ヤ娇鐢ㄦ湇鍔″櫒杩斿洖鐨勫浘鐗嘦RL
        const uploadedImages = [...reviewData[index].images, tempFilePath];
        reviewData[index].images = uploadedImages;
        
        // 绉婚櫎涓婁紶杩涘害
        delete uploadProgress[imageKey];
        
        that.setData({
          reviewData: reviewData,
          uploadProgress: uploadProgress
        });
        
        // 濡傛灉鎵€鏈夊浘鐗囬兘涓婁紶瀹屾垚锛岄殣钘忓姞杞芥彁绀?        if (Object.keys(uploadProgress).length === 0) {
          wx.hideLoading();
        }
        
      }, 1000);
    });
  },

  /**
   * 鍒犻櫎鍥剧墖
   */
  deleteImage: function(e) {
    const { index, imageIndex } = e.currentTarget.dataset;
    const reviewData = this.data.reviewData;
    
    wx.showModal({
      title: '鍒犻櫎鍥剧墖',
      content: '纭畾瑕佸垹闄よ繖寮犲浘鐗囧悧锛?,
      success: (res) => {
        if (res.confirm) {
          // 浠庢暟缁勪腑绉婚櫎鍥剧墖
          reviewData[index].images.splice(imageIndex, 1);
          
          this.setData({
            reviewData: reviewData
          });
        }
      }
    });
  },

  /**
   * 棰勮鍥剧墖
   */
  previewImage: function(e) {
    const { index, imageIndex } = e.currentTarget.dataset;
    const reviewData = this.data.reviewData;
    const currentImage = reviewData[index].images[imageIndex];
    const allImages = reviewData[index].images;
    
    wx.previewImage({
      current: currentImage,
      urls: allImages
    });
  },

  /**
   * 鍒囨崲鍖垮悕璇勪环
   */
  toggleAnonymous: function() {
    this.setData({
      anonymous: !this.data.anonymous
    });
  },

  /**
   * 鎻愪氦璇勪环
   */
  submitReview: function() {
    const that = this;
    const reviewData = this.data.reviewData;
    const anonymous = this.data.anonymous;
    
    // 楠岃瘉璇勪环鍐呭
    if (!this.validateReview()) {
      return;
    }
    
    wx.showModal({
      title: '鎻愪氦璇勪环',
      content: '纭畾鎻愪氦璇勪环鍚楋紵',
      success: (res) => {
        if (res.confirm) {
          that.setData({
            submitting: true
          });
          
          wx.showLoading({
            title: '鎻愪氦涓?..',
          });
          
          // 鍑嗗鎻愪氦鏁版嵁
          const submitData = {
            order_id: that.data.orderId,
            anonymous: anonymous,
            items: reviewData.map(item => ({
              product_id: item.product_id,
              score: item.score,
              content: item.content,
              images: item.images
            }))
          };
          
          orderService.submitReview(submitData)
            .then(res => {
              wx.hideLoading();
              that.setData({
                submitting: false
              });
              
              if (res && res.code === 0) {
                wx.showToast({
                  title: '璇勪环鎴愬姛',
                  icon: 'success'
                });
                
                // 寤惰繜杩斿洖璁㈠崟璇︽儏椤?                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
              } else {
                wx.showToast({
                  title: res ? res.message : '璇勪环澶辫触锛岃绋嶅悗閲嶈瘯',
                  icon: 'none'
                });
              }
            })
            .catch(err => {
              wx.hideLoading();
              that.setData({
                submitting: false
              });
              
              wx.showToast({
                title: '缃戠粶寮傚父锛岃绋嶅悗閲嶈瘯',
                icon: 'none'
              });
              console.error('鎻愪氦璇勪环澶辫触:', err);
            });
        }
      }
    });
  },

  /**
   * 楠岃瘉璇勪环鍐呭
   */
  validateReview: function() {
    const reviewData = this.data.reviewData;
    
    for (let i = 0; i < reviewData.length; i++) {
      const review = reviewData[i];
      
      // 妫€鏌ユ槸鍚﹂€夋嫨浜嗚瘎鍒?      if (!review.score || review.score < 1) {
        wx.showToast({
          title: '璇蜂负鎵€鏈夊晢鍝佹墦鍒?,
          icon: 'none'
        });
        return false;
      }
      
      // 妫€鏌ヨ瘎浠峰唴瀹规槸鍚︾鍚堣姹傦紙濡傛灉鏈夊唴瀹癸級
      if (review.content && review.content.length > 200) {
        wx.showToast({
          title: '璇勪环鍐呭涓嶈兘瓒呰繃200瀛?,
          icon: 'none'
        });
        return false;
      }
    }
    
    return true;
  },

  /**
   * 杩斿洖涓婁竴椤?   */
  navigateBack: function() {
    wx.navigateBack();
  }
});
锘?/ review.js - 鐠併垹宕熺拠鍕幆妞ょ敻娼扮紒鍕

const orderService = require('../../utils/order-service');

Page({
  data: {
    orderId: '',
    orderItems: [], // 鐠併垹宕熸稉顓犳畱閸熷棗鎼ч崚妤勩€?    reviewData: [], // 鐠囧嫪鐜弫鐗堝祦
    anonymous: false, // 閺勵垰鎯侀崠鍨倳鐠囧嫪鐜?    loading: true,
    error: false,
    errorMessage: '',
    submitting: false, // 閺勵垰鎯佸锝呮躬閹绘劒姘︾拠鍕幆
    uploadProgress: {} // 閸ュ墽澧栨稉濠佺炊鏉╂稑瀹?  },

  onLoad: function(options) {
    // 娴犲酣銆夐棃銏犲棘閺侀鑵戦懢宄板絿鐠併垹宕烮D
    if (options.orderId) {
      this.setData({
        orderId: options.orderId
      });
      // 閸旂姾娴囩拋銏犲礋娣団剝浼呴敍宀冨箯閸欐牕绶熺拠鍕幆閻ㄥ嫬鏅㈤崫浣稿灙鐞?      this.loadOrderItems();
    } else {
      this.setData({
        loading: false,
        error: true,
        errorMessage: '鐠併垹宕烮D娑撳秴鐡ㄩ崷?
      });
    }
  },

  /**
   * 閸旂姾娴囩拋銏犲礋閸熷棗鎼ф穱鈩冧紖
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
            // 閸掓繂顫愰崠鏍槑娴犻攱鏆熼幑?            const reviewData = orderDetail.items.map(item => ({
              product_id: item.product_id,
              product_name: item.product_name,
              product_image: item.product_image,
              score: 5, // 姒涙顓绘禍鏃€妲︽總鍊熺槑
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
              errorMessage: '閼惧嘲褰囧鍛扮槑娴犲嘲鏅㈤崫浣搞亼鐠?
            });
          }
        } else {
          that.setData({
            loading: false,
            error: true,
            errorMessage: res ? res.message : '閼惧嘲褰囩拋銏犲礋鐠囷附鍎忔径杈Е'
          });
        }
      })
      .catch(err => {
        console.error('閸旂姾娴囩拋銏犲礋閸熷棗鎼ф径杈Е:', err);
        that.setData({
          loading: false,
          error: true,
          errorMessage: '缂冩垹绮跺鍌氱埗閿涘矁顕粙宥呮倵闁插秷鐦?
        });
      });
  },

  /**
   * 鐠佸墽鐤嗙拠鍕瀻
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
   * 鏉堟挸鍙嗙拠鍕幆閸愬懎顔?   */
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
   * 闁瀚ㄩ崶鍓у
   */
  chooseImage: function(e) {
    const { index } = e.currentTarget.dataset;
    const reviewData = this.data.reviewData;
    
    // 濡偓閺屻儱缍嬮崜宥呭嚒娑撳﹣绱堕崶鍓у閺佷即鍣?    const currentImages = reviewData[index].images || [];
    const maxImages = 5;
    const remainingImages = maxImages - currentImages.length;
    
    if (remainingImages <= 0) {
      wx.showToast({
        title: '閺堚偓婢舵艾褰ч懗鎴掔瑐娴?瀵姴娴橀悧?,
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
        // 瀵偓婵绗傛导鐘叉禈閻?        this.uploadImages(index, tempFilePaths);
      },
      fail: (err) => {
        console.error('闁瀚ㄩ崶鍓у婢惰精瑙?', err);
      }
    });
  },

  /**
   * 娑撳﹣绱堕崶鍓у
   */
  uploadImages: function(index, tempFilePaths) {
    const that = this;
    const reviewData = this.data.reviewData;
    const uploadProgress = this.data.uploadProgress;
    
    tempFilePaths.forEach((tempFilePath, i) => {
      // 閻㈢喐鍨氶崶鍓у閸烆垯绔撮弽鍥槕閿涘瞼鏁ゆ禍搴㈡纯閺傛媽绻樻惔?      const imageKey = `${index}_${Date.now()}_${i}`;
      
      // 閺勫墽銇氭稉濠佺炊娑擃厽褰佺粈?      wx.showLoading({
        title: '閸ュ墽澧栨稉濠佺炊娑?..',
      });
      
      // 濡剝瀚欓崶鍓у娑撳﹣绱堕敍灞界杽闂勫懘銆嶉惄顔昏厬鎼存棁顕氱拫鍐暏閻喎鐤勯惃鍕瑐娴肩姵甯撮崣?      // 鏉╂瑩鍣锋担璺ㄦ暏setTimeout濡剝瀚欑純鎴犵捕瀵ゆ儼绻?      setTimeout(() => {
        // 濡剝瀚欐稉濠佺炊閹存劕濮涢敍灞界殺娑撳瓨妞傜捄顖氱窞娴ｆ粈璐熼崶鍓уURL
        // 鐎圭偤妾い鍦窗娑擃厼绨茬拠銉ゅ▏閻劍婀囬崝鈥虫珤鏉╂柨娲栭惃鍕禈閻楀槮RL
        const uploadedImages = [...reviewData[index].images, tempFilePath];
        reviewData[index].images = uploadedImages;
        
        // 缁夊娅庢稉濠佺炊鏉╂稑瀹?        delete uploadProgress[imageKey];
        
        that.setData({
          reviewData: reviewData,
          uploadProgress: uploadProgress
        });
        
        // 婵″倹鐏夐幍鈧張澶婃禈閻楀洭鍏樻稉濠佺炊鐎瑰本鍨氶敍宀勬閽樺繐濮炴潪鑺ュ絹缁€?        if (Object.keys(uploadProgress).length === 0) {
          wx.hideLoading();
        }
        
      }, 1000);
    });
  },

  /**
   * 閸掔娀娅庨崶鍓у
   */
  deleteImage: function(e) {
    const { index, imageIndex } = e.currentTarget.dataset;
    const reviewData = this.data.reviewData;
    
    wx.showModal({
      title: '閸掔娀娅庨崶鍓у',
      content: '绾喖鐣剧憰浣稿灩闂勩倛绻栧鐘叉禈閻楀洤鎮ч敍?,
      success: (res) => {
        if (res.confirm) {
          // 娴犲孩鏆熺紒鍕厬缁夊娅庨崶鍓у
          reviewData[index].images.splice(imageIndex, 1);
          
          this.setData({
            reviewData: reviewData
          });
        }
      }
    });
  },

  /**
   * 妫板嫯顫嶉崶鍓у
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
   * 閸掑洦宕查崠鍨倳鐠囧嫪鐜?   */
  toggleAnonymous: function() {
    this.setData({
      anonymous: !this.data.anonymous
    });
  },

  /**
   * 閹绘劒姘︾拠鍕幆
   */
  submitReview: function() {
    const that = this;
    const reviewData = this.data.reviewData;
    const anonymous = this.data.anonymous;
    
    // 妤犲矁鐦夌拠鍕幆閸愬懎顔?    if (!this.validateReview()) {
      return;
    }
    
    wx.showModal({
      title: '閹绘劒姘︾拠鍕幆',
      content: '绾喖鐣鹃幓鎰唉鐠囧嫪鐜崥妤嬬吹',
      success: (res) => {
        if (res.confirm) {
          that.setData({
            submitting: true
          });
          
          wx.showLoading({
            title: '閹绘劒姘︽稉?..',
          });
          
          // 閸戝棗顦幓鎰唉閺佺増宓?          const submitData = {
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
                  title: '鐠囧嫪鐜幋鎰',
                  icon: 'success'
                });
                
                // 瀵ゆ儼绻滄潻鏂挎礀鐠併垹宕熺拠锔藉剰妞?                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
              } else {
                wx.showToast({
                  title: res ? res.message : '鐠囧嫪鐜径杈Е閿涘矁顕粙宥呮倵闁插秷鐦?,
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
                title: '缂冩垹绮跺鍌氱埗閿涘矁顕粙宥呮倵闁插秷鐦?,
                icon: 'none'
              });
              console.error('閹绘劒姘︾拠鍕幆婢惰精瑙?', err);
            });
        }
      }
    });
  },

  /**
   * 妤犲矁鐦夌拠鍕幆閸愬懎顔?   */
  validateReview: function() {
    const reviewData = this.data.reviewData;
    
    for (let i = 0; i < reviewData.length; i++) {
      const review = reviewData[i];
      
      // 濡偓閺屻儲妲搁崥锕傗偓澶嬪娴滃棜鐦庨崚?      if (!review.score || review.score < 1) {
        wx.showToast({
          title: '鐠囪渹璐熼幍鈧張澶婃櫌閸濅焦澧﹂崚?,
          icon: 'none'
        });
        return false;
      }
      
      // 濡偓閺屻儴鐦庢禒宄板敶鐎硅妲搁崥锔绢儊閸氬牐顩﹀Ч鍌︾礄婵″倹鐏夐張澶婂敶鐎圭櫢绱?      if (review.content && review.content.length > 200) {
        wx.showToast({
          title: '鐠囧嫪鐜崘鍛啇娑撳秷鍏樼搾鍛扮箖200鐎?,
          icon: 'none'
        });
        return false;
      }
    }
    
    return true;
  },

  /**
   * 鏉╂柨娲栨稉濠佺妞?   */
  navigateBack: function() {
    wx.navigateBack();
  }
});\n
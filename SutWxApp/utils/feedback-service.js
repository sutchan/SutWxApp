// feedback-service.js - 鐢ㄦ埛鍙嶉鏈嶅姟妯″潡
// 鍩轰簬鎶€鏈璁℃枃妗ｅ疄鐜扮殑鐢ㄦ埛鍙嶉鏀堕泦鍜岀鐞嗘湇鍔?
import { request } from './api';
import { showToast, showLoading, hideLoading } from './global';
import { validateRequired, validateStringLength, validateEmail } from './validator';

/**
 * 鐢ㄦ埛鍙嶉鏈嶅姟绫? * 鎻愪緵鐢ㄦ埛鍙嶉鎻愪氦銆佹煡璇㈢瓑鍔熻兘
 */
class FeedbackService {
  /**
   * 鎻愪氦鐢ㄦ埛鍙嶉
   * @param {Object} feedbackData - 鍙嶉鏁版嵁
   * @param {string} feedbackData.type - 鍙嶉绫诲瀷锛坆ug, suggestion, question, other锛?   * @param {string} feedbackData.content - 鍙嶉鍐呭
   * @param {string} [feedbackData.contactInfo] - 鑱旂郴鏂瑰紡锛堥偖绠辨垨鎵嬫満鍙凤級
   * @param {string} [feedbackData.images] - 鍙嶉鎴浘锛坆ase64鎴栨枃浠惰矾寰勬暟缁勶級
   * @param {Object} [feedbackData.meta] - 鍏冩暟鎹紙璁惧淇℃伅銆佺増鏈彿绛夛級
   * @returns {Promise<Object>} 鎻愪氦缁撴灉
   */
  async submitFeedback(feedbackData) {
    try {
      // 鏁版嵁楠岃瘉
      this._validateFeedbackData(feedbackData);

      showLoading('鎻愪氦鍙嶉涓?..');

      // 鍑嗗鎻愪氦鏁版嵁
      const submitData = {
        type: feedbackData.type,
        content: feedbackData.content,
        contactInfo: feedbackData.contactInfo,
        meta: feedbackData.meta || this._getDefaultMeta(),
        createTime: new Date().getTime()
      };

      // 濡傛灉鏈夊浘鐗囷紝澶勭悊鍥剧墖鏁版嵁
      if (feedbackData.images && feedbackData.images.length > 0) {
        submitData.images = await this._processFeedbackImages(feedbackData.images);
      }

      // 璋冪敤API鎻愪氦鍙嶉
      const result = await request({
        url: '/api/feedback/submit',
        method: 'POST',
        data: submitData
      });

      hideLoading();
      showToast('鍙嶉鎻愪氦鎴愬姛锛屾劅璋㈡偍鐨勫疂璐垫剰瑙侊紒');

      return result.data;
    } catch (error) {
      hideLoading();
      console.error('鎻愪氦鍙嶉澶辫触:', error);
      showToast(error.message || '鍙嶉鎻愪氦澶辫触锛岃绋嶅悗閲嶈瘯');
      throw error;
    }
  }

  /**
   * 鑾峰彇鐢ㄦ埛鍙嶉鍒楄〃
   * @param {Object} params - 鏌ヨ鍙傛暟
   * @param {number} [params.page=1] - 椤电爜
   * @param {number} [params.pageSize=10] - 姣忛〉鏁伴噺
   * @param {string} [params.type] - 鍙嶉绫诲瀷绛涢€?   * @param {string} [params.status] - 鍙嶉鐘舵€佺瓫閫?   * @returns {Promise<Object>} 鍙嶉鍒楄〃鍜屽垎椤典俊鎭?   */
  async getFeedbackList(params = {}) {
    try {
      const { page = 1, pageSize = 10, type, status } = params;

      showLoading('鍔犺浇鍙嶉鍒楄〃...');

      const result = await request({
        url: '/api/feedback/list',
        method: 'GET',
        data: {
          page,
          pageSize,
          type,
          status
        }
      });

      hideLoading();
      return result.data;
    } catch (error) {
      hideLoading();
      console.error('鑾峰彇鍙嶉鍒楄〃澶辫触:', error);
      showToast('鑾峰彇鍙嶉鍒楄〃澶辫触');
      throw error;
    }
  }

  /**
   * 鑾峰彇鍙嶉璇︽儏
   * @param {string} feedbackId - 鍙嶉ID
   * @returns {Promise<Object>} 鍙嶉璇︽儏
   */
  async getFeedbackDetail(feedbackId) {
    try {
      if (!feedbackId) {
        throw new Error('鍙嶉ID涓嶈兘涓虹┖');
      }

      const result = await request({
        url: `/api/feedback/detail/${feedbackId}`,
        method: 'GET'
      });

      return result.data;
    } catch (error) {
      console.error('鑾峰彇鍙嶉璇︽儏澶辫触:', error);
      showToast('鑾峰彇鍙嶉璇︽儏澶辫触');
      throw error;
    }
  }

  /**
   * 鍥炲鍙嶉
   * @param {string} feedbackId - 鍙嶉ID
   * @param {string} replyContent - 鍥炲鍐呭
   * @returns {Promise<Object>} 鍥炲缁撴灉
   */
  async replyFeedback(feedbackId, replyContent) {
    try {
      if (!feedbackId) {
        throw new Error('鍙嶉ID涓嶈兘涓虹┖');
      }
      if (!replyContent || replyContent.trim() === '') {
        throw new Error('鍥炲鍐呭涓嶈兘涓虹┖');
      }

      showLoading('鎻愪氦鍥炲涓?..');

      const result = await request({
        url: `/api/feedback/reply/${feedbackId}`,
        method: 'POST',
        data: {
          content: replyContent,
          replyTime: new Date().getTime()
        }
      });

      hideLoading();
      showToast('鍥炲鎴愬姛');
      return result.data;
    } catch (error) {
      hideLoading();
      console.error('鍥炲鍙嶉澶辫触:', error);
      showToast('鍥炲澶辫触锛岃绋嶅悗閲嶈瘯');
      throw error;
    }
  }

  /**
   * 鏇存柊鍙嶉鐘舵€?   * @param {string} feedbackId - 鍙嶉ID
   * @param {string} status - 鏂扮姸鎬侊紙pending, processing, resolved, closed锛?   * @returns {Promise<Object>} 鏇存柊缁撴灉
   */
  async updateFeedbackStatus(feedbackId, status) {
    try {
      if (!feedbackId) {
        throw new Error('鍙嶉ID涓嶈兘涓虹┖');
      }
      if (!status) {
        throw new Error('鍙嶉鐘舵€佷笉鑳戒负绌?);
      }

      const validStatuses = ['pending', 'processing', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        throw new Error(`鏃犳晥鐨勫弽棣堢姸鎬侊紝蹇呴』鏄互涓嬩箣涓€: ${validStatuses.join(', ')}`);
      }

      const result = await request({
        url: `/api/feedback/status/${feedbackId}`,
        method: 'PUT',
        data: {
          status,
          updateTime: new Date().getTime()
        }
      });

      return result.data;
    } catch (error) {
      console.error('鏇存柊鍙嶉鐘舵€佸け璐?', error);
      showToast('鏇存柊鐘舵€佸け璐?);
      throw error;
    }
  }

  /**
   * 鑾峰彇鍙嶉缁熻鏁版嵁
   * @returns {Promise<Object>} 缁熻鏁版嵁
   */
  async getFeedbackStats() {
    try {
      const result = await request({
        url: '/api/feedback/stats',
        method: 'GET'
      });

      return result.data;
    } catch (error) {
      console.error('鑾峰彇鍙嶉缁熻澶辫触:', error);
      return {
        total: 0,
        pending: 0,
        processing: 0,
        resolved: 0,
        closed: 0,
        byType: {}
      };
    }
  }

  /**
   * 楠岃瘉鍙嶉鏁版嵁
   * @private
   * @param {Object} feedbackData - 鍙嶉鏁版嵁
   */
  _validateFeedbackData(feedbackData) {
    // 楠岃瘉蹇呭～瀛楁
    validateRequired(feedbackData, '鍙嶉鏁版嵁');
    validateRequired(feedbackData.type, '鍙嶉绫诲瀷');
    validateRequired(feedbackData.content, '鍙嶉鍐呭');

    // 楠岃瘉鍙嶉绫诲瀷
    const validTypes = ['bug', 'suggestion', 'question', 'other'];
    if (!validTypes.includes(feedbackData.type)) {
      throw new Error(`鏃犳晥鐨勫弽棣堢被鍨嬶紝蹇呴』鏄互涓嬩箣涓€: ${validTypes.join(', ')}`);
    }

    // 楠岃瘉鍙嶉鍐呭闀垮害
    validateStringLength(feedbackData.content, 5, 2000, '鍙嶉鍐呭');

    // 楠岃瘉鑱旂郴鏂瑰紡锛堝鏋滄彁渚涳級
    if (feedbackData.contactInfo) {
      const isEmail = feedbackData.contactInfo.includes('@');
      if (isEmail) {
        validateEmail(feedbackData.contactInfo, '鑱旂郴鏂瑰紡');
      } else {
        // 绠€鍗曠殑鎵嬫満鍙烽獙璇?        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(feedbackData.contactInfo)) {
          throw new Error('璇锋彁渚涙湁鏁堢殑鎵嬫満鍙锋垨閭浣滀负鑱旂郴鏂瑰紡');
        }
      }
    }

    // 楠岃瘉鍥剧墖鏁伴噺
    if (feedbackData.images && feedbackData.images.length > 9) {
      throw new Error('鏈€澶氬彧鑳戒笂浼?寮犲浘鐗?);
    }
  }

  /**
   * 鑾峰彇榛樿鍏冩暟鎹?   * @private
   * @returns {Object} 榛樿鍏冩暟鎹?   */
  _getDefaultMeta() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      const app = getApp();
      
      return {
        platform: systemInfo.platform || '',
        system: systemInfo.system || '',
        screenWidth: systemInfo.screenWidth || 0,
        screenHeight: systemInfo.screenHeight || 0,
        windowWidth: systemInfo.windowWidth || 0,
        windowHeight: systemInfo.windowHeight || 0,
        pixelRatio: systemInfo.pixelRatio || 1,
        version: app?.globalData?.version || '',
        page: getCurrentPages()?.slice(-1)[0]?.route || '',
        timestamp: new Date().getTime(),
        networkType: wx.getNetworkTypeSync?.() || ''
      };
    } catch (error) {
      console.warn('鑾峰彇鍏冩暟鎹け璐?', error);
      return {
        timestamp: new Date().getTime()
      };
    }
  }

  /**
   * 澶勭悊鍙嶉鍥剧墖
   * @private
   * @param {Array} images - 鍥剧墖鏁扮粍
   * @returns {Promise<Array>} 澶勭悊鍚庣殑鍥剧墖鏁版嵁
   */
  async _processFeedbackImages(images) {
    // 瀹為檯椤圭洰涓紝杩欓噷搴旇涓婁紶鍥剧墖鍒版湇鍔″櫒骞惰繑鍥濽RL
    // 杩欓噷绠€鍖栧鐞嗭紝鐩存帴杩斿洖鍘熸暟鎹?    try {
      // 瀵逛簬鏂囦欢璺緞锛屾垜浠彲浠ラ€夋嫨涓婁紶鍥剧墖
      // const uploadedImages = await Promise.all(
      //   images.map(async (imagePath) => {
      //     const uploadResult = await wx.uploadFile({
      //       url: '/api/file/upload',
      //       filePath: imagePath,
      //       name: 'file'
      //     });
      //     return JSON.parse(uploadResult.data).url;
      //   })
      // );
      // return uploadedImages;
      
      // 绠€鍖栧鐞嗭紝杩斿洖鍘熸暟鎹?      return images;
    } catch (error) {
      console.error('澶勭悊鍙嶉鍥剧墖澶辫触:', error);
      // 鍗充娇鍥剧墖澶勭悊澶辫触锛屼篃涓嶅奖鍝嶅弽棣堟彁浜わ紝鍙褰曢敊璇?      return [];
    }
  }

  /**
   * 鎻愪氦璇勫垎鍙嶉
   * @param {Object} ratingData - 璇勫垎鏁版嵁
   * @param {number} ratingData.score - 璇勫垎锛?-5锛?   * @param {string} [ratingData.comment] - 璇勪环鍐呭
   * @returns {Promise<Object>} 鎻愪氦缁撴灉
   */
  async submitRating(ratingData) {
    try {
      validateRequired(ratingData, '璇勫垎鏁版嵁');
      
      if (!ratingData.score || ratingData.score < 1 || ratingData.score > 5) {
        throw new Error('璇勫垎蹇呴』鍦?鍒?涔嬮棿');
      }

      const result = await request({
        url: '/api/feedback/rating',
        method: 'POST',
        data: {
          score: ratingData.score,
          comment: ratingData.comment || '',
          meta: this._getDefaultMeta(),
          createTime: new Date().getTime()
        }
      });

      showToast('鎰熻阿鎮ㄧ殑璇勪环锛?);
      return result.data;
    } catch (error) {
      console.error('鎻愪氦璇勫垎澶辫触:', error);
      showToast('璇勫垎鎻愪氦澶辫触');
      throw error;
    }
  }
}

// 瀵煎嚭鍙嶉鏈嶅姟瀹炰緥
const feedbackService = new FeedbackService();

// 瀵煎嚭鍙嶉鏈嶅姟鐨勫父鐢ㄦ柟娉?export const {
  submitFeedback,
  getFeedbackList,
  getFeedbackDetail,
  replyFeedback,
  updateFeedbackStatus,
  getFeedbackStats,
  submitRating
} = feedbackService;

// 榛樿瀵煎嚭鍙嶉鏈嶅姟瀹炰緥
export default feedbackService;
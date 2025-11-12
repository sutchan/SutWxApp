// feedback-service.js - 反馈服务模块
// 用于处理用户反馈、评分等功能的服务
const { request } = require('./api');
const { showToast, showLoading, hideLoading } = require('./global');
const { validateRequired, validateStringLength, validateEmail } = require('./validator');

/**
 * 反馈服务类
 * 提供用户反馈的提交、查询、回复等功能
 */
class FeedbackService {
  /**
   * 提交反馈
   * @param {Object} feedbackData - 反馈数据
   * @param {string} feedbackData.type - 反馈类型: bug, suggestion, question, other
   * @param {string} feedbackData.content - 反馈内容
   * @param {string} [feedbackData.contactInfo] - 联系方式，可选，用于后续沟通
   * @param {string} [feedbackData.images] - 反馈图片，可选，base64格式
   * @param {Object} [feedbackData.meta] - 元数据，可选，包含设备信息等
   * @returns {Promise<Object>} 提交结果
   */
  async submitFeedback(feedbackData) {
    try {
      // 验证数据
      this._validateFeedbackData(feedbackData);

      showLoading('提交反馈中...');

      // 准备提交数据
      const submitData = {
        type: feedbackData.type,
        content: feedbackData.content,
        contactInfo: feedbackData.contactInfo,
        meta: feedbackData.meta || this._getDefaultMeta(),
        createTime: new Date().getTime()
      };

      // 处理反馈图片
      if (feedbackData.images && feedbackData.images.length > 0) {
        submitData.images = await this._processFeedbackImages(feedbackData.images);
      }

      // 调用API提交反馈
      const result = await request({
        url: '/api/feedback/submit',
        method: 'POST',
        data: submitData
      });

      hideLoading();
      showToast('反馈提交成功，感谢您的支持');

      return result.data;
    } catch (error) {
      hideLoading();
      console.error('提交反馈失败', error);
      showToast(error.message || '反馈提交失败，请稍后重试');
      throw error;
    }
  }

  /**
   * 获取反馈列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=10] - 每页数量
   * @param {string} [params.type] - 反馈类型，可选
   * @param {string} [params.status] - 反馈状态，可选
   * @returns {Promise<Object>} 反馈列表和分页信息
   */
  async getFeedbackList(params = {}) {
    try {
      const { page = 1, pageSize = 10, type, status } = params;

      showLoading('加载反馈列表...');

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
      console.error('获取反馈列表失败:', error);
      showToast('获取反馈列表失败');
      throw error;
    }
  }

  /**
   * 获取反馈详情
   * @param {string} feedbackId - 反馈ID
   * @returns {Promise<Object>} 反馈详情
   */
  async getFeedbackDetail(feedbackId) {
    try {
      if (!feedbackId) {
        throw new Error('反馈ID不能为空');
      }

      const result = await request({
        url: `/api/feedback/detail/${feedbackId}`,
        method: 'GET'
      });

      return result.data;
    } catch (error) {
      console.error('获取反馈详情失败:', error);
      showToast('获取反馈详情失败');
      throw error;
    }
  }

  /**
   * 回复反馈
   * @param {string} feedbackId - 反馈ID
   * @param {string} replyContent - 回复内容
   * @returns {Promise<Object>} 回复结果
   */
  async replyFeedback(feedbackId, replyContent) {
    try {
      if (!feedbackId) {
        throw new Error('反馈ID不能为空');
      }
      if (!replyContent || replyContent.trim() === '') {
        throw new Error('回复内容不能为空');
      }

      showLoading('回复反馈中...');

      const result = await request({
        url: `/api/feedback/reply/${feedbackId}`,
        method: 'POST',
        data: {
          content: replyContent,
          replyTime: new Date().getTime()
        }
      });

      hideLoading();
      showToast('回复成功');
      return result.data;
    } catch (error) {
      hideLoading();
      console.error('回复反馈失败', error);
      showToast('回复失败，请稍后重试');
      throw error;
    }
  }

  /**
   * 更新反馈状态
   * @param {string} feedbackId - 反馈ID
   * @param {string} status - 状态: pending, processing, resolved, closed
   * @returns {Promise<Object>} 更新结果
   */
  async updateFeedbackStatus(feedbackId, status) {
    try {
      if (!feedbackId) {
        throw new Error('反馈ID不能为空');
      }
      if (!status) {
        throw new Error('状态不能为空');
      }

      const validStatuses = ['pending', 'processing', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        throw new Error(`无效的状态值，请使用: ${validStatuses.join(', ')}`);
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
      console.error('更新反馈状态失败', error);
      showToast('更新状态失败');
      throw error;
    }
  }

  /**
   * 获取反馈统计
   * @returns {Promise<Object>} 统计数据
   */
  async getFeedbackStats() {
    try {
      const result = await request({
        url: '/api/feedback/stats',
        method: 'GET'
      });

      return result.data;
    } catch (error) {
      console.error('获取反馈统计失败:', error);
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
   * 验证反馈数据
   * @private
   * @param {Object} feedbackData - 反馈数据
   */
  _validateFeedbackData(feedbackData) {
    validateRequired(feedbackData, '反馈数据');
    validateRequired(feedbackData.type, '反馈类型');
    validateRequired(feedbackData.content, '反馈内容');

    const validTypes = ['bug', 'suggestion', 'question', 'other'];
    if (!validTypes.includes(feedbackData.type)) {
      throw new Error(`无效的反馈类型，请使用: ${validTypes.join(', ')}`);
    }

    validateStringLength(feedbackData.content, 5, 2000, '反馈内容');

    if (feedbackData.contactInfo) {
      const isEmail = feedbackData.contactInfo.includes('@');
      if (isEmail) {
        validateEmail(feedbackData.contactInfo, '联系方式');
      } else {
        // 手机号验证
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(feedbackData.contactInfo)) {
          throw new Error('请输入有效的手机号码或邮箱地址');
        }
      }
    }

    if (feedbackData.images && feedbackData.images.length > 5) {
      throw new Error('图片数量不能超过5张');
    }
  }

  /**
   * 获取默认元数据
   * @private
   * @returns {Object} 元数据对象
   */
  _getDefaultMeta() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      const { platform, version, model, screenWidth, screenHeight } = systemInfo;
      
      return {
        platform,
        version,
        model,
        screenSize: `${screenWidth}x${screenHeight}`,
        timestamp: new Date().getTime()
      };
    } catch (error) {
      console.warn('获取系统信息失败', error);
      return {
        platform: 'unknown',
        version: 'unknown',
        model: 'unknown',
        screenSize: 'unknown',
        timestamp: new Date().getTime()
      };
    }
  }

  /**
   * 处理反馈图片
   * @private
   * @param {Array} images - 图片列表
   * @returns {Promise<Array>} 处理后的图片列表
   */
  async _processFeedbackImages(images) {
    try {
      // 这里可以添加图片压缩、格式转换等处理逻辑
      // 目前直接返回原图
      return images.slice(0, 5); // 最多只保留5张图片
    } catch (error) {
      console.error('处理反馈图片失败:', error);
      showToast('图片处理失败，请重试');
      return [];
    }
  }

  /**
   * 提交评分
   * @param {Object} ratingData - 评分数据
   * @param {number} ratingData.score - 评分(1-5)
   * @param {string} [ratingData.comment] - 评论文字
   * @returns {Promise<Object>} 提交结果
   */
  async submitRating(ratingData) {
    try {
      validateRequired(ratingData, '评分数据');
      
      if (!ratingData.score || ratingData.score < 1 || ratingData.score > 5) {
        throw new Error('评分必须在1-5之间');
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

      showToast('感谢您的评价');
      return result.data;
    } catch (error) {
      console.error('提交评分失败', error);
      showToast('评分提交失败');
      throw error;
    }
  }
}

// 创建反馈服务实例
const feedbackService = new FeedbackService();

// 导出服务实例和方法
const { submitFeedback, getFeedbackList, getFeedbackDetail, replyFeedback, updateFeedbackStatus, getFeedbackStats, submitRating } = feedbackService;

// 导出默认实例
module.exports = feedbackService;

// 导出各方法
module.exports.submitFeedback = submitFeedback;
module.exports.getFeedbackList = getFeedbackList;
module.exports.getFeedbackDetail = getFeedbackDetail;
module.exports.replyFeedback = replyFeedback;
module.exports.updateFeedbackStatus = updateFeedbackStatus;
module.exports.getFeedbackStats = getFeedbackStats;
module.exports.submitRating = submitRating;
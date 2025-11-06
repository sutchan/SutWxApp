// feedback-service.js - 用户反馈服务模块
// 基于技术设计文档实现的用户反馈收集和管理服务

import { request } from './api';
import { showToast, showLoading, hideLoading } from './global';
import { validateRequired, validateStringLength, validateEmail } from './validator';

/**
 * 用户反馈服务类
 * 提供用户反馈提交、查询等功能
 */
class FeedbackService {
  /**
   * 提交用户反馈
   * @param {Object} feedbackData - 反馈数据
   * @param {string} feedbackData.type - 反馈类型（bug, suggestion, question, other）
   * @param {string} feedbackData.content - 反馈内容
   * @param {string} [feedbackData.contactInfo] - 联系方式（邮箱或手机号）
   * @param {string} [feedbackData.images] - 反馈截图（base64或文件路径数组）
   * @param {Object} [feedbackData.meta] - 元数据（设备信息、版本号等）
   * @returns {Promise<Object>} 提交结果
   */
  async submitFeedback(feedbackData) {
    try {
      // 数据验证
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

      // 如果有图片，处理图片数据
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
      showToast('反馈提交成功，感谢您的宝贵意见！');

      return result.data;
    } catch (error) {
      hideLoading();
      console.error('提交反馈失败:', error);
      showToast(error.message || '反馈提交失败，请稍后重试');
      throw error;
    }
  }

  /**
   * 获取用户反馈列表
   * @param {Object} params - 查询参数
   * @param {number} [params.page=1] - 页码
   * @param {number} [params.pageSize=10] - 每页数量
   * @param {string} [params.type] - 反馈类型筛选
   * @param {string} [params.status] - 反馈状态筛选
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

      showLoading('提交回复中...');

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
      console.error('回复反馈失败:', error);
      showToast('回复失败，请稍后重试');
      throw error;
    }
  }

  /**
   * 更新反馈状态
   * @param {string} feedbackId - 反馈ID
   * @param {string} status - 新状态（pending, processing, resolved, closed）
   * @returns {Promise<Object>} 更新结果
   */
  async updateFeedbackStatus(feedbackId, status) {
    try {
      if (!feedbackId) {
        throw new Error('反馈ID不能为空');
      }
      if (!status) {
        throw new Error('反馈状态不能为空');
      }

      const validStatuses = ['pending', 'processing', 'resolved', 'closed'];
      if (!validStatuses.includes(status)) {
        throw new Error(`无效的反馈状态，必须是以下之一: ${validStatuses.join(', ')}`);
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
      console.error('更新反馈状态失败:', error);
      showToast('更新状态失败');
      throw error;
    }
  }

  /**
   * 获取反馈统计数据
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
    // 验证必填字段
    validateRequired(feedbackData, '反馈数据');
    validateRequired(feedbackData.type, '反馈类型');
    validateRequired(feedbackData.content, '反馈内容');

    // 验证反馈类型
    const validTypes = ['bug', 'suggestion', 'question', 'other'];
    if (!validTypes.includes(feedbackData.type)) {
      throw new Error(`无效的反馈类型，必须是以下之一: ${validTypes.join(', ')}`);
    }

    // 验证反馈内容长度
    validateStringLength(feedbackData.content, 5, 2000, '反馈内容');

    // 验证联系方式（如果提供）
    if (feedbackData.contactInfo) {
      const isEmail = feedbackData.contactInfo.includes('@');
      if (isEmail) {
        validateEmail(feedbackData.contactInfo, '联系方式');
      } else {
        // 简单的手机号验证
        const phoneRegex = /^1[3-9]\d{9}$/;
        if (!phoneRegex.test(feedbackData.contactInfo)) {
          throw new Error('请提供有效的手机号或邮箱作为联系方式');
        }
      }
    }

    // 验证图片数量
    if (feedbackData.images && feedbackData.images.length > 9) {
      throw new Error('最多只能上传9张图片');
    }
  }

  /**
   * 获取默认元数据
   * @private
   * @returns {Object} 默认元数据
   */
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
      console.warn('获取元数据失败:', error);
      return {
        timestamp: new Date().getTime()
      };
    }
  }

  /**
   * 处理反馈图片
   * @private
   * @param {Array} images - 图片数组
   * @returns {Promise<Array>} 处理后的图片数据
   */
  async _processFeedbackImages(images) {
    // 实际项目中，这里应该上传图片到服务器并返回URL
    // 这里简化处理，直接返回原数据
    try {
      // 对于文件路径，我们可以选择上传图片
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
      
      // 简化处理，返回原数据
      return images;
    } catch (error) {
      console.error('处理反馈图片失败:', error);
      // 即使图片处理失败，也不影响反馈提交，只记录错误
      return [];
    }
  }

  /**
   * 提交评分反馈
   * @param {Object} ratingData - 评分数据
   * @param {number} ratingData.score - 评分（1-5）
   * @param {string} [ratingData.comment] - 评价内容
   * @returns {Promise<Object>} 提交结果
   */
  async submitRating(ratingData) {
    try {
      validateRequired(ratingData, '评分数据');
      
      if (!ratingData.score || ratingData.score < 1 || ratingData.score > 5) {
        throw new Error('评分必须在1到5之间');
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

      showToast('感谢您的评价！');
      return result.data;
    } catch (error) {
      console.error('提交评分失败:', error);
      showToast('评分提交失败');
      throw error;
    }
  }
}

// 导出反馈服务实例
const feedbackService = new FeedbackService();

// 导出反馈服务的常用方法
export const {
  submitFeedback,
  getFeedbackList,
  getFeedbackDetail,
  replyFeedback,
  updateFeedbackStatus,
  getFeedbackStats,
  submitRating
} = feedbackService;

// 默认导出反馈服务实例
export default feedbackService;
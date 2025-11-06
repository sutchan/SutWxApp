// file-service.js - 文件存储服务模块
// 基于技术设计文档实现的文件上传、下载和管理服务

import { request, upload } from './api';
import { showToast } from './global';
import { CACHE_KEYS, CACHE_DURATION, CacheManager } from './cache';

/**
 * 文件存储服务类
 * 提供文件上传、下载、删除等功能
 */
class FileService {
  constructor() {
    // 文件缓存管理器，用于缓存上传的文件信息
    this.fileCacheManager = new CacheManager(CACHE_KEYS.FILE_INFO_PREFIX, CACHE_DURATION.MEDIUM);
  }

  /**
   * 上传单个文件
   * @param {Object} options - 上传选项
   * @param {string} options.filePath - 文件路径
   * @param {string} options.name - 上传文件的名称
   * @param {Object} options.formData - 其他表单数据
   * @param {string} options.fileType - 文件类型（image, video, audio, file等）
   * @param {Function} options.onProgressUpdate - 上传进度回调函数
   * @returns {Promise<Object>} 文件上传结果
   */
  async uploadFile(options = {}) {
    try {
      const { filePath, name = 'file', formData = {}, fileType = 'file', onProgressUpdate } = options;
      
      if (!filePath) {
        throw new Error('文件路径不能为空');
      }

      // 根据文件类型选择不同的上传接口
      let uploadUrl = '/api/file/upload';
      if (fileType === 'image') {
        uploadUrl = '/api/file/upload/image';
      } else if (fileType === 'video') {
        uploadUrl = '/api/file/upload/video';
      } else if (fileType === 'audio') {
        uploadUrl = '/api/file/upload/audio';
      }

      // 调用上传API
      const result = await upload({
        url: uploadUrl,
        filePath,
        name,
        formData: {
          ...formData,
          fileType
        },
        onProgressUpdate
      });

      // 缓存文件信息
      if (result.data && result.data.fileId) {
        this.fileCacheManager.set(result.data.fileId, result.data);
      }

      return result.data;
    } catch (error) {
      console.error('文件上传失败:', error);
      showToast('文件上传失败');
      throw error;
    }
  }

  /**
   * 批量上传文件
   * @param {Array} files - 文件数组，每个文件包含filePath和name属性
   * @param {Object} options - 上传选项
   * @returns {Promise<Array>} 所有文件上传结果
   */
  async batchUploadFiles(files, options = {}) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('文件数组不能为空');
    }

    try {
      // 并发上传所有文件
      const uploadPromises = files.map(file => 
        this.uploadFile({
          ...options,
          filePath: file.filePath,
          name: file.name || 'file'
        })
      );

      // 使用Promise.all等待所有上传完成
      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('批量文件上传失败:', error);
      showToast('批量文件上传失败');
      throw error;
    }
  }

  /**
   * 获取文件信息
   * @param {string} fileId - 文件ID
   * @returns {Promise<Object>} 文件信息
   */
  async getFileInfo(fileId) {
    try {
      if (!fileId) {
        throw new Error('文件ID不能为空');
      }

      // 先尝试从缓存获取
      const cachedInfo = this.fileCacheManager.get(fileId);
      if (cachedInfo) {
        return cachedInfo;
      }

      // 缓存未命中，从服务器获取
      const result = await request({
        url: `/api/file/info/${fileId}`,
        method: 'GET'
      });

      // 更新缓存
      if (result.data) {
        this.fileCacheManager.set(fileId, result.data);
      }

      return result.data;
    } catch (error) {
      console.error('获取文件信息失败:', error);
      throw error;
    }
  }

  /**
   * 获取文件下载URL
   * @param {string} fileId - 文件ID
   * @param {Object} options - 下载选项
   * @returns {Promise<string>} 下载URL
   */
  async getFileUrl(fileId, options = {}) {
    try {
      if (!fileId) {
        throw new Error('文件ID不能为空');
      }

      // 从服务器获取下载URL
      const result = await request({
        url: `/api/file/url/${fileId}`,
        method: 'GET',
        data: options
      });

      return result.data.url;
    } catch (error) {
      console.error('获取文件URL失败:', error);
      throw error;
    }
  }

  /**
   * 下载文件
   * @param {string} fileId - 文件ID
   * @param {Object} options - 下载选项
   * @returns {Promise<Object>} 下载结果
   */
  async downloadFile(fileId, options = {}) {
    try {
      // 获取文件URL
      const downloadUrl = await this.getFileUrl(fileId, options);
      
      // 调用微信下载API
      return new Promise((resolve, reject) => {
        wx.downloadFile({
          url: downloadUrl,
          success: (res) => {
            if (res.statusCode === 200) {
              resolve({ path: res.tempFilePath });
            } else {
              reject(new Error(`下载失败: ${res.statusCode}`));
            }
          },
          fail: reject,
          ...options
        });
      });
    } catch (error) {
      console.error('文件下载失败:', error);
      showToast('文件下载失败');
      throw error;
    }
  }

  /**
   * 删除文件
   * @param {string} fileId - 文件ID
   * @returns {Promise<boolean>} 删除结果
   */
  async deleteFile(fileId) {
    try {
      if (!fileId) {
        throw new Error('文件ID不能为空');
      }

      // 调用删除API
      await request({
        url: `/api/file/delete/${fileId}`,
        method: 'POST'
      });

      // 从缓存中移除
      this.fileCacheManager.remove(fileId);
      
      return true;
    } catch (error) {
      console.error('文件删除失败:', error);
      showToast('文件删除失败');
      throw error;
    }
  }

  /**
   * 获取文件列表
   * @param {Object} params - 查询参数
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @param {string} params.fileType - 文件类型
   * @param {string} params.categoryId - 分类ID
   * @returns {Promise<Object>} 文件列表和分页信息
   */
  async getFileList(params = {}) {
    try {
      const { page = 1, pageSize = 20, fileType, categoryId } = params;

      const result = await request({
        url: '/api/file/list',
        method: 'GET',
        data: {
          page,
          pageSize,
          fileType,
          categoryId
        }
      });

      return result.data;
    } catch (error) {
      console.error('获取文件列表失败:', error);
      throw error;
    }
  }

  /**
   * 上传图片并压缩
   * @param {Object} options - 上传选项
   * @returns {Promise<Object>} 上传结果
   */
  async uploadImageWithCompression(options = {}) {
    try {
      const { filePath, quality = 0.8 } = options;
      
      if (!filePath) {
        throw new Error('文件路径不能为空');
      }

      // 压缩图片
      const compressedPath = await this.compressImage(filePath, quality);

      // 上传压缩后的图片
      return await this.uploadFile({
        ...options,
        filePath: compressedPath,
        fileType: 'image'
      });
    } catch (error) {
      console.error('图片上传并压缩失败:', error);
      showToast('图片上传失败');
      throw error;
    }
  }

  /**
   * 压缩图片
   * @param {string} filePath - 图片路径
   * @param {number} quality - 图片质量 (0-1)
   * @returns {Promise<string>} 压缩后的图片路径
   */
  async compressImage(filePath, quality = 0.8) {
    return new Promise((resolve, reject) => {
      wx.compressImage({
        src: filePath,
        quality: quality * 100, // 微信API要求质量是1-100的整数
        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: reject
      });
    });
  }

  /**
   * 预览图片
   * @param {Array} urls - 图片URL数组
   * @param {number} current - 当前显示的图片索引
   * @returns {Promise<void>}
   */
  previewImage(urls, current = 0) {
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error('图片URL数组不能为空');
    }

    return new Promise((resolve, reject) => {
      wx.previewImage({
        urls,
        current: urls[current] || urls[0],
        success: resolve,
        fail: reject
      });
    });
  }

  /**
   * 清除文件缓存
   */
  clearFileCache() {
    this.fileCacheManager.clear();
  }
}

// 导出文件服务实例
const fileService = new FileService();

// 导出文件服务的常用方法
export const {
  uploadFile,
  batchUploadFiles,
  getFileInfo,
  getFileUrl,
  downloadFile,
  deleteFile,
  getFileList,
  uploadImageWithCompression,
  compressImage,
  previewImage,
  clearFileCache
} = fileService;

// 默认导出文件服务实例
export default fileService;
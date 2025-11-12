/**
 * file-service.js - 文件服务模块
 * 提供文件上传、下载、预览等相关功能
 */

const { request, upload } = require('./api');
const { showToast } = require('./global');
const { CACHE_KEYS, CACHE_DURATION, CacheManager } = require('./cache');

/**
 * 文件服务类
 * 处理文件上传、下载、预览等操作
 */
class FileService {
  constructor() {
    // 初始化文件缓存管理器
    this.fileCacheManager = new CacheManager(CACHE_KEYS.FILE_INFO_PREFIX, CACHE_DURATION.MEDIUM);
  }

  /**
   * 上传单个文件
   * @param {Object} options - 上传配置
   * @param {string} options.filePath - 文件本地路径
   * @param {string} options.name - 上传文件的字段名
   * @param {Object} options.formData - 额外表单数据
   * @param {string} options.fileType - 文件类型：image, video, audio, file
   * @param {Function} options.onProgressUpdate - 上传进度回调函数
   * @returns {Promise<Object>} 上传结果
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
      console.error('文件上传失败', error);
      showToast('文件上传失败');
      throw error;
    }
  }

  /**
   * 批量上传文件
   * @param {Array} files - 文件列表，每项包含filePath和name属性
   * @param {Object} options - 上传配置
   * @returns {Promise<Array>} 所有文件的上传结果
   */
  async batchUploadFiles(files, options = {}) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('文件列表不能为空');
    }

    try {
      // 并行上传所有文件
      const uploadPromises = files.map(file => 
        this.uploadFile({
          ...options,
          filePath: file.filePath,
          name: file.name || 'file'
        })
      );

      // 使用Promise.all统一处理结果
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

      // 优先尝试从缓存获取
      const cachedInfo = this.fileCacheManager.get(fileId);
      if (cachedInfo) {
        return cachedInfo;
      }

      // 缓存不存在则请求服务器获取
      const result = await request({
        url: `/api/file/info/${fileId}`,
        method: 'GET'
      });

      if (result.data) {
        // 更新缓存
        this.fileCacheManager.set(fileId, result.data);
        return result.data;
      } else {
        throw new Error('获取文件信息失败');
      }
    } catch (error) {
      console.error('获取文件信息失败', error);
      showToast('获取文件信息失败');
      throw error;
    }
  }

  /**
   * 获取文件URL
   * @param {string} fileId - 文件ID
   * @param {Object} options - 选项参数
   * @param {string} options.size - 图片尺寸参数，仅对图片有效
   * @param {boolean} options.needFullUrl - 是否需要完整URL
   * @returns {Promise<string>} 文件访问URL
   */
  async getFileUrl(fileId, options = {}) {
    try {
      if (!fileId) {
        throw new Error('文件ID不能为空');
      }

      // 尝试从缓存获取文件信息
      let fileInfo = this.fileCacheManager.get(fileId);
      
      // 缓存不存在则请求服务器
      if (!fileInfo) {
        fileInfo = await this.getFileInfo(fileId);
      }

      // 如果已有url字段，直接返回
      if (fileInfo && fileInfo.url) {
        return fileInfo.url;
      }

      // 构建文件访问URL
      let url = `/api/file/download/${fileId}`;
      
      // 处理图片尺寸参数
      if (options.size && fileInfo && fileInfo.type === 'image') {
        url += `?size=${options.size}`;
      }

      // 如果需要完整URL，添加域名前缀
      if (options.needFullUrl && fileInfo && fileInfo.fullUrl) {
        return fileInfo.fullUrl;
      }

      return url;
    } catch (error) {
      console.error('获取文件URL失败', error);
      showToast('获取文件URL失败');
      throw error;
    }
  }

  /**
   * 下载文件
   * @param {string} fileId - 文件ID
   * @param {Object} options - 下载选项
   * @param {string} options.filePath - 保存文件路径，不传则由系统决定
   * @param {Function} options.onProgressUpdate - 下载进度回调
   * @returns {Promise<Object>} 下载结果
   */
  async downloadFile(fileId, options = {}) {
    try {
      if (!fileId) {
        throw new Error('文件ID不能为空');
      }
      
      const { filePath, onProgressUpdate } = options;
      
      // 获取文件下载URL
      const downloadUrl = await this.getFileUrl(fileId);
      
      // 调用下载API
      const result = await request({
        url: downloadUrl,
        method: 'GET',
        responseType: 'blob',
        onProgressUpdate,
        filePath
      });
      
      return result;
    } catch (error) {
      console.error('文件下载失败', error);
      showToast('文件下载失败');
      throw error;
    }
  }
  
  /**
   * 删除文件
   * @param {string} fileId - 文件ID
   * @returns {Promise<Object>} 删除结果
   */
  async deleteFile(fileId) {
    try {
      if (!fileId) {
        throw new Error('文件ID不能为空');
      }
      
      const result = await request({
        url: `/api/file/delete/${fileId}`,
        method: 'POST'
      });
      
      // 删除缓存
      this.fileCacheManager.remove(fileId);
      
      return result.data;
    } catch (error) {
      console.error('文件删除失败', error);
      showToast('文件删除失败');
      throw error;
    }
  }
  
  /**
   * 获取文件列表
   * @param {Object} params - 查询参数
   * @param {string} params.fileType - 文件类型筛选
   * @param {number} params.page - 页码
   * @param {number} params.pageSize - 每页数量
   * @returns {Promise<Object>} 文件列表和分页信息
   */
  async getFileList(params = {}) {
    try {
      const result = await request({
        url: '/api/file/list',
        method: 'GET',
        data: params
      });
      
      return result.data;
    } catch (error) {
      console.error('获取文件列表失败', error);
      showToast('获取文件列表失败');
      throw error;
    }
  }
  
  /**
   * 压缩图片并上传
   * @param {Object} options - 压缩上传选项
   * @param {string} options.filePath - 图片路径
   * @param {Object} options.formData - 额外表单数据
   * @param {Function} options.onProgressUpdate - 上传进度回调
   * @returns {Promise<Object>} 上传结果
   */
  async uploadImageWithCompression(options = {}) {
    try {
      const { filePath, formData, onProgressUpdate } = options;
      
      if (!filePath) {
        throw new Error('图片路径不能为空');
      }
      
      // 先压缩图片
      const compressedImage = await this.compressImage({
        filePath
      });
      
      // 上传压缩后的图片
      return await this.uploadFile({
        filePath: compressedImage.tempFilePath,
        name: 'image',
        fileType: 'image',
        formData,
        onProgressUpdate
      });
    } catch (error) {
      console.error('压缩图片上传失败', error);
      showToast('压缩图片上传失败');
      throw error;
    }
  }
  
  /**
   * 压缩图片
   * @param {Object} options - 压缩选项
   * @param {string} options.filePath - 图片路径
   * @param {number} options.quality - 压缩质量(0-1)
   * @param {number} options.maxWidth - 最大宽度
   * @returns {Promise<Object>} 压缩结果
   */
  async compressImage(options = {}) {
    try {
      const { filePath, quality = 0.8, maxWidth = 1080 } = options;
      
      if (!filePath) {
        throw new Error('图片路径不能为空');
      }
      
      // 调用小程序API进行图片压缩
      return await wx.compressImage({
        src: filePath,
        quality: Math.floor(quality * 100),
        success: res => res,
        fail: err => Promise.reject(err)
      });
    } catch (error) {
      console.error('图片压缩失败', error);
      showToast('图片压缩失败');
      throw error;
    }
  }
  
  /**
   * 预览图片
   * @param {Array} urls - 图片URL列表
   * @param {number} current - 当前显示图片的索引
   */
  previewImage(urls, current = 0) {
    if (!Array.isArray(urls) || urls.length === 0) {
      console.error('预览图片失败：图片列表不能为空');
      return;
    }
    
    // 确保current在有效范围内
    const currentIndex = Math.max(0, Math.min(current, urls.length - 1));
    
    // 调用小程序预览图片API
    wx.previewImage({
      urls: urls,
      current: urls[currentIndex],
      success: res => res,
      fail: err => {
        console.error('预览图片失败', err);
        showToast('预览图片失败');
      }
    });
  }
  
  /**
   * 清除文件缓存
   * @param {string} fileId - 文件ID，不传则清除所有文件缓存
   */
  clearFileCache(fileId = null) {
    if (fileId) {
      this.fileCacheManager.remove(fileId);
    } else {
      this.fileCacheManager.clearAll();
    }
  }
}

const fileService = new FileService();

// 导出fileService实例
const fileServiceExports = {
  uploadFile: fileService.uploadFile.bind(fileService),
  batchUploadFiles: fileService.batchUploadFiles.bind(fileService),
  getFileInfo: fileService.getFileInfo.bind(fileService),
  getFileUrl: fileService.getFileUrl.bind(fileService),
  downloadFile: fileService.downloadFile.bind(fileService),
  deleteFile: fileService.deleteFile.bind(fileService),
  getFileList: fileService.getFileList.bind(fileService),
  uploadImageWithCompression: fileService.uploadImageWithCompression.bind(fileService),
  compressImage: fileService.compressImage.bind(fileService),
  previewImage: fileService.previewImage.bind(fileService),
  clearFileCache: fileService.clearFileCache.bind(fileService)
};

module.exports = fileServiceExports;
module.exports.default = fileService;
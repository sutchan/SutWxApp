/**
 * upload.js - 文件上传工具模块
 * 提供图片选择、上传、预览等功能
 * 支持文件验证、错误重试、进度跟踪等增强特性
 */

// 导入工具函数
const utils = require('./utils');

// 配置常量
const MAX_RETRY_COUNT = 3; // 最大重试次数
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 最大文件大小10MB
const SUPPORTED_IMAGE_TYPES = ['jpg', 'jpeg', 'png', 'gif', 'webp'];

/**
 * 验证图片文件
 * @param {string} filePath - 文件路径
 * @returns {object} 验证结果 {valid: boolean, error: string}
 */
function validateImageFile(filePath) {
  // 检查文件类型
  const extension = filePath.split('.').pop().toLowerCase();
  if (!SUPPORTED_IMAGE_TYPES.includes(extension)) {
    return {
      valid: false,
      error: `不支持的图片格式，请选择 ${SUPPORTED_IMAGE_TYPES.join('/')} 格式`
    };
  }
  
  return { valid: true };
}

/**
 * 上传单张图片（带重试机制）
 * @param {string} filePath - 本地文件路径
 * @param {object} options - 上传选项
 * @param {Function} options.success - 上传成功回调
 * @param {Function} options.fail - 上传失败回调
 * @param {Function} options.progress - 上传进度回调
 * @param {number} options.retryCount - 当前重试次数（内部使用）
 * @returns {Promise} 返回Promise对象
 */
function uploadImage(filePath, options = {}, retryCount = 0) {
  const app = getApp();
  const { success, fail, progress } = options;
  
  return new Promise((resolve, reject) => {
    // 检查是否有token
    if (!app.globalData.token) {
      const error = { errMsg: '未登录或登录已过期，请重新登录', code: 401 };
      if (fail) fail(error);
      reject(error);
      return;
    }

    // 验证文件
    const validation = validateImageFile(filePath);
    if (!validation.valid) {
      const error = { errMsg: validation.error, code: 400 };
      if (fail) fail(error);
      reject(error);
      return;
    }

    // 检查网络状态
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          const error = { errMsg: '当前无网络连接，请检查网络设置', code: 0 };
          if (fail) fail(error);
          reject(error);
          return;
        }

        // 执行上传
        performUpload();
      },
      fail: () => {
        // 网络检查失败时继续执行上传
        performUpload();
      }
    });

    function performUpload() {
      wx.uploadFile({
        url: `${app.globalData.apiBaseUrl}/api/upload/image`,
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${app.globalData.token}`,
          'content-type': 'multipart/form-data'
        },
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (data.code === 200) {
              if (success) success(data.data);
              resolve(data.data);
            } else {
              const error = {
                errMsg: data.message || '上传失败',
                code: data.code || 500
              };
              handleUploadError(error);
            }
          } catch (e) {
            const error = {
              errMsg: '服务器返回数据格式错误',
              code: 500
            };
            handleUploadError(error);
          }
        },
        fail: (error) => {
          handleUploadError(error);
        },
        progress: (res) => {
          if (progress) {
            progress({
              percent: res.progress,
              totalBytesSent: res.totalBytesSent,
              totalBytesExpectedToSend: res.totalBytesExpectedToSend,
              fileName: filePath.split('/').pop()
            });
          }
        }
      });
    }

    function handleUploadError(error) {
      // 处理重试逻辑
      if (retryCount < MAX_RETRY_COUNT && isRetryableError(error)) {
        retryCount++;
        console.log(`图片上传失败，正在进行第${retryCount}次重试...`);
        
        // 指数退避策略
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          uploadImage(filePath, options, retryCount).then(resolve).catch(reject);
        }, delay);
      } else {
        if (fail) fail(error);
        reject(error);
      }
    }

    function isRetryableError(error) {
      // 网络错误、服务器错误可以重试
      return error.code >= 500 || error.errMsg.includes('network') || 
             error.errMsg.includes('request:fail');
    }
  });
}

/**
 * 上传多张图片
 * @param {Array} filePaths - 本地文件路径数组
 * @param {object} options - 上传选项
 * @param {Function} options.success - 单张上传成功回调
 * @param {Function} options.fail - 单张上传失败回调
 * @param {Function} options.progress - 单张上传进度回调
 * @param {Function} options.totalProgress - 总体上传进度回调
 * @param {Function} options.complete - 全部上传完成回调
 * @param {boolean} options.concurrentUpload - 是否并发上传，默认true
 * @param {number} options.maxConcurrent - 最大并发数，默认3
 * @returns {Promise} 返回Promise对象，resolve时返回结果数组
 */
function uploadImages(filePaths, options = {}) {
  const { 
    success, 
    fail, 
    progress, 
    totalProgress, 
    complete,
    concurrentUpload = true,
    maxConcurrent = 3
  } = options;
  
  const results = [];
  let uploadedCount = 0;
  let totalBytesSent = 0;
  let totalBytesExpectedToSend = 0;
  let currentUploads = 0;
  let queueIndex = 0;
  let isAllFilesValidated = false;
  
  return new Promise((resolve) => {
    if (!filePaths || filePaths.length === 0) {
      resolve([]);
      return;
    }

    // 初始化结果数组
    filePaths.forEach((_, index) => {
      results[index] = { success: false };
    });

    // 如果不使用并发上传，则顺序上传
    if (!concurrentUpload) {
      uploadNext();
      return;
    }

    // 并发上传
    startConcurrentUploads();

    function startConcurrentUploads() {
      // 启动初始并发上传
      while (currentUploads < maxConcurrent && queueIndex < filePaths.length) {
        uploadFileAtIndex(queueIndex++);
      }
    }

    function uploadNext() {
      if (queueIndex >= filePaths.length) {
        checkComplete();
        return;
      }
      
      uploadFileAtIndex(queueIndex++);
    }

    function uploadFileAtIndex(index) {
      const filePath = filePaths[index];
      
      // 更新当前上传数
      currentUploads++;

      uploadImage(filePath, {
        success: (data) => {
          if (success) success(data, index);
          results[index] = { success: true, data };
          uploadedCount++;
          currentUploads--;
          
          if (concurrentUpload) {
            uploadNext();
          } else {
            checkComplete();
          }
        },
        fail: (error) => {
          if (fail) fail(error, index);
          results[index] = { success: false, error };
          uploadedCount++;
          currentUploads--;
          
          if (concurrentUpload) {
            uploadNext();
          } else {
            checkComplete();
          }
        },
        progress: (res) => {
          // 更新总进度
          updateTotalProgress(res, index);
          
          if (progress) progress(res, index);
        }
      });
    }

    function updateTotalProgress(res, index) {
      // 更新单个文件的进度信息
      totalBytesExpectedToSend += res.totalBytesExpectedToSend;
      
      // 更新已发送字节数
      const previousSent = results[index].bytesSent || 0;
      totalBytesSent = totalBytesSent - previousSent + res.totalBytesSent;
      results[index].bytesSent = res.totalBytesSent;
      
      // 计算总体进度
      const overallPercent = Math.round((totalBytesSent / totalBytesExpectedToSend) * 100);
      
      if (totalProgress) {
        totalProgress({
          percent: overallPercent,
          totalBytesSent: totalBytesSent,
          totalBytesExpectedToSend: totalBytesExpectedToSend,
          completedCount: results.filter(r => r.success).length,
          totalCount: filePaths.length
        });
      }
    }

    function checkComplete() {
      if (uploadedCount === filePaths.length) {
        if (complete) complete(results);
        resolve(results);
      }
    }
  });
}

/**
 * 选择并上传图片
 * @param {object} options - 选项配置
 * @param {number} options.count - 最多选择图片数量
 * @param {Array} options.sizeType - 图片尺寸类型 ['original', 'compressed']
 * @param {Array} options.sourceType - 图片来源 ['album', 'camera']
 * @param {Function} options.chooseSuccess - 选择成功回调
 * @param {Function} options.uploadSuccess - 上传成功回调
 * @param {Function} options.uploadFail - 上传失败回调
 * @param {Function} options.progress - 上传进度回调
 * @param {Function} options.totalProgress - 多图上传总体进度回调
 * @param {boolean} options.showLoading - 是否显示加载提示
 * @param {string} options.loadingTitle - 加载提示文字
 * @returns {Promise} 返回Promise对象
 */
function chooseAndUploadImage(options = {}) {
  const {
    count = 1,
    sizeType = ['compressed'],
    sourceType = ['album', 'camera'],
    chooseSuccess,
    uploadSuccess,
    uploadFail,
    progress,
    totalProgress,
    showLoading = true,
    loadingTitle = '上传中...'
  } = options;
  
  return new Promise((resolve, reject) => {
    // 选择图片
    wx.chooseImage({
      count: count,
      sizeType: sizeType,
      sourceType: sourceType,
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        if (chooseSuccess) chooseSuccess(tempFilePaths);
        
        // 显示加载提示
        if (showLoading && tempFilePaths.length > 0) {
          wx.showLoading({
            title: loadingTitle,
            mask: true
          });
        }
        
        // 如果只选择了一张图片，直接上传
        if (tempFilePaths.length === 1) {
          uploadImage(tempFilePaths[0], {
            success: (data) => {
              if (showLoading) wx.hideLoading();
              if (uploadSuccess) uploadSuccess(data);
              resolve(data);
            },
            fail: (error) => {
              if (showLoading) wx.hideLoading();
              if (uploadFail) uploadFail(error);
              reject(error);
            },
            progress: progress
          });
        } else {
          // 多张图片上传
          uploadImages(tempFilePaths, {
            success: uploadSuccess,
            fail: uploadFail,
            progress: progress,
            totalProgress: totalProgress,
            complete: (results) => {
              if (showLoading) wx.hideLoading();
              resolve(results);
            }
          });
        }
      },
      fail: (error) => {
        // 用户取消选择不算错误
        if (!error.errMsg.includes('cancel')) {
          reject(error);
        } else {
          resolve(null);
        }
      }
    });
  });
}

/**
 * 预览图片
 * @param {Array} urls - 图片URL数组
 * @param {number} current - 当前显示图片的索引
 * @param {object} options - 预览选项
 * @param {Function} options.success - 预览成功回调
 * @param {Function} options.fail - 预览失败回调
 */
function previewImage(urls, current = 0, options = {}) {
  const { success, fail } = options;
  
  // 确保urls是数组
  if (!Array.isArray(urls) || urls.length === 0) {
    const error = { errMsg: '预览图片数组不能为空' };
    if (fail) fail(error);
    return;
  }
  
  // 确保current在有效范围内
  current = Math.max(0, Math.min(current, urls.length - 1));
  
  wx.previewImage({
    current: urls[current],
    urls: urls,
    success: (res) => {
      if (success) success(res);
    },
    fail: (error) => {
      if (fail) fail(error);
    }
  });
}

/**
 * 压缩图片
 * @param {string} filePath - 原图路径
 * @param {object} options - 压缩选项
 * @param {number} options.quality - 压缩质量(0-1)
 * @param {number} options.maxWidth - 最大宽度
 * @param {number} options.maxHeight - 最大高度
 * @returns {Promise} 返回Promise对象，resolve压缩后的图片路径
 */
function compressImage(filePath, options = {}) {
  const { quality = 0.8, maxWidth = 1920, maxHeight = 1920 } = options;
  
  return new Promise((resolve, reject) => {
    wx.compressImage({
      src: filePath,
      quality: Math.round(quality * 100),
      success: (res) => {
        resolve(res.tempFilePath);
      },
      fail: (error) => {
        // 压缩失败时返回原图路径
        console.warn('图片压缩失败，使用原图', error);
        resolve(filePath);
      }
    });
  });
}

// 导出所有函数
module.exports = {
  uploadImage,
  uploadImages,
  chooseAndUploadImage,
  previewImage,
  compressImage,
  validateImageFile
};

/**
 * 模块版本信息
 */
module.exports.version = '1.0.0';

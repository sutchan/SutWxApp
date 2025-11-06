// 图片上传工具类
// 用于处理小程序中的图片上传功能

/**
 * 上传单张图片到服务器
 * @param {string} filePath - 本地图片路径
 * @param {object} options - 上传选项
 * @param {Function} options.success - 上传成功回调
 * @param {Function} options.fail - 上传失败回调
 * @param {Function} options.progress - 上传进度回调
 * @returns {Promise} 返回Promise对象
 */
export function uploadImage(filePath, options = {}) {
  const app = getApp();
  const { success, fail, progress } = options;
  
  return new Promise((resolve, reject) => {
    // 检查token是否存在
    if (!app.globalData.token) {
      const error = { errMsg: '未登录，请先登录', code: 401 };
      if (fail) fail(error);
      reject(error);
      return;
    }

    wx.uploadFile({
      url: `${app.globalData.apiBaseUrl}/upload/image`,
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
            if (fail) fail(error);
            reject(error);
          }
        } catch (e) {
          const error = {
            errMsg: '服务器响应格式错误',
            code: 500
          };
          if (fail) fail(error);
          reject(error);
        }
      },
      fail: (error) => {
        if (fail) fail(error);
        reject(error);
      },
      progress: (res) => {
        if (progress) {
          progress({
            percent: res.progress,
            totalBytesSent: res.totalBytesSent,
            totalBytesExpectedToSend: res.totalBytesExpectedToSend
          });
        }
      }
    });
  });
}

/**
 * 上传多张图片
 * @param {Array} filePaths - 本地图片路径数组
 * @param {object} options - 上传选项
 * @param {Function} options.success - 单张上传成功回调
 * @param {Function} options.fail - 单张上传失败回调
 * @param {Function} options.progress - 单张上传进度回调
 * @param {Function} options.complete - 全部上传完成回调
 * @returns {Promise} 返回Promise对象，resolve值为上传结果数组
 */
export function uploadImages(filePaths, options = {}) {
  const { success, fail, progress, complete } = options;
  const results = [];
  
  return new Promise((resolve, reject) => {
    if (!filePaths || filePaths.length === 0) {
      resolve([]);
      return;
    }
    
    let uploadedCount = 0;
    
    filePaths.forEach((filePath, index) => {
      uploadImage(filePath, {
        success: (data) => {
          if (success) success(data, index);
          results[index] = { success: true, data };
          checkComplete();
        },
        fail: (error) => {
          if (fail) fail(error, index);
          results[index] = { success: false, error };
          checkComplete();
        },
        progress: (res) => {
          if (progress) progress(res, index);
        }
      });
    });
    
    function checkComplete() {
      uploadedCount++;
      if (uploadedCount === filePaths.length) {
        if (complete) complete(results);
        resolve(results);
      }
    }
  });
}

/**
 * 从相册选择并上传图片
 * @param {object} options - 选择和上传选项
 * @param {number} options.count - 选择图片数量，默认1
 * @param {Array} options.sizeType - 压缩类型，默认['compressed']
 * @param {Array} options.sourceType - 来源类型，默认['album', 'camera']
 * @param {Function} options.chooseSuccess - 选择成功回调
 * @param {Function} options.uploadSuccess - 上传成功回调
 * @param {Function} options.uploadFail - 上传失败回调
 * @param {Function} options.progress - 上传进度回调
 * @returns {Promise} 返回Promise对象
 */
export function chooseAndUploadImage(options = {}) {
  const {
    count = 1,
    sizeType = ['compressed'],
    sourceType = ['album', 'camera'],
    chooseSuccess,
    uploadSuccess,
    uploadFail,
    progress
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
        
        // 如果只选择一张，直接上传
        if (count === 1) {
          uploadImage(tempFilePaths[0], {
            success: (data) => {
              if (uploadSuccess) uploadSuccess(data);
              resolve(data);
            },
            fail: (error) => {
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
            complete: (results) => {
              resolve(results);
            }
          });
        }
      },
      fail: (error) => {
        reject(error);
      }
    });
  });
}

/**
 * 预览图片
 * @param {Array} urls - 图片URL数组
 * @param {number} current - 当前预览的图片索引
 */
export function previewImage(urls, current = 0) {
  wx.previewImage({
    current: urls[current],
    urls: urls
  });
}

// 导出所有函数
export default {
  uploadImage,
  uploadImages,
  chooseAndUploadImage,
  previewImage
};
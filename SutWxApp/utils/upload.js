// 鍥剧墖涓婁紶宸ュ叿绫?// 鐢ㄤ簬澶勭悊灏忕▼搴忎腑鐨勫浘鐗囦笂浼犲姛鑳?
/**
 * 涓婁紶鍗曞紶鍥剧墖鍒版湇鍔″櫒
 * @param {string} filePath - 鏈湴鍥剧墖璺緞
 * @param {object} options - 涓婁紶閫夐」
 * @param {Function} options.success - 涓婁紶鎴愬姛鍥炶皟
 * @param {Function} options.fail - 涓婁紶澶辫触鍥炶皟
 * @param {Function} options.progress - 涓婁紶杩涘害鍥炶皟
 * @returns {Promise} 杩斿洖Promise瀵硅薄
 */
export function uploadImage(filePath, options = {}) {
  const app = getApp();
  const { success, fail, progress } = options;
  
  return new Promise((resolve, reject) => {
    // 妫€鏌oken鏄惁瀛樺湪
    if (!app.globalData.token) {
      const error = { errMsg: '鏈櫥褰曪紝璇峰厛鐧诲綍', code: 401 };
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
              errMsg: data.message || '涓婁紶澶辫触',
              code: data.code || 500
            };
            if (fail) fail(error);
            reject(error);
          }
        } catch (e) {
          const error = {
            errMsg: '鏈嶅姟鍣ㄥ搷搴旀牸寮忛敊璇?,
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
 * 涓婁紶澶氬紶鍥剧墖
 * @param {Array} filePaths - 鏈湴鍥剧墖璺緞鏁扮粍
 * @param {object} options - 涓婁紶閫夐」
 * @param {Function} options.success - 鍗曞紶涓婁紶鎴愬姛鍥炶皟
 * @param {Function} options.fail - 鍗曞紶涓婁紶澶辫触鍥炶皟
 * @param {Function} options.progress - 鍗曞紶涓婁紶杩涘害鍥炶皟
 * @param {Function} options.complete - 鍏ㄩ儴涓婁紶瀹屾垚鍥炶皟
 * @returns {Promise} 杩斿洖Promise瀵硅薄锛宺esolve鍊间负涓婁紶缁撴灉鏁扮粍
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
 * 浠庣浉鍐岄€夋嫨骞朵笂浼犲浘鐗? * @param {object} options - 閫夋嫨鍜屼笂浼犻€夐」
 * @param {number} options.count - 閫夋嫨鍥剧墖鏁伴噺锛岄粯璁?
 * @param {Array} options.sizeType - 鍘嬬缉绫诲瀷锛岄粯璁'compressed']
 * @param {Array} options.sourceType - 鏉ユ簮绫诲瀷锛岄粯璁'album', 'camera']
 * @param {Function} options.chooseSuccess - 閫夋嫨鎴愬姛鍥炶皟
 * @param {Function} options.uploadSuccess - 涓婁紶鎴愬姛鍥炶皟
 * @param {Function} options.uploadFail - 涓婁紶澶辫触鍥炶皟
 * @param {Function} options.progress - 涓婁紶杩涘害鍥炶皟
 * @returns {Promise} 杩斿洖Promise瀵硅薄
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
    // 閫夋嫨鍥剧墖
    wx.chooseImage({
      count: count,
      sizeType: sizeType,
      sourceType: sourceType,
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        if (chooseSuccess) chooseSuccess(tempFilePaths);
        
        // 濡傛灉鍙€夋嫨涓€寮狅紝鐩存帴涓婁紶
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
          // 澶氬紶鍥剧墖涓婁紶
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
 * 棰勮鍥剧墖
 * @param {Array} urls - 鍥剧墖URL鏁扮粍
 * @param {number} current - 褰撳墠棰勮鐨勫浘鐗囩储寮? */
export function previewImage(urls, current = 0) {
  wx.previewImage({
    current: urls[current],
    urls: urls
  });
}

// 瀵煎嚭鎵€鏈夊嚱鏁?export default {
  uploadImage,
  uploadImages,
  chooseAndUploadImage,
  previewImage
};\n
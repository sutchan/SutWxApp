// file-service.js - 鏂囦欢瀛樺偍鏈嶅姟妯″潡
// 鍩轰簬鎶€鏈璁℃枃妗ｅ疄鐜扮殑鏂囦欢涓婁紶銆佷笅杞藉拰绠＄悊鏈嶅姟

import { request, upload } from './api';
import { showToast } from './global';
import { CACHE_KEYS, CACHE_DURATION, CacheManager } from './cache';

/**
 * 鏂囦欢瀛樺偍鏈嶅姟绫? * 鎻愪緵鏂囦欢涓婁紶銆佷笅杞姐€佸垹闄ょ瓑鍔熻兘
 */
class FileService {
  constructor() {
    // 鏂囦欢缂撳瓨绠＄悊鍣紝鐢ㄤ簬缂撳瓨涓婁紶鐨勬枃浠朵俊鎭?    this.fileCacheManager = new CacheManager(CACHE_KEYS.FILE_INFO_PREFIX, CACHE_DURATION.MEDIUM);
  }

  /**
   * 涓婁紶鍗曚釜鏂囦欢
   * @param {Object} options - 涓婁紶閫夐」
   * @param {string} options.filePath - 鏂囦欢璺緞
   * @param {string} options.name - 涓婁紶鏂囦欢鐨勫悕绉?   * @param {Object} options.formData - 鍏朵粬琛ㄥ崟鏁版嵁
   * @param {string} options.fileType - 鏂囦欢绫诲瀷锛坕mage, video, audio, file绛夛級
   * @param {Function} options.onProgressUpdate - 涓婁紶杩涘害鍥炶皟鍑芥暟
   * @returns {Promise<Object>} 鏂囦欢涓婁紶缁撴灉
   */
  async uploadFile(options = {}) {
    try {
      const { filePath, name = 'file', formData = {}, fileType = 'file', onProgressUpdate } = options;
      
      if (!filePath) {
        throw new Error('鏂囦欢璺緞涓嶈兘涓虹┖');
      }

      // 鏍规嵁鏂囦欢绫诲瀷閫夋嫨涓嶅悓鐨勪笂浼犳帴鍙?      let uploadUrl = '/api/file/upload';
      if (fileType === 'image') {
        uploadUrl = '/api/file/upload/image';
      } else if (fileType === 'video') {
        uploadUrl = '/api/file/upload/video';
      } else if (fileType === 'audio') {
        uploadUrl = '/api/file/upload/audio';
      }

      // 璋冪敤涓婁紶API
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

      // 缂撳瓨鏂囦欢淇℃伅
      if (result.data && result.data.fileId) {
        this.fileCacheManager.set(result.data.fileId, result.data);
      }

      return result.data;
    } catch (error) {
      console.error('鏂囦欢涓婁紶澶辫触:', error);
      showToast('鏂囦欢涓婁紶澶辫触');
      throw error;
    }
  }

  /**
   * 鎵归噺涓婁紶鏂囦欢
   * @param {Array} files - 鏂囦欢鏁扮粍锛屾瘡涓枃浠跺寘鍚玣ilePath鍜宯ame灞炴€?   * @param {Object} options - 涓婁紶閫夐」
   * @returns {Promise<Array>} 鎵€鏈夋枃浠朵笂浼犵粨鏋?   */
  async batchUploadFiles(files, options = {}) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new Error('鏂囦欢鏁扮粍涓嶈兘涓虹┖');
    }

    try {
      // 骞跺彂涓婁紶鎵€鏈夋枃浠?      const uploadPromises = files.map(file => 
        this.uploadFile({
          ...options,
          filePath: file.filePath,
          name: file.name || 'file'
        })
      );

      // 浣跨敤Promise.all绛夊緟鎵€鏈変笂浼犲畬鎴?      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('鎵归噺鏂囦欢涓婁紶澶辫触:', error);
      showToast('鎵归噺鏂囦欢涓婁紶澶辫触');
      throw error;
    }
  }

  /**
   * 鑾峰彇鏂囦欢淇℃伅
   * @param {string} fileId - 鏂囦欢ID
   * @returns {Promise<Object>} 鏂囦欢淇℃伅
   */
  async getFileInfo(fileId) {
    try {
      if (!fileId) {
        throw new Error('鏂囦欢ID涓嶈兘涓虹┖');
      }

      // 鍏堝皾璇曚粠缂撳瓨鑾峰彇
      const cachedInfo = this.fileCacheManager.get(fileId);
      if (cachedInfo) {
        return cachedInfo;
      }

      // 缂撳瓨鏈懡涓紝浠庢湇鍔″櫒鑾峰彇
      const result = await request({
        url: `/api/file/info/${fileId}`,
        method: 'GET'
      });

      // 鏇存柊缂撳瓨
      if (result.data) {
        this.fileCacheManager.set(fileId, result.data);
      }

      return result.data;
    } catch (error) {
      console.error('鑾峰彇鏂囦欢淇℃伅澶辫触:', error);
      throw error;
    }
  }

  /**
   * 鑾峰彇鏂囦欢涓嬭浇URL
   * @param {string} fileId - 鏂囦欢ID
   * @param {Object} options - 涓嬭浇閫夐」
   * @returns {Promise<string>} 涓嬭浇URL
   */
  async getFileUrl(fileId, options = {}) {
    try {
      if (!fileId) {
        throw new Error('鏂囦欢ID涓嶈兘涓虹┖');
      }

      // 浠庢湇鍔″櫒鑾峰彇涓嬭浇URL
      const result = await request({
        url: `/api/file/url/${fileId}`,
        method: 'GET',
        data: options
      });

      return result.data.url;
    } catch (error) {
      console.error('鑾峰彇鏂囦欢URL澶辫触:', error);
      throw error;
    }
  }

  /**
   * 涓嬭浇鏂囦欢
   * @param {string} fileId - 鏂囦欢ID
   * @param {Object} options - 涓嬭浇閫夐」
   * @returns {Promise<Object>} 涓嬭浇缁撴灉
   */
  async downloadFile(fileId, options = {}) {
    try {
      // 鑾峰彇鏂囦欢URL
      const downloadUrl = await this.getFileUrl(fileId, options);
      
      // 璋冪敤寰俊涓嬭浇API
      return new Promise((resolve, reject) => {
        wx.downloadFile({
          url: downloadUrl,
          success: (res) => {
            if (res.statusCode === 200) {
              resolve({ path: res.tempFilePath });
            } else {
              reject(new Error(`涓嬭浇澶辫触: ${res.statusCode}`));
            }
          },
          fail: reject,
          ...options
        });
      });
    } catch (error) {
      console.error('鏂囦欢涓嬭浇澶辫触:', error);
      showToast('鏂囦欢涓嬭浇澶辫触');
      throw error;
    }
  }

  /**
   * 鍒犻櫎鏂囦欢
   * @param {string} fileId - 鏂囦欢ID
   * @returns {Promise<boolean>} 鍒犻櫎缁撴灉
   */
  async deleteFile(fileId) {
    try {
      if (!fileId) {
        throw new Error('鏂囦欢ID涓嶈兘涓虹┖');
      }

      // 璋冪敤鍒犻櫎API
      await request({
        url: `/api/file/delete/${fileId}`,
        method: 'POST'
      });

      // 浠庣紦瀛樹腑绉婚櫎
      this.fileCacheManager.remove(fileId);
      
      return true;
    } catch (error) {
      console.error('鏂囦欢鍒犻櫎澶辫触:', error);
      showToast('鏂囦欢鍒犻櫎澶辫触');
      throw error;
    }
  }

  /**
   * 鑾峰彇鏂囦欢鍒楄〃
   * @param {Object} params - 鏌ヨ鍙傛暟
   * @param {number} params.page - 椤电爜
   * @param {number} params.pageSize - 姣忛〉鏁伴噺
   * @param {string} params.fileType - 鏂囦欢绫诲瀷
   * @param {string} params.categoryId - 鍒嗙被ID
   * @returns {Promise<Object>} 鏂囦欢鍒楄〃鍜屽垎椤典俊鎭?   */
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
      console.error('鑾峰彇鏂囦欢鍒楄〃澶辫触:', error);
      throw error;
    }
  }

  /**
   * 涓婁紶鍥剧墖骞跺帇缂?   * @param {Object} options - 涓婁紶閫夐」
   * @returns {Promise<Object>} 涓婁紶缁撴灉
   */
  async uploadImageWithCompression(options = {}) {
    try {
      const { filePath, quality = 0.8 } = options;
      
      if (!filePath) {
        throw new Error('鏂囦欢璺緞涓嶈兘涓虹┖');
      }

      // 鍘嬬缉鍥剧墖
      const compressedPath = await this.compressImage(filePath, quality);

      // 涓婁紶鍘嬬缉鍚庣殑鍥剧墖
      return await this.uploadFile({
        ...options,
        filePath: compressedPath,
        fileType: 'image'
      });
    } catch (error) {
      console.error('鍥剧墖涓婁紶骞跺帇缂╁け璐?', error);
      showToast('鍥剧墖涓婁紶澶辫触');
      throw error;
    }
  }

  /**
   * 鍘嬬缉鍥剧墖
   * @param {string} filePath - 鍥剧墖璺緞
   * @param {number} quality - 鍥剧墖璐ㄩ噺 (0-1)
   * @returns {Promise<string>} 鍘嬬缉鍚庣殑鍥剧墖璺緞
   */
  async compressImage(filePath, quality = 0.8) {
    return new Promise((resolve, reject) => {
      wx.compressImage({
        src: filePath,
        quality: quality * 100, // 寰俊API瑕佹眰璐ㄩ噺鏄?-100鐨勬暣鏁?        success: (res) => {
          resolve(res.tempFilePath);
        },
        fail: reject
      });
    });
  }

  /**
   * 棰勮鍥剧墖
   * @param {Array} urls - 鍥剧墖URL鏁扮粍
   * @param {number} current - 褰撳墠鏄剧ず鐨勫浘鐗囩储寮?   * @returns {Promise<void>}
   */
  previewImage(urls, current = 0) {
    if (!Array.isArray(urls) || urls.length === 0) {
      throw new Error('鍥剧墖URL鏁扮粍涓嶈兘涓虹┖');
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
   * 娓呴櫎鏂囦欢缂撳瓨
   */
  clearFileCache() {
    this.fileCacheManager.clear();
  }
}

// 瀵煎嚭鏂囦欢鏈嶅姟瀹炰緥
const fileService = new FileService();

// 瀵煎嚭鏂囦欢鏈嶅姟鐨勫父鐢ㄦ柟娉?export const {
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

// 榛樿瀵煎嚭鏂囦欢鏈嶅姟瀹炰緥
export default fileService;\n
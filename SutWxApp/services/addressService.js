/**
 * 文件名: addressService.js
 * 版本号: 3.0.1
 * 更新日期: 2026-08-13
 * 描述: 收货地址服务，处理地址的增删改查、默认地址管理等功能
 */

const request = require("../utils/request");

/**
 * 收货地址服务模块
 */
const addressService = {
  /**
   * 获取地址列表
   * @param {Function} [success] 成功回调
   * @param {Function} [fail] 失败回调
   * @returns {Promise} 地址列表Promise
   */
  async getAddressList(success, fail) {
    try {
      const result = await request.get("/address/list", {}, { useCache: false });
      if (typeof success === "function") success(result);
      return Promise.resolve(result);
    } catch (error) {
      if (typeof fail === "function") fail(error);
      return Promise.reject(error);
    }
  },

  /**
   * 获取地址详情
   * @param {number|string} id 地址ID
   * @param {Function} [success] 成功回调
   * @param {Function} [fail] 失败回调
   * @returns {Promise} 地址详情Promise
   */
  async getAddressDetail(id, success, fail) {
    try {
      const result = await request.get(
        `/address/detail/${id}`,
        {},
        { useCache: false },
      );
      if (typeof success === "function") success(result);
      return Promise.resolve(result);
    } catch (error) {
      if (typeof fail === "function") fail(error);
      return Promise.reject(error);
    }
  },

  /**
   * 新增地址
   * @param {Object} data 地址数据
   * @param {Function} [success] 成功回调
   * @param {Function} [fail] 失败回调
   * @returns {Promise} 新增结果Promise
   */
  async addAddress(data, success, fail) {
    try {
      const result = await request.post("/address/add", data, { useCache: false });
      if (typeof success === "function") success(result);
      return Promise.resolve(result);
    } catch (error) {
      if (typeof fail === "function") fail(error);
      return Promise.reject(error);
    }
  },

  /**
   * 更新地址
   * @param {number|string} id 地址ID
   * @param {Object} data 地址数据
   * @param {Function} [success] 成功回调
   * @param {Function} [fail] 失败回调
   * @returns {Promise} 更新结果Promise
   */
  async updateAddress(id, data, success, fail) {
    try {
      const result = await request.put(
        `/address/update/${id}`,
        data,
        { useCache: false },
      );
      if (typeof success === "function") success(result);
      return Promise.resolve(result);
    } catch (error) {
      if (typeof fail === "function") fail(error);
      return Promise.reject(error);
    }
  },

  /**
   * 删除地址
   * @param {number|string} id 地址ID
   * @param {Function} [success] 成功回调
   * @param {Function} [fail] 失败回调
   * @returns {Promise} 删除结果Promise
   */
  async deleteAddress(id, success, fail) {
    try {
      const result = await request.delete(
        `/address/delete/${id}`,
        {},
        { useCache: false },
      );
      if (typeof success === "function") success(result);
      return Promise.resolve(result);
    } catch (error) {
      if (typeof fail === "function") fail(error);
      return Promise.reject(error);
    }
  },

  /**
   * 设置默认地址
   * @param {number|string} id 地址ID
   * @param {Function} [success] 成功回调
   * @param {Function} [fail] 失败回调
   * @returns {Promise} 设置结果Promise
   */
  async setDefaultAddress(id, success, fail) {
    try {
      const result = await request.post(
        `/address/set-default/${id}`,
        {},
        { useCache: false },
      );
      if (typeof success === "function") success(result);
      return Promise.resolve(result);
    } catch (error) {
      if (typeof fail === "function") fail(error);
      return Promise.reject(error);
    }
  },
};

module.exports = addressService;
module.exports.default = addressService;

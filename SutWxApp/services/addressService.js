/**
 * 文件名: addressService.js
 * 版本号: 3.4.1
 * 更新日期: 2026-09-19
 * 描述: 收货地址服务，处理地址的增删改查、默认地址管理等功能（Promise 风格，响应经 unwrap 解包）
 */

const request = require("../utils/request");
const { unwrap } = require("../utils/api");

/**
 * 获取地址列表
 * @returns {Promise<Array>} 地址列表
 */
async function getAddressList() {
  const raw = await request.get("/address/list", {}, { useCache: false });
  return unwrap(raw);
}

/**
 * 获取地址详情
 * @param {number|string} id 地址ID
 * @returns {Promise<Object>} 地址详情
 */
async function getAddressDetail(id) {
  const raw = await request.get(
    `/address/detail/${id}`,
    {},
    { useCache: false },
  );
  return unwrap(raw);
}

/**
 * 新增地址
 * @param {Object} data 地址数据
 * @returns {Promise<*>} 新增结果
 */
async function addAddress(data) {
  const raw = await request.post("/address/add", data, { useCache: false });
  return unwrap(raw);
}

/**
 * 更新地址
 * @param {number|string} id 地址ID
 * @param {Object} data 地址数据
 * @returns {Promise<*>} 更新结果
 */
async function updateAddress(id, data) {
  const raw = await request.put(
    `/address/update/${id}`,
    data,
    { useCache: false },
  );
  return unwrap(raw);
}

/**
 * 删除地址
 * @param {number|string} id 地址ID
 * @returns {Promise<*>} 删除结果
 */
async function deleteAddress(id) {
  const raw = await request.delete(
    `/address/delete/${id}`,
    {},
    { useCache: false },
  );
  return unwrap(raw);
}

/**
 * 设置默认地址
 * @param {number|string} id 地址ID
 * @returns {Promise<*>} 设置结果
 */
async function setDefaultAddress(id) {
  const raw = await request.post(
    `/address/set-default/${id}`,
    {},
    { useCache: false },
  );
  return unwrap(raw);
}

const addressService = {
  getAddressList,
  getAddressDetail,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};

module.exports = addressService;
module.exports.default = addressService;

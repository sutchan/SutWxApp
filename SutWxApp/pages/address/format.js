/**
 * 文件名: format.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 地址数据的映射、脱敏与表单构造（从 pages/address/index.js 抽离）
 */

/**
 * 手机号脱敏
 * @param {string} phone 原始手机号
 * @returns {string}
 */
function maskPhone(phone) {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2");
}

/**
 * 将后端地址项映射为列表展示结构
 * @param {Object} item 后端地址项
 * @returns {Object}
 */
function mapAddressItem(item) {
  return {
    id: item.id,
    name: item.name,
    phone: maskPhone(item.phone),
    fullPhone: item.phone,
    province: item.province,
    city: item.city,
    district: item.district,
    detail: item.detail,
    isDefault: item.isDefault === 1,
    address: `${item.province}${item.city}${item.district}${item.detail}`,
  };
}

/**
 * 构造保存接口的请求数据
 * @param {Object} formData 表单数据
 * @returns {Object}
 */
function buildSavePayload(formData) {
  return {
    name: formData.name,
    phone: formData.phone,
    province: formData.province,
    city: formData.city,
    district: formData.district,
    detail: formData.detail,
    isDefault: formData.isDefault ? 1 : 0,
  };
}

/**
 * 构造新增时的空表单
 * @param {boolean} isFirst 是否为首个地址（默认设为默认）
 * @returns {Object}
 */
function emptyForm(isFirst) {
  return {
    name: "",
    phone: "",
    province: "",
    city: "",
    district: "",
    detail: "",
    isDefault: isFirst,
  };
}

/**
 * 构造回写上一页（下单页）的 setData 补丁
 * @param {Object} address 列表中的地址项
 * @returns {Object}
 */
function selectAddressPatch(address) {
  return {
    selectedAddress: address,
    "formData.receiverName": address.name,
    "formData.receiverPhone": address.fullPhone,
    "formData.receiverAddress": address.address,
    "formData.receiverProvince": address.province,
    "formData.receiverCity": address.city,
    "formData.receiverDistrict": address.district,
    "formData.receiverDetail": address.detail,
  };
}

module.exports = {
  maskPhone,
  mapAddressItem,
  buildSavePayload,
  emptyForm,
  selectAddressPatch,
};

/**
 * 文件名: validators.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: 地址表单校验（从 pages/address/index.js 抽离）
 */

const PHONE_RE = /^1[3-9]\d{9}$/;

/**
 * 校验地址表单
 * @param {Object} formData 表单数据
 * @returns {{valid: boolean, message: string}}
 */
function validateAddress(formData) {
  if (!formData.name.trim()) {
    return { valid: false, message: "请输入收货人姓名" };
  }
  if (!formData.phone.trim()) {
    return { valid: false, message: "请输入手机号码" };
  }
  if (!PHONE_RE.test(formData.phone)) {
    return { valid: false, message: "手机号码格式不正确" };
  }
  if (!formData.province || !formData.city || !formData.district) {
    return { valid: false, message: "请选择所在地区" };
  }
  if (!formData.detail.trim()) {
    return { valid: false, message: "请输入详细地址" };
  }
  return { valid: true, message: "" };
}

module.exports = { validateAddress };

/**
 * 文件名: api.js
 * 版本号: 3.0.14
 * 更新日期: 2026-09-13
 * 描述: 接口响应公共处理（后端包络解包），被各服务层复用
 */

/**
 * 兼容后端包络 { code, data } 或直接返回数据
 * @param {*} res 原始响应
 * @returns {*}
 */
function unwrap(res) {
  if (res && typeof res === "object" && "code" in res && res.data !== undefined) {
    return res.data;
  }
  return res;
}

module.exports = { unwrap };

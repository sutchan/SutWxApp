/**
 * 文件名: auth-token-jwt.js
 * 版本号: 3.5.3
 * 更新日期: 2026-10-14
 * 描述: JWT 过期解析纯逻辑（Base64URL 解码 + exp 解析 + 过期预判，无存储依赖）
 */

// 过期预判提前量（秒）：token 剩余有效期小于该值时提前刷新，避免请求途中过期
const REFRESH_SKEW = 120;

const BASE64_ALPHABET =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/**
 * Base64URL 解码（不依赖 atob / Buffer，兼容小程序基础库）
 * @param {string} input 编码字符串
 * @returns {string} 解码后的字符串，失败返回空串
 */
function base64UrlDecode(input) {
  if (typeof input !== "string") return "";

  let str = input.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4 !== 0) {
    str += "=";
  }

  let output = "";
  let buffer = 0;
  let bits = 0;

  for (let i = 0; i < str.length; i++) {
    const char = str.charAt(i);
    if (char === "=") break;

    const index = BASE64_ALPHABET.indexOf(char);
    if (index < 0) return "";

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}

/**
 * 解析 JWT 的 exp（过期时间戳，秒）
 * @param {string} token token 字符串
 * @returns {number} 过期时间戳；无法解析时返回 0
 */
function decodeExp(token) {
  if (typeof token !== "string") return 0;

  const parts = token.split(".");
  if (parts.length !== 3) return 0;

  const payloadText = base64UrlDecode(parts[1]);
  if (!payloadText) return 0;

  try {
    const payload = JSON.parse(payloadText);
    const exp = Number(payload && payload.exp);
    return Number.isFinite(exp) && exp > 0 ? exp : 0;
  } catch (e) {
    return 0;
  }
}

/**
 * token 是否已过期
 * @param {string} token token 字符串
 * @param {number} [skew] 提前量（秒）
 * @returns {boolean} 无法解析 exp 时视为未过期（兼容非 JWT 的本地 token）
 */
function isExpired(token, skew = 0) {
  const exp = decodeExp(token);
  if (!exp) return false;
  return Math.floor(Date.now() / 1000) >= exp - skew;
}

/**
 * token 是否即将过期（需提前刷新）
 * @param {string} token token 字符串
 * @param {number} [skew] 提前量（秒），默认 REFRESH_SKEW
 * @returns {boolean}
 */
function willExpireSoon(token, skew = REFRESH_SKEW) {
  return isExpired(token, skew);
}

module.exports = {
  REFRESH_SKEW,
  base64UrlDecode,
  decodeExp,
  isExpired,
  willExpireSoon,
};

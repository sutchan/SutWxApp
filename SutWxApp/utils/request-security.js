/**
 * 文件名: request-security.js
 * 版本号: 3.0.9
 * 更新日期: 2026-09-12
 * 描述: request.js 的安全相关实现（CSRF 令牌、HTML 清洗防 XSS）；SQL 注入校验见 request-security-sql.js
 */

const CONFIG = require("./request-config");
const { getWx } = require("./request-platform");
const { validateRequestData } = require("./request-security-sql");

// CSRF 令牌状态（进程级单例）
let csrfToken = "";

/**
 * 生成 CSRF 令牌
 * @returns {string} 生成的令牌
 */
function generateCsrfToken() {
  if (!csrfToken) {
    let randomString = "";
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    try {
      if (typeof crypto !== "undefined" && crypto.getRandomValues) {
        const array = new Uint32Array(32);
        crypto.getRandomValues(array);
        for (let i = 0; i < array.length; i++) {
          randomString += chars[array[i] % chars.length];
        }
      } else {
        for (let i = 0; i < 32; i++) {
          randomString += chars[Math.floor(Math.random() * chars.length)];
        }
      }
    } catch (e) {
      for (let i = 0; i < 32; i++) {
        randomString += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    csrfToken = randomString;
    try {
      const wx = getWx();
      if (wx && wx.setStorageSync) {
        wx.setStorageSync("csrfToken", csrfToken);
      }
    } catch (error) {
      console.warn("Failed to save CSRF token to storage:", error);
    }
  }
  return csrfToken;
}

/**
 * 初始化 CSRF 令牌（优先读取本地存储）
 */
function initCsrfToken() {
  try {
    const wx = getWx();
    if (wx && wx.getStorageSync) {
      const storedToken = wx.getStorageSync("csrfToken");
      if (typeof storedToken === "string" && storedToken) {
        csrfToken = storedToken;
      } else {
        generateCsrfToken();
      }
    }
  } catch (error) {
    console.warn("Failed to get CSRF token from storage:", error);
    generateCsrfToken();
  }
}

/**
 * 读取当前 CSRF 令牌
 * @returns {string}
 */
function getCsrfToken() {
  return csrfToken;
}

/**
 * 清理 HTML 标签，防止 XSS 攻击
 * @param {string} html 待清理的 HTML 字符串
 * @returns {string} 清理后的字符串
 */
function sanitizeHtml(html) {
  if (!CONFIG.enableXssProtection) return html;

  let sanitizedHtml = html;

  const dangerousTags = [
    "script", "iframe", "object", "embed", "link", "form", "input", "textarea",
    "button", "select", "option", "style", "meta", "base", "applet",
    "blink", "body", "html", "head", "frameset", "frame",
  ];

  for (const tag of dangerousTags) {
    sanitizedHtml = sanitizedHtml
      .replace(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi"), "")
      .replace(new RegExp(`<${tag}[^>]*\\/>`, "gi"), "");
  }

  const eventPatterns = [
    /on[^=]+="[^"]*"/gi,
    /on[^=]+='[^']*'/gi,
    /on[^=]+=[^\s>]+/gi,
  ];

  for (const pattern of eventPatterns) {
    sanitizedHtml = sanitizedHtml.replace(pattern, "");
  }

  const dangerousProtocols = [
    "javascript:", "vbscript:", "data:", "mailto:", "tel:", "sms:",
    "blob:", "file:", "ftp:", "gopher:", "ws:", "wss:",
  ];

  for (const protocol of dangerousProtocols) {
    sanitizedHtml = sanitizedHtml.replace(new RegExp(protocol, "gi"), "");
  }

  sanitizedHtml = sanitizedHtml.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
  sanitizedHtml = sanitizedHtml.replace(/style="[^"]*"/gi, "");
  sanitizedHtml = sanitizedHtml.replace(/href="[^"]*"/gi, "");
  sanitizedHtml = sanitizedHtml.replace(/src="[^"]*"/gi, "");
  sanitizedHtml = sanitizedHtml.replace(/<!--[^>]*-->/gi, "");
  sanitizedHtml = sanitizedHtml.replace(/&lt;script/gi, "&lt;");
  sanitizedHtml = sanitizedHtml.replace(/&lt;iframe/gi, "&lt;");

  return sanitizedHtml;
}

/**
 * 深度清洗响应数据中的字符串字段（防 XSS）
 * @param {*} data 待清洗数据
 * @returns {*} 清洗后的深拷贝
 */
function deepSanitize(data) {
  if (typeof data === "string") {
    return CONFIG.enableXssProtection ? sanitizeHtml(data) : data;
  }
  if (typeof data !== "object" || data === null) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => deepSanitize(item));
  }
  const result = {};
  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
    const value = data[key];
    if (typeof value === "string") {
      result[key] = CONFIG.enableXssProtection ? sanitizeHtml(value) : value;
    } else if (typeof value === "object" && value !== null) {
      result[key] = deepSanitize(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

module.exports = {
  generateCsrfToken,
  initCsrfToken,
  getCsrfToken,
  sanitizeHtml,
  deepSanitize,
  validateRequestData,
};

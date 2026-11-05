/**
 * 文件名: env.js
 * 版本号: 3.5.11
 * 更新日期: 2026-11-05
 * 描述: 多环境配置表（FE-007）：按运行环境（develop/trial/release）返回 baseURL 等配置
 */

/**
 * 环境配置表。
 * - develop：开发者工具 / 本地真机调试
 * - trial：体验版（预发环境）
 * - release：正式版（生产环境，必须 https + 已备案域名 + 微信后台白名单）
 */
const ENV_CONFIG = {
  develop: {
    baseUrl: "https://staging-api.sutchan.com",
    enableMonitor: false, // 本地开发不上报，仅 console
  },
  trial: {
    baseUrl: "https://staging-api.sutchan.com",
    enableMonitor: true,
  },
  release: {
    baseUrl: "https://api.sutchan.com",
    enableMonitor: true,
  },
};

const FALLBACK = "release";

/**
 * 读取当前运行环境（微信基础库 2.10.2+ 支持 envVersion）。
 * @returns {"develop"|"trial"|"release"} 环境名
 */
function getEnvName() {
  try {
    if (typeof wx === "undefined" || !wx.getAccountInfoSync) {
      return FALLBACK;
    }
    const env = wx.getAccountInfoSync().miniProgram.envVersion;
    return ENV_CONFIG[env] ? env : FALLBACK;
  } catch (e) {
    return FALLBACK;
  }
}

/**
 * 获取当前环境配置（返回拷贝，避免调用方改写配置表）。
 * @returns {{baseUrl: string, enableMonitor: boolean, envName: string}}
 */
function getEnvConfig() {
  const envName = getEnvName();
  const cfg = ENV_CONFIG[envName] || ENV_CONFIG[FALLBACK];
  return { ...cfg, envName };
}

/**
 * 组合 API 绝对地址（小程序 wx.request 不接受相对路径）。
 * @param {string} path 以 / 开头的接口路径，如 /api/monitor/data
 * @returns {string} 绝对 URL
 */
function apiUrl(path) {
  const { baseUrl } = getEnvConfig();
  return baseUrl.replace(/\/+$/, "") + (path.startsWith("/") ? path : "/" + path);
}

module.exports = { getEnvName, getEnvConfig, apiUrl, ENV_CONFIG };
/**
 * 文件名: postService.js
 * 版本号: 3.0.12
 * 更新日期: 2026-09-13
 * 描述: 文章服务层，提供文章列表与详情（支持 WooCommerce / WordPress 数据源）
 */

const request = require("../utils/request");
const { mapWpPost, mapWpPosts } = require("../models/post");
const { mockPosts } = require("./postService.mock");

// 文章数据源：'mock'（默认，演示/离线）| 'woocommerce'（WordPress + 配套插件）
function getPostSource() {
  try {
    const app = typeof getApp === "function" ? getApp() : null;
    if (app && app.globalData && app.globalData.productSource) {
      return app.globalData.productSource;
    }
  } catch (e) {
    // 测试或非小程序环境：回退 mock
  }
  return "mock";
}

// 兼容后端包络 { code, data } 或直接返回数据
function unwrap(res) {
  if (res && typeof res === "object" && "code" in res && res.data !== undefined) {
    return res.data;
  }
  return res;
}

async function getPostList(params = {}) {
  if (getPostSource() === "woocommerce") {
    try {
      const raw = await request.get("/api/post/list", params, { needAuth: false });
      const payload = unwrap(raw);
      const list = (payload && (payload.list || payload)) || [];
      return mapWpPosts(list);
    } catch (error) {
      console.error("WooCommerce 文章列表获取失败:", error);
      return [];
    }
  }

  try {
    return mockPosts;
  } catch (error) {
    console.error("获取文章列表失败:", error);
    return [];
  }
}

async function getPostDetail(postId) {
  if (getPostSource() === "woocommerce") {
    try {
      const raw = await request.get(
        "/api/post/detail",
        { id: postId },
        { needAuth: false },
      );
      return mapWpPost(unwrap(raw));
    } catch (error) {
      console.error("WooCommerce 文章详情获取失败:", error);
      return null;
    }
  }

  try {
    const post = mockPosts.find((p) => p.id == postId);
    return post || null;
  } catch (error) {
    console.error("获取文章详情失败:", error);
    return null;
  }
}

module.exports = {
  getPostList,
  getPostDetail,
  mapWpPost,
  mapWpPosts,
};

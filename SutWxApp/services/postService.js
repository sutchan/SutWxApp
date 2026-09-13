/**
 * 文件名: postService.js
 * 版本号: 3.0.14
 * 更新日期: 2026-09-13
 * 描述: 文章服务层，提供文章列表与详情（支持 WooCommerce / WordPress 数据源）
 */

const request = require("../utils/request");
const { unwrap } = require("../utils/api");
const { getDataSource } = require("./dataSource");
const { mapWpPost, mapWpPosts } = require("../models/post");
const { mockPosts } = require("./postService.mock");

async function getPostList(params = {}) {
  if (getDataSource() === "woocommerce") {
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
  if (getDataSource() === "woocommerce") {
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

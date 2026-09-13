/**
 * 文件名: detail.js
 * 版本号: 3.0.12
 * 更新日期: 2026-09-13
 * 描述: 文章详情页，使用 rich-text 渲染经安全清洗的 HTML 正文
 */

const postService = require("../../services/postService");
const themeBehavior = require("../../behaviors/theme");

Page({
  behaviors: [themeBehavior],
  data: {
    post: null,
    loading: false,
  },

  onLoad(options) {
    if (options && options.id) {
      this.loadDetail(options.id);
    }
  },

  async loadDetail(id) {
    this.setData({ loading: true });
    try {
      const post = await postService.getPostDetail(id);
      this.setData({ post, loading: false });
      if (post && post.title) {
        wx.setNavigationBarTitle({ title: post.title });
      }
    } catch (error) {
      console.error("加载文章详情失败:", error);
      this.setData({ loading: false });
      wx.showToast({ title: "加载失败", icon: "none" });
    }
  },
});

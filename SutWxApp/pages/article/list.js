/**
 * 文件名: list.js
 * 版本号: 3.0.12
 * 更新日期: 2026-09-13
 * 描述: 文章列表页，展示养护文章列表（点击进入详情）
 */

const postService = require("../../services/postService");
const themeBehavior = require("../../behaviors/theme");

Page({
  behaviors: [themeBehavior],
  data: {
    list: [],
    loading: false,
  },

  onLoad() {
    this.loadList();
  },

  async loadList() {
    this.setData({ loading: true });
    try {
      const list = await postService.getPostList();
      this.setData({ list, loading: false });
    } catch (error) {
      console.error("加载文章列表失败:", error);
      this.setData({ loading: false });
    }
  },

  onOpenPost(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: "/pages/article/detail?id=" + id });
  },
});

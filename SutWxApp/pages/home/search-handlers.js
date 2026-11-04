/**
 * 文件名: search-handlers.js
 * 版本号: 3.5.10
 * 更新日期: 2026-11-04
 * 描述: 首页搜索交互（自 index.js 拆出）：历史浮层、输入联想、执行搜索与跳转。
 *       方法通过 Object.assign 合并进 Page，this 仍指向页面实例。
 */

const {
  loadSearchHistory,
  saveSearchHistory,
  appendSearchKeyword,
} = require("./parts");
const {
  SEARCH_DELAY_MS,
  filterSuggestions,
  matchSuggestionId,
} = require("./suggestions");

const searchHandlers = {
  /** 打开搜索历史浮层 */
  handleSearchTap: function () {
    this.setData({
      showSearchHistory: true,
      searchHistory: loadSearchHistory(),
    });
  },

  /** 关闭搜索历史浮层 */
  handleCloseSearch: function () {
    this.setData({ showSearchHistory: false });
  },

  /** 清空搜索历史 */
  handleClearHistory: function () {
    saveSearchHistory([]);
    this.setData({ searchHistory: [] });
    wx.showToast({ title: "已清空搜索历史", icon: "none" });
  },

  /** 输入联想 */
  handleSearchInput: function (e) {
    const val = e.detail.value;
    this.setData({ searchKeyword: val });
    this.updateSuggestions(val);
  },

  updateSuggestions: function (val) {
    this.setData({ suggestions: filterSuggestions(val) });
  },

  /** 清空输入框 */
  handleClearSearchInput: function () {
    this.setData({ searchKeyword: "", suggestions: [] });
  },

  /** 点历史标签直接搜索 */
  handleSelectHistoryTag: function (e) {
    const { keyword } = e.currentTarget.dataset;
    this.executeSearch(keyword);
  },

  /** 键盘确认搜索 */
  handleSearchConfirm: function (e) {
    const kw = (e.detail && e.detail.value) || this.data.searchKeyword;
    this.executeSearch(kw);
  },

  /** 执行搜索：写入历史、延迟后跳转 */
  executeSearch: function (kw) {
    if (!kw || !kw.trim()) {
      wx.showToast({ title: "请输入搜索词", icon: "none" });
      return;
    }
    const text = kw.trim();
    const history = appendSearchKeyword(text, this.data.searchHistory);
    const matchedId = matchSuggestionId(text);

    // 显示微小加载动效，不要立刻关闭历史浮层
    this.setData({
      searchHistory: history,
      isSearching: true,
      searchKeyword: text,
    });

    // 记录定时器，页面卸载时清理，避免对已销毁页面 setData。
    if (this._searchTimer) clearTimeout(this._searchTimer);
    this._searchTimer = setTimeout(() => {
      this._searchTimer = null;
      this.setData({
        showSearchHistory: false,
        isSearching: false,
        suggestions: [],
      });
      wx.showToast({ title: `已搜索：${text}`, icon: "none" });

      if (matchedId) {
        wx.navigateTo({ url: `/pages/product/index?id=${matchedId}` });
      } else {
        wx.showToast({ title: "未匹配到相关商品", icon: "none" });
      }
    }, SEARCH_DELAY_MS);
  },

  /** 清理搜索定时器（供 onUnload 调用） */
  clearSearchTimer: function () {
    if (this._searchTimer) {
      clearTimeout(this._searchTimer);
      this._searchTimer = null;
    }
  },
};

module.exports = { searchHandlers };

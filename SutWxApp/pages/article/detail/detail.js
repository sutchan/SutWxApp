// pages/article/detail/detail.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    articleId: 0, // 文章ID
    article: {}, // 文章详情
    loading: true, // 加载状态
    likeCount: 0, // 点赞数量
    isLiked: false, // 是否已点赞
    commentList: [], // 评论列表
    commentPage: 1, // 评论当前页码
    commentHasMore: true, // 评论是否有更多
    commentContent: '', // 评论内容
    showCommentInput: false, // 是否显示评论输入框
    isFavorite: false, // 是否已收藏
    favoriteCount: 0, // 收藏数量
    viewCount: 0 // 浏览量
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.id) {
      this.setData({
        articleId: parseInt(options.id)
      });
      this.getArticleDetail();
      this.getCommentList();
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    // 可以在这里刷新文章数据，例如点赞、收藏状态
  },

  /**
   * 获取文章详情
   */
  getArticleDetail: function() {
    wx.request({
      url: getApp().globalData.apiBaseUrl + '/articles/' + this.data.articleId, 
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          const article = res.data.data;
          this.setData({
            article: article,
            likeCount: article.like_count || 0,
            isLiked: article.is_liked || false,
            isFavorite: article.is_favorite || false,
            favoriteCount: article.favorite_count || 0,
            viewCount: article.view_count || 0,
            loading: false
          });
          
          // 设置页面标题
          wx.setNavigationBarTitle({
            title: article.title || '文章详情'
          });
        } else {
          wx.showToast({
            title: '获取文章详情失败',
            icon: 'none'
          });
          this.setData({
            loading: false
          });
        }
      },
      fail: () => {
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        });
        this.setData({
          loading: false
        });
      }
    });
  },

  /**
   * 获取评论列表
   */
  getCommentList: function() {
    if (!this.data.commentHasMore) return;

    wx.request({
      url: getApp().globalData.apiBaseUrl + '/articles/' + this.data.articleId + '/comments',
      method: 'GET',
      data: {
        page: this.data.commentPage,
        page_size: 10
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          const comments = res.data.data.list;
          const total = res.data.data.total;
          
          // 如果是第一页，则替换评论列表；否则追加
          if (this.data.commentPage === 1) {
            this.setData({
              commentList: comments
            });
          } else {
            this.setData({
              commentList: [...this.data.commentList, ...comments]
            });
          }
          
          // 判断是否还有更多评论
          this.setData({
            commentHasMore: this.data.commentList.length < total
          });
        }
      }
    });
  },

  /**
   * 点赞文章
   */
  likeArticle: function() {
    if (this.data.isLiked) {
      // 取消点赞
      wx.request({
        url: getApp().globalData.apiBaseUrl + '/articles/' + this.data.articleId + '/unlike',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 0) {
            this.setData({
              isLiked: false,
              likeCount: Math.max(0, this.data.likeCount - 1)
            });
          }
        }
      });
    } else {
      // 点赞
      wx.request({
        url: getApp().globalData.apiBaseUrl + '/articles/' + this.data.articleId + '/like',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 0) {
            this.setData({
              isLiked: true,
              likeCount: this.data.likeCount + 1
            });
          }
        }
      });
    }
  },

  /**
   * 收藏文章
   */
  favoriteArticle: function() {
    if (this.data.isFavorite) {
      // 取消收藏
      wx.request({
        url: getApp().globalData.apiBaseUrl + '/articles/' + this.data.articleId + '/unfavorite',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 0) {
            this.setData({
              isFavorite: false,
              favoriteCount: Math.max(0, this.data.favoriteCount - 1)
            });
            wx.showToast({
              title: '取消收藏成功',
              icon: 'none'
            });
          }
        }
      });
    } else {
      // 收藏
      wx.request({
        url: getApp().globalData.apiBaseUrl + '/articles/' + this.data.articleId + '/favorite',
        method: 'POST',
        header: {
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.code === 0) {
            this.setData({
              isFavorite: true,
              favoriteCount: this.data.favoriteCount + 1
            });
            wx.showToast({
              title: '收藏成功',
              icon: 'success'
            });
          }
        }
      });
    }
  },

  /**
   * 提交评论
   */
  submitComment: function() {
    const content = this.data.commentContent.trim();
    if (!content) {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: getApp().globalData.apiBaseUrl + '/articles/' + this.data.articleId + '/comments',
      method: 'POST',
      data: {
        content: content
      },
      header: {
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.code === 0) {
          this.setData({
            commentContent: '',
            showCommentInput: false,
            commentList: [res.data.data, ...this.data.commentList]
          });
          wx.showToast({
            title: '评论成功',
            icon: 'success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '评论失败',
            icon: 'none'
          });
        }
      },
      fail: () => {
        wx.showToast(
          {
            title: '网络错误',
            icon: 'none'
          }
        );
      }
    });
  },

  /**
   * 输入评论内容
   */
  onCommentInput: function(e) {
    this.setData({
      commentContent: e.detail.value
    });
  },

  /**
   * 显示评论输入框
   */
  showCommentBox: function() {
    this.setData({
      showCommentInput: true
    });
  },

  /**
   * 隐藏评论输入框
   */
  hideCommentBox: function() {
    this.setData({
      showCommentInput: false
    });
  },

  /**
   * 分享文章
   */
  onShareAppMessage: function() {
    return {
      title: this.data.article.title || '分享文章',
      path: '/pages/article/detail/detail?id=' + this.data.articleId,
      imageUrl: this.data.article.thumbnail
    };
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    if (this.data.commentHasMore) {
      this.setData({
        commentPage: this.data.commentPage + 1
      });
      this.getCommentList();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.getArticleDetail();
    this.setData({
      commentPage: 1,
      commentHasMore: true
    });
    this.getCommentList();
    wx.stopPullDownRefresh();
  }
})
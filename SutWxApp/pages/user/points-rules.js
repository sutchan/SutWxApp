// 积分规则页面逻辑
const app = getApp();
const { showToast } = app.global;

Page({
  /**
   * 页面的初始数据
   */
  data: {
    rules: [],
    faqs: [],
    isLoading: false,
    error: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    // 记录页面访问事件
    app.analyticsService.track('page_view', {
      page: 'points_rules'
    });
    
    this.loadPointsRules();
  },

  /**
   * 加载积分规则
   */
  async loadPointsRules() {
    try {
      this.setData({ isLoading: true, error: null });

      // 使用pointsService获取积分规则
      const result = await app.services.points.getPointsRules();
      
      this.setData({
        rules: result.rules || [],
        faqs: result.faqs || [],
        error: null
      });
    } catch (err) {
      let errorMsg = '获取积分规则失败';
      if (err.message) {
        errorMsg = err.message;
      }
      
      this.setData({ 
        error: errorMsg,
        // 如果获取失败，使用默认规则
        rules: this.getDefaultRules(),
        faqs: this.getDefaultFaqs()
      });
      
      console.error('获取积分规则失败:', err);
    } finally {
      this.setData({ isLoading: false });
    }
  },

  /**
   * 获取默认积分规则
   */
  getDefaultRules: function() {
    return [
      { title: '注册账号', points: 100, description: '首次注册并登录获取100积分' },
      { title: '每日签到', points: 5, description: '每日签到获取5积分，连续签到额外奖励' },
      { title: '发表评论', points: 10, description: '在文章下发表评论获取10积分' },
      { title: '分享文章', points: 15, description: '分享文章给好友获取15积分' },
      { title: '收藏文章', points: 5, description: '收藏文章获取5积分' },
      { title: '完善资料', points: 30, description: '完善个人资料获取30积分' }
    ];
  },

  /**
   * 获取默认常见问题
   */
  getDefaultFaqs: function() {
    return [
      { question: '积分有什么用？', answer: '积分可以用于兑换平台提供的虚拟或实体奖励，以及参与特定活动。' },
      { question: '积分会过期吗？', answer: '是的，积分有效期为一年，请及时使用。' },
      { question: '如何查询我的积分明细？', answer: '在"我的积分"页面可以查看所有积分变动记录。' },
      { question: '积分兑换后可以退款吗？', answer: '积分兑换后不可退款，请谨慎操作。' }
    ];
  },

  /**
   * 重试加载
   */
  onRetry: function() {
    // 记录重试加载事件
    app.analyticsService.track('retry_loading', {
      page: 'points_rules'
    });
    
    this.loadPointsRules();
  },

  /**
   * 展开/收起FAQ
   */
  toggleFaq: function(e) {
    const index = e.currentTarget.dataset.index;
    const faqs = this.data.faqs;
    faqs[index].expanded = !faqs[index].expanded;
    
    // 记录FAQ点击事件
    app.analyticsService.track('toggle_faq', {
      index,
      expanded: faqs[index].expanded
    });
    
    this.setData({ faqs });
  }
});
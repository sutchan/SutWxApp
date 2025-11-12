// notification-mock.js - 通知服务模拟数据
// 用于在开发环境中提供通知相关的模拟数据

/**
 * 生成模拟通知数据
 * @param {number} count - 生成的通知数量
 * @param {boolean} includeUnread - 是否包含未读通知
 * @returns {Array} 通知数据列表
 */
function generateMockNotifications(count = 20, includeUnread = true) {
  const notificationTypes = ['system', 'comment', 'follow', 'like', 'point', 'order'];
  const titles = {
    system: ['系统公告', '活动通知', '功能更新'],
    comment: ['评论回复', '新评论', '回复我的'],
    follow: ['新增关注', '关注通知'],
    like: ['点赞消息', '喜欢了我'],
    point: ['积分增加', '积分到账', '积分奖励'],
    order: ['订单状态更新', '订单发货', '订单签收']
  };
  const contents = {
    system: [
      '尊敬的用户，我们将于今晚23:00-次日4:00进行系统维护，期间部分功能可能暂时无法使用。',
      '双11购物节即将开始，全场商品8折起，更多优惠等你来。',
      '新版本已发布，新增了多项实用功能，快来体验吧！'
    ],
    comment: [
      '用户「小明」评论了你的文章，快去看看吧。',
      '用户「小红」回复了你的评论，查看详情。',
      '有人对你的文章发表了评论，点击查看。'
    ],
    follow: [
      '用户「小花」关注了你，成为了你的粉丝。',
      '有新用户关注了你，查看详细信息。'
    ],
    like: [
      '用户「小李」点赞了你的文章。',
      '多人点赞了你的评论，继续保持。'
    ],
    point: [
      '恭喜你获得20积分奖励，快去查看吧。',
      '签到成功，获得5积分奖励。',
      '完成任务，获得10积分奖励。'
    ],
    order: [
      '您的订单#123456已发货，请注意查收。',
      '订单654321已完成支付，正在处理中。',
      '您的订单已签收，感谢您的购买。'
    ]
  };

  const notifications = [];
  
  for (let i = 1; i <= count; i++) {
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const typeTitles = titles[type];
    const typeContents = contents[type];
    
    const now = new Date();
    const pastDays = Math.floor(Math.random() * 30); // 生成过去30天内的通知
    const pastHours = Math.floor(Math.random() * 24);
    const pastMinutes = Math.floor(Math.random() * 60);
    
    now.setDate(now.getDate() - pastDays);
    now.setHours(now.getHours() - pastHours);
    now.setMinutes(now.getMinutes() - pastMinutes);
    
    // 随机生成未读状态，约30%的概率为未读
    const isRead = includeUnread ? Math.random() > 0.3 : true;
    
    notifications.push({
      id: `notif_${Date.now()}_${i}`,
      type: type,
      title: typeTitles[Math.floor(Math.random() * typeTitles.length)],
      content: typeContents[Math.floor(Math.random() * typeContents.length)],
      created_at: now.toISOString(),
      is_read: isRead,
      target_id: type === 'comment' || type === 'like' ? `content_${Math.floor(Math.random() * 1000)}` : null,
      user_id: type === 'comment' || type === 'follow' || type === 'like' ? `user_${Math.floor(Math.random() * 1000)}` : null
    });
  }
  
  // 按时间倒序排列，最新的在前面
  return notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * 通知模拟服务
 */
const NotificationMockService = {
  /**
   * 获取通知列表
   * @param {Object} params - 查询参数
   * @returns {Promise} 返回通知列表数据
   */
  getNotifications: function(params = {}) {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        let allNotifications = generateMockNotifications(50);
        
        // 根据参数进行过滤
        if (params.unread_only) {
          allNotifications = allNotifications.filter(item => !item.is_read);
        }
        
        if (params.type) {
          const types = params.type.split(',');
          allNotifications = allNotifications.filter(item => types.includes(item.type));
        }
        
        // 分页处理
        const page = params.page || 1;
        const perPage = params.per_page || 10;
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginatedNotifications = allNotifications.slice(start, end);
        
        resolve({
          data: paginatedNotifications,
          meta: {
            total: allNotifications.length,
            page: page,
            per_page: perPage,
            total_pages: Math.ceil(allNotifications.length / perPage)
          }
        });
      }, 500);
    });
  },
  
  /**
   * 获取未读通知数量
   * @returns {Promise} 返回未读通知数量
   */
  getUnreadNotificationCount: function() {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        // 随机生成0-15个未读通知
        const unreadCount = Math.floor(Math.random() * 16);
        resolve(unreadCount);
      }, 300);
    });
  },
  
  /**
   * 标记通知为已读
   * @param {string} notificationId - 通知ID
   * @returns {Promise} 返回操作结果
   */
  markAsRead: function(notificationId) {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        resolve({ success: true, notificationId, is_read: true });
      }, 200);
    });
  },
  
  /**
   * 标记所有通知为已读
   * @returns {Promise} 返回操作结果
   */
  markAllAsRead: function() {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  },
  
  /**
   * 获取通知详情
   * @param {string} notificationId - 通知ID
   * @returns {Promise} 返回通知详情数据
   */
  getNotificationDetail: function(notificationId) {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        // 生成通知详情
        const notificationTypes = ['system', 'comment', 'follow', 'like', 'point', 'order'];
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        // 根据通知类型生成详细信息
        const generateDetailByType = () => {
          const baseDetail = {
            id: notificationId,
            type: type,
            created_at: new Date().toISOString(),
            is_read: false,
            extra_info: null
          };
          
          switch(type) {
            case 'system':
              return {
                ...baseDetail,
                title: '系统公告',
                content: '尊敬的用户，我们将于今晚23:00-次日4:00进行系统维护，期间部分功能可能暂时无法使用，给您带来不便敬请谅解。',
                extra_info: {
                  maintenance_time: '维护时间: 02:00-04:00',
                  affected_services: ['用户登录', '订单支付', '消息推送']
                }
              };
            case 'comment':
              return {
                ...baseDetail,
                title: '评论回复',
                content: '用户「TechFan」评论了你的文章，快去看看吧。',
                target_id: 'article_123456',
                user_id: 'user_789',
                extra_info: {
                  comment_content: '这篇文章写得很详细，学到了很多东西。',
                  article_title: '前端开发最佳实践指南',
                  user_name: 'TechFan',
                  user_avatar: '/images/avatar_default.png'
                }
              };
            case 'follow':
              return {
                ...baseDetail,
                title: '新增关注',
                content: '用户「Designer」关注了你',
                user_id: 'user_456',
                extra_info: {
                  user_name: 'Designer',
                  user_avatar: '/images/avatar_default.png',
                  user_bio: 'UI/UX设计师，热爱创作'
                }
              };
            case 'like':
              return {
                ...baseDetail,
                title: '点赞消息',
                content: '用户「Developer」点赞了你的评论',
                target_id: 'comment_789012',
                user_id: 'user_123',
                extra_info: {
                  user_name: 'Developer',
                  user_avatar: '/images/avatar_default.png',
                  target_type: 'comment',
                  original_comment: '这个解决方案很实用，已经收藏了。'
                }
              };
            case 'point':
              return {
                ...baseDetail,
                title: '积分到账',
                content: '恭喜你获得20积分奖励，快去查看吧。',
                extra_info: {
                  point_change: 20,
                  current_points: 560,
                  reason: '连续签到7天',
                  valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                }
              };
            case 'order':
              return {
                ...baseDetail,
                title: '订单发货通知',
                content: '您的订单#ORDER123456已发货',
                target_id: 'order_123456',
                extra_info: {
                  order_number: 'ORDER123456',
                  order_amount: '￥199.00',
                  items_count: 2,
                  shipping_company: '顺丰速运',
                  tracking_number: 'SF1234567890',
                  expected_delivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
                }
              };
            default:
              return baseDetail;
          }
        };
        
        resolve(generateDetailByType());
      }, 500);
    });
  }
};

module.exports = NotificationMockService;
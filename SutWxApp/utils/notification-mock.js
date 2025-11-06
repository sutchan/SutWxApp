// 通知模拟数据服务
// 用于在开发阶段提供测试数据，模拟真实的通知服务

/**
 * 生成模拟通知数据
 * @param {number} count - 生成的通知数量
 * @param {boolean} includeUnread - 是否包含未读通知
 * @returns {Array} 通知数据数组
 */
function generateMockNotifications(count = 20, includeUnread = true) {
  const notificationTypes = ['system', 'comment', 'follow', 'like', 'point', 'order'];
  const titles = {
    system: ['系统公告', '功能更新', '安全提醒'],
    comment: ['评论提醒', '回复通知', '新评论'],
    follow: ['新的关注', '关注提醒'],
    like: ['点赞通知', '收藏提醒'],
    point: ['积分变动', '积分奖励', '积分扣除'],
    order: ['订单状态更新', '发货通知', '收货提醒']
  };
  const contents = {
    system: [
      '尊敬的用户，感谢您使用我们的服务，如有任何问题请随时联系客服。',
      '系统已更新至最新版本，新增多项功能，欢迎体验。',
      '为了您的账号安全，建议您定期修改密码。'
    ],
    comment: [
      '用户"小明"评论了您的动态：写得真好！',
      '用户"小红"回复了您的评论：谢谢您的反馈。',
      '您有一条新的评论等待查看。'
    ],
    follow: [
      '用户"张三"关注了您，快去看看吧！',
      '有新用户关注了您，点击查看详情。'
    ],
    like: [
      '用户"李四"点赞了您的动态。',
      '您的内容受到了用户"王五"的喜爱。'
    ],
    point: [
      '恭喜您获得10积分奖励！',
      '您的积分已扣除5点。',
      '积分变动：+20积分'
    ],
    order: [
      '您的订单#123456已发货，请注意查收。',
      '订单#654321已完成，感谢您的购买。',
      '您的订单状态已更新，请及时查看。'
    ]
  };

  const notifications = [];
  
  for (let i = 1; i <= count; i++) {
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const typeTitles = titles[type];
    const typeContents = contents[type];
    
    const now = new Date();
    const pastDays = Math.floor(Math.random() * 30); // 生成过去30天内的随机时间
    const pastHours = Math.floor(Math.random() * 24);
    const pastMinutes = Math.floor(Math.random() * 60);
    
    now.setDate(now.getDate() - pastDays);
    now.setHours(now.getHours() - pastHours);
    now.setMinutes(now.getMinutes() - pastMinutes);
    
    // 随机决定是否已读，默认30%的通知未读
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
  
  // 按时间倒序排序，最新的在前
  return notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * 模拟通知服务
 */
const NotificationMockService = {
  /**
   * 获取模拟通知列表
   * @param {Object} params - 查询参数
   * @returns {Promise} 包含通知列表的数据
   */
  getNotifications: function(params = {}) {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        let allNotifications = generateMockNotifications(50);
        
        // 根据参数筛选
        if (params.unread_only) {
          allNotifications = allNotifications.filter(item => !item.is_read);
        }
        
        if (params.type) {
          const types = params.type.split(',');
          allNotifications = allNotifications.filter(item => types.includes(item.type));
        }
        
        // 分页
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
   * @returns {Promise} 未读通知数量
   */
  getUnreadNotificationCount: function() {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        // 随机生成未读数量，范围0-15
        const unreadCount = Math.floor(Math.random() * 16);
        resolve(unreadCount);
      }, 300);
    });
  },
  
  /**
   * 标记通知为已读
   * @param {string} notificationId - 通知ID
   * @returns {Promise} 成功状态
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
   * 标记全部通知为已读
   * @returns {Promise} 成功状态
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
   * @returns {Promise} 通知详情数据
   */
  getNotificationDetail: function(notificationId) {
    return new Promise((resolve) => {
      // 模拟网络延迟
      setTimeout(() => {
        // 生成模拟通知详情
        const notificationTypes = ['system', 'comment', 'follow', 'like', 'point', 'order'];
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        // 根据类型生成不同的详情数据
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
                content: '尊敬的用户，我们将于下周二凌晨2:00-4:00进行系统维护，期间服务可能会暂时不可用。感谢您的理解与支持！',
                extra_info: {
                  maintenance_time: '下周二 02:00-04:00',
                  affected_services: ['用户登录', '订单提交', '支付功能']
                }
              };
            case 'comment':
              return {
                ...baseDetail,
                title: '评论提醒',
                content: '用户"TechFan"评论了您的文章《微信小程序开发最佳实践》',
                target_id: 'article_123456',
                user_id: 'user_789',
                extra_info: {
                  comment_content: '非常实用的文章，学到了很多！',
                  article_title: '微信小程序开发最佳实践',
                  user_name: 'TechFan',
                  user_avatar: '/images/avatar_default.png'
                }
              };
            case 'follow':
              return {
                ...baseDetail,
                title: '新的关注',
                content: '用户"Designer"关注了您',
                user_id: 'user_456',
                extra_info: {
                  user_name: 'Designer',
                  user_avatar: '/images/avatar_default.png',
                  user_bio: 'UI/UX设计师，热爱创新'
                }
              };
            case 'like':
              return {
                ...baseDetail,
                title: '点赞通知',
                content: '用户"Developer"点赞了您的评论',
                target_id: 'comment_789012',
                user_id: 'user_123',
                extra_info: {
                  user_name: 'Developer',
                  user_avatar: '/images/avatar_default.png',
                  target_type: 'comment',
                  original_comment: '我觉得这个功能实现得很好'
                }
              };
            case 'point':
              return {
                ...baseDetail,
                title: '积分奖励',
                content: '恭喜您获得20积分奖励！',
                extra_info: {
                  point_change: 20,
                  current_points: 560,
                  reason: '连续登录7天',
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
                  order_amount: '¥199.00',
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
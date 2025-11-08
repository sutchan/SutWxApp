// 閫氱煡妯℃嫙鏁版嵁鏈嶅姟
// 鐢ㄤ簬鍦ㄥ紑鍙戦樁娈垫彁渚涙祴璇曟暟鎹紝妯℃嫙鐪熷疄鐨勯€氱煡鏈嶅姟

/**
 * 鐢熸垚妯℃嫙閫氱煡鏁版嵁
 * @param {number} count - 鐢熸垚鐨勯€氱煡鏁伴噺
 * @param {boolean} includeUnread - 鏄惁鍖呭惈鏈閫氱煡
 * @returns {Array} 閫氱煡鏁版嵁鏁扮粍
 */
function generateMockNotifications(count = 20, includeUnread = true) {
  const notificationTypes = ['system', 'comment', 'follow', 'like', 'point', 'order'];
  const titles = {
    system: ['绯荤粺鍏憡', '鍔熻兘鏇存柊', '瀹夊叏鎻愰啋'],
    comment: ['璇勮鎻愰啋', '鍥炲閫氱煡', '鏂拌瘎璁?],
    follow: ['鏂扮殑鍏虫敞', '鍏虫敞鎻愰啋'],
    like: ['鐐硅禐閫氱煡', '鏀惰棌鎻愰啋'],
    point: ['绉垎鍙樺姩', '绉垎濂栧姳', '绉垎鎵ｉ櫎'],
    order: ['璁㈠崟鐘舵€佹洿鏂?, '鍙戣揣閫氱煡', '鏀惰揣鎻愰啋']
  };
  const contents = {
    system: [
      '灏婃暚鐨勭敤鎴凤紝鎰熻阿鎮ㄤ娇鐢ㄦ垜浠殑鏈嶅姟锛屽鏈変换浣曢棶棰樿闅忔椂鑱旂郴瀹㈡湇銆?,
      '绯荤粺宸叉洿鏂拌嚦鏈€鏂扮増鏈紝鏂板澶氶」鍔熻兘锛屾杩庝綋楠屻€?,
      '涓轰簡鎮ㄧ殑璐﹀彿瀹夊叏锛屽缓璁偍瀹氭湡淇敼瀵嗙爜銆?
    ],
    comment: [
      '鐢ㄦ埛"灏忔槑"璇勮浜嗘偍鐨勫姩鎬侊細鍐欏緱鐪熷ソ锛?,
      '鐢ㄦ埛"灏忕孩"鍥炲浜嗘偍鐨勮瘎璁猴細璋㈣阿鎮ㄧ殑鍙嶉銆?,
      '鎮ㄦ湁涓€鏉℃柊鐨勮瘎璁虹瓑寰呮煡鐪嬨€?
    ],
    follow: [
      '鐢ㄦ埛"寮犱笁"鍏虫敞浜嗘偍锛屽揩鍘荤湅鐪嬪惂锛?,
      '鏈夋柊鐢ㄦ埛鍏虫敞浜嗘偍锛岀偣鍑绘煡鐪嬭鎯呫€?
    ],
    like: [
      '鐢ㄦ埛"鏉庡洓"鐐硅禐浜嗘偍鐨勫姩鎬併€?,
      '鎮ㄧ殑鍐呭鍙楀埌浜嗙敤鎴?鐜嬩簲"鐨勫枩鐖便€?
    ],
    point: [
      '鎭枩鎮ㄨ幏寰?0绉垎濂栧姳锛?,
      '鎮ㄧ殑绉垎宸叉墸闄?鐐广€?,
      '绉垎鍙樺姩锛?20绉垎'
    ],
    order: [
      '鎮ㄧ殑璁㈠崟#123456宸插彂璐э紝璇锋敞鎰忔煡鏀躲€?,
      '璁㈠崟#654321宸插畬鎴愶紝鎰熻阿鎮ㄧ殑璐拱銆?,
      '鎮ㄧ殑璁㈠崟鐘舵€佸凡鏇存柊锛岃鍙婃椂鏌ョ湅銆?
    ]
  };

  const notifications = [];
  
  for (let i = 1; i <= count; i++) {
    const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
    const typeTitles = titles[type];
    const typeContents = contents[type];
    
    const now = new Date();
    const pastDays = Math.floor(Math.random() * 30); // 鐢熸垚杩囧幓30澶╁唴鐨勯殢鏈烘椂闂?    const pastHours = Math.floor(Math.random() * 24);
    const pastMinutes = Math.floor(Math.random() * 60);
    
    now.setDate(now.getDate() - pastDays);
    now.setHours(now.getHours() - pastHours);
    now.setMinutes(now.getMinutes() - pastMinutes);
    
    // 闅忔満鍐冲畾鏄惁宸茶锛岄粯璁?0%鐨勯€氱煡鏈
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
  
  // 鎸夋椂闂村€掑簭鎺掑簭锛屾渶鏂扮殑鍦ㄥ墠
  return notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * 妯℃嫙閫氱煡鏈嶅姟
 */
const NotificationMockService = {
  /**
   * 鑾峰彇妯℃嫙閫氱煡鍒楄〃
   * @param {Object} params - 鏌ヨ鍙傛暟
   * @returns {Promise} 鍖呭惈閫氱煡鍒楄〃鐨勬暟鎹?   */
  getNotifications: function(params = {}) {
    return new Promise((resolve) => {
      // 妯℃嫙缃戠粶寤惰繜
      setTimeout(() => {
        let allNotifications = generateMockNotifications(50);
        
        // 鏍规嵁鍙傛暟绛涢€?        if (params.unread_only) {
          allNotifications = allNotifications.filter(item => !item.is_read);
        }
        
        if (params.type) {
          const types = params.type.split(',');
          allNotifications = allNotifications.filter(item => types.includes(item.type));
        }
        
        // 鍒嗛〉
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
   * 鑾峰彇鏈閫氱煡鏁伴噺
   * @returns {Promise} 鏈閫氱煡鏁伴噺
   */
  getUnreadNotificationCount: function() {
    return new Promise((resolve) => {
      // 妯℃嫙缃戠粶寤惰繜
      setTimeout(() => {
        // 闅忔満鐢熸垚鏈鏁伴噺锛岃寖鍥?-15
        const unreadCount = Math.floor(Math.random() * 16);
        resolve(unreadCount);
      }, 300);
    });
  },
  
  /**
   * 鏍囪閫氱煡涓哄凡璇?   * @param {string} notificationId - 閫氱煡ID
   * @returns {Promise} 鎴愬姛鐘舵€?   */
  markAsRead: function(notificationId) {
    return new Promise((resolve) => {
      // 妯℃嫙缃戠粶寤惰繜
      setTimeout(() => {
        resolve({ success: true, notificationId, is_read: true });
      }, 200);
    });
  },
  
  /**
   * 鏍囪鍏ㄩ儴閫氱煡涓哄凡璇?   * @returns {Promise} 鎴愬姛鐘舵€?   */
  markAllAsRead: function() {
    return new Promise((resolve) => {
      // 妯℃嫙缃戠粶寤惰繜
      setTimeout(() => {
        resolve({ success: true });
      }, 300);
    });
  },
  
  /**
   * 鑾峰彇閫氱煡璇︽儏
   * @param {string} notificationId - 閫氱煡ID
   * @returns {Promise} 閫氱煡璇︽儏鏁版嵁
   */
  getNotificationDetail: function(notificationId) {
    return new Promise((resolve) => {
      // 妯℃嫙缃戠粶寤惰繜
      setTimeout(() => {
        // 鐢熸垚妯℃嫙閫氱煡璇︽儏
        const notificationTypes = ['system', 'comment', 'follow', 'like', 'point', 'order'];
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        // 鏍规嵁绫诲瀷鐢熸垚涓嶅悓鐨勮鎯呮暟鎹?        const generateDetailByType = () => {
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
                title: '绯荤粺鍏憡',
                content: '灏婃暚鐨勭敤鎴凤紝鎴戜滑灏嗕簬涓嬪懆浜屽噷鏅?:00-4:00杩涜绯荤粺缁存姢锛屾湡闂存湇鍔″彲鑳戒細鏆傛椂涓嶅彲鐢ㄣ€傛劅璋㈡偍鐨勭悊瑙ｄ笌鏀寔锛?,
                extra_info: {
                  maintenance_time: '涓嬪懆浜?02:00-04:00',
                  affected_services: ['鐢ㄦ埛鐧诲綍', '璁㈠崟鎻愪氦', '鏀粯鍔熻兘']
                }
              };
            case 'comment':
              return {
                ...baseDetail,
                title: '璇勮鎻愰啋',
                content: '鐢ㄦ埛"TechFan"璇勮浜嗘偍鐨勬枃绔犮€婂井淇″皬绋嬪簭寮€鍙戞渶浣冲疄璺点€?,
                target_id: 'article_123456',
                user_id: 'user_789',
                extra_info: {
                  comment_content: '闈炲父瀹炵敤鐨勬枃绔狅紝瀛﹀埌浜嗗緢澶氾紒',
                  article_title: '寰俊灏忕▼搴忓紑鍙戞渶浣冲疄璺?,
                  user_name: 'TechFan',
                  user_avatar: '/images/avatar_default.png'
                }
              };
            case 'follow':
              return {
                ...baseDetail,
                title: '鏂扮殑鍏虫敞',
                content: '鐢ㄦ埛"Designer"鍏虫敞浜嗘偍',
                user_id: 'user_456',
                extra_info: {
                  user_name: 'Designer',
                  user_avatar: '/images/avatar_default.png',
                  user_bio: 'UI/UX璁捐甯堬紝鐑埍鍒涙柊'
                }
              };
            case 'like':
              return {
                ...baseDetail,
                title: '鐐硅禐閫氱煡',
                content: '鐢ㄦ埛"Developer"鐐硅禐浜嗘偍鐨勮瘎璁?,
                target_id: 'comment_789012',
                user_id: 'user_123',
                extra_info: {
                  user_name: 'Developer',
                  user_avatar: '/images/avatar_default.png',
                  target_type: 'comment',
                  original_comment: '鎴戣寰楄繖涓姛鑳藉疄鐜板緱寰堝ソ'
                }
              };
            case 'point':
              return {
                ...baseDetail,
                title: '绉垎濂栧姳',
                content: '鎭枩鎮ㄨ幏寰?0绉垎濂栧姳锛?,
                extra_info: {
                  point_change: 20,
                  current_points: 560,
                  reason: '杩炵画鐧诲綍7澶?,
                  valid_until: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
                }
              };
            case 'order':
              return {
                ...baseDetail,
                title: '璁㈠崟鍙戣揣閫氱煡',
                content: '鎮ㄧ殑璁㈠崟#ORDER123456宸插彂璐?,
                target_id: 'order_123456',
                extra_info: {
                  order_number: 'ORDER123456',
                  order_amount: '楼199.00',
                  items_count: 2,
                  shipping_company: '椤轰赴閫熻繍',
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
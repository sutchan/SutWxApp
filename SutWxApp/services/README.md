﻿/**
 * 文件名 README.md
 * 版本号 1.0.0
 * 更新日期: 2025-11-23
 * 描述: README 鏂囨。鏂囦欢
 */
# 鏈嶅姟灞傛灦鏋勬枃妗?
## 姒傝堪

SutWxApp鏈嶅姟灞傛槸灏忕▼搴忕殑鏍稿績涓氬姟閫昏緫灞傦紝璐熻矗澶勭悊鏁版嵁鑾峰彇銆佷笟鍔￠€昏緫澶勭悊鍜岀姸鎬佺鐞嗐€?
## 鐩綍缁撴瀯

```
services/
鈹溾攢鈹€ index.js               # 鏈嶅姟鍏ュ彛鍜屽鍑?鈹溾攢鈹€ service-manager.js     # 鏈嶅姟绠＄悊鍣紝璐熻矗鏈嶅姟鐨勬敞鍐屽拰鍒濆鍖?鈹溾攢鈹€ service-adapter.js     # 鏈嶅姟閫傞厤鍣紝鐢ㄤ簬缁熶竴涓嶅悓鏈嶅姟鐨勬帴鍙?鈹溾攢鈹€ service-integration.js # 鏈嶅姟闆嗘垚锛屽鐞嗘湇鍔￠棿鐨勪緷璧栧叧绯?鈹溾攢鈹€ app-initializer.js     # 搴旂敤鍒濆鍖栧櫒锛岃礋璐ｆ暣涓簲鐢ㄧ殑鍒濆鍖栨祦绋?鈹斺攢鈹€ README.md              # 鏈枃妗?```

## 鏍稿績鏈嶅姟

### 1. 璁よ瘉鏈嶅姟 (authService.js)

璁よ瘉鏈嶅姟璐熻矗澶勭悊鐢ㄦ埛鐧诲綍銆佺櫥鍑哄拰浼氳瘽绠＄悊銆?
**涓昏鍔熻兘锛?*
- 鐢ㄦ埛鐧诲綍楠岃瘉
- 鐢ㄦ埛鐧诲嚭澶勭悊
- 璁よ瘉浠ょ墝绠＄悊
- 鐧诲綍鐘舵€佹鏌?
**浣跨敤绀轰緥锛?*
```javascript
// 瀵煎叆璁よ瘉鏈嶅姟
const authService = require('./services/authService');

// 鐢ㄦ埛鐧诲綍
authService.login('username', 'password')
  .then(user => {
    console.log('鐧诲綍鎴愬姛', user);
  })
  .catch(error => {
    console.error('鐧诲綍澶辫触', error);
  });

// 妫€鏌ョ櫥褰曠姸鎬?if (authService.isLoggedIn()) {
  // 鐢ㄦ埛宸茬櫥褰?}

// 鐢ㄦ埛鐧诲嚭
authService.logout().then(() => {
  console.log('宸茬櫥鍑?);
});
```

## 鏈嶅姟渚濊禆鍏崇郴

鏈嶅姟涔嬮棿瀛樺湪渚濊禆鍏崇郴锛屽垵濮嬪寲鏃堕渶瑕佹寜鐓ф纭殑椤哄簭鍔犺浇锛?
```
cache -> api -> config -> auth -> 涓氬姟鏈嶅姟
```

### 鏍稿績渚濊禆椤哄簭

- **鍩虹鏈嶅姟锛?*
  - cache: []
  - api: [cache]
  - config: [cache, api]

- **鐢ㄦ埛鐩稿叧鏈嶅姟锛?*
  - auth: [api, cache, config]
  - user: [api, cache, auth]
  - following: [api, auth]

- **鍐呭鐩稿叧鏈嶅姟锛?*
  - category: [api, cache]
  - article: [api, cache, category]
  - comment: [api, auth, article]

- **鐢靛晢鐩稿叧鏈嶅姟锛?*
  - product: [api, cache, category]
  - cart: [api, auth, cache]
  - address: [api, auth, cache]
  - payment: [api, auth, config]
  - order: [api, auth, cache, payment, address]
  - points: [api, auth, cache]

- **鍏朵粬鏈嶅姟锛?*
  - file: [api, auth]
  - feedback: [api, auth]
  - analytics: [api, cache, config]
  - notification: [api, cache, auth]
  - search: [api, cache, config]

## 鍦ㄥ簲鐢ㄤ腑浣跨敤鏈嶅姟

### 鍦╝pp.js涓垵濮嬪寲鏈嶅姟

```javascript
// app.js
const { initializeApp } = require('./services/app-initializer');

App({
  onLaunch: async function() {
    // 鍒濆鍖栨墍鏈夋湇鍔?    const success = await initializeApp({
      services: {
        useAdapters: true,
        enableCache: true
      },
      api: {
        baseUrl: getApp().globalData.baseUrl
      }
    });
    
    if (success) {
      console.log('鏈嶅姟鍒濆鍖栨垚鍔?);
    } else {
      console.error('鏈嶅姟鍒濆鍖栧け璐?);
    }
  },
  
  // 鎻愪緵鑾峰彇鏈嶅姟鐨勫叏灞€鏂规硶
  getService: function(serviceName) {
    const { getService } = require('./services/service-integration');
    return getService(serviceName);
  }
});
```

### 鍦ㄩ〉闈腑浣跨敤鏈嶅姟

```javascript
// pages/index/index.js
const app = getApp();

Page({
  data: {
    articles: []
  },
  
  onLoad: async function() {
    try {
      // 鑾峰彇鏂囩珷鏈嶅姟瀹炰緥
      const articleService = app.getService('article');
      
      // 浣跨敤鏈嶅姟鑾峰彇鏂囩珷鍒楄〃
      const articles = await articleService.getArticles({ page: 1, limit: 10 });
      
      this.setData({ articles });
    } catch (error) {
      console.error('鑾峰彇鏂囩珷鍒楄〃澶辫触', error);
    }
  }
});
```

## 鏈€浣冲疄璺?
1. **鏈嶅姟璁捐鍘熷垯锛?*
   - 鍗曚竴鑱岃矗鍘熷垯
   - 渚濊禆娉ㄥ叆
   - 鎺ュ彛缁熶竴
   - 閿欒澶勭悊

2. **鎬ц兘浼樺寲锛?*
   - 鍚堢悊浣跨敤缂撳瓨
   - 閬垮厤閲嶅璇锋眰
   - 鏁版嵁棰勫姞杞?
3. **閿欒澶勭悊锛?*
   - 缁熶竴閿欒澶勭悊
   - 鐢ㄦ埛鍙嬪ソ鐨勯敊璇彁绀?   - 閿欒鏃ュ織璁板綍\n
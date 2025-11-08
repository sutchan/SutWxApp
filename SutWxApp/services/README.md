# 鏈嶅姟灞傛ā鍧楁枃妗?
## 姒傝堪

鏈嶅姟灞傛槸SutWxApp搴旂敤鐨勬牳蹇冩灦鏋勭粍浠讹紝璐熻矗鏁村悎鍜岀鐞嗘墍鏈変笟鍔℃湇鍔★紝鎻愪緵缁熶竴鐨勬湇鍔¤闂帴鍙ｏ紝瀹炵幇鏈嶅姟鐨勭敓鍛藉懆鏈熺鐞嗐€佷緷璧栨敞鍏ュ拰鍙墿灞曟€с€?
## 鐩綍缁撴瀯

```
services/
鈹溾攢鈹€ index.js               # 鏈嶅姟灞傚叆鍙ｆ枃浠?鈹溾攢鈹€ service-manager.js     # 鏈嶅姟绠＄悊鍣?鈹溾攢鈹€ service-adapter.js     # 鏈嶅姟閫傞厤鍣?鈹溾攢鈹€ service-integration.js # 鏈嶅姟闆嗘垚妯″潡
鈹溾攢鈹€ app-initializer.js     # 搴旂敤绋嬪簭鍒濆鍖栨ā鍧?鈹斺攢鈹€ README.md              # 鏈嶅姟灞傛枃妗ｏ紙褰撳墠鏂囦欢锛?```

## 鏍稿績缁勪欢

### 1. 鏈嶅姟鍏ュ彛 (index.js)

鏈嶅姟鍏ュ彛妯″潡鎻愪緵缁熶竴鐨勬湇鍔¤闂偣锛屾暣鍚堜簡鎵€鏈変笟鍔℃湇鍔″苟瀵煎嚭銆?
**涓昏鍔熻兘锛?*
- 瀵煎叆鍜屾敞鍐屾墍鏈変笟鍔℃湇鍔?- 鎻愪緵`ServiceFactory`宸ュ巶绫荤敤浜庤幏鍙栨湇鍔?- 鏀寔鐩存帴瀵煎叆鍗曚釜鏈嶅姟鎴栨壒閲忓鍏ユ墍鏈夋湇鍔?
**浣跨敤鏂规硶锛?*
```javascript
// 瀵煎叆鏈嶅姟宸ュ巶
const { ServiceFactory } = require('./services/index');

// 鑾峰彇鍗曚釜鏈嶅姟
const articleService = ServiceFactory.getService('article');

// 鐩存帴瀵煎叆鏈嶅姟
const { article, user, payment } = require('./services/index');
```

### 2. 鏈嶅姟绠＄悊鍣?(service-manager.js)

鏈嶅姟绠＄悊鍣ㄨ礋璐ｆ湇鍔＄殑娉ㄥ唽銆佸垵濮嬪寲銆佷緷璧栨敞鍏ュ拰鐢熷懡鍛ㄦ湡绠＄悊銆?
**涓昏鍔熻兘锛?*
- 鏈嶅姟娉ㄥ唽鍜屼緷璧栫鐞?- 鏈嶅姟瀹炰緥缂撳瓨
- 鎷撴墤鎺掑簭瑙ｅ喅鏈嶅姟渚濊禆
- 寰幆渚濊禆妫€娴?- 寮傛鍒濆鍖栨敮鎸?
**浣跨敤鏂规硶锛?*
```javascript
const serviceManager = require('./services/service-manager');

// 娉ㄥ唽鏈嶅姟
serviceManager.register('myService', myServiceInstance, ['dependency1', 'dependency2']);

// 鍒濆鍖栨墍鏈夋湇鍔?await serviceManager.initialize();

// 鑾峰彇鏈嶅姟
const service = serviceManager.get('myService');
```

### 3. 鏈嶅姟閫傞厤鍣?(service-adapter.js)

鏈嶅姟閫傞厤鍣ㄨ礋璐ｅ皢鏃х殑utils鏈嶅姟閫傞厤鍒版柊鐨勬湇鍔℃灦鏋勪腑锛岀‘淇濆悜鍚庡吋瀹规€с€?
**涓昏鍔熻兘锛?*
- 閫氱敤鏈嶅姟閫傞厤
- API鏈嶅姟澧炲己锛堥噸璇曟満鍒躲€侀敊璇鐞嗭級
- 缂撳瓨鏈嶅姟澧炲己锛堢粺璁″拰鐩戞帶锛?- 鎵归噺娉ㄥ唽鍜屽垵濮嬪寲閫傞厤鍣?
**浣跨敤鏂规硶锛?*
```javascript
const { registerServiceAdapters, ServiceAdapterFactory } = require('./services/service-adapter');

// 鍒涘缓鍗曚釜閫傞厤鍣?const adapter = ServiceAdapterFactory.createAdapter(originalService, 'serviceName');

// 鎵归噺娉ㄥ唽閫傞厤鍣?await registerServiceAdapters({
  service1: service1Instance,
  service2: service2Instance
});
```

### 4. 鏈嶅姟闆嗘垚妯″潡 (service-integration.js)

鏈嶅姟闆嗘垚妯″潡璐熻矗鍒濆鍖栧拰閰嶇疆鎵€鏈夋湇鍔★紝鎻愪緵缁熶竴鐨勯泦鎴愭帴鍙ｃ€?
**涓昏鍔熻兘锛?*
- 鏈嶅姟鍔犺浇鍜屽垵濮嬪寲
- 閫傞厤鍣ㄦā寮忔敮鎸?- 鏈嶅姟鍚庡垵濮嬪寲閽╁瓙
- 鏈嶅姟鐘舵€佺鐞?
**浣跨敤鏂规硶锛?*
```javascript
const { initializeServices, getService } = require('./services/service-integration');

// 鍒濆鍖栨湇鍔?await initializeServices({
  useAdapters: true,
  enableCache: true
});

// 鑾峰彇鏈嶅姟
const articleService = getService('article');
```

### 5. 搴旂敤绋嬪簭鍒濆鍖栨ā鍧?(app-initializer.js)

搴旂敤绋嬪簭鍒濆鍖栨ā鍧楄礋璐ｅ湪搴旂敤鍚姩鏃跺垵濮嬪寲鏈嶅姟灞傚拰鍏朵粬鏍稿績缁勪欢銆?
**涓昏鍔熻兘锛?*
- 搴旂敤閰嶇疆绠＄悊
- 鏃ュ織绯荤粺鍒濆鍖?- 鍒濆鍖栨楠ょ鐞?- 鍏ㄥ眬閿欒澶勭悊
- 搴旂敤鐢熷懡鍛ㄦ湡绠＄悊

**浣跨敤鏂规硶锛?*
```javascript
const { initializeApp, getAppStatus } = require('./services/app-initializer');

// 鍒濆鍖栧簲鐢?await initializeApp({
  services: {
    useAdapters: true,
    enableCache: true
  },
  api: {
    baseUrl: 'https://api.example.com'
  }
});

// 鑾峰彇搴旂敤鐘舵€?const status = getAppStatus();
```

## 鏈嶅姟渚濊禆鍏崇郴

鏈嶅姟灞傚疄鐜颁簡瀹屽杽鐨勪緷璧栨敞鍏ユ満鍒讹紝涓昏渚濊禆鍏崇郴濡備笅锛?
### 鏍稿績渚濊禆閾?```
cache -> api -> config -> auth -> 鍏朵粬涓氬姟鏈嶅姟
```

### 璇︾粏渚濊禆鍏崇郴
- **鏍稿績鏈嶅姟**
  - cache: []
  - api: [cache]
  - config: [cache, api]

- **鐢ㄦ埛鐩稿叧鏈嶅姟**
  - auth: [api, cache, config]
  - user: [api, cache, auth]
  - following: [api, auth]

- **鍐呭鐩稿叧鏈嶅姟**
  - category: [api, cache]
  - article: [api, cache, category]
  - comment: [api, auth, article]

- **鐢靛晢鐩稿叧鏈嶅姟**
  - product: [api, cache, category]
  - cart: [api, auth, cache]
  - address: [api, auth, cache]
  - payment: [api, auth, config]
  - order: [api, auth, cache, payment, address]
  - points: [api, auth, cache]

- **杈呭姪鍔熻兘鏈嶅姟**
  - file: [api, auth]
  - feedback: [api, auth]
  - analytics: [api, cache, config]
  - notification: [api, cache, auth]
  - search: [api, cache, config]

## 闆嗘垚鍒板簲鐢ㄧ▼搴?
### 鍦╝pp.js涓泦鎴?
```javascript
// app.js
const { initializeApp } = require('./services/app-initializer');

App({
  onLaunch: async function() {
    // 鍒濆鍖栧簲鐢ㄦ湇鍔?    const success = await initializeApp({
      services: {
        useAdapters: true,
        enableCache: true
      },
      api: {
        baseUrl: getApp().globalData.baseUrl
      }
    });
    
    if (success) {
      console.log('搴旂敤鏈嶅姟鍒濆鍖栨垚鍔?);
    } else {
      console.error('搴旂敤鏈嶅姟鍒濆鍖栧け璐?);
    }
  },
  
  // 鎻愪緵鑾峰彇鏈嶅姟鐨勬柟娉?  getService: function(serviceName) {
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
      // 鑾峰彇鏂囩珷鏈嶅姟
      const articleService = app.getService('article');
      
      // 璋冪敤鏈嶅姟鏂规硶
      const articles = await articleService.getArticles({ page: 1, limit: 10 });
      
      this.setData({ articles });
    } catch (error) {
      console.error('鑾峰彇鏂囩珷澶辫触:', error);
    }
  }
});
```

## 鏈€浣冲疄璺?
1. **鏈嶅姟浣跨敤鍘熷垯**
   - 浼樺厛閫氳繃app.getService()鑾峰彇鏈嶅姟瀹炰緥
   - 閬垮厤鍦ㄩ〉闈㈤棿鐩存帴浼犻€掓湇鍔″疄渚?   - 鏈嶅姟璋冪敤搴斿寘鍚€傚綋鐨勯敊璇鐞?
2. **鏈嶅姟鎵╁睍鎸囧崡**
   - 鏂版湇鍔″簲閬靛惊鐜版湁鐨勬帴鍙ｉ鏍?   - 鏈嶅姟瀹炵幇搴旇€冭檻閿欒澶勭悊鍜岄噸璇曟満鍒?   - 鏈嶅姟闂翠緷璧栧簲鍦╯ervice-adapter.js涓纭厤缃?
3. **鎬ц兘浼樺寲寤鸿**
   - 鍚堢悊浣跨敤缂撳瓨鍑忓皯API璋冪敤
   - 澶ф枃浠跺拰澶嶆潅鎿嶄綔搴旇€冭檻寮傛澶勭悊
   - 鏈嶅姟鍒濆鍖栨椂鍔犺浇蹇呰鐨勯厤缃?
## 鏁呴殰鎺掗櫎

### 鏈嶅姟鍒濆鍖栧け璐?- 妫€鏌ヤ緷璧栧叧绯婚厤缃槸鍚︽纭?- 楠岃瘉鏈嶅姟妯″潡鏄惁瀛樺湪涓斿鍑烘纭?- 鏌ョ湅鏃ュ織鑾峰彇璇︾粏閿欒淇℃伅

### 鏈嶅姟璋冪敤寮傚父
- 纭鏈嶅姟鏄惁宸叉纭垵濮嬪寲
- 妫€鏌ュ弬鏁版牸寮忔槸鍚︾鍚堟湇鍔¤姹?- 楠岃瘉缃戠粶杩炴帴鍜孉PI鏉冮檺

### 寰幆渚濊禆闂
- 妫€鏌ユ湇鍔′緷璧栭厤缃?- 閲嶆瀯浠ｇ爜鍑忓皯鏈嶅姟闂寸殑鑰﹀悎搴?- 浣跨敤浜嬩欢椹卞姩妯″紡鏇夸唬鐩存帴渚濊禆

## 鐗堟湰鍘嗗彶

- v1.0.0: 鏈嶅姟灞傛灦鏋勫垵濮嬪疄鐜?- v1.0.1: 澧炲姞鏈嶅姟閫傞厤鍣ㄥ拰闆嗘垚妯″潡
- v1.1.0: 娣诲姞搴旂敤鍒濆鍖栧櫒鍜屽畬鍠勬枃妗?
---

鏈嶅姟灞傝璁￠伒寰珮鍐呰仛銆佷綆鑰﹀悎鐨勫師鍒欙紝涓篠utWxApp鎻愪緵浜嗙伒娲汇€佸彲鎵╁睍鐨勬湇鍔℃灦鏋勩€傞€氳繃缁熶竴鐨勬湇鍔＄鐞嗗拰璁块棶鏈哄埗锛屽ぇ澶х畝鍖栦簡涓氬姟閫昏緫鐨勫疄鐜板拰缁存姢銆
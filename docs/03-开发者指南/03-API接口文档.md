<!--
鏂囦欢鍚? 03-API鎺ュ彛鏂囨。.md
鐗堟湰鍙? 1.0.1
鏇存柊鏃ユ湡: 2025-11-24
浣滆€? Sut
鎻忚堪: API鎺ュ彛鏂囨。锛岃缁嗚鏄庡皬绋嬪簭涓庡悗绔湇鍔＄殑鎺ュ彛瑙勮寖銆佸弬鏁板畾涔夊拰杩斿洖鏍煎紡
-->
# API 鎺ュ彛鏂囨。

**鐗堟湰鍙凤細1.0.1**
*鏈€鍚庢洿鏂版椂闂达細2025-11-24*

## 1. 姒傝堪

鏈枃妗ｆ棬鍦ㄦ彁渚?SutWxApp 寰俊灏忕▼搴忓悗绔?API 鎺ュ彛鐨勮缁嗚鏄庯紝鍖呮嫭鎺ュ彛鍦板潃銆佽姹傛柟娉曘€佸弬鏁般€佸搷搴旂ず渚嬩互鍙婇敊璇爜绛変俊鎭€傚紑鍙戣€呭彲浠ユ牴鎹湰鏂囨。杩涜鍓嶇寮€鍙戝拰鍚庣鎺ュ彛鑱旇皟銆?
### 1.1 鏂囨。鐩殑

- 鎻愪緵瀹屾暣鐨凙PI鎺ュ彛璇存槑
- 鎸囧鍓嶇寮€鍙戜汉鍛樿繘琛屾帴鍙ｈ皟鐢?- 渚夸簬鍚庣寮€鍙戜汉鍛樼淮鎶ゅ拰鏇存柊鎺ュ彛
- 纭繚鍓嶅悗绔紑鍙戝崗浣滅殑椤哄埄杩涜

### 1.2 閫傜敤鑼冨洿

鏈枃妗ｉ€傜敤浜嶴utWxApp寰俊灏忕▼搴忛」鐩殑鎵€鏈堿PI鎺ュ彛锛屽寘鎷敤鎴锋ā鍧椼€佸晢鍝佹ā鍧椼€佽鍗曟ā鍧椼€佹敮浠樻ā鍧楃瓑銆?
## 2. 璁よ瘉涓庢巿鏉?
鎵€鏈夐渶瑕佺敤鎴疯韩浠界殑 API 鎺ュ彛閮介噰鐢?Bearer Token 杩涜璁よ瘉銆傚墠绔湪鍙戣捣璇锋眰鏃讹紝闇€瑕佸湪璇锋眰澶翠腑鎼哄甫 `Authorization` 瀛楁锛屾牸寮忎负 `Bearer <Your_Token>`銆?
Token 鐨勮幏鍙栧拰鍒锋柊鏈哄埗璇峰弬鑰?[鏋舵瀯璁捐鏂囨。 - 韬唤璁よ瘉](#/docs/03-寮€鍙戣€呮寚鍗?02-鏋舵瀯璁捐鏂囨。.md#韬唤璁よ瘉)銆?
### 2.1 璁よ瘉娴佺▼

1. 鐢ㄦ埛鐧诲綍鑾峰彇Token
2. 鍓嶇瀛樺偍Token锛堝缓璁娇鐢╳x.setStorageSync锛?3. 姣忔璇锋眰鎼哄甫Token
4. Token杩囨湡鏃惰嚜鍔ㄥ埛鏂?5. 鍒锋柊澶辫触鍒欏紩瀵肩敤鎴烽噸鏂扮櫥褰?
### 2.2 Token浣跨敤绀轰緥

```javascript
// API璇锋眰绀轰緥
wx.request({
  url: 'https://api.example.com/wxapp/v1/user/info',
  method: 'GET',
  header: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + wx.getStorageSync('token')
  },
  success: function(res) {
    // 澶勭悊鍝嶅簲鏁版嵁
  },
  fail: function(err) {
    // 澶勭悊璇锋眰澶辫触
  }
});
```

## 3. 鍩虹淇℃伅

*   **API 鍩虹 URL**锛歚https://api.example.com/wxapp/v1` (绀轰緥锛岃鏇挎崲涓哄疄闄呭悗绔湴鍧€)
*   **璇锋眰鏂规硶**锛欸ET, POST, PUT, DELETE
*   **璇锋眰澶?*锛?    *   `Content-Type`: `application/json` (POST/PUT 璇锋眰)
    *   `Authorization`: `Bearer <Your_Token>` (闇€瑕佽璇佺殑鎺ュ彛)
*   **鏁版嵁鏍煎紡**锛欽SON
*   **瀛楃缂栫爜**锛歎TF-8

## 4. 鎺ュ彛鍒楄〃

### 4.1 鐢ㄦ埛妯″潡

#### 4.1.1 鑾峰彇鐢ㄦ埛淇℃伅

*   **鎺ュ彛鍦板潃**锛歚/user/info`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栧綋鍓嶇櫥褰曠敤鎴风殑璇︾粏淇℃伅
*   **璇锋眰鍙傛暟**锛氭棤
*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "userId": "12345",
        "openid": "ox1234567890abcdef",
        "nickname": "Sut",
        "avatarUrl": "https://example.com/avatar.png",
        "gender": 1,
        "city": "Guangzhou",
        "province": "Guangdong",
        "country": "China",
        "language": "zh_CN",
        "phoneNumber": "138****5678",
        "registerTime": "2023-01-01 10:00:00",
        "lastLoginTime": "2023-11-01 15:30:00",
        "userLevel": "VIP",
        "points": 1500
      }
    }
    ```

#### 4.1.2 鏇存柊鐢ㄦ埛淇℃伅

*   **鎺ュ彛鍦板潃**锛歚/user/update`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氭洿鏂板綋鍓嶇櫥褰曠敤鎴风殑淇℃伅
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `nickname` | `string` | 鍚?  | 鐢ㄦ埛鏄电О   |
    | `avatarUrl`| `string` | 鍚?  | 澶村儚 URL   |
    | `gender`   | `number` | 鍚?  | 鎬у埆 (0:鏈煡, 1:鐢? 2:濂? |
    | `birthday` | `string` | 鍚?  | 鐢熸棩 (鏍煎紡锛歒YYY-MM-DD) |
    | `signature`| `string` | 鍚?  | 涓€х鍚?  |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": null
    }
    ```

#### 4.1.3 鑾峰彇鐢ㄦ埛鏀惰揣鍦板潃鍒楄〃

*   **鎺ュ彛鍦板潃**锛歚/user/address/list`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栧綋鍓嶇敤鎴风殑鏀惰揣鍦板潃鍒楄〃
*   **璇锋眰鍙傛暟**锛氭棤
*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": [
        {
          "addressId": "addr001",
          "receiverName": "寮犱笁",
          "phoneNumber": "13800138000",
          "province": "骞夸笢鐪?,
          "city": "骞垮窞甯?,
          "district": "澶╂渤鍖?,
          "detailAddress": "澶╂渤璺?23鍙?,
          "isDefault": true
        },
        {
          "addressId": "addr002",
          "receiverName": "鏉庡洓",
          "phoneNumber": "13900139000",
          "province": "骞夸笢鐪?,
          "city": "娣卞湷甯?,
          "district": "鍗楀北鍖?,
          "detailAddress": "绉戞妧鍥矾456鍙?,
          "isDefault": false
        }
      ]
    }
    ```

#### 4.1.4 淇敼澶村儚

*   **鎺ュ彛鍦板潃**锛歚/user/avatar`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氫慨鏀圭敤鎴峰ご鍍?*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `avatarUrl`| `string` | 鏄?  | 澶村儚URL锛堥€氬父鏄笂浼犲埌浜戝瓨鍌ㄥ悗鐨刄RL锛?|

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "avatarUrl": "https://example.com/new-avatar.png"
      }
    }
    ```

#### 4.1.5 缁戝畾鎵嬫満鍙?
*   **鎺ュ彛鍦板潃**锛歚/user/bind-phone`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氱粦瀹氱敤鎴锋墜鏈哄彿
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `code`    | `string` | 鏄?  | 寰俊鑾峰彇鎵嬫満鍙风殑code |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "phone": "13800138000"
      }
    }
    ```

#### 4.1.6 缁戝畾閭

*   **鎺ュ彛鍦板潃**锛歚/user/bind-email`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氱粦瀹氱敤鎴烽偖绠?*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?       | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :------------ | :----- | :--- | :--------- |
    | `email`       | `string` | 鏄?  | 閭鍦板潃   |
    | `verifyCode`  | `string` | 鏄?  | 楠岃瘉鐮?    |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "email": "user@example.com"
      }
    }
    ```

#### 4.1.7 鍙戦€侀偖绠遍獙璇佺爜

*   **鎺ュ彛鍦板潃**锛歚/user/send-email-code`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氬彂閫侀偖绠遍獙璇佺爜
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `email`   | `string` | 鏄?  | 閭鍦板潃   |
    | `type`    | `string` | 鏄?  | 楠岃瘉鐮佺被鍨嬶細bind-缁戝畾閭锛宺eset-閲嶇疆瀵嗙爜 |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "楠岃瘉鐮佸凡鍙戦€?,
      "data": {
        "expireAt": "2023-11-01 16:00:00"
      }
    }
    ```

#### 4.1.8 鑾峰彇鐢ㄦ埛缁熻淇℃伅

*   **鎺ュ彛鍦板潃**锛歚/user/stats`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栫敤鎴风粺璁′俊鎭?*   **璇锋眰鍙傛暟**锛氭棤
*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "stats": {
          "orderCount": 10,
          "favoriteCount": 5,
          "addressCount": 2,
          "couponCount": 3,
          "points": 1500,
          "level": 2,
          "experience": 1500,
          "nextLevelExp": 2000,
          "unreadMessageCount": 3
        }
      }
    }
    ```

### 4.2 鍟嗗搧妯″潡

#### 4.2.1 鑾峰彇鍟嗗搧鍒楄〃

*   **鎺ュ彛鍦板潃**锛歚/product/list`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氬惁
*   **鍔熻兘鎻忚堪**锛氳幏鍙栧晢鍝佸垪琛紝鏀寔鍒嗛〉鍜岀瓫閫?*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `categoryId`| `string` | 鍚?  | 鍒嗙被ID     |
    | `keyword`  | `string` | 鍚?  | 鎼滅储鍏抽敭璇?|
    | `sortType` | `string` | 鍚?  | 鎺掑簭绫诲瀷 (price_asc, price_desc, sales_desc, newest) |
    | `page`     | `number` | 鍚?  | 椤电爜锛岄粯璁や负1 |
    | `pageSize` | `number` | 鍚?  | 姣忛〉鏁伴噺锛岄粯璁や负10 |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "total": 100,
        "page": 1,
        "pageSize": 10,
        "list": [
          {
            "productId": "p001",
            "productName": "鍟嗗搧A",
            "categoryId": "c001",
            "categoryName": "鏁扮爜浜у搧",
            "price": 199.00,
            "originalPrice": 299.00,
            "stock": 50,
            "sales": 120,
            "mainImage": "https://example.com/product/p001.jpg",
            "tags": ["鐑攢", "鏂板搧"]
          },
          {
            "productId": "p002",
            "productName": "鍟嗗搧B",
            "categoryId": "c002",
            "categoryName": "鐢熸椿鐢ㄥ搧",
            "price": 99.00,
            "originalPrice": 149.00,
            "stock": 30,
            "sales": 80,
            "mainImage": "https://example.com/product/p002.jpg",
            "tags": ["鐗逛环"]
          }
        ]
      }
    }
    ```

#### 4.2.2 鑾峰彇鍟嗗搧璇︽儏

*   **鎺ュ彛鍦板潃**锛歚/product/detail/:productId`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氬惁
*   **鍔熻兘鎻忚堪**锛氳幏鍙栨寚瀹氬晢鍝佺殑璇︾粏淇℃伅
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?     | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :---------- | :----- | :--- | :--------- |
    | `productId` | `string` | 鏄?  | 鍟嗗搧ID     |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "productId": "p001",
        "productName": "鍟嗗搧A",
        "categoryId": "c001",
        "categoryName": "鏁扮爜浜у搧",
        "price": 199.00,
        "originalPrice": 299.00,
        "stock": 50,
        "sales": 120,
        "description": "<p>鍟嗗搧璇︾粏鎻忚堪...</p>",
        "images": [
          "https://example.com/product/p001_1.jpg",
          "https://example.com/product/p001_2.jpg",
          "https://example.com/product/p001_3.jpg"
        ],
        "specifications": [
          {
            "specId": "spec001",
            "specName": "棰滆壊",
            "options": [
              {"optionId": "opt001", "optionName": "绾㈣壊", "price": 0},
              {"optionId": "opt002", "optionName": "钃濊壊", "price": 10}
            ]
          },
          {
            "specId": "spec002",
            "specName": "灏哄",
            "options": [
              {"optionId": "opt003", "optionName": "S", "price": 0},
              {"optionId": "opt004", "optionName": "M", "price": 5}
            ]
          }
        ],
        "tags": ["鐑攢", "鏂板搧"],
        "createTime": "2023-10-01 10:00:00",
        "updateTime": "2023-10-15 15:30:00"
      }
    }
    ```

### 4.3 璐墿杞︽ā鍧?
#### 4.3.1 鑾峰彇璐墿杞﹀垪琛?
*   **鎺ュ彛鍦板潃**锛歚/cart/list`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栧綋鍓嶇敤鎴风殑璐墿杞﹀晢鍝佸垪琛?*   **璇锋眰鍙傛暟**锛氭棤
*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": [
        {
          "cartItemId": "ci001",
          "productId": "p001",
          "productName": "鍟嗗搧A",
          "mainImage": "https://example.com/product/p001.jpg",
          "price": 199.00,
          "quantity": 2,
          "selected": true,
          "stock": 50,
          "specifications": [
            {"specName": "棰滆壊", "optionName": "绾㈣壊"},
            {"specName": "灏哄", "optionName": "M"}
          ]
        },
        {
          "cartItemId": "ci002",
          "productId": "p002",
          "productName": "鍟嗗搧B",
          "mainImage": "https://example.com/product/p002.jpg",
          "price": 99.00,
          "quantity": 1,
          "selected": false,
          "stock": 30,
          "specifications": [
            {"specName": "棰滆壊", "optionName": "钃濊壊"},
            {"specName": "灏哄", "optionName": "L"}
          ]
        }
      ],
      "totalAmount": 497.00,
      "selectedAmount": 398.00
    }
    ```

#### 4.3.2 娣诲姞鍟嗗搧鍒拌喘鐗╄溅

*   **鎺ュ彛鍦板潃**锛歚/cart/add`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氬皢鍟嗗搧娣诲姞鍒拌喘鐗╄溅
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?       | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :------------ | :----- | :--- | :--------- |
    | `productId`   | `string` | 鏄?  | 鍟嗗搧ID     |
    | `quantity`    | `number` | 鏄?  | 鍟嗗搧鏁伴噺   |
    | `specifications`| `array` | 鍚?  | 鍟嗗搧瑙勬牸   |

*   **璇锋眰绀轰緥**锛?
    ```json
    {
      "productId": "p001",
      "quantity": 2,
      "specifications": [
        {"specName": "棰滆壊", "optionName": "绾㈣壊"},
        {"specName": "灏哄", "optionName": "M"}
      ]
    }
    ```

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "cartItemId": "ci001"
      }
    }
    ```

### 4.4 璁㈠崟妯″潡

#### 4.4.1 鍒涘缓璁㈠崟

*   **鎺ュ彛鍦板潃**锛歚/order/create`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氬垱寤烘柊璁㈠崟
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?       | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :------------ | :----- | :--- | :--------- |
    | `addressId`   | `string` | 鏄?  | 鏀惰揣鍦板潃ID |
    | `cartItemIds` | `array` | 鏄?  | 璐墿杞﹀晢鍝両D鍒楄〃 |
    | `remark`      | `string` | 鍚?  | 璁㈠崟澶囨敞   |

*   **璇锋眰绀轰緥**锛?
    ```json
    {
      "addressId": "addr001",
      "cartItemIds": ["ci001", "ci002"],
      "remark": "璇峰湪宸ヤ綔鏃ラ厤閫?
    }
    ```

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "orderId": "o001",
        "orderSn": "20231101123456",
        "totalAmount": 497.00,
        "payAmount": 497.00
      }
    }
    ```

#### 4.4.2 鑾峰彇璁㈠崟鍒楄〃

*   **鎺ュ彛鍦板潃**锛歚/order/list`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栧綋鍓嶇敤鎴风殑璁㈠崟鍒楄〃
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `status`   | `string` | 鍚?  | 璁㈠崟鐘舵€?(all, pending, paid, shipped, completed, cancelled) |
    | `page`     | `number` | 鍚?  | 椤电爜锛岄粯璁や负1 |
    | `pageSize` | `number` | 鍚?  | 姣忛〉鏁伴噺锛岄粯璁や负10 |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "total": 50,
        "page": 1,
        "pageSize": 10,
        "list": [
          {
            "orderId": "o001",
            "orderSn": "20231101123456",
            "totalAmount": 497.00,
            "status": "pending",
            "statusText": "寰呮敮浠?,
            "createTime": "2023-11-01 10:00:00",
            "goodsList": [
              {
                "productId": "p001",
                "productName": "鍟嗗搧A",
                "mainImage": "https://example.com/product/p001.jpg",
                "price": 199.00,
                "quantity": 2
              }
            ]
          }
        ]
      }
    }
    ```

### 4.5 鏀粯妯″潡

#### 4.5.1 鍒涘缓鏀粯璁㈠崟

*   **鎺ュ彛鍦板潃**锛歚/pay/create`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氫负鎸囧畾璁㈠崟鍒涘缓鏀粯
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `orderId` | `string` | 鏄?  | 璁㈠崟ID     |

*   **璇锋眰绀轰緥**锛?
    ```json
    {
      "orderId": "o001"
    }
    ```

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "payId": "pay001",
        "timeStamp": "1698792000",
        "nonceStr": "5K8264ILTKCH16CQ2502SI8ZNMTM67VS",
        "package": "prepay_id=wx201410272009395522657a690389285100",
        "signType": "RSA",
        "paySign": "oR9d8PuhnIc+YZ8cBHFCwA..."
      }
    }
    ```

### 4.6 浼樻儬鍒告ā鍧?
#### 4.6.1 鑾峰彇鍙敤浼樻儬鍒稿垪琛?
*   **鎺ュ彛鍦板潃**锛歚/coupons/available`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栫敤鎴峰彲鐢ㄧ殑浼樻儬鍒稿垪琛?*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `productId` | `string` | 鍚?  | 鍟嗗搧ID锛堢敤浜庤幏鍙栭€傜敤浜庣壒瀹氬晢鍝佺殑浼樻儬鍒革級 |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "coupons": [
          {
            "_id": "string",
            "name": "婊?00鍑?0浼樻儬鍒?,
            "type": 0,
            "value": 10,
            "minOrderAmount": 100,
            "maxDiscount": 0,
            "startAt": "string",
            "endAt": "string",
            "status": 0,
            "applicableProducts": []
          }
        ]
      }
    }
    ```

#### 4.6.2 鑾峰彇浼樻儬鍒歌鎯?
*   **鎺ュ彛鍦板潃**锛歚/coupons/:id`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栦紭鎯犲埜璇︽儏
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `id`      | `string` | 鏄?  | 浼樻儬鍒窱D   |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "coupon": {
          "_id": "string",
          "name": "婊?00鍑?0浼樻儬鍒?,
          "type": 0,
          "value": 10,
          "minOrderAmount": 100,
          "maxDiscount": 0,
          "startAt": "string",
          "endAt": "string",
          "status": 0,
          "applicableProducts": [],
          "applicableCategories": [],
          "usageRules": "string",
          "receivedAt": "string",
          "usedAt": "string",
          "orderId": "string"
        }
      }
    }
    ```

#### 4.6.3 棰嗗彇浼樻儬鍒?
*   **鎺ュ彛鍦板潃**锛歚/coupons/:id/receive`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氶鍙栦紭鎯犲埜
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `id`      | `string` | 鏄?  | 浼樻儬鍒窱D   |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "coupon": {
          "_id": "string",
          "name": "婊?00鍑?0浼樻儬鍒?,
          "type": 0,
          "value": 10,
          "minOrderAmount": 100
        }
      }
    }
    ```

#### 4.6.4 鑾峰彇浼樻儬鍒告椿鍔ㄥ垪琛?
*   **鎺ュ彛鍦板潃**锛歚/coupon-activities`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栦紭鎯犲埜娲诲姩鍒楄〃
*   **璇锋眰鍙傛暟**锛氭棤
*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "activities": [
          {
            "_id": "string",
            "name": "鏂扮敤鎴蜂紭鎯犲埜娲诲姩",
            "description": "string",
            "startAt": "string",
            "endAt": "string",
            "coupons": [
              {
                "_id": "string",
                "name": "鏂颁汉绔嬪噺鍒?,
                "type": 0,
                "value": 20,
                "minOrderAmount": 0
              }
            ],
            "status": 1,
            "received": false
          }
        ]
      }
    }
    ```

### 4.7 鏀惰棌妯″潡

#### 4.7.1 鑾峰彇鏀惰棌鍒楄〃

*   **鎺ュ彛鍦板潃**锛歚/favorites`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栫敤鎴锋敹钘忓垪琛?*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `page`    | `number` | 鍚?  | 椤电爜锛岄粯璁や负1 |
    | `pageSize` | `number` | 鍚?  | 姣忛〉鏁伴噺锛岄粯璁や负20 |
    | `type`    | `string` | 鍚?  | 鏀惰棌绫诲瀷锛坧roduct-鍟嗗搧锛?|

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "favorites": [
          {
            "_id": "string",
            "type": "product",
            "targetId": "string",
            "product": {
              "_id": "string",
              "name": "鍟嗗搧鍚嶇О",
              "coverImage": "string",
              "price": 0,
              "originalPrice": 0,
              "stock": 0
            },
            "createdAt": "string"
          }
        ]
      },
      "meta": {
        "total": 100,
        "page": 1,
        "pageSize": 20,
        "totalPages": 5
      }
    }
    ```

#### 4.7.2 鏀惰棌鍟嗗搧

*   **鎺ュ彛鍦板潃**锛歚/favorites`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氭敹钘忓晢鍝?*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `type`    | `string` | 鏄?  | 鏀惰棌绫诲瀷锛坧roduct-鍟嗗搧锛?|
    | `targetId` | `string` | 鏄?  | 鏀惰棌鐩爣ID |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "favorite": {
          "_id": "string",
          "type": "product",
          "targetId": "string",
          "createdAt": "string"
        }
      }
    }
    ```

#### 4.7.3 鍙栨秷鏀惰棌

*   **鎺ュ彛鍦板潃**锛歚/favorites/:id`
*   **璇锋眰鏂规硶**锛歚DELETE`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氬彇娑堟敹钘?*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `id`      | `string` | 鏄?  | 鏀惰棌璁板綍ID |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success"
    }
    ```

#### 4.7.4 鎵归噺鍙栨秷鏀惰棌

*   **鎺ュ彛鍦板潃**锛歚/favorites/batch-delete`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氭壒閲忓彇娑堟敹钘?*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `ids`     | `array` | 鏄?  | 鏀惰棌璁板綍ID鏁扮粍 |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "deletedCount": 2
      }
    }
    ```

#### 4.7.5 妫€鏌ユ槸鍚﹀凡鏀惰棌

*   **鎺ュ彛鍦板潃**锛歚/favorites/check`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氭鏌ユ槸鍚﹀凡鏀惰棌鎸囧畾鍟嗗搧
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `type`    | `string` | 鏄?  | 鏀惰棌绫诲瀷 |
    | `targetId` | `string` | 鏄?  | 鏀惰棌鐩爣ID |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "isFavorite": true,
        "favoriteId": "string"
      }
    }
    ```

### 4.6 绉垎妯″潡

#### 4.6.1 鑾峰彇鐢ㄦ埛绉垎

*   **鎺ュ彛鍦板潃**锛歚/points/balance`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栧綋鍓嶇敤鎴风殑绉垎浣欓
*   **璇锋眰鍙傛暟**锛氭棤
*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "totalPoints": 1500,
        "availablePoints": 1200,
        "frozenPoints": 300
      }
    }
    ```

#### 4.6.2 鑾峰彇绉垎浠诲姟鍒楄〃

*   **鎺ュ彛鍦板潃**锛歚/points/tasks`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栫Н鍒嗕换鍔″垪琛?*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `type`    | `string` | 鍚?  | 浠诲姟绫诲瀷 (all, once, daily, weekly, monthly) |
    | `status`  | `string` | 鍚?  | 浠诲姟鐘舵€?(all, pending, completed, unclaimed) |
    | `page`    | `number` | 鍚?  | 椤电爜锛岄粯璁や负1 |
    | `pageSize`| `number` | 鍚?  | 姣忛〉鏁伴噺锛岄粯璁や负20 |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "total": 10,
        "list": [
          {
            "taskId": "task001",
            "taskName": "姣忔棩绛惧埌",
            "taskDescription": "姣忔棩鐧诲綍灏忕▼搴忓嵆鍙幏寰楃Н鍒?,
            "taskType": "daily",
            "points": 10,
            "status": "completed",
            "completedTimes": 5,
            "maxTimes": 7
          },
          {
            "taskId": "task002",
            "taskName": "棣栨璐拱鍟嗗搧",
            "taskDescription": "棣栨璐拱浠绘剰鍟嗗搧鍗冲彲鑾峰緱绉垎",
            "taskType": "once",
            "points": 100,
            "status": "pending",
            "completedTimes": 0,
            "maxTimes": 1
          }
        ]
      }
    }
    ```

#### 4.6.3 瀹屾垚绉垎浠诲姟

*   **鎺ュ彛鍦板潃**锛歚/points/task/complete`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氬畬鎴愮Н鍒嗕换鍔★紝鑾峰彇鐩稿簲绉垎
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `taskId`  | `string` | 鏄?  | 浠诲姟ID     |

*   **璇锋眰绀轰緥**锛?
    ```json
    {
      "taskId": "task001"
    }
    ```

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "taskId": "task001",
        "taskName": "姣忔棩绛惧埌",
        "earnedPoints": 10,
        "totalPoints": 1510,
        "completedTimes": 6,
        "maxTimes": 7
      }
    }
    ```

#### 4.6.4 鑾峰彇绉垎鏄庣粏

*   **鎺ュ彛鍦板潃**锛歚/points/history`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栫敤鎴风Н鍒嗚幏鍙栧拰娑堣垂鏄庣粏
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `type`    | `string` | 鍚?  | 鏄庣粏绫诲瀷 (all, earn, consume) |
    | `page`    | `number` | 鍚?  | 椤电爜锛岄粯璁や负1 |
    | `pageSize`| `number` | 鍚?  | 姣忛〉鏁伴噺锛岄粯璁や负20 |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "total": 50,
        "page": 1,
        "pageSize": 20,
        "list": [
          {
            "id": "p001",
            "type": "earn",
            "points": 10,
            "description": "姣忔棩绛惧埌",
            "createTime": "2023-11-01 09:00:00",
            "balance": 1510
          },
          {
            "id": "p002",
            "type": "consume",
            "points": -50,
            "description": "绉垎鍏戞崲鍟嗗搧",
            "createTime": "2023-10-30 15:30:00",
            "balance": 1500
          }
        ]
      }
    }
    ```

#### 4.6.5 绉垎鍏戞崲鍟嗗搧

*   **鎺ュ彛鍦板潃**锛歚/points/exchange`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氫娇鐢ㄧН鍒嗗厬鎹㈠晢鍝佹垨浼樻儬鍒?*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `goodsId` | `string` | 鏄?  | 鍏戞崲鍟嗗搧ID |
    | `quantity`| `number` | 鍚?  | 鍏戞崲鏁伴噺锛岄粯璁や负1 |

*   **璇锋眰绀轰緥**锛?
    ```json
    {
      "goodsId": "pg001",
      "quantity": 1
    }
    ```

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "exchangeId": "e001",
        "goodsId": "pg001",
        "goodsName": "10鍏冧紭鎯犲埜",
        "pointsUsed": 100,
        "quantity": 1,
        "totalPoints": 1410
      }
    }
    ```

#### 4.6.6 鑾峰彇绉垎鍟嗗煄鍟嗗搧鍒楄〃

*   **鎺ュ彛鍦板潃**锛歚/points/goods`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栫Н鍒嗗晢鍩庡彲鍏戞崲鍟嗗搧鍒楄〃
*   **璇锋眰鍙傛暟**锛?
    | 鍙傛暟鍚?   | 绫诲瀷   | 蹇呭～ | 璇存槑       |
    | :-------- | :----- | :--- | :--------- |
    | `categoryId`| `string` | 鍚?  | 鍒嗙被ID     |
    | `page`    | `number` | 鍚?  | 椤电爜锛岄粯璁や负1 |
    | `pageSize`| `number` | 鍚?  | 姣忛〉鏁伴噺锛岄粯璁や负10 |

*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "total": 20,
        "page": 1,
        "pageSize": 10,
        "list": [
          {
            "goodsId": "pg001",
            "goodsName": "10鍏冧紭鎯犲埜",
            "description": "婊?0鍏冨彲鐢紝鏈夋晥鏈?0澶?,
            "points": 100,
            "stock": 500,
            "image": "https://example.com/goods/pg001.jpg",
            "category": "浼樻儬鍒?
          },
          {
            "goodsId": "pg002",
            "goodsName": "绮剧編姘存澂",
            "description": "涓嶉攬閽㈡潗璐紝350ml瀹归噺",
            "points": 500,
            "stock": 100,
            "image": "https://example.com/goods/pg002.jpg",
            "category": "瀹炵墿鍟嗗搧"
          }
        ]
      }
    }
    ```

#### 4.6.7 绛惧埌鑾峰彇绉垎

*   **鎺ュ彛鍦板潃**锛歚/points/signin`
*   **璇锋眰鏂规硶**锛歚POST`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氭瘡鏃ョ鍒拌幏鍙栫Н鍒?*   **璇锋眰鍙傛暟**锛氭棤
*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "earnedPoints": 10,
        "totalPoints": 1520,
        "continuousDays": 5,
        "isTodaySigned": true,
        "nextDayBonus": 15
      }
    }
    ```

#### 4.6.8 鑾峰彇绛惧埌鐘舵€?
*   **鎺ュ彛鍦板潃**锛歚/points/signin/status`
*   **璇锋眰鏂规硶**锛歚GET`
*   **鏄惁闇€瑕佽璇?*锛氭槸
*   **鍔熻兘鎻忚堪**锛氳幏鍙栫敤鎴风鍒扮姸鎬佸拰杩炵画绛惧埌淇℃伅
*   **璇锋眰鍙傛暟**锛氭棤
*   **鍝嶅簲绀轰緥**锛?
    ```json
    {
      "code": 0,
      "message": "success",
      "data": {
        "isTodaySigned": true,
        "continuousDays": 5,
        "totalSignedDays": 30,
        "monthSignedDays": 15,
        "calendar": [
          {
            "date": "2023-11-01",
            "signed": true,
            "points": 10
          },
          {
            "date": "2023-11-02",
            "signed": false,
            "points": 0
          }
        ]
      }
    }
    ```

## 5. 閿欒鐮?
| 閿欒鐮?| 璇存槑         | 瑙ｅ喅鏂规 |
| :----- | :----------- | :------- |
| `0`    | 鎴愬姛         | -        |
| `10001`| 鏈璇?      | 閲嶆柊鐧诲綍鑾峰彇Token |
| `10002`| 鍙傛暟閿欒     | 妫€鏌ヨ姹傚弬鏁版牸寮忓拰蹇呭～椤?|
| `10003`| 璧勬簮涓嶅瓨鍦?  | 纭璧勬簮ID鏄惁姝ｇ‘ |
| `10004`| 鏉冮檺涓嶈冻     | 鑱旂郴绠＄悊鍛樺垎閰嶇浉搴旀潈闄?|
| `10005`| Token宸茶繃鏈? | 鍒锋柊Token鎴栭噸鏂扮櫥褰?|
| `20001`| 鍟嗗搧搴撳瓨涓嶈冻 | 閫夋嫨鍏朵粬鍟嗗搧鎴栫瓑寰呰ˉ璐?|
| `20002`| 璁㈠崟宸插彇娑?  | 閲嶆柊鍒涘缓璁㈠崟 |
| `20003`| 鏀粯澶辫触     | 妫€鏌ユ敮浠樺弬鏁版垨閲嶈瘯 |
| `30001`| 璐墿杞︿负绌?  | 娣诲姞鍟嗗搧鍒拌喘鐗╄溅 |
| `30002`| 鏀惰揣鍦板潃涓嶅瓨鍦?| 娣诲姞鎴栭€夋嫨鏈夋晥鏀惰揣鍦板潃 |
| `99999`| 绯荤粺鍐呴儴閿欒 | 鑱旂郴鎶€鏈敮鎸?|

## 6. 鎺ュ彛璋冪敤鏈€浣冲疄璺?
### 6.1 閿欒澶勭悊

```javascript
// 缁熶竴閿欒澶勭悊绀轰緥
function apiRequest(options) {
  return new Promise((resolve, reject) => {
    wx.request({
      ...options,
      success: (res) => {
        if (res.data.code === 0) {
          resolve(res.data.data);
        } else if (res.data.code === 10001 || res.data.code === 10005) {
          // Token澶辨晥锛岄噸鏂扮櫥褰?          wx.removeStorageSync('token');
          wx.navigateTo({
            url: '/pages/login/login'
          });
          reject(new Error('鐧诲綍宸茶繃鏈燂紝璇烽噸鏂扮櫥褰?));
        } else {
          wx.showToast({
            title: res.data.message || '璇锋眰澶辫触',
            icon: 'none'
          });
          reject(new Error(res.data.message || '璇锋眰澶辫触'));
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '缃戠粶閿欒锛岃绋嶅悗閲嶈瘯',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
}
```

### 6.2 璇锋眰鎷︽埅

```javascript
// 璇锋眰鎷︽埅鍣ㄧず渚?const requestInterceptor = (options) => {
  // 娣诲姞鍏叡鍙傛暟
  if (!options.data) {
    options.data = {};
  }
  
  // 娣诲姞Token
  const token = wx.getStorageSync('token');
  if (token) {
    options.header = options.header || {};
    options.header.Authorization = `Bearer ${token}`;
  }
  
  // 娣诲姞鏃堕棿鎴抽槻姝㈢紦瀛?  options.data._t = Date.now();
  
  return options;
};
```

### 6.3 鍝嶅簲鏁版嵁缂撳瓨

```javascript
// 鍝嶅簲鏁版嵁缂撳瓨绀轰緥
function requestWithCache(options, cacheTime = 5 * 60 * 1000) {
  const cacheKey = JSON.stringify(options);
  const cachedData = wx.getStorageSync(cacheKey);
  
  if (cachedData && (Date.now() - cachedData.timestamp < cacheTime)) {
    return Promise.resolve(cachedData.data);
  }
  
  return apiRequest(options).then(data => {
    wx.setStorageSync(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  });
}
```

## 7. 鎬荤粨

鏈枃妗ｆ彁渚涗簡 SutWxApp 寰俊灏忕▼搴忓悗绔?API 鎺ュ彛鐨勮缁嗚鏄庛€傚紑鍙戣€呭簲涓ユ牸閬靛惊鎺ュ彛瑙勮寖杩涜寮€鍙戯紝骞舵敞鎰忛敊璇鐞嗗拰瀹夊叏鏈哄埗銆傚鏈夌枒闂紝璇疯仈绯诲悗绔紑鍙戜汉鍛樸€?
---

**鐗堟湰鍙凤細1.0.0**
*鏈€鍚庢洿鏂版椂闂达細2025-11-24*
<!--
鏂囦欢鍚? 05-鏈嶅姟灞侫PI鏂囨。.md
鐗堟湰鍙? 1.0.0
鏇存柊鏃ユ湡: 2025-11-24
浣滆€? Sut
鎻忚堪: 鏈嶅姟灞侫PI鏂囨。锛岃缁嗚鏄庡皬绋嬪簭鏈嶅姟灞傜殑鎺ュ彛瀹氫箟銆佸姛鑳藉疄鐜板拰浣跨敤鏂规硶
-->

# 鏈嶅姟灞侫PI鏂囨。

**鐗堟湰鍙凤細1.0.0**
*鏈€鍚庢洿鏂版椂闂达細2025骞?1鏈?3鏃?

## 1. 姒傝堪

鏈枃妗ｈ缁嗘弿杩颁簡SutWxApp寰俊灏忕▼搴忛」鐩腑鏈嶅姟灞傜殑API鎺ュ彛锛屽寘鎷璇佹湇鍔°€佺Н鍒嗘湇鍔°€佹敮浠樻湇鍔＄瓑鍚勪釜妯″潡鐨勬帴鍙ｈ鏄庛€佸弬鏁般€佽繑鍥炲€煎拰浣跨敤绀轰緥銆?
### 1.1 鏂囨。鐩殑

- 鎻愪緵瀹屾暣鐨勬湇鍔″眰API鎺ュ彛璇存槑
- 鎸囧鍓嶇寮€鍙戜汉鍛樿繘琛屾湇鍔″眰璋冪敤
- 渚夸簬鍚庣寮€鍙戜汉鍛樼淮鎶ゅ拰鏇存柊鎺ュ彛
- 纭繚鍓嶅悗绔紑鍙戝崗浣滅殑椤哄埄杩涜

### 1.2 閫傜敤鑼冨洿

鏈枃妗ｉ€傜敤浜嶴utWxApp寰俊灏忕▼搴忛」鐩殑鎵€鏈夋湇鍔″眰API鎺ュ彛锛屽寘鎷璇佹ā鍧椼€佺Н鍒嗘ā鍧椼€佹敮浠樻ā鍧椼€侀€氱煡妯″潡绛夈€?
## 2. 璁よ瘉鏈嶅姟 (authService)

璁よ瘉鏈嶅姟妯″潡璐熻矗澶勭悊鐢ㄦ埛鐧诲綍銆佺櫥鍑恒€佷細璇濈鐞嗙瓑鍔熻兘銆?
### 2.1 鐢ㄦ埛鐧诲綍

**鎺ュ彛鍦板潃**: `authService.login(username, password)`

**鍔熻兘鎻忚堪**: 鐢ㄦ埛鐧诲綍楠岃瘉

**鍙傛暟**:
- `username` (string): 鐢ㄦ埛鍚?- `password` (string): 瀵嗙爜

**杩斿洖鍊?*: Promise<Object> - 鍖呭惈鐢ㄦ埛淇℃伅鐨勫璞?
**浣跨敤绀轰緥**:
```javascript
try {
  const user = await authService.login('test', '123456');
  console.log('鐧诲綍鎴愬姛:', user);
  // 杈撳嚭: { id: 1, username: 'test', token: 'mock_token_123' }
} catch (error) {
  console.error('鐧诲綍澶辫触:', error.message);
}
```

### 2.2 鐢ㄦ埛鐧诲嚭

**鎺ュ彛鍦板潃**: `authService.logout()`

**鍔熻兘鎻忚堪**: 鐢ㄦ埛鐧诲嚭锛屾竻闄ゆ湰鍦板瓨鍌ㄧ殑token

**杩斿洖鍊?*: Promise<void>

**浣跨敤绀轰緥**:
```javascript
try {
  await authService.logout();
  console.log('鐧诲嚭鎴愬姛');
} catch (error) {
  console.error('鐧诲嚭澶辫触:', error.message);
}
```

### 2.3 鑾峰彇璁よ瘉Token

**鎺ュ彛鍦板潃**: `authService.getToken()`

**鍔熻兘鎻忚堪**: 鑾峰彇褰撳墠瀛樺偍鐨勮璇乼oken

**杩斿洖鍊?*: string | null - 杩斿洖token鎴杗ull

**浣跨敤绀轰緥**:
```javascript
const token = authService.getToken();
if (token) {
  console.log('鐢ㄦ埛宸茬櫥褰?);
} else {
  console.log('鐢ㄦ埛鏈櫥褰?);
}
```

### 2.4 妫€鏌ョ櫥褰曠姸鎬?
**鎺ュ彛鍦板潃**: `authService.isLoggedIn()`

**鍔熻兘鎻忚堪**: 妫€鏌ョ敤鎴锋槸鍚﹀凡鐧诲綍

**杩斿洖鍊?*: boolean - 鏄惁宸茬櫥褰?
**浣跨敤绀轰緥**:
```javascript
if (authService.isLoggedIn()) {
  // 鐢ㄦ埛宸茬櫥褰曪紝鎵ц鐩稿叧鎿嶄綔
  navigateToUserCenter();
} else {
  // 鐢ㄦ埛鏈櫥褰曪紝璺宠浆鍒扮櫥褰曢〉
  navigateToLogin();
}
```

### 2.5 妫€鏌ヤ細璇濈姸鎬?
**鎺ュ彛鍦板潃**: `authService.checkSession()`

**鍔熻兘鎻忚堪**: 妫€鏌ヤ細璇濈姸鎬佹槸鍚︽湁鏁?
**杩斿洖鍊?*: Promise<boolean> - 浼氳瘽鏄惁鏈夋晥

**浣跨敤绀轰緥**:
```javascript
try {
  const isValid = await authService.checkSession();
  if (isValid) {
    console.log('浼氳瘽鏈夋晥');
  } else {
    console.log('浼氳瘽宸茶繃鏈?);
  }
} catch (error) {
  console.error('妫€鏌ヤ細璇濆け璐?', error.message);
}
```

### 2.6 鑾峰彇鐢ㄦ埛鏀惰棌鍒楄〃

**鎺ュ彛鍦板潃**: `authService.getUserFavorites()`

**鍔熻兘鎻忚堪**: 鑾峰彇褰撳墠鐢ㄦ埛鐨勬敹钘忓垪琛?
**杩斿洖鍊?*: Promise<Array> - 鐢ㄦ埛鏀惰棌鍒楄〃

**浣跨敤绀轰緥**:
```javascript
try {
  const favorites = await authService.getUserFavorites();
  console.log('鐢ㄦ埛鏀惰棌鍒楄〃:', favorites);
} catch (error) {
  console.error('鑾峰彇鏀惰棌鍒楄〃澶辫触:', error.message);
}
```

### 2.7 鑾峰彇鐢ㄦ埛鍦板潃鍒楄〃

**鎺ュ彛鍦板潃**: `authService.getUserAddresses()`

**鍔熻兘鎻忚堪**: 鑾峰彇褰撳墠鐢ㄦ埛鐨勬敹璐у湴鍧€鍒楄〃

**杩斿洖鍊?*: Promise<Array> - 鐢ㄦ埛鍦板潃鍒楄〃

**浣跨敤绀轰緥**:
```javascript
try {
  const addresses = await authService.getUserAddresses();
  console.log('鐢ㄦ埛鍦板潃鍒楄〃:', addresses);
} catch (error) {
  console.error('鑾峰彇鍦板潃鍒楄〃澶辫触:', error.message);
}
```

### 2.8 娣诲姞鐢ㄦ埛鍦板潃

**鎺ュ彛鍦板潃**: `authService.addUserAddress(address)`

**鍔熻兘鎻忚堪**: 娣诲姞鏂扮殑鏀惰揣鍦板潃

**鍙傛暟**:
- `address` (Object): 鍦板潃淇℃伅瀵硅薄

**杩斿洖鍊?*: Promise<Object> - 娣诲姞缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const newAddress = {
    receiverName: '寮犱笁',
    phoneNumber: '13800138000',
    province: '骞夸笢鐪?,
    city: '骞垮窞甯?,
    district: '澶╂渤鍖?,
    detailAddress: '澶╂渤璺?23鍙?,
    isDefault: true
  };
  
  const result = await authService.addUserAddress(newAddress);
  console.log('娣诲姞鍦板潃鎴愬姛:', result);
} catch (error) {
  console.error('娣诲姞鍦板潃澶辫触:', error.message);
}
```

### 2.9 鏇存柊鐢ㄦ埛鍦板潃

**鎺ュ彛鍦板潃**: `authService.updateUserAddress(addressId, address)`

**鍔熻兘鎻忚堪**: 鏇存柊鎸囧畾鐨勬敹璐у湴鍧€

**鍙傛暟**:
- `addressId` (number): 鍦板潃ID
- `address` (Object): 鏇存柊鐨勫湴鍧€淇℃伅

**杩斿洖鍊?*: Promise<Object> - 鏇存柊缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const updatedAddress = {
    receiverName: '鏉庡洓',
    phoneNumber: '13900139000',
    province: '骞夸笢鐪?,
    city: '娣卞湷甯?,
    district: '鍗楀北鍖?,
    detailAddress: '绉戞妧鍥矾456鍙?,
    isDefault: false
  };
  
  const result = await authService.updateUserAddress(1, updatedAddress);
  console.log('鏇存柊鍦板潃鎴愬姛:', result);
} catch (error) {
  console.error('鏇存柊鍦板潃澶辫触:', error.message);
}
```

### 2.10 鍒犻櫎鐢ㄦ埛鍦板潃

**鎺ュ彛鍦板潃**: `authService.deleteUserAddress(addressId)`

**鍔熻兘鎻忚堪**: 鍒犻櫎鎸囧畾鐨勬敹璐у湴鍧€

**鍙傛暟**:
- `addressId` (number): 鍦板潃ID

**杩斿洖鍊?*: Promise<Object> - 鍒犻櫎缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await authService.deleteUserAddress(1);
  console.log('鍒犻櫎鍦板潃鎴愬姛:', result);
} catch (error) {
  console.error('鍒犻櫎鍦板潃澶辫触:', error.message);
}
```

## 3. 绉垎鏈嶅姟 (PointsService)

绉垎鏈嶅姟妯″潡璐熻矗澶勭悊鐢ㄦ埛绉垎鐩稿叧鐨勬搷浣滐紝鍖呮嫭绉垎鏌ヨ銆佷换鍔＄鐞嗐€佺Н鍒嗗厬鎹㈢瓑鍔熻兘銆?
### 3.1 鑾峰彇鐢ㄦ埛绉垎淇℃伅

**鎺ュ彛鍦板潃**: `PointsService.getUserPoints()`

**鍔熻兘鎻忚堪**: 鑾峰彇褰撳墠鐢ㄦ埛鐨勭Н鍒嗕俊鎭?
**杩斿洖鍊?*: Promise<Object> - 鐢ㄦ埛绉垎淇℃伅

**浣跨敤绀轰緥**:
```javascript
try {
  const pointsInfo = await PointsService.getUserPoints();
  console.log('鐢ㄦ埛绉垎淇℃伅:', pointsInfo);
  // 绀轰緥杈撳嚭: { totalPoints: 1500, availablePoints: 1200, frozenPoints: 300 }
} catch (error) {
  console.error('鑾峰彇绉垎淇℃伅澶辫触:', error.message);
}
```

### 3.2 鑾峰彇绉垎浠诲姟鍒楄〃

**鎺ュ彛鍦板潃**: `PointsService.getPointsTasks(options)`

**鍔熻兘鎻忚堪**: 鑾峰彇绉垎浠诲姟鍒楄〃锛屾敮鎸佸垎椤靛拰绛涢€?
**鍙傛暟**:
- `options` (Object, 鍙€?: 鏌ヨ鍙傛暟
  - `type` (string): 浠诲姟绫诲瀷 (all/once/daily/weekly/monthly)
  - `status` (string): 浠诲姟鐘舵€?(all/pending/completed/unclaimed)
  - `page` (number): 椤电爜锛岄粯璁や负1
  - `pageSize` (number): 姣忛〉鏁伴噺锛岄粯璁や负20

**杩斿洖鍊?*: Promise<Object> - 浠诲姟鍒楄〃鍜屽垎椤典俊鎭?
**浣跨敤绀轰緥**:
```javascript
try {
  // 鑾峰彇姣忔棩浠诲姟
  const dailyTasks = await PointsService.getPointsTasks({
    type: 'daily',
    status: 'pending'
  });
  console.log('姣忔棩浠诲姟:', dailyTasks);
  
  // 鑾峰彇鎵€鏈夊凡瀹屾垚浣嗘湭棰嗗彇鐨勪换鍔?  const unclaimedTasks = await PointsService.getPointsTasks({
    status: 'unclaimed'
  });
  console.log('鏈鍙栧鍔辩殑浠诲姟:', unclaimedTasks);
} catch (error) {
  console.error('鑾峰彇浠诲姟鍒楄〃澶辫触:', error.message);
}
```

### 3.3 瀹屾垚绉垎浠诲姟

**鎺ュ彛鍦板潃**: `PointsService.completeTask(taskId)`

**鍔熻兘鎻忚堪**: 鏍囪鎸囧畾浠诲姟涓哄凡瀹屾垚

**鍙傛暟**:
- `taskId` (string): 浠诲姟ID

**杩斿洖鍊?*: Promise<Object> - 瀹屾垚缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await PointsService.completeTask('task001');
  console.log('浠诲姟瀹屾垚:', result);
} catch (error) {
  console.error('瀹屾垚浠诲姟澶辫触:', error.message);
}
```

### 3.4 棰嗗彇浠诲姟濂栧姳

**鎺ュ彛鍦板潃**: `PointsService.claimTaskReward(taskId)`

**鍔熻兘鎻忚堪**: 棰嗗彇宸插畬鎴愪换鍔＄殑绉垎濂栧姳

**鍙傛暟**:
- `taskId` (string): 浠诲姟ID

**杩斿洖鍊?*: Promise<Object> - 棰嗗彇缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await PointsService.claimTaskReward('task001');
  console.log('濂栧姳棰嗗彇鎴愬姛:', result);
} catch (error) {
  console.error('棰嗗彇濂栧姳澶辫触:', error.message);
}
```

### 3.5 鑾峰彇绉垎璁板綍鍒楄〃

**鎺ュ彛鍦板潃**: `PointsService.getPointsRecords(options)`

**鍔熻兘鎻忚堪**: 鑾峰彇鐢ㄦ埛绉垎鍙樺姩璁板綍锛屾敮鎸佸垎椤靛拰绛涢€?
**鍙傛暟**:
- `options` (Object, 鍙€?: 鏌ヨ鍙傛暟
  - `type` (string): 璁板綍绫诲瀷 (all/earn/spend)
  - `source` (string): 绉垎鏉ユ簮
  - `page` (number): 椤电爜锛岄粯璁や负1
  - `pageSize` (number): 姣忛〉鏁伴噺锛岄粯璁や负20
  - `startDate` (string): 寮€濮嬫棩鏈?  - `endDate` (string): 缁撴潫鏃ユ湡

**杩斿洖鍊?*: Promise<Object> - 绉垎璁板綍鍒楄〃鍜屽垎椤典俊鎭?
**浣跨敤绀轰緥**:
```javascript
try {
  // 鑾峰彇鏈€杩戣幏寰楃殑绉垎璁板綍
  const earnedPoints = await PointsService.getPointsRecords({
    type: 'earn',
    page: 1,
    pageSize: 10
  });
  console.log('鑾峰緱绉垎璁板綍:', earnedPoints);
  
  // 鑾峰彇鎸囧畾鏃ユ湡鑼冨洿鍐呯殑绉垎璁板綍
  const dateRangeRecords = await PointsService.getPointsRecords({
    startDate: '2023-10-01',
    endDate: '2023-10-31'
  });
  console.log('10鏈堢Н鍒嗚褰?', dateRangeRecords);
} catch (error) {
  console.error('鑾峰彇绉垎璁板綍澶辫触:', error.message);
}
```

### 3.6 姣忔棩绛惧埌

**鎺ュ彛鍦板潃**: `PointsService.dailySignin()`

**鍔熻兘鎻忚堪**: 鎵ц姣忔棩绛惧埌鎿嶄綔锛岃幏鍙栫Н鍒嗗鍔?
**杩斿洖鍊?*: Promise<Object> - 绛惧埌缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await PointsService.dailySignin();
  console.log('绛惧埌鎴愬姛:', result);
  // 绀轰緥杈撳嚭: { success: true, points: 10, continuousDays: 5 }
} catch (error) {
  console.error('绛惧埌澶辫触:', error.message);
}
```

### 3.7 鑾峰彇绛惧埌淇℃伅

**鎺ュ彛鍦板潃**: `PointsService.getSigninInfo()`

**鍔熻兘鎻忚堪**: 鑾峰彇鐢ㄦ埛绛惧埌鐘舵€佸拰杩炵画绛惧埌澶╂暟

**杩斿洖鍊?*: Promise<Object> - 绛惧埌淇℃伅

**浣跨敤绀轰緥**:
```javascript
try {
  const signinInfo = await PointsService.getSigninInfo();
  console.log('绛惧埌淇℃伅:', signinInfo);
  // 绀轰緥杈撳嚭: { 
  //   canSignin: true, 
  //   continuousDays: 5, 
  //   totalSigninDays: 30,
  //   todayReward: 10 
  // }
} catch (error) {
  console.error('鑾峰彇绛惧埌淇℃伅澶辫触:', error.message);
}
```

### 3.8 鑾峰彇绉垎鍟嗗煄鍟嗗搧鍒楄〃

**鎺ュ彛鍦板潃**: `PointsService.getPointsMallProducts(options)`

**鍔熻兘鎻忚堪**: 鑾峰彇绉垎鍟嗗煄鍟嗗搧鍒楄〃锛屾敮鎸佸垎椤靛拰绛涢€?
**鍙傛暟**:
- `options` (Object, 鍙€?: 鏌ヨ鍙傛暟
  - `categoryId` (string): 鍒嗙被ID
  - `sort` (string): 鎺掑簭鏂瑰紡 (default/points_asc/points_desc/sales)
  - `page` (number): 椤电爜锛岄粯璁や负1
  - `pageSize` (number): 姣忛〉鏁伴噺锛岄粯璁や负20

**杩斿洖鍊?*: Promise<Object> - 鍟嗗搧鍒楄〃鍜屽垎椤典俊鎭?
**浣跨敤绀轰緥**:
```javascript
try {
  // 鑾峰彇绉垎鍟嗗煄鍟嗗搧鍒楄〃锛屾寜绉垎浠庝綆鍒伴珮鎺掑簭
  const products = await PointsService.getPointsMallProducts({
    sort: 'points_asc',
    page: 1,
    pageSize: 10
  });
  console.log('绉垎鍟嗗煄鍟嗗搧:', products);
  
  // 鑾峰彇鎸囧畾鍒嗙被鐨勫晢鍝?  const categoryProducts = await PointsService.getPointsMallProducts({
    categoryId: 'cat001'
  });
  console.log('鍒嗙被鍟嗗搧:', categoryProducts);
} catch (error) {
  console.error('鑾峰彇鍟嗗搧鍒楄〃澶辫触:', error.message);
}
```

### 3.9 绉垎鍏戞崲鍟嗗搧

**鎺ュ彛鍦板潃**: `PointsService.exchangeProduct(data)`

**鍔熻兘鎻忚堪**: 浣跨敤绉垎鍏戞崲鍟嗗搧

**鍙傛暟**:
- `data` (Object): 鍏戞崲鏁版嵁
  - `productId` (string): 鍟嗗搧ID
  - `quantity` (number): 鍏戞崲鏁伴噺
  - `addressId` (string, 鍙€?: 鏀惰揣鍦板潃ID
  - `remark` (string, 鍙€?: 澶囨敞

**杩斿洖鍊?*: Promise<Object> - 鍏戞崲缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const exchangeData = {
    productId: 'prod001',
    quantity: 1,
    addressId: 'addr001',
    remark: '璇峰敖蹇彂璐?
  };
  
  const result = await PointsService.exchangeProduct(exchangeData);
  console.log('鍏戞崲鎴愬姛:', result);
} catch (error) {
  console.error('鍏戞崲澶辫触:', error.message);
}
```

### 3.10 鑾峰彇绉垎鍏戞崲璁板綍

**鎺ュ彛鍦板潃**: `PointsService.getExchangeRecords(options)`

**鍔熻兘鎻忚堪**: 鑾峰彇鐢ㄦ埛鐨勭Н鍒嗗厬鎹㈣褰曪紝鏀寔鍒嗛〉鍜岀瓫閫?
**鍙傛暟**:
- `options` (Object, 鍙€?: 鏌ヨ鍙傛暟
  - `status` (string): 鍏戞崲鐘舵€?(all/pending/shipped/completed/cancelled)
  - `page` (number): 椤电爜锛岄粯璁や负1
  - `pageSize` (number): 姣忛〉鏁伴噺锛岄粯璁や负20

**杩斿洖鍊?*: Promise<Object> - 鍏戞崲璁板綍鍒楄〃鍜屽垎椤典俊鎭?
**浣跨敤绀轰緥**:
```javascript
try {
  // 鑾峰彇鎵€鏈夊厬鎹㈣褰?  const allRecords = await PointsService.getExchangeRecords({
    page: 1,
    pageSize: 10
  });
  console.log('鍏戞崲璁板綍:', allRecords);
  
  // 鑾峰彇宸插畬鎴愮殑鍏戞崲璁板綍
  const completedRecords = await PointsService.getExchangeRecords({
    status: 'completed'
  });
  console.log('宸插畬鎴愬厬鎹?', completedRecords);
} catch (error) {
  console.error('鑾峰彇鍏戞崲璁板綍澶辫触:', error.message);
}
```

## 4. 鏀粯鏈嶅姟 (PaymentService)

鏀粯鏈嶅姟妯″潡璐熻矗澶勭悊璁㈠崟鏀粯銆侀€€娆俱€佹敮浠樻柟寮忕鐞嗙瓑鏀粯鐩稿叧鍔熻兘銆?
### 4.1 鍒涘缓鏀粯璁㈠崟

**鎺ュ彛鍦板潃**: `PaymentService.createPayment(data)`

**鍔熻兘鎻忚堪**: 鍒涘缓鏂扮殑鏀粯璁㈠崟

**鍙傛暟**:
- `data` (Object): 鏀粯鏁版嵁
  - `items` (Array): 鍟嗗搧鍒楄〃
  - `totalAmount` (number): 鎬婚噾棰?  - `couponId` (string, 鍙€?: 浼樻儬鍒窱D
  - `addressId` (string, 鍙€?: 鏀惰揣鍦板潃ID
  - `remark` (string, 鍙€?: 璁㈠崟澶囨敞

**杩斿洖鍊?*: Promise<Object> - 鍒涘缓缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const paymentData = {
    items: [
      { productId: 'p001', quantity: 2, price: 199.00 },
      { productId: 'p002', quantity: 1, price: 99.00 }
    ],
    totalAmount: 497.00,
    addressId: 'addr001',
    remark: '璇峰湪宸ヤ綔鏃ラ厤閫?
  };
  
  const result = await PaymentService.createPayment(paymentData);
  console.log('鏀粯璁㈠崟鍒涘缓鎴愬姛:', result);
} catch (error) {
  console.error('鍒涘缓鏀粯璁㈠崟澶辫触:', error.message);
}
```

### 4.2 鑾峰彇鏀粯鏂瑰紡鍒楄〃

**鎺ュ彛鍦板潃**: `PaymentService.getPaymentMethods(options)`

**鍔熻兘鎻忚堪**: 鑾峰彇鍙敤鐨勬敮浠樻柟寮忓垪琛?
**鍙傛暟**:
- `options` (Object, 鍙€?: 鏌ヨ鍙傛暟

**杩斿洖鍊?*: Promise<Object> - 鏀粯鏂瑰紡鍒楄〃

**浣跨敤绀轰緥**:
```javascript
try {
  const paymentMethods = await PaymentService.getPaymentMethods();
  console.log('鏀粯鏂瑰紡鍒楄〃:', paymentMethods);
  // 绀轰緥杈撳嚭: {
  //   methods: [
  //     { id: 'wechat', name: '寰俊鏀粯', icon: 'wechat.png' },
  //     { id: 'alipay', name: '鏀粯瀹?, icon: 'alipay.png' }
  //   ]
  // }
} catch (error) {
  console.error('鑾峰彇鏀粯鏂瑰紡澶辫触:', error.message);
}
```

### 4.3 鍙戣捣鏀粯璇锋眰

**鎺ュ彛鍦板潃**: `PaymentService.initiatePayment(data)`

**鍔熻兘鎻忚堪**: 鍙戣捣鏀粯璇锋眰锛岃幏鍙栨敮浠樺弬鏁?
**鍙傛暟**:
- `data` (Object): 鏀粯鍙傛暟
  - `orderId` (string): 璁㈠崟ID
  - `paymentMethod` (string): 鏀粯鏂瑰紡
  - `returnUrl` (string, 鍙€?: 鏀粯鎴愬姛杩斿洖URL
  - `notifyUrl` (string, 鍙€?: 鏀粯缁撴灉閫氱煡URL

**杩斿洖鍊?*: Promise<Object> - 鏀粯璇锋眰缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const paymentData = {
    orderId: 'order001',
    paymentMethod: 'wechat'
  };
  
  const result = await PaymentService.initiatePayment(paymentData);
  console.log('鏀粯璇锋眰鍙戣捣鎴愬姛:', result);
  // 浣跨敤杩斿洖鐨勬敮浠樺弬鏁拌皟鐢ㄥ井淇℃敮浠楢PI
  wx.requestPayment({
    ...result.paymentParams,
    success: (res) => {
      console.log('鏀粯鎴愬姛:', res);
    },
    fail: (err) => {
      console.error('鏀粯澶辫触:', err);
    }
  });
} catch (error) {
  console.error('鍙戣捣鏀粯璇锋眰澶辫触:', error.message);
}
```

### 4.4 鏌ヨ鏀粯鐘舵€?
**鎺ュ彛鍦板潃**: `PaymentService.getPaymentStatus(paymentId)`

**鍔熻兘鎻忚堪**: 鏌ヨ鎸囧畾鏀粯鐨勭姸鎬?
**鍙傛暟**:
- `paymentId` (string): 鏀粯ID

**杩斿洖鍊?*: Promise<Object> - 鏀粯鐘舵€?
**浣跨敤绀轰緥**:
```javascript
try {
  const status = await PaymentService.getPaymentStatus('pay001');
  console.log('鏀粯鐘舵€?', status);
  // 绀轰緥杈撳嚭: { 
  //   paymentId: 'pay001',
  //   status: 'success', // pending/success/failed/cancelled
  //   paidAt: '2023-11-01 15:30:00'
  // }
} catch (error) {
  console.error('鏌ヨ鏀粯鐘舵€佸け璐?', error.message);
}
```

### 4.5 鐢宠閫€娆?
**鎺ュ彛鍦板潃**: `PaymentService.requestRefund(data)`

**鍔熻兘鎻忚堪**: 涓哄凡鏀粯鐨勮鍗曠敵璇烽€€娆?
**鍙傛暟**:
- `data` (Object): 閫€娆炬暟鎹?  - `orderId` (string): 璁㈠崟ID
  - `refundAmount` (number): 閫€娆鹃噾棰?  - `reason` (string): 閫€娆惧師鍥?
**杩斿洖鍊?*: Promise<Object> - 閫€娆剧敵璇风粨鏋?
**浣跨敤绀轰緥**:
```javascript
try {
  const refundData = {
    orderId: 'order001',
    refundAmount: 199.00,
    reason: '鍟嗗搧璐ㄩ噺闂'
  };
  
  const result = await PaymentService.requestRefund(refundData);
  console.log('閫€娆剧敵璇锋垚鍔?', result);
} catch (error) {
  console.error('鐢宠閫€娆惧け璐?', error.message);
}
```

### 4.6 鑾峰彇鏀粯璁板綍鍒楄〃

**鎺ュ彛鍦板潃**: `PaymentService.getPaymentHistory(options)`

**鍔熻兘鎻忚堪**: 鑾峰彇鐢ㄦ埛鐨勬敮浠樿褰曪紝鏀寔鍒嗛〉鍜岀瓫閫?
**鍙傛暟**:
- `options` (Object, 鍙€?: 鏌ヨ鍙傛暟
  - `page` (number): 椤电爜锛岄粯璁や负1
  - `pageSize` (number): 姣忛〉鏁伴噺锛岄粯璁や负20
  - `status` (string): 鏀粯鐘舵€佺瓫閫?  - `startDate` (string): 寮€濮嬫棩鏈?  - `endDate` (string): 缁撴潫鏃ユ湡

**杩斿洖鍊?*: Promise<Object> - 鏀粯璁板綍鍒楄〃鍜屽垎椤典俊鎭?
**浣跨敤绀轰緥**:
```javascript
try {
  // 鑾峰彇鏈€杩?0鏉℃敮浠樿褰?  const recentPayments = await PaymentService.getPaymentHistory({
    page: 1,
    pageSize: 10
  });
  console.log('鏈€杩戞敮浠樿褰?', recentPayments);
  
  // 鑾峰彇鎸囧畾鏃ユ湡鑼冨洿鍐呯殑鏀粯璁板綍
  const dateRangePayments = await PaymentService.getPaymentHistory({
    startDate: '2023-10-01',
    endDate: '2023-10-31'
  });
  console.log('10鏈堟敮浠樿褰?', dateRangePayments);
} catch (error) {
  console.error('鑾峰彇鏀粯璁板綍澶辫触:', error.message);
}
```

## 5. 閫氱煡鏈嶅姟 (notificationService)

閫氱煡鏈嶅姟妯″潡璐熻矗澶勭悊搴旂敤閫氱煡銆佹秷鎭帹閫併€侀€氱煡璁剧疆绛夊姛鑳姐€?
### 5.1 鑾峰彇閫氱煡鍒楄〃

**鎺ュ彛鍦板潃**: `notificationService.getNotificationList(options)`

**鍔熻兘鎻忚堪**: 鑾峰彇鐢ㄦ埛閫氱煡鍒楄〃锛屾敮鎸佸垎椤靛拰绛涢€?
**鍙傛暟**:
- `options` (Object, 鍙€?: 鏌ヨ鍙傛暟
  - `type` (string): 閫氱煡绫诲瀷 (all/system/order/promotion/activity)
  - `status` (string): 閫氱煡鐘舵€?(all/read/unread)
  - `page` (number): 椤电爜锛岄粯璁や负1
  - `pageSize` (number): 姣忛〉鏁伴噺锛岄粯璁や负20

**杩斿洖鍊?*: Promise<Object> - 閫氱煡鍒楄〃鍜屽垎椤典俊鎭?
**浣跨敤绀轰緥**:
```javascript
try {
  // 鑾峰彇鏈閫氱煡
  const unreadNotifications = await notificationService.getNotificationList({
    status: 'unread',
    page: 1,
    pageSize: 10
  });
  console.log('鏈閫氱煡:', unreadNotifications);
  
  // 鑾峰彇璁㈠崟鐩稿叧閫氱煡
  const orderNotifications = await notificationService.getNotificationList({
    type: 'order'
  });
  console.log('璁㈠崟閫氱煡:', orderNotifications);
} catch (error) {
  console.error('鑾峰彇閫氱煡鍒楄〃澶辫触:', error.message);
}
```

### 5.2 鑾峰彇閫氱煡璇︽儏

**鎺ュ彛鍦板潃**: `notificationService.getNotificationDetail(notificationId)`

**鍔熻兘鎻忚堪**: 鑾峰彇鎸囧畾閫氱煡鐨勮缁嗕俊鎭?
**鍙傛暟**:
- `notificationId` (string): 閫氱煡ID

**杩斿洖鍊?*: Promise<Object> - 閫氱煡璇︽儏

**浣跨敤绀轰緥**:
```javascript
try {
  const detail = await notificationService.getNotificationDetail('notif001');
  console.log('閫氱煡璇︽儏:', detail);
} catch (error) {
  console.error('鑾峰彇閫氱煡璇︽儏澶辫触:', error.message);
}
```

### 5.3 鏍囪閫氱煡涓哄凡璇?
**鎺ュ彛鍦板潃**: `notificationService.markAsRead(notificationId)`

**鍔熻兘鎻忚堪**: 灏嗘寚瀹氶€氱煡鏍囪涓哄凡璇?
**鍙傛暟**:
- `notificationId` (string): 閫氱煡ID

**杩斿洖鍊?*: Promise<Object> - 鏍囪缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await notificationService.markAsRead('notif001');
  console.log('鏍囪宸茶鎴愬姛:', result);
} catch (error) {
  console.error('鏍囪宸茶澶辫触:', error.message);
}
```

### 5.4 鎵归噺鏍囪閫氱煡涓哄凡璇?
**鎺ュ彛鍦板潃**: `notificationService.markMultipleAsRead(notificationIds)`

**鍔熻兘鎻忚堪**: 鎵归噺灏嗛€氱煡鏍囪涓哄凡璇?
**鍙傛暟**:
- `notificationIds` (Array): 閫氱煡ID鏁扮粍

**杩斿洖鍊?*: Promise<Object> - 鏍囪缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await notificationService.markMultipleAsRead(['notif001', 'notif002', 'notif003']);
  console.log('鎵归噺鏍囪宸茶鎴愬姛:', result);
} catch (error) {
  console.error('鎵归噺鏍囪宸茶澶辫触:', error.message);
}
```

### 5.5 鍒犻櫎閫氱煡

**鎺ュ彛鍦板潃**: `notificationService.deleteNotification(notificationId)`

**鍔熻兘鎻忚堪**: 鍒犻櫎鎸囧畾閫氱煡

**鍙傛暟**:
- `notificationId` (string): 閫氱煡ID

**杩斿洖鍊?*: Promise<Object> - 鍒犻櫎缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await notificationService.deleteNotification('notif001');
  console.log('鍒犻櫎閫氱煡鎴愬姛:', result);
} catch (error) {
  console.error('鍒犻櫎閫氱煡澶辫触:', error.message);
}
```

### 5.6 鑾峰彇鏈閫氱煡鏁伴噺

**鎺ュ彛鍦板潃**: `notificationService.getUnreadCount()`

**鍔熻兘鎻忚堪**: 鑾峰彇褰撳墠鐢ㄦ埛鐨勬湭璇婚€氱煡鏁伴噺

**杩斿洖鍊?*: Promise<Object> - 鏈閫氱煡鏁伴噺

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await notificationService.getUnreadCount();
  console.log('鏈閫氱煡鏁伴噺:', result.count);
} catch (error) {
  console.error('鑾峰彇鏈閫氱煡鏁伴噺澶辫触:', error.message);
}
```

### 5.7 娓呯┖鎵€鏈夐€氱煡

**鎺ュ彛鍦板潃**: `notificationService.clearAllNotifications()`

**鍔熻兘鎻忚堪**: 娓呯┖鐢ㄦ埛鐨勬墍鏈夐€氱煡

**杩斿洖鍊?*: Promise<Object> - 娓呯┖缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await notificationService.clearAllNotifications();
  console.log('娓呯┖閫氱煡鎴愬姛:', result);
} catch (error) {
  console.error('娓呯┖閫氱煡澶辫触:', error.message);
}
```

## 6. 璐墿杞︽湇鍔?(CartService)

璐墿杞︽湇鍔℃ā鍧楄礋璐ｅ鐞嗚喘鐗╄溅鍟嗗搧绠＄悊銆佺粨绠楃瓑鍔熻兘銆?
### 6.1 鑾峰彇璐墿杞﹀垪琛?
**鎺ュ彛鍦板潃**: `CartService.getCartList()`

**鍔熻兘鎻忚堪**: 鑾峰彇褰撳墠鐢ㄦ埛鐨勮喘鐗╄溅鍟嗗搧鍒楄〃

**杩斿洖鍊?*: Promise<Object> - 璐墿杞﹀晢鍝佸垪琛?
**浣跨敤绀轰緥**:
```javascript
try {
  const cartList = await CartService.getCartList();
  console.log('璐墿杞﹀垪琛?', cartList);
} catch (error) {
  console.error('鑾峰彇璐墿杞﹀垪琛ㄥけ璐?', error.message);
}
```

### 6.2 娣诲姞鍟嗗搧鍒拌喘鐗╄溅

**鎺ュ彛鍦板潃**: `CartService.addToCart(productId, quantity, specs)`

**鍔熻兘鎻忚堪**: 娣诲姞鍟嗗搧鍒拌喘鐗╄溅

**鍙傛暟**:
- `productId` (string): 鍟嗗搧ID
- `quantity` (number): 鍟嗗搧鏁伴噺
- `specs` (Object, 鍙€?: 鍟嗗搧瑙勬牸

**杩斿洖鍊?*: Promise<Object> - 娣诲姞缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await CartService.addToCart('prod001', 2, { color: 'red', size: 'L' });
  console.log('娣诲姞鍒拌喘鐗╄溅鎴愬姛:', result);
} catch (error) {
  console.error('娣诲姞鍒拌喘鐗╄溅澶辫触:', error.message);
}
```

### 6.3 鏇存柊璐墿杞﹀晢鍝佹暟閲?
**鎺ュ彛鍦板潃**: `CartService.updateCartItem(itemId, quantity)`

**鍔熻兘鎻忚堪**: 鏇存柊璐墿杞︿腑鎸囧畾鍟嗗搧鐨勬暟閲?
**鍙傛暟**:
- `itemId` (string): 璐墿杞﹂」ID
- `quantity` (number): 鏂扮殑鏁伴噺

**杩斿洖鍊?*: Promise<Object> - 鏇存柊缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await CartService.updateCartItem('item001', 3);
  console.log('鏇存柊璐墿杞﹀晢鍝佹暟閲忔垚鍔?', result);
} catch (error) {
  console.error('鏇存柊璐墿杞﹀晢鍝佹暟閲忓け璐?', error.message);
}
```

### 6.4 鍒犻櫎璐墿杞﹀晢鍝?
**鎺ュ彛鍦板潃**: `CartService.removeFromCart(itemId)`

**鍔熻兘鎻忚堪**: 浠庤喘鐗╄溅涓垹闄ゆ寚瀹氬晢鍝?
**鍙傛暟**:
- `itemId` (string): 璐墿杞﹂」ID

**杩斿洖鍊?*: Promise<Object> - 鍒犻櫎缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await CartService.removeFromCart('item001');
  console.log('鍒犻櫎璐墿杞﹀晢鍝佹垚鍔?', result);
} catch (error) {
  console.error('鍒犻櫎璐墿杞﹀晢鍝佸け璐?', error.message);
}
```

### 6.5 娓呯┖璐墿杞?
**鎺ュ彛鍦板潃**: `CartService.clearCart()`

**鍔熻兘鎻忚堪**: 娓呯┖褰撳墠鐢ㄦ埛鐨勮喘鐗╄溅

**杩斿洖鍊?*: Promise<Object> - 娓呯┖缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await CartService.clearCart();
  console.log('娓呯┖璐墿杞︽垚鍔?', result);
} catch (error) {
  console.error('娓呯┖璐墿杞﹀け璐?', error.message);
}
```

### 6.6 鑾峰彇璐墿杞﹀晢鍝佹暟閲?
**鎺ュ彛鍦板潃**: `CartService.getCartItemCount()`

**鍔熻兘鎻忚堪**: 鑾峰彇璐墿杞︿腑鍟嗗搧鐨勬€绘暟閲?
**杩斿洖鍊?*: Promise<Object> - 鍟嗗搧鎬绘暟閲?
**浣跨敤绀轰緥**:
```javascript
try {
  const result = await CartService.getCartItemCount();
  console.log('璐墿杞﹀晢鍝佹暟閲?', result.count);
} catch (error) {
  console.error('鑾峰彇璐墿杞﹀晢鍝佹暟閲忓け璐?', error.message);
}
```

### 6.7 閫夋嫨/鍙栨秷閫夋嫨璐墿杞﹀晢鍝?
**鎺ュ彛鍦板潃**: `CartService.selectCartItem(itemId, selected)`

**鍔熻兘鎻忚堪**: 閫夋嫨鎴栧彇娑堥€夋嫨璐墿杞︿腑鐨勫晢鍝?
**鍙傛暟**:
- `itemId` (string): 璐墿杞﹂」ID
- `selected` (boolean): 鏄惁閫夋嫨

**杩斿洖鍊?*: Promise<Object> - 鎿嶄綔缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  // 閫夋嫨鍟嗗搧
  const result1 = await CartService.selectCartItem('item001', true);
  console.log('閫夋嫨鍟嗗搧鎴愬姛:', result1);
  
  // 鍙栨秷閫夋嫨鍟嗗搧
  const result2 = await CartService.selectCartItem('item001', false);
  console.log('鍙栨秷閫夋嫨鍟嗗搧鎴愬姛:', result2);
} catch (error) {
  console.error('鎿嶄綔澶辫触:', error.message);
}
```

### 6.8 鍏ㄩ€?鍙栨秷鍏ㄩ€夎喘鐗╄溅鍟嗗搧

**鎺ュ彛鍦板潃**: `CartService.selectAllItems(selected)`

**鍔熻兘鎻忚堪**: 鍏ㄩ€夋垨鍙栨秷鍏ㄩ€夎喘鐗╄溅涓殑鎵€鏈夊晢鍝?
**鍙傛暟**:
- `selected` (boolean): 鏄惁鍏ㄩ€?
**杩斿洖鍊?*: Promise<Object> - 鎿嶄綔缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  // 鍏ㄩ€夊晢鍝?  const result1 = await CartService.selectAllItems(true);
  console.log('鍏ㄩ€夊晢鍝佹垚鍔?', result1);
  
  // 鍙栨秷鍏ㄩ€夊晢鍝?  const result2 = await CartService.selectAllItems(false);
  console.log('鍙栨秷鍏ㄩ€夊晢鍝佹垚鍔?', result2);
} catch (error) {
  console.error('鎿嶄綔澶辫触:', error.message);
}
```

### 6.9 鑾峰彇閫変腑鍟嗗搧鎬讳环

**鎺ュ彛鍦板潃**: `CartService.getSelectedItemsTotal()`

**鍔熻兘鎻忚堪**: 璁＄畻璐墿杞︿腑閫変腑鍟嗗搧鐨勬€讳环

**杩斿洖鍊?*: Promise<Object> - 閫変腑鍟嗗搧鎬讳环

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await CartService.getSelectedItemsTotal();
  console.log('閫変腑鍟嗗搧鎬讳环:', result.total);
} catch (error) {
  console.error('鑾峰彇閫変腑鍟嗗搧鎬讳环澶辫触:', error.message);
}
```

### 6.10 搴旂敤浼樻儬鍒?
**鎺ュ彛鍦板潃**: `CartService.applyCoupon(couponCode)`

**鍔熻兘鎻忚堪**: 搴旂敤浼樻儬鍒稿埌璐墿杞?
**鍙傛暟**:
- `couponCode` (string): 浼樻儬鍒镐唬鐮?
**杩斿洖鍊?*: Promise<Object> - 搴旂敤缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await CartService.applyCoupon('DISCOUNT10');
  console.log('搴旂敤浼樻儬鍒告垚鍔?', result);
} catch (error) {
  console.error('搴旂敤浼樻儬鍒稿け璐?', error.message);
}
```

## 7. 鍟嗗搧鏈嶅姟 (ProductService)

鍟嗗搧鏈嶅姟妯″潡璐熻矗澶勭悊鍟嗗搧淇℃伅鏌ヨ銆佹悳绱€佸垎绫荤瓑鍔熻兘銆?
### 7.1 鑾峰彇鍟嗗搧鍒楄〃

**鎺ュ彛鍦板潃**: `ProductService.getProducts(options)`

**鍔熻兘鎻忚堪**: 鑾峰彇鍟嗗搧鍒楄〃锛屾敮鎸佸垎椤靛拰绛涢€?
**鍙傛暟**:
- `options` (Object, 鍙€?: 鏌ヨ鍙傛暟
  - `categoryId` (string): 鍒嗙被ID
  - `keyword` (string): 鎼滅储鍏抽敭璇?  - `sort` (string): 鎺掑簭鏂瑰紡 (default/sales_asc/sales_desc/price_asc/price_desc)
  - `page` (number): 椤电爜锛岄粯璁や负1
  - `pageSize` (number): 姣忛〉鏁伴噺锛岄粯璁や负20

**杩斿洖鍊?*: Promise<Object> - 鍟嗗搧鍒楄〃鍜屽垎椤典俊鎭?
**浣跨敤绀轰緥**:
```javascript
try {
  // 鑾峰彇鍟嗗搧鍒楄〃
  const products = await ProductService.getProducts({
    page: 1,
    pageSize: 10
  });
  console.log('鍟嗗搧鍒楄〃:', products);
  
  // 鎸変环鏍间粠浣庡埌楂樻帓搴?  const sortedProducts = await ProductService.getProducts({
    sort: 'price_asc'
  });
  console.log('鎸変环鏍兼帓搴忕殑鍟嗗搧:', sortedProducts);
} catch (error) {
  console.error('鑾峰彇鍟嗗搧鍒楄〃澶辫触:', error.message);
}
```

### 7.2 鑾峰彇鍟嗗搧璇︽儏

**鎺ュ彛鍦板潃**: `ProductService.getProductDetail(productId)`

**鍔熻兘鎻忚堪**: 鑾峰彇鎸囧畾鍟嗗搧鐨勮缁嗕俊鎭?
**鍙傛暟**:
- `productId` (string): 鍟嗗搧ID

**杩斿洖鍊?*: Promise<Object> - 鍟嗗搧璇︽儏

**浣跨敤绀轰緥**:
```javascript
try {
  const detail = await ProductService.getProductDetail('prod001');
  console.log('鍟嗗搧璇︽儏:', detail);
} catch (error) {
  console.error('鑾峰彇鍟嗗搧璇︽儏澶辫触:', error.message);
}
```

### 7.3 鎼滅储鍟嗗搧

**鎺ュ彛鍦板潃**: `ProductService.searchProducts(keyword, options)`

**鍔熻兘鎻忚堪**: 鏍规嵁鍏抽敭璇嶆悳绱㈠晢鍝?
**鍙傛暟**:
- `keyword` (string): 鎼滅储鍏抽敭璇?- `options` (Object, 鍙€?: 鎼滅储鍙傛暟
  - `categoryId` (string): 鍒嗙被ID
  - `minPrice` (number): 鏈€浣庝环鏍?  - `maxPrice` (number): 鏈€楂樹环鏍?  - `sort` (string): 鎺掑簭鏂瑰紡
  - `page` (number): 椤电爜锛岄粯璁や负1
  - `pageSize` (number): 姣忛〉鏁伴噺锛岄粯璁や负20

**杩斿洖鍊?*: Promise<Object> - 鎼滅储缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const result = await ProductService.searchProducts('鎵嬫満', {
    minPrice: 1000,
    maxPrice: 5000,
    sort: 'price_asc'
  });
  console.log('鎼滅储缁撴灉:', result);
} catch (error) {
  console.error('鎼滅储鍟嗗搧澶辫触:', error.message);
}
```

### 7.4 鑾峰彇鍟嗗搧鍒嗙被

**鎺ュ彛鍦板潃**: `ProductService.getCategories()`

**鍔熻兘鎻忚堪**: 鑾峰彇鍟嗗搧鍒嗙被鍒楄〃

**杩斿洖鍊?*: Promise<Object> - 鍒嗙被鍒楄〃

**浣跨敤绀轰緥**:
```javascript
try {
  const categories = await ProductService.getCategories();
  console.log('鍟嗗搧鍒嗙被:', categories);
} catch (error) {
  console.error('鑾峰彇鍟嗗搧鍒嗙被澶辫触:', error.message);
}
```

### 7.5 鑾峰彇鍟嗗搧璇勪环

**鎺ュ彛鍦板潃**: `ProductService.getProductReviews(productId, options)`

**鍔熻兘鎻忚堪**: 鑾峰彇鎸囧畾鍟嗗搧鐨勮瘎浠峰垪琛?
**鍙傛暟**:
- `productId` (string): 鍟嗗搧ID
- `options` (Object, 鍙€?: 鏌ヨ鍙傛暟
  - `rating` (number): 璇勫垎绛涢€?  - `sort` (string): 鎺掑簭鏂瑰紡 (default/newest/oldest/rating_high/rating_low)
  - `page` (number): 椤电爜锛岄粯璁や负1
  - `pageSize` (number): 姣忛〉鏁伴噺锛岄粯璁や负20

**杩斿洖鍊?*: Promise<Object> - 璇勪环鍒楄〃

**浣跨敤绀轰緥**:
```javascript
try {
  const reviews = await ProductService.getProductReviews('prod001', {
    rating: 5,
    sort: 'newest'
  });
  console.log('鍟嗗搧璇勪环:', reviews);
} catch (error) {
  console.error('鑾峰彇鍟嗗搧璇勪环澶辫触:', error.message);
}
```

### 7.6 鑾峰彇鍟嗗搧鎺ㄨ崘

**鎺ュ彛鍦板潃**: `ProductService.getRecommendedProducts(productId, options)`

**鍔熻兘鎻忚堪**: 鑾峰彇涓庢寚瀹氬晢鍝佺浉鍏崇殑鎺ㄨ崘鍟嗗搧

**鍙傛暟**:
- `productId` (string): 鍟嗗搧ID
- `options` (Object, 鍙€?: 鏌ヨ鍙傛暟
  - `type` (string): 鎺ㄨ崘绫诲瀷 (related/bestSeller/newArrival)
  - `limit` (number): 鎺ㄨ崘鏁伴噺锛岄粯璁や负10

**杩斿洖鍊?*: Promise<Object> - 鎺ㄨ崘鍟嗗搧鍒楄〃

**浣跨敤绀轰緥**:
```javascript
try {
  const recommended = await ProductService.getRecommendedProducts('prod001', {
    type: 'related',
    limit: 5
  });
  console.log('鎺ㄨ崘鍟嗗搧:', recommended);
} catch (error) {
  console.error('鑾峰彇鎺ㄨ崘鍟嗗搧澶辫触:', error.message);
}
```

## 8. 璁剧疆鏈嶅姟 (SettingsService)

璁剧疆鏈嶅姟妯″潡璐熻矗澶勭悊绯荤粺璁剧疆銆佸簲鐢ㄨ缃€佺敤鎴疯缃瓑鍔熻兘銆?
### 8.1 鑾峰彇绯荤粺璁剧疆

**鎺ュ彛鍦板潃**: `settingsService.getSystemSettings()`

**鍔熻兘鎻忚堪**: 鑾峰彇绯荤粺绾у埆鐨勮缃俊鎭?
**杩斿洖鍊?*: Promise<Object> - 绯荤粺璁剧疆淇℃伅

**浣跨敤绀轰緥**:
```javascript
try {
  const settings = await settingsService.getSystemSettings();
  console.log('绯荤粺璁剧疆:', settings);
} catch (error) {
  console.error('鑾峰彇绯荤粺璁剧疆澶辫触:', error.message);
}
```

### 8.2 鑾峰彇搴旂敤璁剧疆

**鎺ュ彛鍦板潃**: `settingsService.getAppSettings()`

**鍔熻兘鎻忚堪**: 鑾峰彇搴旂敤绾у埆鐨勮缃俊鎭?
**杩斿洖鍊?*: Promise<Object> - 搴旂敤璁剧疆淇℃伅

**浣跨敤绀轰緥**:
```javascript
try {
  const settings = await settingsService.getAppSettings();
  console.log('搴旂敤璁剧疆:', settings);
} catch (error) {
  console.error('鑾峰彇搴旂敤璁剧疆澶辫触:', error.message);
}
```

### 8.3 鑾峰彇鐢ㄦ埛璁剧疆

**鎺ュ彛鍦板潃**: `settingsService.getUserSettings()`

**鍔熻兘鎻忚堪**: 鑾峰彇褰撳墠鐢ㄦ埛鐨勪釜浜鸿缃?
**杩斿洖鍊?*: Promise<Object> - 鐢ㄦ埛璁剧疆淇℃伅

**浣跨敤绀轰緥**:
```javascript
try {
  const settings = await settingsService.getUserSettings();
  console.log('鐢ㄦ埛璁剧疆:', settings);
} catch (error) {
  console.error('鑾峰彇鐢ㄦ埛璁剧疆澶辫触:', error.message);
}
```

### 8.4 鏇存柊鐢ㄦ埛璁剧疆

**鎺ュ彛鍦板潃**: `settingsService.updateUserSettings(settings)`

**鍔熻兘鎻忚堪**: 鏇存柊褰撳墠鐢ㄦ埛鐨勪釜浜鸿缃?
**鍙傛暟**:
- `settings` (Object): 璁剧疆淇℃伅

**杩斿洖鍊?*: Promise<Object> - 鏇存柊缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const newSettings = {
    theme: 'dark',
    language: 'zh_CN',
    notifications: {
      push: true,
      email: false
    }
  };
  
  const result = await settingsService.updateUserSettings(newSettings);
  console.log('鏇存柊鐢ㄦ埛璁剧疆鎴愬姛:', result);
} catch (error) {
  console.error('鏇存柊鐢ㄦ埛璁剧疆澶辫触:', error.message);
}
```

### 8.5 鑾峰彇闅愮璁剧疆

**鎺ュ彛鍦板潃**: `settingsService.getPrivacySettings()`

**鍔熻兘鎻忚堪**: 鑾峰彇鐢ㄦ埛鐨勯殣绉佽缃?
**杩斿洖鍊?*: Promise<Object> - 闅愮璁剧疆淇℃伅

**浣跨敤绀轰緥**:
```javascript
try {
  const privacySettings = await settingsService.getPrivacySettings();
  console.log('闅愮璁剧疆:', privacySettings);
} catch (error) {
  console.error('鑾峰彇闅愮璁剧疆澶辫触:', error.message);
}
```

### 8.6 鏇存柊闅愮璁剧疆

**鎺ュ彛鍦板潃**: `settingsService.updatePrivacySettings(settings)`

**鍔熻兘鎻忚堪**: 鏇存柊鐢ㄦ埛鐨勯殣绉佽缃?
**鍙傛暟**:
- `settings` (Object): 闅愮璁剧疆淇℃伅

**杩斿洖鍊?*: Promise<Object> - 鏇存柊缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const newPrivacySettings = {
    profileVisibility: 'public',
    showOnlineStatus: false,
    allowDirectMessages: true
  };
  
  const result = await settingsService.updatePrivacySettings(newPrivacySettings);
  console.log('鏇存柊闅愮璁剧疆鎴愬姛:', result);
} catch (error) {
  console.error('鏇存柊闅愮璁剧疆澶辫触:', error.message);
}
```

## 9. 鏈€浣冲疄璺?
### 9.1 閿欒澶勭悊

鎵€鏈夋湇鍔℃柟娉曢兘搴旇浣跨敤try-catch鍧楄繘琛岄敊璇鐞嗭紝骞跺悜璋冪敤鏂规彁渚涙湁鎰忎箟鐨勯敊璇俊鎭€?
```javascript
try {
  const result = await someService.someMethod(params);
  // 澶勭悊鎴愬姛缁撴灉
} catch (error) {
  console.error('鎿嶄綔澶辫触:', error.message);
  // 鍙互鏍规嵁閿欒绫诲瀷杩涜涓嶅悓鐨勫鐞?  if (error.code === 'NETWORK_ERROR') {
    wx.showToast({
      title: '缃戠粶閿欒锛岃妫€鏌ョ綉缁滆繛鎺?,
      icon: 'none'
    });
  } else if (error.code === 'AUTH_ERROR') {
    wx.showToast({
      title: '鐧诲綍宸茶繃鏈燂紝璇烽噸鏂扮櫥褰?,
      icon: 'none'
    });
    // 璺宠浆鍒扮櫥褰曢〉闈?    wx.navigateTo({
      url: '/pages/login/login'
    });
  }
}
```

### 9.2 鍙傛暟楠岃瘉

鍦ㄨ皟鐢ㄦ湇鍔℃柟娉曞墠锛屽簲璇ュ鍙傛暟杩涜楠岃瘉锛岀‘淇濆弬鏁扮殑鏈夋晥鎬с€?
```javascript
// 娣诲姞鍟嗗搧鍒拌喘鐗╄溅鍓嶉獙璇佸弬鏁?function addToCart(productId, quantity) {
  if (!productId) {
    wx.showToast({
      title: '鍟嗗搧ID涓嶈兘涓虹┖',
      icon: 'none'
    });
    return;
  }
  
  if (!quantity || quantity <= 0) {
    wx.showToast({
      title: '鍟嗗搧鏁伴噺蹇呴』澶т簬0',
      icon: 'none'
    });
    return;
  }
  
  // 鍙傛暟楠岃瘉閫氳繃锛岃皟鐢ㄦ湇鍔℃柟娉?  CartService.addToCart(productId, quantity)
    .then(result => {
      wx.showToast({
        title: '娣诲姞鎴愬姛',
        icon: 'success'
      });
    })
    .catch(error => {
      wx.showToast({
        title: error.message || '娣诲姞澶辫触',
        icon: 'none'
      });
    });
}
```

### 9.3 鍔犺浇鐘舵€佺鐞?
鍦ㄨ皟鐢ㄥ紓姝ユ湇鍔℃柟娉曟椂锛屽簲璇ョ鐞嗗姞杞界姸鎬侊紝鎻愬崌鐢ㄦ埛浣撻獙銆?
```javascript
// 鍦ㄩ〉闈腑绠＄悊鍔犺浇鐘舵€?Page({
  data: {
    loading: false,
    products: []
  },
  
  onLoad() {
    this.loadProducts();
  },
  
  async loadProducts() {
    this.setData({ loading: true });
    
    try {
      const result = await ProductService.getProducts();
      this.setData({ products: result.list });
    } catch (error) {
      console.error('鍔犺浇鍟嗗搧澶辫触:', error);
      wx.showToast({
        title: '鍔犺浇澶辫触锛岃閲嶈瘯',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});
```

### 9.4 缂撳瓨绛栫暐

瀵逛簬涓嶇粡甯稿彉鍖栫殑鏁版嵁锛屽彲浠ュ疄鐜扮紦瀛樼瓥鐣ワ紝鍑忓皯缃戠粶璇锋眰銆?
```javascript
// 甯︾紦瀛樼殑鏁版嵁鑾峰彇
async function getCachedData(key, fetchFunction, cacheTime = 5 * 60 * 1000) {
  const cacheKey = `cache_${key}`;
  const cachedData = wx.getStorageSync(cacheKey);
  
  if (cachedData && Date.now() - cachedData.timestamp < cacheTime) {
    return cachedData.data;
  }
  
  try {
    const data = await fetchFunction();
    wx.setStorageSync(cacheKey, {
      data,
      timestamp: Date.now()
    });
    return data;
  } catch (error) {
    // 濡傛灉鏈夌紦瀛樻暟鎹絾缃戠粶璇锋眰澶辫触锛岃繑鍥炵紦瀛樻暟鎹?    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
}

// 浣跨敤绀轰緥
async function loadCategories() {
  try {
    const categories = await getCachedData(
      'categories',
      () => ProductService.getCategories(),
      10 * 60 * 1000 // 缂撳瓨10鍒嗛挓
    );
    this.setData({ categories });
  } catch (error) {
    console.error('鍔犺浇鍒嗙被澶辫触:', error);
  }
}
```

### 9.5 璇锋眰閲嶈瘯鏈哄埗

瀵逛簬閲嶈鐨勭綉缁滆姹傦紝鍙互瀹炵幇閲嶈瘯鏈哄埗锛屾彁楂樿姹傛垚鍔熺巼銆?
```javascript
// 甯﹂噸璇曟満鍒剁殑璇锋眰
async function requestWithRetry(requestFunction, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await requestFunction();
    } catch (error) {
      lastError = error;
      
      // 濡傛灉鏄渶鍚庝竴娆″皾璇曪紝鐩存帴鎶涘嚭閿欒
      if (i === maxRetries) {
        throw error;
      }
      
      // 濡傛灉鏄綉缁滈敊璇紝杩涜閲嶈瘯
      if (error.code === 'NETWORK_ERROR') {
        console.log(`璇锋眰澶辫触锛?{i + 1}/${maxRetries}娆￠噸璇?..`);
        // 鎸囨暟閫€閬跨瓥鐣?        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      } else {
        // 闈炵綉缁滈敊璇紝鐩存帴鎶涘嚭
        throw error;
      }
    }
  }
  
  throw lastError;
}

// 浣跨敤绀轰緥
async function loadUserData() {
  try {
    const userData = await requestWithRetry(() => authService.getUserInfo());
    this.setData({ userData });
  } catch (error) {
    console.error('鍔犺浇鐢ㄦ埛鏁版嵁澶辫触:', error);
    wx.showToast({
      title: '鍔犺浇澶辫触锛岃閲嶈瘯',
      icon: 'none'
    });
  }
}
```

### 9.6 鏈嶅姟鏂规硶缁勫悎

瀵逛簬澶嶆潅鐨勪笟鍔￠€昏緫锛屽彲浠ョ粍鍚堝涓湇鍔℃柟娉曪紝鎻愪緵鏇撮珮绾х殑涓氬姟鍔熻兘銆?
```javascript
// 缁勫悎澶氫釜鏈嶅姟鏂规硶瀹炵幇涓嬪崟娴佺▼
async function placeOrder(orderData) {
  try {
    // 1. 楠岃瘉鐢ㄦ埛鐧诲綍鐘舵€?    if (!authService.isLoggedIn()) {
      throw new Error('鐢ㄦ埛鏈櫥褰?);
    }
    
    // 2. 鑾峰彇鐢ㄦ埛榛樿鍦板潃
    let addressId = orderData.addressId;
    if (!addressId) {
      const addresses = await authService.getUserAddresses();
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (!defaultAddress) {
        throw new Error('璇烽€夋嫨鏀惰揣鍦板潃');
      }
      addressId = defaultAddress.id;
    }
    
    // 3. 鍒涘缓璁㈠崟
    const order = await OrderService.createOrder({
      ...orderData,
      addressId
    });
    
    // 4. 鍒涘缓鏀粯璁㈠崟
    const payment = await PaymentService.createPayment({
      orderId: order.id,
      totalAmount: order.totalAmount,
      items: order.items
    });
    
    // 5. 鍙戣捣鏀粯
    const paymentResult = await PaymentService.initiatePayment({
      orderId: order.id,
      paymentMethod: orderData.paymentMethod
    });
    
    // 6. 璋冪敤寰俊鏀粯
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        ...paymentResult.paymentParams,
        success: (res) => {
          resolve({ order, payment: paymentResult, result: res });
        },
        fail: (err) => {
          reject(err);
        }
      });
    });
  } catch (error) {
    console.error('涓嬪崟澶辫触:', error);
    throw error;
  }
}
```

---

**鏂囨。鐗堟湰**: 1.0.0  
**鏈€鍚庢洿鏂版椂闂?*: 2025骞?1鏈?3鏃? 
**缁存姢浜哄憳**: Sut  
**鑱旂郴鏂瑰紡**: sut@example.com

### 5.7 鑾峰彇閫氱煡璁剧疆

**鎺ュ彛鍦板潃**: `notificationService.getNotificationSettings()`

**鍔熻兘鎻忚堪**: 鑾峰彇鐢ㄦ埛鐨勯€氱煡璁剧疆

**杩斿洖鍊?*: Promise<Object> - 閫氱煡璁剧疆

**浣跨敤绀轰緥**:
```javascript
try {
  const settings = await notificationService.getNotificationSettings();
  console.log('閫氱煡璁剧疆:', settings);
  // 绀轰緥杈撳嚭: {
  //   system: true,
  //   order: true,
  //   promotion: false,
  //   activity: true
  // }
} catch (error) {
  console.error('鑾峰彇閫氱煡璁剧疆澶辫触:', error.message);
}
```

### 5.8 鏇存柊閫氱煡璁剧疆

**鎺ュ彛鍦板潃**: `notificationService.updateNotificationSettings(settings)`

**鍔熻兘鎻忚堪**: 鏇存柊鐢ㄦ埛鐨勯€氱煡璁剧疆

**鍙傛暟**:
- `settings` (Object): 閫氱煡璁剧疆
  - `system` (boolean): 绯荤粺閫氱煡寮€鍏?  - `order` (boolean): 璁㈠崟閫氱煡寮€鍏?  - `promotion` (boolean): 淇冮攢閫氱煡寮€鍏?  - `activity` (boolean): 娲诲姩閫氱煡寮€鍏?
**杩斿洖鍊?*: Promise<Object> - 鏇存柊缁撴灉

**浣跨敤绀轰緥**:
```javascript
try {
  const newSettings = {
    system: true,
    order: true,
    promotion: true,  // 寮€鍚績閿€閫氱煡
    activity: false   // 鍏抽棴娲诲姩閫氱煡
  };
  
  const result = await notificationService.updateNotificationSettings(newSettings);
  console.log('鏇存柊閫氱煡璁剧疆鎴愬姛:', result);
} catch (error) {
  console.error('鏇存柊閫氱煡璁剧疆澶辫触:', error.message);
}
```

## 6. 鏈€浣冲疄璺?
### 6.1 閿欒澶勭悊

鎵€鏈夋湇鍔℃柟娉曢兘鍙兘鎶涘嚭寮傚父锛屽缓璁娇鐢╰ry-catch杩涜閿欒澶勭悊锛?
```javascript
try {
  const result = await SomeService.someMethod(params);
  // 澶勭悊鎴愬姛缁撴灉
} catch (error) {
  // 缁熶竴閿欒澶勭悊
  console.error('鎿嶄綔澶辫触:', error.message);
  wx.showToast({
    title: error.message || '鎿嶄綔澶辫触',
    icon: 'none'
  });
}
```

### 6.2 璇锋眰鎷︽埅

鍙互鍦╮equest宸ュ叿涓坊鍔犳嫤鎴櫒锛岀粺涓€澶勭悊璁よ瘉銆侀敊璇瓑锛?
```javascript
// 鍦╱tils/request.js涓坊鍔犺姹傛嫤鎴櫒
const requestInterceptor = (options) => {
  // 娣诲姞Token
  const token = authService.getToken();
  if (token) {
    options.header = options.header || {};
    options.header.Authorization = `Bearer ${token}`;
  }
  
  return options;
};

// 鍝嶅簲鎷︽埅鍣ㄥ鐞嗛€氱敤閿欒
const responseInterceptor = (response) => {
  if (response.data.code === 401) {
    // Token杩囨湡锛岄噸鏂扮櫥褰?    authService.logout();
    wx.navigateTo({ url: '/pages/login/login' });
  }
  return response;
};
```

### 6.3 鏁版嵁缂撳瓨

瀵逛簬涓嶇粡甯稿彉鍖栫殑鏁版嵁锛屽彲浠ユ坊鍔犵紦瀛樻満鍒讹細

```javascript
// 甯︾紦瀛樼殑璇锋眰灏佽
async function requestWithCache(key, requestFn, cacheTime = 5 * 60 * 1000) {
  const cachedData = wx.getStorageSync(key);
  const now = Date.now();
  
  if (cachedData && (now - cachedData.timestamp < cacheTime)) {
    return cachedData.data;
  }
  
  try {
    const data = await requestFn();
    wx.setStorageSync(key, {
      data,
      timestamp: now
    });
    return data;
  } catch (error) {
    // 濡傛灉鏈夌紦瀛樻暟鎹笖璇锋眰澶辫触锛岃繑鍥炵紦瀛樻暟鎹?    if (cachedData) {
      return cachedData.data;
    }
    throw error;
  }
}

// 浣跨敤绀轰緥
const categories = await requestWithCache(
  'categories',
  () => CategoryService.getCategoryList(),
  10 * 60 * 1000 // 缂撳瓨10鍒嗛挓
);
```

## 7. 鎬荤粨

鏈枃妗ｈ缁嗘弿杩颁簡SutWxApp寰俊灏忕▼搴忛」鐩腑鏈嶅姟灞傜殑API鎺ュ彛锛屽寘鎷璇佹湇鍔°€佺Н鍒嗘湇鍔°€佹敮浠樻湇鍔°€侀€氱煡鏈嶅姟绛夊悇涓ā鍧楃殑鎺ュ彛璇存槑銆佸弬鏁般€佽繑鍥炲€煎拰浣跨敤绀轰緥銆傚紑鍙戣€呭簲涓ユ牸閬靛惊鎺ュ彛瑙勮寖杩涜寮€鍙戯紝骞舵敞鎰忛敊璇鐞嗗拰鎬ц兘浼樺寲銆?
---

**鐗堟湰鍙凤細1.0.0**
*鏈€鍚庢洿鏂版椂闂达細2025骞?1鏈?3鏃?
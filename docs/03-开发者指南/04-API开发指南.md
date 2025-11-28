<!--
鏂囦欢鍚? 04-API寮€鍙戞寚鍗?md
鐗堟湰鍙? 1.0.0
鏇存柊鏃ユ湡: 2025-11-24
浣滆€? Sut
鎻忚堪: API寮€鍙戞寚鍗楋紝璇存槑濡備綍璁捐銆佸紑鍙戝拰娴嬭瘯灏忕▼搴忕殑API鎺ュ彛
-->
# SutWxApp API 寮€鍙戞寚鍗?
> 璇存槑锛氭湰鏂囦欢鐨勮缁嗘帴鍙ｈ鏄庝笌绀轰緥宸茬粺涓€杩佺Щ鑷?`03-API鎺ュ彛鏂囨。.md`銆傚悗缁洿鏂拌浠?`03-API鎺ュ彛鏂囨。.md` 涓哄噯锛屾湰鏂囦欢淇濈暀涓鸿璁″師鍒欎笌寮€鍙戞祦绋嬪弬鑰冦€?
## 1. 绠€浠?
鏈枃妗ｆ彁渚涗簡 SutWxApp 寰俊灏忕▼搴忛」鐩腑 API 寮€鍙戠殑鎸囧瑙勮寖鍜屾渶浣冲疄璺点€傛墍鏈夊弬涓庨」鐩紑鍙戠殑鍚庣宸ョ▼甯堥兘搴斾弗鏍奸伒寰湰鏂囨。涓殑瑙勮寖锛岀‘淇?API 璁捐鐨勪竴鑷存€с€佸畨鍏ㄦ€у拰鍙淮鎶ゆ€с€?
## 2. API 璁捐鍘熷垯

### 2.1 RESTful 璁捐鍘熷垯

- **璧勬簮鍛藉悕**锛氫娇鐢ㄥ悕璇嶈€岄潪鍔ㄨ瘝鍛藉悕 API 绔偣锛屼緥濡?`/users` 鑰岄潪 `/getUsers`
- **HTTP 鏂规硶**锛氫娇鐢ㄩ€傚綋鐨?HTTP 鏂规硶琛ㄧず鎿嶄綔绫诲瀷
  - GET锛氳幏鍙栬祫婧?  - POST锛氬垱寤鸿祫婧?  - PUT锛氭洿鏂拌祫婧愶紙鏇挎崲鏁翠釜璧勬簮锛?  - PATCH锛氶儴鍒嗘洿鏂拌祫婧?  - DELETE锛氬垹闄よ祫婧?- **鐘舵€佺爜**锛氫娇鐢ㄦ爣鍑嗙殑 HTTP 鐘舵€佺爜琛ㄧず鍝嶅簲缁撴灉
- **鐗堟湰鎺у埗**锛欰PI URL 涓寘鍚増鏈俊鎭紝渚嬪 `/v1/users`
- **杩囨护鍜屾帓搴?*锛氫娇鐢ㄦ煡璇㈠弬鏁板疄鐜拌繃婊ゃ€佹帓搴忓拰鍒嗛〉

### 2.2 鎺ュ彛鍛藉悕瑙勮寖

- **URL 鏍煎紡**锛歚https://api.example.com/v{version}/{resource}[/{id}][/{subresource}]`
- **浣跨敤灏忓啓瀛楁瘝**锛氭墍鏈?URL 璺緞浣跨敤灏忓啓瀛楁瘝
- **浣跨敤杩炲瓧绗?*锛氬涓崟璇嶄娇鐢ㄨ繛瀛楃 `-` 鍒嗛殧锛屼緥濡?`/user-profiles`
- **閬垮厤涓嬪垝绾?*锛氫笉瑕佷娇鐢ㄤ笅鍒掔嚎 `_`
- **閬垮厤鏂囦欢鎵╁睍鍚?*锛歎RL 涓笉搴斿寘鍚枃浠舵墿灞曞悕

### 2.3 鏁版嵁缁撴瀯璁捐

- **浣跨敤 JSON 鏍煎紡**锛氭墍鏈夎姹傚拰鍝嶅簲閮藉簲浣跨敤 JSON 鏍煎紡
- **缁熶竴鏁版嵁鏍煎紡**锛氫繚鎸佸搷搴旀暟鎹粨鏋勭殑涓€鑷存€?- **浣跨敤鏈夋剰涔夌殑瀛楁鍚?*锛氬瓧娈靛悕搴旀竻鏅拌〃杈惧叾鍚箟
- **閬垮厤娣卞眰娆″祵濂?*锛氬敖閲忛伩鍏嶈秴杩?3 灞傜殑 JSON 宓屽缁撴瀯
- **绫诲瀷涓€鑷存€?*锛氱浉鍚屽瓧娈靛湪涓嶅悓鎺ュ彛涓殑鏁版嵁绫诲瀷搴斾繚鎸佷竴鑷?
## 3. API 寮€鍙戞祦绋?
### 3.1 闇€姹傚垎鏋愪笌璁捐

1. **闇€姹傜悊瑙?*锛氳缁嗙悊瑙ｄ笟鍔￠渶姹傦紝纭畾鎵€闇€鐨?API 鎺ュ彛
2. **璧勬簮璇嗗埆**锛氳瘑鍒郴缁熶腑鐨勪富瑕佽祫婧愬強鍏跺叧绯?3. **API 璁捐**锛氳璁?API 绔偣銆佽姹傚弬鏁般€佸搷搴旀牸寮?4. **鏂囨。缂栧啓**锛氬湪寮€鍙戝墠缂栧啓 API 鎺ュ彛鏂囨。鍒濈
5. **鍥㈤槦璇勫**锛氱粍缁囧洟闃熸垚鍛樿瘎瀹?API 璁捐锛岀‘淇濆悎鐞嗘€у拰涓€鑷存€?
### 3.2 寮€鍙戝疄鏂?
1. **鐜鍑嗗**锛氳缃紑鍙戠幆澧冨拰鏁版嵁搴?2. **鎺ュ彛瀹炵幇**锛氭牴鎹璁℃枃妗ｅ疄鐜?API 鎺ュ彛
3. **鍗曞厓娴嬭瘯**锛氫负姣忎釜 API 鎺ュ彛缂栧啓鍗曞厓娴嬭瘯
4. **闆嗘垚娴嬭瘯**锛氱‘淇?API 涓庡叾浠栫郴缁熺粍浠舵甯稿崗浣?5. **鎬ц兘娴嬭瘯**锛氬鍏抽敭 API 杩涜鎬ц兘娴嬭瘯鍜屼紭鍖?
### 3.3 浠ｇ爜瀹℃煡涓庨儴缃?
1. **浠ｇ爜瀹℃煡**锛氭彁浜や唬鐮佸鏌ヨ姹傦紝纭繚浠ｇ爜璐ㄩ噺
2. **淇闂**锛氭牴鎹唬鐮佸鏌ユ剰瑙佷慨澶嶉棶棰?3. **鏂囨。鏇存柊**锛氭洿鏂?API 鎺ュ彛鏂囨。锛岀‘淇濅笌瀹為檯瀹炵幇涓€鑷?4. **閮ㄧ讲娴嬭瘯**锛氬湪娴嬭瘯鐜閮ㄧ讲骞惰繘琛屾渶缁堟祴璇?5. **鐢熶骇閮ㄧ讲**锛氶儴缃插埌鐢熶骇鐜

## 4. 瀹夊叏瑙勮寖

### 4.1 璁よ瘉涓庢巿鏉?
- **Token 璁よ瘉**锛氫娇鐢?JWT (JSON Web Token) 杩涜韬唤璁よ瘉
- **Token 绠＄悊**锛?  - Token 搴斿寘鍚繃鏈熸椂闂达紝榛樿 7 澶?  - 鎻愪緵 Token 鍒锋柊鏈哄埗
  - 鏈嶅姟绔簲缁存姢 Token 榛戝悕鍗?- **鏉冮檺鎺у埗**锛氬疄鐜板熀浜庤鑹茬殑璁块棶鎺у埗 (RBAC)
- **鏁忔劅鎿嶄綔楠岃瘉**锛氶噸瑕佹搷浣滈渶瑕佷簩娆￠獙璇侊紙濡備慨鏀瑰瘑鐮侊級

### 4.2 鏁版嵁瀹夊叏

- **鏁版嵁鍔犲瘑**锛?  - 瀵嗙爜浣跨敤鍔犵洂鍝堝笇瀛樺偍锛堟帹鑽?bcrypt銆丄rgon2锛?  - 鏁忔劅鏁版嵁浼犺緭浣跨敤 HTTPS
  - 鏁版嵁搴撴晱鎰熷瓧娈靛姞瀵嗗瓨鍌?- **杈撳叆楠岃瘉**锛氭墍鏈夌敤鎴疯緭鍏ュ繀椤昏繘琛岄獙璇佸拰娓呯悊
- **SQL 娉ㄥ叆闃叉姢**锛氫娇鐢ㄥ弬鏁板寲鏌ヨ鎴?ORM 妗嗘灦
- **XSS 闃叉姢**锛氬杈撳嚭杩涜閫傚綋鐨勮浆涔夊拰杩囨护

### 4.3 璇锋眰闄愬埗

- **璇锋眰棰戠巼闄愬埗**锛?  - 瀹炵幇 API 閫熺巼闄愬埗锛岄槻姝㈡伓鎰忚姹?  - 瀵逛笉鍚岀敤鎴疯鑹茶缃笉鍚岀殑闄愬埗绛栫暐
- **璇锋眰澶у皬闄愬埗**锛氶檺鍒惰姹備綋澶у皬锛岄槻姝?DoS 鏀诲嚮
- **瓒呮椂璁剧疆**锛氬悎鐞嗚缃姹傝秴鏃舵椂闂?
## 5. 閿欒澶勭悊

### 5.1 閿欒鐮佽鑼?
- **HTTP 鐘舵€佺爜**锛氫娇鐢ㄦ爣鍑?HTTP 鐘舵€佺爜
- **涓氬姟閿欒鐮?*锛氬湪鍝嶅簲浣撲腑鎻愪緵鏇磋缁嗙殑涓氬姟閿欒鐮?- **閿欒鐮佽寖鍥村畾涔?*锛?  - 1000-1999锛氱郴缁熺骇閿欒
  - 2000-2999锛氱敤鎴风浉鍏抽敊璇?  - 3000-3999锛氬晢鍝佺浉鍏抽敊璇?  - 4000-4999锛氳鍗曠浉鍏抽敊璇?  - 5000-5999锛氭敮浠樼浉鍏抽敊璇?
### 5.2 閿欒鍝嶅簲鏍煎紡

缁熶竴鐨勯敊璇搷搴旀牸寮忥細

```json
{
  "code": 400,
  "message": "閿欒鎻忚堪淇℃伅",
  "error": {
    "field": "瀛楁鍚?,
    "code": "閿欒鐮?,
    "description": "璇︾粏閿欒鎻忚堪"
  }
}
```

### 5.3 寮傚父鏃ュ織

- **鏃ュ織璁板綍**锛氳褰曟墍鏈夊紓甯稿拰閿欒淇℃伅
- **鏃ュ織绾у埆**锛氬悎鐞嗕娇鐢ㄤ笉鍚岀殑鏃ュ織绾у埆锛圗RROR銆乄ARN銆両NFO 绛夛級
- **鏁忔劅淇℃伅杩囨护**锛氭棩蹇椾腑涓嶈褰曟晱鎰熶俊鎭紙濡傚瘑鐮併€乀oken 绛夛級
- **涓婁笅鏂囦俊鎭?*锛氳褰曡冻澶熺殑涓婁笅鏂囦俊鎭紝渚夸簬闂鎺掓煡

## 6. 浠ｇ爜瑙勮寖

### 6.1 浠ｇ爜缁撴瀯

- **妯″潡鍖栬璁?*锛氭寜鍔熻兘妯″潡缁勭粐浠ｇ爜
- **鍒嗗眰鏋舵瀯**锛?  - 鎺у埗鍣ㄥ眰 (Controller)锛氬鐞嗚姹傚拰鍝嶅簲
  - 鏈嶅姟灞?(Service)锛氬疄鐜颁笟鍔￠€昏緫
  - 鏁版嵁璁块棶灞?(Repository/DAO)锛氳礋璐ｆ暟鎹搷浣?  - 瀹炰綋灞?(Model/Entity)锛氬畾涔夋暟鎹ā鍨?  - 宸ュ叿灞?(Util)锛氭彁渚涢€氱敤宸ュ叿鏂规硶

### 6.2 鍛藉悕瑙勮寖

- **鏂囦欢鍛藉悕**锛氫娇鐢ㄥ皬鍐欏瓧姣嶅拰杩炲瓧绗︼紝渚嬪 `user-service.js`
- **绫诲拰鍑芥暟鍛藉悕**锛?  - 绫诲悕浣跨敤澶ч┘宄板懡鍚嶆硶锛歚UserService`
  - 鍑芥暟鍚嶄娇鐢ㄥ皬椹煎嘲鍛藉悕娉曪細`getUserInfo()`
  - 甯搁噺浣跨敤鍏ㄥぇ鍐欏拰涓嬪垝绾匡細`MAX_RETRY_COUNT`
- **鍙傛暟鍜屽彉閲?*锛氫娇鐢ㄥ皬椹煎嘲鍛藉悕娉曪細`userId`, `pageSize`

### 6.3 娉ㄩ噴瑙勮寖

- **鏂囦欢澶撮儴**锛氬寘鍚枃浠舵弿杩般€佷綔鑰呫€佸垱寤烘棩鏈熺瓑淇℃伅
- **鍑芥暟娉ㄩ噴**锛氫负姣忎釜鍑芥暟娣诲姞娉ㄩ噴锛岃鏄庡姛鑳姐€佸弬鏁般€佽繑鍥炲€?- **澶嶆潅閫昏緫**锛氬澶嶆潅鐨勪笟鍔￠€昏緫娣诲姞娉ㄩ噴璇存槑
- **娉ㄩ噴璇█**锛氫娇鐢ㄤ腑鏂囩紪鍐欐敞閲?
## 7. 鎺ュ彛绀轰緥浠ｇ爜

### 7.1 鍩虹 API 缁撴瀯

```javascript
/**
 * 鏂囦欢鍚? 04-API寮€鍙戞寚鍗?md
 * 鐗堟湰鍙? 1.0.0
 * 鏇存柊鏃ユ湡: 2025-11-24
 * 浣滆€? Sut
 * 鐢ㄦ埛鎺у埗鍣? * 鎻忚堪: API寮€鍙戞寚鍗楋紝璇存槑濡備綍璁捐銆佸紑鍙戝拰娴嬭瘯灏忕▼搴忕殑API鎺ュ彛
 * @module controllers/userController
 */
const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const authMiddleware = require('../middleware/auth');
const { validateUserInput } = require('../validators/userValidator');

/**
 * 鑾峰彇鐢ㄦ埛鍒楄〃
 * @route GET /api/v1/users
 * @group 鐢ㄦ埛绠＄悊 - 鐢ㄦ埛鐩稿叧鎿嶄綔
 * @param {number} page.query - 椤电爜
 * @param {number} pageSize.query - 姣忛〉鏁伴噺
 * @returns {object} 200 - 鐢ㄦ埛鍒楄〃鍜屽垎椤典俊鎭? * @returns {Error} 401 - 鏈巿鏉? */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const result = await userService.getUserList({ page, pageSize });
    res.json({
      code: 200,
      message: 'success',
      data: result
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message || '鏈嶅姟鍣ㄥ唴閮ㄩ敊璇?
    });
  }
});

module.exports = router;
```

### 7.2 鏈嶅姟灞傚疄鐜?
```javascript
/**
 * 鐢ㄦ埛鏈嶅姟
 * @module services/userService
 */
const UserModel = require('../models/user');

/**
 * 鑾峰彇鐢ㄦ埛鍒楄〃
 * @param {Object} options - 鏌ヨ鍙傛暟
 * @param {number} options.page - 椤电爜
 * @param {number} options.pageSize - 姣忛〉鏁伴噺
 * @returns {Promise<Object>} 鐢ㄦ埛鍒楄〃鍜屽垎椤典俊鎭? */
async function getUserList(options = {}) {
  const { page = 1, pageSize = 10 } = options;
  const skip = (page - 1) * pageSize;
  
  // 鏌ヨ鏉′欢
  const query = {};
  
  try {
    // 鑾峰彇鎬绘暟
    const total = await UserModel.countDocuments(query);
    
    // 鑾峰彇鏁版嵁鍒楄〃
    const list = await UserModel.find(query)
      .skip(skip)
      .limit(Number(pageSize))
      .sort({ createTime: -1 })
      .select('-password'); // 鎺掗櫎瀵嗙爜瀛楁
    
    return {
      list,
      total,
      page,
      pageSize
    };
  } catch (error) {
    console.error('鑾峰彇鐢ㄦ埛鍒楄〃澶辫触:', error);
    throw new Error('鑾峰彇鐢ㄦ埛鍒楄〃澶辫触');
  }
}

module.exports = {
  getUserList
};
```

### 7.3 鏁版嵁妯″瀷瀹氫箟

```javascript
/**
 * 鐢ㄦ埛妯″瀷
 * @module models/user
 */
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    select: false // 榛樿涓嶈繑鍥炲瘑鐮佸瓧娈?  },
  nickName: {
    type: String,
    default: ''
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  gender: {
    type: Number,
    default: 0 // 0鏈煡锛?鐢凤紝2濂?  },
  birthdate: {
    type: Date
  },
  address: {
    province: String,
    city: String,
    district: String,
    detail: String
  },
  status: {
    type: Number,
    default: 1 // 1姝ｅ父锛?绂佺敤
  },
  createTime: {
    type: Date,
    default: Date.now
  },
  updateTime: {
    type: Date,
    default: Date.now
  },
  lastLoginTime: {
    type: Date
  }
});

// 瀵嗙爜鍔犲瘑涓棿浠?UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    // 鐢熸垚鐩愬苟鍔犲瘑瀵嗙爜
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 瀵嗙爜楠岃瘉鏂规硶
UserSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

### 7.4 璇锋眰楠岃瘉

```javascript
/**
 * 鐢ㄦ埛杈撳叆楠岃瘉
 * @module validators/userValidator
 */
const Joi = require('joi');

/**
 * 楠岃瘉鐢ㄦ埛娉ㄥ唽杈撳叆
 * @param {Object} data - 鐢ㄦ埛杈撳叆鏁版嵁
 * @returns {Object} 楠岃瘉缁撴灉
 */
function validateUserRegister(data) {
  const schema = Joi.object({
    username: Joi.string()
      .alphanum()
      .min(3)
      .max(30)
      .required()
      .messages({
        'string.base': '鐢ㄦ埛鍚嶅繀椤绘槸瀛楃涓?,
        'string.alphanum': '鐢ㄦ埛鍚嶅彧鑳藉寘鍚瓧姣嶅拰鏁板瓧',
        'string.min': '鐢ㄦ埛鍚嶉暱搴︿笉鑳藉皬浜?涓瓧绗?,
        'string.max': '鐢ㄦ埛鍚嶉暱搴︿笉鑳藉ぇ浜?0涓瓧绗?,
        'any.required': '鐢ㄦ埛鍚嶆槸蹇呭～椤?
      }),
    password: Joi.string()
      .pattern(/^[a-zA-Z0-9]{6,30}$/)
      .required()
      .messages({
        'string.pattern.base': '瀵嗙爜蹇呴』鏄?-30浣嶅瓧姣嶆垨鏁板瓧',
        'any.required': '瀵嗙爜鏄繀濉」'
      }),
    phone: Joi.string()
      .pattern(/^1[3-9]\d{9}$/)
      .allow('')
      .messages({
        'string.pattern.base': '鎵嬫満鍙锋牸寮忎笉姝ｇ‘'
      }),
    email: Joi.string()
      .email()
      .allow('')
      .messages({
        'string.email': '閭鏍煎紡涓嶆纭?
      })
  });

  return schema.validate(data);
}

module.exports = {
  validateUserRegister
};
```

## 8. 娴嬭瘯瑙勮寖

### 8.1 娴嬭瘯绫诲瀷

- **鍗曞厓娴嬭瘯**锛氭祴璇曞崟涓嚱鏁版垨鏂规硶鐨勬纭€?- **闆嗘垚娴嬭瘯**锛氭祴璇曞涓粍浠舵垨妯″潡鐨勫崗浣?- **鎺ュ彛娴嬭瘯**锛氱洿鎺ユ祴璇?API 鎺ュ彛鐨勫姛鑳藉拰鎬ц兘
- **鍘嬪姏娴嬭瘯**锛氭祴璇?API 鍦ㄩ珮璐熻浇涓嬬殑鎬ц兘琛ㄧ幇

### 8.2 娴嬭瘯宸ュ叿

- **鍗曞厓娴嬭瘯**锛欽est銆丮ocha
- **API 娴嬭瘯**锛歋upertest銆丳ostman
- **鎬ц兘娴嬭瘯**锛欰pache JMeter銆乲6

### 8.3 娴嬭瘯瑕嗙洊鐜?
- **浠ｇ爜瑕嗙洊鐜?*锛氭牳蹇冧笟鍔￠€昏緫鐨勪唬鐮佽鐩栫巼搴斾笉浣庝簬 80%
- **娴嬭瘯鐢ㄤ緥**锛?  - 姝ｅ父娴佺▼娴嬭瘯
  - 杈圭晫鏉′欢娴嬭瘯
  - 閿欒澶勭悊娴嬭瘯
  - 瀹夊叏鐩稿叧娴嬭瘯

## 9. 鏂囨。瑙勮寖

### 9.1 API 鏂囨。

- **鏂囨。鏍煎紡**锛氫娇鐢?Markdown 鏍煎紡缂栧啓
- **鏂囨。鍐呭**锛?  - 鎺ュ彛鎻忚堪
  - 璇锋眰 URL
  - 璇锋眰鏂规硶
  - 璇锋眰鍙傛暟锛堝寘鎷矾寰勫弬鏁般€佹煡璇㈠弬鏁般€佽姹備綋锛?  - 璇锋眰澶?  - 鍝嶅簲鏍煎紡
  - 绀轰緥璇锋眰鍜屽搷搴?  - 閿欒鐮佽鏄?
### 9.2 鏂囨。鏇存柊

- **寮€鍙戝墠**锛氱紪鍐?API 璁捐鏂囨。
- **寮€鍙戜腑**锛氭牴鎹疄闄呭疄鐜拌皟鏁存枃妗?- **寮€鍙戝悗**锛氱‘璁ゆ枃妗ｄ笌瀹為檯瀹炵幇涓€鑷?- **鍙樻洿鏃?*锛氬強鏃舵洿鏂版枃妗ｏ紝鍙嶆槧 API 鐨勫彉鍖?
## 10. 鎬ц兘浼樺寲

### 10.1 鏁版嵁搴撲紭鍖?
- **绱㈠紩浼樺寲**锛氫负棰戠箒鏌ヨ鐨勫瓧娈靛垱寤洪€傚綋鐨勭储寮?- **鏌ヨ浼樺寲**锛氫紭鍖栨煡璇㈣鍙ワ紝閬垮厤鍏ㄨ〃鎵弿
- **杩炴帴姹?*锛氫娇鐢ㄦ暟鎹簱杩炴帴姹犵鐞嗘暟鎹簱杩炴帴
- **鎵归噺鎿嶄綔**锛氫娇鐢ㄦ壒閲忔彃鍏ュ拰鏇存柊鎿嶄綔鍑忓皯鏁版嵁搴撲氦浜掓鏁?
### 10.2 缂撳瓨绛栫暐

- **Redis 缂撳瓨**锛氫娇鐢?Redis 缂撳瓨鐑偣鏁版嵁
- **缂撳瓨澶辨晥绛栫暐**锛氬悎鐞嗚缃紦瀛樿繃鏈熸椂闂?- **缂撳瓨鏇存柊**锛氭暟鎹洿鏂版椂鍚屾鏇存柊缂撳瓨
- **缂撳瓨绌块€忛槻鎶?*锛氬涓嶅瓨鍦ㄧ殑鏁版嵁涔熻繘琛岀煭鏃堕棿缂撳瓨

### 10.3 浠ｇ爜浼樺寲

- **寮傛澶勭悊**锛氫娇鐢ㄥ紓姝ラ潪闃诲 I/O
- **鎯版€у姞杞?*锛氭寜闇€鍔犺浇璧勬簮
- **璧勬簮澶嶇敤**锛氶伩鍏嶉噸澶嶅垱寤哄拰閿€姣佽祫婧?- **绠楁硶浼樺寲**锛氶€夋嫨楂樻晥鐨勭畻娉曞拰鏁版嵁缁撴瀯

## 11. 閮ㄧ讲涓庣洃鎺?
### 11.1 閮ㄧ讲绛栫暐

- **鐜闅旂**锛氬紑鍙戙€佹祴璇曘€侀鍙戝竷銆佺敓浜х幆澧冧弗鏍奸殧绂?- **鎸佺画闆嗘垚/閮ㄧ讲**锛氫娇鐢?CI/CD 宸ュ叿瀹炵幇鑷姩鍖栭儴缃?- **璐熻浇鍧囪　**锛氬叧閿湇鍔′娇鐢ㄨ礋杞藉潎琛℃彁楂樺彲鐢ㄦ€?- **瀹瑰櫒鍖栭儴缃?*锛氫娇鐢?Docker 鍜?Kubernetes 瀹炵幇瀹瑰櫒鍖栭儴缃?
### 11.2 鐩戞帶涓庡憡璀?
- **鏈嶅姟鐩戞帶**锛氱洃鎺?API 鍝嶅簲鏃堕棿銆佹垚鍔熺巼銆侀敊璇巼
- **绯荤粺鐩戞帶**锛氱洃鎺ф湇鍔″櫒 CPU銆佸唴瀛樸€佺鐩樸€佺綉缁滅瓑璧勬簮
- **鏁版嵁搴撶洃鎺?*锛氱洃鎺ф暟鎹簱鎬ц兘鍜岃繛鎺ユ暟
- **鍛婅鏈哄埗**锛氳缃悎鐞嗙殑鍛婅闃堝€硷紝鍙婃椂鍙戠幇闂

### 11.3 鏃ュ織绠＄悊

- **闆嗕腑寮忔棩蹇?*锛氫娇鐢?ELK 绛夊伐鍏烽泦涓鐞嗘棩蹇?- **鏃ュ織绾у埆**锛氭牴鎹噸瑕佹€ц缃笉鍚岀殑鏃ュ織绾у埆
- **鏃ュ織杞浆**锛氬悎鐞嗚缃棩蹇楄疆杞瓥鐣ワ紝閬垮厤鏃ュ織杩囧ぇ
- **鏃ュ織鍒嗘瀽**锛氬畾鏈熷垎鏋愭棩蹇楋紝鍙戠幇娼滃湪闂

## 12. 甯歌闂涓庤В鍐虫柟妗?
### 12.1 璁よ瘉鐩稿叧闂

- **Token 杩囨湡**锛氬疄鐜?Token 鑷姩鍒锋柊鏈哄埗
- **Token 澶辨晥**锛氭湇鍔＄缁存姢 Token 榛戝悕鍗曪紝鏀寔涓诲姩澶辨晥
- **鏉冮檺涓嶈冻**锛氭彁渚涙槑纭殑閿欒淇℃伅锛屾寚瀵肩敤鎴疯幏鍙栭€傚綋鏉冮檺

### 12.2 鎬ц兘鐩稿叧闂

- **鍝嶅簲缂撴參**锛氭鏌ユ暟鎹簱鏌ヨ锛屾坊鍔犵紦瀛橈紝浼樺寲浠ｇ爜
- **骞跺彂闂**锛氫娇鐢ㄩ攣鏈哄埗鎴栦箰瑙傞攣瑙ｅ喅骞跺彂淇敼鍐茬獊
- **鍐呭瓨娉勬紡**锛氬畾鏈熻繘琛屽唴瀛樺垎鏋愶紝鍙婃椂淇鍐呭瓨娉勬紡闂

### 12.3 瀹夊叏鐩稿叧闂

- **SQL 娉ㄥ叆**锛氫娇鐢ㄥ弬鏁板寲鏌ヨ鎴?ORM 妗嗘灦
- **XSS 鏀诲嚮**锛氬鐢ㄦ埛杈撳叆杩涜楠岃瘉鍜岃浆涔?- **CSRF 鏀诲嚮**锛氫娇鐢?CSRF Token 楠岃瘉璇锋眰鏉ユ簮
- **鏁忔劅淇℃伅娉勯湶**锛氶伩鍏嶅湪鏃ュ織涓褰曟晱鎰熶俊鎭紝浣跨敤 HTTPS 浼犺緭

---

*鏈枃妗ｅ皢鏍规嵁椤圭洰闇€姹傚拰鏈€浣冲疄璺典笉鏂洿鏂?

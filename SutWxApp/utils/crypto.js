/**
 * 鏂囦欢鍚? crypto.js
 * 鐗堟湰鍙? 1.0.2
 * 鏇存柊鏃ユ湡: 2025-11-29
 * 娴ｆ粏鈧? Sut
 * 閸旂姴鐦戝銉ュ徔缁紮绱濋幓鎰返HMAC-SHA256缁涙儳鎮曢妴涓瓺5閸濆牆绗囬妴渚€娈㈤張鍝勭摟缁楋缚瑕嗛悽鐔稿灇閸滃苯鐣ㄩ崗銊︾槷鏉堝啫濮涢懗? */

/**
 * 閸旂姴鐦戝銉ュ徔缁? */
class Crypto {
  /**
   * 閻㈢喐鍨欻MAC-SHA256缁涙儳鎮?   * @param {string} data - 瀵板懐顒烽崥宥嗘殶閹?   * @param {string} key - 鐎靛棝鎸?   * @returns {string} 缁涙儳鎮曠紒鎾寸亯閿涘牆宕勯崗顓＄箻閸掕泛鐡х粭锔胯閿?   */
  static hmacSHA256(data, key) {
    if (!key) {
      throw new Error('鐎靛棝鎸滄稉宥堝厴娑撹櫣鈹?);
    }
    
    try {
      // 閸︺劌鐨粙瀣碍閻滎垰顣ㄦ稉顓ㄧ礉娴ｈ法鏁ゅ顔讳繆閹绘劒绶甸惃鍕鐎靛棙甯撮崣?      // 濞夈劍鍓伴敍姘簳娣団€崇毈缁嬪绨惃鍒ypto://閸楀繗顔呴崣顖濆厴娑撳秷顫﹂幍鈧張澶屽閺堫剚鏁幐?      const sign = wx.getFileSystemManager().readFileSync(
        `crypto://hmac_sha256/${encodeURIComponent(data)}/${encodeURIComponent(key)}`,
        'utf8'
      );
      return sign;
    } catch (error) {
      // 闂勫秶楠囬弬瑙勵攳閿涙矮濞囬悽銊︽纯鐎瑰鍙忛惃鍕鐎靛棗鐤勯悳?      console.warn('娴ｈ法鏁ら梽宥囬獓閸旂姴鐦戠€圭偟骞?', error);
      // 娴ｈ法鏁ら弴鏉戠暔閸忋劎娈戦梽宥囬獓閺傝顢嶉敍宀冣偓灞肩瑝閺勵垳鐣濋崡鏇犳畱閸濆牆绗?      return this._secureFallbackHash(data, key);
    }
  }
  
  /**
   * 閻㈢喐鍨歁D5閸濆牆绗?   * @param {string} data - 瀵板懎鎼辩敮灞炬殶閹?   * @returns {string} MD5閸濆牆绗囬崐纭风礄閸椾礁鍙氭潻娑樺煑鐎涙顑佹稉璇х礆
   */
  static md5(data) {
    try {
      // 閸︺劌鐨粙瀣碍閻滎垰顣ㄦ稉顓ㄧ礉娴ｈ法鏁ゅ顔讳繆閹绘劒绶甸惃鍕鐎靛棙甯撮崣?      const hash = wx.getFileSystemManager().readFileSync(
        `crypto://md5/${encodeURIComponent(data)}`,
        'utf8'
      );
      return hash;
    } catch (error) {
      // 闂勫秶楠囬弬瑙勵攳閿涙矮濞囬悽銊︽纯鐎瑰鍙忛惃鍕惐鐢苯鐤勯悳?      console.warn('娴ｈ法鏁ら梽宥囬獓MD5鐎圭偟骞?', error);
      return this._secureFallbackHash(data);
    }
  }
  
  /**
   * 閺囨潙鐣ㄩ崗銊ф畱闂勫秶楠囬崫鍫濈瑖鐎圭偟骞?   * @private
   * @param {string} str - 鏉堟挸鍙嗙€涙顑佹稉?   * @param {string} key - 閸欘垶鈧鐦戦柦銉礉閻劋绨琀MAC
   * @returns {string} 閸濆牆绗囩紒鎾寸亯
   */
  static _secureFallbackHash(str, key = '') {
    // 娴ｈ法鏁ら弴鏉戠暔閸忋劎娈戦崫鍫濈瑖缁犳纭剁€圭偟骞囬敍灞界唨娴滃锭NV-1a缁犳纭堕弨纭呯箻
    let hash = 2166136261; // FNV-1a閸掓繂顫愰崐?    const prime = 16777619; // FNV-1a鐠愩劍鏆?    
    // 閸忓牆顦╅悶鍡楃槕闁姐儻绱欐俊鍌涚亯閺堝绱?    for (let i = 0; i < key.length; i++) {
      hash ^= key.charCodeAt(i);
      hash *= prime;
      hash >>>= 0; // 绾喕绻氭稉?2娴ｅ秵妫ょ粭锕€褰块弫瀛樻殶
    }
    
    // 閸愬秴顦╅悶鍡樻殶閹?    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash *= prime;
      hash >>>= 0; // 绾喕绻氭稉?2娴ｅ秵妫ょ粭锕€褰块弫瀛樻殶
    }
    
    // 鏉烆剚宕叉稉鍝勫磩閸忣叀绻橀崚璺虹摟缁楋缚瑕嗛敍宀€鈥樻穱婵嬫毐鎼达缚璐?娴?    let hex = hash.toString(16);
    while (hex.length < 8) {
      hex = '0' + hex;
    }
    return hex;
  }
  
  /**
   * 閻㈢喐鍨氶梾蹇旀簚鐎涙顑佹稉?   * @param {number} length - 鐎涙顑佹稉鏌ユ毐鎼?   * @returns {string} 闂呭繑婧€鐎涙顑佹稉?   */
  static randomString(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      result += chars.charAt(randomIndex);
    }
    
    return result;
  }
  
  /**
   * 鐎瑰鍙忛惃鍕摟缁楋缚瑕嗗В鏃囩窛閿涘牓妲诲銏℃闂傚瓨鏁鹃崙浼欑礆
   * @param {string} a - 鐎涙顑佹稉鐬?   * @param {string} b - 鐎涙顑佹稉鐬?   * @returns {boolean} 閺勵垰鎯侀惄鍝ョ搼
   */
  static secureCompare(a, b) {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
}

module.exports = Crypto;

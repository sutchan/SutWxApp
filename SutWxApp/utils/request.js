/**
 * 文件名 request.js
 * 版本号 1.1.1
 * 更新日期: 2025-11-27
 * 作者 Sut
 * 描述: 缃戠粶璇锋眰宸ュ叿绫伙紝澶勭悊API璇锋眰銆佺紦瀛樼瓥鐣ャ€佺鍚嶉獙璇佺瓑
 */

const signature = require('./signature.js');
const i18n = require('./i18n.js');
const store = require('./store.js');
const cacheService = require('./cacheService.js').instance;
const CACHE_POLICY = require('./cacheService.js').CACHE_POLICY;

// API閰嶇疆淇℃伅
const API_CONFIG = {
  BASE_URL: 'https://api.example.com/v1', // 鐢熶骇鐜API鍦板潃
  TEST_URL: 'https://test-api.example.com/v1', // 娴嬭瘯鐜API鍦板潃
  USE_TEST: false, // 鏄惁浣跨敤娴嬭瘯鐜
  TIMEOUT: 30000, // 璇锋眰瓒呮椂鏃堕棿锛屽崟浣嶆绉?  RETRY_COUNT: 3, // 璇锋眰閲嶈瘯娆℃暟
  SECRET_KEY: '' // API瀵嗛挜锛岀敤浜庣鍚嶉獙璇侀梺鍝勫閸ㄤ即骞嗘担瑙勫閻犳亽鍔嶉弳蹇旂箾閺夋埈鍎撻柣锔诲灦閹娊顢涘鍏兼
  TIMEOUT: 30000, // 闁荤姴娲弨閬嶆儑閹殿喗鎯ラ柛娑卞枟椤ρ囨煛閸愩劎鍩ｆ俊?  RETRY_COUNT: 3, // 闂備焦褰冪粔鐑芥儊椤栨埃鏋庨柍鈺佸暞濞?  SECRET_KEY: '' // 缂備焦绋掗崕鎶藉箖閺囩姭鍋撻棃娑欘棦闁瑰憡绮撻弫宥囦沪閽樺浠存繝娈垮枛椤戝懐鈧灚鐓″顕€寮垫担鍐槹缂備礁鐬肩亸銊ф濠靛鐒绘慨妯虹－缁犳牠鎮楅悷閭︽Ц闁告瑥绻樺鐢稿传閸曨偆鍘梺鍏煎劤閸㈣尪銇?};

// 鍒濆鍖朅PI瀵嗛挜
(function initApiSecretKey() {
  try {
    // 浠庢湰鍦板瓨鍌ㄨ幏鍙朅PI瀵嗛挜
    const secretKey = wx.getStorageSync('api_secret_key');
    if (secretKey) {
      API_CONFIG.SECRET_KEY = secretKey;
    } else {
      // 闈炴祴璇曠幆澧冧笅锛孉PI瀵嗛挜涓嶅瓨鍦ㄦ椂杈撳嚭璀﹀憡
      if (!API_CONFIG.USE_TEST) {
        console.error('API瀵嗛挜鏈壘鍒帮紝璇风‘淇濆凡鍦ㄦ湰鍦板瓨鍌ㄤ腑璁剧疆api_secret_key');
      }
    }
  } catch (error) {
    console.error('鍒濆鍖朅PI瀵嗛挜澶辫触:', error);
  }
})();

/**
   * 缃戠粶璇锋眰绫?   */
class Request {
  /**
   * 鍙戣捣API璇锋眰
   * @param {Object} options - 璇锋眰閰嶇疆閫夐」
   * @param {string} options.url - 璇锋眰URL
   * @param {string} options.method - 璇锋眰鏂规硶: GET/POST/PUT/DELETE
   * @param {Object} options.data - 璇锋眰鏁版嵁
   * @param {Object} options.header - 璇锋眰澶?   * @param {boolean} options.needAuth - 鏄惁闇€瑕佽璇?   * @param {boolean} options.needSign - 鏄惁闇€瑕佺鍚?   * @param {Object} options.cache - 缂撳瓨閰嶇疆
   * @param {string} options.cache.policy - 缂撳瓨绛栫暐: 'NETWORK_FIRST', 'CACHE_FIRST', 'STALE_WHILE_REVALIDATE', 'ONLY_NETWORK', 'ONLY_CACHE'
   * @param {number} options.cache.maxAge - 缂撳瓨鏈€澶ф湁鏁堟湡锛屽崟浣嶆绉?   * @returns {Promise} 璇锋眰缁撴灉Promise
   */
  static async request(options) {
    const {
      url,
      method = 'GET',
      data = {},
      header = {},
      needAuth = true,
      needSign = true,
      cache = {}
    } = options;
    
    // 闂佸搫顑呯€氼剛绱撻幘鑸靛珰闂佸灝顑囧﹢鎾⒑閺夎法肖闁?    let requestOptions = {
      url: this._buildUrl(url),
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header
      },
      timeout: API_CONFIG.TIMEOUT
    };
    
    // 濠电儑缍€椤曆勬叏閻愬灚濯奸柕鍫濈墢濡插牆菐閸ワ絽澧插ù?    if (needAuth) {
      const token = this._getAuthToken();
      if (token) {
        requestOptions.header['Authorization'] = `Bearer ${token}`;
      }
    }
    
    // 濠电儑缍€椤曆勬叏閻愬灚瀚氶梺鍨儑濠€瀵哥磼濞戞瑥鍔ら柟?    if (needSign) {
      requestOptions = signature.addSignatureToHeaders(
        requestOptions,
        API_CONFIG.SECRET_KEY
      );
    }
    
    // 婵犮垼娉涚€氼噣骞冩繝鍕＝闁规儳纾幗?    const cacheEnabled = method === 'GET' && cacheService && cache.policy;
    const cacheKey = this._generateCacheKey(requestOptions);
    
    // 闂佸搫绉烽～澶婄暤娴ｈ櫣纾介柟鎯х－閹界姷绱掑☉娆戝⒈闁哄棙鍔欏畷姗€宕橀懠顒佹瘞闂佸搫瀚烽崹浼村箚娓氣偓瀹曟宕奸敐鍥╊唹闂佹悶鍎抽崑鐔烘閿旈敮鍋撳☉娅虫垿寮抽悢鐓庣?    if (cacheEnabled) {
      switch (cache.policy) {
        case CACHE_POLICY.CACHE_FIRST:
          // 婵炴潙鍚嬮敋闁告ɑ绋掗幏鍛崉閵婏附娈㈢紓鍌氬€归幐鎼佹偤?          const cachedData = await cacheService.get(cacheKey, cache.maxAge);
          if (cachedData) {
            return cachedData;
          }
          // 缂傚倸鍊归幐鎼佹偤閵婏妇鈻旂€广儱鎳愰幗鐘绘煕閿旇崵鍘滅紒杈ㄧ箞楠炲秷顦舵い銏″灩缁辨棃骞嬮悩鍨礋闁荤姴娲弨閬嶆儑?          const result = await this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
          await cacheService.set(cacheKey, result, cache.maxAge);
          return result;
          
        case CACHE_POLICY.ONLY_CACHE:
          // 闂佸憡鐟禍娆愮箾閸ヮ剚鍋ㄩ柕濞у懎顦╅柣?          const onlyCachedData = await cacheService.get(cacheKey, cache.maxAge);
          if (onlyCachedData) {
            return onlyCachedData;
          }
          throw new Error(i18n.translate('offline_data_unavailable') || '缂備礁鍊藉畷鐢稿吹鎼淬劌鏋侀柣妤€鐗嗙粊锕€鈽夐幘宕囆㈢憸鐗堢叀閹?);
          
        case CACHE_POLICY.NETWORK_FIRST:
          try {
            // 婵炴潙鍚嬮敋闁告ɑ绋掗幏鍛崉閵婏附娈㈢紓鍌氬暞閸ㄥ湱鍒?            const result = await this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
            await cacheService.set(cacheKey, result, cache.maxAge);
            return result;
          } catch (error) {
            // 缂傚倸鍟崹鍦垝閸撲焦瀚氶梺鍨儑濠€鏉戭熆閹壆绨块悷娆欑畵閺佸秶浠﹂悾灞绢嚊闁荤姴娲﹀ú鎴炵箾閸ヮ剚鍋ㄩ柕濞у懎顦╅柣?            const fallbackData = await cacheService.get(cacheKey);
            if (fallbackData) {
              return fallbackData;
            }
            throw error;
          }
          
        case CACHE_POLICY.STALE_WHILE_REVALIDATE:
          // 闂佸憡鑹鹃張顒€顪冮崒娑欎氦闁哄倹瀵х粈鈧紓鍌氬€归幐鎼佹偤閵娾晛妞介悘鐐舵缁叉椽鎮硅椤ユ挾绱炴径宀€纾兼繝濠傛－閸ょ偞鎱ㄩ悷鏉库偓鐟懊洪崸妤€妫橀柟娈垮枤婢跺嫰鎮?          const staleData = await cacheService.get(cacheKey);
          
          // 闂佸搫鍟版慨楣冾敊閹寸姷纾介柟鎯х－閹界娀鏌￠崟闈涚仩闁诡垯鑳堕埀顒佺⊕閿氭繝鈧鍫熸櫖鐎光偓閸曨偄骞嬮梺鍛婄懄閸ㄥジ骞戦敐鍥╃＞闁瑰濮烽幑鏇㈡偣閸ヮ剚鏁遍柣顏冨嵆瀵鈧稒蓱閻撯偓缂傚倸鍊归幐鎼佹偤?          this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT)
            .then(result => {
              cacheService.set(cacheKey, result, cache.maxAge);
            })
            .catch(error => {
              console.warn('闂佸憡甯￠弨閬嶅蓟婵犲嫮纾介柟鎯х－閹界姴顭块幆鎵翱閻?', error);
            });
          
          // 婵犵鈧啿鈧綊鎮樻径鎰珘濠㈣泛鐬兼径鍕倵濞戞瑱鍏紒杈ㄧ箞閹嫮鈧稒锚婢跺秹寮堕埡鍌涚叆婵炲弶鐗滅槐鎾诲箻瀹曞洦鎲奸梺杞拌兌婢ф鐣?          if (staleData) {
            return staleData;
          }
          
          // 闂佸憡鐔粻鎴﹀垂椤栨粎椹冲璺猴功缁愶紕绱撻崘鈺佺仼缂侇喖澧庨幏鐘绘煥鐎ｎ剚鍕鹃柣搴ｆ嚀閺堫剟宕?          return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
          
        case CACHE_POLICY.ONLY_NETWORK:
        default:
          // 闂佸憡鐟禍娆愮箾閸ヮ剚鍋ㄩ柕濞у懐效缂傚倷鐒︾划锝囨濠靛洨鈻旂€广儱娲ㄦ径鍕倵?          return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
      }
    }
    
    // 闂佸搫鐗滄禍婊堝箚鎼淬劍鍋ㄩ柕濞у懎顦╅柣搴㈢⊕閿曨偆妲愬┑瀣剮閻庢稒锚婢跺秹鏌熺粭娑樻－閺€浠嬫偣閸ヮ剚鏁遍柣?    return this._executeWithRetry(requestOptions, API_CONFIG.RETRY_COUNT);
  }
  
  /**
   * GET闁荤姴娲弨閬嶆儑?   * @param {string} url - 闁荤姴娲弨閬嶆儑閻х嚝L
   * @param {Object} data - 闁荤姴娲弨閬嶆儑娴兼潙鏋侀柣妤€鐗嗙粊?   * @param {Object} options - 闂佺绻戝﹢鍦垝椤掑嫭鐒诲鑸靛姂閳?   * @returns {Promise} 闁荤姴娲弨閬嶆儑閹殿喚纾奸柟鎯ь嚟娴?   */
  static get(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    });
  }
  
  /**
   * POST闁荤姴娲弨閬嶆儑?   * @param {string} url - 闁荤姴娲弨閬嶆儑閻х嚝L
   * @param {Object} data - 闁荤姴娲弨閬嶆儑娴兼潙鏋侀柣妤€鐗嗙粊?   * @param {Object} options - 闂佺绻戝﹢鍦垝椤掑嫭鐒诲鑸靛姂閳?   * @returns {Promise} 闁荤姴娲弨閬嶆儑閹殿喚纾奸柟鎯ь嚟娴?   */
  static post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    });
  }
  
  /**
   * PUT闁荤姴娲弨閬嶆儑?   * @param {string} url - 闁荤姴娲弨閬嶆儑閻х嚝L
   * @param {Object} data - 闁荤姴娲弨閬嶆儑娴兼潙鏋侀柣妤€鐗嗙粊?   * @param {Object} options - 闂佺绻戝﹢鍦垝椤掑嫭鐒诲鑸靛姂閳?   * @returns {Promise} 闁荤姴娲弨閬嶆儑閹殿喚纾奸柟鎯ь嚟娴?   */
  static put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    });
  }
  
  /**
   * DELETE闁荤姴娲弨閬嶆儑?   * @param {string} url - 闁荤姴娲弨閬嶆儑閻х嚝L
   * @param {Object} data - 闁荤姴娲弨閬嶆儑娴兼潙鏋侀柣妤€鐗嗙粊?   * @param {Object} options - 闂佺绻戝﹢鍦垝椤掑嫭鐒诲鑸靛姂閳?   * @returns {Promise} 闁荤姴娲弨閬嶆儑閹殿喚纾奸柟鎯ь嚟娴?   */
  static delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    });
  }
  
  /**
   * 闂佸搫顑呯€氼剛绱撻幘鍨涘亾閻熺増婀伴柡鍡╂灕RL
   * @private
   * @param {string} url - 闂佺儵鏅濋…鍫ヮ敋閻㈠冻L
   * @returns {string} 闁诲海鎳撻張顒勫汲椤ゆ被L
   */
  static _buildUrl(url) {
    // 婵犵鈧啿鈧綊鎮樻径鎰強妞ゆ牗姘ㄩ弳姘舵煛娴ｈ　鍚俁L闂佹寧绋戦惉鐓幟洪崸妤€绠抽柕澶堝妿缁犳煡鏌?    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // 闂佸憡鐔粻鎴﹀垂椤栫偛绠柛蹇曞帶婢跺秹鏌涢埡鍕仩妞ゃ垹灏L
    const baseUrl = API_CONFIG.USE_TEST ? API_CONFIG.TEST_URL : API_CONFIG.BASE_URL;
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }
  
  /**
   * 闂佹眹鍨婚崰鎰板垂濮樿京纾介柟鎯х－閹界娀姊?   * @private
   * @param {Object} requestOptions - 闁荤姴娲弨閬嶆儑娴煎瓨鐒诲鑸靛姂閳?   * @returns {string} 缂傚倸鍊归幐鎼佹偤閵娾晜鐓?   */
  static _generateCacheKey(requestOptions) {
    const { url, data, method } = requestOptions;
    // 闁诲繐绻愰幗姗癓闂佸憡绮岄張顒勫汲閻旂厧绠叉い鏃囧亹绾板秹鏌涢幒鎿冩當閻庡灚鐓￠弫宥呯暆閳ь剟寮幘璇茬闁归偊鍓氶弳婊冣槈閹绢垰浜鹃梺姹囧妼鐎氼喚妲愰敂閿亾濞戞瑱鑰块柡?    const dataString = typeof data === 'string' ? data : JSON.stringify(data || {});
    // 婵炶揪缍€濞夋洟寮妶澶婂嵆闁圭虎鍠氳ぐ顖炴煛娴ｅ摜澧㈡繛鍫熷灴瀹曨偊宕煎┑鍫㈡啽缂備胶濮甸〃鍡欐兜閸洘鍋ㄩ柣鏃傤焾閻忓洨绱撻崒娑欏碍闁宦板姂閺屻劑顢氶崱娆戭槷闂佸憡鍨电换鎰版儍椤栫偛绀冮柛娑卞幘閹界娀鏌涘Δ鍐ㄐラ柡?    const hash = require('./crypto.js').md5(`${method}:${url}:${dataString}`);
    return hash;
  }
  
  /**
   * 闂佸吋鍎抽崲鑼躲亹閸モ晜濯奸柕鍫濈墢濡插牆霉閻橆喖鈧鏅?   * @private
   * @returns {string|null} 婵炲濮伴崐妤佹櫠?   */
  static _getAuthToken() {
    try {
      // 婵炲濮寸粣寮攐re婵炴垶鎼╅崣鈧鐐茬箻瀹曪綁寮堕。鏄竐n
      const token = store.getState('user.token');
      if (token) {
        return token;
      }
      
      // 闂傚倸瀚粔鑸殿殽閸ヮ剚鏅慨姗嗗亞閻倝鏌￠崼顐㈠婵犫偓鐎电硶鍋撳☉娅亪宕戝澶嬪殧鐎瑰嫭婢樼徊?      return wx.getStorageSync('token') || null;
    } catch (error) {
      console.error('闂佸吋鍎抽崲鑼躲亹閸モ晜濯奸柕鍫濈墢濡插牆霉閻橆喖鈧鏅跺┑鍥х窞閺夊牜鍋夎:', error);
      return null;
    }
  }
  
  /**
   * 闂佸湱鐟抽崱鈺傛杸闁荤姴娲弨閬嶆儑娴煎宓侀悹杞拌濡查亶鏌ｉ悙鍙夘棦闁革絽鎽滈幏?   * @private
   * @param {Object} options - 闁荤姴娲弨閬嶆儑娴煎瓨鐒诲鑸靛姂閳?   * @param {number} retryCount - 闂佸憡鎸撮弲娆戠礊閹达附鐓傜€广儱鐗忓Σ鍛婄箾閸″繐澧查柡?   * @returns {Promise} 闁荤姴娲弨閬嶆儑閹殿喚纾奸柟鎯ь嚟娴?   */
  static _executeWithRetry(options, retryCount) {
    return new Promise((resolve, reject) => {
      wx.request({
        ...options,
        success: (res) => {
          // 婵犮垼娉涚€氼噣骞冩繝鍥т紶鐎广儱鎳愮€?          if (res.statusCode === 401) {
            // 闂佸搫鐗滄禍婵嗩啅閸ф绾ч柛鎰硶缁€澶嬬箾閹捐櫕鍤囨繛鍛獝oken濡ょ姷鍋犻崺鏍亹娴ｈ櫣鐭嗛柧蹇氼潐椤忋垻鎲?            this._handleUnauthorized();
            reject(new Error(i18n.translate('login_required')));
          } else if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(res.data);
          } else {
            // 闁荤姴娲弨閬嶆儑閻楀牆绶為弶鍫亯琚?            const errorMsg = res.data?.message || 
                            i18n.translate('network_error') || 
                            '缂傚倸鍟崹鍦垝閸撲焦瀚氶梺鍨儑濠€鏉戭熆閹壆绨块悷?;
            reject(new Error(errorMsg));
          }
        },
        fail: (err) => {
          // 婵犮垼娉涚€氼噣骞冩繝鍕＞闁瑰濮烽幑鏇㈡⒑閹稿海鎳嗘い?          if (retryCount > 0) {
            // 闂備焦褰冪粔鐑芥儊椤栨粍瀚氶梺鍨儑濠€?            setTimeout(() => {
              this._executeWithRetry(options, retryCount - 1)
                .then(resolve)
                .catch(reject);
            }, 1000 * Math.pow(2, API_CONFIG.RETRY_COUNT - retryCount)); // 闂佸湱顭堝ú锕傚汲閻斿吋鐒婚柍褜鍓熼弻?          } else {
            // 闂備焦褰冪粔鐑芥儊椤栨埃鏋庨柍鈺佸暞濞堝爼鏌ｉ～顒€濡奸柣锝庡墴閺佸秶浠﹂幆褜娼濋梺鍛婂灦濡炰粙寮繝鍕珰?            reject(new Error(i18n.translate('network_error') || '缂傚倸鍟崹鍦垝閸撲焦瀚氶梺鍨儑濠€鏉戭熆閹壆绨块悷?));
          }
        },
        complete: () => {
          // 闁荤姴娲弨閬嶆儑閹殿喒鍋撻悷鐗堟拱闁搞劍宀稿畷銉︽償閿濆棛鏆犳繝銏ｆ硾鐎氼噣骞?          if (store) {
            store.commit('SET_LOADING', false);
          }
        }
      });
    });
  }
  
  /**
   * 婵犮垼娉涚€氼噣骞冩繝鍥у珘妞ゅ繐鎳庨幋鍧楁煛婢跺﹤鏆為柛搴＄箻瀹?   * @private
   */
  static _handleUnauthorized() {
    // 濠电偞鎸搁幊妯衡枍鎼淬劍鍋ㄩ柕濠忕畱閻撴洖菐閸ワ絽澧插ù鐓庢嚇瀹曨亞鈧湱纾en
    store.commit('SET_USER_INFO', null);
    store.commit('SET_TOKEN', null);
    
    // 濠电偞鎸搁幊妯衡枍鎼淬劌瀚夋い鎺嗗亾婵犫偓鐎电硶鍋撳☉娅亪宕?    try {
      wx.removeStorageSync('token');
      wx.removeStorageSync('userInfo');
    } catch (error) {
      console.error('濠电偞鎸搁幊妯衡枍鎼达絾濯奸柕鍫濈墢濡插牆菐閸ワ絽澧插ù鐓庢噺瀵板嫭娼忛銉?', error);
    }
    
    // 闂佸湱绮崝妤呭Φ濮樿埖鍋ㄩ柕濠忕畱閻撴洟姊婚崶锝呬壕闁荤喐娲戦懗璺衡枍閵夈劊浜?    wx.showToast({
      title: i18n.translate('login_required'),
      icon: 'none'
    });
  }
  
  /**
   * 濠电偞鎸搁幊妯衡枍鎼淬劍鍋嬮柣鐔稿閺嗙櫊RL闂佹眹鍔岀€氼喚妲愰敂閿亾?   * @param {string} url - 闁荤姴娲弨閬嶆儑閻х嚝L
   * @param {Object} data - 闁荤姴娲弨閬嶆儑娴兼潙鏋侀柣妤€鐗嗙粊锕傛煥濞戞澧曠憸鐗堢叀閺屽懏寰勫☉姘鳖槴
   * @returns {Promise<boolean>} 闂佸搫瀚烽崹浼村箚娴ｆ悶鈧帡宕ㄧ€涙褰戦梺鐟扮摠閸旀洘鎱?   */
  static async clearCache(url, data = {}) {
    if (!cacheService) return false;
    
    const requestOptions = {
      url: this._buildUrl(url),
      method: 'GET',
      data
    };
    
    const cacheKey = this._generateCacheKey(requestOptions);
    return await cacheService.remove(cacheKey);
  }
  
  /**
   * 濠电偞鎸搁幊妯衡枍鎼淬劌绠ラ柍褜鍓熷鍨緞鎼搭喖娈插┑顔炬嚀閸婅崵妲愰敂閿亾?   * @returns {Promise<boolean>} 闂佸搫瀚烽崹浼村箚娴ｆ悶鈧帡宕ㄧ€涙褰戦梺鐟扮摠閸旀洘鎱?   */
  static async clearAllCache() {
    if (!cacheService) return false;
    return await cacheService.clear('request');
  }
  
  /**
   * 婵炴垶鎸搁敃锝囨閸洖妫橀柛銉檮椤?   * @param {string} url - 婵炴垶鎸搁敃锝囨缁傜寕L
   * @param {string} filePath - 闂佸搫鍊稿ú锝呪枎閵忋垺宕夋い鏍ㄦ皑缁?   * @param {Object} options - 闂佺绻戝﹢鍦垝椤掑嫭鐒诲鑸靛姂閳?   * @returns {Promise} 婵炴垶鎸搁敃锝囨閸撲胶纾奸柟鎯ь嚟娴?   */
  static uploadFile(url, filePath, options = {}) {
    const {
      name = 'file',
      formData = {},
      header = {},
      needAuth = true
    } = options;
    
    // 濠电儑缍€椤曆勬叏閻愬灚濯奸柕鍫濈墢濡插牆菐閸ワ絽澧插ù?    if (needAuth) {
      const token = this._getAuthToken();
      if (token) {
        header['Authorization'] = `Bearer ${token}`;
      }
    }
    
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        url: this._buildUrl(url),
        filePath,
        name,
        formData,
        header,
        timeout: API_CONFIG.TIMEOUT,
        success: (res) => {
          try {
            const data = JSON.parse(res.data);
            if (res.statusCode === 200) {
              resolve(data);
            } else {
              reject(new Error(data.message || '婵炴垶鎸搁敃锝囨閼搁潧绶為弶鍫亯琚?));
            }
          } catch (error) {
            reject(new Error('闁荤喐鐟辩徊楣冩倵娴犲浼犵€广儱鎳愮€瑰顭块幆鎵翱閻?));
          }
        },
        fail: (err) => {
          reject(new Error('婵炴垶鎸搁敃锝囨閸洖妫橀柛銉檮椤愯棄顭块幆鎵翱閻?));
        }
      });
    });
  }
}

module.exports = Request;
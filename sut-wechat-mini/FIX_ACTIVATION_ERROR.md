# 淇 SUT寰俊灏忕▼搴忔彃浠舵縺娲诲け璐ラ棶棰?
\n## 闂鍘熷洜\n\n缁忚繃鍒嗘瀽锛屾彃浠舵縺娲诲け璐ョ殑涓昏鍘熷洜鏄?*缂哄皯缂栬瘧鍚庣殑缈昏瘧鏂囦欢锛?mo鏂囦欢锛?*銆?
\n鍦╓ordPress鎻掍欢涓紝缈昏瘧鍔熻兘闇€瑕佷互涓嬫枃浠堕厤鍚堝伐浣滐細\n- `.pot` 鏂囦欢锛氱炕璇戞ā鏉挎枃浠讹紙宸插瓨鍦級\n- `.po` 鏂囦欢锛氱壒瀹氳瑷€鐨勭炕璇戞枃浠讹紙宸插瓨鍦紝濡俿ut-wechat-mini-zh_CN.po锛?
- `.mo` 鏂囦欢锛氱紪璇戝悗鐨勪簩杩涘埗缈昏瘧鏂囦欢锛?*缂哄け**锛?
\nWordPress鏃犳硶鐩存帴浣跨敤.po鏂囦欢锛屽繀椤婚€氳繃缂栬瘧鐢熸垚.mo鏂囦欢鍚庢墠鑳藉姞杞界炕璇戞枃鏈€傚綋鎻掍欢灏濊瘯鍔犺浇涓嶅瓨鍦ㄧ殑.mo鏂囦欢鏃讹紝浼氬鑷存縺娲诲け璐ャ€?
\n## 妫€鏌ョ粨鏋?
\n鍦?`languages` 鐩綍涓細\n- 鉁?瀛樺湪 `sut-wechat-mini.pot`锛堟ā鏉挎枃浠讹級\n- 鉁?瀛樺湪 `sut-wechat-mini-zh_CN.po`锛堜腑鏂囩炕璇戯級\n- 鉁?瀛樺湪 `sut-wechat-mini-en_US.po`锛堣嫳鏂囩炕璇戯級\n- 鉂?缂哄皯 `sut-wechat-mini-zh_CN.mo`锛堢紪璇戝悗鐨勪腑鏂囩炕璇戯級\n- 鉂?缂哄皯 `sut-wechat-mini-en_US.mo`锛堢紪璇戝悗鐨勮嫳鏂囩炕璇戯級\n\n## 瑙ｅ喅鏂规\n\n### 鏂规硶涓€锛氫娇鐢?gettext 宸ュ叿缂栬瘧锛堟帹鑽愶級\n\n1. 瀹夎 gettext 宸ュ叿锛堝寘鍚?msgfmt 鍛戒护锛夛細\n   - **Windows**: 鍙互浠?https://mlocati.github.io/articles/gettext-iconv-windows.html 涓嬭浇\n   - **macOS**: 浣跨敤 Homebrew 瀹夎 `brew install gettext`\n   - **Linux**: 浣跨敤鍖呯鐞嗗櫒瀹夎锛屽 `apt-get install gettext` 鎴?`yum install gettext`\n\n2. 鎵撳紑鍛戒护琛屽伐鍏凤紝瀵艰埅鍒版彃浠剁殑 languages 鐩綍锛?
   ```\n   cd e:\Dropbox\GitHub\SutWxApp\sut-wechat-mini\languages\n   ```\n\n3. 杩愯浠ヤ笅鍛戒护缂栬瘧姣忎釜 .po 鏂囦欢锛?
   ```\n   msgfmt sut-wechat-mini-zh_CN.po -o sut-wechat-mini-zh_CN.mo\n   msgfmt sut-wechat-mini-en_US.po -o sut-wechat-mini-en_US.mo\n   ```\n\n### 鏂规硶浜岋細浣跨敤鍦ㄧ嚎杞崲宸ュ叿\n\n濡傛灉鎮ㄤ笉鎯冲畨瑁呴澶栫殑杞欢锛屽彲浠ヤ娇鐢ㄥ湪绾縋O鍒癕O杞崲宸ュ叿锛?
\n1. 鎵撳紑 https://po2mo.net/ 鎴栧叾浠栫被浼肩殑鍦ㄧ嚎杞崲宸ュ叿\n2. 涓婁紶鎮ㄧ殑 `.po` 鏂囦欢锛坰ut-wechat-mini-zh_CN.po 鍜?sut-wechat-mini-en_US.po锛?
3. 涓嬭浇杞崲鍚庣殑 `.mo` 鏂囦欢\n4. 灏?`.mo` 鏂囦欢淇濆瓨鍒版彃浠剁殑 `languages` 鐩綍涓?
\n### 鏂规硶涓夛細涓存椂绂佺敤鎻掍欢鐨勭炕璇戝姛鑳斤紙涓嶆帹鑽愶級\n\n濡傛灉鎮ㄩ渶瑕佺揣鎬ユ縺娲绘彃浠讹紝鍙互涓存椂淇敼鎻掍欢浠ｇ爜绂佺敤缈昏瘧鍔熻兘锛?
\n1. 鎵撳紑 `e:\Dropbox\GitHub\SutWxApp\sut-wechat-mini\includes\class-sut-wechat-mini-loader.php` 鏂囦欢\n2. 鎵惧埌 `load_textdomain` 鏂规硶锛堝ぇ绾﹀湪绗?5琛岄檮杩戯級\n3. 淇敼涓猴細\n   ```php\n   private function load_textdomain() {\n       // 涓存椂绂佺敤缈昏瘧鍔犺浇\n       // load_plugin_textdomain( 'sut-wechat-mini', false, basename( SUT_WECHAT_MINI_PLUGIN_DIR ) . '/languages' );\n   }\n   ```\n\n## 楠岃瘉淇\n\n缂栬瘧瀹屾垚鍚庯紝妫€鏌?`languages` 鐩綍涓槸鍚﹀凡鐢熸垚 `.mo` 鏂囦欢銆傜‘璁ゆ枃浠跺瓨鍦ㄥ悗锛屽皾璇曞湪WordPress鍚庡彴閲嶆柊婵€娲绘彃浠躲€?
\n## 閲嶈鎻愮ず\n\n- 缈昏瘧鏂囦欢瀵逛簬鎻掍欢鐨勬甯歌繍琛岃嚦鍏抽噸瑕侊紝鐗瑰埆鏄湪鏄剧ず绠＄悊鐣岄潰鍜岄敊璇俊鎭椂\n- 姣忔鏇存柊 `.po` 鏂囦欢鍚庯紝閮介渶瑕侀噸鏂扮紪璇戠敓鎴愭柊鐨?`.mo` 鏂囦欢\n- 寤鸿鍦ㄦ彃浠剁殑寮€鍙戝拰鍙戝竷娴佺▼涓坊鍔犵紪璇?`.mo` 鏂囦欢鐨勬楠?
\n濡傛灉瀹屾垚涓婅堪姝ラ鍚庢彃浠朵粛鐒舵棤娉曟縺娲伙紝璇锋鏌ユ湇鍔″櫒鐜鏄惁婊¤冻鎻掍欢瑕佹眰锛圥HP >= 7.0锛學ordPress >= 5.0锛夈€
# OpenSpec 鎸囦护

浣跨敤 OpenSpec 杩涜瑙勮寖椹卞姩寮€鍙戠殑 AI 缂栫爜鍔╂墜鎸囦护銆?

## TL;DR 蹇€熸鏌ユ竻鍗?

- 鎼滅储鐜版湁宸ヤ綔锛歚openspec spec list --long`锛宍openspec list`锛堜粎鍦ㄩ渶瑕佸叏鏂囨悳绱㈡椂浣跨敤 `rg`锛?
- 纭畾鑼冨洿锛氭柊鍔熻兘 vs 淇敼鐜版湁鍔熻兘
- 閫夋嫨鍞竴鐨?`change-id`锛氫娇鐢ㄧ煭妯嚎鍒嗛殧鐨勫皬鍐欏懡鍚嶏紝鍔ㄨ瘝寮€澶达紙`add-`銆乣update-`銆乣remove-`銆乣refactor-`锛?
- 鎼缓妗嗘灦锛歚proposal.md`銆乣tasks.md`銆乣design.md`锛堜粎鍦ㄩ渶瑕佹椂锛夛紝浠ュ強姣忎釜鍙楀奖鍝嶅姛鑳界殑澧為噺瑙勮寖
- 缂栧啓澧為噺锛氫娇鐢?`## ADDED|MODIFIED|REMOVED|RENAMED Requirements`锛涙瘡涓渶姹傝嚦灏戝寘鍚竴涓?`#### Scenario:`
- 楠岃瘉锛歚openspec validate [change-id] --strict` 骞朵慨澶嶉棶棰?
- 璇锋眰鎵瑰噯锛氬湪鎻愭鑾峰緱鎵瑰噯鍓嶄笉瑕佸紑濮嬪疄鏂?

## 涓夐樁娈靛伐浣滄祦绋?

### 闃舵 1锛氬垱寤哄彉鏇?

褰撲綘闇€瑕佷互涓嬫搷浣滄椂鍒涘缓鎻愭锛?
- 娣诲姞鐗规€ф垨鍔熻兘
- 杩涜鐮村潖鎬у彉鏇达紙API銆佹ā寮忥級
- 鏇存敼鏋舵瀯鎴栨ā寮?
- 浼樺寲鎬ц兘锛堟洿鏀硅涓猴級
- 鏇存柊瀹夊叏妯″紡

瑙﹀彂鏉′欢锛堢ず渚嬶級锛?
- "甯垜鍒涘缓涓€涓彉鏇存彁妗?
- "甯垜瑙勫垝涓€涓彉鏇?
- "甯垜鍒涘缓涓€涓彁妗?
- "鎴戞兂鍒涘缓涓€涓鑼冩彁妗?
- "鎴戞兂鍒涘缓涓€涓鑼?

瀹芥澗鍖归厤鎸囧崡锛?
- 鍖呭惈浠ヤ笅浠绘剰涓€涓瘝锛歚proposal`銆乣change`銆乣spec`
- 鍖呭惈浠ヤ笅浠绘剰涓€涓瘝锛歚create`銆乣plan`銆乣make`銆乣start`銆乣help`

璺宠繃鎻愭鐨勬儏鍐碉細
- 閿欒淇锛堟仮澶嶉鏈熻涓猴級
- 鎷煎啓閿欒銆佹牸寮忚皟鏁淬€佹敞閲?
- 渚濊禆鏇存柊锛堥潪鐮村潖鎬э級
- 閰嶇疆鏇存敼
- 鐜版湁琛屼负鐨勬祴璇?

**宸ヤ綔娴佺▼**
1. 鏌ョ湅 `openspec/project.md`銆乣openspec list` 鍜?`openspec list --specs` 浠ヤ簡瑙ｅ綋鍓嶄笂涓嬫枃銆?
2. 閫夋嫨鍞竴鐨勫姩璇嶅紑澶寸殑 `change-id`锛屽苟鍦?`openspec/changes/<id>/` 涓嬫惌寤?`proposal.md`銆乣tasks.md`銆佸彲閫夌殑 `design.md` 鍜岃鑼冨閲忋€?
3. 浣跨敤 `## ADDED|MODIFIED|REMOVED Requirements` 璧疯崏瑙勮寖澧為噺锛屾瘡涓渶姹傝嚦灏戝寘鍚竴涓?`#### Scenario:`銆?
4. 杩愯 `openspec validate <id> --strict` 骞跺湪鍒嗕韩鎻愭鍓嶈В鍐虫墍鏈夐棶棰樸€?

### 闃舵 2锛氬疄鏂藉彉鏇?

灏嗚繖浜涙楠や綔涓哄緟鍔炰簨椤硅繘琛岃窡韪紝骞堕€愪竴瀹屾垚銆?
1. **闃呰 proposal.md** - 浜嗚В姝ｅ湪鏋勫缓鐨勫唴瀹?
2. **闃呰 design.md**锛堝鏋滃瓨鍦級- 鏌ョ湅鎶€鏈喅绛?
3. **闃呰 tasks.md** - 鑾峰彇瀹炴柦娓呭崟
4. **鎸夐『搴忓疄鏂戒换鍔?* - 鎸夐『搴忓畬鎴?
5. **纭瀹屾垚** - 鍦ㄦ洿鏂扮姸鎬佸墠纭繚 `tasks.md` 涓殑姣忎釜椤圭洰閮藉凡瀹屾垚
6. **鏇存柊娓呭崟** - 鎵€鏈夊伐浣滃畬鎴愬悗锛屽皢姣忎釜浠诲姟璁剧疆涓?`- [x]`锛屼互渚挎竻鍗曞弽鏄犲疄闄呮儏鍐?
7. **鎵瑰噯闂ㄦ帶** - 鍦ㄦ彁妗堢粡杩囧鏌ュ拰鎵瑰噯鍓嶄笉瑕佸紑濮嬪疄鏂?

### 闃舵 3锛氬綊妗ｅ彉鏇?

閮ㄧ讲鍚庯紝鍒涘缓鍗曠嫭鐨?PR 鏉ワ細
- 灏?`changes/[name]/` 绉诲姩鍒?`changes/archive/YYYY-MM-DD-[name]/`
- 濡傛灉鍔熻兘鍙戠敓鍙樺寲锛屾洿鏂?`specs/`
- 瀵逛簬浠呭伐鍏峰彉鏇达紝浣跨敤 `openspec archive <change-id> --skip-specs --yes`锛堝缁堟樉寮忎紶閫掑彉鏇?ID锛?
- 杩愯 `openspec validate --strict` 浠ョ‘璁ゅ綊妗ｇ殑鍙樻洿閫氳繃妫€鏌?

## 浠讳綍浠诲姟涔嬪墠

**涓婁笅鏂囨鏌ユ竻鍗曪細**
- [ ] 闃呰 `specs/[capability]/spec.md` 涓殑鐩稿叧瑙勮寖
- [ ] 妫€鏌?`changes/` 涓殑寰呭鐞嗗彉鏇存槸鍚﹀瓨鍦ㄥ啿绐?
- [ ] 闃呰 `openspec/project.md` 浜嗚В绾﹀畾
- [ ] 杩愯 `openspec list` 鏌ョ湅娲诲姩鍙樻洿
- [ ] 杩愯 `openspec list --specs` 鏌ョ湅鐜版湁鍔熻兘

**鍒涘缓瑙勮寖涔嬪墠锛?*
- 濮嬬粓妫€鏌ュ姛鑳芥槸鍚﹀凡缁忓瓨鍦?
- 浼樺厛淇敼鐜版湁瑙勮寖锛岃€屼笉鏄垱寤洪噸澶嶈鑼?
- 浣跨敤 `openspec show [spec]` 鏌ョ湅褰撳墠鐘舵€?
- 濡傛灉璇锋眰涓嶆槑纭紝鍦ㄦ惌寤烘鏋跺墠鍏堥棶 1-2 涓緞娓呴棶棰?

### 鎼滅储鎸囧崡
- 鏋氫妇瑙勮寖锛歚openspec spec list --long`锛堟垨 `--json` 鐢ㄤ簬鑴氭湰锛?
- 鏋氫妇鍙樻洿锛歚openspec list`锛堟垨宸插純鐢ㄤ絾浠嶅彲鐢ㄧ殑 `openspec change list --json`锛?
- 鏄剧ず璇︽儏锛?
  - 瑙勮寖锛歚openspec show <spec-id> --type spec`锛堜娇鐢?`--json` 杩涜杩囨护锛?
  - 鍙樻洿锛歚openspec show <change-id> --json --deltas-only`
- 鍏ㄦ枃鎼滅储锛堜娇鐢?ripgrep锛夛細`rg -n "Requirement:|Scenario:" openspec/specs`

## 蹇€熷紑濮?

### CLI 鍛戒护

```bash
# 鍩烘湰鍛戒护
openspec list                  # 鍒楀嚭娲诲姩鍙樻洿
openspec list --specs          # 鍒楀嚭瑙勮寖
openspec show [item]           # 鏄剧ず鍙樻洿鎴栬鑼?
openspec validate [item]       # 楠岃瘉鍙樻洿鎴栬鑼?
openspec archive <change-id> [--yes|-y]   # 閮ㄧ讲鍚庡綊妗ｏ紙娣诲姞 --yes 鐢ㄤ簬闈炰氦浜掑紡杩愯锛?

# 椤圭洰绠＄悊
openspec init [path]           # 鍒濆鍖?OpenSpec
openspec update [path]         # 鏇存柊鎸囦护鏂囦欢

# 浜や簰妯″紡
openspec show                  # 鎻愮ず閫夋嫨
openspec validate              # 鎵归噺楠岃瘉妯″紡

# 璋冭瘯
openspec show [change] --json --deltas-only
openspec validate [change] --strict
```

### 鍛戒护鏍囧織

- `--json` - 鏈哄櫒鍙杈撳嚭
- `--type change|spec` - 鏄庣‘椤圭洰绫诲瀷
- `--strict` - 鍏ㄩ潰楠岃瘉
- `--no-interactive` - 绂佺敤鎻愮ず
- `--skip-specs` - 褰掓。鏃朵笉鏇存柊瑙勮寖
- `--yes`/`-y` - 璺宠繃纭鎻愮ず锛堥潪浜や簰寮忓綊妗ｏ級

## 鐩綍缁撴瀯

```
openspec/
鈹溾攢鈹€ project.md              # 椤圭洰绾﹀畾
鈹溾攢鈹€ specs/                  # 褰撳墠浜嬪疄 - 宸叉瀯寤虹殑鍐呭
鈹?  鈹斺攢鈹€ [capability]/       # 鍗曚釜鑱氱劍鍔熻兘
鈹?      鈹溾攢鈹€ spec.md         # 闇€姹傚拰鍦烘櫙
鈹?      鈹斺攢鈹€ design.md       # 鎶€鏈ā寮?
鈹溾攢鈹€ changes/                # 鎻愭 - 搴旇鏇存敼鐨勫唴瀹?
鈹?  鈹溾攢鈹€ [change-name]/
鈹?  鈹?  鈹溾攢鈹€ proposal.md     # 鍘熷洜銆佸唴瀹广€佸奖鍝?
鈹?  鈹?  鈹溾攢鈹€ tasks.md        # 瀹炴柦娓呭崟
鈹?  鈹?  鈹溾攢鈹€ design.md       # 鎶€鏈喅绛栵紙鍙€夛紱瑙佹爣鍑嗭級
鈹?  鈹?  鈹斺攢鈹€ specs/          # 澧為噺鍙樻洿
鈹?  鈹?      鈹斺攢鈹€ [capability]/
鈹?  鈹?          鈹斺攢鈹€ spec.md # ADDED/MODIFIED/REMOVED
鈹?  鈹斺攢鈹€ archive/            # 宸插畬鎴愮殑鍙樻洿
```

## 鍒涘缓鍙樻洿鎻愭

### 鍐崇瓥鏍?

```
鏂拌姹傦紵
鈹溾攢 淇鎭㈠瑙勮寖琛屼负鐨勯敊璇紵 鈫?鐩存帴淇
鈹溾攢 鎷煎啓/鏍煎紡/娉ㄩ噴锛?鈫?鐩存帴淇  
鈹溾攢 鏂板姛鑳?鍔熻兘锛?鈫?鍒涘缓鎻愭
鈹溾攢 鐮村潖鎬у彉鏇达紵 鈫?鍒涘缓鎻愭
鈹溾攢 鏋舵瀯鍙樻洿锛?鈫?鍒涘缓鎻愭
鈹斺攢 涓嶆槑纭紵 鈫?鍒涘缓鎻愭锛堟洿瀹夊叏锛?
```

### 鎻愭缁撴瀯

1. **鍒涘缓鐩綍锛?* `changes/[change-id]/`锛堢煭妯嚎鍒嗛殧鐨勫皬鍐欏懡鍚嶏紝鍔ㄨ瘝寮€澶达紝鍞竴锛?

2. **缂栧啓 proposal.md锛?*
```markdown
# Change: [鍙樻洿鐨勭畝瑕佹弿杩癩

## Why
[1-2 鍙ヨ瘽璇存槑闂/鏈轰細]

## What Changes
- [鍙樻洿鐨勮鐐瑰垪琛╙
- [浣跨敤 **BREAKING** 鏍囪鐮村潖鎬у彉鏇碷

## Impact
- 鍙楀奖鍝嶇殑瑙勮寖锛歔鍒楀嚭鍔熻兘]
- 鍙楀奖鍝嶇殑浠ｇ爜锛歔鍏抽敭鏂囦欢/绯荤粺]
```

3. **鍒涘缓瑙勮寖澧為噺锛?* `specs/[capability]/spec.md`
```markdown
## ADDED Requirements
### Requirement: New Feature
绯荤粺 SHALL 鎻愪緵...

#### Scenario: Success case
- **WHEN** 鐢ㄦ埛鎵ц鎿嶄綔
- **THEN** 棰勬湡缁撴灉

## MODIFIED Requirements
### Requirement: Existing Feature
[瀹屾暣鐨勪慨鏀瑰悗鐨勯渶姹俔

## REMOVED Requirements
### Requirement: Old Feature
**Reason**锛歔鍒犻櫎鍘熷洜]
**Migration**锛歔澶勭悊鏂瑰紡]
```
濡傛灉澶氫釜鍔熻兘鍙楀埌褰卞搷锛屽湪 `changes/[change-id]/specs/<capability>/spec.md` 涓嬪垱寤哄涓閲忔枃浠垛€斺€旀瘡涓姛鑳戒竴涓€?

4. **鍒涘缓 tasks.md锛?*
```markdown
## 1. Implementation
- [ ] 1.1 鍒涘缓鏁版嵁搴撴ā寮?
- [ ] 1.2 瀹炵幇 API 绔偣
- [ ] 1.3 娣诲姞鍓嶇缁勪欢
- [ ] 1.4 缂栧啓娴嬭瘯
```

5. **鍦ㄩ渶瑕佹椂鍒涘缓 design.md锛?*
濡傛灉婊¤冻浠ヤ笅浠讳竴鏉′欢锛屽垯鍒涘缓 `design.md`锛涘惁鍒欑渷鐣ワ細
- 璺ㄩ鍩熷彉鏇达紙澶氫釜鏈嶅姟/妯″潡锛夋垨鏂扮殑鏋舵瀯妯″紡
- 鏂扮殑澶栭儴渚濊禆鎴栭噸澶ф暟鎹ā鍨嬪彉鏇?
- 瀹夊叏銆佹€ц兘鎴栬縼绉诲鏉傛€?
- 闇€瑕佸湪缂栫爜鍓嶆槑纭妧鏈喅绛栫殑妯＄硦鎬?

鏈€灏忓寲鐨?`design.md` 楠ㄦ灦锛?
```markdown
## Context
[鑳屾櫙銆佺害鏉熴€佸埄鐩婄浉鍏宠€匽

## Goals / Non-Goals
- Goals: [...]
- Non-Goals: [...]

## Decisions
- Decision: [鍐呭鍜屽師鍥燷
- Alternatives considered: [閫夐」 + 鐞嗙敱]

## Risks / Trade-offs
- [椋庨櫓] 鈫?缂撹В鎺柦

## Migration Plan
[姝ラ銆佸洖婊歖

## Open Questions
- [...]
```

## 瑙勮寖鏂囦欢鏍煎紡

### 鍏抽敭锛氬満鏅牸寮?

**姝ｇ‘**锛堜娇鐢?#### 鏍囬锛夛細
```markdown
#### Scenario: 鐢ㄦ埛鐧诲綍鎴愬姛
- **WHEN** 鎻愪緵鏈夋晥鍑瘉
- **THEN** 杩斿洖 JWT 浠ょ墝
```

**閿欒**锛堜笉瑕佷娇鐢ㄩ」鐩鍙锋垨绮椾綋锛夛細
```markdown
- **Scenario: 鐢ㄦ埛鐧诲綍**  鉂?
**Scenario**锛氱敤鎴风櫥褰?    鉂?
### Scenario: 鐢ㄦ埛鐧诲綍      鉂?
```

姣忎釜闇€姹傚繀椤昏嚦灏戞湁涓€涓満鏅€?

### 闇€姹傛帾杈?
- 瀵逛簬瑙勮寖鎬ч渶姹傦紝浣跨敤 SHALL/MUST锛堥伩鍏嶄娇鐢?should/may锛岄櫎闈炴湁鎰忛潪瑙勮寖鎬э級

### 澧為噺鎿嶄綔

- `## ADDED Requirements` - 鏂板姛鑳?
- `## MODIFIED Requirements` - 鏇存敼琛屼负
- `## REMOVED Requirements` - 宸插純鐢ㄥ姛鑳?
- `## RENAMED Requirements` - 鍚嶇О鏇存敼

鏍囬浣跨敤 `trim(header)` 鍖归厤 - 蹇界暐绌虹櫧銆?

#### 浣曟椂浣跨敤 ADDED 涓?MODIFIED
- ADDED锛氬紩鍏ヤ竴涓彲浠ヤ綔涓虹嫭绔嬮渶姹傜殑鏂板姛鑳芥垨瀛愬姛鑳姐€傚綋鍙樻洿姝ｄ氦鏃讹紙渚嬪锛屾坊鍔?"鏂滄潬鍛戒护閰嶇疆"锛夛紝浼樺厛浣跨敤 ADDED锛岃€屼笉鏄敼鍙樼幇鏈夐渶姹傜殑璇箟銆?
- MODIFIED锛氭洿鏀圭幇鏈夐渶姹傜殑琛屼负銆佽寖鍥存垨楠屾敹鏍囧噯銆傚缁堢矘璐村畬鏁寸殑銆佹洿鏂板悗鐨勯渶姹傚唴瀹癸紙鏍囬 + 鎵€鏈夊満鏅級銆傚綊妗ｅ櫒灏嗙敤浣犲湪杩欓噷鎻愪緵鐨勫唴瀹规浛鎹㈡暣涓渶姹傦紱閮ㄥ垎澧為噺浼氫涪澶变箣鍓嶇殑缁嗚妭銆?
- RENAMED锛氫粎褰撳悕绉版洿鏀规椂浣跨敤銆傚鏋滃悓鏃舵洿鏀硅涓猴紝浣跨敤 RENAMED锛堝悕绉帮級鍔犱笂 MODIFIED锛堝唴瀹癸級寮曠敤鏂板悕绉般€?

甯歌闄烽槺锛氫娇鐢?MODIFIED 娣诲姞鏂板叧娉ㄧ偣鑰屼笉鍖呭惈涔嬪墠鐨勬枃鏈€傝繖浼氬鑷村綊妗ｆ椂涓㈠け缁嗚妭銆傚鏋滀綘娌℃湁鏄庣‘鏇存敼鐜版湁闇€姹傦紝鑰屾槸鍦?ADDED 涓嬫坊鍔犱竴涓柊闇€姹傘€?

姝ｇ‘缂栧啓 MODIFIED 闇€姹傦細
1) 鍦?`openspec/specs/<capability>/spec.md` 涓壘鍒扮幇鏈夐渶姹傘€?
2) 澶嶅埗鏁翠釜闇€姹傚潡锛堜粠 `### Requirement: ...` 鍒板叾鎵€鏈夊満鏅級銆?
3) 灏嗗叾绮樿创鍒?`## MODIFIED Requirements` 涓嬪苟缂栬緫浠ュ弽鏄犳柊琛屼负銆?
4) 纭繚鏍囬鏂囨湰瀹屽叏鍖归厤锛堝拷鐣ョ┖鐧斤級锛屽苟淇濈暀鑷冲皯涓€涓?`#### Scenario:`銆?

RENAMED 绀轰緥锛?
```markdown
## RENAMED Requirements
- FROM: `### Requirement: Login`
- TO: `### Requirement: User Authentication`
```

## 鏁呴殰鎺掗櫎

### 甯歌閿欒

**"Change must have at least one delta"**
- 妫€鏌?`changes/[name]/specs/` 鏄惁瀛樺湪 .md 鏂囦欢
- 楠岃瘉鏂囦欢鏄惁鏈夋搷浣滃墠缂€锛?# ADDED Requirements锛?

**"Requirement must have at least one scenario"**
- 妫€鏌ュ満鏅槸鍚︿娇鐢?`#### Scenario:` 鏍煎紡锛? 涓簳鍙凤級
- 涓嶈瀵瑰満鏅爣棰樹娇鐢ㄩ」鐩鍙锋垨绮椾綋

**闈欓粯鍦烘櫙瑙ｆ瀽澶辫触**
- 闇€瑕佺‘鍒囨牸寮忥細`#### Scenario: Name`
- 浣跨敤浠ヤ笅鍛戒护璋冭瘯锛歚openspec show [change] --json --deltas-only`

### 楠岃瘉鎻愮ず

```bash
# 濮嬬粓浣跨敤涓ユ牸妯″紡杩涜鍏ㄩ潰妫€鏌?
openspec validate [change] --strict

# 璋冭瘯澧為噺瑙ｆ瀽
openspec show [change] --json | jq '.deltas'

# 妫€鏌ョ壒瀹氶渶姹?
openspec show [spec] --json -r 1
```

## 鎰夊揩璺緞鑴氭湰

```bash
# 1) 鎺㈢储褰撳墠鐘舵€?
openspec spec list --long
openspec list
# 鍙€夌殑鍏ㄦ枃鎼滅储锛?
# rg -n "Requirement:|Scenario:" openspec/specs
# rg -n "^#|Requirement:" openspec/changes

# 2) 閫夋嫨鍙樻洿 ID 骞舵惌寤烘鏋?
CHANGE=add-two-factor-auth
mkdir -p openspec/changes/$CHANGE/{specs/auth}
printf "## Why\n...\n\n## What Changes\n- ...\n\n## Impact\n- ...\n" > openspec/changes/$CHANGE/proposal.md
printf "## 1. Implementation\n- [ ] 1.1 ...\n" > openspec/changes/$CHANGE/tasks.md

# 3) 娣诲姞澧為噺锛堢ず渚嬶級
cat > openspec/changes/$CHANGE/specs/auth/spec.md << 'EOF'
## ADDED Requirements
### Requirement: Two-Factor Authentication
Users MUST provide a second factor during login.

#### Scenario: OTP required
- **WHEN** 鎻愪緵鏈夋晥鍑瘉
- **THEN** 闇€瑕?OTP 鎸戞垬
EOF

# 4) 楠岃瘉
openspec validate $CHANGE --strict
```

## 澶氬姛鑳界ず渚?

```
openspec/changes/add-2fa-notify/
鈹溾攢鈹€ proposal.md
鈹溾攢鈹€ tasks.md
鈹斺攢鈹€ specs/
    鈹溾攢鈹€ auth/
    鈹?  鈹斺攢鈹€ spec.md   # ADDED: Two-Factor Authentication
    鈹斺攢鈹€ notifications/
        鈹斺攢鈹€ spec.md   # ADDED: OTP email notification
```

auth/spec.md
```markdown
## ADDED Requirements
### Requirement: Two-Factor Authentication
...
```

notifications/spec.md
```markdown
## ADDED Requirements
### Requirement: OTP Email Notification
...
```

## 鏈€浣冲疄璺?

### 绠€鍗曚紭鍏?
- 榛樿浠ｇ爜涓嶈秴杩?100 琛?
- 鍗曟枃浠跺疄鐜帮紝鐩村埌璇佹槑涓嶈冻
- 娌℃湁鏄庣‘鐞嗙敱鏃堕伩鍏嶄娇鐢ㄦ鏋?
- 閫夋嫨鏃犺亰銆佺粡杩囬獙璇佺殑妯″紡

### 澶嶆潅鎬цЕ鍙戝櫒
浠呭湪浠ヤ笅鎯呭喌涓嬫坊鍔犲鏉傛€э細
- 鎬ц兘鏁版嵁鏄剧ず褰撳墠瑙ｅ喅鏂规澶參
- 鍏蜂綋鐨勮妯¤姹傦紙>1000 鐢ㄦ埛锛?100MB 鏁版嵁锛?
- 澶氫釜缁忚繃楠岃瘉鐨勭敤渚嬮渶瑕佹娊璞?

### 娓呮櫚寮曠敤
- 浣跨敤 `file.ts:42` 鏍煎紡琛ㄧず浠ｇ爜浣嶇疆
- 灏嗚鑼冨紩鐢ㄤ负 `specs/auth/spec.md`
- 閾炬帴鐩稿叧鍙樻洿鍜?PR

### 鍔熻兘鍛藉悕
- 浣跨敤鍔ㄨ瘝-鍚嶈瘝锛歚user-auth`銆乣payment-capture`
- 姣忎釜鍔熻兘鍗曚竴鐢ㄩ€?
- 10 鍒嗛挓鍙悊瑙ｈ鍒?
- 濡傛灉鎻忚堪闇€瑕?"AND"锛屽垯鎷嗗垎

### 鍙樻洿 ID 鍛藉悕
- 浣跨敤鐭í绾垮垎闅旂殑灏忓啓鍛藉悕锛岀畝鐭弿杩帮細`add-two-factor-auth`
- 浼樺厛浣跨敤鍔ㄨ瘝寮€澶寸殑鍓嶇紑锛歚add-`銆乣update-`銆乣remove-`銆乣refactor-`
- 纭繚鍞竴鎬э紱濡傛灉宸茶浣跨敤锛岃拷鍔?`-2`銆乣-3` 绛?

## 宸ュ叿閫夋嫨鎸囧崡

| 浠诲姟 | 宸ュ叿 | 鍘熷洜 |
|------|------|-----|
| 鎸夋ā寮忔煡鎵炬枃浠?| Glob | 蹇€熸ā寮忓尮閰?|
| 鎼滅储浠ｇ爜鍐呭 | Grep | 浼樺寲鐨勬鍒欐悳绱?|
| 璇诲彇鐗瑰畾鏂囦欢 | Read | 鐩存帴鏂囦欢璁块棶 |
| 鎺㈢储鏈煡鑼冨洿 | Task | 澶氭璋冩煡 |

## 閿欒鎭㈠

### 鍙樻洿鍐茬獊
1. 杩愯 `openspec list` 鏌ョ湅娲诲姩鍙樻洿
2. 妫€鏌ラ噸鍙犺鑼?
3. 涓庡彉鏇存墍鏈夎€呭崗璋?
4. 鑰冭檻鍚堝苟鎻愭

### 楠岃瘉澶辫触
1. 浣跨敤 `--strict` 鏍囧織杩愯
2. 妫€鏌?JSON 杈撳嚭浠ヨ幏鍙栬缁嗕俊鎭?
3. 楠岃瘉瑙勮寖鏂囦欢鏍煎紡
4. 纭繚鍦烘櫙鏍煎紡姝ｇ‘

### 缂哄皯涓婁笅鏂?
1. 棣栧厛闃呰 project.md
2. 妫€鏌ョ浉鍏宠鑼?
3. 鏌ョ湅鏈€杩戠殑褰掓。
4. 璇锋眰婢勬竻

## 蹇€熷弬鑰?

### 闃舵鎸囩ず鍣?
- `changes/` - 宸叉彁璁紝灏氭湭鏋勫缓
- `specs/` - 宸叉瀯寤哄苟閮ㄧ讲
- `archive/` - 宸插畬鎴愮殑鍙樻洿

### 鏂囦欢鐢ㄩ€?
- `proposal.md` - 涓轰粈涔堝拰浠€涔?
- `tasks.md` - 瀹炴柦姝ラ
- `design.md` - 鎶€鏈喅绛?
- `spec.md` - 闇€姹傚拰琛屼负

### CLI 瑕佺偣
```bash
openspec list              # 姝ｅ湪杩涜鐨勫伐浣滐紵
openspec show [item]       # 鏌ョ湅璇︽儏
openspec validate --strict # 姝ｇ‘鍚楋紵
openspec archive <change-id> [--yes|-y]  # 鏍囪瀹屾垚锛堟坊鍔?--yes 鐢ㄤ簬鑷姩鍖栵級
```

璁颁綇锛氳鑼冩槸浜嬪疄銆傚彉鏇存槸鎻愭銆備繚鎸佸畠浠悓姝ャ€
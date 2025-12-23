# 修复PO文件的编码问题，将GBK编码转换为UTF-8 with BOM

$filePath = "e:\Dropbox\GitHub\SutWxApp\SutWxApp\locales\sut-wechat-mini-zh_CN.po"

# 使用GBK编码读取文件内容
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::GetEncoding('GBK'))

# 修复已知的乱码文本
$content = $content -replace '璇峰厛鐧诲綍', '请先登录'
$content = $content -replace '绉垎濂栧姳鎴愬姛', '积分奖励成功'
$content = $content -replace '鍒嗕韩姝ら〉闈㈢粰濂藉弸', '分享此页面给朋友'
$content = $content -replace '閭€璇峰ソ鍙嬭幏鍙栫Н鍒?', '邀请好友获得积分'
$content = $content -replace '澶勭悊涓?..', '处理中..'
$content = $content -replace '绉垎', '积分'
$content = $content -replace '鎿嶄綔澶辫触', '操作失败'
$content = $content -replace '棰嗗彇濂栧姳澶辫触', '领取奖励失败'
$content = $content -replace '浠诲姟涓嶅瓨鍦?', '任务不存在'
$content = $content -replace '绛惧埌浠诲姟', '签到任务'
$content = $content -replace '璇勮浠诲姟', '评论任务'
$content = $content -replace '璇勪环浠诲姟', '评价任务'
$content = $content -replace '瀹屽杽璧勬枡浠诲姟', '完善资料任务'
$content = $content -replace '璐拱浠诲姟', '购买任务'
$content = $content -replace '璁㈠崟浠诲姟', '订单任务'
$content = $content -replace '鍏虫敞浠诲姟', '关注任务'
$content = $content -replace '鏀惰棌浠诲姟', '收藏任务'
$content = $content -replace '瀵艰埅澶辫触', '导航失败'
$content = $content -replace '浠诲姟杩涘害鏇存柊鎴愬姛', '任务进度更新成功'
$content = $content -replace '鎻愪氦浠诲姟杩涘害澶辫触', '提交任务进度失败'
$content = $content -replace '鏈懡鍚嶄换鍔?', '未命名任务'
$content = $content -replace '鏈夋柊鐨勫鍔卞彲浠ラ鍙?', '有新的奖励可领取'
$content = $content -replace '寮€鍚Н鍒嗕箣鏃咃紝鐣呬韩鏇村浼樻儬', '开启积分之旅，享受更多优惠'
$content = $content -replace '鑾峰彇浠诲姟璇︽儏澶辫触', '获取任务详情失败'
$content = $content -replace '绉垎浠诲姟', '积分任务'
$content = $content -replace '绉垎瑙勫垯', '积分规则'
$content = $content -replace '绉垎鍟嗗煄', '积分商城'
$content = $content -replace '鍏ㄩ儴', '全部'
$content = $content -replace '涓€娆℃€?', '一次性'
$content = $content -replace '姣忔棩', '每日'
$content = $content -replace '姣忓懆', '每周'
$content = $content -replace '姣忔湀', '每月'
$content = $content -replace '瀹屾垚鍚庝笉鍐嶆樉绀?', '完成后不再显示'
$content = $content -replace '姣忓ぉ鍙畬鎴愪竴娆?', '每天可完成一次'
$content = $content -replace '姣忓懆鍙畬鎴愪竴娆?', '每周可完成一次'
$content = $content -replace '姣忔湀鍙畬鎴愪竴娆?', '每月可完成一次'
$content = $content -replace '棰嗗彇濂栧姳', '领取奖励'
$content = $content -replace '绔嬪嵆瀹屾垚', '立即完成'
$content = $content -replace '鍘诲畬鎴?', '去完成'
$content = $content -replace '杩涘害: %\{current\}/%\{total\}', '进度: %{current}/%{total}'
$content = $content -replace '鏆傛棤绉垎浠诲姟', '暂无积分任务'
$content = $content -replace '璇风◢鍚嶄换鍔?', '请稍后重试'
$content = $content -replace '绉垎璁板綍', '积分记录'
$content = $content -replace '閲嶈瘯', '重试'
$content = $content -replace '鍏ㄩ儴浠诲姟', '全部任务'
$content = $content -replace '鏂版墜浠诲姟', '新手任务'
$content = $content -replace '鏃ュ父浠诲姟', '日常任务'
$content = $content -replace '姣忓懆浠诲姟', '每周任务'
$content = $content -replace '姣忔湀浠诲姟', '每月任务'
$content = $content -replace '宸插畬鎴?', '已完成'
$content = $content -replace '棰嗗彇濂栧姳', '领取奖励'
$content = $content -replace '鍘诲仛', '去做'
$content = $content -replace '娌℃湁浠诲姟', '没有任务'

# 保存为UTF-8 with BOM
[System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($true))

Write-Host "PO文件编码修复完成！"
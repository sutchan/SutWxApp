# 杞崲椤圭洰鏂囦欢缂栫爜涓?UTF8 with BOM锛屾崲琛岀 Unix LF
# 作者 Sut
# 鐗堟湰: 1.0.0
# 更新日期: 2025-11-30

# 瀹氫箟鏂囨湰鏂囦欢鎵╁睍鍚?$textExtensions = @(".js", ".json", ".md", ".wxml", ".wxss", ".po", ".pot", ".ps1", ".txt", ".code-workspace")

# 瀹氫箟瑕佹帓闄ょ殑鐩綍
$excludeDirs = ".git", "node_modules", "dist", "build"

Write-Host "寮€濮嬭浆鎹㈡枃浠剁紪鐮?.."

$success = 0
$failed = 0

# 浣跨敤Get-ChildItem鑾峰彇鎵€鏈夋枃浠讹紝鐒跺悗鍦╢oreach涓繃婊?Get-ChildItem -Path . -Recurse -File | ForEach-Object {
    $file = $_
    $ext = $file.Extension
    $fullPath = $file.FullName
    
    # 妫€鏌ユ槸鍚︿负鏂囨湰鏂囦欢
    if ($textExtensions -contains $ext) {
        # 妫€鏌ユ槸鍚﹀湪鎺掗櫎鐩綍涓?        $shouldExclude = $false
        foreach ($dir in $excludeDirs) {
            if ($fullPath -like "*\$dir\*") {
                $shouldExclude = $true
                break
            }
        }
        
        if (-not $shouldExclude) {
            try {
                # 璇诲彇鏂囦欢鍐呭
                $content = Get-Content -Path $fullPath -Raw
                
                # 杞崲鎹㈣绗︿负Unix LF
                $content = $content -replace "`r`n", "`n"
                
                # 鍐欏叆鏂囦欢锛屼娇鐢║TF8 with BOM
                [System.IO.File]::WriteAllText($fullPath, $content, [System.Text.UTF8Encoding]::new($true))
                
                $success++
                Write-Host "鉁?$($file.Name)" -ForegroundColor Green
            } catch {
                $failed++
                Write-Host "鉁?$($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
}

Write-Host "`n杞崲瀹屾垚:"
Write-Host "鎴愬姛: $success 涓枃浠? -ForegroundColor Green
Write-Host "澶辫触: $failed 涓枃浠? -ForegroundColor Red

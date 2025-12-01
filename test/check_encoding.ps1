# 妫€鏌ユ枃浠剁紪鐮佸拰鎹㈣绗︾殑鑴氭湰

$fileListPath = "e:\Dropbox\GitHub\SutWxApp\file_list.txt"
$reportPath = "e:\Dropbox\GitHub\SutWxApp\encoding_report.txt"

# 娓呯┖鎶ュ憡鏂囦欢
if (Test-Path $reportPath) {
    Remove-Item $reportPath
}

# 璇诲彇鏂囦欢鍒楄〃
$files = Get-Content $fileListPath

Write-Host "寮€濮嬫鏌ユ枃浠剁紪鐮佸拰鎹㈣绗?.."
Write-Host "鎬绘枃浠舵暟: $($files.Count)"

$errorCount = 0
$processedCount = 0

# 閬嶅巻姣忎釜鏂囦欢
foreach ($file in $files) {
    try {
        $processedCount++
        
        # 妫€鏌ユ枃浠舵槸鍚﹀瓨鍦?        if (-not (Test-Path $file -PathType Leaf)) {
            Write-Host "璺宠繃涓嶅瓨鍦ㄧ殑鏂囦欢: $file"
            continue
        }
        
        # 妫€鏌OM
        $bytes = Get-Content -LiteralPath $file -Encoding Byte -ReadCount 3 -TotalCount 3
        $hasBom = $bytes[0] -eq 0xef -and $bytes[1] -eq 0xbb -and $bytes[2] -eq 0xbf
        
        # 妫€鏌ユ崲琛岀
        $content = Get-Content -LiteralPath $file -Raw
        $hasCRLF = $content.Contains("`r`n")
        $hasLF = $content.Contains("`n")
        $lineEnding = if ($hasCRLF) { "Windows CRLF" } elseif ($hasLF) { "Unix LF" } else { "Unknown" }
        
        # 妫€鏌ョ紪鐮?        $reader = New-Object System.IO.StreamReader($file, [System.Text.Encoding]::Default, $true)
        $content = $reader.ReadToEnd()
        $detectedEncoding = $reader.CurrentEncoding.EncodingName
        $reader.Close()
        
        # 妫€鏌ユ槸鍚︾鍚堣鍒?        $isUTF8 = $detectedEncoding -like "*UTF-8*" -or $detectedEncoding -like "*utf-8*"
        $isValid = -not $hasBom -and $lineEnding -eq "Unix LF" -and $isUTF8
        
        if (-not $isValid) {
            $errorCount++
            Add-Content -Path $reportPath -Value "鏂囦欢: $file"
            Add-Content -Path $reportPath -Value "  缂栫爜: $detectedEncoding"
            Add-Content -Path $reportPath -Value "  BOM: $(if ($hasBom) { '瀛樺湪' } else { '涓嶅瓨鍦? })"
            Add-Content -Path $reportPath -Value "  鎹㈣绗? $lineEnding"
            Add-Content -Path $reportPath -Value "  鐘舵€? 涓嶇鍚堣鍒?
            Add-Content -Path $reportPath -Value ""
        }
        
        # 鏄剧ず杩涘害
        if ($processedCount % 10 -eq 0) {
            Write-Host "宸插鐞? $processedCount / $($files.Count)锛屽彂鐜伴棶棰? $errorCount"
        }
        
    } catch {
        Write-Host "澶勭悊鏂囦欢鏃跺嚭閿? $file - $_"
    }
}

Write-Host "妫€鏌ュ畬鎴?"
Write-Host "鎬绘枃浠舵暟: $($files.Count)"
Write-Host "宸插鐞? $processedCount"
Write-Host "鍙戠幇闂: $errorCount"
Write-Host "鎶ュ憡鏂囦欢: $reportPath"

if ($errorCount -gt 0) {
    Write-Host "璇锋煡鐪嬫姤鍛婃枃浠朵簡瑙ｈ缁嗕俊鎭€?
} else {
    Write-Host "鎵€鏈夋枃浠堕兘绗﹀悎缂栫爜瑙勫垯!"
}
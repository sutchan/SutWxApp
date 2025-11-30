# 检查文件编码和换行符的脚本

$fileListPath = "e:\Dropbox\GitHub\SutWxApp\file_list.txt"
$reportPath = "e:\Dropbox\GitHub\SutWxApp\encoding_report.txt"

# 清空报告文件
if (Test-Path $reportPath) {
    Remove-Item $reportPath
}

# 读取文件列表
$files = Get-Content $fileListPath

Write-Host "开始检查文件编码和换行符..."
Write-Host "总文件数: $($files.Count)"

$errorCount = 0
$processedCount = 0

# 遍历每个文件
foreach ($file in $files) {
    try {
        $processedCount++
        
        # 检查文件是否存在
        if (-not (Test-Path $file -PathType Leaf)) {
            Write-Host "跳过不存在的文件: $file"
            continue
        }
        
        # 检查BOM
        $bytes = Get-Content -LiteralPath $file -Encoding Byte -ReadCount 3 -TotalCount 3
        $hasBom = $bytes[0] -eq 0xef -and $bytes[1] -eq 0xbb -and $bytes[2] -eq 0xbf
        
        # 检查换行符
        $content = Get-Content -LiteralPath $file -Raw
        $hasCRLF = $content.Contains("`r`n")
        $hasLF = $content.Contains("`n")
        $lineEnding = if ($hasCRLF) { "Windows CRLF" } elseif ($hasLF) { "Unix LF" } else { "Unknown" }
        
        # 检查编码
        $reader = New-Object System.IO.StreamReader($file, [System.Text.Encoding]::Default, $true)
        $content = $reader.ReadToEnd()
        $detectedEncoding = $reader.CurrentEncoding.EncodingName
        $reader.Close()
        
        # 检查是否符合规则
        $isUTF8 = $detectedEncoding -like "*UTF-8*" -or $detectedEncoding -like "*utf-8*"
        $isValid = -not $hasBom -and $lineEnding -eq "Unix LF" -and $isUTF8
        
        if (-not $isValid) {
            $errorCount++
            Add-Content -Path $reportPath -Value "文件: $file"
            Add-Content -Path $reportPath -Value "  编码: $detectedEncoding"
            Add-Content -Path $reportPath -Value "  BOM: $(if ($hasBom) { '存在' } else { '不存在' })"
            Add-Content -Path $reportPath -Value "  换行符: $lineEnding"
            Add-Content -Path $reportPath -Value "  状态: 不符合规则"
            Add-Content -Path $reportPath -Value ""
        }
        
        # 显示进度
        if ($processedCount % 10 -eq 0) {
            Write-Host "已处理: $processedCount / $($files.Count)，发现问题: $errorCount"
        }
        
    } catch {
        Write-Host "处理文件时出错: $file - $_"
    }
}

Write-Host "检查完成!"
Write-Host "总文件数: $($files.Count)"
Write-Host "已处理: $processedCount"
Write-Host "发现问题: $errorCount"
Write-Host "报告文件: $reportPath"

if ($errorCount -gt 0) {
    Write-Host "请查看报告文件了解详细信息。"
} else {
    Write-Host "所有文件都符合编码规则!"
}
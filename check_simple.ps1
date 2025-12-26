# 简单的文件编码检查脚本
Write-Host "检查关键文件编码..."

# 检查指定的文档文件
$files = @(
    "docs\01-文档指南\00-统一格式规范.md",
    "docs\00-项目概览\01-项目简介.md",
    "openspec\project.md",
    "SutWxApp\locales\sut-wechat-mini.pot",
    "SutWxApp\locales\sut-wechat-mini-zh_CN.po"
)

foreach ($file in $files) {
    $fullPath = Join-Path $PWD.Path $file
    if (Test-Path $fullPath) {
        Write-Host "\n检查文件: $file"
        
        try {
            # 检查BOM
            $bytes = Get-Content -Path $fullPath -AsByteStream -ReadCount 3 -TotalCount 3
            if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
                Write-Host "  编码: UTF-8 with BOM"
            } else {
                Write-Host "  编码: UTF-8 without BOM"
            }
            
            # 检查行尾
            $content = Get-Content -Path $fullPath -Raw -Encoding UTF8
            if ($content -match "\r\n") {
                Write-Host "  行尾: CRLF"
            } elseif ($content -match "\n") {
                Write-Host "  行尾: LF"
            } else {
                Write-Host "  行尾: Unknown"
            }
            
        } catch {
            Write-Host "  错误: 无法读取文件 - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "\n文件不存在: $file" -ForegroundColor Yellow
    }
}

Write-Host "\n检查完成!"

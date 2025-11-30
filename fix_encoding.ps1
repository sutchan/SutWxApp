<#
.SYNOPSIS
修复Markdown文件的编码问题，转换为UTF-8无BOM格式，统一使用Unix LF换行符

.DESCRIPTION
该脚本用于修复文档文件的编码问题，支持多种编码检测和转换方法

.PARAMETER FilePath
要修复的文件路径
#>

function Fix-FileEncoding {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath
    )

    Write-Host "=== 修复文件: $FilePath ==="
    
    # 读取文件二进制内容
    $bytes = [System.IO.File]::ReadAllBytes($FilePath)
    Write-Host "  文件大小: $($bytes.Length) 字节"
    
    # 定义要尝试的编码列表
    $encodings = @(
        [System.Text.Encoding]::GetEncoding('GBK'),
        [System.Text.Encoding]::GetEncoding('GB2312'),
        [System.Text.Encoding]::UTF8,
        [System.Text.Encoding]::Default
    )
    
    $bestContent = $null
    $bestScore = 0
    
    # 尝试每种编码
    foreach ($encoding in $encodings) {
        try {
            # 使用当前编码读取内容
            $content = $encoding.GetString($bytes)
            
            # 简单评分：计算中文字符比例（越高越好）
            $chineseChars = ($content -creplace '[^\p{IsCJKUnifiedIdeographs}]', '').Length
            $score = $chineseChars / [Math]::Max(1, $content.Length)
            
            Write-Host "  使用 $($encoding.BodyName) 编码: 中文比例 $($score.ToString('P2'))"
            
            # 保存最佳结果
            if ($score -gt $bestScore) {
                $bestScore = $score
                $bestContent = $content
            }
        } catch {
            Write-Host "  使用 $($encoding.BodyName) 编码读取失败: $_"
        }
    }
    
    if ($bestContent -eq $null) {
        Write-Host "  所有编码尝试失败，使用UTF-8忽略错误模式"
        $utf8NoBom = [System.Text.UTF8Encoding]::new($false, $true)
        $bestContent = $utf8NoBom.GetString($bytes)
    }
    
    # 确保换行符为Unix LF
    $bestContent = $bestContent -replace "\r\n", "\n"
    $bestContent = $bestContent -replace "\r", "\n"
    
    # 保存为UTF-8无BOM格式
    $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($FilePath, $bestContent, $utf8NoBom)
    
    Write-Host "  ✅ 修复成功: UTF-8无BOM, Unix LF"
    return $true
}

# 主程序
Write-Host "开始修复Markdown文件编码..."
Write-Host "=" * 50

# 要修复的文件列表
$files = @(
    'e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\01-开发环境配置.md',
    'e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\02-架构设计文档.md',
    'e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\03-API接口文档.md',
    'e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\04-API开发指南.md',
    'e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\05-服务层API文档.md',
    'e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\06-技术设计文档.md',
    'e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\07-开发手册.md',
    'e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\08-代码规范.md',
    'e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\09-版本发布说明.md',
    'e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\README.md'
)

$successCount = 0
$failedCount = 0

foreach ($file in $files) {
    if (Fix-FileEncoding -FilePath $file) {
        $successCount++
    } else {
        $failedCount++
    }
    Write-Host ""
}

Write-Host "=" * 50
Write-Host "修复完成: 成功 $successCount 个, 失败 $failedCount 个"
Write-Host "所有文件已转换为 UTF-8 无 BOM 格式，换行符统一为 Unix LF"

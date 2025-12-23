# 文件名: check_encoding_simple.ps1
# 版本号: 1.0.0
# 更新日期: 2025-12-01
# 作者: Sut
# 描述: 检查并转换文件编码为UTF-8 with BOM，换行符为Unix LF

# 设置要检查的目录
$targetDir = "e:\Dropbox\GitHub\SutWxApp"

# 设置要排除的目录
$excludeDirs = @(".git", "node_modules", "dist", "build", ".trae")

# 设置要检查的文件扩展名
$includeExtensions = @(".js", ".json", ".wxss", ".wxml", ".md", ".po", ".pot")

# 统计信息
$totalFiles = 0
$fixedFiles = 0

# 获取所有要处理的文件
$files = Get-ChildItem -Path $targetDir -Recurse -File | Where-Object {
    $includeExtensions -contains $_.Extension -and 
    $excludeDirs -notcontains (Split-Path -Leaf $_.DirectoryName)
}

Write-Host "Found $($files.Count) files to check" -ForegroundColor Cyan

# 处理每个文件
foreach ($file in $files) {
    $totalFiles++
    $filePath = $file.FullName
    
    try {
        # 读取文件内容
        $content = [System.IO.File]::ReadAllText($filePath)
        
        # 转换换行符为LF
        $content = $content -replace "\r\n", "\n"
        
        # 写入文件，添加BOM
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
        
        $fixedFiles++
        Write-Host "Fixed: $filePath" -ForegroundColor Green
    } catch {
        Write-Host "Error processing $filePath: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 输出统计信息
Write-Host ""
Write-Host "=== Encoding Check Results ===" -ForegroundColor Yellow
Write-Host "Total files checked: $totalFiles" -ForegroundColor White
Write-Host "Files fixed: $fixedFiles" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Yellow

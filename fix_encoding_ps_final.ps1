# 修复docs目录下所有Markdown文件的编码问题
# 将文件转换为UTF-8无BOM格式，换行符统一为Unix LF

$docsDir = "e:\Dropbox\GitHub\SutWxApp\docs"
$mdFiles = Get-ChildItem -Path $docsDir -Recurse -Filter "*.md"

Write-Host "=== 开始修复docs目录下的Markdown文件编码 ==="
Write-Host "找到 $($mdFiles.Count) 个Markdown文件"
Write-Host ""

foreach ($file in $mdFiles) {
    $filePath = $file.FullName
    Write-Host "=== 处理文件: $filePath ==="
    
    try {
        # 使用Get-Content读取文件，自动检测编码
        $content = Get-Content -Path $filePath -Raw
        
        # 将Windows换行符转换为Unix换行符
        $content = $content -replace "\r\n", "\n"
        $content = $content -replace "\r", "\n"
        
        # 使用Set-Content写入文件，指定UTF-8无BOM编码
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
        
        Write-Host "  转换成功: UTF-8 No BOM，换行符: Unix LF"
    } catch {
        Write-Host "  转换失败: $_"
    }
    
    Write-Host ""
}

Write-Host "=== 所有文件处理完成 ==="
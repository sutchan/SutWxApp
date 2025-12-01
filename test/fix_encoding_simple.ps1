# 修复文档编码和换行符的简单脚本
$docsPath = "e:\Dropbox\GitHub\SutWxApp\docs"

# 获取所有.md文件
$mdFiles = Get-ChildItem -Path $docsPath -Recurse -Filter "*.md"

foreach ($file in $mdFiles) {
    Write-Host "处理文件: $($file.FullName)"
    
    try {
        # 读取文件内容，使用UTF-8编码
        $content = Get-Content -Path $file.FullName -Raw
        
        # 转换换行符为LF
        $content = $content -replace "\r\n", "\n"
        $content = $content -replace "\r", "\n"
        
        # 写入文件，使用UTF-8 with BOM编码
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        
        Write-Host "已修复: $($file.FullName)"
    } catch {
        Write-Error "处理 $($file.FullName) 时出错: $_"
    }
}

Write-Host "所有文件处理完成！"
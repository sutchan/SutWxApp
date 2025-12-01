# 修复文档编码的最终脚本
$docsPath = "e:\Dropbox\GitHub\SutWxApp\docs"
$mdFiles = Get-ChildItem -Path $docsPath -Recurse -Filter "*.md"

foreach ($file in $mdFiles) {
    Write-Host "处理文件: $($file.FullName)"
    
    try {
        # 读取文件字节
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        
        # 尝试用UTF-8解码
        $utf8Content = [System.Text.Encoding]::UTF8.GetString($bytes)
        
        # 检查是否包含大量乱码（问号）
        $questionMarkCount = ($utf8Content.ToCharArray() | Where-Object { $_ -eq '?' }).Count
        $isUtf8Valid = $questionMarkCount -lt $utf8Content.Length * 0.1
        
        $content = if ($isUtf8Valid) {
            $utf8Content
        } else {
            # 尝试用默认编码解码
            [System.Text.Encoding]::Default.GetString($bytes)
        }
        
        # 转换换行符为LF
        $content = $content -replace "\r\n", "\n"
        $content = $content -replace "\r", "\n"
        
        # 写入文件，使用UTF-8 with BOM
        [System.IO.File]::WriteAllText($file.FullName, $content, [System.Text.Encoding]::UTF8)
        
        Write-Host "已修复: $($file.FullName)"
    } catch {
        Write-Error "处理 $($file.FullName) 时出错: $_"
    }
}

Write-Host "所有文件处理完成！"
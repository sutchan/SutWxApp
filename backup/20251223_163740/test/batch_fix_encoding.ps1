# 批量修复文件编码和行endings
# 确保所有项目文件使用UTF-8 with BOM编码和Unix LF行endings

# 定义要处理的文件类型
$fileTypes = @('*.wxss', '*.js', '*.json', '*.wxml')

# 定义项目根目录
$projectRoot = 'e:\Dropbox\GitHub\SutWxApp\SutWxApp'

# 遍历所有要处理的文件
Get-ChildItem -Path $projectRoot -Recurse -Include $fileTypes -Exclude "node_modules/*", ".git/*", "test/*" | ForEach-Object {
    Write-Host "Processing: $($_.FullName)"
    
    try {
        # 读取文件内容
        $content = Get-Content -Path $_.FullName -Raw
        
        # 转换行endings为Unix LF
        $content = $content -replace "\r\n", "\n"
        
        # 添加UTF-8 BOM头
        $bom = [byte[]]@(0xef, 0xbb, 0xbf)
        $utf8Content = [System.Text.Encoding]::UTF8.GetBytes($content)
        $combined = $bom + $utf8Content
        
        # 写入文件
        [System.IO.File]::WriteAllBytes($_.FullName, $combined)
        
        Write-Host "✓ Fixed: $($_.FullName)"
    } catch {
        Write-Host "✗ Error processing $($_.FullName): $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "Batch processing completed!"
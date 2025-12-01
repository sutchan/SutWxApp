# 修复文档编码和换行符的脚本
$docsPath = "e:\Dropbox\GitHub\SutWxApp\docs"
$outputPath = "e:\Dropbox\GitHub\SutWxApp\fixed_docs"

# 创建输出目录
if (-not (Test-Path $outputPath)) {
    New-Item -ItemType Directory -Path $outputPath -Force
}

# 获取所有.md文件
$mdFiles = Get-ChildItem -Path $docsPath -Recurse -Filter "*.md"

# 支持的编码列表
$encodings = @(
    [System.Text.Encoding]::UTF8,
    [System.Text.Encoding]::Unicode,
    [System.Text.Encoding]::Default
)

# 处理每个文件
foreach ($file in $mdFiles) {
    Write-Host "处理文件: $($file.FullName)"
    
    # 读取文件字节
    $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
    
    # 检测文件编码
    $detectedEncoding = $null
    foreach ($encoding in $encodings) {
        try {
            $content = $encoding.GetString($bytes)
            # 简单验证：如果包含大量乱码字符（如连续的问号或不可打印字符），则不是正确编码
            $hasManyInvalidChars = ($content | Select-String -Pattern "\?{5,}" -Quiet) -or ($content | Select-String -Pattern "\p{Cc}{5,}" -Quiet)
            if (-not $hasManyInvalidChars) {
                $detectedEncoding = $encoding
                break
            }
        } catch {
            # 忽略解码错误
        }
    }
    
    if (-not $detectedEncoding) {
        $detectedEncoding = [System.Text.Encoding]::Default
        Write-Warning "无法确定 $($file.FullName) 的编码，使用默认编码"
    }
    
    # 读取文件内容
    $content = $detectedEncoding.GetString($bytes)
    
    # 转换换行符为LF
    $content = $content -replace "\r\n", "\n"
    $content = $content -replace "\r", "\n"
    
    # 构建输出文件路径
    $relativePath = $file.FullName.Substring($docsPath.Length)
    $outputFilePath = Join-Path -Path $outputPath -ChildPath $relativePath
    
    # 创建输出目录结构
    $outputDir = Split-Path -Path $outputFilePath -Parent
    if (-not (Test-Path $outputDir)) {
        New-Item -ItemType Directory -Path $outputDir -Force
    }
    
    # 写入文件（UTF-8 with BOM）
    [System.IO.File]::WriteAllText($outputFilePath, $content, [System.Text.Encoding]::UTF8)
    
    Write-Host "已修复: $($file.FullName) -> $outputFilePath"
}

Write-Host "所有文件处理完成！"
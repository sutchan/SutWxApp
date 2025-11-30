# Simple script to fix file encoding to UTF-8 without BOM and Unix LF

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

Write-Host "Start fixing encoding..."
Write-Host "=" * 50

$success = 0
$failed = 0

foreach ($file in $files) {
    Write-Host "Processing file: $file"
    try {
        # Read file with automatic encoding detection
        $reader = New-Object System.IO.StreamReader($file, [System.Text.Encoding]::Default, $true)
        $content = $reader.ReadToEnd()
        $detectedEncoding = $reader.CurrentEncoding
        $reader.Close()
        
        Write-Host "  Detected encoding: $detectedEncoding"
        
        # Convert line endings to Unix LF
        $content = $content -replace "\r\n", "\n"
        $content = $content -replace "\r", "\n"
        
        # Write as UTF-8 without BOM
        $utf8NoBom = [System.Text.UTF8Encoding]::new($false)
        [System.IO.File]::WriteAllText($file, $content, $utf8NoBom)
        
        Write-Host "  Fixed successfully"
        $success++
    } catch {
        Write-Host "  Failed: $_"
        $failed++
    }
    Write-Host ""
}

Write-Host "=" * 50
Write-Host "Fix completed: $success succeeded, $failed failed"
Write-Host "All files converted to UTF-8 without BOM, line endings to Unix LF"

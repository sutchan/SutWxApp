# 文件名: check_encoding.ps1
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
$bomFiles = 0
$crlfFiles = 0

# 遍历目录
function Process-Directory($dir) {
    # 排除指定目录
    if ($excludeDirs -contains (Split-Path -Leaf $dir)) {
        return
    }
    
    Write-Host "Processing directory: $dir" -ForegroundColor Cyan
    
    # 获取目录中的文件
    $files = Get-ChildItem -Path $dir -File | Where-Object {
        $includeExtensions -contains $_.Extension
    }
    
    foreach ($file in $files) {
        $totalFiles++
        $filePath = $file.FullName
        
        try {
            # 读取文件内容
            $content = Get-Content -Path $filePath -Raw
            $hasBom = $false
            $hasCrlf = $false
            
            # 检查BOM
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
                $hasBom = $true
            }
            
            # 检查换行符
            if ($content -match "\r\n") {
                $hasCrlf = $true
            }
            
            # 如果需要转换
            if (-not $hasBom -or $hasCrlf) {
                # 转换换行符为LF
                $content = $content -replace "\r\n", "\n"
                
                # 写入文件，添加BOM
                [System.IO.File]::WriteAllText($filePath, $content, [System.Text.Encoding]::UTF8)
                $fixedFiles++
                
                if (-not $hasBom) {
                    $bomFiles++
                }
                if ($hasCrlf) {
                    $crlfFiles++
                }
                
                Write-Host "Fixed: $filePath" -ForegroundColor Green
            }
        } catch {
            Write-Host "Error processing $filePath: $_" -ForegroundColor Red
        }
    }
    
    # 递归处理子目录
    $subDirs = Get-ChildItem -Path $dir -Directory
    foreach ($subDir in $subDirs) {
        Process-Directory $subDir.FullName
    }
}

# 开始处理
Write-Host "Starting encoding check and conversion..." -ForegroundColor Yellow
Write-Host "Target directory: $targetDir" -ForegroundColor Yellow
Write-Host "Excluded directories: $($excludeDirs -join ', ')" -ForegroundColor Yellow
Write-Host "Included extensions: $($includeExtensions -join ', ')" -ForegroundColor Yellow
Write-Host "" -ForegroundColor Yellow

Process-Directory $targetDir

# 输出统计信息
Write-Host "" -ForegroundColor Yellow
Write-Host "=== Encoding Check Results ===" -ForegroundColor Yellow
Write-Host "Total files checked: $totalFiles" -ForegroundColor White
Write-Host "Files fixed: $fixedFiles" -ForegroundColor Green
Write-Host "Files missing BOM: $bomFiles" -ForegroundColor Red
Write-Host "Files with CRLF: $crlfFiles" -ForegroundColor Red
Write-Host "==============================" -ForegroundColor Yellow

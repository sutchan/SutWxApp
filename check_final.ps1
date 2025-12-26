# 最终版文件编码检查脚本
Write-Host "检查关键文件编码..."

# 获取所有文本文件（排除二进制文件和指定目录）
$excludedDirs = @(".git", "backup", "node_modules", "dist", "build")
$excludedExts = @(".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot")

# 获取所有文件
$allFiles = Get-ChildItem -Recurse -File
$textFiles = @()

foreach ($file in $allFiles) {
    $shouldExclude = $false
    
    # 检查目录排除
    foreach ($dir in $excludedDirs) {
        if ($file.FullName -like "*$dir*") {
            $shouldExclude = $true
            break
        }
    }
    
    # 检查扩展名排除
    if (-not $shouldExclude) {
        $ext = $file.Extension.ToLower()
        foreach ($excludedExt in $excludedExts) {
            if ($ext -eq $excludedExt) {
                $shouldExclude = $true
                break
            }
        }
    }
    
    if (-not $shouldExclude) {
        $textFiles += $file
    }
}

Write-Host "`n共找到 $($textFiles.Count) 个文本文件需要检查"
Write-Host "=" * 60

$checked = 0
$problemFiles = @()

foreach ($file in $textFiles) {
    $checked++
    
    try {
        # 检查文件大小，跳过空文件
        if ($file.Length -eq 0) {
            continue
        }
        
        # 检查编码
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $encoding = "UTF-8 without BOM"
        
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $encoding = "UTF-8 with BOM"
        } elseif ($bytes.Length -ge 2) {
            if ($bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
                $encoding = "UTF-16 BE"
                $problemFiles += $file.FullName
            } elseif ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
                $encoding = "UTF-16 LE"
                $problemFiles += $file.FullName
            }
        }
        
        # 只显示有问题的文件
        if ($encoding -notlike "UTF-8*") {
            Write-Host "文件: $($file.FullName)"
            Write-Host "  编码: $encoding (应为 UTF-8)" -ForegroundColor Red
            Write-Host
        }
        
    } catch {
        # 忽略无法读取的文件
        continue
    }
}

Write-Host "=" * 60
if ($problemFiles.Count -eq 0) {
    Write-Host "✓ 所有检查的文件都是 UTF-8 编码!" -ForegroundColor Green
} else {
    Write-Host "✗ 发现 $($problemFiles.Count) 个文件编码有问题" -ForegroundColor Red
}

Write-Host "`n检查完成!"

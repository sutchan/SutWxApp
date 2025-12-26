# 简化的文件编码和行尾检查脚本
$excludedDirs = @(".git", "backup", "node_modules", "dist", "build")
$excludedExts = @(".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot")

Write-Host "检查文件编码和行尾序列..."
Write-Host "排除目录: $($excludedDirs -join ', ')"
Write-Host "排除扩展名: $($excludedExts -join ', ')"
Write-Host "========================================"

# 获取所有需要检查的文件
$allFiles = Get-ChildItem -Recurse -File
$filesToCheck = @()

foreach ($file in $allFiles) {
    $shouldExclude = $false
    
    # 检查是否在排除目录中
    foreach ($dir in $excludedDirs) {
        if ($file.FullName -like "*$dir*") {
            $shouldExclude = $true
            break
        }
    }
    
    # 检查是否是排除的扩展名
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
        $filesToCheck += $file
    }
}

$total = $filesToCheck.Count
$checked = 0
$problems = @()

foreach ($file in $filesToCheck) {
    $checked++
    Write-Progress -Activity "检查文件" -Status "$checked/$total" -PercentComplete ($checked/$total*100)
    
    try {
        # 读取文件内容
        $content = Get-Content -Path $file.FullName -Raw
        
        # 检查行尾
        $hasCRLF = $content -match "\r\n"
        $hasLF = $content -match "\n" -and -not $hasCRLF
        $lineEnding = if ($hasCRLF) { "CRLF" } elseif ($hasLF) { "LF" } else { "Unknown" }
        
        # 检查编码（使用BOM检测）
        $bytes = Get-Content -Path $file.FullName -AsByteStream -ReadCount 4 -TotalCount 4
        $encoding = "UTF-8 without BOM"
        
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $encoding = "UTF-8 with BOM"
        } elseif ($bytes.Length -ge 2) {
            if ($bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
                $encoding = "UTF-16 BE"
            } elseif ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
                $encoding = "UTF-16 LE"
            }
        }
        
        # 验证是否有问题
        $fileProblems = @()
        if ($encoding -notlike "UTF-8*") {
            $fileProblems += "编码: $encoding (应使用 UTF-8)"
        }
        if ($lineEnding -ne "CRLF") {
            $fileProblems += "行尾: $lineEnding (应使用 CRLF)"
        }
        
        if ($fileProblems.Count -gt 0) {
            $problems += [PSCustomObject]@{ 
                File = $file.FullName
                Encoding = $encoding
                LineEnding = $lineEnding
                Issues = $fileProblems
            }
        }
        
    } catch {
        Write-Host "无法检查文件: $($file.FullName) - 错误: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Progress -Activity "检查文件" -Completed
Write-Host "========================================"
Write-Host "检查完成: $checked/$total 个文件"

if ($problems.Count -gt 0) {
    Write-Host "发现 $($problems.Count) 个文件有问题:" -ForegroundColor Red
    Write-Host "========================================"
    foreach ($prob in $problems) {
        Write-Host "文件: $($prob.File)" -ForegroundColor Yellow
        Write-Host "  编码: $($prob.Encoding)"
        Write-Host "  行尾: $($prob.LineEnding)"
        Write-Host "  问题: $($prob.Issues -join ', ')"
        Write-Host
    }
} else {
    Write-Host "所有文件编码和行尾序列都正确!" -ForegroundColor Green
}

Write-Host "========================================"

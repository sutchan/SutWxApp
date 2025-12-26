# 检查文件编码和行尾序列脚本
$excludedDirectories = @(".git", "backup", "node_modules", "dist", "build")
$excludedExtensions = @(".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2", ".ttf", ".eot")

Write-Host "检查文件编码和行尾序列..."
Write-Host "排除目录: $($excludedDirectories -join ", ")"
Write-Host "排除扩展名: $($excludedExtensions -join ", ")"
Write-Host "=" * 80

# 获取所有文件
$files = Get-ChildItem -Recurse -File | Where-Object {
    # 排除指定目录
    $exclude = $false
    foreach ($dir in $excludedDirectories) {
        if ($_.FullName -like "*$dir*") {
            $exclude = $true
            break
        }
    }
    # 排除指定扩展名
    if (-not $exclude) {
        $ext = $_.Extension.ToLower()
        foreach ($excludedExt in $excludedExtensions) {
            if ($ext -eq $excludedExt) {
                $exclude = $true
                break
            }
        }
    }
    return -not $exclude
}

$totalFiles = $files.Count
$checkedFiles = 0
$problemFiles = @()

foreach ($file in $files) {
    $checkedFiles++
    Write-Progress -Activity "检查文件" -Status "$checkedFiles/$totalFiles" -PercentComplete ($checkedFiles / $totalFiles * 100)
    
    try {
        # 检查文件编码
        $encoding = [System.IO.File]::ReadAllBytes($file.FullName) | ForEach-Object { $_ -as [char] } | Out-String
        $encodingInfo = [System.Text.Encoding]::Default.GetEncoder()
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        
        # 检测BOM
        $hasBom = $false
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $fileEncoding = "UTF-8 with BOM"
            $hasBom = $true
        } elseif ($bytes.Length -ge 2) {
            if ($bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
                $fileEncoding = "UTF-16 BE"
            } elseif ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
                $fileEncoding = "UTF-16 LE"
            } else {
                $fileEncoding = "UTF-8 without BOM"
            }
        } else {
            $fileEncoding = "UTF-8 without BOM"
        }
        
        # 检查行尾序列
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $hasCRLF = $content.Contains("`r`n")
        $hasLF = $content.Contains("`n") -and -not $hasCRLF
        $lineEnding = if ($hasCRLF) { "CRLF" } elseif ($hasLF) { "LF" } else { "Unknown" }
        
        # 检查是否有问题
        $isProblem = $false
        $problems = @()
        
        if ($fileEncoding -ne "UTF-8 without BOM" -and $fileEncoding -ne "UTF-8 with BOM") {
            $isProblem = $true
            $problems += "编码: $fileEncoding (应为 UTF-8)"
        }
        
        if ($lineEnding -ne "CRLF") {
            $isProblem = $true
            $problems += "行尾: $lineEnding (应为 CRLF)"
        }
        
        if ($isProblem) {
            $problemFiles += [PSCustomObject]@{ 
                File = $file.FullName
                Encoding = $fileEncoding
                LineEnding = $lineEnding
                Problems = $problems
            }
        }
        
    } catch {
        Write-Host "无法检查文件: $($file.FullName) - 错误: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Progress -Activity "检查文件" -Completed
Write-Host "=" * 80
Write-Host "检查完成: $checkedFiles/$totalFiles 个文件"

if ($problemFiles.Count -gt 0) {
    Write-Host "发现 $($problemFiles.Count) 个文件有问题:" -ForegroundColor Red
    Write-Host "=" * 80
    foreach ($problemFile in $problemFiles) {
        Write-Host "文件: $($problemFile.File)" -ForegroundColor Yellow
        Write-Host "  编码: $($problemFile.Encoding)"
        Write-Host "  行尾: $($problemFile.LineEnding)"
        Write-Host "  问题: $($problemFile.Problems -join ", ")"
        Write-Host
    }
} else {
    Write-Host "所有文件编码和行尾序列都正确!" -ForegroundColor Green
}

Write-Host "=" * 80

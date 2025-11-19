<#
 * 检测文件编码
 * @param [string] $FilePath 文件路径
 * @returns [string] 编码类型：UTF8/UTF8-BOM/UTF16LE/UTF32LE/Unicode/ANSI
 #>
function Get-FileEncoding {
    param([string]$FilePath)
    $bytes = Get-Content -Encoding Byte -Path $FilePath -TotalCount 4
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xef -and $bytes[1] -eq 0xbb -and $bytes[2] -eq 0xbf) { return 'UTF8-BOM' }
    if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xfe -and $bytes[1] -eq 0xff) { return 'Unicode' }
    if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xff -and $bytes[1] -eq 0xfe) { return 'UTF16LE' }
    if ($bytes.Length -ge 4 -and $bytes[0] -eq 0x00 -and $bytes[1] -eq 0x00 -and $bytes[2] -eq 0xfe -and $bytes[3] -eq 0xff) { return 'UTF32BE' }
    if ($bytes.Length -ge 4 -and $bytes[0] -eq 0xff -and $bytes[1] -eq 0xfe -and $bytes[2] -eq 0x00 -and $bytes[3] -eq 0x00) { return 'UTF32LE' }
    try {
        $content = [Text.Encoding]::UTF8.GetString($bytes)
        if (-not $content.Contains([char]0x00)) { return 'UTF8' }
    } catch {}
    return 'ANSI'
}

<#
 * 统一行尾为 LF
 * @param [string] $Text 文本内容
 * @returns [string] 转换后的文本
 #>
function Normalize-LineEndings {
    param([string]$Text)
    $normalized = $Text -replace "\r\n", "\n"
    $normalized = $normalized -replace "\r", "\n"
    return $normalized
}

<#
 * 统计字符串中的中文字符数量
 * @param [string] $Text 文本
 * @returns [int] 中文字符计数
 #>
function Count-CJKChars {
    param([string]$Text)
    $count = 0
    foreach ($ch in $Text.ToCharArray()) {
        $code = [int][char]$ch
        if (($code -ge 0x4E00 -and $code -le 0x9FFF) -or ($code -ge 0x3400 -and $code -le 0x4DBF)) { $count++ }
    }
    return $count
}

<#
 * 尝试修复常见“乱码”（GBK/UTF-8 错误解码）
 * 策略：
 * 1) 先将现有字符串按 GBK 编码为字节，再按 UTF-8 解码
 * 2) 反向：按 UTF-8 编码为字节，再按 GBK 解码
 * 选择中文命中率更高的结果
 * @param [string] $Text 文本
 * @returns [string] 修复后的文本
 #>
function Try-FixMojibake {
    param([string]$Text)
    $gbk = [System.Text.Encoding]::GetEncoding(936)
    $utf8 = [System.Text.Encoding]::UTF8
    $originalScore = Count-CJKChars -Text $Text
    try {
        $bytesA = $gbk.GetBytes($Text)
        $fixA = $utf8.GetString($bytesA)
        $scoreA = Count-CJKChars -Text $fixA
    } catch { $fixA = $Text; $scoreA = 0 }
    try {
        $bytesB = $utf8.GetBytes($Text)
        $fixB = $gbk.GetString($bytesB)
        $scoreB = Count-CJKChars -Text $fixB
    } catch { $fixB = $Text; $scoreB = 0 }
    $best = $Text
    $bestScore = $originalScore
    if ($scoreA -gt $bestScore) { $best = $fixA; $bestScore = $scoreA }
    if ($scoreB -gt $bestScore) { $best = $fixB; $bestScore = $scoreB }
    return $best
}

<#
 * 修复文件编码与常见乱码
 * - 去除 BOM
 * - 将 ANSI/UTF16/UTF32 转为 UTF-8 无 BOM
 * - 统一行尾为 LF
 * @param [string] $FilePath 文件路径
 #>
function Fix-FileEncoding {
    param([string]$FilePath)
    try {
        $bytesAll = [System.IO.File]::ReadAllBytes($FilePath)
        $encUtf8 = [System.Text.Encoding]::UTF8
        $encUtf16 = [System.Text.Encoding]::Unicode
        $encUtf16BE = [System.Text.Encoding]::BigEndianUnicode
        $encGbk = [System.Text.Encoding]::GetEncoding(936)
        $candidates = @(
            $encUtf8.GetString($bytesAll),
            $encUtf16.GetString($bytesAll),
            $encUtf16BE.GetString($bytesAll),
            $encGbk.GetString($bytesAll)
        )
        $best = $candidates[0]
        $bestScore = Count-CJKChars -Text $best
        foreach ($cand in $candidates) {
            $score = Count-CJKChars -Text $cand
            if ($score -gt $bestScore) { $best = $cand; $bestScore = $score }
        }
        $content = $best -replace '^\uFEFF','' -replace '^锘?', '' -replace '^\x00+', '' -replace '^\xFF\xFE', ''
        $content = Normalize-LineEndings -Text $content
        $content = Try-FixMojibake -Text $content
        # 使用字节写入 UTF-8（无 BOM）以兼容 PowerShell 5
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($content)
        [System.IO.File]::WriteAllBytes($FilePath, $bytes)
    } catch {
        Write-Output "修复失败: $FilePath - $($_.Exception.Message)"
    }
}

<#
 * 获取需要处理的文本文件列表
 * - 排除二进制与产物目录
 * @param [string] $Root 根目录
 * @returns [System.IO.FileInfo[]] 文件列表
 #>
function Get-TargetFiles {
    param([string]$Root)
    $excludes = @('node_modules','coverage','dist','build','.git')
    $patterns = @('*.js','*.jsx','*.ts','*.tsx','*.json','*.wxml','*.wxss','*.css','*.scss','*.html','*.xml','*.yml','*.yaml','*.php','*.md','*.txt')
    $all = @()
    foreach ($p in $patterns) {
        $items = Get-ChildItem -Path $Root -Recurse -File -Filter $p -ErrorAction SilentlyContinue
        foreach ($f in $items) {
            $skip = $false
            foreach ($ex in $excludes) { if ($f.FullName -like "*\$ex*") { $skip = $true; break } }
            if (-not $skip) { $all += $f }
        }
    }
    return $all | Sort-Object FullName -Unique
}

<#
 * 批量修复项目编码与乱码
 * @param [string[]] $Roots 需处理的根目录集合
 #>
function Fix-ProjectEncodings {
    param([string[]]$Roots)
    $count = 0
    foreach ($root in $Roots) {
        $files = Get-TargetFiles -Root $root
        foreach ($file in $files) { Fix-FileEncoding -FilePath $file.FullName; $count++ }
    }
    Write-Output "已处理文件总数: $count"
}

# 执行项目修复
$projectRoots = @(
    'e:\Dropbox\GitHub\SutWxApp\SutWxApp',
    'e:\Dropbox\GitHub\SutWxApp\sut-wechat-mini'
)
Fix-ProjectEncodings -Roots $projectRoots
Write-Output "Encoding fix done: UTF-8 no BOM, LF"
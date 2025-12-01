# 妫€鏌ユ枃浠剁紪鐮佺殑鑴氭湰

$file = 'E:\Dropbox\GitHub\SutWxApp\SutWxApp\utils\i18n\sut-wechat-mini-zh_CN.json'

# 浣跨敤.NET鐨凟ncoding绫绘娴嬫枃浠剁紪鐮?$bytes = [System.IO.File]::ReadAllBytes($file)
$encoding = [System.Text.Encoding]::UTF8
$detectedEncoding = [System.Text.Encoding]::GetEncoding(0)

# 灏濊瘯浣跨敤UTF-8瑙ｇ爜
$utf8Content = $encoding.GetString($bytes)
$isUTF8 = $true

try {
    # 灏濊瘯灏哢TF-8鍐呭杞崲鍥炲瓧鑺傦紝鐒跺悗鍐嶈浆鎹㈠洖瀛楃涓诧紝楠岃瘉鏄惁鏃犳崯
    $testBytes = $encoding.GetBytes($utf8Content)
    $testContent = $encoding.GetString($testBytes)
    if ($utf8Content -ne $testContent) {
        $isUTF8 = $false
    }
} catch {
    $isUTF8 = $false
}

Write-Host "File: $file"
Write-Host "  Detected as UTF-8: $isUTF8"

# Check BOM
$hasBom = $bytes.Length -ge 3 -and $bytes[0] -eq 0xef -and $bytes[1] -eq 0xbb -and $bytes[2] -eq 0xbf
Write-Host "  BOM: $(if ($hasBom) { 'Yes' } else { 'No' })"

# Check line endings
$content = [System.IO.File]::ReadAllText($file)
$hasCRLF = $content.Contains("`r`n")
$hasLF = $content.Contains("`n")
$lineEnding = if ($hasCRLF) { "Windows CRLF" } elseif ($hasLF) { "Unix LF" } else { "Unknown" }
Write-Host "  Line Endings: $lineEnding"

# Check if it meets the rules
$isValid = -not $hasBom -and $lineEnding -eq "Unix LF" -and $isUTF8
Write-Host "  Compliant: $isValid"
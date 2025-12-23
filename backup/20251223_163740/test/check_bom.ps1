# 检查文件是否有UTF-8 BOM
$filePath = "e:\Dropbox\GitHub\SutWxApp\SutWxApp\locales\sut-wechat-mini-zh_CN.po"

$bytes = [System.IO.File]::ReadAllBytes($filePath)
$bom = [System.Text.Encoding]::UTF8.GetPreamble()

if ($bytes.Length -ge $bom.Length) {
    $hasBom = $true
    for ($i = 0; $i -lt $bom.Length; $i++) {
        if ($bytes[$i] -ne $bom[$i]) {
            $hasBom = $false
            break
        }
    }
    if ($hasBom) {
        Write-Host "文件有UTF-8 BOM"
    } else {
        Write-Host "文件没有BOM"
        # 添加BOM
        $content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
        [System.IO.File]::WriteAllText($filePath, $content, [System.Text.UTF8Encoding]::new($true))
        Write-Host "已添加UTF-8 BOM"
    }
} else {
    Write-Host "文件太短，无法包含BOM"
}
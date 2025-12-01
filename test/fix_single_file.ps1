# 修复单个文件的编码
$filePath = "e:\Dropbox\GitHub\SutWxApp\docs\00-项目概览\01-项目简介.md"

# 读取文件字节
$bytes = [System.IO.File]::ReadAllBytes($filePath)

# 尝试不同的编码
$encodings = @(
    @{ Name = "UTF-8"; Encoding = [System.Text.Encoding]::UTF8 },
    @{ Name = "UTF-8 with BOM"; Encoding = [System.Text.Encoding]::UTF8 },
    @{ Name = "Default"; Encoding = [System.Text.Encoding]::Default },
    @{ Name = "GBK"; Encoding = [System.Text.Encoding]::GetEncoding(936) },
    @{ Name = "GB2312"; Encoding = [System.Text.Encoding]::GetEncoding(20936) }
)

foreach ($enc in $encodings) {
    try {
        $content = $enc.Encoding.GetString($bytes)
        Write-Host "=== 尝试 $($enc.Name) 编码 ==="
        Write-Host $content.Substring(0, [Math]::Min(200, $content.Length))
        Write-Host "====================="
    } catch {
        Write-Host "=== $($enc.Name) 编码解码失败 ==="
    }
}
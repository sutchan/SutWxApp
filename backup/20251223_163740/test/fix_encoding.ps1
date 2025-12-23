# 修复特定文件的编码问题，从GBK转换为UTF-8 with BOM
$filePath = "e:\Dropbox\GitHub\SutWxApp\docs\08-TODO计划\02-项目TODO清单.md"

# 使用GBK编码读取文件内容
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::GetEncoding('GBK'))

# 使用UTF-8 with BOM编码写入文件，确保Unix LF行结束符
$utf8Bom = [System.Text.UTF8Encoding]::new($true)
[System.IO.File]::WriteAllText($filePath, $content, $utf8Bom)

# 输出修复结果
Write-Host "文件编码修复完成: $filePath"
Write-Host "已转换为UTF-8 with BOM格式，使用Unix LF行结束符"
# 修复文件编码和换行符的PowerShell脚本
# 目标：将文件转换为UTF-8 with BOM编码，换行符统一为Unix LF

# 设置要处理的文件列表
$files = @(
    "e:\Dropbox\GitHub\SutWxApp\docs\02-管理员指南\01-环境搭建.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\02-管理员指南\02-系统配置.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\02-管理员指南\03-权限管理.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\02-管理员指南\README.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\01-开发环境配置.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\02-架构设计文档.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\03-API接口文档.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\04-API开发指南.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\05-服务层API文档.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\06-技术设计文档.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\07-开发手册.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\08-代码规范.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\09-版本发布说明.md",
    "e:\Dropbox\GitHub\SutWxApp\docs\03-开发者指南\README.md"
)

# 遍历每个文件进行处理
foreach ($file in $files) {
    Write-Host "正在处理文件: $file"
    
    try {
        # 使用.NET方法读取文件内容，自动检测编码
        $content = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::Default)
        
        # 转换换行符为Unix LF
        $content = $content -replace "\r\n", "\n"
        $content = $content -replace "\r", "\n"
        
        # 写入文件，使用UTF-8 with BOM编码
        [System.IO.File]::WriteAllText($file, $content, [System.Text.Encoding]::UTF8)
        
        Write-Host "  ✅ 处理成功"
    } catch {
        Write-Host "  ❌ 处理失败: $_"
    }
}

Write-Host "\n所有文件处理完成！"
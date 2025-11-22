# PowerShell script to update version, sync file headers, and manage version history

# Define project root and version history file
$projectRoot = "e:\\Dropbox\\GitHub\\SutWxApp"
$packageJsonPath = Join-Path $projectRoot "package.json"
$versionHistoryPath = Join-Path $projectRoot "docs\\version_history.md"

# Function to get current date in YYYY-MM-DD format
function Get-CurrentDate {
    return (Get-Date -Format "yyyy-MM-dd")
}

# Function to read and update package.json version
function Update-PackageJsonVersion {
    param (
        [string]$packageJsonPath
    )

    $packageJson = Get-Content $packageJsonPath | ConvertFrom-Json
    $currentVersion = $packageJson.version
    $versionParts = $currentVersion.Split('.')
    $major = [int]$versionParts[0]
    $minor = [int]$versionParts[1]
    $patch = [int]$versionParts[2] + 1 # Increment PATCH version

    $newVersion = "$major.$minor.$patch"
    $packageJson.version = $newVersion
    $packageJson | ConvertTo-Json -Depth 100 | Set-Content $packageJsonPath -Encoding UTF8 -Force

    Write-Host "Updated package.json version from $currentVersion to $newVersion"
    return $newVersion
}

# Function to update file headers
function Update-FileHeaders {
    param (
        [string]$filePath,
        [string]$newVersion,
        [string]$updateDate
    )

    $content = Get-Content $filePath -Raw -Encoding UTF8
    $fileName = Split-Path $filePath -Leaf

    # Define header patterns for different file types
    $jsHeaderPattern = "(?s)(^/\*\*.*?@version\s+[\d.]+\s*.*?@date\s+[\d-]+.*?\*/\s*)"
    $cssHeaderPattern = "(?s)(^/\*.*?@version\s+[\d.]+\s*.*?@date\s+[\d-]+.*?\*/\s*)"
    $wxmlHeaderPattern = "(?s)(^<!--.*?@version\s+[\d.]+\s*.*?@date\s+[\d-]+.*?-->\s*)"
    $jsonHeaderPattern = "(?s)(^//.*?@version\s+[\d.]+\s*.*?@date\s+[\d-]+.*?\n)" # JSON usually doesn't have multi-line comments, so single line

    $newJsHeader = @"
/**
 * 文件名: $fileName
 * @version $newVersion
 * @date $updateDate
 */
"@


    $newCssHeader = @"
/*
 * 文件名: $fileName
 * @version $newVersion
 * @date $updateDate
 */
"@
    $newWxmlHeader = @"
<!--
 * 文件名: $fileName
 * @version $newVersion
 * @date $updateDate
-->
"@

    $newJsonHeader = @"
// 文件名: $fileName
// @version $newVersion
// @date $updateDate
"@


    $updated = $false
    switch ($fileName) {
        { $_.EndsWith(".js") } {
            if ($content -match $jsHeaderPattern) {
                $content = $content -replace $jsHeaderPattern, $newJsHeader
            } else {
                $content = $newJsHeader + "`n" + $content
            }
            $updated = $true
        }
        { $_.EndsWith(".css") -or $_.EndsWith(".wxss") } {
            if ($content -match $cssHeaderPattern) {
                $content = $content -replace $cssHeaderPattern, $newCssHeader
            } else {
                $content = $newCssHeader + "`n" + $content
            }
            $updated = $true
        }
        { $_.EndsWith(".wxml") } {
            if ($content -match $wxmlHeaderPattern) {
                $content = $content -replace $wxmlHeaderPattern, $newWxmlHeader
            } else {
                $content = $newWxmlHeader + "`n" + $content
            }
            $updated = $true
        }
        { $_.EndsWith(".json") } {
            # JSON files are tricky with comments. For now, we'll add a single-line comment at the top if not present.
            # If a JSON file already has a comment, we'll try to update it.
            if ($content -match $jsonHeaderPattern) {
                $content = $content -replace $jsonHeaderPattern, $newJsonHeader
            } elseif ($content.Trim() -ne "") {
                $content = $newJsonHeader + "`n" + $content
            } else {
                $content = $newJsonHeader + $content
            }
            $updated = $true
        }
    }

    if ($updated) {
        Set-Content $filePath $content -Encoding UTF8 -Force
        Write-Host "Updated header for $fileName"
    }
}

# Function to update version history
function Update-VersionHistory {
    param (
        [string]$versionHistoryPath,
        [string]$newVersion,
        [string]$updateDate
    )

    $historyContent = ""
    if (Test-Path $versionHistoryPath) {
        $historyContent = Get-Content $versionHistoryPath -Raw -Encoding UTF8
    }

    $newEntry = "## Version $newVersion - $updateDate`n`n- 自动版本更新：PATCH 版本号递增。`n- 文件头部注释同步更新。"


    # Add new entry to the top of the history file, after the main title if it exists
    $historyContent = "# 版本历史`n`n$newEntry`n" + $historyContent.Substring($historyContent.IndexOf("`n") + 1)

    Set-Content $versionHistoryPath $historyContent -Encoding UTF8 -Force
    Write-Host "Updated version history for $newVersion"
}

# Main script logic
try {
    $newVersion = Update-PackageJsonVersion -packageJsonPath $packageJsonPath
    $updateDate = Get-CurrentDate

    # Get all relevant code files
    $codeFiles = Get-ChildItem $projectRoot -Recurse -Include "*.js", "*.json", "*.wxss", "*.wxml", "*.css" | Where-Object {
        $_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "coverage" -and $_.FullName -notmatch ".git" -and $_.FullName -notmatch ".trae" -and $_.FullName -notmatch "docs"
    }

    foreach ($file in $codeFiles) {
        Update-FileHeaders -filePath $file.FullName -newVersion $newVersion -updateDate $updateDate
    }

    Update-VersionHistory -versionHistoryPath $versionHistoryPath -newVersion $newVersion -updateDate $updateDate

    Write-Host "Version management process completed successfully."
} catch {
    Write-Error "An error occurred during version management: $($_.Exception.Message | Out-String)."
    exit 1
}
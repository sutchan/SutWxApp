# Check for garbled Chinese text in all files
# Output list of files with garbled text

Write-Host "Starting garbled text check..."
Write-Host "=" * 60

$garbledFiles = @()

# Find all relevant files
$files = Get-ChildItem -Recurse -File | Where-Object {
    $_.Extension -in '.md', '.js', '.json', '.wxss', '.wxml', '.wxs' -and
    $_.FullName -notlike '*node_modules*' -and
    $_.FullName -notlike '*dist*' -and
    $_.FullName -notlike '*build*'
}

foreach ($file in $files) {
    try {
        # Read file content with auto-detection
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        $content = [System.Text.Encoding]::UTF8.GetString($bytes)
        
        # Check for typical garbled text patterns (non-UTF8 sequences)
        if ($content -match '[\x80-\xFF]{3,}') {
            # Try to read with different encodings to confirm
            $gbkContent = [System.Text.Encoding]::GetEncoding('GBK').GetString($bytes)
            if ($gbkContent -match '[\x80-\xFF]{3,}') {
                $garbledFiles += $file.FullName
                Write-Host "Garbled text found: $($file.FullName)"
            }
        }
    }
    catch {
        Write-Host "Failed to read file: $($file.FullName) - $($_.Exception.Message)"
    }
}

Write-Host "=" * 60
Write-Host "Check completed!"
Write-Host "Found $($garbledFiles.Count) files with garbled text:"

foreach ($garbledFile in $garbledFiles) {
    Write-Host "- $garbledFile"
}

# Output to file
$garbledFiles | Out-File -FilePath "e:\Dropbox\GitHub\SutWxApp\test\garbled_files.txt" -Encoding UTF8
Write-Host ""
Write-Host "Garbled files list saved to: e:\Dropbox\GitHub\SutWxApp\test\garbled_files.txt"
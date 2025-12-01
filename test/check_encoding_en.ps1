# Script to check file encoding and line endings

$fileListPath = "e:\Dropbox\GitHub\SutWxApp\file_list.txt"
$reportPath = "e:\Dropbox\GitHub\SutWxApp\encoding_report.txt"

# Clear report file if it exists
if (Test-Path $reportPath) {
    Remove-Item $reportPath
}

# Read file list
$files = Get-Content $fileListPath

Write-Host "Starting to check file encoding and line endings..."
Write-Host "Total files: $($files.Count)"

$errorCount = 0
$processedCount = 0

# Iterate through each file
foreach ($file in $files) {
    try {
        $processedCount++
        
        # Check if file exists
        if (-not (Test-Path $file -PathType Leaf)) {
            Write-Host "Skipping non-existent file: $file"
            continue
        }
        
        # Check for BOM
        $bytes = Get-Content -LiteralPath $file -Encoding Byte -ReadCount 3 -TotalCount 3
        $hasBom = $bytes[0] -eq 0xef -and $bytes[1] -eq 0xbb -and $bytes[2] -eq 0xbf
        
        # Check line endings
        $content = Get-Content -LiteralPath $file -Raw
        $hasCRLF = $content.Contains("`r`n")
        $hasLF = $content.Contains("`n")
        $lineEnding = if ($hasCRLF) { "Windows CRLF" } elseif ($hasLF) { "Unix LF" } else { "Unknown" }
        
        # Check encoding
        $reader = New-Object System.IO.StreamReader($file, [System.Text.Encoding]::Default, $true)
        $content = $reader.ReadToEnd()
        $detectedEncoding = $reader.CurrentEncoding.EncodingName
        $reader.Close()
        
        # Check if it meets the rules
        $isUTF8 = $detectedEncoding -like "*UTF-8*" -or $detectedEncoding -like "*utf-8*"
        $isValid = -not $hasBom -and $lineEnding -eq "Unix LF" -and $isUTF8
        
        if (-not $isValid) {
            $errorCount++
            Add-Content -Path $reportPath -Value "File: $file"
            Add-Content -Path $reportPath -Value "  Encoding: $detectedEncoding"
            Add-Content -Path $reportPath -Value "  BOM: $(if ($hasBom) { 'Yes' } else { 'No' })"
            Add-Content -Path $reportPath -Value "  Line Endings: $lineEnding"
            Add-Content -Path $reportPath -Value "  Status: Not Compliant"
            Add-Content -Path $reportPath -Value ""
        }
        
        # Show progress
        if ($processedCount % 10 -eq 0) {
            Write-Host "Processed: $processedCount / $($files.Count), Issues found: $errorCount"
        }
        
    } catch {
        Write-Host "Error processing file: $file - $_"
    }
}

Write-Host "Check completed!"
Write-Host "Total files: $($files.Count)"
Write-Host "Processed: $processedCount"
Write-Host "Issues found: $errorCount"
Write-Host "Report file: $reportPath"

if ($errorCount -gt 0) {
    Write-Host "Please check the report file for details."
} else {
    Write-Host "All files comply with encoding rules!"
}
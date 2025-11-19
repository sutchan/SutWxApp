function Out-FileUtf8NoBom {
    param(
        [Parameter(Mandatory=$true)]
        [string]$FilePath,

        [Parameter(Mandatory=$true)]
        [string]$Content
    )
    # Write content to a temporary file with UTF8 encoding
    $Content | Out-File -FilePath $FilePath -Encoding UTF8 -Force

    # Read the file content, remove BOM, and write back
    $bytes = [System.IO.File]::ReadAllBytes($FilePath)
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        # BOM detected, remove it
        $newBytes = New-Object byte[] ($bytes.Length - 3)
        [System.Array]::Copy($bytes, 3, $newBytes, 0, $bytes.Length - 3)
        [System.IO.File]::WriteAllBytes($FilePath, $newBytes)
    }
}

$projectRoot = "e:\Dropbox\GitHub\SutWxApp\SutWxApp"
$fileTypes = @("*.js", "*.json", "*.wxss")

foreach ($fileType in $fileTypes) {
    Get-ChildItem -Path $projectRoot -Recurse -Include $fileType | ForEach-Object {
        $file = $_.FullName
        try {
            # Read content, convert newlines, then write back
            $content = (Get-Content -Path $file -Raw) -replace "`r`n", "`n"
            Out-FileUtf8NoBom -FilePath $file -Content $content
            Write-Host "Converted ${file} to UTF-8 No BOM with Unix LF"
        } catch {
            Write-Host "Error converting ${file}: $($_.Exception.Message)"
        }
    }
}
$installDir = [System.IO.Path]::Combine($env:LOCALAPPDATA, 'ArchaeoPhD')
Get-Process -Name ArchaeoPhD -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Milliseconds 1200

# Copy to root dist
$rootDist = Join-Path $installDir 'dist'
if (-not (Test-Path $rootDist)) {
    New-Item -ItemType Directory -Path $rootDist -Force
}
Copy-Item 'desktop\dist\*' $rootDist -Recurse -Force
Write-Output "Copied to $rootDist"

# Also copy to app\dist if exists
$appDist = Join-Path $installDir 'app\dist'
if (Test-Path (Join-Path $installDir 'app')) {
    Copy-Item 'desktop\dist\*' $appDist -Recurse -Force
}

# Update EXE
Copy-Item 'desktop\release\ArchaeoPhD.exe' (Join-Path $installDir 'ArchaeoPhD.exe') -Force
Write-Output "Copied ArchaeoPhD.exe"

# Launch application with correct working directory
Start-Process -FilePath (Join-Path $installDir 'ArchaeoPhD.exe') -WorkingDirectory $installDir
Start-Sleep -Seconds 1

$p = Get-Process -Name ArchaeoPhD -ErrorAction SilentlyContinue
if ($p) {
    Write-Output ("Running ArchaeoPhD PID: {0}" -f $p.Id)
} else {
    Write-Output "Process not detected immediately"
}

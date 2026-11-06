$installDir = [System.IO.Path]::Combine($env:LOCALAPPDATA, 'ArchaeoPhD')
if (Test-Path $installDir) {
    Get-Process -Name ArchaeoPhD -ErrorAction SilentlyContinue | Stop-Process -Force
    Start-Sleep -Milliseconds 300
    Copy-Item 'desktop\release\ArchaeoPhD.exe' (Join-Path $installDir 'ArchaeoPhD.exe') -Force
    if (Test-Path (Join-Path $installDir 'app\dist')) {
        Copy-Item 'desktop\dist\*' (Join-Path $installDir 'app\dist') -Recurse -Force
    }
    Remove-Item (Join-Path $installDir 'app\build_signature.txt') -Force -ErrorAction SilentlyContinue
    Write-Output "Synchronized to installed directory successfully!"
} else {
    Write-Output "Install directory does not exist."
}

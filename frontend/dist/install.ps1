# ==============================================================================
# 🎨 Favi Installer — Windows PowerShell One-Liner Setup
# Usage:
#   irm https://raw.githubusercontent.com/shlok377/favicon/master/install.ps1 | iex
# ==============================================================================

Write-Host "====================================================================" -ForegroundColor Blue
Write-Host "   🎨 Welcome to Favi — Favicon & Social Asset Generator" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Blue
Write-Host ""

$DesktopPath = [Environment]::GetFolderPath('Desktop')
$InstallDir = Join-Path $DesktopPath "Favi"
$ZipUrl = "https://github.com/shlok377/favicon/archive/refs/heads/master.zip"
$TempZip = Join-Path $env:TEMP "favi-installer.zip"

Write-Host "[1/4] 📥 Downloading Favi package to $InstallDir..." -ForegroundColor Yellow
if (!(Test-Path $InstallDir)) {
    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
}

try {
    Invoke-WebRequest -Uri $ZipUrl -OutFile $TempZip -UseBasicParsing
    Expand-Archive -Path $TempZip -DestinationPath $env:TEMP\favi-unzip -Force
    # Move extracted contents (archive-master) into InstallDir
    $ExtractedFolder = Get-ChildItem -Path "$env:TEMP\favi-unzip" -Directory | Select-Object -First 1
    Copy-Item -Path "$($ExtractedFolder.FullName)\*" -Destination $InstallDir -Recurse -Force
    Remove-Item -Path "$env:TEMP\favi-unzip" -Recurse -Force
    Remove-Item -Path $TempZip -Force
    Write-Host "✔ Files extracted successfully." -ForegroundColor Green
} catch {
    Write-Host "✖ Download or extraction failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "[2/4] 🖥 Creating desktop shortcut..." -ForegroundColor Yellow
Set-Location $InstallDir
& .\favi.bat setup-shortcuts

Write-Host "[3/4] ⚡ Starting Favi on http://localhost:1937..." -ForegroundColor Yellow
& .\favi.bat start

Write-Host ""
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "   ✨ Favi is installed and ready to use!" -ForegroundColor Green
Write-Host "====================================================================" -ForegroundColor Green
Write-Host "   • App URL:          http://localhost:1937" -ForegroundColor Cyan
Write-Host "   • Desktop Folder:   $InstallDir" -ForegroundColor Cyan
Write-Host "   • Desktop Shortcut: $DesktopPath\Favi.lnk" -ForegroundColor Cyan
Write-Host ""
Write-Host "Management commands (from $InstallDir):" -ForegroundColor White
Write-Host "   .\favi.bat status      Check server status" -ForegroundColor Cyan
Write-Host "   .\favi.bat stop        Stop the background server" -ForegroundColor Cyan
Write-Host "   .\favi.bat start       Start server and open app window" -ForegroundColor Cyan
Write-Host "   .\uninstall.ps1        Clean uninstallation" -ForegroundColor Cyan
Write-Host ""

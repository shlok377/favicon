# ==============================================================================
# Favi — Windows Uninstaller
# ==============================================================================

$APP_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[Favi Uninstaller] Stopping Favi processes..." -ForegroundColor Cyan
Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*Favi Server*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Remove shortcuts
$DesktopShortcut = Join-Path ([Environment]::GetFolderPath('Desktop')) "Favi.lnk"
if (Test-Path $DesktopShortcut) {
    Remove-Item $DesktopShortcut -Force
    Write-Host "✔ Removed Desktop shortcut." -ForegroundColor Green
}

$StartShortcut = Join-Path ([Environment]::GetFolderPath('StartMenu')) "Programs\Favi.lnk"
if (Test-Path $StartShortcut) {
    Remove-Item $StartShortcut -Force
    Write-Host "✔ Removed Start Menu shortcut." -ForegroundColor Green
}

$Confirmation = Read-Host "Do you want to permanently delete the Favi application folder at $APP_DIR? [y/N]"
if ($Confirmation -match '^[yY]') {
    Set-Location $HOME
    Remove-Item -Recurse -Force $APP_DIR
    Write-Host "✔ Favi has been completely uninstalled." -ForegroundColor Green
} else {
    Write-Host "Application folder kept at $APP_DIR." -ForegroundColor Yellow
}

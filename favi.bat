@echo off
setlocal enabledelayedexpansion

:: ==============================================================================
:: Favi — Windows Application Launcher & Lifecycle Manager
:: ==============================================================================

set "APP_DIR=%~dp0"
:: Remove trailing backslash
if "%APP_DIR:~-1%"=="\" set "APP_DIR=%APP_DIR:~0,-1%"

set "BACKEND_DIR=%APP_DIR%\backend"
set "LOGS_DIR=%APP_DIR%\logs"
set "VENV_DIR=%APP_DIR%\.venv"
set "PID_FILE=%APP_DIR%\.favi.pid"
set "PORT_FILE=%APP_DIR%\.favi.port"
set "INSTALL_PATH_FILE=%APP_DIR%\.install_path"
set "DEFAULT_PORT=1937"

if not exist "%LOGS_DIR%" mkdir "%LOGS_DIR%"

set "ACTION=%~1"
if "%ACTION%"=="" set "ACTION=start"

if /i "%ACTION%"=="stop" goto cmd_stop
if /i "%ACTION%"=="status" goto cmd_status
if /i "%ACTION%"=="logs" goto cmd_logs
if /i "%ACTION%"=="run" goto cmd_run
if /i "%ACTION%"=="start" goto cmd_start
if /i "%ACTION%"=="setup-shortcuts" goto cmd_shortcuts
goto cmd_start

:cmd_start
:: 1. Check if already running via curl
curl -s --max-time 1 "http://127.0.0.1:%DEFAULT_PORT%/api/health" | findstr /i "healthy" >nul 2>&1
if %errorlevel% equ 0 (
    echo [Favi] Favi is already running on port %DEFAULT_PORT%.
    goto launch_browser
)

:: 2. Ensure virtualenv exists
if not exist "%VENV_DIR%\Scripts\python.exe" (
    if exist "%BACKEND_DIR%\.venv\Scripts\python.exe" (
        set "VENV_DIR=%BACKEND_DIR%\.venv"
    ) else (
        echo [Favi] Setting up Python virtual environment...
        python -m venv "%VENV_DIR%"
        "%VENV_DIR%\Scripts\python.exe" -m pip install --upgrade pip >nul 2>&1
        "%VENV_DIR%\Scripts\pip.exe" install -r "%BACKEND_DIR%\requirements.txt"
    )
)

:: 3. Launch backend daemon in hidden or minimized window
echo [Favi] Starting Favi server on port %DEFAULT_PORT%...
set "FAVI_PORT=%DEFAULT_PORT%"
set "FRONTEND_DIST_DIR=%APP_DIR%\frontend\dist"

start /min "Favi Server" "%VENV_DIR%\Scripts\python.exe" -m uvicorn app.main:app --app-dir "%BACKEND_DIR%" --host 127.0.0.1 --port %DEFAULT_PORT%

:: Wait up to 5 seconds for health
timeout /t 2 /nobreak >nul

:launch_browser
set "URL=http://localhost:%DEFAULT_PORT%"
:: Try Chrome --app mode
where chrome >nul 2>&1
if %errorlevel% equ 0 (
    start "" chrome --app=%URL%
    exit /b 0
)
where msedge >nul 2>&1
if %errorlevel% equ 0 (
    start "" msedge --app=%URL%
    exit /b 0
)
where brave >nul 2>&1
if %errorlevel% equ 0 (
    start "" brave --app=%URL%
    exit /b 0
)

:: Fallback to default browser
start %URL%
exit /b 0

:cmd_stop
echo [Favi] Stopping Favi server...
taskkill /f /im python.exe /fi "WINDOWTITLE eq Favi Server*" >nul 2>&1
taskkill /f /im uvicorn.exe >nul 2>&1
del /f /q "%PID_FILE%" >nul 2>&1
echo [Favi] Done.
exit /b 0

:cmd_status
curl -s --max-time 1 "http://127.0.0.1:%DEFAULT_PORT%/api/health" | findstr /i "healthy" >nul 2>&1
if %errorlevel% equ 0 (
    echo Status: Running
    echo URL:    http://localhost:%DEFAULT_PORT%
) else (
    echo Status: Stopped
)
exit /b 0

:cmd_logs
if exist "%LOGS_DIR%\app.log" (
    powershell -Command "Get-Content -Path '%LOGS_DIR%\app.log' -Tail 30"
) else (
    echo No logs found at %LOGS_DIR%\app.log
)
exit /b 0

:cmd_run
set "FAVI_PORT=%DEFAULT_PORT%"
set "FRONTEND_DIST_DIR=%APP_DIR%\frontend\dist"
"%VENV_DIR%\Scripts\python.exe" -m uvicorn app.main:app --app-dir "%BACKEND_DIR%" --host 127.0.0.1 --port %DEFAULT_PORT%
exit /b 0

:cmd_shortcuts
powershell -NoProfile -ExecutionPolicy Bypass -Command "$WshShell = New-Object -ComObject WScript.Shell; $Desk = [Environment]::GetFolderPath('Desktop'); $Sc = $WshShell.CreateShortcut(\"$Desk\Favi.lnk\"); $Sc.TargetPath = \"%APP_DIR%\favi.bat\"; $Sc.WorkingDirectory = \"%APP_DIR%\"; $Sc.IconLocation = \"%APP_DIR%\frontend\dist\favicon.ico\"; $Sc.Save(); $Start = Join-Path ([Environment]::GetFolderPath('StartMenu')) 'Programs\Favi.lnk'; $Sc2 = $WshShell.CreateShortcut($Start); $Sc2.TargetPath = \"%APP_DIR%\favi.bat\"; $Sc2.WorkingDirectory = \"%APP_DIR%\"; $Sc2.IconLocation = \"%APP_DIR%\frontend\dist\favicon.ico\"; $Sc2.Save(); echo 'Created Desktop and Start Menu shortcuts.'"
exit /b 0

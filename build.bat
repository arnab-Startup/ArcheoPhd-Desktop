@echo off
setlocal
echo ============================================================
echo   ArchaeoPhD Desktop Workstation — Windows C++ Build
echo ============================================================

cd /d "%~dp0"

REM Terminate any running instance of ArchaeoPhD.exe to avoid file lock
taskkill /F /IM ArchaeoPhD.exe >nul 2>&1

REM Clean stale AppData cache if present
if exist "%LOCALAPPDATA%\ArchaeoPhD\app" rmdir /s /q "%LOCALAPPDATA%\ArchaeoPhD\app" >nul 2>&1

REM 1. Package runtime payload archive (WebView2Loader.dll + dist)
echo Packaging runtime payload archive...
copy /y "lib\WebView2Loader.dll" "WebView2Loader.dll" >nul
tar -a -cf payload.zip WebView2Loader.dll dist
del "WebView2Loader.dll" >nul

REM 2. Compile Windows PE resource with windres
echo Compiling embedded resources with windres...
windres -I . src\resource.rc -O coff -o src\resource.res
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Resource compilation failed.
    exit /b %ERRORLEVEL%
)

REM 3. Ensure release directory exists
if not exist "release" mkdir release

REM 4. Compile standalone ArchaeoPhD.exe with MinGW G++ (Statically linked: zero MinGW DLL dependencies)
echo Compiling self-contained ArchaeoPhD.exe with MinGW G++ (statically linked)...
g++ -std=c++14 -O2 -s -mwindows -static -static-libgcc -static-libstdc++ ^
    -I include ^
    -I engine\src ^
    src\main.cpp ^
    src\resource.res ^
    -o release\ArchaeoPhD.exe ^
    -lole32 -loleaut32 -luuid -luser32 -lshell32 -lshlwapi

if %ERRORLEVEL% EQU 0 (
    REM Clean up temporary build artifacts
    if exist "payload.zip" del "payload.zip" >nul
    if exist "src\resource.res" del "src\resource.res" >nul

    echo.
    echo [SUCCESS] ArchaeoPhD.exe built successfully!
    echo Output location: release\ArchaeoPhD.exe
    echo Binary size:
    dir release\ArchaeoPhD.exe | findstr /i "ArchaeoPhD.exe"
    echo.
    echo To run the desktop application:
    echo   .\release\ArchaeoPhD.exe
) else (
    echo.
    echo [ERROR] Build failed with exit code %ERRORLEVEL%.
)
endlocal

@echo off

setlocal enabledelayedexpansion

set NW_SYSTEM=win
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
  set NW_ARCH=x64
  echo Detected: Windows ^(x64^)
) else if "%PROCESSOR_ARCHITECTURE%"=="x86" (
  set NW_ARCH=ia32
  echo Detected: Windows ^(x86^)
) else if "%PROCESSOR_ARCHITECTURE%"=="ARM64" (
  set NW_ARCH=x64
  echo Detected: Windows ^(ARM64^)
  echo Warning: Windows ^(ARM64^) is not supported, installing x64 version using emulation
) else (
  echo ERROR: Unsupported architecture: %PROCESSOR_ARCHITECTURE%
  exit /b 1
)

set URL=https://github.com/CatCoreV/os-compiler/releases/download/nw/catcore-nw-%NW_SYSTEM%-%NW_ARCH%.zip
set OUTPUT=nw.zip

echo Downloading %URL%...
curl -L %URL% -o %OUTPUT%
if errorlevel 1 (
  echo ERROR: Download failed
  exit /b 1
)

echo Extracting %OUTPUT%...
tar -xf %OUTPUT%
del /F /Q %OUTPUT%
ren nw.exe catcore_compiler.exe

if errorlevel 1 (
  echo ERROR: Extraction failed
  exit /b 1
)
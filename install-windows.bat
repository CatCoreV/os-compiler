@echo off

setlocal enabledelayedexpansion

if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
  set ARCH=x64
  echo Detected: Windows ^(x64^)
) else if "%PROCESSOR_ARCHITECTURE%"=="x86" (
  set ARCH=ia32
  echo Detected: Windows ^(x86^)
) else (
  echo ERROR: Unsupported architecture: %PROCESSOR_ARCHITECTURE%
  exit /b 1
)

set URL=https://github.com/CatCoreV/os-compiler/releases/download/nw/catcore-nw-win-%ARCH%.zip
set OUTPUT=nw.zip

echo Downloading %URL%...
curl -L %URL% -o %OUTPUT%
if errorlevel 1 (
  echo ERROR: Download failed
  exit /b 1
)

echo Extracting %OUTPUT%...
tar -xf %OUTPUT%

if errorlevel 1 (
  echo ERROR: Extraction failed
  exit /b 1
)
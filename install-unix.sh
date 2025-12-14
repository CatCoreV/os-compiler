#!/bin/bash

set -e

ARCH=$(uname -m)

case "$OSTYPE" in
  darwin*)
    case "$ARCH" in
      x86_64)
        NW_SYSTEM="macos"
        NW_ARCH="x64"
        echo "Detected: MacOS (x64)"
        ;;
      aarch64|arm64)
        NW_SYSTEM="macos"
        NW_ARCH="arm64"
        echo "Detected: MacOS (ARM64)"
        ;;
      *)
        echo "ERROR: Unsupported architecture: $ARCH"
        exit 1
        ;;
    esac
    ;;
  *)
    case "$ARCH" in
      x86_64)
        NW_SYSTEM="linux"
        NW_ARCH="x64"
        echo "Detected: Linux (x64)"
        ;;
      i686|i386)
        NW_SYSTEM="linux"
        NW_ARCH="ia32"
        echo "Detected: Linux (x86)"
        ;;
      aarch64|arm64)
        NW_SYSTEM="linux"
        NW_ARCH="arm64"
        echo "Detected: Linux (ARM64)"
        ;;
      *)
        echo "ERROR: Unsupported architecture: $ARCH"
        exit 1
        ;;
    esac
    ;;
esac

URL="https://github.com/CatCoreV/os-compiler/releases/download/nw/catcore-nw-$NW_SYSTEM-$NW_ARCH.zip"
OUTPUT="nw.zip"

echo "Downloading $URL..."
curl -L "$URL" -o "$OUTPUT"

if [ ! -f "$OUTPUT" ]; then
  echo "ERROR: Download failed"
  exit 1
fi

echo "Extracting $OUTPUT..."
unzip "$OUTPUT"
rm -f $OUTPUT
if [ "$NW_SYSTEM" == "macos" ]; then
  mv nw.app "Catcore Compiler.app"
  cp catcore.icns "Catcore Compiler.app/Contents/Resources/nw.icns"
  cp catcore.icns "Catcore Compiler.app/Contents/Resources/app.icns"
  cp catcore.icns "Catcore Compiler.app/Contents/Resources/document.icns"
  xattr -cr "Catcore Compiler.app"
  chmod -R 777 "Catcore Compiler.app"
  touch "Catcore Compiler.app"
else
  mv nw catcore_compiler
fi
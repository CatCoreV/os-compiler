#!/bin/bash

set -e

ARCH=$(uname -m)

case "$ARCH" in
  x86_64)
    NWJS_ARCH="x64"
    echo "Detected: MacOS (x64)"
    ;;
  arm64)
    NWJS_ARCH="arm64"
    echo "Detected: MacOS (ARM64)"
    ;;
  *)
    echo "ERROR: Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

URL="https://github.com/CatCoreV/os-compiler/releases/download/nw/catcore-nw-macos-$ARCH.zip"
OUTPUT="nw.zip"

echo "Downloading $URL..."
curl -L -o "$OUTPUT" "$URL"

if [ ! -f "$OUTPUT" ]; then
  echo "ERROR: Download failed"
  exit 1
fi

echo "Extracting $OUTPUT..."
unzip "$OUTPUT"
#!/bin/bash

set -e

ARCH=$(uname -m)

case "$ARCH" in
  x86_64)
    NW_ARCH="x64"
    echo "Detected: Linux (x64)"
    ;;
  i686|i386)
    NW_ARCH="ia32"
    echo "Detected: Linux (x86)"
    ;;
  aarch64|arm64)
    NW_ARCH="arm64"
    echo "Detected: Linux (ARM64)"
    ;;
  *)
    echo "ERROR: Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

URL="https://github.com/CatCoreV/os-compiler/releases/download/nw/catcore-nw-linux-$NW_ARCH.zip"
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
mv nw catcore_compiler
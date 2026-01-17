#!/bin/bash

# Detect operating system
case "$OSTYPE" in
  linux*)     os="linux" ;;
  darwin*)    os="darwin" ;;
  cygwin|msys|mingw*) os="windows" ;;
  *)          os="unknown" ;;
esac
export DETECTED_OS="$os"

# Detect system architecture
arch="$(uname -m)"
case "$arch" in
  x86_64)      arch="amd64" ;;
  aarch64)     arch="arm64" ;;
  armv7l)      arch="armv7" ;;
  *)           arch="unknown" ;;
esac
export DETECTED_ARCH="$arch"
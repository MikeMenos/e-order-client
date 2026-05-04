#!/bin/bash
# Xcode Cloud / CI: SPM resolves Capacitor packages from ../../node_modules/...
# (see ios/App/CapApp-SPM/Package.swift). Install JS deps before xcodebuild.
set -euo pipefail

REPO="${CI_PRIMARY_REPOSITORY_PATH:-${GITHUB_WORKSPACE:-$(pwd)}}"
cd "$REPO"

ensure_npm() {
  if command -v npm >/dev/null 2>&1; then
    return 0
  fi
  echo "warning: npm not on PATH — installing Node via Homebrew..." >&2
  export HOMEBREW_NO_AUTO_UPDATE=1
  if [[ -x /opt/homebrew/bin/brew ]]; then
    /opt/homebrew/bin/brew install node
  elif command -v brew >/dev/null 2>&1; then
    brew install node
  else
    echo "error: npm not found and Homebrew unavailable. Install Node in your CI workflow." >&2
    exit 1
  fi
}

ensure_npm

if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

npx cap sync ios

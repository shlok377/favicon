#!/usr/bin/env bash
# ==============================================================================
# Favi — Release Packaging Utility
# Builds turnkey, standalone distribution archives for zero-dependency install.
# ==============================================================================
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_OUTPUT="$REPO_ROOT/dist-release"
ARCHIVE_NAME="favi-standalone"

echo "🎨 Building Favi distribution bundle..."

# 1. Sync installer scripts to frontend/public and build static assets
echo "📦 Syncing installer scripts to frontend/public..."
cp "$REPO_ROOT/install.sh" "$REPO_ROOT/frontend/public/" 2>/dev/null || true
cp "$REPO_ROOT/install.ps1" "$REPO_ROOT/frontend/public/" 2>/dev/null || true

echo "📦 Building frontend static assets with npm..."
(cd "$REPO_ROOT/frontend" && npm run build)

# 2. Prepare staging directory
rm -rf "$DIST_OUTPUT"
mkdir -p "$DIST_OUTPUT/$ARCHIVE_NAME"
STAGE_DIR="$DIST_OUTPUT/$ARCHIVE_NAME"

echo "📁 Staging files into $STAGE_DIR..."
# Copy backend
mkdir -p "$STAGE_DIR/backend"
cp -r "$REPO_ROOT/backend/app" "$STAGE_DIR/backend/"
cp "$REPO_ROOT/backend/requirements.txt" "$STAGE_DIR/backend/"

# Copy pre-compiled frontend dist
mkdir -p "$STAGE_DIR/frontend"
cp -r "$REPO_ROOT/frontend/dist" "$STAGE_DIR/frontend/dist"

# Copy launchers, uninstallers, and metadata
cp "$REPO_ROOT/favi" "$STAGE_DIR/"
cp "$REPO_ROOT/favi.bat" "$STAGE_DIR/"
cp "$REPO_ROOT/uninstall.sh" "$STAGE_DIR/" 2>/dev/null || true
cp "$REPO_ROOT/uninstall.ps1" "$STAGE_DIR/" 2>/dev/null || true
cp "$REPO_ROOT/README.md" "$STAGE_DIR/"
cp "$REPO_ROOT/frontend/dist/favi.png" "$STAGE_DIR/favi.png" 2>/dev/null || true

chmod +x "$STAGE_DIR/favi"
chmod +x "$STAGE_DIR/uninstall.sh" 2>/dev/null || true

# 3. Create compressed archives
echo "🗜 Creating tar.gz and zip distribution archives..."
(
    cd "$DIST_OUTPUT"
    tar -czf "$ARCHIVE_NAME.tar.gz" "$ARCHIVE_NAME"
    if command -v zip &>/dev/null; then
        zip -r -q "$ARCHIVE_NAME.zip" "$ARCHIVE_NAME"
    fi
)

echo "✅ Distribution bundles created successfully in $DIST_OUTPUT:"
ls -lh "$DIST_OUTPUT"/*.tar.gz "$DIST_OUTPUT"/*.zip 2>/dev/null || ls -lh "$DIST_OUTPUT"

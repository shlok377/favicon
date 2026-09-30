#!/usr/bin/env bash
# ==============================================================================
# Favi — Application Uninstaller
# ==============================================================================
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "\033[1;34m[Favi Uninstaller]\033[0m Starting cleanup for Favi..."

# 1. Stop running daemon
if [ -f "$APP_DIR/favi" ]; then
    echo "🛑 Stopping running services..."
    "$APP_DIR/favi" stop >/dev/null 2>&1 || true
fi

# 2. Remove desktop and application shortcuts
echo "🗑 Removing desktop shortcuts and launcher entries..."
rm -f "$HOME/Desktop/Favi.desktop"
rm -f "$HOME/Desktop/Favi.command"
rm -f "$HOME/.local/share/applications/favi.desktop"

if command -v update-desktop-database &>/dev/null; then
    update-desktop-database "$HOME/.local/share/applications" >/dev/null 2>&1 || true
fi

echo "✔ Shortcuts removed."

# 3. Prompt to delete application folder
REMOVE_FOLDER=false
if [ "${1:-}" = "-y" ] || [ "${1:-}" = "--yes" ]; then
    REMOVE_FOLDER=true
elif [ -t 0 ]; then
    echo ""
    read -r -p "Do you want to permanently delete the Favi application folder at $APP_DIR? [y/N]: " CONFIRM
    case "$CONFIRM" in
        [yY][eE][sS]|[yY])
            REMOVE_FOLDER=true
            ;;
        *)
            REMOVE_FOLDER=false
            ;;
    esac
fi

if [ "$REMOVE_FOLDER" = true ]; then
    echo "🗑 Removing application directory: $APP_DIR..."
    cd "$HOME"
    rm -rf "$APP_DIR"
    echo -e "\033[1;32m[Favi Uninstaller] ✔ Favi has been completely uninstalled.\033[0m"
else
    echo -e "\033[1;33m[Favi Uninstaller] Application files kept at $APP_DIR. You may delete this folder manually anytime.\033[0m"
fi
